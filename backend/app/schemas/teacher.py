from pydantic import BaseModel, EmailStr
from typing import Optional

from app.schemas.user import UserRead


class TeacherBase(BaseModel):
    department: Optional[str] = None
    grade_assigned: Optional[str] = None
    class_fee: Optional[str] = None
    contact_number: Optional[str] = None
    profile_image: Optional[str] = None
    qualifications: Optional[str] = None
    experience: Optional[str] = None
    subjects_taught: Optional[str] = None


class TeacherCreate(TeacherBase):
    user_id: int


class TeacherUpdate(BaseModel):
    department: Optional[str] = None
    grade_assigned: Optional[str] = None
    profile_image: Optional[str] = None
    qualifications: Optional[str] = None
    experience: Optional[str] = None
    subjects_taught: Optional[str] = None


class TeacherRead(TeacherBase):
    id: int
    user_id: int
    user: UserRead

    class Config:
        from_attributes = True


class TeacherAccountUpdate(BaseModel):
    full_name: Optional[str] = None
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    department: Optional[str] = None
    grade_assigned: Optional[str] = None
    class_fee: Optional[str] = None
    contact_number: Optional[str] = None
    profile_image: Optional[str] = None
    qualifications: Optional[str] = None
    experience: Optional[str] = None
    subjects_taught: Optional[str] = None


class TeacherAccountCreate(BaseModel):
    full_name: str
    username: str
    email: EmailStr
    password: str
    department: Optional[str] = None
    grade_assigned: Optional[str] = None
    class_fee: Optional[str] = None
    contact_number: Optional[str] = None
    profile_image: Optional[str] = None
    qualifications: Optional[str] = None
    experience: Optional[str] = None
    subjects_taught: Optional[str] = None
