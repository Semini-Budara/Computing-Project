from typing import Callable, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.core import security
from app.crud.user import get_user_by_email, get_user
from app.db.database import get_db
from app.schemas.token import TokenPayload


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/admin/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = security.decode_access_token(token)
        email: Optional[str] = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token missing subject")
        token_data = TokenPayload(email=email)
    except (JWTError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")

    user = get_user_by_email(db, email=token_data.email)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_role(required_role: str) -> Callable:
    def dependency(user=Depends(get_current_user)):
        if user.role != required_role:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user
    return dependency


from app.crud.student import get_student_by_user_id
from app.crud.teacher import get_teacher_by_user_id


def get_current_active_admin(user=Depends(require_role("admin"))):
    return user


def get_current_active_teacher(user=Depends(require_role("teacher"))):
    return user


def get_current_active_student(user=Depends(require_role("student"))):
    return user


def get_current_student(
    current_user=Depends(get_current_active_student), db: Session = Depends(get_db)
):
    student = get_student_by_user_id(db, current_user.id)
    if student is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found")
    return student


def get_current_teacher(
    current_user=Depends(get_current_active_teacher), db: Session = Depends(get_db)
):
    teacher = get_teacher_by_user_id(db, current_user.id)
    if teacher is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher profile not found")
    return teacher
