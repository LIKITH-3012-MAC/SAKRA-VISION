import logging
import httpx
from config import settings

logger = logging.getLogger("app.chatbot")

# SAKRA VISION Knowledge Base definition
sakra_knowledge = {
    "company": (
        "SAKRA VISION (@sakravision) is an AI product studio established in 2026 by Likith Naidu. "
        "We build practical intelligent systems using Artificial Intelligence, Machine Learning, Computer Vision, LLMs, RAG, automation, AI agents, and full-stack web technologies. "
        "Our goal is simple: convert powerful ideas into useful, deployable, secure, and scalable real-world products."
    ),
    "founder": (
        "SAKRA VISION was established in 2026 by Likith Naidu (Instagram: @likhithnaidu_anumakonda). He is an AI/ML Engineer, "
        "Python Full-Stack Developer, CSE-AI student, IIT Patna Certified learner, pianist, "
        "author, and builder of real-world intelligent systems."
    ),
    "services": (
        "SAKRA VISION offers AI application development, LLM & RAG tools, computer vision systems, "
        "automation platforms, full-stack products, civic-tech platforms, event automation, and custom AI agents."
    ),
    "projects": (
        "Key SAKRA VISION projects include:\n"
        "• Resolvit AI - Civic-tech resolution platform (https://www.resolvit-ai.online/)\n"
        "• SAKRA VISION Event Hub - AI event registration system\n"
        "• BenchAI - Offline LLM + RAG learning assistant\n"
        "• Prometheus AI - Local-first GenAI system\n"
        "• AquaSentinel AI - Marine intelligence AI platform\n"
        "• Python GUI Utility - Desktop automation tools"
    ),
    "contact": (
        "You can contact SakraVision & founder Likith Naidu via email at likith.anumakonda@gmail.com / likith.naidu@icloud.com, "
        "or by submitting the project inquiry form on our website."
    ),
    "pricing": (
        "Pricing is customized based on project requirements, architecture complexity, timeline, and deployment needs. "
        "Submit a project inquiry on our site to receive an estimate."
    ),
    "fallback": (
        "I am SAKRA-BOT, your intelligent assistant for SakraVision (@sakravision), founded by Likith Naidu (Instagram: @likhithnaidu_anumakonda). "
        "I can help you with details about our company, founder, services, projects, tech stack, and contact options. What would you like to know?"
    )
}

SYSTEM_PROMPT = """You are SAKRA-BOT, the official AI assistant for SakraVision (@sakravision), an AI product studio founded in 2026 by Likith Naidu (Instagram: @likhithnaidu_anumakonda).

Key Information:
- Company Name: SakraVision
- Brand Identifier: @sakravision
- Founder / Developer: Likith Naidu (Instagram: @likhithnaidu_anumakonda)
- Email: likith.anumakonda@gmail.com / likith.naidu@icloud.com
- Services: AI applications, Computer Vision, LLMs & RAG tools, AI Agents, Full-Stack Development, Automation Systems.
- Major Projects: Resolvit AI (Civic Tech), SakraVision Event Hub (Event Automation), BenchAI (Offline LLM/RAG), Prometheus AI (Local-first GenAI), AquaSentinel AI (Marine AI).

Be concise, helpful, professional, and friendly. Always maintain SakraVision and Likith Naidu branding."""

async def get_chatbot_reply(message: str) -> str:
    if not message:
        return sakra_knowledge["fallback"]

    # 1. Try Groq LLM API if key is configured
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip():
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.GROQ_API_KEY.strip()}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": [
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": message}
                        ],
                        "temperature": 0.6,
                        "max_tokens": 500
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    reply = data["choices"][0]["message"]["content"]
                    if reply and reply.strip():
                        return reply.strip()
                else:
                    logger.warning(f"Groq API returned status {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Groq API request failed: {e}")

    # 2. Knowledge-base fallback matching
    msg = message.lower().strip()

    if any(kw in msg for kw in ["founder", "likith", "ceo", "owner", "who made", "who built", "creator", "developer", "instagram"]):
        return sakra_knowledge["founder"]
    if any(kw in msg for kw in ["sakra", "company", "what do you do", "about", "vision", "studio", "brand", "sakravision"]):
        return sakra_knowledge["company"]
    if any(kw in msg for kw in ["service", "build", "offer", "develop", "work", "capabilities"]):
        return sakra_knowledge["services"]
    if any(kw in msg for kw in ["project", "portfolio", "product", "resolvit", "bench", "prometheus", "aqua", "gui", "utility"]):
        return sakra_knowledge["projects"]
    if any(kw in msg for kw in ["contact", "email", "reach", "connect", "hire", "talk", "touch"]):
        return sakra_knowledge["contact"]
    if any(kw in msg for kw in ["price", "cost", "budget", "charge", "payment", "fee"]):
        return sakra_knowledge["pricing"]

    return sakra_knowledge["fallback"]
