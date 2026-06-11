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
