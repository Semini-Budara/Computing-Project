from sqlalchemy import Column, Integer, String, ForeignKey, Text, Table
from sqlalchemy.orm import relationship

from app.db.database import Base

student_teachers = Table(
    "student_teachers",
    Base.metadata,
    Column("student_id", Integer, ForeignKey("students.id", ondelete="CASCADE"), primary_key=True),
    Column("teacher_id", Integer, ForeignKey("teachers.id", ondelete="CASCADE"), primary_key=True),
)


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"), nullable=True)
    age = Column(Integer, nullable=True)
    grade = Column(String(50), nullable=False)
    school = Column(String(150), nullable=True)
    guardian_name = Column(String(150), nullable=True)
    guardian_contact = Column(String(100), nullable=True)
    profile_image = Column(Text, nullable=True)
    enrollment_status = Column(String(50), default="active")

    user = relationship("User", back_populates="student")
    teacher = relationship("Teacher", back_populates="students")
    teachers = relationship("Teacher", secondary=student_teachers, back_populates="students_many")
    enrollments = relationship("Enrollment", back_populates="student")
    payments = relationship("Payment", back_populates="student")
    notifications = relationship("Notification", back_populates="student")
    chatbot_conversations = relationship("ChatbotConversation", back_populates="student", cascade="all, delete-orphan")
