
from sqlmodel import Session, select

from app.records.models import WellBeingRecord
from app.records.schemas import RecordCreate, RecordUpdate


def create_record(session: Session, data: RecordCreate) -> WellBeingRecord:
    record = WellBeingRecord(**data.model_dump())
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


def list_records(session: Session) -> list[WellBeingRecord]:
    statement = select(WellBeingRecord).order_by(WellBeingRecord.record_date.desc())
    return list(session.exec(statement).all())


def get_record(session: Session, record_id: int) -> WellBeingRecord | None:
    return session.get(WellBeingRecord, record_id)


def update_record(
    session: Session, record: WellBeingRecord, data: RecordUpdate
) -> WellBeingRecord:
    record.sqlmodel_update(data.model_dump(exclude_unset=True))
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


def delete_record(session: Session, record: WellBeingRecord) -> None:
    session.delete(record)
    session.commit()
