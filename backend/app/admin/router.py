import csv
import io

from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlmodel import Session, select

from app.auth.dependencies import require_admin
from app.auth.models import User
from app.admin.service import create_audit_log
from app.admin.models import AuditLog
from app.auth.schemas import UserResponse
from app.database import get_session
from app.records.models import WellBeingRecord
from app.groups.models import Group
from app.groups.service import delete_group

router = APIRouter(
    prefix="/api/admin",
    tags=["Administration"],
    dependencies=[Depends(require_admin)],
)

class RoleIn(BaseModel):
    role: str = Field(pattern="^(user|admin)$")

class BanIn(BaseModel):
    reason: str = Field(min_length=1, max_length=500)

class AdminUserListResponse(BaseModel):
    items: list[UserResponse]
    total: int
    page: int
    page_size: int

@router.get("/users", response_model=AdminUserListResponse)
def list_users(
    q: str | None = None,
    role: str | None = None,
    is_active: bool | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    session: Session = Depends(get_session),
):
    conditions = []

    if q:
        conditions.append(User.email.ilike(f"%{q}%"))

    if role:
        conditions.append(User.role == role)

    if is_active is not None:
        conditions.append(User.is_active == is_active)

    total = session.exec(
        select(func.count(User.id)).where(*conditions)
    ).one()

    users = session.exec(
        select(User)
        .where(*conditions)
        .order_by(User.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()

    return {
        "items": users,
        "total": total,
        "page": page,
        "page_size": page_size,
    }

@router.get("/users/export")
def export_users(session: Session = Depends(get_session)):
    users = session.exec(select(User).order_by(User.id)).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "ID",
        "Name",
        "Email",
        "Role",
        "Is Active",
        "Created At",
    ])

    for user in users:
        writer.writerow([
            user.id,
            user.name,
            user.email,
            user.role,
            user.is_active,
            user.created_at,
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=users.csv"
        },
    )

@router.patch("/users/{user_id}/ban", response_model=UserResponse)
def ban_user(
    user_id: int,
    data: BanIn,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    if user_id == current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Admins cannot ban themselves",
        )

    user = session.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if user.role == "admin":
        raise HTTPException(
            status_code=403,
            detail="Admins cannot ban other admins",
        )

    reason = data.reason.strip()

    if not reason:
        raise HTTPException(
            status_code=422,
            detail="Ban reason cannot be empty",
        )

    user.is_active = False
    user.ban_reason = reason

    session.add(user)
    session.commit()
    session.refresh(user)

    create_audit_log(
        session,
        actor_user_id=current_user.id,
        action="user_banned",
        target_user_id=user.id,
        details=f"Ban reason: {reason}",
    )

    return user


@router.patch("/users/{user_id}/unban", response_model=UserResponse)
def unban_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    user = session.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.is_active = True
    user.ban_reason = None

    session.add(user)
    session.commit()
    session.refresh(user)

    create_audit_log(
        session,
        actor_user_id=current_user.id,
        action="user_unbanned",
        target_user_id=user.id,
        details="User account was unbanned",
    )

    return user

@router.put("/users/{user_id}/role")
def change_role(
    user_id: int,
    data: RoleIn,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(
            status_code=403,
            detail="Admins cannot change their own role",
        )

    target = session.get(User, user_id)

    if target is None:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    old_role = target.role
    target.role = data.role

    session.add(target)
    session.commit()
    session.refresh(target)

    create_audit_log(
        session,
        actor_user_id=admin.id,
        action="role_change",
        target_user_id=target.id,
        details=f"user {user_id}: {old_role}->{data.role}",
    )

    return {"id": target.id, "role": target.role}

@router.get("/stats")
def stats(
    session: Session = Depends(get_session),
    _admin: User = Depends(require_admin),
):
    week = datetime.now(timezone.utc) - timedelta(days=7)

    total_users = session.exec(
        select(func.count(User.id))
    ).one()

    banned_users = session.exec(
        select(func.count(User.id)).where(User.is_active == False)
    ).one()

    total_records = session.exec(
        select(func.count(WellBeingRecord.id))
    ).one()

    total_groups = session.exec(
        select(func.count(Group.id))
    ).one()

    new_users = session.exec(
        select(func.count(User.id)).where(User.created_at >= week)
    ).one()

    new_records = session.exec(
        select(func.count(WellBeingRecord.id)).where(
            WellBeingRecord.created_at >= week
        )
    ).one()

    return {
        "users": total_users,
        "banned_users": banned_users,
        "records": total_records,
        "groups": total_groups,
        "new_users_7d": new_users,
        "new_records_7d": new_records,
    }

@router.get("/records")
def admin_list_records(
    group_id: int | None = None,
    owner_id: int | None = None,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    query = select(WellBeingRecord)

    if group_id is not None:
        query = query.where(WellBeingRecord.group_id == group_id)

    if owner_id is not None:
        query = query.where(WellBeingRecord.owner_id == owner_id)

    records = session.exec(
        query.order_by(WellBeingRecord.id)
    ).all()

    return records

@router.delete("/records/{record_id}", status_code=204)
def admin_delete_record(
    record_id: int,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    record = session.get(WellBeingRecord, record_id)

    if record is None:
        raise HTTPException(status_code=404, detail="Record not found")

    session.delete(record)
    session.commit()

    create_audit_log(
        session,
        actor_user_id=admin.id,
        action="admin_record_deleted",
        details=f"Deleted record ID: {record_id}",
    )

    return None

@router.get("/groups")
def admin_list_groups(
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    groups = session.exec(
        select(Group).order_by(Group.id)
    ).all()

    return groups

@router.delete("/groups/{group_id}", status_code=204)
def admin_delete_group(
    group_id: int,
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    group = session.get(Group, group_id)

    if group is None:
        raise HTTPException(status_code=404, detail="Group not found")

    delete_group(session, group)

    create_audit_log(
        session,
        actor_user_id=admin.id,
        action="admin_group_deleted",
        details=f"Deleted group ID: {group_id}",
    )

    return None

@router.get("/audit-log")
def list_audit_logs(
    action: str | None = None,
    user_id: int | None = None,
    page: int = Query(1, ge=1),
    session: Session = Depends(get_session),
    admin: User = Depends(require_admin),
):
    query = select(AuditLog)

    if action:
        query = query.where(AuditLog.action == action)

    if user_id is not None:
        query = query.where(
            (AuditLog.actor_user_id == user_id)
            | (AuditLog.target_user_id == user_id)
        )

    total = session.exec(
        select(func.count(AuditLog.id)).where(
            *(
                [AuditLog.action == action] if action else []
            ),
            *(
                [
                    (AuditLog.actor_user_id == user_id)
                    | (AuditLog.target_user_id == user_id)
                ] if user_id is not None else []
            ),
        )
    ).one()

    logs = session.exec(
        query.order_by(AuditLog.created_at.desc())
        .offset((page - 1) * 10)
        .limit(10)
    ).all()

    return {
        "items": logs,
        "total": total,
        "page": page,
        "page_size": 10,
    }