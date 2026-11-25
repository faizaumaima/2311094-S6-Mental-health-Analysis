from sqlmodel import Session, select
from fastapi import HTTPException

from app.auth.models import User
from app.groups.models import Group, GroupMembership, GroupRecordAssignment
from app.groups.schemas import GroupIn, MemberIn, PermissionsIn
from app.records.models import WellBeingRecord


def create_group(session: Session, data: GroupIn, owner: User) -> Group:
    group = Group(name=data.name, owner_id=owner.id)
    session.add(group)
    session.commit()
    session.refresh(group)
    return group


def get_group(session: Session, group_id: int) -> Group | None:
    return session.get(Group, group_id)


def list_groups(session: Session, user: User) -> list[Group]:
    statement = (
        select(Group)
        .outerjoin(
            GroupMembership,
            GroupMembership.group_id == Group.id,
        )
        .where(
            (Group.owner_id == user.id)
            | (GroupMembership.user_id == user.id)
        )
        .distinct()
    )
    return list(session.exec(statement).all())


def add_member(
    session: Session, group: Group, data: MemberIn
) -> GroupMembership:
    user = session.exec(
        select(User).where(User.email == data.email)
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    existing = session.exec(
        select(GroupMembership).where(
            GroupMembership.group_id == group.id,
            GroupMembership.user_id == user.id,
        )
    ).first()

    if existing:
        raise HTTPException(status_code=409, detail="User is already a member")

    if user.id == group.owner_id:
        raise HTTPException(status_code=400, detail="Owner cannot be added as a member")

    membership = GroupMembership(
        group_id=group.id,
        user_id=user.id,
        can_create=data.can_create,
        can_edit=data.can_edit,
        can_assign=data.can_assign,
    )
    session.add(membership)
    session.commit()
    session.refresh(membership)
    return membership


def get_membership(
    session: Session, group_id: int, user_id: int
) -> GroupMembership | None:
    return session.exec(
        select(GroupMembership).where(
            GroupMembership.group_id == group_id,
            GroupMembership.user_id == user_id,
        )
    ).first()


def update_permissions(
    session: Session,
    membership: GroupMembership,
    data: PermissionsIn,
) -> GroupMembership:
    membership.can_create = data.can_create
    membership.can_edit = data.can_edit
    membership.can_assign = data.can_assign
    session.add(membership)
    session.commit()
    session.refresh(membership)
    return membership


def remove_member(session: Session, membership: GroupMembership) -> None:
    session.delete(membership)
    session.commit()


def create_group_record(
    session: Session,
    group: Group,
    owner: User,
    data,
) -> WellBeingRecord:
    record = WellBeingRecord(
        **data.model_dump(),
        owner_id=owner.id,
        group_id=group.id,
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


def list_group_records(
    session: Session, group_id: int
) -> list[WellBeingRecord]:
    statement = (
        select(WellBeingRecord)
        .where(WellBeingRecord.group_id == group_id)
        .order_by(WellBeingRecord.record_date.desc())
    )
    return list(session.exec(statement).all())


def get_group_record(
    session: Session, group_id: int, record_id: int
) -> WellBeingRecord | None:
    record = session.get(WellBeingRecord, record_id)

    if record is None or record.group_id != group_id:
        return None

    return record


def update_group_record(
    session: Session, record: WellBeingRecord, data
) -> WellBeingRecord:
    record.sqlmodel_update(data.model_dump(exclude_unset=True))
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


def assign_record(
    session: Session,
    group: Group,
    record: WellBeingRecord,
    assigned_to: int,
    assigned_by: int,
) -> GroupRecordAssignment:
    membership = get_membership(session, group.id, assigned_to)

    if not membership:
        raise HTTPException(
            status_code=422,
            detail="Assigned user is not a group member",
        )

    assignment = GroupRecordAssignment(
        record_id=record.id,
        group_id=group.id,
        assigned_to=assigned_to,
        assigned_by=assigned_by,
    )
    session.add(assignment)
    session.commit()
    session.refresh(assignment)
    return assignment


def delete_group(session, group):
    assignments = session.exec(
        select(GroupRecordAssignment).where(
            GroupRecordAssignment.group_id == group.id
        )
    ).all()

    for assignment in assignments:
        session.delete(assignment)

    session.flush()

    records = session.exec(
        select(WellBeingRecord).where(
            WellBeingRecord.group_id == group.id
        )
    ).all()

    for record in records:
        session.delete(record)

    session.flush()

    memberships = session.exec(
        select(GroupMembership).where(
            GroupMembership.group_id == group.id
        )
    ).all()

    for membership in memberships:
        session.delete(membership)

    session.flush()

    session.delete(group)
    session.commit()

def rename_group(session: Session, group: Group, name: str) -> Group:
    group.name = name
    session.add(group)
    session.commit()
    session.refresh(group)
    return group


def list_group_members(session: Session, group_id: int) -> list[dict]:
    statement = (
        select(GroupMembership, User)
        .join(User, User.id == GroupMembership.user_id)
        .where(GroupMembership.group_id == group_id)
        .order_by(User.name)
    )
    results = session.exec(statement).all()

    return [
        {
            "id": membership.id,
            "group_id": membership.group_id,
            "user_id": member.id,
            "name": member.name,
            "email": member.email,
            "can_create": membership.can_create,
            "can_edit": membership.can_edit,
            "can_assign": membership.can_assign,
            "created_at": membership.created_at,
        }
        for membership, member in results
    ]
