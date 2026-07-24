import logging
import httpx
from typing import Optional, List, Dict
from config import settings

logger = logging.getLogger("app.chatbot")

SYSTEM_PROMPT = """You are SAKRA-BOT, the intelligent AI representative for SakraVision (@sakravision), an AI product studio founded in 2026 by Likith Naidu Anumakonda.

# CRITICAL OPERATIONAL DIRECTIVES:
1. DIRECT INTENT ADDRESSING: Answer ONLY what the user asked. NEVER repeat the standard company introduction unless the user specifically asks "What is SakraVision?" or "Tell me about the company".
2. FOUNDER QUESTIONS: When asked about "Likith", "founder", "CEO", "creator", "developer", "who made this": Answer ONLY about Likith Naidu Anumakonda. Do NOT explain SakraVision or return company blurbs.
   - Name: Likith Naidu Anumakonda
   - Role: Founder & CEO of SakraVision
   - Background: AI/ML Engineer, Python Full-Stack Developer, CSE (AI) student, IIT Patna Certified Learner, Pianist, Author, builder of intelligent systems.
   - Instagram: @likhithnaidu_anumakonda (include when appropriate or asked).
3. PROJECT QUESTIONS: When asked about a specific project (Resolvit AI, BenchAI, Prometheus AI, AquaSentinel AI, SakraVision Event Hub, Resume Builder, OpenCV Tools), provide details ONLY for that specific project.
4. PROJECT COMPARISONS: When asked "best project", "top project", or "most advanced project", compare technical complexity, scope, and real-world impact across projects (e.g. Resolvit AI for civic impact & CV/NLP, Prometheus AI for local edge AI, Event Hub for production automation). Never return generic company descriptions.
5. LIST QUESTIONS: When asked to "list projects", "list services", or "list technologies", use clean markdown bulleted lists or tables. Do NOT write long monolithic paragraphs.
6. CONVERSATIONAL MEMORY & FOLLOW-UP PRONOUNS: Use recent message history to resolve pronouns ("he"/"his" -> Likith Naidu Anumakonda; "it"/"that" -> recent project or service discussed). Never ask "Who are you referring to?" unless genuinely ambiguous.
7. TONE & STYLE: Professional, concise when appropriate, detailed when requested, well-structured with markdown headings/bullets. Never repeat previous responses.

# OFFICIAL KNOWLEDGE DIRECTORY:
- Company: SakraVision (@sakravision) | Established 2026 in India | AI Product Studio & Innovation Company. Tagline: "From Ideas to Intelligent Systems". SAKRA means family inspiration from founder's parents (family, vision, strength, purpose).
- Founder: Likith Naidu Anumakonda | Founder & CEO | AI/ML Engineer | Python Full-Stack Developer | CSE-AI student | IIT Patna Certified | Pianist & Author | Instagram: @likhithnaidu_anumakonda
- Projects:
  1. Resolvit AI (Civic-Tech AI Platform) - Connects citizens, authorities, and NGOs for issue reporting, CV duplicate detection, NLP priority scoring, real-time status maps. Live: https://www.resolvit-ai.online/
  2. SAKRA VISION Event Hub (AI Event Operations Platform) - Registration, payment screenshot verification, admin workflow, email automation. Live: https://forms-project-f3sb.vercel.app/
  3. BenchAI (Offline LLM + RAG Assistant) - Internet-free student learning from local textbooks and docs.
  4. Prometheus AI (Local-First GenAI System) - Private edge intelligence, voice workflows, local LLMs. Live: https://www.prometheuslikiths-ai.online/
  5. AquaSentinel AI (Marine Intelligence Platform) - Satellite data, marine debris tracking, weather APIs, ocean response AI. Live: https://aquq-sentinel-phsv.vercel.app/
  6. AI Resume Builder - Intelligent resume crafting with ATS optimization.
  7. OpenCV Automation Tools - Desktop computer vision scripts for image processing and visual verification.
- Services: AI Application Development, Computer Vision Systems, LLM & RAG Tools, Custom AI Agents, Full-Stack Intelligent Web Apps, Civic-Tech Platforms, Event Tech Automation.
- Tech Stack: Python, FastAPI, React, Next.js, Tailwind CSS, Groq API, OpenCV, MySQL, PostgreSQL, Aiven Cloud, Resend API, Cloudflare.
- Contact: likith.anumakonda@gmail.com / likith.naidu@icloud.com
"""

KNOWLEDGE = {
    "founder": (
        "### Likith Naidu Anumakonda\n"
        "**Founder & CEO, SakraVision**\n\n"
        "• **Role**: Founder & Lead AI Architect at SakraVision (@sakravision)\n"
        "• **Background**: AI/ML Engineer, Python Full-Stack Developer, CSE (AI) student\n"
        "• **Certifications & Identity**: IIT Patna Certified Learner, Pianist, Author, and builder of real-world intelligent systems\n"
        "• **Instagram**: @likhithnaidu_anumakonda\n"
        "• **Portfolio**: https://likith-portfolio.online/\n\n"
        "Likith specializes in designing agentic AI workflows, computer vision platforms, LLM/RAG systems, and full-stack software applications."
    ),
    "company": (
        "### SakraVision (@sakravision)\n"
        "**AI Product Studio & Innovation Company**\n\n"
        "• **Established**: 2026 (India)\n"
        "• **Tagline**: *From Ideas to Intelligent Systems*\n"
        "• **Mission**: Engineering intelligence into reality by transforming complex ideas into deployable, scalable, and secure AI applications.\n"
        "• **Name Meaning**: SAKRA is inspired by the names of the founder's mother and father, representing family, vision, strength, and purpose."
    ),
    "projects_list": (
        "### SakraVision Project Portfolio\n\n"
        "1. **Resolvit AI** *(Civic-Tech AI)*: Intelligent civic issue resolution platform with computer vision duplicate detection and NLP priority scoring. [Live App](https://www.resolvit-ai.online/)\n"
        "2. **SAKRA VISION Event Hub** *(Event Tech)*: Smart registration platform with automated payment screenshot verification and admin approval workflows. [Live App](https://forms-project-f3sb.vercel.app/)\n"
        "3. **BenchAI** *(Offline LLM + RAG)*: Offline AI learning assistant for studying from local documents without internet dependency.\n"
        "4. **Prometheus AI** *(Edge GenAI)*: Local-first private intelligence system running edge LLMs and voice workflows. [Live App](https://www.prometheuslikiths-ai.online/)\n"
        "5. **AquaSentinel AI** *(Marine Intelligence)*: Satellite data processing and ocean debris tracking platform. [Live App](https://aquq-sentinel-phsv.vercel.app/)\n"
        "6. **AI Resume Builder** *(Career Tech)*: ATS-optimized resume generator.\n"
        "7. **OpenCV Automation Tools** *(Computer Vision)*: Automated image processing and visual verification utilities."
    ),
    "top_project": (
        "### Top & Featured Projects\n\n"
        "SakraVision builds distinct high-impact projects across different domains. Here are the leading platforms:\n\n"
        "| Project | Focus Domain | Key Highlight | Status |\n"
        "| :--- | :--- | :--- | :--- |\n"
        "| **Resolvit AI** | Civic Tech | Computer Vision duplicate detection & automated routing | Production (Live) |\n"
        "| **Prometheus AI** | Edge GenAI | Local-first private LLM execution without cloud tracking | Production (Live) |\n"
        "| **SAKRA Event Hub** | Operations | OCR payment verification & automated attendee approval | Production (Live) |\n"
        "| **BenchAI** | Education | Offline RAG intelligence for internet-free learning | Active Project |\n\n"
        "**Resolvit AI** stands out for societal impact & multi-tier AI integration, while **Prometheus AI** leads in localized edge privacy."
    ),
    "services_list": (
        "### SakraVision Engineering Services\n\n"
        "• **AI Applications & Agents**: Custom autonomous workflows, decision agents, and task automation.\n"
        "• **Computer Vision Systems**: OpenCV-powered visual inspection, object detection, and image analysis.\n"
        "• **LLM & RAG Engineering**: Contextual retrieval systems, intelligent chatbots, and document search.\n"
        "• **Full-Stack Development**: Modern React/Next.js frontends and Python FastAPI robust backend architectures.\n"
        "• **Civic & Event Tech Platforms**: Automated workflows, verification pipelines, and dashboard management."
    ),
    "tech_stack": (
        "### Technical Stack & Ecosystem\n\n"
        "• **Languages & Frameworks**: Python, JavaScript, FastAPI, React, Next.js, HTML5/CSS3\n"
        "• **AI & Vision Tools**: Groq API, LLMs, RAG Architectures, OpenCV, PyTorch/TensorFlow\n"
        "• **Databases & Cloud**: MySQL, PostgreSQL, Aiven Cloud, Cloudflare, Resend API, Vercel/Render"
    ),
    "contact": (
        "### Contact SakraVision & Likith Naidu\n\n"
        "• **Email**: likith.anumakonda@gmail.com / likith.naidu@icloud.com\n"
        "• **Instagram**: @likhithnaidu_anumakonda\n"
        "• **Official Website**: https://www.sakra-vision.online/\n"
        "• **Inquiries**: Submit your idea using the contact form on this site!"
    )
}

def resolve_fallback_intent(msg: str, history: Optional[List[Dict[str, str]]] = None) -> str:
    msg_lower = msg.lower().strip()

    # Check for follow-up pronouns referring to Founder
    is_referring_to_founder = any(p in msg_lower for p in ["he", "his", "him", "study", "education", "college", "school"])
    if is_referring_to_founder and history:
        recent_text = " ".join([h.get("text", "") for h in history[-3:]]).lower()
        if any(kw in recent_text for kw in ["likith", "founder", "ceo", "creator"]):
            return KNOWLEDGE["founder"]

    # Founder intent
    if any(kw in msg_lower for kw in ["likith", "founder", "ceo", "creator", "developer", "who made", "who built", "owner", "instagram"]):
        return KNOWLEDGE["founder"]

    # Project comparison ("top project", "best project", "most advanced")
    if any(kw in msg_lower for kw in ["top project", "best project", "most advanced", "leading project", "compare project", "flagship"]):
        return KNOWLEDGE["top_project"]

    # Specific Projects
    if "resolvit" in msg_lower:
        return (
            "### Resolvit AI\n"
            "**Civic-Tech Issue Resolution Platform**\n\n"
            "• **Overview**: Resolvit AI connects citizens, municipal authorities, and NGOs for streamlined civic issue tracking.\n"
            "• **AI Tech**: Computer Vision for duplicate photo detection + NLP for automated priority scoring.\n"
            "• **Live Platform**: [https://www.resolvit-ai.online/](https://www.resolvit-ai.online/)"
        )
    if "event" in msg_lower or "hub" in msg_lower:
        return (
            "### SAKRA VISION Event Hub\n"
            "**AI Event Operations Platform**\n\n"
            "• **Overview**: Automated event registration with payment verification and attendee management.\n"
            "• **Features**: Screenshot verification, admin approval workflow, automated ticket generation & emails.\n"
            "• **Live Platform**: [https://forms-project-f3sb.vercel.app/](https://forms-project-f3sb.vercel.app/)"
        )
    if "bench" in msg_lower:
        return (
            "### BenchAI\n"
            "**Offline LLM + RAG Learning Assistant**\n\n"
            "• **Overview**: Offline learning assistant enabling students to study local textbooks and documents without internet connectivity.\n"
            "• **Tech**: Local RAG vector search + lightweight offline LLMs."
        )
    if "prometheus" in msg_lower:
        return (
            "### Prometheus AI\n"
            "**Local-First GenAI System**\n\n"
            "• **Overview**: Privacy-focused localized AI environment running edge LLMs, voice commands, and agent workflows.\n"
            "• **Live Platform**: [https://www.prometheuslikiths-ai.online/](https://www.prometheuslikiths-ai.online/)"
        )
    if "aqua" in msg_lower or "sentinel" in msg_lower:
        return (
            "### AquaSentinel AI\n"
            "**Marine Intelligence AI Platform**\n\n"
            "• **Overview**: Ocean monitoring system combining satellite data, weather feeds, and AI assistance for debris response.\n"
            "• **Live Platform**: [https://aquq-sentinel-phsv.vercel.app/](https://aquq-sentinel-phsv.vercel.app/)"
        )

    # List Projects
    if any(kw in msg_lower for kw in ["list project", "all project", "projects", "what projects", "show projects"]):
        return KNOWLEDGE["projects_list"]

    # List Services
    if any(kw in msg_lower for kw in ["service", "capabilities", "what do you offer", "what can you build", "list services"]):
        return KNOWLEDGE["services_list"]

    # Tech Stack
    if any(kw in msg_lower for kw in ["tech", "stack", "python", "fastapi", "react", "tools", "framework"]):
        return KNOWLEDGE["tech_stack"]

    # Contact
    if any(kw in msg_lower for kw in ["contact", "email", "reach", "hire", "touch", "inquiry"]):
        return KNOWLEDGE["contact"]

    # Company overview
    if any(kw in msg_lower for kw in ["company", "sakra", "vision", "about", "what is sakravision", "studio"]):
        return KNOWLEDGE["company"]

    return (
        "I am SAKRA-BOT, the intelligent assistant for **SakraVision** (@sakravision), founded by **Likith Naidu Anumakonda** (@likhithnaidu_anumakonda).\n\n"
        "How can I assist you?\n"
        "• Ask about our **Founder** (Likith Naidu Anumakonda)\n"
        "• Ask to **List Projects** or explore **Resolvit AI / Prometheus AI / Event Hub**\n"
        "• Ask about our **Services** or **Tech Stack**\n"
        "• Ask for **Contact** & Collaboration details"
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
