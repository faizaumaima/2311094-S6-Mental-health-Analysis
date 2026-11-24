from sqlmodel import Session, select

from app.records.models import WellBeingRecord
from app.records.schemas import RecordCreate, RecordUpdate


def create_record(
    session: Session, data: RecordCreate, owner_id: int
) -> WellBeingRecord:
    record = WellBeingRecord(
        **data.model_dump(),
        owner_id=owner_id,
        group_id=None,
    )
    session.add(record)
    session.commit()
    session.refresh(record)
    return record


def list_records(session: Session, owner_id: int) -> list[WellBeingRecord]:
    statement = (
        select(WellBeingRecord)
        .where(
            WellBeingRecord.owner_id == owner_id,
            WellBeingRecord.group_id.is_(None),
        )
        .order_by(WellBeingRecord.record_date.desc())
    )
    return list(session.exec(statement).all())


def get_record(
    session: Session, record_id: int, owner_id: int
) -> WellBeingRecord | None:
    record = session.get(WellBeingRecord, record_id)

    if (
        record is None
        or record.owner_id != owner_id
        or record.group_id is not None
    ):
        return None

    return record


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