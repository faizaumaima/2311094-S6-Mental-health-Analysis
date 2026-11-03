from datetime import date, datetime
from typing import Literal

from sqlmodel import Field, SQLModel

MoodType = Literal["happy", "calm", "neutral", "anxious", "sad", "angry"]


class RecordCreate(SQLModel):
    mood: MoodType
    stress_level: int = Field(ge=1, le=10)
    sleep_hours: float = Field(ge=0, le=24)
    record_date: date
    notes: str | None = Field(default=None, max_length=1000)


class RecordUpdate(SQLModel):
    mood: MoodType | None = None
    stress_level: int | None = Field(default=None, ge=1, le=10)
    sleep_hours: float | None = Field(default=None, ge=0, le=24)
    record_date: date | None = None
    notes: str | None = Field(default=None, max_length=1000)


class RecordRead(SQLModel):
    id: int
    mood: str
    stress_level: int
    sleep_hours: float
    record_date: date
    notes: str | None
    created_at: datetime