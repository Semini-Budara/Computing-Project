from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.notification_dismissal import NotificationDismissal
from app.schemas.notification import NotificationCreate, NotificationUpdate


def get_notification(db: Session, notification_id: int):
    return db.query(Notification).filter(Notification.id == notification_id).first()


def list_notifications(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Notification).offset(skip).limit(limit).all()


def list_notifications_by_student(db: Session, student_id: int, user_id: int):
    dismissed_notification_ids = (
        db.query(NotificationDismissal.notification_id)
        .filter(NotificationDismissal.user_id == user_id)
        .subquery()
    )
    return (
        db.query(Notification)
        .filter(~Notification.id.in_(dismissed_notification_ids))
        .filter(
            (Notification.student_id == student_id) |
            (Notification.target_role == 'all') |
            (Notification.target_role == 'students')
        )
        .all()
    )


def list_notifications_by_teacher(db: Session, teacher_id: int, user_id: int):
    dismissed_notification_ids = (
        db.query(NotificationDismissal.notification_id)
        .filter(NotificationDismissal.user_id == user_id)
        .subquery()
    )
    return (
        db.query(Notification)
        .filter(~Notification.id.in_(dismissed_notification_ids))
        .filter(
            (Notification.teacher_id == teacher_id) |
            (Notification.target_role == 'all') |
            (Notification.target_role == 'teachers')
        )
        .all()
    )


def get_notification_for_student(db: Session, notification_id: int, student_id: int):
    return db.query(Notification).filter(
        Notification.id == notification_id,
        (Notification.student_id == student_id) |
        (Notification.target_role == 'all') |
        (Notification.target_role == 'students')
    ).first()


def get_notification_for_teacher(db: Session, notification_id: int, teacher_id: int):
    return db.query(Notification).filter(
        Notification.id == notification_id,
        (Notification.teacher_id == teacher_id) |
        (Notification.target_role == 'all') |
        (Notification.target_role == 'teachers')
    ).first()


def dismiss_notification_for_user(db: Session, notification_id: int, user_id: int):
    existing = (
        db.query(NotificationDismissal)
        .filter(
            NotificationDismissal.notification_id == notification_id,
            NotificationDismissal.user_id == user_id,
        )
        .first()
    )
    if existing:
        return existing
    dismissal = NotificationDismissal(notification_id=notification_id, user_id=user_id)
    db.add(dismissal)
    db.commit()
    db.refresh(dismissal)
    return dismissal


def clear_notifications_for_user(db: Session, user_id: int):
    db.query(NotificationDismissal).filter(NotificationDismissal.user_id == user_id).delete(synchronize_session=False)
    db.commit()


def create_notification(db: Session, notification_in: NotificationCreate):
    notification = Notification(**notification_in.dict())
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def update_notification(db: Session, notification: Notification, update_in: NotificationUpdate):
    for field, value in update_in.dict(exclude_unset=True).items():
        setattr(notification, field, value)
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def delete_notification(db: Session, notification: Notification):
    db.delete(notification)
    db.commit()
    return notification
