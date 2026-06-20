from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user import UserCreate
from app.core import security


def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def list_users_by_role(db: Session, role: str, skip: int = 0, limit: int = 100):
    return db.query(User).filter(User.role == role).offset(skip).limit(limit).all()


def create_user(db: Session, user_in: UserCreate, role: str):
    hashed_password = security.get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=hashed_password,
        role=role,
        full_name=user_in.full_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, updates: dict):
    for field, value in updates.items():
        if field == "password" and value is not None:
            setattr(user, "hashed_password", security.get_password_hash(value))
            continue
        if field == "username" and value is not None:
            setattr(user, "username", value)
            continue
        if field == "email" and value is not None:
            setattr(user, "email", value)
            continue
        if field == "full_name" and value is not None:
            setattr(user, "full_name", value)
            continue
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, identifier: str, password: str, role: str):
    user = get_user_by_email(db, email=identifier)
    if not user:
        user = get_user_by_username(db, username=identifier)
    if not user or user.role != role:
        return None
    if not security.verify_password(password, user.hashed_password):
        return None
    return user
