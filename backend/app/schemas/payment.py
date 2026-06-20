from pydantic import BaseModel
from typing import Optional


class PaymentBase(BaseModel):
    amount: float
    currency: Optional[str] = "USD"
    status: Optional[str] = "pending"
    enrollment_id: Optional[int] = None


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    amount: Optional[float] = None
    currency: Optional[str] = None
    status: Optional[str] = None
    enrollment_id: Optional[int] = None


class PaymentRead(PaymentBase):
    id: int
    student_id: int
    enrollment_id: Optional[int] = None
    payment_date: Optional[str] = None
    created_at: Optional[str] = None
    subject_name: Optional[str] = None
    teacher_name: Optional[str] = None

    class Config:
        from_attributes = True
