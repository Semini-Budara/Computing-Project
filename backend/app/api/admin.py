from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_admin, get_db
from app.services.student_service import (
    count_student_accounts,
    create_student_account as create_student_account_service,
    delete_student_account,
    get_student_account,
    search_students,
    update_student_account,
)
from app.services.teacher_service import (
    count_teacher_accounts,
    create_teacher_account as create_teacher_account_service,
    delete_teacher_account,
    get_teacher_account,
    search_teachers,
    update_teacher_account,
)
from app.crud.teacher import create_teacher, get_teacher, list_teachers, update_teacher, delete_teacher
from app.crud.subject import create_subject, get_subject, list_subjects, update_subject, delete_subject
from app.crud.timetable import create_timetable, get_timetable, list_timetable, update_timetable, delete_timetable
from app.crud.notification import create_notification, get_notification, list_notifications, update_notification, delete_notification
from app.crud.payment import get_payment, list_payments, update_payment, create_payment
from app.crud.enrollment import get_enrollment, list_pending_enrollments, update_enrollment, delete_enrollment, create_enrollment
from app.crud.user import create_user, get_user_by_email, update_user
from app.schemas.user import UserCreate, UserRead
from app.schemas.student import (
    StudentAccountCreate,
    StudentAccountUpdate,
    StudentListResponse,
    StudentRead,
)
from app.schemas.teacher import TeacherAccountCreate, TeacherAccountUpdate, TeacherCreate, TeacherRead, TeacherUpdate
from app.schemas.subject import SubjectCreate, SubjectRead, SubjectUpdate
from app.schemas.timetable import TimetableCreate, TimetableRead, TimetableUpdate
from app.schemas.notification import NotificationCreate, NotificationRead, NotificationUpdate
from app.schemas.payment import PaymentCreate, PaymentRead, PaymentUpdate
from app.schemas.enrollment import EnrollmentRead, EnrollmentUpdate

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/students", response_model=StudentRead)
def create_student_account_route(
    student_in: StudentAccountCreate,
    db: Session = Depends(get_db),
    _: UserRead = Depends(get_current_active_admin),
):
    try:
        return create_student_account_service(db, student_in)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("/students", response_model=StudentListResponse)
def get_students(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = None,
    grade: str | None = None,
    school: str | None = None,
    db: Session = Depends(get_db),
    _: UserRead = Depends(get_current_active_admin),
):
    skip = (page - 1) * page_size
    students = search_students(db, skip=skip, limit=page_size, name=search, grade=grade, school=school)
    total = count_student_accounts(db, name=search, grade=grade, school=school)
    return {"students": students, "total": total}


@router.get("/students/{student_id}", response_model=StudentRead)
def get_student(student_id: int, db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    student = get_student_account(db, student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student


@router.put("/students/{student_id}", response_model=StudentRead)
def edit_student(
    student_id: int,
    student_in: StudentAccountUpdate,
    db: Session = Depends(get_db),
    _: UserRead = Depends(get_current_active_admin),
):
    try:
        return update_student_account(db, student_id, student_in)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.delete("/students/{student_id}")
def remove_student(student_id: int, db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    try:
        delete_student_account(db, student_id)
        return {"detail": "deleted"}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post("/students/{student_id}/enrollments", response_model=EnrollmentRead)
def enroll_student_in_subject(
    student_id: int,
    subject_id: int = Query(..., description="Subject ID to enroll in"),
    db: Session = Depends(get_db),
    _: UserRead = Depends(get_current_active_admin),
):
    student = get_student_account(db, student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    
    subject = get_subject(db, subject_id)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    
    # Create enrollment with "approved" status since admin is creating it
    enrollment = create_enrollment(db, student.id, subject_id)
    enrollment.status = "approved"
    enrollment.payment_status = "pending"
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    # Create a matching pending payment record for the assigned subject
    amount = subject.monthly_fee if subject.monthly_fee is not None else 0.0
    create_payment(
        db,
        student.id,
        PaymentCreate(amount=amount, currency="USD", enrollment_id=enrollment.id, status="pending"),
    )

    return enrollment


@router.post("/teachers", response_model=TeacherRead)
def create_teacher_account_route(
    teacher_in: TeacherAccountCreate,
    db: Session = Depends(get_db),
    _: UserRead = Depends(get_current_active_admin),
):
    try:
        return create_teacher_account_service(db, teacher_in)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get("/teachers", response_model=list[TeacherRead])
def get_teachers(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = None,
    grade: str | None = None,
    department: str | None = None,
    db: Session = Depends(get_db),
    _: UserRead = Depends(get_current_active_admin),
):
    skip = (page - 1) * page_size
    teachers = search_teachers(db, skip=skip, limit=page_size, name=search, grade=grade, department=department)
    return teachers


@router.put("/teachers/{teacher_id}", response_model=TeacherRead)
def edit_teacher(
    teacher_id: int,
    teacher_in: TeacherAccountUpdate,
    db: Session = Depends(get_db),
    _: UserRead = Depends(get_current_active_admin),
):
    try:
        return update_teacher_account(db, teacher_id, teacher_in)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.delete("/teachers/{teacher_id}")
def remove_teacher(teacher_id: int, db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    try:
        delete_teacher_account(db, teacher_id)
        return {"detail": "deleted"}
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.post("/subjects", response_model=SubjectRead)
def add_subject(subject_in: SubjectCreate, db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    return create_subject(db, subject_in)


@router.get("/subjects", response_model=list[SubjectRead])
def get_all_subjects(db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    return list_subjects(db)


@router.put("/subjects/{subject_id}", response_model=SubjectRead)
def edit_subject(subject_id: int, subject_in: SubjectUpdate, db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    subject = get_subject(db, subject_id)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    return update_subject(db, subject, subject_in)


@router.delete("/subjects/{subject_id}")
def remove_subject(subject_id: int, db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    subject = get_subject(db, subject_id)
    if not subject:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subject not found")
    delete_subject(db, subject)
    return {"detail": "deleted"}


@router.post("/timetable", response_model=TimetableRead)
def add_timetable(entry: TimetableCreate, db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    return create_timetable(db, entry)


@router.get("/timetable", response_model=list[TimetableRead])
def get_timetable_entries(db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    return list_timetable(db)


@router.put("/timetable/{timetable_id}", response_model=TimetableRead)
def edit_timetable_entry(timetable_id: int, updates: TimetableUpdate, db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    record = get_timetable(db, timetable_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Timetable record not found")
    return update_timetable(db, record, updates)


@router.delete("/timetable/{timetable_id}")
def remove_timetable_entry(timetable_id: int, db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    record = get_timetable(db, timetable_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Timetable record not found")
    delete_timetable(db, record)
    return {"detail": "deleted"}


@router.post("/notifications", response_model=NotificationRead)
def add_notification(notification_in: NotificationCreate, db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    return create_notification(db, notification_in)


@router.get("/notifications", response_model=list[NotificationRead])
def get_notifications(db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    return list_notifications(db)


@router.put("/notifications/{notification_id}", response_model=NotificationRead)
def edit_notification(notification_id: int, notification_in: NotificationUpdate, db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    record = get_notification(db, notification_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    return update_notification(db, record, notification_in)


@router.delete("/notifications/{notification_id}")
def remove_notification(notification_id: int, db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    record = get_notification(db, notification_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    delete_notification(db, record)
    return {"detail": "deleted"}


@router.get("/payments", response_model=list[PaymentRead])
def get_all_payments(db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    return list_payments(db)


@router.put("/payments/{payment_id}", response_model=PaymentRead)
def edit_payment(payment_id: int, updates: PaymentUpdate, db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    payment = get_payment(db, payment_id)
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    return update_payment(db, payment, updates.dict(exclude_unset=True))


@router.get("/enrollments/pending", response_model=list[EnrollmentRead])
def pending_enrollments(db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    return list_pending_enrollments(db)


@router.put("/enrollments/{enrollment_id}", response_model=EnrollmentRead)
def review_enrollment(enrollment_id: int, updates: EnrollmentUpdate, db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    enrollment = get_enrollment(db, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    return update_enrollment(db, enrollment, updates)


@router.delete("/enrollments/{enrollment_id}")
def remove_enrollment_request(enrollment_id: int, db: Session = Depends(get_db), _: UserRead = Depends(get_current_active_admin)):
    enrollment = get_enrollment(db, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    delete_enrollment(db, enrollment)
    return {"detail": "deleted"}
