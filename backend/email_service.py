import httpx
import logging
from config import settings
from security import escape_html

logger = logging.getLogger("app.email_service")

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
    subject = "New Client Inquiry - SAKRA VISION"
    
    # Extract variables safely from the dictionary
    full_name = client_data.get("full_name", "")
    email = client_data.get("email", "")
    phone = client_data.get("phone", "N/A")
    company = client_data.get("company", "N/A")
    project_type = client_data.get("project_type", "N/A")
    budget_range = client_data.get("budget_range", "N/A")
    timeline = client_data.get("timeline", "N/A")
    message = client_data.get("message", "")
    ip_address = client_data.get("ip_address", "N/A")
    user_agent = client_data.get("user_agent", "N/A")
    
    # Render variables safely using HTML escaping
    esc_name = escape_html(full_name)
    esc_email = escape_html(email)
    esc_phone = escape_html(phone) if phone else "N/A"
    esc_company = escape_html(company) if company else "N/A"
    esc_project = escape_html(project_type) if project_type else "N/A"
    esc_budget = escape_html(budget_range) if budget_range else "N/A"
    esc_timeline = escape_html(timeline) if timeline else "N/A"
    esc_message = escape_html(message).replace("\n", "<br/>")
    esc_ip = escape_html(ip_address)
    esc_ua = escape_html(user_agent) if user_agent else "N/A"
    
    html_content = f"""
    <div style="font-family: sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; background-color: #030712; color: #f8fafc; padding: 32px;">
        <h2 style="color: #22d3ee; margin-top: 0; font-size: 20px; border-bottom: 1px solid #334155; padding-bottom: 16px; font-weight: bold; font-family: monospace;">[NEW CLIENT PROPOSAL]</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px 0; font-weight: bold; width: 150px; color: #94a3b8; font-family: monospace;">CLIENT NAME:</td>
                <td style="padding: 10px 0; color: #f1f5f9;">{esc_name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px 0; font-weight: bold; color: #94a3b8; font-family: monospace;">CLIENT EMAIL:</td>
                <td style="padding: 10px 0; color: #f1f5f9;"><a href="mailto:{esc_email}" style="color: #22d3ee; text-decoration: none;">{esc_email}</a></td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px 0; font-weight: bold; color: #94a3b8; font-family: monospace;">PHONE:</td>
                <td style="padding: 10px 0; color: #f1f5f9;">{esc_phone}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px 0; font-weight: bold; color: #94a3b8; font-family: monospace;">COMPANY:</td>
                <td style="padding: 10px 0; color: #f1f5f9;">{esc_company}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px 0; font-weight: bold; color: #94a3b8; font-family: monospace;">PROJECT TYPE:</td>
                <td style="padding: 10px 0; color: #22d3ee;">{esc_project}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px 0; font-weight: bold; color: #94a3b8; font-family: monospace;">BUDGET RANGE:</td>
                <td style="padding: 10px 0; color: #a78bfa;">{esc_budget}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px 0; font-weight: bold; color: #94a3b8; font-family: monospace;">TIMELINE:</td>
                <td style="padding: 10px 0; color: #f1f5f9;">{esc_timeline}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1e293b;">
                <td style="padding: 10px 0; font-weight: bold; color: #94a3b8; font-family: monospace;">IP ADDRESS:</td>
                <td style="padding: 10px 0; color: #64748b; font-family: monospace;">{esc_ip}</td>
            </tr>
            <tr>
                <td style="padding: 10px 0; font-weight: bold; color: #94a3b8; font-family: monospace;">USER AGENT:</td>
                <td style="padding: 10px 0; color: #64748b; font-size: 11px;">{esc_ua}</td>
            </tr>
        </table>
        <div style="background-color: #0b0f19; border: 1px solid #1e293b; padding: 20px; border-radius: 8px;">
            <p style="font-weight: bold; margin: 0 0 10px 0; color: #94a3b8; font-family: monospace; font-size: 13px;">MESSAGE CONTENT:</p>
            <p style="margin: 0; line-height: 1.6; color: #e2e8f0; font-size: 14px; white-space: pre-wrap;">{esc_message}</p>
        </div>
    </div>
    """
    
    payload = {
        "from": settings.RESEND_FROM_EMAIL,
        "to": [settings.RESEND_TO_EMAIL],
        "subject": subject,
        "html": html_content
    }
    
    return await send_email_via_resend(payload)

async def send_client_confirmation(client_data: dict) -> bool:
    subject = "Thank you for contacting SAKRA VISION"
    
    full_name = client_data.get("full_name", "")
    email = client_data.get("email", "")
    project_type = client_data.get("project_type", "N/A")
    budget_range = client_data.get("budget_range", "N/A")
    timeline = client_data.get("timeline", "N/A")
    message = client_data.get("message", "")

    esc_name = escape_html(full_name)
    esc_project = escape_html(project_type)
    esc_budget = escape_html(budget_range)
    esc_timeline = escape_html(timeline)
    esc_message = escape_html(message).replace("\n", "<br/>")
    
    html_content = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #1e293b; border-radius: 12px; overflow: hidden; background-color: #030712; color: #f8fafc; padding: 32px;">
        <h2 style="color: #22d3ee; margin-top: 0; font-size: 20px; font-weight: bold; border-bottom: 1px solid #334155; padding-bottom: 12px; font-family: monospace;">SAKRA VISION</h2>
        <p style="font-size: 15px; margin: 16px 0; color: #e2e8f0;">Hi {esc_name},</p>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">Thank you for contacting SAKRA VISION.</p>
        <p style="font-size: 15px; line-height: 1.6; color: #cbd5e1;">We received your project inquiry successfully. Our team will review your details and contact you soon.</p>
        
        <div style="background-color: #0b0f19; border: 1px solid #1e293b; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <p style="font-weight: bold; margin: 0 0 10px 0; color: #94a3b8; font-family: monospace; font-size: 13px;">Your Inquiry Summary:</p>
            <p style="margin: 0 0 6px 0; color: #e2e8f0; font-size: 14px;"><strong>Project Type:</strong> {esc_project}</p>
            <p style="margin: 0 0 6px 0; color: #e2e8f0; font-size: 14px;"><strong>Budget Range:</strong> {esc_budget}</p>
            <p style="margin: 0 0 12px 0; color: #e2e8f0; font-size: 14px;"><strong>Timeline:</strong> {esc_timeline}</p>
            <p style="margin: 0; line-height: 1.6; color: #cbd5e1; font-size: 14px; white-space: pre-wrap;"><strong>Message:</strong><br/>{esc_message}</p>
        </div>
        
        <div style="margin: 28px 0; border-left: 3px solid #22d3ee; padding-left: 16px; font-style: italic; color: #94a3b8; font-size: 14px;">
            "Engineering Intelligence Into Reality"
        </div>
        <p style="font-size: 13px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 16px; margin-top: 24px; font-family: monospace;">
            SAKRA VISION — From Ideas to Intelligent Systems
        </p>
    </div>
    """
    
    payload = {
        "from": settings.RESEND_FROM_EMAIL,
        "to": [email],
        "subject": subject,
        "html": html_content
    }
    
    return await send_email_via_resend(payload)
