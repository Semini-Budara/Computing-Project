from sqlalchemy.orm import Session

from app.models.teacher import Teacher
from app.schemas.teacher import TeacherCreate, TeacherUpdate


def get_teacher(db: Session, teacher_id: int):
    return db.query(Teacher).filter(Teacher.id == teacher_id).first()


def get_teacher_by_user_id(db: Session, user_id: int):
    return db.query(Teacher).filter(Teacher.user_id == user_id).first()


def list_teachers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Teacher).offset(skip).limit(limit).all()


def create_teacher(db: Session, teacher_in: TeacherCreate):
    teacher = Teacher(**teacher_in.dict())
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return teacher


def update_teacher(db: Session, teacher: Teacher, teacher_in: TeacherUpdate):
    for field, value in teacher_in.dict(exclude_unset=True).items():
        setattr(teacher, field, value)
    db.add(teacher)
    db.commit()
    db.refresh(teacher)
    return teacher


def delete_teacher(db: Session, teacher: Teacher):
    db.delete(teacher)
    db.commit()
    return teacher
