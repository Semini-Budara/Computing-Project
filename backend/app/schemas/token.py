from pydantic import BaseModel, EmailStr


class TokenPayload(BaseModel):
    email: EmailStr
