from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float
from sqlalchemy.orm import relationship

from app.db.database import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    grade = Column(String(50), nullable=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)
    monthly_fee = Column(Float, nullable=True)
    schedule_time = Column(String(255), nullable=True)

    teacher = relationship("Teacher", back_populates="subjects")
    enrollments = relationship("Enrollment", back_populates="subject", passive_deletes=True)
    timetables = relationship("Timetable", back_populates="subject", passive_deletes=True)
