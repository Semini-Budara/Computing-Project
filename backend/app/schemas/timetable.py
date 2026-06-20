from pydantic import BaseModel
from typing import Optional

from app.schemas.subject import SubjectRead


class TimetableBase(BaseModel):
    subject_id: int
    day: str
    start_time: str
    end_time: str
    classroom: Optional[str] = None


class TimetableCreate(TimetableBase):
    pass


class TimetableUpdate(BaseModel):
    subject_id: Optional[int] = None
    day: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    classroom: Optional[str] = None


class TimetableRead(TimetableBase):
    id: int
    subject: Optional[SubjectRead] = None

    class Config:
        from_attributes = True
