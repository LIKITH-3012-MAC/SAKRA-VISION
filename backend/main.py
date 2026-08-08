import logging
import uvicorn
from fastapi import FastAPI, Request, Depends, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session

from config import settings
from database import get_db, create_tables
import models
import schemas
import email_service
import chatbot_service
from security import (
    verify_secret_token, 
    get_client_ip, 
    RequestSizeLimitMiddleware, 
    SecurityHeadersMiddleware,
    verify_turnstile_token
)

# Configure Application Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("app.main")

# Initialize Rate Limiter using Cloudflare-ready client IP resolver
limiter = Limiter(key_func=get_client_ip)

app = FastAPI(
    title=settings.APP_NAME,
    description="Python FastAPI backend for SAKRA VISION website",
    version="1.0.0"
)

# Bind Rate Limiter exception handler to the application state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Database table initialization at startup
@app.on_event("startup")
def on_startup():
    try:
        create_tables()
        logger.info("Aiven MySQL database tables initialized successfully.")
    except Exception as e:
        logger.critical(f"Failed to initialize database tables: {e}")

# Middlewares (Registered in reverse order of execution)
# 1. Custom Security Headers Injection
app.add_middleware(SecurityHeadersMiddleware)

# 2. Strict Request size limit (max 100 KB payload)
app.add_middleware(RequestSizeLimitMiddleware)

# 3. CORS locks
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Secret-Token"],
)

# Public Endpoint: Health Check
@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "service": settings.APP_NAME
    }

# Protected Endpoint: Create Client Inquiry
@app.post("/api/clients", dependencies=[Depends(verify_secret_token)])
@limiter.limit(settings.RATE_LIMIT_CLIENTS)
async def create_client_inquiry(
    payload: schemas.ClientCreate,
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    ip_addr = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "unknown")
    
    # Verify Cloudflare Turnstile token
    if not payload.captcha_token:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "message": "Security verification is required. Please complete the verification and try again."
            }
        )
    
    is_valid = await verify_turnstile_token(payload.captcha_token, ip_addr)
    if not is_valid:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "message": "Security verification failed. Please refresh and try again."
            }
        )
    
    try:
        # Write lead to database table 'clients'
        db_client = models.ClientInquiry(
            full_name=payload.full_name,
            email=payload.email,
            phone=payload.phone,
            company=payload.company,
            project_type=payload.project_type,
            budget_range=payload.budget_range,
            timeline=payload.timeline,
            message=payload.message,
            ip_address=ip_addr,
            user_agent=user_agent
        )
        db.add(db_client)
        db.commit()
        db.refresh(db_client)
        
        # Construct client inquiry data dictionary
        client_data = {
            "full_name": payload.full_name,
            "email": payload.email,
            "phone": payload.phone,
            "company": payload.company,
            "project_type": payload.project_type,
            "budget_range": payload.budget_range,
            "timeline": payload.timeline,
            "message": payload.message,
            "ip_address": ip_addr,
            "user_agent": user_agent
        }

        # Send emails synchronously to catch return statuses and report
        admin_notification_sent = False
        client_confirmation_sent = False

        try:
            admin_notification_sent = await email_service.send_admin_notification(client_data)
        except Exception as e:
            logger.error(f"Admin notification email failed: {e}", exc_info=True)

        try:
            client_confirmation_sent = await email_service.send_client_confirmation(client_data)
        except Exception as e:
            logger.error(f"Client confirmation email failed: {e}", exc_info=True)

        # Build response with debugging info in development env
        response_data = {
            "success": True,
            "message": "Your inquiry has been submitted successfully.",
            "email": {
                "client_confirmation": client_confirmation_sent
            }
        }
        if settings.APP_ENV == "development":
            response_data["email"]["admin_notification"] = admin_notification_sent

        return response_data
        
    except Exception as e:
        logger.error(f"Failed to submit client inquiry: {e}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "Something went wrong. Please try again later."
            }
        )

# Protected Endpoint: Chatbot
@app.post("/api/chat", response_model=schemas.ChatResponse, dependencies=[Depends(verify_secret_token)])
@limiter.limit(settings.RATE_LIMIT_CHAT)
async def chatbot_chat(payload: schemas.ChatRequest, request: Request):
    bot_reply = await chatbot_service.get_chatbot_reply(payload.message, payload.history)
    return {
        "success": True,
        "reply": bot_reply
    }

# Protected Endpoint: Chatbot Feedback Persistence
@app.post("/api/chat/feedback", response_model=schemas.ChatFeedbackResponse, dependencies=[Depends(verify_secret_token)])
@limiter.limit(settings.RATE_LIMIT_CHAT)
async def chatbot_feedback(
    payload: schemas.ChatFeedbackRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    ip_addr = get_client_ip(request)
    session_id = payload.session_id or f"ip_{ip_addr}"
    import uuid
    from datetime import datetime

    try:
        # Search for existing feedback record for message_id + session_id / conversation_id to prevent duplicates
        existing_fb = db.query(models.ChatbotFeedback).filter(
            models.ChatbotFeedback.message_id == payload.message_id
        ).first()

        if existing_fb:
            existing_fb.feedback_type = payload.feedback
            existing_fb.updated_at = datetime.utcnow()
            if payload.user_query:
                existing_fb.user_query = payload.user_query
            if payload.response_snapshot:
                existing_fb.response_snapshot = payload.response_snapshot
            db.commit()
            logger.info(f"Updated feedback to '{payload.feedback}' for message_id '{payload.message_id}'")
        else:
            fb_record = models.ChatbotFeedback(
                feedback_id=f"fb_{uuid.uuid4().hex[:12]}",
                conversation_id=payload.conversation_id,
                message_id=payload.message_id,
                session_id=session_id,
                feedback_type=payload.feedback,
                user_query=payload.user_query,
                response_snapshot=payload.response_snapshot
            )
            db.add(fb_record)
            db.commit()
            logger.info(f"Persisted new feedback '{payload.feedback}' for message_id '{payload.message_id}'")

        return {
            "success": True,
            "feedback": payload.feedback,
            "message": "Feedback recorded successfully."
        }
    except Exception as e:
        logger.error(f"Failed to record chatbot feedback: {e}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "Couldn't save your feedback. Please try again."
            }
        )

# Protected Endpoint: Consultation Booking
@app.post("/api/bookings", response_model=schemas.BookingCreateResponse, dependencies=[Depends(verify_secret_token)])
@limiter.limit(settings.RATE_LIMIT_INQUIRY)
async def create_booking(
    payload: schemas.BookingCreateRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    # 1. Turnstile Captcha verification if token present
    if payload.captcha_token and settings.TURNSTILE_SECRET_KEY and settings.TURNSTILE_SECRET_KEY != "0x4AAAAAAA...":
        ip_addr = get_client_ip(request)
        is_valid_captcha = await verify_turnstile(payload.captcha_token, ip_addr)
        if not is_valid_captcha:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CAPTCHA verification failed. Please try again."
            )

    # 2. Duplicate Protection / Idempotency Check
    existing_booking = db.query(models.ConsultationBooking).filter(
        models.ConsultationBooking.customer_email == payload.customer_email.lower().strip(),
        models.ConsultationBooking.appointment_date == payload.appointment_date.strip(),
        models.ConsultationBooking.appointment_time == payload.appointment_time.strip(),
        models.ConsultationBooking.status == "CONFIRMED"
    ).first()

    import uuid
    import random
    from datetime import datetime

    if existing_booking:
        logger.info(f"Duplicate booking request for '{payload.customer_email}' on {payload.appointment_date} {payload.appointment_time}. Returning existing reference.")
        booking_data = {
            "reference_id": existing_booking.reference_id,
            "customer_name": existing_booking.customer_name,
            "customer_email": existing_booking.customer_email,
            "appointment_date": existing_booking.appointment_date,
            "appointment_time": existing_booking.appointment_time,
            "timezone": existing_booking.timezone,
            "project_topic": existing_booking.project_topic,
            "meeting_url": existing_booking.meeting_url
        }
        # Re-trigger email dispatches if needed
        studio_sent = await email_service.send_booking_notification_to_studio(booking_data)
        client_sent = await email_service.send_booking_confirmation_to_client(booking_data)

        return {
            "success": True,
            "reference_id": existing_booking.reference_id,
            "booking_id": existing_booking.booking_id,
            "meeting_url": existing_booking.meeting_url,
            "message": "Consultation already reserved.",
            "email": {
                "studio_notification": studio_sent,
                "client_confirmation": client_sent
            }
        }

    # 3. Generate Human-Readable Reference Code (e.g. SAKRA-2026-0042)
    count = db.query(models.ConsultationBooking).count() + 1
    ref_num = f"{count:04d}"
    reference_code = f"SAKRA-2026-{ref_num}"
    unique_booking_id = f"bk_{uuid.uuid4().hex[:12]}"

    # 4. Create Database Record
    new_booking = models.ConsultationBooking(
        booking_id=unique_booking_id,
        reference_id=reference_code,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email.lower().strip(),
        project_topic=payload.project_topic,
        appointment_date=payload.appointment_date.strip(),
        appointment_time=payload.appointment_time.strip(),
        timezone=payload.timezone or "IST",
        meeting_url=settings.MEETING_URL,
        status="CONFIRMED"
    )

    try:
        db.add(new_booking)
        db.commit()
        db.refresh(new_booking)
        logger.info(f"Successfully created consultation booking '{reference_code}' for '{payload.customer_email}'")
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to persist booking in DB: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to save consultation booking. Please try again."
        )

    # 5. Send Double Email Dispatches
    booking_dict = {
        "reference_id": reference_code,
        "customer_name": payload.customer_name,
        "customer_email": payload.customer_email.lower().strip(),
        "appointment_date": payload.appointment_date,
        "appointment_time": payload.appointment_time,
        "timezone": payload.timezone or "IST",
        "project_topic": payload.project_topic,
        "meeting_url": settings.MEETING_URL
    }

    studio_email_sent = False
    client_email_sent = False

    try:
        studio_email_sent = await email_service.send_booking_notification_to_studio(booking_dict)
    except Exception as e:
        logger.error(f"Studio booking email failed: {e}", exc_info=True)

    try:
        client_email_sent = await email_service.send_booking_confirmation_to_client(booking_dict)
    except Exception as e:
        logger.error(f"Client booking email failed: {e}", exc_info=True)

    email_status_msg = "Consultation locked in and confirmation email dispatched."
    if not client_email_sent:
        email_status_msg = "Your consultation has been reserved, but confirmation email delivery is temporarily delayed."

    return {
        "success": True,
        "reference_id": reference_code,
        "booking_id": unique_booking_id,
        "meeting_url": settings.MEETING_URL,
        "message": email_status_msg,
        "email": {
            "studio_notification": studio_email_sent,
            "client_confirmation": client_email_sent
        }
    }



# Global Exception Handler to capture unhandled errors and mask stack traces
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled backend error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Internal server error occurred."
        }
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
