from sqlalchemy.orm import Session

from app.models.payment import Payment
from app.schemas.payment import PaymentCreate


def get_payment(db: Session, payment_id: int):
    return db.query(Payment).filter(Payment.id == payment_id).first()


def list_payments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Payment).offset(skip).limit(limit).all()


def list_payments_by_student(db: Session, student_id: int):
    return db.query(Payment).filter(Payment.student_id == student_id).all()


def create_payment(db: Session, student_id: int, payment_in: PaymentCreate):
    payment = Payment(student_id=student_id, **payment_in.dict())
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def update_payment(db: Session, payment: Payment, updates: dict):
    for field, value in updates.items():
        setattr(payment, field, value)
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment
