from sqlalchemy import Column, Integer, ForeignKey, String, Float
from sqlalchemy.orm import relationship

from app.db.database import Base


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="requested")
    payment_status = Column(String(50), default="pending")
    attendance_percentage = Column(Float, default=0.0)
    grade = Column(String(20), default="N/A")
    term1_result = Column(String(50), nullable=True)
    term2_result = Column(String(50), nullable=True)
    term3_result = Column(String(50), nullable=True)

    student = relationship("Student", back_populates="enrollments")
    subject = relationship("Subject", back_populates="enrollments")
    payment = relationship("Payment", back_populates="enrollment", uselist=False)
