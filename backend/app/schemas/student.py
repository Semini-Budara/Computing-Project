from pydantic import BaseModel, EmailStr
from typing import Optional

from app.schemas.user import UserRead
from app.schemas.teacher import TeacherRead


class StudentBase(BaseModel):
    age: Optional[int] = None
    grade: Optional[str] = None
    school: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_contact: Optional[str] = None
    profile_image: Optional[str] = None
    teacher_id: Optional[int] = None


class StudentCreate(StudentBase):
    user_id: int


class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    age: Optional[int] = None
    grade: Optional[str] = None
    school: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_contact: Optional[str] = None
    profile_image: Optional[str] = None
    teacher_id: Optional[int] = None
    teacher_ids: Optional[list[int]] = None


class StudentRead(StudentBase):
    id: int
    user_id: int
    user: UserRead
    teacher: Optional[TeacherRead] = None
    teachers: Optional[list[TeacherRead]] = None

    class Config:
        from_attributes = True


class TeacherStudentRead(BaseModel):
    id: int
    user_id: Optional[int] = None
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: str
    grade: Optional[str] = None
    school: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_contact: Optional[str] = None

    class Config:
        from_attributes = True


class StudentAccountCreate(StudentBase):
    full_name: str
    username: str
    email: EmailStr
    password: str
    grade: str
    teacher_id: Optional[int] = None
    teacher_ids: Optional[list[int]] = None


class StudentAccountUpdate(StudentBase):
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    teacher_ids: Optional[list[int]] = None


class StudentListResponse(BaseModel):
    total: int
    students: list[StudentRead]
