from sqlalchemy.orm import Session

from app.crud.user import create_user, get_user_by_email
from app.crud.student import create_student, get_student_by_user_id
from app.crud.teacher import create_teacher, get_teacher_by_user_id
from app.crud.subject import create_subject
from app.crud.timetable import create_timetable
from app.crud.notification import create_notification
from app.crud.enrollment import create_enrollment
from app.crud.payment import create_payment
from app.models.enrollment import Enrollment
from app.models.notification import Notification
from app.models.subject import Subject
from app.schemas.student import StudentCreate
from app.schemas.teacher import TeacherCreate
from app.schemas.subject import SubjectCreate
from app.schemas.timetable import TimetableCreate
from app.schemas.notification import NotificationCreate
from app.schemas.payment import PaymentCreate
from app.schemas.user import UserCreate


def init_demo_data(db: Session):
    if not get_user_by_email(db, "admin@example.com"):
        create_user(
            db,
            UserCreate(
                email="admin@example.com",
                username="admin",
                password="adminpass",
                full_name="System Administrator",
            ),
            role="admin",
        )

    teacher_user = get_user_by_email(db, "teacher1@example.com")
    teacher = get_teacher_by_user_id(db, teacher_user.id) if teacher_user else None
    if not teacher_user:
        teacher_user = create_user(
            db,
            UserCreate(
                email="teacher1@example.com",
                username="teacher1",
                password="teacherpass",
                full_name="Jane Teacher",
            ),
            role="teacher",
        )
    if not teacher:
        create_teacher(
            db,
            TeacherCreate(
                user_id=teacher_user.id,
                department="Mathematics",
                grade_assigned="Grade 9",
                qualifications="MSc Mathematics",
                experience="5 years teaching in secondary education",
                subjects_taught="Algebra,Biology",
            ),
        )

    student_user = get_user_by_email(db, "student1@example.com")
    student = get_student_by_user_id(db, student_user.id) if student_user else None
    if not student_user:
        student_user = create_user(
            db,
            UserCreate(
                email="student1@example.com",
                username="student1",
                password="studentpass",
                full_name="Tom Student",
            ),
            role="student",
        )
    if not student:
        create_student(db, StudentCreate(user_id=student_user.id, grade="Grade 9", enrollment_status="active"))

    if not db.query(Subject).first():
        maths = create_subject(db, SubjectCreate(name="Algebra", description="Intro to algebra", grade="Grade 9", teacher_id=teacher_user.id))
        science = create_subject(db, SubjectCreate(name="Biology", description="Basic biology", grade="Grade 9", teacher_id=teacher_user.id))
        create_timetable(db, TimetableCreate(subject_id=maths.id, day="Monday", start_time="09:00", end_time="10:30", classroom="Room 101"))
        create_timetable(db, TimetableCreate(subject_id=science.id, day="Wednesday", start_time="11:00", end_time="12:30", classroom="Room 102"))

    if not db.query(Notification).first():
        create_notification(
            db,
            NotificationCreate(
                title="Welcome",
                message="Welcome to the education management system",
                category="event",
                target_role="all"
            )
        )

    if not db.query(Enrollment).first():
        # Get the actual subject IDs that were created
        maths_subject = db.query(Subject).filter(Subject.name == "Algebra").first()
        if maths_subject:
            enrollment = create_enrollment(db, student_user.id, maths_subject.id)
            enrollment.status = "approved"
            enrollment.payment_status = "completed"
            enrollment.attendance_percentage = 92.5
            enrollment.grade = "A"
            db.add(enrollment)
            db.commit()
            create_payment(db, student_user.id, PaymentCreate(amount=100.0, currency="USD", enrollment_id=enrollment.id, status="completed"))
