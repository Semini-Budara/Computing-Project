from sqlalchemy.orm import Session
from datetime import datetime

from app.models.chatbot import ChatbotConversation, ChatbotMessage
from app.schemas.chatbot import ChatbotMessageCreate, ChatbotConversationCreate


def create_conversation(db: Session, student_id: int, title: str = None) -> ChatbotConversation:
    """Create a new chatbot conversation"""
    db_conversation = ChatbotConversation(
        student_id=student_id,
        title=title or f"Conversation - {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}"
    )
    db.add(db_conversation)
    db.commit()
    db.refresh(db_conversation)
    return db_conversation


def get_conversation(db: Session, conversation_id: int) -> ChatbotConversation:
    """Get a conversation by ID"""
    return db.query(ChatbotConversation).filter(
        ChatbotConversation.id == conversation_id
    ).first()


def get_student_conversations(db: Session, student_id: int, skip: int = 0, limit: int = 100) -> list[ChatbotConversation]:
    """Get all conversations for a student"""
    return db.query(ChatbotConversation).filter(
        ChatbotConversation.student_id == student_id
    ).order_by(ChatbotConversation.updated_at.desc()).offset(skip).limit(limit).all()


def update_conversation_title(db: Session, conversation_id: int, title: str) -> ChatbotConversation:
    """Update conversation title"""
    db_conversation = get_conversation(db, conversation_id)
    if db_conversation:
        db_conversation.title = title
        db_conversation.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_conversation)
    return db_conversation


def delete_conversation(db: Session, conversation_id: int) -> bool:
    """Delete a conversation and all its messages"""
    db_conversation = get_conversation(db, conversation_id)
    if db_conversation:
        db.delete(db_conversation)
        db.commit()
        return True
    return False


def create_message(
    db: Session,
    conversation_id: int,
    sender: str,
    message: str
) -> ChatbotMessage:
    """Create a new message in a conversation"""
    db_message = ChatbotMessage(
        conversation_id=conversation_id,
        sender=sender,
        message=message
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # Update conversation's updated_at timestamp
    conversation = get_conversation(db, conversation_id)
    if conversation:
        conversation.updated_at = datetime.utcnow()
        db.commit()
    
    return db_message


def get_conversation_messages(db: Session, conversation_id: int) -> list[ChatbotMessage]:
    """Get all messages in a conversation"""
    return db.query(ChatbotMessage).filter(
        ChatbotMessage.conversation_id == conversation_id
    ).order_by(ChatbotMessage.created_at.asc()).all()
