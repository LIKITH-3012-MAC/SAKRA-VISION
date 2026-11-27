"""
Canonical verified knowledge store, multilingual session detector,
safe arithmetic evaluator, context retriever, and offline fallback engine
for SAKRA-BOT V2.1.
"""

import ast
import operator
import re
from typing import Any, Dict, List, Optional, Tuple


# ---------------------------------------------------------------------------
# 1. VERIFIED SINGLE SOURCE OF TRUTH KNOWLEDGE BASE
# ---------------------------------------------------------------------------

ORGANIZATION: Dict[str, Any] = {
    "name": "SAKRA VISION",
    "handle": "@sakravision",
    "established": "2026",
    "country": "India",
    "tagline": "From Ideas to Intelligent Systems",
    "alt_tagline": "Engineering Intelligence Into Reality",
    "name_meaning": (
        "SAKRA is inspired by the names of founder Likith Naidu Anumakonda's mother and father, "
        "symbolizing family, vision, strength, and purpose."
    ),
    "summary": (
        "SAKRA VISION is an AI product studio and innovation company building practical, deployable intelligent "
        "systems across AI/ML applications, Computer Vision, LLMs, RAG pipelines, AI agents, workflow automation, "
        "and full-stack web software."
    ),
    "website": "https://www.sakra-vision.online/",
    "emails": ["likith.anumakonda@gmail.com", "likith.naidu@icloud.com"],
    "consultation": {
        "meet_url": "https://meet.google.com/grg-hytm-ahw",
        "hours": "Every day · 6:00 PM – 9:00 PM IST",
        "intake": "Smart Project Brief or Quick Direct Form on the Inquire page, or book a 1-on-1 slot on the Schedule Consultation page.",
    },
}

FOUNDER: Dict[str, Any] = {
    "full_name": "Likith Naidu Anumakonda",
    "role": "Founder & CEO of SAKRA VISION",
    "title": "AI/ML Engineer",
    "education": "B.Tech CSE (Artificial Intelligence) student at PBR VITS, Kavali",
    "other_pursuits": [
        "Pianist",
        'Author of "Echoes of an Unsaid Goodbye"',
    ],
    "portfolio": "https://likith-naidu-anumakonda.online/",
    "instagram": "https://www.instagram.com/likhithnaidu_anumakonda",
    "instagram_handle": "@likhithnaidu_anumakonda",
    "github": "https://github.com/LIKITH-3012-MAC",
    "linkedin": "https://in.linkedin.com/in/likith-naidu-anumakonda-33a347327",
}

PROJECTS: List[Dict[str, Any]] = [
    {
        "id": "prometheus-ai",
        "name": "Prometheus AI V2.0",
        "aliases": ["prometheus", "prometheus ai", "prometheus v2", "prometheus ai v2.0"],
        "category": "Local-First Edge GenAI System",
        "status": "Live",
        "problem": (
            "Traditional cloud voice and chat assistants send audio and prompts to third-party servers, "
            "raising privacy concerns and depending on continuous internet connectivity."
        ),
        "solution": (
            "A localized edge GenAI companion running Whisper local audio transcription, FastAPI command routing, "
            "and Ollama / Llama models with Apple MLX and edge GPU hardware acceleration."
        ),
        "capabilities": [
            "Local-first GenAI interactive terminal",
            "On-device Whisper voice transcription",
            "Ollama + Llama conversational reasoning",
            "Apple MLX / local GPU hardware acceleration",
            "Zero-data-out desktop shell and script workflows",
        ],
        "tech_stack": ["Python", "FastAPI", "Llama", "Ollama", "Whisper", "Apple MLX"],
        "live_url": "https://www.prometheuslikiths-ai.online/",
        "live_label": "Explore Prometheus AI V2.0",
        "repo_url": "https://github.com/LIKITH-3012-MAC",
    },
    {
        "id": "resolvit-ai",
        "name": "RESOLVIT AI",
        "aliases": ["resolvit", "resolvit ai", "resolvit-ai"],
        "category": "Civic-Tech Issue Resolution Platform",
        "status": "Live",
        "problem": (
            "Municipal public complaint workflows are often slow, opaque, and flooded with duplicate submissions "
            "that delay field resolution."
        ),
        "solution": (
            "A geo-tagged civic issue reporting and authority resolution platform using Computer Vision duplicate checking, "
            "NLP priority classification, PostgreSQL storage, and role-based dashboards."
        ),
        "capabilities": [
            "Citizen issue submission with photos and location coordinates",
            "Computer Vision duplicate photo inspection",
            "FastAPI backend with JWT authentication and NLP priority scoring",
            "PostgreSQL persistence paired with Google Maps spatial tracking",
            "Authority and NGO command dashboards with live resolution status updates",
        ],
        "tech_stack": ["Next.js", "FastAPI", "PostgreSQL", "Google Maps", "JWT", "Computer Vision", "NLP Classification"],
        "live_url": "https://www.resolvit-ai.online/",
        "live_label": "Explore RESOLVIT AI",
        "repo_url": "https://github.com/LIKITH-3012-MAC",
    },
    {
        "id": "bench-ai",
        "name": "BenchAI",
        "aliases": ["bench", "benchai", "bench ai", "bench-ai"],
        "category": "Offline LLM + RAG Learning Assistant",
        "status": "In Development",
        "problem": (
            "Many classrooms and students in low-connectivity regions cannot rely on cloud AI tutors due to internet dependencies "
            "and privacy constraints."
        ),
        "solution": (
            "An internet-free study terminal that ingests local textbooks, PDFs, and lecture slides using LangChain chunking, "
            "FAISS local vector search, and offline Ollama / Llama Q&A generation."
        ),
        "capabilities": [
            "100% offline document parsing (PDFs, slides, study notes)",
            "LangChain overlapping text chunking",
            "Local FAISS vector embedding index and similarity retrieval",
            "Offline Q&A via local Ollama / Llama weights",
            "Zero cloud dependency or external data leakage",
        ],
        "tech_stack": ["Python", "LangChain", "FAISS", "Ollama", "Local Llama", "RAG"],
        "live_url": None,
        "live_label": None,
        "repo_url": "https://github.com/LIKITH-3012-MAC",
    },
    {
        "id": "event-hub",
        "name": "SAKRA VISION Event Hub",
        "aliases": ["event hub", "sakra event hub", "event platform"],
        "category": "AI Event Operations Platform",
        "status": "Live",
        "problem": (
            "Manual checking of event payment screenshots and spreadsheet attendee lists introduces human bottlenecks "
            "and confirmation delays."
        ),
        "solution": (
            "A full-stack registration and approval portal automating receipt verification via Python OCR, JWT-secured admin review, "
            "MySQL persistence, and automated confirmation workflows."
        ),
        "capabilities": [
            "Dynamic registration forms with receipt screenshot uploads",
            "Python OCR extraction and transaction verification",
            "Admin approval dashboard stored on Aiven Cloud MySQL",
            "Automated confirmation workflow dispatch",
        ],
        "tech_stack": ["React", "FastAPI", "MySQL", "Aiven Cloud", "Python OCR", "JWT", "Render", "Vercel"],
        "live_url": "https://forms-project-f3sb.vercel.app/",
        "live_label": "Open SAKRA VISION Event Hub",
        "repo_url": "https://github.com/LIKITH-3012-MAC",
    },
    {
        "id": "aquasentinel-ai",
        "name": "AquaSentinel AI",
        "aliases": ["aquasentinel", "aqua sentinel", "aquasentinel ai", "marine"],
        "category": "Marine Intelligence AI Platform",
        "status": "Live",
        "problem": (
            "Coordinating coastal cleanup and fishing safety requires combining live marine weather feeds, spatial mapping, "
            "and regional language guidance."
        ),
        "solution": (
            "A marine intelligence web platform combining OpenWeather feeds, OpenStreetMap debris plotting, Groq-powered RAG guidance, "
            "and regional Indian language support."
        ),
        "capabilities": [
            "OpenStreetMap debris tracking and hazard plotting",
            "Live OpenWeather marine feed parsing",
            "Groq-assisted RAG cleanup and safety guidance",
            "Multilingual Indian regional language assistance",
        ],
        "tech_stack": ["React", "OpenWeather API", "OpenStreetMap", "Groq API", "RAG"],
        "live_url": "https://aquq-sentinel-phsv.vercel.app/",
        "live_label": "Explore AquaSentinel AI",
        "repo_url": "https://github.com/LIKITH-3012-MAC",
    },
    {
        "id": "python-gui-utility",
        "name": "Python GUI Utility / OpenCV Automation Tools",
        "aliases": ["python gui", "gui utility", "opencv automation", "opencv tools"],
        "category": "Desktop Automation & Utility",
        "status": "Local Desktop Tool",
        "problem": (
            "Repetitive local file sorting, format conversions, and image preprocessing often force users into fragile manual CLI scripts."
        ),
        "solution": (
            "Local Python desktop utilities using Tkinter/PyQt and OpenCV scripts to configure and monitor batch file and visual workflows."
        ),
        "capabilities": [
            "Automated file sorting, renaming, and batch format conversion",
            "OpenCV visual contour and verification automation helpers",
            "Real-time desktop progress logging",
        ],
        "tech_stack": ["Python", "Tkinter / PyQt", "OpenCV", "File I/O"],
        "live_url": None,
        "live_label": None,
        "repo_url": "https://github.com/LIKITH-3012-MAC",
    },
]

TECH_STACK: Dict[str, Dict[str, Any]] = {
    "deployed": {
        "label": "Deployed in Live Studio Products",
        "categories": {
            "Frontend & UI": ["React", "Next.js", "Vite", "Tailwind CSS", "Framer Motion"],
            "Backend, Security & Messaging": [
                "Python",
                "FastAPI",
                "SQLAlchemy ORM",
                "JWT Auth",
                "SlowAPI",
                "Cloudflare Turnstile",
                "Resend API",
            ],
            "Databases & Hosting": [
                "PostgreSQL (RESOLVIT AI)",
                "MySQL / Aiven Cloud (Event Hub & Studio Backend)",
                "Vercel",
                "Render",
            ],
            "AI, Vision & Geospatial": [
                "Groq API",
                "Ollama",
                "Llama",
                "Whisper (Local)",
                "Apple MLX",
                "OpenCV / Python OCR",
                "Google Maps API",
                "OpenStreetMap",
                "OpenWeather API",
            ],
        },
    },
    "in_development": {
        "label": "Used in In-Development Products",
        "items": ["LangChain document chunking", "FAISS local vector search", "Offline RAG retrieval (BenchAI)"],
    },
    "explored": {
        "label": "Explored & Researched (SAKRA Research Lab)",
        "items": [
            "Constrained tool-calling AI agent guardrails (Pydantic validation & bounded execution)",
            "OpenCV OCR preprocessing for compressed / dark-mode mobile receipts",
            "Offline coastal telemetry caching strategies",
        ],
    },
    "capabilities": {
        "label": "General Studio Capabilities",
        "items": [
            "AI Application Development",
            "Computer Vision & OCR Systems",
            "LLM & RAG Assistants",
            "Autonomous AI Agents & Workflow Automation",
            "Civic-Tech, Event Tech & Full-Stack Web Platforms",
        ],
    },
}

SERVICES: List[Dict[str, str]] = [
    {"name": "AI Applications & ML Systems", "summary": "Custom cognitive apps, scoring pipelines, and FastAPI inference backends."},
    {"name": "Computer Vision & OCR", "summary": "Automated receipt checking, image duplicate detection, and OpenCV preprocessing."},
    {"name": "LLM & RAG Engineering", "summary": "Grounded document Q&A, FAISS local vector search, and offline/cloud assistants."},
    {"name": "AI Agents & Workflow Automation", "summary": "Constrained tool-calling workflows, webhooks, validation scripts, and email pipelines."},
    {"name": "Full-Stack Product Engineering", "summary": "React/Next.js frontends, MySQL/PostgreSQL datastores, JWT security, and cloud deploys."},
]


# ---------------------------------------------------------------------------
# 2. SAFE ARITHMETIC ENGINE
# ---------------------------------------------------------------------------

_ALLOWED_BIN_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
}
_ALLOWED_UNARY_OPS = {ast.UAdd: operator.pos, ast.USub: operator.neg}


def _eval_ast_node(node: ast.AST, depth: int = 0) -> float:
    if depth > 25:
        raise ValueError("Expression too deeply nested")
    if isinstance(node, ast.Expression):
        return _eval_ast_node(node.body, depth + 1)
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)) and not isinstance(node.value, bool):
        return float(node.value)
    if isinstance(node, ast.UnaryOp) and type(node.op) in _ALLOWED_UNARY_OPS:
        return _ALLOWED_UNARY_OPS[type(node.op)](_eval_ast_node(node.operand, depth + 1))
    if isinstance(node, ast.BinOp) and type(node.op) in _ALLOWED_BIN_OPS:
        left = _eval_ast_node(node.left, depth + 1)
        right = _eval_ast_node(node.right, depth + 1)
        if isinstance(node.op, ast.Pow) and abs(right) > 100:
            raise ValueError("Exponent too large")
        if isinstance(node.op, (ast.Div, ast.FloorDiv, ast.Mod)) and right == 0:
            raise ZeroDivisionError("Division by zero")
        return _ALLOWED_BIN_OPS[type(node.op)](left, right)
    raise ValueError("Unsupported syntax")


def _format_num(val: float) -> str:
    if abs(val - round(val)) < 1e-12:
        return str(int(round(val)))
    return f"{val:.6f}".rstrip("0").rstrip(".")


def try_evaluate_math(message: str) -> Optional[Dict[str, Any]]:
    """Safely extracts and evaluates an arithmetic expression if the message asks a math calculation."""
    if not message:
        return None
    text = message.strip()
    # Ignore URLs or emails
    if "http://" in text or "https://" in text or "@" in text:
        return None

    candidate = re.sub(r"^(what is|calculate|compute|solve|evaluate|equals|answer for)\s+", "", text, flags=re.I)
    candidate = candidate.rstrip("?.! ").replace("×", "*").replace("÷", "/").replace("^", "**")

    # Ensure it strictly looks like a numeric math expression containing at least one operator
    if not re.fullmatch(r"[0-9+\-*/().%\s]+", candidate):
        return None
    if not re.search(r"[+\-*/%]", candidate) or not re.search(r"\d", candidate):
        return None

    try:
        parsed = ast.parse(candidate, mode="eval")
        value = _eval_ast_node(parsed)
        formatted = _format_num(value)

        # Build simple step-by-step explanation for precedence when * or / mixed with + or -
        steps: List[str] = []
        tokens = re.findall(r"\d+(?:\.\d+)?\s*[*\/]\s*\d+(?:\.\d+)?", candidate)
        if tokens and re.search(r"[+-]", candidate):
            reduced = candidate
            for tok in tokens:
                sub_val = _format_num(_eval_ast_node(ast.parse(tok, mode="eval")))
                steps.append(f"`{tok.strip()}` = `{sub_val}`")
                reduced = reduced.replace(tok, sub_val, 1)
            steps.append(f"`{reduced}` = `{formatted}`")

        return {
            "expression": candidate.strip(),
            "result": formatted,
            "steps": steps,
        }
    except ZeroDivisionError:
        return {"expression": candidate.strip(), "error": "division_by_zero"}
    except Exception:
        return None


# ---------------------------------------------------------------------------
# 3. LANGUAGE DETECTION & CONVERSATION MEMORY
# ---------------------------------------------------------------------------

_TELUGU_UNICODE_RE = re.compile(r"[\u0C00-\u0C7F]")
_EXPLICIT_TELUGU_CMD_RE = re.compile(
    r"\b(telugu\s*lo(\s*cheppu|\s*matladu|\s*explain|\s*cheppandi)?|in\s+simple\s+telugu|in\s+telugu|speak\s+telugu|respond\s+in\s+telugu)\b|తెలుగులో",
    re.I,
)
_EXPLICIT_TANGLISH_CMD_RE = re.compile(
    r"\b(tanglish(\s*lo)?|telugu\s+in\s+english|switch\s+to\s+tanglish|in\s+tanglish)\b",
    re.I,
)
_EXPLICIT_ENGLISH_CMD_RE = re.compile(
    r"\b(in\s+english|english\s*lo(\s*cheppu)?|switch\s+to\s+english|speak\s+english|english\s+please|back\s+to\s+english)\b",
    re.I,
)
_TANGLISH_MARKER_RE = re.compile(
    r"\b(em|enti|evaru|evvaru|cheppu|cheppandi|gurinchi|nenu|mee|naaku|naku|ela|ekkada|enduku|undhi|undi|unnayi|chesthundi|chestundi|chestharu|kavali|teliyadu|manaki|naadi|meedi|meeru|ledu|avunu|bagundi|chala)\b",
    re.I,
)


def clean_conversation_history(history: Optional[List[Dict[str, str]]]) -> List[Dict[str, str]]:
    """Removes UI welcome/feedback noise and normalizes conversational turns."""
    if not history or not isinstance(history, list):
        return []
    cleaned: List[Dict[str, str]] = []
    for item in history:
        if hasattr(item, "model_dump"):
            raw = item.model_dump()
        elif hasattr(item, "dict"):
            raw = item.dict()
        elif isinstance(item, dict):
            raw = item
        else:
            continue

        sender = str(raw.get("sender", "")).strip().lower()
        text = str(raw.get("text", "")).strip()
        if not text or sender == "system":
            continue
        # Ignore initial greeting / reset boilerplate from diluting recent context
        if sender in ("bot", "assistant") and (
            text.startswith("Welcome to SAKRA VISION.")
            or text.startswith("Session reset. SAKRA-BOT")
        ):
            continue

        role = "assistant" if sender in ("bot", "assistant") else "user"
        cleaned.append({"role": role, "content": text[:800]})

    return cleaned[-8:]


def detect_message_language_signal(message: str) -> Tuple[Optional[str], bool]:
    """
    Returns (detected_language, is_explicit_switch) for a single message:
    - detected_language: 'telugu' | 'tanglish' | 'english' | None (neutral/short follow-up)
    """
    msg = (message or "").strip()
    if not msg:
        return None, False

    if _EXPLICIT_TELUGU_CMD_RE.search(msg):
        return "telugu", True
    if _EXPLICIT_TANGLISH_CMD_RE.search(msg):
        return "tanglish", True
    if _EXPLICIT_ENGLISH_CMD_RE.search(msg):
        return "english", True
    if _TELUGU_UNICODE_RE.search(msg):
        return "telugu", False

    markers = _TANGLISH_MARKER_RE.findall(msg)
    if markers:
        return "tanglish", False

    # Pure math, URL, or single short follow-up token stays language-neutral
    if try_evaluate_math(msg) is not None or re.fullmatch(r"https?://\S+", msg):
        return None, False
    if msg.lower().strip("?.! ") in {
        "more", "details", "tell me more", "explain more", "why", "how",
        "yes", "no", "ok", "okay", "and", "what else", "continue"
    }:
        return None, False

    # Substantive English sentence
    alpha_words = re.findall(r"[A-Za-z]+", msg)
    if len(alpha_words) >= 2:
        return "english", False
    return None, False


def resolve_session_language(
    message: str,
    cleaned_history: List[Dict[str, str]],
    preferred_language: Optional[str] = None,
) -> str:
    """
    Determines the active output language ('english' | 'telugu' | 'tanglish')
    preserving explicit language switches across follow-up turns until changed.
    """
    if preferred_language:
        pref = preferred_language.strip().lower()
        sig, is_exp = detect_message_language_signal(message)
        if is_exp and sig:
            return sig
        if pref in ("telugu", "te"):
            # Active Tanglish phrasing switches naturally out of Telugu into Tanglish
            if sig == "tanglish":
                return "tanglish"
            return "telugu"
        if pref in ("tanglish", "te-latn"):
            if sig == "telugu":
                return "telugu"
            return "tanglish"
        if pref in ("english", "en"):
            if sig in ("telugu", "tanglish"):
                return sig
            return "english"

    locked_lang: Optional[str] = None
    last_lang: str = "english"

    for turn in cleaned_history:
        if turn["role"] != "user":
            continue
        sig, is_exp = detect_message_language_signal(turn["content"])
        if is_exp and sig:
            locked_lang = sig
            last_lang = sig
        elif sig == "tanglish":
            # User actively wrote in Tanglish -> move from English/Telugu lock into Tanglish
            locked_lang = None
            last_lang = "tanglish"
        elif sig == "telugu":
            locked_lang = "telugu"
            last_lang = "telugu"
        elif sig == "english" and not locked_lang:
            last_lang = "english"

    curr_sig, curr_exp = detect_message_language_signal(message)
    if curr_exp and curr_sig:
        return curr_sig
    if curr_sig == "telugu":
        return "telugu"
    if curr_sig == "tanglish":
        return "tanglish"
    if locked_lang == "telugu":
        # Maintain Telugu until the user explicitly switches to English or uses Tanglish
        return "telugu"
    if locked_lang == "tanglish":
        return "tanglish"
    if curr_sig == "english":
        return "english"
    return last_lang


def extract_session_user_identity(cleaned_history: List[Dict[str, str]], current_message: str) -> Optional[str]:
    """Checks current session turns for explicit user self-identification."""
    turns = [t["content"] for t in cleaned_history if t["role"] == "user"] + [current_message]
    patterns = [
        re.compile(r"\b(?:i am|i'm|im|my name is|this is|call me)\s+([A-Za-z][A-Za-z\s]{1,40})", re.I),
        re.compile(r"\b(?:nenu|naa peru|na peru)\s+([A-Za-z][A-Za-z\s]{1,35}?)(?:\s+ni|\s*$|\s*[,.!?])", re.I),
    ]
    found_name: Optional[str] = None
    for text in turns:
        if re.search(r"\b(nenu evaru|who am i)\b", text, re.I):
            continue
        for pat in patterns:
            m = pat.search(text.strip())
            if m:
                candidate = m.group(1).strip(" .,!?")
                if candidate.lower() not in {"a", "an", "the", "asking", "testing", "interested", "looking"}:
                    found_name = candidate
    return found_name


def count_repeated_question(message: str, cleaned_history: List[Dict[str, str]]) -> int:
    """Counts how many times a nearly identical user question appeared earlier in history (returns total including current)."""
    norm_curr = re.sub(r"[^\w\s]", "", (message or "").lower()).strip()
    if not norm_curr or len(norm_curr) < 4:
        return 1
    prior = 0
    for turn in cleaned_history:
        if turn["role"] == "user":
            norm_prev = re.sub(r"[^\w\s]", "", turn["content"].lower()).strip()
            if norm_prev == norm_curr:
                prior += 1
    return prior + 1


# ---------------------------------------------------------------------------
# 4. INTENT DETECTION & GROUNDED CONTEXT RETRIEVER
# ---------------------------------------------------------------------------

def _match_projects_in_text(text: str) -> List[Dict[str, Any]]:
    t = (text or "").lower()
    matched: List[Dict[str, Any]] = []
    for proj in PROJECTS:
        for alias in proj["aliases"]:
            if re.search(r"\b" + re.escape(alias) + r"\b", t):
                matched.append(proj)
                break
    return matched


def _match_project_in_text(text: str) -> Optional[Dict[str, Any]]:
    matches = _match_projects_in_text(text)
    return matches[0] if matches else None


def _resolve_followup_subject(cleaned_history: List[Dict[str, str]], msg: str) -> Tuple[Optional[str], Optional[Dict[str, Any]]]:
    """Scans recent conversation turns newest-first, avoiding multi-project list bleed."""
    wants_tech = bool(re.search(r"\b(tech|stack|framework|database|use)\b", msg))

    # 1. Check newest user/assistant turns for an unambiguous single-project reference
    for role_pref in ("user", "assistant"):
        for turn in reversed(cleaned_history[-6:]):
            if turn["role"] != role_pref:
                continue
            matches = _match_projects_in_text(turn["content"])
            if len(matches) == 1:
                return ("project_tech" if wants_tech else "project_followup"), matches[0]

    # 2. Fall back to single-topic domain resolution from newest turns backwards
    for turn in reversed(cleaned_history[-4:]):
        txt = turn["content"]
        if re.search(r"\b(likith|anumakonda|founder|ceo|pbr|piano|echoes)\b", txt, re.I):
            return "founder", None
        if re.search(r"\b(start a project|inquire|smart project brief|consultation|schedule)\b", txt, re.I):
            return "start_project", None
        if re.search(r"\b(tech stack|deployed in live|in-development)\b", txt, re.I):
            return "tech_stack", None
        if re.search(r"\b(services?|capabilities|offer)\b", txt, re.I):
            return "services", None
        if re.search(r"\b(sakravision|sakra vision|company|studio)\b", txt, re.I):
            return "company", None

    return None, None


def detect_intent_and_subject(message: str, cleaned_history: List[Dict[str, str]]) -> Tuple[str, Optional[Dict[str, Any]]]:
    msg = (message or "").lower().strip()

    # Math expression
    if try_evaluate_math(message) is not None:
        return "math", None

    # User self-identity ("nenu evaru?", "who am i?")
    if re.search(r"\b(nenu\s+evaru|who\s+am\s+i)\b", msg):
        return "user_identity", None

    # Pure language switch command ("Telugu lo cheppu", "Tanglish lo cheppu") -> summarize prior topic in target language
    if (_EXPLICIT_TELUGU_CMD_RE.search(msg) or _EXPLICIT_TANGLISH_CMD_RE.search(msg) or _EXPLICIT_ENGLISH_CMD_RE.search(msg)) and len(msg.split()) <= 5:
        for turn in reversed(cleaned_history):
            if turn["role"] == "user":
                prev_intent, prev_proj = detect_intent_and_subject(turn["content"], [])
                if prev_intent not in ("language_switch", "greeting", "general_or_unknown"):
                    return prev_intent, prev_proj
        return "language_switch", None

    # Specific named project queries
    matched_projects = _match_projects_in_text(msg)
    if len(matched_projects) == 1:
        matched_project = matched_projects[0]
        if re.search(r"\b(tech|stack|technologies|tools|built with|use|used|database|backend|frontend|framework)\b", msg):
            return "project_tech", matched_project
        return "project_detail", matched_project

    # Explicit direct intents (MUST run before follow-up pronoun heuristics)
    if re.search(r"\b(start a project|start project|how can i start|how to start|build a project|hire|collaborate|submit.*brief|book.*consult|schedule)\b", msg):
        return "start_project", None
    if re.search(r"\b(instagram|insta|social|portfolio|github|linkedin|follow|handle)\b", msg):
        return "social_links", None
    if re.search(r"\b(contact|email|mail|reach|phone|meet link|google meet)\b", msg):
        return "contact", None
    if re.search(r"\b(likith|anumakonda|founder|ceo|owner|who built|who made|who created|author|pianist|pbr)\b", msg):
        return "founder", None
    if re.search(r"\b(research|lab|experiment|prototype|r&d)\b", msg):
        return "research", None
    if re.search(r"\b(top project|best project|flagship|compare)\b", msg):
        return "project_comparison", None
    if re.search(r"\b(projects?|products?|built|show me.*work|what.*built)\b", msg) and not re.search(r"\b(company|studio)\b", msg):
        return "projects_list", None
    if re.search(r"\b(services?|capabilities|what do you offer|what can you build)\b", msg):
        return "services", None
    if re.search(r"\b(sakra|company|studio|about|what does.*build|em chesthundi|chestundi)\b", msg):
        return "company", None

    # Follow-up question with pronouns or elliptical references
    is_followup = bool(
        re.search(
            r"^(more|details|tell me more|explain more|what else|why|elaborate|and\b|what about\b|daani gurinchi|inka cheppu)\b",
            msg,
        )
        or (len(msg.split()) <= 7 and re.search(r"\b(it|its|that|this|he|his|him|they|their)\b", msg))
    )
    if is_followup and cleaned_history:
        f_intent, f_proj = _resolve_followup_subject(cleaned_history, msg)
        if f_intent:
            return f_intent, f_proj

    # General technology stack question ("What technologies and stack do you use?")
    if re.search(r"\b(tech|stack|technologies|frameworks|libraries|languages|database|tools|groq|fastapi|react)\b", msg):
        return "tech_stack", None

    # Greeting
    if re.fullmatch(r"(hi|hello|hey|namaste|namaskaram|good morning|good evening|hii+)[\s!.]*", msg):
        return "greeting", None

    return "general_or_unknown", None


def build_grounded_context(
    intent: str,
    project: Optional[Dict[str, Any]],
    cleaned_history: List[Dict[str, str]],
    message: str,
    language: str,
    repeat_count: int,
) -> str:
    """Assembles only relevant verified knowledge to inject into Groq prompt cleanly."""
    blocks: List[str] = []

    if intent == "math":
        m = try_evaluate_math(message)
        if m and "result" in m:
            blocks.append(
                f"MATH VERIFICATION:\nExpression: {m['expression']}\nExact Result: {m['result']}\n"
                + (f"Steps: {'; '.join(m['steps'])}" if m["steps"] else "")
            )
        elif m and m.get("error"):
            blocks.append(f"MATH VERIFICATION: Division by zero in `{m['expression']}`.")

    if intent == "user_identity":
        identified = extract_session_user_identity(cleaned_history, message)
        if identified:
            blocks.append(f"SESSION USER IDENTITY: The user explicitly introduced themselves as '{identified}' earlier in this chat session.")
        else:
            blocks.append(
                "SESSION USER IDENTITY: The user has NOT identified themselves in this session. Do NOT assume they are founder Likith Naidu Anumakonda. "
                "Politely clarify that you don't know their name yet unless they share it, and note that Likith Naidu Anumakonda is the founder of SAKRA VISION."
            )

    if intent in ("founder", "social_links", "user_identity"):
        blocks.append(
            "VERIFIED FOUNDER FACTS:\n"
            f"- Name: {FOUNDER['full_name']}\n"
            f"- Role: {FOUNDER['role']}\n"
            f"- Engineering Role: {FOUNDER['title']}\n"
            f"- Education: {FOUNDER['education']}\n"
            f"- Creative Pursuits: Pianist; Author of \"Echoes of an Unsaid Goodbye\"\n"
            f"- Links (MUST use clean labels, NEVER output banned titles):\n"
            f"  Portfolio: {FOUNDER['portfolio']}\n"
            f"  Instagram: {FOUNDER['instagram']} ({FOUNDER['instagram_handle']})\n"
            f"  GitHub: {FOUNDER['github']}\n"
            f"  LinkedIn: {FOUNDER['linkedin']}"
        )

    if intent in ("project_detail", "project_tech", "project_followup") and project:
        blocks.append(
            f"VERIFIED PROJECT ({project['name']}):\n"
            f"- Category: {project['category']} | Status: {project['status']}\n"
            f"- Problem: {project['problem']}\n"
            f"- Solution: {project['solution']}\n"
            f"- Key Capabilities: {', '.join(project['capabilities'])}\n"
            f"- Tech Stack ONLY used in {project['name']}: {', '.join(project['tech_stack'])}\n"
            f"- Official Live Link: {project['live_url'] or 'Not publicly hosted (Offline / In Development)'}\n"
            f"- Repo: {project['repo_url']}"
        )

    if intent in ("projects_list", "project_comparison", "company"):
        summary_lines = []
        for p in PROJECTS:
            summary_lines.append(
                f"- {p['name']} ({p['status']} — {p['category']}): {p['solution']} "
                f"| Stack: {', '.join(p['tech_stack'])} | URL: {p['live_url'] or 'Offline / In Development'}"
            )
        blocks.append("VERIFIED PROJECTS:\n" + "\n".join(summary_lines))

    if intent in ("tech_stack", "research"):
        dep_lines = [f"  - {cat}: {', '.join(items)}" for cat, items in TECH_STACK["deployed"]["categories"].items()]
        blocks.append(
            "VERIFIED TECHNOLOGY CLASSIFICATION (Keep Deployed vs In-Development vs Explored strictly distinct):\n"
            "1. Deployed in Live Studio Products:\n" + "\n".join(dep_lines) + "\n"
            "2. Used in In-Development Products:\n  - " + "; ".join(TECH_STACK["in_development"]["items"]) + "\n"
            "3. Actively Explored in SAKRA Research Lab:\n  - " + "; ".join(TECH_STACK["explored"]["items"]) + "\n"
            "4. General Capabilities:\n  - " + ", ".join(TECH_STACK["capabilities"]["items"])
        )

    if intent in ("services", "start_project", "contact", "company", "greeting", "social_links"):
        blocks.append(
            f"ORGANIZATION & CONTACT:\n"
            f"- Studio: {ORGANIZATION['name']} ({ORGANIZATION['handle']}), Est. {ORGANIZATION['established']} ({ORGANIZATION['country']})\n"
            f"- Tagline: \"{ORGANIZATION['tagline']}\"\n"
            f"- Mission/Work: {ORGANIZATION['summary']}\n"
            f"- Website: {ORGANIZATION['website']}\n"
            f"- Contact Emails: {', '.join(ORGANIZATION['emails'])}\n"
            f"- Consultation Meet: {ORGANIZATION['consultation']['meet_url']} ({ORGANIZATION['consultation']['hours']})\n"
            f"- Services: " + "; ".join(f"{s['name']} ({s['summary']})" for s in SERVICES)
        )

    if repeat_count >= 2:
        blocks.append(
            f"REPETITION SIGNAL: The user has asked essentially this same question {repeat_count} times in this session. "
            "Do NOT repeat your prior full response verbatim. Give a crisp shorter summary or fresh angle and ask how they'd like to proceed."
        )

    blocks.append(
        f"ACTIVE RESPONSE LANGUAGE: {language.upper()}.\n"
        + (
            "Write strictly in clear Telugu script (తెలుగు) while keeping technical nouns (AI, ML, RAG, FastAPI, RESOLVIT AI, Prometheus AI) in English."
            if language == "telugu"
            else (
                "Write strictly in natural Tanglish (Telugu written using English letters, e.g., 'Mee...', 'Chesthundi...', 'Gurinchi') while keeping technical nouns clearly in English."
                if language == "tanglish"
                else "Write in clear, concise, professional English."
            )
        )
    )

    return "\n\n".join(blocks)


# ---------------------------------------------------------------------------
# 5. INTELLIGENT OFFLINE / RESILIENT FALLBACK GENERATOR (EN / TE / TANGLISH)
# ---------------------------------------------------------------------------

def _clean_link(label: str, url: str) -> str:
    return f"[{label}]({url})"


def resolve_intelligent_fallback(
    message: str,
    cleaned_history: List[Dict[str, str]],
    language: str,
) -> str:
    intent, project = detect_intent_and_subject(message, cleaned_history)
    repeat_count = count_repeated_question(message, cleaned_history)

    # Anti-repetition concise reply on 3rd+ ask (non-math)
    if repeat_count >= 3 and intent != "math":
        if language == "telugu":
            return (
                "ఇదే ప్రశ్నకు సంబంధించిన పూర్తి సమాచారాన్ని మనం ఇప్పటికే చర్చించాము. "
                "మీకు దీనిపై ప్రత్యేకంగా ఆర్కిటెక్చర్, టెక్ స్టాక్ లేదా ప్రాజెక్ట్ ప్రారంభ ప్రక్రియ గురించి ఇంకా లోతుగా కావాలంటే దయచేసి చెప్పండి."
            )
        if language == "tanglish":
            return (
                "Idhe question ki sambandhinchina main details already share chesanu. "
                "Meeku specific ga tech stack, architecture, leda project start process gurinchi inka clarity kavalante cheppandi!"
            )
        return (
            "I've already covered the main details for this question in our current conversation. "
            "If you'd like a deeper look at a specific architecture, tech stack breakdown, or how to start a build, let me know what angle would help most."
        )

    # 1. Mathematical expression
    if intent == "math":
        math_res = try_evaluate_math(message)
        if math_res and math_res.get("error") == "division_by_zero":
            if language == "telugu":
                return f"`{math_res['expression']}` గణనలో సున్నాతో భాగహారం (division by zero) సాధ్యం కాదు."
            if language == "tanglish":
                return f"`{math_res['expression']}` lo zero tho divide cheyyadam valid kaadu."
            return f"Cannot evaluate `{math_res['expression']}` because division by zero is undefined."

        if math_res and "result" in math_res:
            expr = math_res["expression"]
            res = math_res["result"]
            steps_text = " -> ".join(math_res["steps"]) if math_res["steps"] else f"`{expr}` = `{res}`"
            if language == "telugu":
                return f"**గణన ఫలితం:** `{expr} = {res}`\n\nదశలవారీగా (గుణకారం ముందు): {steps_text}"
            if language == "tanglish":
                return f"**Result:** `{expr} = {res}`\n\nStep-by-step (BODMAS prakaram multiplication mundu): {steps_text}"
            return f"**Result:** `{expr} = {res}`\n\nCalculation breakdown: {steps_text}"

    # 2. "Nenu evaru?" / User Identity
    if intent == "user_identity":
        identified = extract_session_user_identity(cleaned_history, message)
        if identified and "likith" in identified.lower():
            if language == "telugu":
                return (
                    f"ఈ సెషన్ ఆధారంగా మీరు **{FOUNDER['full_name']}** — SAKRA VISION Founder & CEO, AI/ML Engineer, "
                    f"PBR VITS, Kavali లో B.Tech CSE (Artificial Intelligence) విద్యార్థి, పియానిస్ట్ మరియు *Echoes of an Unsaid Goodbye* రచయిత.\n\n"
                    f"• {_clean_link('Visit Likith Portfolio', FOUNDER['portfolio'])}"
                )
            if language == "tanglish":
                return (
                    f"Ee chat context prakaram meeru **{FOUNDER['full_name']}** — SAKRA VISION Founder & CEO, AI/ML Engineer, "
                    f"PBR VITS, Kavali lo B.Tech CSE (Artificial Intelligence) student, pianist, mariyu *Echoes of an Unsaid Goodbye* author.\n\n"
                    f"• {_clean_link('Visit Likith Portfolio', FOUNDER['portfolio'])}"
                )
            return (
                f"Based on what you shared in this session, you are **{FOUNDER['full_name']}** — Founder & CEO of SAKRA VISION, "
                f"AI/ML Engineer, B.Tech CSE (Artificial Intelligence) student at PBR VITS, Kavali, pianist, and author of *\"Echoes of an Unsaid Goodbye\"*."
            )

        if identified:
            if language == "tanglish":
                return f"Meeru ee session lo mee peru **{identified}** ani chepparu. SAKRA VISION products gurinchi emaina telusukovalante adagandi!"
            if language == "telugu":
                return f"ఈ సెషన్‌లో మీరు మీ పేరు **{identified}** అని చెప్పారు. SAKRA VISION గురించి ఏవైనా సందేహాలు ఉంటే అడగండి."
            return f"In this session, you introduced yourself as **{identified}**."

        if language == "telugu":
            return (
                "మీరు మీ పేరును ఈ చాట్‌లో ఇంకా చెప్పనందున మీరు ఎవరో నాకు తెలియదు (నేను పర్మనెంట్ వ్యక్తిగత మెమరీని స్టోర్ చేయను). "
                f"అయితే **SAKRA VISION** స్థాపకుడు **{FOUNDER['full_name']}** (Founder & CEO, AI/ML Engineer). "
                "మీరు మీ పేరు పరిచయం చేస్తే ఈ సెషన్‌లో నేను మిమ్మల్ని గుర్తుంచుకోగలను."
            )
        if language == "tanglish":
            return (
                "Meeru ee chat lo mee peru inka cheppaledu kabatti meeru evaro nenu guess cheyyalenu (nenu permanent personal memory save cheyyanu). "
                f"**SAKRA VISION** founder aite **{FOUNDER['full_name']}** (Founder & CEO, AI/ML Engineer). "
                "Meeru Likith ayina leda visitor ayina, mee gurinchi ikkada chebite aa context tho matladathanu!"
            )
        return (
            "I don't know who you are unless you tell me in this conversation—I don't assume every visitor is the founder or retain persistent personal memory across sessions. "
            f"(If you're asking about SAKRA VISION's founder, that is **{FOUNDER['full_name']}**.)"
        )

    # 3. Language switch confirmation with no specific prior topic
    if intent == "language_switch":
        if language == "telugu":
            return (
                "తప్పకుండా, ఇకపై మనం **తెలుగులో** మాట్లాడుకుందాం! "
                "SAKRA VISION ప్రాజెక్టులు, టెక్నాలజీలు, ఫౌండర్ లిఖిత్ నాయుడు లేదా కొత్త ప్రాజెక్ట్ గురించి ఏది కావాలంటే అది అడగండి."
            )
        if language == "tanglish":
            return (
                "Sure! Ippati nunchi **Tanglish** lo chat cheddam. SAKRA VISION projects, tech stack, founder Likith, leda mee project idea gurinchi adagandi!"
            )
        return "Switched back to **English**. Ask me anything about SAKRA VISION's products, technology stack, founder, or starting a project."

    # 4. Specific Project Technologies ("What technologies are used in RESOLVIT?")
    if intent == "project_tech" and project:
        stack_str = ", ".join(project["tech_stack"])
        link_line = (
            f"\n\n• {_clean_link(project['live_label'], project['live_url'])}"
            if project.get("live_url")
            else "\n\n*(Note: Currently offline / in development without a public web URL.)*"
        )
        if language == "telugu":
            return (
                f"### {project['name']} టెక్నాలజీ స్టాక్\n"
                f"**{project['name']}** ({project['status']}) లో ఉపయోగించిన ప్రధాన టెక్నాలజీలు:\n\n"
                f"• **Core Stack**: {stack_str}\n"
                f"• **విధానం**: {project['solution']}{link_line}"
            )
        if language == "tanglish":
            return (
                f"### {project['name']} Technology Stack\n"
                f"**{project['name']}** ({project['status']}) lo vaadina verified technologies:\n\n"
                f"• **Core Stack**: {stack_str}\n"
                f"• **How it works**: {project['solution']}{link_line}"
            )
        return (
            f"### Technologies Used in {project['name']}\n"
            f"**Status:** {project['status']}\n\n"
            f"• **Stack**: {stack_str}\n"
            f"• **Architecture Role**: {project['solution']}{link_line}"
        )

    # 5. Specific Project Overview / Follow-up
    if intent in ("project_detail", "project_followup") and project:
        if repeat_count == 2:
            if language == "tanglish":
                return (
                    f"**{project['name']}** quick recap: {project['solution']} "
                    f"(Stack: {', '.join(project['tech_stack'][:4])}). "
                    + (f"{_clean_link(project['live_label'], project['live_url'])}" if project.get("live_url") else "Prasthutham in development.")
                )
            return (
                f"**Quick recap on {project['name']} ({project['status']}):** {project['solution']} "
                + (f"\n• {_clean_link(project['live_label'], project['live_url'])}" if project.get("live_url") else "\n• Status: Offline / In Development.")
            )

        caps = "\n".join(f"• {c}" for c in project["capabilities"][:4])
        link_block = (
            f"\n\n• {_clean_link(project['live_label'], project['live_url'])}"
            if project.get("live_url")
            else "\n\n• **Access**: Offline / In Development (no live web demo yet)"
        )
        TE_PROJECTS = {
            "prometheus-ai": (
                "క్లౌడ్ సర్వర్లపై ఆధారపడకుండా ఆడియో మరియు ప్రశ్నలను స్థానిక డివైస్‌లోనే ప్రాసెస్ చేయడం.",
                "Whisper వాయిస్ ట్రాన్స్‌క్రిప్షన్, FastAPI రూటింగ్ మరియు Apple MLX / Ollama ద్వారా స్థానికంగా Llama AI ను నడిపే ఎడ్జ్ సిస్టమ్.",
            ),
            "resolvit-ai": (
                "ప్రజా ఫిర్యాదులలో డూప్లికేట్ రిపోర్టులు మరియు ఆలస్యమైన పరిష్కారం.",
                "Computer Vision డూప్లికేట్ చెకింగ్, FastAPI NLP ప్రయారిటీ స్కోరింగ్, PostgreSQL మరియు Google Maps తో అధికారులకు రియల్-టైమ్ డాష్‌బోర్డ్.",
            ),
            "bench-ai": (
                "ఇంటర్నెట్ లేని గ్రామీణ తరగతి గదుల్లో విద్యార్థులు క్లౌడ్ AI పై ఆధారపడలేకపోవడం.",
                "స్థానిక PDFలు, పాఠ్యపుస్తకాలను LangChain మరియు FAISS vector search తో ఇండెక్స్ చేసి, పూర్తిగా ఆఫ్‌లైన్‌లో Ollama / Llama ద్వారా సమాధానాలు ఇచ్చే లెర్నింగ్ అసిస్టెంట్.",
            ),
            "event-hub": (
                "ఈవెంట్ రిజిస్ట్రేషన్లలో పేమెంట్ స్క్రీన్‌షాట్లను మాన్యువల్‌గా తనిఖీ చేయడం.",
                "Python OCR ద్వారా రసీదులను తనిఖీ చేసి MySQL మరియు అడ్మిన్ అప్రూవల్‌తో ఆటోమేటెడ్ కన్ఫర్మేషన్ అందించే ఫుల్-స్టాక్ ప్లాట్‌ఫారమ్.",
            ),
            "aquasentinel-ai": (
                "సముద్ర కాలుష్యం మరియు వాతావరణ హెచ్చరికలను స్థానిక భాషల్లో సమన్వయం చేయడం.",
                "OpenWeather, OpenStreetMap మరియు Groq ఆధారిత RAG సహాయంతో ప్రాంతీయ భారతీయ భాషల్లో మత్స్యకారులకు మార్గదర్శకం ఇచ్చే ప్లాట్‌ఫారమ్.",
            ),
        }
        TG_PROJECTS = {
            "prometheus-ai": (
                "Cloud servers ki audio leda data pampakunda, local device lo AI run avvadam.",
                "Whisper voice input, FastAPI router, mariyu Apple MLX / Ollama tho local Llama inference chese edge AI companion.",
            ),
            "resolvit-ai": (
                "Public complaints tracking lo delay mariyu duplicate reports bottleneck.",
                "Computer Vision duplicate check, FastAPI NLP priority scoring, PostgreSQL mariyu Google Maps tho authority command portal.",
            ),
            "bench-ai": (
                "Internet leni classrooms lo students cloud AI tutors vaadakapovadam.",
                "Local PDFs mariyu textbooks ni LangChain + FAISS tho index chesi offline Ollama / Llama tho Q&A chese study terminal.",
            ),
            "event-hub": (
                "Event payment screenshots manual ga verify cheyadam lo time delay.",
                "Python OCR tho payment receipt check chesi, JWT admin portal mariyu MySQL tho automated email confirmation pampedi.",
            ),
            "aquasentinel-ai": (
                "Marine debris tracking, weather data, mariyu regional dialects okachota kalapadam.",
                "OpenWeather, OpenStreetMap, mariyu Groq RAG tho multi-language marine guidance icche platform.",
            ),
        }

        if language == "telugu":
            te_p, te_s = TE_PROJECTS.get(project["id"], (project["problem"], project["solution"]))
            te_link = (
                f"\n\n• {_clean_link(project['live_label'], project['live_url'])}"
                if project.get("live_url")
                else "\n\n• **లభ్యత**: ఆఫ్‌లైన్ / అభివృద్ధి దశలో (పబ్లిక్ వెబ్ లింక్ ఇంకా లేదు)"
            )
            return (
                f"### {project['name']} ({project['status']})\n"
                f"**{project['category']}**\n\n"
                f"• **సమస్య**: {te_p}\n"
                f"• **పరిష్కారం**: {te_s}\n"
                f"• **టెక్ స్టాక్**: {', '.join(project['tech_stack'])}{te_link}"
            )
        if language == "tanglish":
            tg_p, tg_s = TG_PROJECTS.get(project["id"], (project["problem"], project["solution"]))
            return (
                f"### {project['name']} ({project['status']})\n"
                f"**{project['category']}**\n\n"
                f"• **Problem**: {tg_p}\n"
                f"• **Solution**: {tg_s}\n"
                f"• **Tech Stack**: {', '.join(project['tech_stack'])}{link_block}"
            )
        return (
            f"### {project['name']} ({project['status']})\n"
            f"**{project['category']}**\n\n"
            f"• **Problem Solved**: {project['problem']}\n"
            f"• **How It Works**: {project['solution']}\n\n"
            f"**Core Capabilities**\n{caps}\n\n"
            f"• **Technologies**: {', '.join(project['tech_stack'])}{link_block}"
        )

    # 6. Founder
    if intent == "founder":
        portfolio_link = _clean_link("Visit Likith's Portfolio", FOUNDER["portfolio"])
        insta_link = _clean_link("View Likith on Instagram", FOUNDER["instagram"])
        github_link = _clean_link("View SAKRA VISION on GitHub", FOUNDER["github"])
        if repeat_count == 2:
            return (
                f"In brief, **{FOUNDER['full_name']}** is the Founder & CEO of SAKRA VISION, an AI/ML Engineer, "
                f"and a {FOUNDER['education']}—alongside being a pianist and author of *\"Echoes of an Unsaid Goodbye\"*. "
                f"• {portfolio_link}"
            )
        if language == "telugu":
            return (
                f"### {FOUNDER['full_name']}\n"
                f"**{FOUNDER['role']}**\n\n"
                f"• **వృత్తి**: {FOUNDER['title']}\n"
                f"• **విద్య**: {FOUNDER['education']}\n"
                f"• **సృజనాత్మక రంగం**: పియానిస్ట్, *\"Echoes of an Unsaid Goodbye\"* రచయిత\n"
                f"• {portfolio_link} · {insta_link}"
            )
        if language == "tanglish":
            return (
                f"### {FOUNDER['full_name']}\n"
                f"**{FOUNDER['role']}**\n\n"
                f"• **Role**: {FOUNDER['title']}\n"
                f"• **Education**: {FOUNDER['education']}\n"
                f"• **Other Interests**: Pianist mariyu *\"Echoes of an Unsaid Goodbye\"* author\n"
                f"• {portfolio_link} · {insta_link}"
            )
        return (
            f"### {FOUNDER['full_name']}\n"
            f"**{FOUNDER['role']} · {FOUNDER['title']}**\n\n"
            f"• **Education**: {FOUNDER['education']}\n"
            f"• **Creative Work**: Pianist and author of *\"Echoes of an Unsaid Goodbye\"*\n"
            f"• **Mission**: Building practical AI, Computer Vision, RAG, and full-stack software products under SAKRA VISION.\n\n"
            f"• {portfolio_link}\n"
            f"• {insta_link} ({FOUNDER['instagram_handle']})\n"
            f"• {github_link}"
        )

    # 7. Grouped Tech Stack
    if intent == "tech_stack":
        if language == "telugu":
            return (
                "### SAKRA VISION టెక్నాలజీ స్టాక్\n"
                "మా ప్రాజెక్టుల ఆధారంగా టెక్నాలజీలను స్పష్టంగా మూడు విభాగాలుగా విభజించవచ్చు:\n\n"
                "• **లైవ్ ప్రాజెక్టులలో వాడుతున్నవి**: React, Next.js, Tailwind CSS, Python, FastAPI, PostgreSQL (RESOLVIT AI), "
                "MySQL / Aiven Cloud, Groq API, Ollama, Llama, Whisper (Local), Apple MLX, OpenCV / OCR, OpenStreetMap, OpenWeather, Vercel, Render.\n"
                "• **అభివృద్ధి దశలో (In Development)**: BenchAI కోసం LangChain మరియు FAISS local RAG vector search.\n"
                "• **పరిశోధన దశలో (Research Lab)**: Constrained AI agent guardrails (Pydantic), low-contrast receipt OCR, offline coastal telemetry."
            )
        if language == "tanglish":
            return (
                "### SAKRA VISION Technology Stack\n"
                "Live projects lo vaadedi mariyu development lo unnadi ila classify chestham:\n\n"
                "• **Deployed in Live Products**: React, Next.js, Tailwind CSS, Python, FastAPI, PostgreSQL (RESOLVIT AI), "
                "MySQL / Aiven Cloud (Event Hub), Groq API, Ollama, Llama, Whisper, Apple MLX, OpenCV / OCR, OpenStreetMap, OpenWeather, Vercel, Render.\n"
                "• **In Development (BenchAI)**: LangChain document chunking mariyu FAISS local vector search (Offline RAG).\n"
                "• **Research Lab Explorations**: Schema-validated AI agent guardrails (Pydantic) & mobile receipt OCR improvements."
            )
        cats = TECH_STACK["deployed"]["categories"]
        return (
            "### SAKRA VISION Technology Stack\n"
            "Each layer maps directly to verified studio work:\n\n"
            "**1. Deployed in Live Products**\n"
            f"• **Frontend**: {', '.join(cats['Frontend & UI'])}\n"
            f"• **Backend & Security**: {', '.join(cats['Backend, Security & Messaging'])}\n"
            f"• **Databases & Hosting**: {', '.join(cats['Databases & Hosting'])}\n"
            f"• **AI, Vision & Spatial**: {', '.join(cats['AI, Vision & Geospatial'])}\n\n"
            "**2. Used in In-Development Products**\n"
            f"• {', '.join(TECH_STACK['in_development']['items'])}\n\n"
            "**3. Actively Explored in SAKRA Research Lab**\n"
            f"• {'; '.join(TECH_STACK['explored']['items'])}"
        )

    # 8. All Projects / Comparison
    if intent in ("projects_list", "project_comparison"):
        lines = []
        for p in PROJECTS[:5]:
            link = f" — {_clean_link(p['live_label'], p['live_url'])}" if p.get("live_url") else " — *(In Development / Offline)*"
            lines.append(f"• **{p['name']}** *({p['category']})*: {p['solution']}{link}")
        if language == "tanglish":
            return "### SAKRA VISION Flagship Products\n\n" + "\n".join(lines) + "\n\nMeeku eh project gurinchi deeper tech details kavali?"
        if language == "telugu":
            return "### SAKRA VISION ప్రధాన ప్రాజెక్టులు\n\n" + "\n".join(lines)
        return "### SAKRA VISION Products\n\n" + "\n".join(lines)

    # 9. Services
    if intent == "services":
        svc_lines = "\n".join(f"• **{s['name']}**: {s['summary']}" for s in SERVICES)
        email1_link = f"[{ORGANIZATION['emails'][0]}](mailto:{ORGANIZATION['emails'][0]})"
        if language == "tanglish":
            return (
                "### SAKRA VISION Services\n\n"
                f"{svc_lines}\n\n"
                "Meeru kotha product build cheyalante Website lo **Smart Project Brief** leda **Schedule Consultation** use cheyyachu."
            )
        if language == "telugu":
            return f"### SAKRA VISION సేవలు\n\n{svc_lines}"
        return (
            f"### SAKRA VISION Engineering Capabilities\n\n{svc_lines}\n\n"
            f"• Ready to discuss a scope? Reach out at {email1_link} or {_clean_link('Open Google Meet Consultation', ORGANIZATION['consultation']['meet_url'])}."
        )

    # 10. Start a Project
    if intent == "start_project":
        email1_link = f"[{ORGANIZATION['emails'][0]}](mailto:{ORGANIZATION['emails'][0]})"
        email2_link = f"[{ORGANIZATION['emails'][1]}](mailto:{ORGANIZATION['emails'][1]})"
        if language == "telugu":
            return (
                "### SAKRA VISION తో ప్రాజెక్ట్ ఎలా ప్రారంభించాలి?\n\n"
                "1. **Smart Project Brief**: వెబ్‌సైట్‌లోని Inquire విభాగంలో మీ అవసరాలు మరియు టైమ్‌లైన్‌ను పంపండి.\n"
                f"2. **Google Meet కన్సల్టేషన్**: {_clean_link('Open Google Meet Consultation', ORGANIZATION['consultation']['meet_url'])} ({ORGANIZATION['consultation']['hours']})\n"
                f"3. **ఇమెయిల్**: {email1_link}"
            )
        if language == "tanglish":
            return (
                "### Project Ela Start Cheyali?\n\n"
                "1. **Smart Project Brief**: Website lo **Inquire** tab open chesi mee idea, requirements, mariyu timeline pampandi.\n"
                f"2. **1-on-1 Google Meet**: {_clean_link('Open Google Meet Consultation', ORGANIZATION['consultation']['meet_url'])} ({ORGANIZATION['consultation']['hours']})\n"
                f"3. **Email**: {email1_link}"
            )
        return (
            "### Starting a Project with SAKRA VISION\n\n"
            "1. **Smart Project Brief**: Open the **Inquire** page on this site to walk through your project type, scope, and timeline.\n"
            f"2. **Schedule Consultation**: Book a slot on the **Book** page or join {_clean_link('Open Google Meet Consultation', ORGANIZATION['consultation']['meet_url'])} ({ORGANIZATION['consultation']['hours']}).\n"
            f"3. **Primary Email**: {email1_link}\n"
            f"4. **Secondary Email**: {email2_link}"
        )

    # 11. Contact & Social Links
    if intent in ("contact", "social_links"):
        meet_link = _clean_link("Open Google Meet Consultation", ORGANIZATION["consultation"]["meet_url"])
        insta_link = _clean_link("View Likith on Instagram", FOUNDER["instagram"])
        portfolio_link = _clean_link("Visit Likith's Portfolio", FOUNDER["portfolio"])
        website_link = _clean_link("Visit SAKRA VISION Website", ORGANIZATION["website"])
        email1_link = f"[{ORGANIZATION['emails'][0]}](mailto:{ORGANIZATION['emails'][0]})"
        email2_link = f"[{ORGANIZATION['emails'][1]}](mailto:{ORGANIZATION['emails'][1]})"
        if language == "telugu":
            return (
                "### సంప్రదించే వివరాలు\n\n"
                f"• **ప్రాథమిక ఇమెయిల్**: {email1_link}\n"
                f"• **ప్రత్యామ్నాయ ఇమెయిల్**: {email2_link}\n"
                f"• **Google Meet**: {meet_link} ({ORGANIZATION['consultation']['hours']})\n"
                f"• **Instagram**: {insta_link} ({FOUNDER['instagram_handle']})\n"
                f"• **Portfolio**: {portfolio_link}"
            )
        if language == "tanglish":
            return (
                "### SAKRA VISION Contact Details\n\n"
                f"• **Primary Email**: {email1_link}\n"
                f"• **Secondary Email**: {email2_link}\n"
                f"• **Google Meet**: {meet_link} ({ORGANIZATION['consultation']['hours']})\n"
                f"• **Instagram**: {insta_link}\n"
                f"• **Portfolio**: {portfolio_link}"
            )
        return (
            "### Contact SAKRA VISION\n\n"
            f"• **Primary Email**: {email1_link}\n"
            f"• **Secondary Email**: {email2_link}\n"
            f"• **Google Meet**: {meet_link} ({ORGANIZATION['consultation']['hours']})\n"
            f"• **Founder Portfolio**: {portfolio_link}\n"
            f"• **Instagram**: {insta_link}\n"
            f"• **Website**: {website_link}"
        )

    # 12. Research Lab
    if intent == "research":
        return (
            "### SAKRA Research Lab\n"
            "Our applied R&D lab explores practical engineering directions grounded in studio work:\n\n"
            + "\n".join(f"• {item}" for item in TECH_STACK["explored"]["items"])
            + f"\n\n• You can browse all notes directly under **Research Lab** in the top navigation or inspect **BenchAI**'s offline RAG design."
        )

    # 13. Company overview ("Mee company em chesthundi?", "What is SAKRA VISION?")
    if intent == "company":
        if language == "telugu":
            return (
                "### SAKRA VISION (సక్ర విజన్)\n"
                "**AI Product Studio · స్థాపన: 2026**\n\n"
                "లిఖిత్ నాయుడు అనుమకొండ స్థాపించిన **SAKRA VISION**, AI అప్లికేషన్లు, Computer Vision, LLM/RAG టూల్స్, "
                "ఆటోమేషన్ మరియు ఫుల్-స్టాక్ వెబ్ ప్రొడక్టులను నిర్మిస్తుంది.\n\n"
                "• **ప్రధాన ప్రొడక్టులు**: **Prometheus AI V2.0** (Edge GenAI), **RESOLVIT AI** (Civic-Tech), "
                "**BenchAI** (Offline Study RAG), **Event Hub**, మరియు **AquaSentinel AI**.\n"
                f"• {_clean_link('Explore RESOLVIT AI', 'https://www.resolvit-ai.online/')} · "
                f"{_clean_link('Visit SAKRA VISION Website', ORGANIZATION['website'])}"
            )
        if language == "tanglish":
            return (
                "### SAKRA VISION (@sakravision)\n"
                "**AI Product Studio · Est. 2026**\n\n"
                f"**{FOUNDER['full_name']}** sthapinchina **SAKRA VISION**, real-world AI applications, Computer Vision systems, "
                "LLM/RAG pipelines, workflow automation, mariyu full-stack web products ni build chesthundi.\n\n"
                "• **Key Products**: Prometheus AI V2.0, RESOLVIT AI, BenchAI (In Development), Event Hub, mariyu AquaSentinel AI.\n"
                "• Meeku products gurinchi, tech stack gurinchi, leda project start cheyadam gurinchi adagachu!"
            )
        return (
            "### SAKRA VISION (@sakravision)\n"
            f"Founded in 2026 by **{FOUNDER['full_name']}**, SAKRA VISION is an AI product studio building practical software across "
            "AI/ML applications, Computer Vision, local & cloud RAG systems, automation workflows, and full-stack web platforms.\n\n"
            f"• **Flagship Products**: Prometheus AI V2.0, RESOLVIT AI, BenchAI, SAKRA VISION Event Hub, AquaSentinel AI.\n"
            f"• {_clean_link('Visit SAKRA VISION Website', ORGANIZATION['website'])}"
        )

    # 14. Greeting
    if intent == "greeting":
        if language == "telugu":
            return "నమస్కారం! నేను SAKRA-BOT. SAKRA VISION ప్రొడక్టులు, టెక్నాలజీ స్టాక్ లేదా కొత్త ప్రాజెక్ట్ గురించి మీకు ఎలా సహాయపడగలను?"
        if language == "tanglish":
            return "Namaskaram! Nenu SAKRA-BOT. SAKRA VISION projects, tech stack, founder Likith, leda mee project gurinchi em telusukovalani undi?"
        return "Hello! I'm SAKRA-BOT. What would you like to know about SAKRA VISION's products, technology stack, or starting a project?"

    # 15. General / Unknown / Out-of-scope (be transparent, no irrelevant marketing menu)
    if language == "telugu":
        return (
            "ప్రస్తుతం లైవ్ AI మోడల్ అందుబాటులో లేని కారణంగా ఆఫ్‌లైన్ నాలెడ్జ్ మోడ్‌లో స్పందిస్తున్నాను. "
            "ఈ ప్రశ్న నా పరిధికి బయట ఉన్నది కావొచ్చు — కానీ SAKRA VISION ప్రొడక్టులు, టెక్నాలజీ స్టాక్, ఫౌండర్ వివరాలు, సంప్రదింపు సమాచారం లేదా గణిత లెక్కలపై స్పష్టమైన సమాధానం ఇవ్వగలను."
        )
    if language == "tanglish":
        return (
            "Prasthutham offline studio knowledge mode lo unnanu kabatti, ee general topic ki live search cheyyalenu. "
            "Kani SAKRA VISION products, tech stack, founder Likith details, project process, leda math calculations gurinchi adagandi!"
        )
    return (
        "I don't have verified information to answer that outside topic while operating in offline studio fallback mode. "
        "I can reliably help with SAKRA VISION's products (Prometheus AI V2.0, RESOLVIT AI, BenchAI, Event Hub, AquaSentinel AI), "
        "verified technology stack, founder biography, contacting the studio, or arithmetic calculations."
    )
