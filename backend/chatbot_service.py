import logging
import httpx
from typing import Optional, List, Dict
from config import settings

logger = logging.getLogger("app.chatbot")

SYSTEM_PROMPT = """You are SAKRA-BOT, the intelligent AI assistant representing SakraVision (@sakravision), an AI product studio founded in 2026 by Likith Naidu Anumakonda.

# CRITICAL OPERATIONAL DIRECTIVES:
1. DIRECT INTENT ADDRESSING: Answer ONLY what the user asked. NEVER repeat the generic company introduction unless specifically asked "What is SakraVision?" or "Tell me about the company".
2. INSTAGRAM & SOCIAL MEDIA: When asked for Instagram, social media, handles, or contact info:
   - Founder Instagram: @likhithnaidu_anumakonda (URL: https://www.instagram.com/likhithnaidu_anumakonda)
   - Official Brand Identifier: @sakravision
3. HOW TO START A PROJECT: When asked "How can I start a project?", "How to hire", "Collaborate", or "Build a project":
   - Explain how to submit an inquiry via the website contact form or directly email Likith Naidu Anumakonda (likith.anumakonda@gmail.com / likith.naidu@icloud.com) or message on Instagram (@likhithnaidu_anumakonda).
4. FOUNDER QUESTIONS: When asked about "Likith", "founder", "CEO", "creator", "developer":
   - Name: Likith Naidu Anumakonda (Founder & CEO of SakraVision)
   - Background: AI/ML Engineer, Python Full-Stack Developer, CSE (AI) student, IIT Patna Certified Learner, Pianist, Author.
   - Instagram: @likhithnaidu_anumakonda
5. FOLLOW-UP QUESTIONS & SHORT PROMPTS ("more", "tell me more", "where did he study?"): Look at recent message history to resolve the subject and expand on the previous topic. Never return generic fallback for follow-up questions.
6. FORMATTING: Use markdown headers, bullet lists, short paragraphs, and clickable markdown links.

# OFFICIAL KNOWLEDGE DIRECTORY:
- Company: SakraVision (@sakravision) | AI Product Studio & Innovation Company (Est. 2026, India). Tagline: "From Ideas to Intelligent Systems".
- Founder: Likith Naidu Anumakonda | Founder & CEO | AI/ML Engineer | Python Full-Stack Developer | CSE-AI student | IIT Patna Certified | Pianist & Author | Instagram: @likhithnaidu_anumakonda
- Projects:
  1. Resolvit AI (Civic-Tech AI Platform) - Duplicate photo detection & NLP priority scoring. Live: https://www.resolvit-ai.online/
  2. SAKRA VISION Event Hub (AI Event Platform) - Payment screenshot verification & admin approval. Live: https://forms-project-f3sb.vercel.app/
  3. BenchAI (Offline LLM + RAG Assistant) - Internet-free student study assistant.
  4. Prometheus AI (Local GenAI System) - Private edge intelligence & voice workflows. Live: https://www.prometheuslikiths-ai.online/
  5. AquaSentinel AI (Marine Intelligence) - Satellite data & ocean debris tracking. Live: https://aquq-sentinel-phsv.vercel.app/
  6. AI Resume Builder - ATS-optimized resume tool.
  7. OpenCV Automation Tools - Visual verification desktop scripts.
- Contact: likith.anumakonda@gmail.com / likith.naidu@icloud.com | Instagram: @likhithnaidu_anumakonda
"""

KNOWLEDGE = {
    "founder": (
        "### Likith Naidu Anumakonda\n"
        "**Founder & CEO, SakraVision**\n\n"
        "• **Role**: Founder & Lead AI Architect at SakraVision (@sakravision)\n"
        "• **Background**: AI/ML Engineer, Python Full-Stack Developer, CSE (AI) student\n"
        "• **Identity & Credentials**: IIT Patna Certified Learner, Pianist, Author, builder of intelligent systems\n"
        "• **Instagram**: **@likhithnaidu_anumakonda** ([https://www.instagram.com/likhithnaidu_anumakonda](https://www.instagram.com/likhithnaidu_anumakonda))\n"
        "• **Portfolio**: [https://likith-portfolio.online/](https://likith-portfolio.online/)"
    ),
    "instagram": (
        "### SakraVision & Founder Instagram / Social Handles\n\n"
        "• **Founder Instagram**: **@likhithnaidu_anumakonda**  \n"
        "  [https://www.instagram.com/likhithnaidu_anumakonda](https://www.instagram.com/likhithnaidu_anumakonda)\n"
        "• **Official Brand Identifier**: **@sakravision**\n"
        "• **Founder Portfolio**: [https://likith-portfolio.online/](https://likith-portfolio.online/)\n"
        "• **GitHub**: [https://github.com/LIKITH-3012-MAC](https://github.com/LIKITH-3012-MAC)\n"
        "• **LinkedIn**: [https://in.linkedin.com/in/likith-naidu-anumakonda-33a347327](https://in.linkedin.com/in/likith-naidu-anumakonda-33a347327)"
    ),
    "start_project": (
        "### How to Start a Project with SakraVision\n\n"
        "Starting a project with us is quick and seamless:\n\n"
        "1. **Website Inquiry**: Scroll down to our **Contact Form** on the homepage and submit your project requirements, target timeline, and budget.\n"
        "2. **Direct Email**: Email founder Likith Naidu Anumakonda directly at:\n"
        "   • **likith.anumakonda@gmail.com**\n"
        "   • **likith.naidu@icloud.com**\n"
        "3. **Instagram DM**: Connect on Instagram: **@likhithnaidu_anumakonda** ([https://www.instagram.com/likhithnaidu_anumakonda](https://www.instagram.com/likhithnaidu_anumakonda))\n\n"
        "We will evaluate your project requirements and share a customized technical roadmap & proposal!"
    ),
    "company": (
        "### SakraVision (@sakravision)\n"
        "**AI Product Studio & Innovation Company**\n\n"
        "• **Established**: 2026 (India)\n"
        "• **Tagline**: *From Ideas to Intelligent Systems*\n"
        "• **Mission**: Engineering intelligence into reality by building deployable, secure, and scalable real-world AI applications.\n"
        "• **Name Meaning**: SAKRA represents family inspiration from the founder's mother and father (family, vision, strength, purpose)."
    ),
    "projects_list": (
        "### SakraVision Project Portfolio\n\n"
        "1. **Resolvit AI** *(Civic-Tech AI)*: Intelligent issue resolution platform with computer vision duplicate detection & NLP priority scoring. [Live App](https://www.resolvit-ai.online/)\n"
        "2. **SAKRA VISION Event Hub** *(Event Operations)*: Automated event registration & payment screenshot verification. [Live App](https://forms-project-f3sb.vercel.app/)\n"
        "3. **BenchAI** *(Offline LLM + RAG)*: Offline learning assistant for students studying from local documents without internet.\n"
        "4. **Prometheus AI** *(Edge GenAI)*: Private localized intelligence running edge LLMs and voice workflows. [Live App](https://www.prometheuslikiths-ai.online/)\n"
        "5. **AquaSentinel AI** *(Marine Intelligence)*: Satellite tracking & ocean debris monitoring platform. [Live App](https://aquq-sentinel-phsv.vercel.app/)\n"
        "6. **AI Resume Builder** *(Career Tech)*: ATS-optimized resume creation tool.\n"
        "7. **OpenCV Automation Tools** *(Computer Vision)*: Automated visual verification utilities."
    ),
    "services_list": (
        "### SakraVision Engineering Services\n\n"
        "• **AI Applications & Agents**: Custom autonomous decision workflows & AI agents.\n"
        "• **Computer Vision Systems**: OpenCV-powered visual inspection, object detection, and tracking.\n"
        "• **LLM & RAG Engineering**: Contextual retrieval systems, document search, and intelligent assistants.\n"
        "• **Full-Stack Development**: Modern React/Next.js frontends and Python FastAPI backends.\n"
        "• **Civic & Event Tech**: Custom workflow platforms and dashboard automation."
    ),
    "tech_stack": (
        "### Technical Stack & Ecosystem\n\n"
        "• **Languages & Frameworks**: Python, JavaScript, FastAPI, React, Next.js, HTML5/CSS3\n"
        "• **AI & Vision**: Groq API, LLMs, RAG Architectures, OpenCV, PyTorch/TensorFlow\n"
        "• **Cloud & Databases**: MySQL, PostgreSQL, Aiven Cloud, Cloudflare, Resend API, Vercel/Render"
    ),
    "contact": (
        "### Contact SakraVision & Founder Likith Naidu\n\n"
        "• **Email**: likith.anumakonda@gmail.com / likith.naidu@icloud.com\n"
        "• **Instagram**: **@likhithnaidu_anumakonda** ([https://www.instagram.com/likhithnaidu_anumakonda](https://www.instagram.com/likhithnaidu_anumakonda))\n"
        "• **Brand Identifier**: **@sakravision**\n"
        "• **Website**: https://www.sakra-vision.online/\n"
        "• **Inquiries**: Submit your idea using the contact form on this page!"
    )
}

def resolve_fallback_intent(msg: str, history: Optional[List[Dict[str, str]]] = None) -> str:
    msg_lower = msg.lower().strip()

    # Instagram & Social queries
    if any(kw in msg_lower for kw in ["insta", "instagram", "handle", "social", "follow", "dm"]):
        return KNOWLEDGE["instagram"]

    # Start project / How to start / Hire / Inquiry queries
    if any(kw in msg_lower for kw in ["start a project", "start project", "how to start", "build a project", "how can i start", "hire", "collaborate", "work together", "submit project", "inquiry", "get started"]):
        return KNOWLEDGE["start_project"]

    # Follow-up prompts ("more", "tell me more", "explain more", "details")
    if msg_lower in ["more", "tell me more", "details", "explain more", "go on", "what else"] and history:
        recent_text = " ".join([h.get("text", "") for h in history[-3:]]).lower()
        if "project" in recent_text or "resolvit" in recent_text or "prometheus" in recent_text:
            return KNOWLEDGE["projects_list"]
        if "likith" in recent_text or "founder" in recent_text:
            return KNOWLEDGE["founder"]
        if "service" in recent_text:
            return KNOWLEDGE["services_list"]

    # Check for follow-up pronouns referring to Founder
    if any(p in msg_lower for p in ["he", "his", "him", "study", "education", "college", "school"]) and history:
        recent_text = " ".join([h.get("text", "") for h in history[-3:]]).lower()
        if any(kw in recent_text for kw in ["likith", "founder", "ceo", "creator"]):
            return KNOWLEDGE["founder"]

    # Founder intent
    if any(kw in msg_lower for kw in ["likith", "founder", "ceo", "creator", "developer", "who made", "who built", "owner"]):
        return KNOWLEDGE["founder"]

    # Specific Projects
    if "resolvit" in msg_lower:
        return (
            "### Resolvit AI\n"
            "**Civic-Tech Issue Resolution Platform**\n\n"
            "• **Overview**: Resolvit AI connects citizens, municipal authorities, and NGOs for issue tracking.\n"
            "• **AI Tech**: Computer Vision for duplicate photo detection + NLP for priority scoring.\n"
            "• **Live Platform**: [https://www.resolvit-ai.online/](https://www.resolvit-ai.online/)"
        )
    if "event" in msg_lower or "hub" in msg_lower:
        return (
            "### SAKRA VISION Event Hub\n"
            "**AI Event Operations Platform**\n\n"
            "• **Overview**: Automated event registration with payment verification and attendee management.\n"
            "• **Live Platform**: [https://forms-project-f3sb.vercel.app/](https://forms-project-f3sb.vercel.app/)"
        )
    if "bench" in msg_lower:
        return (
            "### BenchAI\n"
            "**Offline LLM + RAG Learning Assistant**\n\n"
            "• **Overview**: Offline learning assistant enabling students to study local documents without internet."
        )
    if "prometheus" in msg_lower:
        return (
            "### Prometheus AI\n"
            "**Local-First GenAI System**\n\n"
            "• **Overview**: Privacy-focused localized AI environment running edge LLMs and voice commands.\n"
            "• **Live Platform**: [https://www.prometheuslikiths-ai.online/](https://www.prometheuslikiths-ai.online/)"
        )
    if "aqua" in msg_lower or "sentinel" in msg_lower:
        return (
            "### AquaSentinel AI\n"
            "**Marine Intelligence AI Platform**\n\n"
            "• **Overview**: Satellite data processing and ocean debris tracking platform.\n"
            "• **Live Platform**: [https://aquq-sentinel-phsv.vercel.app/](https://aquq-sentinel-phsv.vercel.app/)"
        )

    # List Projects / Top Project
    if any(kw in msg_lower for kw in ["top project", "best project", "most advanced", "leading project", "compare project", "flagship"]):
        return KNOWLEDGE["top_project"]
    if any(kw in msg_lower for kw in ["list project", "all project", "projects", "what projects", "show projects"]):
        return KNOWLEDGE["projects_list"]

    # Services / Tech Stack / Contact
    if any(kw in msg_lower for kw in ["service", "capabilities", "what do you offer", "what can you build", "list services"]):
        return KNOWLEDGE["services_list"]
    if any(kw in msg_lower for kw in ["tech", "stack", "python", "fastapi", "react", "tools", "framework"]):
        return KNOWLEDGE["tech_stack"]
    if any(kw in msg_lower for kw in ["contact", "email", "reach", "touch", "inquiry"]):
        return KNOWLEDGE["contact"]

    # Company overview
    if any(kw in msg_lower for kw in ["company", "sakra", "vision", "about", "what is sakravision", "studio"]):
        return KNOWLEDGE["company"]

    return (
        "I am SAKRA-BOT, intelligent assistant for **SakraVision** (@sakravision), founded by **Likith Naidu Anumakonda** (@likhithnaidu_anumakonda).\n\n"
        "How can I help you?\n"
        "• **Start a Project**: Ask *'How can I start a project?'*\n"
        "• **Founder & Instagram**: Ask for *'Founder'* or *'Instagram'* (@likhithnaidu_anumakonda)\n"
        "• **Projects**: Ask to *'List projects'* or explore *Resolvit AI / Prometheus AI / Event Hub*\n"
        "• **Services & Contact**: Ask about our *Services*, *Tech Stack*, or *Contact email*"
    )

async def get_chatbot_reply(message: str, history: Optional[List[Dict[str, str]]] = None) -> str:
    if not message:
        return resolve_fallback_intent("", history)

    # 1. Groq LLM Execution with Full Context Memory
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip():
        try:
            formatted_messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            
            # Format preceding conversation context (up to last 6 messages)
            if history and isinstance(history, list):
                for item in history[-6:]:
                    sender = item.get("sender", "user")
                    text = item.get("text", "")
                    if text and isinstance(text, str):
                        role = "assistant" if sender in ["bot", "assistant"] else "user"
                        formatted_messages.append({"role": role, "content": text})

            # Append current user prompt
            formatted_messages.append({"role": "user", "content": message})

            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.GROQ_API_KEY.strip()}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "llama-3.3-70b-versatile",
                        "messages": formatted_messages,
                        "temperature": 0.5,
                        "max_tokens": 600
                    }
                )
                if res.status_code == 200:
                    data = res.json()
                    reply = data["choices"][0]["message"]["content"]
                    if reply and reply.strip():
                        return reply.strip()
                else:
                    logger.warning(f"Groq API status {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Groq API execution failed: {e}")

    # 2. Rule-based / Intent-driven fallback with context
    history_dicts = []
    if history and isinstance(history, list):
        for h in history:
            if hasattr(h, "dict"):
                history_dicts.append(h.dict())
            elif isinstance(h, dict):
                history_dicts.append(h)

    return resolve_fallback_intent(message, history_dicts)
