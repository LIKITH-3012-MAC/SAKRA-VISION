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

class ConsultationBooking(Base):
    __tablename__ = "consultation_bookings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    booking_id = Column(String(100), unique=True, index=True, nullable=False)
    reference_id = Column(String(100), unique=True, index=True, nullable=False)
    customer_name = Column(String(150), nullable=True)
    customer_email = Column(String(255), nullable=False, index=True)
    project_topic = Column(Text, nullable=True)
    appointment_date = Column(String(50), nullable=False)
    appointment_time = Column(String(50), nullable=False)
    timezone = Column(String(50), default="IST")
    appointment_datetime_utc = Column(DateTime, nullable=True)
    meeting_url = Column(String(255), default="https://meet.google.com/grg-hytm-ahw")
    status = Column(String(50), default="CONFIRMED")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


