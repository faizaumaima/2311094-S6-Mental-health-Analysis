from datetime import date, datetime, timezone

from sqlalchemy import Column, DateTime
from sqlmodel import Field, SQLModel


class WellBeingRecord(SQLModel, table=True):
    __tablename__ = "well_being_records"

    id: int | None = Field(default=None, primary_key=True)
    mood: str
    stress_level: int
    sleep_hours: float
    record_date: date
    notes: str | None = None
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )