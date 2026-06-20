from pydantic import BaseModel
from typing import Optional

from app.schemas.student import StudentRead
from app.schemas.subject import SubjectRead


class EnrollmentBase(BaseModel):
    student_id: int
    subject_id: int
    status: Optional[str] = "requested"
    payment_status: Optional[str] = "pending"
    attendance_percentage: Optional[float] = 0.0
    grade: Optional[str] = "N/A"
    term1_result: Optional[str] = None
    term2_result: Optional[str] = None
    term3_result: Optional[str] = None


class EnrollmentCreate(BaseModel):
    subject_id: int
    amount: float
    currency: Optional[str] = "USD"


class EnrollmentUpdate(BaseModel):
    status: Optional[str] = None
    payment_status: Optional[str] = None
    attendance_percentage: Optional[float] = None
    grade: Optional[str] = None
    term1_result: Optional[str] = None
    term2_result: Optional[str] = None
    term3_result: Optional[str] = None


class EnrollmentRead(EnrollmentBase):
    id: int
    student: Optional[StudentRead] = None
    subject: Optional[SubjectRead] = None

    class Config:
        from_attributes = True
