from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship

from app.db.database import Base


class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    department = Column(String(100), nullable=True)
    grade_assigned = Column(String(50), nullable=True)
    class_fee = Column(String(50), nullable=True)
    contact_number = Column(String(50), nullable=True)
    profile_image = Column(Text, nullable=True)
    qualifications = Column(Text, nullable=True)
    experience = Column(Text, nullable=True)
    subjects_taught = Column(Text, nullable=True)

    user = relationship("User", back_populates="teacher")
    subjects = relationship("Subject", back_populates="teacher")
    students = relationship("Student", back_populates="teacher")
    students_many = relationship("Student", secondary="student_teachers", back_populates="teachers")
    notifications = relationship("Notification", back_populates="teacher")
