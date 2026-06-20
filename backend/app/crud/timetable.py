from sqlalchemy.orm import Session

from app.models.timetable import Timetable
from app.schemas.timetable import TimetableCreate, TimetableUpdate


def get_timetable(db: Session, timetable_id: int):
    return db.query(Timetable).filter(Timetable.id == timetable_id).first()


def list_timetable(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Timetable).offset(skip).limit(limit).all()


def list_timetable_for_subject(db: Session, subject_id: int):
    return db.query(Timetable).filter(Timetable.subject_id == subject_id).all()


def create_timetable(db: Session, timetable_in: TimetableCreate):
    record = Timetable(**timetable_in.dict())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def update_timetable(db: Session, timetable: Timetable, update_in: TimetableUpdate):
    for field, value in update_in.dict(exclude_unset=True).items():
        setattr(timetable, field, value)
    db.add(timetable)
    db.commit()
    db.refresh(timetable)
    return timetable


def delete_timetable(db: Session, timetable: Timetable):
    db.delete(timetable)
    db.commit()
    return timetable
