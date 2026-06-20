from sqlalchemy import Column, Integer, ForeignKey, String, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    target_role = Column(String(50), nullable=False, default='all')
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="notifications")
    teacher = relationship("Teacher", back_populates="notifications")
    dismissals = relationship("NotificationDismissal", back_populates="notification", cascade="all, delete-orphan")
