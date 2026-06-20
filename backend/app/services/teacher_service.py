from sqlalchemy.orm import Session

from app.crud.user import create_user, get_user_by_email, get_user_by_username, update_user
from app.repositories.teacher_repository import (
    count_teachers,
    create_teacher,
    delete_teacher,
    get_teacher,
    list_teachers,
    update_teacher,
)
from app.schemas.teacher import TeacherAccountCreate, TeacherAccountUpdate, TeacherCreate, TeacherUpdate
from app.schemas.user import UserCreate


def create_teacher_account(db: Session, teacher_data: TeacherAccountCreate):
    if get_user_by_email(db, teacher_data.email):
        raise ValueError("Email already used")
    if get_user_by_username(db, teacher_data.username):
        raise ValueError("Username already used")

    user = create_user(
        db,
        UserCreate(
            email=teacher_data.email,
            username=teacher_data.username,
            full_name=teacher_data.full_name,
            password=teacher_data.password,
        ),
        role="teacher",
    )

    teacher = create_teacher(
        db,
        TeacherCreate(
            user_id=user.id,
            department=teacher_data.department,
            grade_assigned=teacher_data.grade_assigned,
            class_fee=teacher_data.class_fee,
            contact_number=teacher_data.contact_number,
            profile_image=teacher_data.profile_image,
            qualifications=teacher_data.qualifications,
            experience=teacher_data.experience,
            subjects_taught=teacher_data.subjects_taught,
        ),
    )
    return teacher


def get_teacher_account(db: Session, teacher_id: int):
    return get_teacher(db, teacher_id)


def search_teachers(db: Session, skip: int = 0, limit: int = 25, name: str | None = None, grade: str | None = None, department: str | None = None):
    return list_teachers(db, skip=skip, limit=limit, name=name, grade=grade, department=department)


def count_teacher_accounts(db: Session, name: str | None = None, grade: str | None = None, department: str | None = None):
    return count_teachers(db, name=name, grade=grade, department=department)


def update_teacher_account(db: Session, teacher_id: int, update_data: TeacherAccountUpdate):
    teacher = get_teacher(db, teacher_id)
    if not teacher:
        raise ValueError("Teacher not found")

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
        update_user(db, teacher.user, user_updates)

    teacher_updates = TeacherUpdate(
        department=update_data.department,
        grade_assigned=update_data.grade_assigned,
        class_fee=update_data.class_fee,
        contact_number=update_data.contact_number,
        profile_image=update_data.profile_image,
        qualifications=update_data.qualifications,
        experience=update_data.experience,
        subjects_taught=update_data.subjects_taught,
    )
    updated_teacher = update_teacher(db, teacher, teacher_updates)
    return updated_teacher


def delete_teacher_account(db: Session, teacher_id: int):
    teacher = get_teacher(db, teacher_id)
    if not teacher:
        raise ValueError("Teacher not found")
    return delete_teacher(db, teacher)