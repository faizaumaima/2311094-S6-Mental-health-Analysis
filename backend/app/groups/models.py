from datetime import datetime, timezone

from sqlalchemy import UniqueConstraint
from sqlmodel import Field, SQLModel


class Group(SQLModel, table=True):
    __tablename__ = "groups"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    owner_id: int = Field(foreign_key="app_user.id", index=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class GroupMembership(SQLModel, table=True):
    __tablename__ = "group_membership"
    __table_args__ = (UniqueConstraint("group_id", "user_id"),)

    id: int | None = Field(default=None, primary_key=True)
    group_id: int = Field(foreign_key="groups.id", index=True)
    user_id: int = Field(foreign_key="app_user.id", index=True)
    can_create: bool = False
    can_edit: bool = False
    can_assign: bool = False
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class GroupRecordAssignment(SQLModel, table=True):
    __tablename__ = "group_record_assignment"

    id: int | None = Field(default=None, primary_key=True)
    record_id: int = Field(foreign_key="well_being_records.id", index=True)
    group_id: int = Field(foreign_key="groups.id", index=True)
    assigned_to: int = Field(foreign_key="app_user.id")
    assigned_by: int = Field(foreign_key="app_user.id")
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )