"""Add chatbot tables

Revision ID: 001_add_chatbot_tables
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001_add_chatbot_tables'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create chatbot_conversations table
    op.create_table(
        'chatbot_conversations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('student_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['student_id'], ['students.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.Index('ix_chatbot_conversations_student_id', 'student_id'),
        sa.Index('ix_chatbot_conversations_created_at', 'created_at'),
    )
    
    # Create chatbot_messages table
    op.create_table(
        'chatbot_messages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('conversation_id', sa.Integer(), nullable=False),
        sa.Column('sender', sa.String(50), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['conversation_id'], ['chatbot_conversations.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.Index('ix_chatbot_messages_conversation_id', 'conversation_id'),
        sa.Index('ix_chatbot_messages_created_at', 'created_at'),
    )


def downgrade() -> None:
    op.drop_table('chatbot_messages')
    op.drop_table('chatbot_conversations')
