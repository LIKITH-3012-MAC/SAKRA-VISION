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
    <div style="background-color: #020617; background-image: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 70%); padding: 40px 20px; font-family: 'Courier New', Courier, monospace, sans-serif; color: #f1f5f9; min-height: 100%;">
        <!-- Main Floating 3D Hologram Container -->
        <div style="max-width: 600px; margin: 0 auto; background-color: #0b1329; border: 1px solid #f43f5e; border-top: 4px solid #f43f5e; border-right: 4px solid #4c0519; border-bottom: 4px solid #4c0519; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(244, 63, 94, 0.15); overflow: hidden;">
            
            <!-- Cybernetic Grid Decorative Background -->
            <div style="background-image: linear-gradient(rgba(244, 63, 94, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(244, 63, 94, 0.04) 1px, transparent 1px); background-size: 20px 20px; padding: 32px;">
                
                <!-- HUD Header -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                    <tr>
                        <td>
                            <span style="font-size: 10px; color: #f43f5e; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 4px;">SECURE PIPELINE // INCOMING CLIENT PROPOSAL</span>
                            <h1 style="color: #ffffff; font-size: 22px; font-weight: 900; margin: 0; letter-spacing: -1px; text-shadow: 0 0 10px rgba(244,63,94,0.5); font-family: 'Courier New', Courier, monospace;">[NEW INQUIRY DETECTED]</h1>
                        </td>
                        <td style="text-align: right; vertical-align: top; width: 80px;">
                            <span style="display: inline-block; background-color: rgba(244, 63, 94, 0.1); border: 1px solid #f43f5e; color: #f43f5e; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; text-shadow: 0 0 5px rgba(244, 63, 94, 0.3);">
                                URGENT
                            </span>
                        </td>
                    </tr>
                </table>

                <!-- Holographic Separator Line -->
                <div style="height: 1px; background: linear-gradient(90deg, #f43f5e 0%, rgba(244,63,94,0.2) 50%, transparent 100%); margin-bottom: 24px;"></div>

                <!-- Client Metadata Grid (3D block cards) -->
                <h3 style="color: #f43f5e; font-size: 12px; letter-spacing: 1.5px; margin: 0 0 12px 0; text-transform: uppercase;">[ SENSOR METADATA & PROFILE ]</h3>
                
                <table style="width: 100%; border-collapse: separate; border-spacing: 10px; margin-bottom: 24px; margin-left: -10px; margin-right: -10px;">
                    <tr>
                        <td style="width: 50%; background: #0f172a; border-top: 1px solid #38bdf8; border-bottom: 3px solid #020617; border-left: 1px solid rgba(56,189,248,0.15); border-right: 1px solid rgba(56,189,248,0.15); border-radius: 6px; padding: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                            <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">CLIENT NAME</span>
                            <span style="font-size: 13px; color: #38bdf8; font-weight: bold;">{esc_name}</span>
                        </td>
                        <td style="width: 50%; background: #0f172a; border-top: 1px solid #a78bfa; border-bottom: 3px solid #020617; border-left: 1px solid rgba(167,139,250,0.15); border-right: 1px solid rgba(167,139,250,0.15); border-radius: 6px; padding: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                            <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">CLIENT EMAIL</span>
                            <span style="font-size: 13px; color: #a78bfa; font-weight: bold;"><a href="mailto:{esc_email}" style="color: #a78bfa; text-decoration: none;">{esc_email}</a></span>
                        </td>
                    </tr>
                    <tr>
                        <td style="width: 50%; background: #0f172a; border-top: 1px solid #10b981; border-bottom: 3px solid #020617; border-left: 1px solid rgba(16,185,129,0.15); border-right: 1px solid rgba(16,185,129,0.15); border-radius: 6px; padding: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                            <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">PHONE</span>
                            <span style="font-size: 13px; color: #10b981; font-weight: bold;">{esc_phone}</span>
                        </td>
                        <td style="width: 50%; background: #0f172a; border-top: 1px solid #f59e0b; border-bottom: 3px solid #020617; border-left: 1px solid rgba(245,158,11,0.15); border-right: 1px solid rgba(245,158,11,0.15); border-radius: 6px; padding: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                            <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">COMPANY</span>
                            <span style="font-size: 13px; color: #f59e0b; font-weight: bold;">{esc_company}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="width: 50%; background: #0f172a; border-top: 1px solid #38bdf8; border-bottom: 3px solid #020617; border-left: 1px solid rgba(56,189,248,0.15); border-right: 1px solid rgba(56,189,248,0.15); border-radius: 6px; padding: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                            <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">PROJECT TYPE</span>
                            <span style="font-size: 13px; color: #38bdf8; font-weight: bold;">{esc_project}</span>
                        </td>
                        <td style="width: 50%; background: #0f172a; border-top: 1px solid #a78bfa; border-bottom: 3px solid #020617; border-left: 1px solid rgba(167,139,250,0.15); border-right: 1px solid rgba(167,139,250,0.15); border-radius: 6px; padding: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                            <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">BUDGET RANGE</span>
                            <span style="font-size: 13px; color: #a78bfa; font-weight: bold;">{esc_budget}</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="width: 50%; background: #0f172a; border-top: 1px solid #10b981; border-bottom: 3px solid #020617; border-left: 1px solid rgba(16,185,129,0.15); border-right: 1px solid rgba(16,185,129,0.15); border-radius: 6px; padding: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                            <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">TIMELINE</span>
                            <span style="font-size: 13px; color: #10b981; font-weight: bold;">{esc_timeline}</span>
                        </td>
                        <td style="width: 50%; background: #0f172a; border-top: 1px solid #64748b; border-bottom: 3px solid #020617; border-left: 1px solid rgba(100,116,139,0.15); border-right: 1px solid rgba(100,116,139,0.15); border-radius: 6px; padding: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                            <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">IP ADDRESS</span>
                            <span style="font-size: 13px; color: #cbd5e1; font-family: monospace;">{esc_ip}</span>
                        </td>
                    </tr>
                </table>

                <!-- Glowing Terminal Window for Message -->
                <div style="background: #030712; border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 8px; overflow: hidden; box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.9); margin-bottom: 24px;">
                    <!-- Terminal Header -->
                    <div style="background: #0f172a; border-bottom: 1px solid rgba(244, 63, 94, 0.2); padding: 8px 14px; font-size: 10px; color: #64748b; font-family: monospace;">
                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #ef4444; margin-right: 6px;"></span>
                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #eab308; margin-right: 6px;"></span>
                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #22c55e; margin-right: 12px;"></span>
                        client_inquiry_payload.txt
                    </div>
                    <!-- Terminal Content -->
                    <div style="padding: 16px; font-family: monospace; font-size: 12px; line-height: 1.6; color: #f43f5e;">
                        <span style="color: #64748b;">$ cat client_inquiry_payload.txt</span><br/>
                        <div style="color: #e2e8f0; margin-top: 8px; white-space: pre-wrap;">{esc_message}</div>
                    </div>
                </div>

                <!-- User Agent Info Box -->
                <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(244, 63, 94, 0.15); border-radius: 6px; padding: 12px; font-size: 11px; font-family: monospace; color: #64748b; line-height: 1.5;">
                    <span style="color: #f43f5e; font-weight: bold;">[BROWSER SENSOR INFO]</span><br/>
                    {esc_ua}
                </div>

                <!-- Footer Badge -->
                <div style="margin-top: 32px; border-top: 1px solid rgba(244, 63, 94, 0.2); padding-top: 20px; text-align: center;">
                    <p style="font-size: 10px; color: #64748b; letter-spacing: 1px; margin: 0; font-family: monospace;">
                        SAKRA VISION LABORATORY // DEEP-TECH INTEGRATED SYSTEMS
                    </p>
                </div>
                
            </div>
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
    <div style="background-color: #020617; background-image: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #020617 70%); padding: 40px 20px; font-family: 'Courier New', Courier, monospace, sans-serif; color: #f1f5f9; min-height: 100%;">
        <!-- Main Floating 3D Hologram Container -->
        <div style="max-width: 600px; margin: 0 auto; background-color: #0b1329; border: 1px solid #38bdf8; border-top: 4px solid #38bdf8; border-right: 4px solid #083344; border-bottom: 4px solid #083344; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(56, 189, 248, 0.15); overflow: hidden;">
            
            <!-- Cybernetic Grid Decorative Background -->
            <div style="background-image: linear-gradient(rgba(56, 189, 248, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.04) 1px, transparent 1px); background-size: 20px 20px; padding: 32px;">
                
                <!-- HUD Header -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                    <tr>
                        <td>
                            <span style="font-size: 10px; color: #38bdf8; letter-spacing: 2px; font-weight: bold; display: block; margin-bottom: 4px;">SYSTEM INITIALIZED // INQUIRY LOGGED</span>
                            <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: -1px; text-shadow: 0 0 10px rgba(56,189,248,0.5); font-family: 'Courier New', Courier, monospace;">SAKRA VISION</h1>
                        </td>
                        <td style="text-align: right; vertical-align: top; width: 80px;">
                            <span style="display: inline-block; background-color: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; color: #10b981; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; text-shadow: 0 0 5px rgba(16,185,129,0.3);">
                                ● ONLINE
                            </span>
                        </td>
                    </tr>
                </table>

                <!-- Holographic Separator Line -->
                <div style="height: 1px; background: linear-gradient(90deg, #38bdf8 0%, rgba(56,189,248,0.2) 50%, transparent 100%); margin-bottom: 24px;"></div>

                <!-- Welcome Message Card -->
                <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(56, 189, 248, 0.2); border-radius: 8px; padding: 20px; margin-bottom: 28px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);">
                    <p style="margin: 0 0 12px 0; font-size: 15px; color: #e2e8f0; line-height: 1.6;">
                        Hello <strong style="color: #38bdf8;">{esc_name}</strong>,
                    </p>
                    <p style="margin: 0; font-size: 14px; color: #cbd5e1; line-height: 1.6;">
                        Thank you for connecting with SAKRA VISION. We have successfully cataloged your project inquiry and generated a client pipeline entry. Our core team will evaluate your technical specifications and contact you shortly.
                    </p>
                </div>

                <!-- 3D HUD Parameter Cards (2x2 Grid using table) -->
                <h3 style="color: #38bdf8; font-size: 12px; letter-spacing: 1.5px; margin: 0 0 12px 0; text-transform: uppercase;">[ PROJECT SPECIFICATION METRICS ]</h3>
                
                <table style="width: 100%; border-collapse: separate; border-spacing: 10px; margin-bottom: 24px; margin-left: -10px; margin-right: -10px;">
                    <tr>
                        <td style="width: 50%; background: #0f172a; border-top: 1px solid #38bdf8; border-bottom: 3px solid #020617; border-left: 1px solid rgba(56,189,248,0.15); border-right: 1px solid rgba(56,189,248,0.15); border-radius: 6px; padding: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                            <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">PROJECT TYPE</span>
                            <span style="font-size: 13px; color: #38bdf8; font-weight: bold;">{esc_project}</span>
                        </td>
                        <td style="width: 50%; background: #0f172a; border-top: 1px solid #a78bfa; border-bottom: 3px solid #020617; border-left: 1px solid rgba(167,139,250,0.15); border-right: 1px solid rgba(167,139,250,0.15); border-radius: 6px; padding: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                            <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">BUDGET RANGE</span>
                            <span style="font-size: 13px; color: #a78bfa; font-weight: bold;">{esc_budget}</span>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" style="background: #0f172a; border-top: 1px solid #10b981; border-bottom: 3px solid #020617; border-left: 1px solid rgba(16,185,129,0.15); border-right: 1px solid rgba(16,185,129,0.15); border-radius: 6px; padding: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                            <span style="font-size: 9px; color: #64748b; display: block; text-transform: uppercase; font-weight: bold; margin-bottom: 4px;">EXPECTED TIMELINE</span>
                            <span style="font-size: 13px; color: #10b981; font-weight: bold;">{esc_timeline}</span>
                        </td>
                    </tr>
                </table>

                <!-- Glowing Terminal Window for Message -->
                <div style="background: #030712; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; overflow: hidden; box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.9);">
                    <!-- Terminal Header -->
                    <div style="background: #0f172a; border-bottom: 1px solid rgba(56, 189, 248, 0.2); padding: 8px 14px; font-size: 10px; color: #64748b; font-family: monospace;">
                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #ef4444; margin-right: 6px;"></span>
                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #eab308; margin-right: 6px;"></span>
                        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #22c55e; margin-right: 12px;"></span>
                        client_message_payload.log
                    </div>
                    <!-- Terminal Content -->
                    <div style="padding: 16px; font-family: monospace; font-size: 12px; line-height: 1.6; color: #38bdf8;">
                        <span style="color: #64748b;">$ cat inquiry_message.txt</span><br/>
                        <div style="color: #e2e8f0; margin-top: 8px; white-space: pre-wrap;">{esc_message}</div>
                    </div>
                </div>

                <!-- Footer Badge -->
                <div style="margin-top: 32px; border-top: 1px solid rgba(56, 189, 248, 0.2); padding-top: 20px; text-align: center;">
                    <p style="font-size: 12px; font-style: italic; color: #94a3b8; margin: 0 0 10px 0;">
                        "Engineering Intelligence Into Reality"
                    </p>
                    <p style="font-size: 10px; color: #64748b; letter-spacing: 1px; margin: 0; font-family: monospace;">
                        SAKRA VISION LABORATORY // DEEP-TECH INTEGRATED SYSTEMS
                    </p>
                </div>
                
            </div>
        </div>
    </div>
    """
    
    payload = {
        "from": settings.RESEND_FROM_EMAIL,
        "to": [email],
        "subject": subject,
        "html": html_content
    }
    
    return await send_email_via_resend(payload)
