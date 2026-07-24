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
