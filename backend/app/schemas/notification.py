from pydantic import BaseModel
from typing import Optional


class NotificationBase(BaseModel):
    title: str
    message: str
    category: Optional[str] = None
    target_role: Optional[str] = 'all'
    student_id: Optional[int] = None
    teacher_id: Optional[int] = None


class NotificationCreate(NotificationBase):
    pass


class NotificationUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    category: Optional[str] = None
    target_role: Optional[str] = None
    student_id: Optional[int] = None
    teacher_id: Optional[int] = None


class NotificationRead(NotificationBase):
    id: int

    class Config:
        from_attributes = True
