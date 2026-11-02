from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.database import get_session
from app.records.models import WellBeingRecord
from app.records.schemas import RecordCreate, RecordRead, RecordUpdate


router = APIRouter(prefix="/api/records", tags=["Well-Being Records"])


@router.post("/", response_model=RecordRead, status_code=status.HTTP_201_CREATED)
def create_record(
    record: RecordCreate,
    session: Session = Depends(get_session),
):
    db_record = WellBeingRecord(**record.model_dump())
    session.add(db_record)
    session.commit()
    session.refresh(db_record)
    return db_record


@router.get("/", response_model=list[RecordRead])
def get_records(session: Session = Depends(get_session)):
    statement = select(WellBeingRecord).order_by(
        WellBeingRecord.record_date.desc()
    )
    return session.exec(statement).all()


@router.get("/{record_id}", response_model=RecordRead)
def get_record(
    record_id: int,
    session: Session = Depends(get_session),
):
    record = session.get(WellBeingRecord, record_id)

    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    return record


@router.put("/{record_id}", response_model=RecordRead)
def update_record(
    record_id: int,
    updated_data: RecordUpdate,
    session: Session = Depends(get_session),
):
    record = session.get(WellBeingRecord, record_id)

    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    update_values = updated_data.model_dump(exclude_unset=True)
    record.sqlmodel_update(update_values)

    session.add(record)
    session.commit()
    session.refresh(record)

    return record


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    record_id: int,
    session: Session = Depends(get_session),
):
    record = session.get(WellBeingRecord, record_id)

    if not record:
        raise HTTPException(status_code=404, detail="Record not found")

    session.delete(record)
    session.commit()

    return None