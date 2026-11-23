from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, SQLModel


class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_log"

    id: Optional[int] = Field(default=None, primary_key=True)
    actor_user_id: int = Field(foreign_key="app_user.id", index=True)
    action: str = Field(index=True)
    target_user_id: Optional[int] = Field(
        default=None,
        foreign_key="app_user.id",
        index=True,
    )
    details: Optional[str] = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )