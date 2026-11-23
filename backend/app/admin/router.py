import csv
import io
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select

from app.auth.dependencies import require_admin
from app.auth.models import User
from app.admin.service import create_audit_log
from app.auth.schemas import UserResponse
from app.database import get_session


router = APIRouter(
    prefix="/api/admin",
    tags=["Administration"],
    dependencies=[Depends(require_admin)],
)


@router.get("/users", response_model=list[UserResponse])
def list_users(session: Session = Depends(get_session)):
    return session.exec(select(User).order_by(User.id)).all()

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
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin),
):
    user = session.get(User, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.is_active = False
    session.add(user)
    session.commit()
    session.refresh(user)
    
    create_audit_log(
        session,
        actor_user_id=current_user.id,
        action="user_banned",
        target_user_id=user.id,
        details="User account was banned",
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