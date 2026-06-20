from sqlalchemy.orm import Session, joinedload

from app.models.student import Student
from app.schemas.student import StudentCreate, StudentUpdate


def get_student(db: Session, student_id: int):
    return db.query(Student).options(joinedload(Student.teacher), joinedload(Student.teachers)).filter(Student.id == student_id).first()


def list_students(db: Session, skip: int = 0, limit: int = 100, name: str | None = None, grade: str | None = None, school: str | None = None):
    query = db.query(Student).options(joinedload(Student.teacher), joinedload(Student.teachers))
    if name:
        query = query.join(Student.user).filter(Student.user.full_name.ilike(f"%{name}%"))
    if grade:
        query = query.filter(Student.grade == grade)
    if school:
        query = query.filter(Student.school.ilike(f"%{school}%"))
    return query.offset(skip).limit(limit).all()


def count_students(db: Session, name: str | None = None, grade: str | None = None, school: str | None = None):
    query = db.query(Student)
    if name:
        query = query.join(Student.user).filter(Student.user.full_name.ilike(f"%{name}%"))
    if grade:
        query = query.filter(Student.grade == grade)
    if school:
        query = query.filter(Student.school.ilike(f"%{school}%"))
    return query.count()


def create_student(db: Session, student_in: StudentCreate):
    student = Student(**student_in.dict())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


def update_student(db: Session, student: Student, student_in: StudentUpdate):
    for field, value in student_in.dict(exclude_unset=True).items():
        setattr(student, field, value)
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


def delete_student(db: Session, student: Student):
    db.delete(student)
    db.commit()
    return student
