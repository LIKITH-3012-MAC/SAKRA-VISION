from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database import Base

class ClientInquiry(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=True)
    company = Column(String(150), nullable=True)
    project_type = Column(String(100), nullable=True)
    budget_range = Column(String(100), nullable=True)
    timeline = Column(String(100), nullable=True)
    message = Column(Text, nullable=False)
    ip_address = Column(String(100), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChatbotFeedback(Base):
    __tablename__ = "chatbot_feedback"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    feedback_id = Column(String(100), unique=True, index=True, nullable=False)
    conversation_id = Column(String(100), index=True, nullable=True)
    message_id = Column(String(100), index=True, nullable=False)
    session_id = Column(String(100), index=True, nullable=True)
    user_id = Column(String(100), index=True, nullable=True)
    feedback_type = Column(String(20), index=True, nullable=False)  # 'LIKE' or 'DISLIKE'
    user_query = Column(Text, nullable=True)
    response_snapshot = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

