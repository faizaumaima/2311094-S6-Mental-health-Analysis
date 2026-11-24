
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.database import get_session
from app.records import crud
from app.records.schemas import RecordCreate, RecordRead, RecordUpdate


router = APIRouter(prefix="/api/records", tags=["Well-Being Records"])


@router.post("/", response_model=RecordRead, status_code=status.HTTP_201_CREATED)
def create_record(
    record: RecordCreate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    return crud.create_record(session, record, user.id)


@router.get("/", response_model=list[RecordRead])
def get_records(
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    return crud.list_records(session, user.id)


@router.get("/{record_id}", response_model=RecordRead)
def get_record(
    record_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    record = crud.get_record(session, record_id, user.id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.put("/{record_id}", response_model=RecordRead)
def update_record(
    record_id: int,
    updated_data: RecordUpdate,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    record = crud.get_record(session, record_id, user.id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return crud.update_record(session, record, updated_data)


@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_record(
    record_id: int,
    session: Session = Depends(get_session),
    user: User = Depends(get_current_user),
):
    record = crud.get_record(session, record_id, user.id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    crud.delete_record(session, record)
    return None
