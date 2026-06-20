from sqlalchemy.orm import Session

from app.crud.user import create_user, get_user_by_email, get_user_by_username, update_user
from app.models.teacher import Teacher
from app.repositories.student_repository import (
    count_students,
    create_student,
    delete_student,
    get_student,
    list_students,
    update_student,
)
from app.schemas.student import StudentAccountCreate, StudentAccountUpdate, StudentCreate, StudentUpdate
from app.schemas.user import UserCreate


def create_student_account(db: Session, student_data: StudentAccountCreate):
    if get_user_by_email(db, student_data.email):
        raise ValueError("Email already used")
    if get_user_by_username(db, student_data.username):
        raise ValueError("Username already used")

    user = create_user(
        db,
        UserCreate(
            email=student_data.email,
            username=student_data.username,
            full_name=student_data.full_name,
            password=student_data.password,
        ),
        role="student",
    )

    primary_teacher_id = None
    if student_data.teacher_ids:
        primary_teacher_id = student_data.teacher_ids[0]
    elif student_data.teacher_id:
        primary_teacher_id = student_data.teacher_id

    student = create_student(
        db,
        StudentCreate(
            user_id=user.id,
            age=student_data.age,
            grade=student_data.grade,
            school=student_data.school,
            guardian_name=student_data.guardian_name,
            guardian_contact=student_data.guardian_contact,
            profile_image=student_data.profile_image,
            teacher_id=primary_teacher_id,
        ),
    )

    if student_data.teacher_ids:
        teacher_list = db.query(Teacher).filter(Teacher.id.in_(student_data.teacher_ids)).all()
        student.teachers = teacher_list
        db.add(student)
        db.commit()
        db.refresh(student)

    return student


def get_student_account(db: Session, student_id: int):
    return get_student(db, student_id)


def search_students(db: Session, skip: int = 0, limit: int = 25, name: str | None = None, grade: str | None = None, school: str | None = None):
    return list_students(db, skip=skip, limit=limit, name=name, grade=grade, school=school)


def count_student_accounts(db: Session, name: str | None = None, grade: str | None = None, school: str | None = None):
    return count_students(db, name=name, grade=grade, school=school)


def update_student_account(db: Session, student_id: int, update_data: StudentAccountUpdate):
    student = get_student(db, student_id)
    if not student:
        raise ValueError("Student not found")

    user_updates = {}
    if update_data.email is not None:
        user_updates["email"] = update_data.email
    if update_data.username is not None:
        user_updates["username"] = update_data.username
    if update_data.full_name is not None:
        user_updates["full_name"] = update_data.full_name
    if update_data.password is not None:
        user_updates["password"] = update_data.password
    if user_updates:
        update_user(db, student.user, user_updates)

    primary_teacher_id = None
    if update_data.teacher_ids is not None:
        if update_data.teacher_ids:
            primary_teacher_id = update_data.teacher_ids[0]
        else:
            primary_teacher_id = None
    elif update_data.teacher_id is not None:
        primary_teacher_id = update_data.teacher_id

    student_updates = StudentUpdate(
        age=update_data.age,
        grade=update_data.grade,
        school=update_data.school,
        guardian_name=update_data.guardian_name,
        guardian_contact=update_data.guardian_contact,
        profile_image=update_data.profile_image,
        teacher_id=primary_teacher_id,
    )
    updated_student = update_student(db, student, student_updates)

    if update_data.teacher_ids is not None:
        teacher_list = db.query(Teacher).filter(Teacher.id.in_(update_data.teacher_ids)).all()
        updated_student.teachers = teacher_list
        db.add(updated_student)
        db.commit()
        db.refresh(updated_student)

    return updated_student


def delete_student_account(db: Session, student_id: int):
    student = get_student(db, student_id)
    if not student:
        raise ValueError("Student not found")
    return delete_student(db, student)
