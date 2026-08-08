import re
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional

def sanitize_and_validate(val: str) -> str:
    if not isinstance(val, str):
        return val
    
    # 1. Strip leading and trailing whitespace
    cleaned = val.strip()
    
    # 2. Reject HTML or script injection patterns
    # Look for script tags, javascript protocols, or generic HTML tags
    script_pattern = re.compile(r"<[^>]*script[^>]*>", re.IGNORECASE)
    js_protocol_pattern = re.compile(r"javascript\s*:", re.IGNORECASE)
    generic_html_pattern = re.compile(r"<[a-zA-Z/]+[^>]*>")

    if script_pattern.search(cleaned) or js_protocol_pattern.search(cleaned):
        raise ValueError("Script injection attempt detected.")
    if generic_html_pattern.search(cleaned):
        raise ValueError("HTML tags are not allowed in submitted inputs.")
        
    return cleaned

class ClientCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr = Field(..., max_length=255)
    phone: Optional[str] = Field(None, max_length=30)
    company: Optional[str] = Field(None, max_length=150)
    project_type: Optional[str] = Field(None, max_length=100)
    budget_range: Optional[str] = Field(None, max_length=100)
    timeline: Optional[str] = Field(None, max_length=100)
    message: str = Field(..., min_length=10, max_length=5000)
    captcha_token: Optional[str] = Field(None)

    @field_validator("full_name", "phone", "company", "project_type", "budget_range", "timeline", "message")
    @classmethod
    def sanitize_fields(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return sanitize_and_validate(v)

class ClientResponse(BaseModel):
    id: int
    full_name: str
    email: str
    message: str

    class Config:
        from_attributes = True

class ChatMessageItem(BaseModel):
    sender: str
    text: str

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    history: Optional[list[ChatMessageItem]] = Field(default=None)

    @field_validator("message")
    @classmethod
    def sanitize_chat_message(cls, v: str) -> str:
        return sanitize_and_validate(v)

class ChatResponse(BaseModel):
    success: bool
    reply: str

class ChatFeedbackRequest(BaseModel):
    message_id: str = Field(..., min_length=1, max_length=100)
    conversation_id: Optional[str] = Field(None, max_length=100)
    feedback: str = Field(..., max_length=20)  # "LIKE" or "DISLIKE"
    user_query: Optional[str] = Field(None, max_length=2000)
    response_snapshot: Optional[str] = Field(None, max_length=10000)
    session_id: Optional[str] = Field(None, max_length=100)

    @field_validator("feedback")
    @classmethod
    def validate_feedback(cls, v: str) -> str:
        v_upper = v.upper().strip()
        if v_upper not in ("LIKE", "DISLIKE"):
            raise ValueError("Feedback must be either 'LIKE' or 'DISLIKE'.")
        return v_upper

class ChatFeedbackResponse(BaseModel):
    success: bool
    feedback: str
    message: str

class BookingCreateRequest(BaseModel):
    customer_email: EmailStr = Field(..., max_length=255)
    appointment_date: str = Field(..., min_length=8, max_length=50)
    appointment_time: str = Field(..., min_length=4, max_length=50)
    customer_name: Optional[str] = Field(None, max_length=150)
    project_topic: Optional[str] = Field(None, max_length=2000)
    timezone: Optional[str] = Field("IST", max_length=50)
    captcha_token: Optional[str] = Field(None)

    @field_validator("customer_name", "project_topic", "appointment_date", "appointment_time")
    @classmethod
    def sanitize_booking_fields(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return sanitize_and_validate(v)

class BookingCreateResponse(BaseModel):
    success: bool
    reference_id: str
    booking_id: str
    meeting_url: str
    message: str
    email: dict


