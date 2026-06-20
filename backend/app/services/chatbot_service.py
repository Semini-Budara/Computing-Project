import os
import json
from abc import ABC, abstractmethod
from typing import Optional
from sqlalchemy.orm import Session

from app.crud import chatbot as chatbot_crud
from app.models.chatbot import ChatbotConversation, ChatbotMessage
from app.schemas.chatbot import ChatbotConversationWithMessages, ChatbotMessageRead


class AIProvider(ABC):
    """Abstract base class for AI providers"""

    @abstractmethod
    async def generate_response(self, conversation_history: list[dict], user_message: str) -> str:
        """
        Generate a response from the AI based on conversation history
        
        Args:
            conversation_history: List of dicts with 'role' and 'content' keys
            user_message: The user's current message
            
        Returns:
            The AI's response text
        """
        pass


class HuggingFaceAIProvider(AIProvider):
    """AI Provider using Hugging Face Transformers"""

    def __init__(self):
        try:
            from transformers import pipeline
            self.pipeline = pipeline("text-generation", model="distilgpt2")
        except ImportError:
            self.pipeline = None

    async def generate_response(self, conversation_history: list[dict], user_message: str) -> str:
        """Generate response using Hugging Face model"""
        if not self.pipeline:
            return self._fallback_response(user_message)

        # Build context from conversation history
        context = "\n".join([f"{msg['role']}: {msg['content']}" for msg in conversation_history[-5:]])
        prompt = f"{context}\nAssistant:"

        try:
            response = self.pipeline(
                prompt,
                max_length=100,
                num_return_sequences=1,
                temperature=0.7,
                do_sample=True
            )
            return response[0]['generated_text'].split("Assistant:")[-1].strip()
        except Exception as e:
            print(f"Error generating response: {e}")
            return self._fallback_response(user_message)

    @staticmethod
    def _fallback_response(user_message: str) -> str:
        """Fallback response when model fails"""
        keywords = {
            "grade": "I can help you understand your grades. What subject would you like to know about?",
            "homework": "You can view your homework assignments in the Subjects section. Would you like help with a specific assignment?",
            "teacher": "Your assigned teacher is listed in your profile. You can message them through the Teachers section.",
            "payment": "You can view your payment status in the Payments section. Do you need help with payment arrangements?",
            "schedule": "Your class schedule is available in the Timetable section. What time slot are you looking for?",
            "subject": "We offer various subjects based on your grade level. Which subject interests you?",
            "attendance": "Your attendance records are maintained by your teacher and school administration.",
            "exam": "Upcoming exams are listed in your dashboard. Would you like tips on exam preparation?",
            "help": "I'm your AI assistant! I can help you with questions about your grades, schedule, assignments, payments, and more. What would you like to know?",
        }

        user_lower = user_message.lower()
        for keyword, response in keywords.items():
            if keyword in user_lower:
                return response

        return "I understand you're asking about: " + user_message[:50] + ". Could you please provide more details so I can assist you better?"


class MockAIProvider(AIProvider):
    """Mock AI Provider for testing - returns contextual responses"""

    async def generate_response(self, conversation_history: list[dict], user_message: str) -> str:
        """Generate a mock response"""
        return HuggingFaceAIProvider._fallback_response(user_message)


class ChatbotService:
    """Service for managing chatbot conversations and AI interactions"""

    def __init__(self, ai_provider: Optional[AIProvider] = None):
        """
        Initialize chatbot service with an AI provider
        
        Args:
            ai_provider: The AI provider to use. Defaults to HuggingFaceAIProvider.
        """
        self.ai_provider = ai_provider or self._get_default_provider()

    @staticmethod
    def _get_default_provider() -> AIProvider:
        """Get the default AI provider based on environment"""
        provider_type = os.getenv("AI_PROVIDER", "mock").lower()

        if provider_type == "huggingface":
            return HuggingFaceAIProvider()
        else:
            return MockAIProvider()

    async def process_message(
        self,
        db: Session,
        student_id: int,
        conversation_id: Optional[int],
        user_message: str
    ) -> ChatbotConversationWithMessages:
        """
        Process a user message and generate a bot response
        
        Args:
            db: Database session
            student_id: ID of the student
            conversation_id: ID of the conversation (None to create new)
            user_message: The user's message
            
        Returns:
            The updated conversation with all messages
        """
        # Create or get conversation
        if not conversation_id:
            conversation = chatbot_crud.create_conversation(db, student_id)
        else:
            conversation = chatbot_crud.get_conversation(db, conversation_id)
            if not conversation or conversation.student_id != student_id:
                raise ValueError("Conversation not found or access denied")

        # Save user message
        chatbot_crud.create_message(
            db,
            conversation.id,
            "student",
            user_message
        )

        # Get conversation history
        messages = chatbot_crud.get_conversation_messages(db, conversation.id)
        conversation_history = [
            {"role": "Student" if msg.sender == "student" else "Assistant", "content": msg.message}
            for msg in messages
        ]

        # Generate AI response
        ai_response = await self.ai_provider.generate_response(
            conversation_history,
            user_message
        )

        # Save bot response
        chatbot_crud.create_message(
            db,
            conversation.id,
            "bot",
            ai_response
        )

        # Return updated conversation
        updated_messages = chatbot_crud.get_conversation_messages(db, conversation.id)
        conversation = chatbot_crud.get_conversation(db, conversation.id)

        return ChatbotConversationWithMessages(
            id=conversation.id,
            student_id=conversation.student_id,
            title=conversation.title,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
            messages=[
                ChatbotMessageRead(
                    id=msg.id,
                    conversation_id=msg.conversation_id,
                    sender=msg.sender,
                    message=msg.message,
                    created_at=msg.created_at
                )
                for msg in updated_messages
            ]
        )

    def get_student_conversations(
        self,
        db: Session,
        student_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> list[ChatbotConversation]:
        """Get all conversations for a student"""
        return chatbot_crud.get_student_conversations(db, student_id, skip, limit)

    def get_conversation(
        self,
        db: Session,
        conversation_id: int,
        student_id: int
    ) -> ChatbotConversationWithMessages:
        """Get a specific conversation"""
        conversation = chatbot_crud.get_conversation(db, conversation_id)
        if not conversation or conversation.student_id != student_id:
            raise ValueError("Conversation not found or access denied")

        messages = chatbot_crud.get_conversation_messages(db, conversation_id)

        return ChatbotConversationWithMessages(
            id=conversation.id,
            student_id=conversation.student_id,
            title=conversation.title,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at,
            messages=[
                ChatbotMessageRead(
                    id=msg.id,
                    conversation_id=msg.conversation_id,
                    sender=msg.sender,
                    message=msg.message,
                    created_at=msg.created_at
                )
                for msg in messages
            ]
        )

    def delete_conversation(self, db: Session, conversation_id: int, student_id: int) -> bool:
        """Delete a conversation"""
        conversation = chatbot_crud.get_conversation(db, conversation_id)
        if not conversation or conversation.student_id != student_id:
            raise ValueError("Conversation not found or access denied")

        return chatbot_crud.delete_conversation(db, conversation_id)

    def update_conversation_title(
        self,
        db: Session,
        conversation_id: int,
        student_id: int,
        title: str
    ) -> ChatbotConversation:
        """Update conversation title"""
        conversation = chatbot_crud.get_conversation(db, conversation_id)
        if not conversation or conversation.student_id != student_id:
            raise ValueError("Conversation not found or access denied")

        return chatbot_crud.update_conversation_title(db, conversation_id, title)


# Global instance
chatbot_service = ChatbotService()
