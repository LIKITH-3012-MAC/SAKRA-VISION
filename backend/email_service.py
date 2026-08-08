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
<p style="margin: 0 0 24px 0; font-size: 15px; color: #94a3b8; line-height: 1.6; text-align: center;">
  Your inquiry has been received by SAKRA VISION.<br>
  If you'd prefer to discuss the project directly, consultations are available every day from 6:00 PM to 9:00 PM IST.
</p>

<!-- Consultation & Meeting Card -->
<div style="background-color: rgba(8, 12, 23, 0.8); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: center;">
  <div style="font-size: 11px; font-weight: 700; color: #38bdf8; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 8px;">SAKRA VISION Consultation</div>
  <div style="font-size: 14px; color: #ffffff; font-weight: 600; margin-bottom: 4px;">Direct Consultation Window</div>
  <div style="font-size: 13px; color: #94a3b8; margin-bottom: 20px;">{settings.CONSULTATION_HOURS}</div>
  <a href="{settings.MEETING_URL}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #0071e3; background-image: linear-gradient(180deg, #0a84ff 0%, #0071e3 100%); color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; padding: 12px 28px; border-radius: 100px; border: 1px solid #0071e3; box-shadow: 0 8px 20px rgba(0, 113, 227, 0.3);">
    Schedule a Meeting ↗
  </a>
  <div style="font-size: 11px; color: #64748b; margin-top: 14px; word-break: break-all;">Google Meet: <a href="{settings.MEETING_URL}" style="color: #38bdf8; text-decoration: underline;">{settings.MEETING_URL}</a></div>
</div>

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
<div style="background-color: rgba(15, 23, 42, 0.4); border: 1px solid rgba(56, 189, 248, 0.15); border-radius: 12px; padding: 20px; margin-bottom: 32px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td width="50%" style="padding: 8px; text-align: center; border-right: 1px solid rgba(255,255,255,0.05);">
        <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Project Type</span><br>
        <span style="font-size: 14px; color: #e2e8f0; font-weight: 500; margin-top: 4px; display: inline-block;">{esc_project}</span>
      </td>
      <td width="50%" style="padding: 8px; text-align: center;">
        <span style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 1px;">Timeline</span><br>
        <span style="font-size: 14px; color: #e2e8f0; font-weight: 500; margin-top: 4px; display: inline-block;">{esc_timeline}</span>
      </td>
    </tr>
  </table>
</div>

<!-- Footer Link -->
<div style="text-align: center;">
  <a href="https://www.sakra-vision.online/" target="_blank" style="display: inline-block; color: #94a3b8; text-decoration: none; font-size: 12px; font-weight: 500; letter-spacing: 0.5px;">
    Visit SAKRA VISION AI Product Studio →
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


async def send_booking_notification_to_studio(booking_data: dict) -> bool:
    """
    Sends consultation booking notification to studio recipient (likith.anumakonda@gmail.com).
    """
    c_name = html.escape(booking_data.get("customer_name") or "Valued Client")
    c_email = html.escape(booking_data.get("customer_email") or "Not provided")
    c_date = html.escape(booking_data.get("appointment_date") or "Not specified")
    c_time = html.escape(booking_data.get("appointment_time") or "Not specified")
    c_tz = html.escape(booking_data.get("timezone") or "IST")
    c_ref = html.escape(booking_data.get("reference_id") or "SAKRA-BOOKING")
    c_topic = html.escape(booking_data.get("project_topic") or "General AI Consultation")
    c_meet = booking_data.get("meeting_url") or settings.MEETING_URL

    subject = f"New SAKRA VISION Consultation — {c_date} {c_time} IST [{c_ref}]"

    body_html = f"""
<div style="background-color: rgba(0, 113, 227, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 12px; padding: 24px; margin-bottom: 28px;">
  <span style="font-size: 10px; font-family: 'Courier New', Courier, monospace; color: #38bdf8; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">✦ NEW PRIVATE CONSULTATION BOOKING</span>
  <h2 style="font-size: 20px; color: #ffffff; margin-top: 8px; margin-bottom: 4px; font-weight: 700;">Consultation Reference: {c_ref}</h2>
  <p style="font-size: 13px; color: #94a3b8; margin: 0;">A client has scheduled a direct meeting on Google Meet.</p>
</div>

<table width="100%" border="0" cellspacing="0" cellpadding="10" style="margin-bottom: 28px; font-size: 13px; color: #cbd5e1; border-collapse: collapse;">
  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
    <td width="35%" style="color: #64748b; font-family: 'Courier New', Courier, monospace; text-transform: uppercase; font-size: 11px;">Client Name</td>
    <td width="65%" style="color: #ffffff; font-weight: 600;">{c_name}</td>
  </tr>
  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
    <td style="color: #64748b; font-family: 'Courier New', Courier, monospace; text-transform: uppercase; font-size: 11px;">Client Email</td>
    <td style="color: #38bdf8; font-weight: 600;">{c_email}</td>
  </tr>
  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
    <td style="color: #64748b; font-family: 'Courier New', Courier, monospace; text-transform: uppercase; font-size: 11px;">Date & Time</td>
    <td style="color: #ffffff; font-weight: 600;">{c_date} at {c_time} {c_tz}</td>
  </tr>
  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
    <td style="color: #64748b; font-family: 'Courier New', Courier, monospace; text-transform: uppercase; font-size: 11px;">Project / Topic</td>
    <td style="color: #e2e8f0;">{c_topic}</td>
  </tr>
  <tr>
    <td style="color: #64748b; font-family: 'Courier New', Courier, monospace; text-transform: uppercase; font-size: 11px;">Google Meet URL</td>
    <td style="color: #38bdf8;"><a href="{c_meet}" target="_blank" style="color: #38bdf8; text-decoration: underline;">{c_meet}</a></td>
  </tr>
</table>

<div style="text-align: center; margin-bottom: 24px;">
  <a href="{c_meet}" target="_blank" style="display: inline-block; background-color: #0071e3; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-size: 13px; font-weight: 600; box-shadow: 0 4px 16px rgba(0, 113, 227, 0.4);">
    Join Google Meet Session ↗
  </a>
</div>
"""

    html_content = _email_shell(
        title=f"New Consultation — {c_date} {c_time} IST",
        preheader=f"Consultation scheduled by {c_email}",
        body_html=body_html
    )

    payload = {
        "from": settings.RESEND_FROM_EMAIL,
        "to": [settings.RESEND_TO_EMAIL],
        "subject": subject,
        "html": html_content
    }

    return await send_email_via_resend(payload)


async def send_booking_confirmation_to_client(booking_data: dict) -> bool:
    """
    Sends consultation booking confirmation to client email address.
    """
    c_name = html.escape(booking_data.get("customer_name") or "Valued Client")
    c_email = booking_data.get("customer_email")
    c_date = html.escape(booking_data.get("appointment_date") or "Scheduled Date")
    c_time = html.escape(booking_data.get("appointment_time") or "Scheduled Time")
    c_tz = html.escape(booking_data.get("timezone") or "IST")
    c_ref = html.escape(booking_data.get("reference_id") or "SAKRA-BOOKING")
    c_meet = booking_data.get("meeting_url") or settings.MEETING_URL

    if not c_email:
        return False

    subject = f"Consultation Confirmed | SAKRA VISION [{c_ref}]"

    body_html = f"""
<div style="background-color: rgba(0, 113, 227, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 12px; padding: 24px; margin-bottom: 28px; text-align: center;">
  <span style="font-size: 10px; font-family: 'Courier New', Courier, monospace; color: #38bdf8; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">✦ CONSULTATION LOCKED IN</span>
  <h2 style="font-size: 22px; color: #ffffff; margin-top: 8px; margin-bottom: 6px; font-weight: 800;">Your Session is Confirmed</h2>
  <p style="font-size: 13px; color: #94a3b8; margin: 0;">We look forward to building something intelligent together.</p>
</div>

<!-- Booking Summary Card -->
<div style="background-color: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 12px; padding: 20px; margin-bottom: 28px;">
  <table width="100%" border="0" cellspacing="0" cellpadding="8" style="font-size: 13px; color: #cbd5e1;">
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
      <td style="color: #64748b; font-family: 'Courier New', Courier, monospace; font-size: 11px;">BOOKING REFERENCE</td>
      <td style="color: #38bdf8; font-family: 'Courier New', Courier, monospace; font-weight: 700; text-align: right;">{c_ref}</td>
    </tr>
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
      <td style="color: #64748b; font-family: 'Courier New', Courier, monospace; font-size: 11px;">DATE</td>
      <td style="color: #ffffff; font-weight: 600; text-align: right;">{c_date}</td>
    </tr>
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
      <td style="color: #64748b; font-family: 'Courier New', Courier, monospace; font-size: 11px;">TIME</td>
      <td style="color: #ffffff; font-weight: 600; text-align: right;">{c_time} {c_tz}</td>
    </tr>
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
      <td style="color: #64748b; font-family: 'Courier New', Courier, monospace; font-size: 11px;">WINDOW</td>
      <td style="color: #cbd5e1; text-align: right;">{settings.CONSULTATION_HOURS}</td>
    </tr>
    <tr>
      <td style="color: #64748b; font-family: 'Courier New', Courier, monospace; font-size: 11px;">FORMAT</td>
      <td style="color: #ffffff; font-weight: 600; text-align: right;">Google Meet Direct Video</td>
    </tr>
  </table>
</div>

<!-- Meeting Link CTA -->
<div style="text-align: center; margin-bottom: 32px;">
  <a href="{c_meet}" target="_blank" style="display: inline-block; background-color: #0071e3; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 999px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 20px rgba(0, 113, 227, 0.45); border: 1px solid rgba(56, 189, 248, 0.3);">
    Join Google Meet ↗
  </a>
  <div style="font-size: 11px; color: #64748b; margin-top: 12px; word-break: break-all;">Direct Link: <a href="{c_meet}" style="color: #38bdf8; text-decoration: underline;">{c_meet}</a></div>
</div>

<p style="font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.6;">
  If you need to reschedule or add details ahead of our call, simply reply to this email or contact us at <a href="mailto:likith.anumakonda@gmail.com" style="color: #38bdf8;">likith.anumakonda@gmail.com</a>.
</p>
"""

    html_content = _email_shell(
        title="Consultation Confirmed | SAKRA VISION",
        preheader=f"Your session is confirmed for {c_date} at {c_time} IST",
        body_html=body_html
    )

    payload = {
        "from": settings.RESEND_FROM_EMAIL,
        "to": [c_email],
        "subject": subject,
        "html": html_content
    }

    return await send_email_via_resend(payload)

