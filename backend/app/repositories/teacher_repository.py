from sqlalchemy.orm import Session

from app.models.teacher import Teacher
from app.schemas.teacher import TeacherCreate, TeacherUpdate


def get_teacher(db: Session, teacher_id: int):
    return db.query(Teacher).filter(Teacher.id == teacher_id).first()


def list_teachers(db: Session, skip: int = 0, limit: int = 100, name: str | None = None, grade: str | None = None, department: str | None = None):
    query = db.query(Teacher)
    if name:
        query = query.join(Teacher.user).filter(Teacher.user.full_name.ilike(f"%{name}%"))
    if grade:
        query = query.filter(Teacher.grade_assigned == grade)
    if department:
        query = query.filter(Teacher.department.ilike(f"%{department}%"))
    return query.offset(skip).limit(limit).all()


def count_teachers(db: Session, name: str | None = None, grade: str | None = None, department: str | None = None):
    query = db.query(Teacher)
    if name:
        query = query.join(Teacher.user).filter(Teacher.user.full_name.ilike(f"%{name}%"))
    if grade:
        query = query.filter(Teacher.grade_assigned == grade)
    if department:
        query = query.filter(Teacher.department.ilike(f"%{department}%"))
    return query.count()


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