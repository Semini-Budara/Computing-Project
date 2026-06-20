from sqlalchemy.orm import Session, joinedload

from app.models.enrollment import Enrollment
from app.models.student import Student
from app.schemas.enrollment import EnrollmentUpdate


def get_enrollment(db: Session, enrollment_id: int):
    return db.query(Enrollment).filter(Enrollment.id == enrollment_id).first()


def list_enrollments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Enrollment).offset(skip).limit(limit).all()


def list_enrollments_by_student(db: Session, student_id: int):
    return db.query(Enrollment).filter(Enrollment.student_id == student_id).all()


def list_pending_enrollments(db: Session):
    return (
        db.query(Enrollment)
        .options(
            joinedload(Enrollment.student).joinedload(Student.user),
            joinedload(Enrollment.subject)
        )
        .filter(Enrollment.status == "requested")
        .all()
    )


def create_enrollment(db: Session, student_id: int, subject_id: int):
    enrollment = Enrollment(student_id=student_id, subject_id=subject_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


def update_enrollment(db: Session, enrollment: Enrollment, update_in: EnrollmentUpdate):
    for field, value in update_in.dict(exclude_unset=True).items():
        setattr(enrollment, field, value)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


def delete_enrollment(db: Session, enrollment: Enrollment):
    db.delete(enrollment)
    db.commit()
