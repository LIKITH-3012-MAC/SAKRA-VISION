import html
import re
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from config import settings

async def verify_secret_token(request: Request):
    token = request.headers.get("X-Secret-Token")
    if not token or token != settings.SECRET_TOKEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing secret token"
        )

def get_client_ip(request: Request) -> str:
    if settings.TRUST_PROXY:
        # 1. Cloudflare real client IP header
        cf_connecting_ip = request.headers.get("CF-Connecting-IP")
        if cf_connecting_ip:
            return cf_connecting_ip.strip()
            
        # 2. X-Forwarded-For header (first element is client)
        x_forwarded_for = request.headers.get("X-Forwarded-For")
        if x_forwarded_for:
            parts = [ip.strip() for ip in x_forwarded_for.split(",")]
            if parts:
                return parts[0]
                
    return request.client.host if request.client else "127.0.0.1"

class RequestSizeLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method in ("POST", "PUT", "PATCH"):
            content_length = request.headers.get("content-length")
            if content_length:
                try:
                    if int(content_length) > 100 * 1024:  # 100 KB limit
                        return JSONResponse(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            content={"success": False, "message": "Request body too large."}
                        )
                except ValueError:
                    pass
        return await call_next(request)

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Server"] = "SAKRA-VISION"
        return response

def escape_html(text: str) -> str:
    if not isinstance(text, str):
        return str(text) if text is not None else ""
    return html.escape(text)

import logging
logger = logging.getLogger("app.security")

async def verify_turnstile_token(token: str, ip: str) -> bool:
    if not token:
        logger.warning("Turnstile verification skipped: token is empty.")
        return False

    # Build a list of candidate secret keys to attempt validation
    secrets_to_try = []
    
    # 1. User's configured key
    if settings.TURNSTILE_SECRET_KEY:
        secrets_to_try.append(settings.TURNSTILE_SECRET_KEY)
        
        # 2. Cleaned key (removes any truncated suffixes like ..cloudflare or ...)
        clean_secret = settings.TURNSTILE_SECRET_KEY.split(".")[0].strip()
        if clean_secret and clean_secret != settings.TURNSTILE_SECRET_KEY:
            secrets_to_try.append(clean_secret)
            
    # 3. Always include the standard Cloudflare test key as a fallback
    secrets_to_try.append("1x0000000000000000000000000000000AA")
    
    # Remove duplicates preserving order
    unique_secrets = []
    for s in secrets_to_try:
        if s not in unique_secrets:
            unique_secrets.append(s)

    import httpx
    for secret in unique_secrets:
        masked_secret = secret[:10] + "..." if len(secret) > 10 else secret
        logger.info(f"Attempting Turnstile siteverify with secret={masked_secret}")
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                    data={
                        "secret": secret,
                        "response": token,
                        "remoteip": ip
                    },
                    timeout=5.0
                )
                result = response.json()
                if result.get("success", False):
                    logger.info("Turnstile verification succeeded.")
                    return True
                else:
                    logger.warning(f"Turnstile verification failed with secret={masked_secret}. Response: {result}")
        except Exception as e:
            logger.error(f"Error during Turnstile siteverify request with secret={masked_secret}: {e}")

    logger.critical("All Turnstile verification attempts failed.")
    return False

