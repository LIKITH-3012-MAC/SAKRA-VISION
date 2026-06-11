import re

# SAKRA VISION Knowledge Base definition
sakra_knowledge = {
    "company": (
        "SAKRA VISION is an AI product studio established in 2026 by Likith Naidu Anumakonda. "
        "We build practical intelligent systems using Artificial Intelligence, Machine Learning, Computer Vision, LLMs, RAG, automation, AI agents, and full-stack web technologies. "
        "Our goal is simple: convert powerful ideas into useful, deployable, secure, and scalable real-world products."
    ),
    "founder": (
        "SAKRA VISION was established in 2026 by Likith Naidu Anumakonda. He is an AI/ML Engineer, "
        "Python Full-Stack Developer, CSE-AI student, IIT Patna Certified learner, pianist, "
        "author, and builder of real-world intelligent systems."
    ),
    "services": (
        "SAKRA VISION builds AI applications, LLM/RAG systems, computer vision tools, "
        "automation systems, full-stack products, civic-tech platforms, event automation systems, and AI agents."
    ),
    "projects": (
        "Some major SAKRA VISION projects include Resolvit AI, SAKRA VISION Event Hub, "
        "BenchAI, Prometheus AI, AquaSentinel AI, and Python GUI Utility."
    ),
    "contact": (
        "You can contact SAKRA VISION through the project inquiry form or email likith.anumakonda@gmail.com / likith.naidu@icloud.com."
    ),
    "pricing": (
        "Pricing depends on the project type, complexity, timeline, integrations, and deployment needs. "
        "You can submit the contact form with your idea, and SAKRA VISION will review it."
    ),
    "fallback": (
        "I can help you learn about SAKRA VISION, its founder, services, projects, tech stack, "
        "and contact details. For specific collaboration or project requests, please submit the contact form."
    )
}

def get_chatbot_reply(message: str) -> str:
    if not message:
        return sakra_knowledge["fallback"]
        
    msg = message.lower().strip()
    
    # Company Intent Keywords
    company_keywords = ["sakra", "company", "what do you do", "about", "vision"]
    if any(kw in msg for kw in company_keywords):
        return sakra_knowledge["company"]
        
    # Founder Intent Keywords
    founder_keywords = ["founder", "likith", "ceo", "owner", "who made"]
    if any(kw in msg for kw in founder_keywords):
        return sakra_knowledge["founder"]
        
    # Services Intent Keywords
    services_keywords = ["service", "build", "offer", "develop", "work"]
    if any(kw in msg for kw in services_keywords):
        return sakra_knowledge["services"]
        
    # Projects Intent Keywords
    projects_keywords = ["project", "portfolio", "product", "resolvit", "bench", "prometheus", "aqua", "gui", "utility", "desktop"]
    if any(kw in msg for kw in projects_keywords):
        return sakra_knowledge["projects"]
        
    # Contact Intent Keywords
    contact_keywords = ["contact", "email", "reach", "connect", "hire"]
    if any(kw in msg for kw in contact_keywords):
        return sakra_knowledge["contact"]
        
    # Pricing Intent Keywords
    pricing_keywords = ["price", "cost", "budget", "charge", "payment"]
    if any(kw in msg for kw in pricing_keywords):
        return sakra_knowledge["pricing"]
        
    # Fallback
    return sakra_knowledge["fallback"]
