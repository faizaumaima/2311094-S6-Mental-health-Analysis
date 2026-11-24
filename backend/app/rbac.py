from fastapi import HTTPException
from sqlmodel import Session

from app.auth.models import User
from app.groups.models import Group, GroupMembership
from app.groups.service import get_membership


def get_group_or_404(session: Session, group_id: int) -> Group:
    group = session.get(Group, group_id)

    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    return group


def require_group_owner(group: Group, user: User) -> None:
    if group.owner_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the group owner can perform this action",
        )


def require_group_access(
    session: Session, group: Group, user: User
) -> GroupMembership | None:
    if group.owner_id == user.id:
        return None

    membership = get_membership(session, group.id, user.id)

    if not membership:
        raise HTTPException(
            status_code=403,
            detail="You are not a member of this group",
        )

    return membership


def require_group_permission(
    session: Session,
    group: Group,
    user: User,
    permission: str,
) -> None:
    if group.owner_id == user.id:
        return

    membership = require_group_access(session, group, user)

    if not getattr(membership, permission, False):
        raise HTTPException(
            status_code=403,
            detail=f"Group permission required: {permission}",
        )