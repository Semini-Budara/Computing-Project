from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_student, get_db
from app.models.student import Student
from app.schemas.chatbot import (
    ChatbotConversationRead,
    ChatbotConversationWithMessages,
    ChatbotMessageCreate,
)
from app.services.chatbot_service import chatbot_service

router = APIRouter(prefix="/students/chatbot", tags=["chatbot"])


@router.post("/conversations", response_model=ChatbotConversationWithMessages)
async def create_conversation(
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """Create a new chatbot conversation"""
    from app.crud import chatbot as chatbot_crud
    
    conversation = chatbot_crud.create_conversation(db, current_student.id)
    return ChatbotConversationWithMessages(
        id=conversation.id,
        student_id=conversation.student_id,
        title=conversation.title,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        messages=[]
    )


@router.get("/conversations", response_model=List[ChatbotConversationRead])
def list_conversations(
    skip: int = 0,
    limit: int = 100,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """Get all conversations for the current student"""
    conversations = chatbot_service.get_student_conversations(db, current_student.id, skip, limit)
    return [
        ChatbotConversationRead(
            id=conv.id,
            student_id=conv.student_id,
            title=conv.title,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
        )
        for conv in conversations
    ]


@router.get("/conversations/{conversation_id}", response_model=ChatbotConversationWithMessages)
def get_conversation(
    conversation_id: int,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """Get a specific conversation with all messages"""
    try:
        return chatbot_service.get_conversation(db, conversation_id, current_student.id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/conversations/{conversation_id}/messages", response_model=ChatbotConversationWithMessages)
async def send_message(
    conversation_id: int,
    message: ChatbotMessageCreate,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """Send a message and get a bot response"""
    try:
        return await chatbot_service.process_message(
            db,
            current_student.id,
            conversation_id,
            message.message
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/conversations/messages/new", response_model=ChatbotConversationWithMessages)
async def send_message_new_conversation(
    message: ChatbotMessageCreate,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """Send a message to a new conversation"""
    try:
        return await chatbot_service.process_message(
            db,
            current_student.id,
            None,  # Create new conversation
            message.message
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/conversations/{conversation_id}", response_model=ChatbotConversationRead)
def update_conversation(
    conversation_id: int,
    title: str,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """Update conversation title"""
    try:
        conversation = chatbot_service.update_conversation_title(db, conversation_id, current_student.id, title)
        return ChatbotConversationRead(
            id=conversation.id,
            student_id=conversation.student_id,
            title=conversation.title,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    current_student: Student = Depends(get_current_student),
    db: Session = Depends(get_db),
):
    """Delete a conversation"""
    try:
        chatbot_service.delete_conversation(db, conversation_id, current_student.id)
        return {"message": "Conversation deleted successfully"}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
