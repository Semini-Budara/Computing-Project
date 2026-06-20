from pydantic import BaseModel
from app.schemas.user import UserRead
from app.schemas.student import StudentRead
from app.schemas.teacher import TeacherRead


class StudentProfile(BaseModel):
    user: UserRead
    student: StudentRead

    class Config:
        from_attributes = True


class TeacherProfile(BaseModel):
    user: UserRead
    teacher: TeacherRead

    class Config:
        from_attributes = True
