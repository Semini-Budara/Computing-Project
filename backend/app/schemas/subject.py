from pydantic import BaseModel
from typing import Optional


class SubjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    grade: Optional[str] = None
    teacher_id: Optional[int] = None
    monthly_fee: Optional[float] = None
    schedule_time: Optional[str] = None


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    grade: Optional[str] = None
    teacher_id: Optional[int] = None
    monthly_fee: Optional[float] = None
    schedule_time: Optional[str] = None


class SubjectRead(SubjectBase):
    id: int

    class Config:
        from_attributes = True
