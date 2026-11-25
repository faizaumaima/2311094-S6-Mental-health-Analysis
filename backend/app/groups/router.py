from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.database import get_session
from app.groups import service
from app.groups.schemas import (
    GroupIn,
    GroupRename,
    MemberIn,
    PermissionsIn,
    AssignIn,
)
from app.records.schemas import RecordCreate, RecordRead, RecordUpdate
from app.rbac import (
    get_group_or_404,
    require_group_access,
    require_group_owner,
    require_group_permission,
)


router = APIRouter(prefix="/api/groups", tags=["Groups"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_group(
    data: GroupIn,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    return service.create_group(session, data, user)


@router.get("/")
def list_groups(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    return service.list_groups(session, user)


@router.get("/{group_id}/members")
def list_group_members(
    group_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    group = get_group_or_404(session, group_id)
    require_group_access(session, group, user)
    return service.list_group_members(session, group_id)


@router.put("/{group_id}")
def rename_group(
    group_id: int,
    data: GroupRename,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    group = get_group_or_404(session, group_id)
    require_group_owner(group, user)
    return service.rename_group(session, group, data.name)

@router.post("/{group_id}/members", status_code=status.HTTP_201_CREATED)
def add_member(
    group_id: int,
    data: MemberIn,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    group = get_group_or_404(session, group_id)
    require_group_owner(group, user)
    return service.add_member(session, group, data)


@router.put("/{group_id}/members/{user_id}/permissions")
def change_permissions(
    group_id: int,
    user_id: int,
    data: PermissionsIn,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    group = get_group_or_404(session, group_id)
    require_group_owner(group, user)

    if user_id == group.owner_id:
        raise HTTPException(
            status_code=400,
            detail="Owner permissions cannot be changed",
        )

    membership = service.get_membership(session, group_id, user_id)

    if not membership:
        raise HTTPException(status_code=404, detail="Member not found")

    return service.update_permissions(session, membership, data)


@router.delete("/{group_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(
    group_id: int,
    user_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    group = get_group_or_404(session, group_id)
    require_group_owner(group, user)

    if user_id == group.owner_id:
        raise HTTPException(
            status_code=400,
            detail="Group owner cannot remove themselves",
        )

    membership = service.get_membership(session, group_id, user_id)

    if not membership:
        raise HTTPException(status_code=404, detail="Member not found")

    service.remove_member(session, membership)
    return None


@router.post(
    "/{group_id}/records",
    response_model=RecordRead,
    status_code=status.HTTP_201_CREATED,
)
def create_group_record(
    group_id: int,
    data: RecordCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    group = get_group_or_404(session, group_id)
    require_group_permission(session, group, user, "can_create")
    return service.create_group_record(session, group, user, data)


@router.get("/{group_id}/records", response_model=list[RecordRead])
def list_group_records(
    group_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    group = get_group_or_404(session, group_id)
    require_group_access(session, group, user)
    return service.list_group_records(session, group_id)


@router.put("/{group_id}/records/{record_id}", response_model=RecordRead)
def update_group_record(
    group_id: int,
    record_id: int,
    data: RecordUpdate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    group = get_group_or_404(session, group_id)
    require_group_permission(session, group, user, "can_edit")

    record = service.get_group_record(session, group_id, record_id)

    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    return service.update_group_record(session, record, data)


@router.post(
    "/{group_id}/records/{record_id}/assign",
    status_code=status.HTTP_201_CREATED,
)
def assign_group_record(
    group_id: int,
    record_id: int,
    data: AssignIn,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    group = get_group_or_404(session, group_id)
    require_group_permission(session, group, user, "can_assign")

    record = service.get_group_record(session, group_id, record_id)

    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    return service.assign_record(
        session,
        group,
        record,
        data.assigned_to,
        user.id,
    )


@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(
    group_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    group = get_group_or_404(session, group_id)
    require_group_owner(group, user)
    service.delete_group(session, group)
    return None
