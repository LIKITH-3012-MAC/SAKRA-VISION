import httpx
import logging
from datetime import datetime
from html import escape
from config import settings

logger = logging.getLogger("app.email_service")

def _safe(value) -> str:
    """Escapes user input for safe HTML insertion."""
    return escape(str(value or ""))

def _email_shell(title: str, preheader: str, body_html: str) -> str:
    """Wraps HTML content in a premium dark cinematic 3D glassmorphism shell."""
    current_year = datetime.now().year
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<style>
  body, table, td, a {{ -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }}
  table, td {{ mso-table-lspace: 0pt; mso-table-rspace: 0pt; }}
  img {{ -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }}
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #020617; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff; -webkit-font-smoothing: antialiased;">
  <!-- Preheader text hidden from layout -->
  <span style="display:none;font-size:1px;color:#020617;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">{preheader}</span>
  
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #020617; background-image: radial-gradient(circle at 50% 10%, #0c1838 0%, #020617 60%); padding: 60px 20px;">
    <tr>
      <td align="center">
        
        <!-- Top Brand Header -->
        <table width="100%" max-width="680" border="0" cellspacing="0" cellpadding="0" style="max-width: 680px; margin-bottom: 24px;">
          <tr>
            <td align="center" style="font-size: 16px; font-weight: 800; letter-spacing: 2px; color: #ffffff;">
              SAKRA VISION
              <div style="font-size: 10px; color: #64748b; font-weight: 500; letter-spacing: 2px; margin-top: 6px;">AI PRODUCT STUDIO</div>
            </td>
          </tr>
        </table>

        <!-- Main Glass Card (3D Illusion) -->
        <table width="100%" max-width="680" border="0" cellspacing="0" cellpadding="0" style="max-width: 680px; background-color: #080c17; background-image: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%); border-radius: 28px; border: 1px solid rgba(56, 189, 248, 0.2); border-top: 1px solid rgba(56, 189, 248, 0.4); box-shadow: 0 30px 60px rgba(0,0,0,0.8), 0 0 40px rgba(56, 189, 248, 0.05), inset 0 1px 0 rgba(255,255,255,0.1); overflow: hidden;">
          <tr>
            <td style="padding: 48px 40px;">
              {body_html}
            </td>
          </tr>
        </table>
        
        <!-- Footer -->
        <table width="100%" max-width="680" border="0" cellspacing="0" cellpadding="0" style="max-width: 680px; margin-top: 32px;">
          <tr>
            <td align="center" style="font-size: 11px; color: #475569; line-height: 1.6; letter-spacing: 0.5px;">
              Engineering Intelligence Into Reality<br>
              &copy; {current_year} SAKRA VISION AI Product Studio.<br>
              This is a secure automated system notification.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
"""

async def send_email_via_resend(payload: dict) -> bool:
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY is empty in configuration. Skipping email delivery.")
        return False
        
    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.resend.com/emails",
                json=payload,
                headers=headers,
                timeout=10.0
            )
            if resp.status_code in (200, 201, 202):
                logger.info(f"Email sent successfully to {payload.get('to')}.")
                return True
            else:
                logger.error(f"Resend service returned error status {resp.status_code}: {resp.text}")
                return False
    except Exception as e:
        logger.error(f"Failed to communicate with Resend API: {e}")
        return False

async def send_admin_notification(client_data: dict) -> bool:
    subject = "New Client Inquiry | SAKRA VISION"
    
    esc_name = _safe(client_data.get("full_name"))
    esc_email = _safe(client_data.get("email"))
    esc_phone = _safe(client_data.get("phone")) or "N/A"
    esc_company = _safe(client_data.get("company")) or "N/A"
    esc_project = _safe(client_data.get("project_type")) or "N/A"
    esc_budget = _safe(client_data.get("budget_range")) or "N/A"
    esc_timeline = _safe(client_data.get("timeline")) or "N/A"
    esc_message = _safe(client_data.get("message")).replace("\n", "<br/>")

    body_html = f"""
<!-- Badge -->
<div style="text-align: left; margin-bottom: 32px;">
  <div style="display: inline-block; padding: 8px 16px; background-color: rgba(0, 113, 227, 0.1); border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3); box-shadow: 0 0 15px rgba(56, 189, 248, 0.15);">
    <span style="color: #38bdf8; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">● Admin Pipeline</span>
  </div>
</div>

<h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">New Project Inquiry Received</h1>

<p style="margin: 0 0 32px 0; font-size: 15px; color: #94a3b8; line-height: 1.6;">
  A new client inquiry was submitted from the SAKRA VISION website.
</p>

<!-- Data Table -->
<div style="background-color: rgba(15, 23, 42, 0.4); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px; overflow: hidden; margin-bottom: 32px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td width="35%" style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; color: #64748b; font-weight: 600;">Full Name</td>
      <td width="65%" style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; color: #f8fafc; font-weight: 500;">{esc_name}</td>
    </tr>
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; color: #64748b; font-weight: 600;">Email</td>
      <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; color: #38bdf8; font-weight: 500;"><a href="mailto:{esc_email}" style="color: #38bdf8; text-decoration: none;">{esc_email}</a></td>
    </tr>
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; color: #64748b; font-weight: 600;">Phone</td>
      <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; color: #f8fafc; font-weight: 500;">{esc_phone}</td>
    </tr>
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; color: #64748b; font-weight: 600;">Company</td>
      <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; color: #f8fafc; font-weight: 500;">{esc_company}</td>
    </tr>
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; color: #64748b; font-weight: 600;">Project Type</td>
      <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; color: #f8fafc; font-weight: 500;">{esc_project}</td>
    </tr>
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; color: #64748b; font-weight: 600;">Budget Range</td>
      <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; color: #f8fafc; font-weight: 500;">{esc_budget}</td>
    </tr>
    <tr>
      <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 13px; color: #64748b; font-weight: 600;">Timeline</td>
      <td style="padding: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 14px; color: #f8fafc; font-weight: 500;">{esc_timeline}</td>
    </tr>
    <tr>
      <td style="padding: 16px; font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">Message</td>
      <td style="padding: 16px; font-size: 14px; color: #f8fafc; line-height: 1.6; font-family: 'Courier New', Courier, monospace;">{esc_message}</td>
    </tr>
  </table>
</div>

<!-- Status Strip -->
<div>
  <span style="display: inline-block; padding: 6px 14px; background-color: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 100px; font-size: 11px; font-family: 'Courier New', Courier, monospace; color: #94a3b8; margin: 0 6px 8px 0;">
    Status: <span style="color: #e2e8f0; font-weight: bold;">New Inquiry</span>
  </span>
  <span style="display: inline-block; padding: 6px 14px; background-color: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 100px; font-size: 11px; font-family: 'Courier New', Courier, monospace; color: #94a3b8; margin: 0 6px 8px 0;">
    Source: <span style="color: #e2e8f0; font-weight: bold;">SAKRA VISION Website</span>
  </span>
  <span style="display: inline-block; padding: 6px 14px; background-color: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 100px; font-size: 11px; font-family: 'Courier New', Courier, monospace; color: #94a3b8; margin: 0 6px 8px 0;">
    Pipeline: <span style="color: #e2e8f0; font-weight: bold;">Secure Client Request</span>
  </span>
</div>
"""
    
    html_content = _email_shell(
        title="New Client Inquiry | SAKRA VISION",
        preheader=f"New inquiry from {esc_name} for {esc_project}",
        body_html=body_html
    )

    payload = {
        "from": settings.RESEND_FROM_EMAIL,
        "to": [settings.RESEND_TO_EMAIL],
        "subject": subject,
        "html": html_content
    }
    
    return await send_email_via_resend(payload)

async def send_client_confirmation(client_data: dict) -> bool:
    subject = "Your Inquiry Has Been Received | SAKRA VISION"
    
    email = client_data.get("email", "")
    esc_project = _safe(client_data.get("project_type")) or "N/A"
    esc_budget = _safe(client_data.get("budget_range")) or "N/A"
    esc_timeline = _safe(client_data.get("timeline")) or "N/A"

    body_html = f"""
<!-- Badge -->
<div style="text-align: center; margin-bottom: 32px;">
  <div style="display: inline-block; width: 64px; height: 64px; background-color: rgba(0, 113, 227, 0.1); border-radius: 50%; border: 2px solid rgba(56, 189, 248, 0.4); border-top-color: #38bdf8; box-shadow: 0 0 20px rgba(56, 189, 248, 0.2), inset 0 0 15px rgba(56, 189, 248, 0.1); line-height: 64px; text-align: center;">
    <span style="color: #ffffff; font-size: 24px; font-family: sans-serif;">✓</span>
  </div>
</div>

<!-- Heading -->
<h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #ffffff; text-align: center; letter-spacing: -0.5px;">Inquiry Received Successfully</h1>

<!-- Message -->
<p style="margin: 0 0 32px 0; font-size: 15px; color: #94a3b8; line-height: 1.6; text-align: center;">
  Your request has been securely received by SAKRA VISION.<br>
  A confirmation has been generated and our team will review your inquiry soon.
</p>

<!-- Status Strip -->
<div style="text-align: center; margin-bottom: 32px;">
  <span style="display: inline-block; padding: 6px 14px; background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; font-size: 11px; font-family: 'Courier New', Courier, monospace; color: #e2e8f0; margin: 0 4px;">
    <span style="color: #38bdf8;">●</span> Delivered
  </span>
  <span style="display: inline-block; padding: 6px 14px; background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; font-size: 11px; font-family: 'Courier New', Courier, monospace; color: #e2e8f0; margin: 0 4px;">
    <span style="color: #38bdf8;">●</span> Sent
  </span>
  <span style="display: inline-block; padding: 6px 14px; background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 100px; font-size: 11px; font-family: 'Courier New', Courier, monospace; color: #e2e8f0; margin: 0 4px;">
    <span style="color: #38bdf8;">●</span> Secure
  </span>
</div>

<!-- Summary Card -->
<div style="background-color: rgba(15, 23, 42, 0.4); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px; padding: 24px; margin-bottom: 40px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td style="padding-bottom: 16px; text-align: center;">
        <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Project Type</span><br>
        <span style="font-size: 14px; color: #e2e8f0; font-weight: 500; margin-top: 4px; display: inline-block;">{esc_project}</span>
      </td>
    </tr>
    <tr>
      <td style="padding-bottom: 16px; text-align: center;">
        <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Timeline</span><br>
        <span style="font-size: 14px; color: #e2e8f0; font-weight: 500; margin-top: 4px; display: inline-block;">{esc_timeline}</span>
      </td>
    </tr>
    <tr>
      <td style="text-align: center;">
        <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Budget Range</span><br>
        <span style="font-size: 14px; color: #e2e8f0; font-weight: 500; margin-top: 4px; display: inline-block;">{esc_budget}</span>
      </td>
    </tr>
  </table>
</div>

<!-- CTA Button -->
<div style="text-align: center;">
  <a href="https://www.sakra-vision.online/" target="_blank" style="display: inline-block; background-color: #0071e3; background-image: linear-gradient(180deg, #0a84ff 0%, #0071e3 100%); color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; padding: 14px 32px; border-radius: 100px; border: 1px solid #0071e3; box-shadow: 0 8px 20px rgba(0, 113, 227, 0.3);">
    Visit SAKRA VISION
  </a>
</div>
"""

    html_content = _email_shell(
        title="Your Inquiry Has Been Received | SAKRA VISION",
        preheader="We have securely received your project inquiry.",
        body_html=body_html
    )

    payload = {
        "from": settings.RESEND_FROM_EMAIL,
        "to": [email],
        "subject": subject,
        "html": html_content
    }
    
    return await send_email_via_resend(payload)
