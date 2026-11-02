from datetime import date, datetime
from typing import Literal

from sqlmodel import SQLModel


MoodType = Literal["happy", "calm", "neutral", "anxious", "sad", "angry"]


class RecordCreate(SQLModel):
    mood: MoodType
    stress_level: int
    sleep_hours: float
    record_date: date
    notes: str | None = None


class RecordUpdate(SQLModel):
    mood: MoodType | None = None
    stress_level: int | None = None
    sleep_hours: float | None = None
    record_date: date | None = None
    notes: str | None = None


class RecordRead(SQLModel):
    id: int
    mood: str
    stress_level: int
    sleep_hours: float
    record_date: date
    notes: str | None
    created_at: datetime