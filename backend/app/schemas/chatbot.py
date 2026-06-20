from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ChatbotMessageBase(BaseModel):
    sender: str  # "student" or "bot"
    message: str


class ChatbotMessageCreate(ChatbotMessageBase):
    pass


class ChatbotMessageRead(ChatbotMessageBase):
    id: int
    conversation_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatbotConversationBase(BaseModel):
    title: Optional[str] = None


class ChatbotConversationCreate(ChatbotConversationBase):
    pass


class ChatbotConversationRead(ChatbotConversationBase):
    id: int
    student_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatbotConversationWithMessages(ChatbotConversationRead):
    messages: List[ChatbotMessageRead] = []

    model_config = ConfigDict(from_attributes=True)
