from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_student, get_db, get_current_active_student
from app.crud.enrollment import create_enrollment, list_enrollments_by_student, update_enrollment
from app.crud.payment import create_payment, get_payment, list_payments_by_student, update_payment
from app.crud.notification import (
    list_notifications_by_student,
    get_notification_for_student,
    dismiss_notification_for_user,
    clear_notifications_for_user,
)
from app.crud.subject import get_subject, list_subjects
from app.crud.teacher import get_teacher, list_teachers
from app.crud.student import get_student_by_user_id
from app.models.enrollment import Enrollment
from app.models.payment import Payment
from app.models.subject import Subject
from app.models.teacher import Teacher
from app.schemas.enrollment import EnrollmentCreate, EnrollmentRead
from app.schemas.notification import NotificationRead
from app.schemas.payment import PaymentCreate, PaymentRead
from app.schemas.profile import StudentProfile, TeacherProfile
from app.schemas.subject import SubjectRead
from app.schemas.timetable import TimetableRead
from app.schemas.user import UserRead

router = APIRouter(prefix="/students", tags=["students"])


@router.get("/me/profile", response_model=StudentProfile)
def read_student_profile(
    current_user=Depends(get_current_active_student),
    db: Session = Depends(get_db),
):
    student = get_student_by_user_id(db, current_user.id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")
    return {"user": UserRead.from_orm(current_user), "student": student}


@router.get("/me/notifications", response_model=List[NotificationRead])
def read_notifications(
    current_student=Depends(get_current_student),
    current_user=Depends(get_current_active_student),
    db: Session = Depends(get_db),
):
    return list_notifications_by_student(db, current_student.id, current_user.id)


@router.delete("/me/notifications/{notification_id}")
def dismiss_notification(
    notification_id: int,
    current_student=Depends(get_current_student),
    current_user=Depends(get_current_active_student),
    db: Session = Depends(get_db),
):
    notification = get_notification_for_student(db, notification_id, current_student.id)
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    dismiss_notification_for_user(db, notification_id, current_user.id)
    return {"detail": "Notification dismissed"}


@router.delete("/me/notifications")
def clear_notifications(current_user=Depends(get_current_active_student), db: Session = Depends(get_db)):
    clear_notifications_for_user(db, current_user.id)
    return {"detail": "All notifications dismissed"}


@router.get("/me/timetable", response_model=List[TimetableRead])
def read_timetable(current_student=Depends(get_current_student), db: Session = Depends(get_db)):
    enrollments = (
        db.query(Enrollment)
        .options(joinedload(Enrollment.subject).joinedload(Subject.timetables))
        .filter(Enrollment.student_id == current_student.id, Enrollment.status == "approved")
        .all()
    )

    timetable_entries = []
    for enrollment in enrollments:
        if enrollment.subject:
            timetable_entries.extend(enrollment.subject.timetables)
    return timetable_entries


@router.get("/me/subjects", response_model=list[SubjectRead])
def read_enrolled_subjects(current_student=Depends(get_current_student), db: Session = Depends(get_db)):
    enrollments = list_enrollments_by_student(db, current_student.id)
    return [enrollment.subject for enrollment in enrollments if enrollment.status == "approved"]


@router.get("/me/teachers", response_model=List[UserRead])
def read_teachers(current_student=Depends(get_current_student), db: Session = Depends(get_db)):
    enrollments = list_enrollments_by_student(db, current_student.id)
    teacher_ids = {enrollment.subject.teacher_id for enrollment in enrollments if enrollment.status == "approved" and enrollment.subject.teacher_id}
    return [UserRead.from_orm(teacher.user) for teacher in list_teachers(db) if teacher.id in teacher_ids]


@router.get("/me/teachers/{teacher_id}", response_model=TeacherProfile)
def read_teacher_profile(
    teacher_id: int,
    current_student=Depends(get_current_student),
    db: Session = Depends(get_db),
):
    enrollments = list_enrollments_by_student(db, current_student.id)
    approved = [en for en in enrollments if en.status == "approved"]
    allowed_teacher_ids = {enrollment.subject.teacher_id for enrollment in approved if enrollment.subject.teacher_id}
    if teacher_id not in allowed_teacher_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    teacher = get_teacher(db, teacher_id)
    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found")
    return {"user": UserRead.from_orm(teacher.user), "teacher": teacher}


@router.get("/me/attendance")
def read_attendance(current_student=Depends(get_current_student), db: Session = Depends(get_db)):
    enrollments = list_enrollments_by_student(db, current_student.id)
    return [
        {
            "subject_id": enrollment.subject_id,
            "subject_name": enrollment.subject.name,
            "attendance_percentage": enrollment.attendance_percentage,
        }
        for enrollment in enrollments
    ]


@router.get("/me/results")
def read_results(current_student=Depends(get_current_student), db: Session = Depends(get_db)):
    enrollments = list_enrollments_by_student(db, current_student.id)
    return [
        {
            "subject_id": enrollment.subject_id,
            "subject_name": enrollment.subject.name,
            "grade": enrollment.grade,
            "term1_result": enrollment.term1_result,
            "term2_result": enrollment.term2_result,
            "term3_result": enrollment.term3_result,
        }
        for enrollment in enrollments
    ]


@router.post("/enroll", response_model=EnrollmentRead)
def request_enrollment(
    request: EnrollmentCreate,
    current_student=Depends(get_current_student),
    db: Session = Depends(get_db),
):
    subject = get_subject(db, request.subject_id)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    enrollment = create_enrollment(db, current_student.id, request.subject_id)
    create_payment(
        db,
        current_student.id,
        PaymentCreate(amount=request.amount, currency=request.currency, enrollment_id=enrollment.id, status="completed"),
    )
    enrollment.payment_status = "completed"
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.get("/payments", response_model=list[PaymentRead])
def read_payments(current_student=Depends(get_current_student), db: Session = Depends(get_db)):
    payments = (
        db.query(Payment)
        .options(
            joinedload(Payment.enrollment)
            .joinedload(Enrollment.subject)
            .joinedload(Subject.teacher)
            .joinedload(Teacher.user)
        )
        .filter(Payment.student_id == current_student.id, Payment.enrollment_id.isnot(None))
        .all()
    )

    response = []
    for payment in payments:
        if not payment.enrollment or not payment.enrollment.subject:
            continue

        subject_name = payment.enrollment.subject.name
        teacher_name = None
        if payment.enrollment.subject.teacher and payment.enrollment.subject.teacher.user:
            teacher_name = payment.enrollment.subject.teacher.user.full_name

        response.append({
            "id": payment.id,
            "student_id": payment.student_id,
            "amount": payment.amount,
            "currency": payment.currency,
            "status": payment.status,
            "enrollment_id": payment.enrollment_id,
            "payment_date": payment.created_at.isoformat() if payment.created_at else None,
            "subject_name": subject_name,
            "teacher_name": teacher_name,
        })
    return response


@router.put("/payments/{payment_id}/complete", response_model=PaymentRead)
def complete_payment(
    payment_id: int,
    current_student=Depends(get_current_student),
    db: Session = Depends(get_db),
):
    payment = get_payment(db, payment_id)
    if not payment or payment.student_id != current_student.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")

    updated_payment = update_payment(db, payment, {"status": "completed"})
    if updated_payment.enrollment:
        updated_payment.enrollment.payment_status = "completed"
        db.add(updated_payment.enrollment)
        db.commit()
        db.refresh(updated_payment)

    subject_name = None
    teacher_name = None
    if updated_payment.enrollment and updated_payment.enrollment.subject:
        subject_name = updated_payment.enrollment.subject.name
        if updated_payment.enrollment.subject.teacher and updated_payment.enrollment.subject.teacher.user:
            teacher_name = updated_payment.enrollment.subject.teacher.user.full_name

    return {
        "id": updated_payment.id,
        "student_id": updated_payment.student_id,
        "amount": updated_payment.amount,
        "currency": updated_payment.currency,
        "status": updated_payment.status,
        "enrollment_id": updated_payment.enrollment_id,
        "payment_date": updated_payment.created_at.isoformat() if updated_payment.created_at else None,
        "subject_name": subject_name,
        "teacher_name": teacher_name,
    }


@router.get("/subjects", response_model=list[SubjectRead])
def read_available_subjects(db: Session = Depends(get_db)):
    return list_subjects(db)


@router.get("/subjects/{subject_id}", response_model=SubjectRead)
def read_subject(subject_id: int, db: Session = Depends(get_db)):
    subject = get_subject(db, subject_id)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    return subject


@router.get("/teachers", response_model=List[TeacherProfile])
def read_all_teachers(db: Session = Depends(get_db)):
    teachers = list_teachers(db)
    return [{"user": UserRead.from_orm(teacher.user), "teacher": teacher} for teacher in teachers]
