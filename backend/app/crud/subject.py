from sqlalchemy.orm import Session

from app.models.subject import Subject
from app.schemas.subject import SubjectCreate, SubjectUpdate


def get_subject(db: Session, subject_id: int):
    return db.query(Subject).filter(Subject.id == subject_id).first()


def list_subjects(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Subject).offset(skip).limit(limit).all()


def create_subject(db: Session, subject_in: SubjectCreate):
    subject = Subject(**subject_in.dict())
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


def update_subject(db: Session, subject: Subject, subject_in: SubjectUpdate):
    for field, value in subject_in.dict(exclude_unset=True).items():
        setattr(subject, field, value)
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject


def delete_subject(db: Session, subject: Subject):
    db.delete(subject)
    db.commit()
    return subject


def list_subjects_by_grade(db: Session, grade: str):
    return db.query(Subject).filter(Subject.grade == grade).all()
