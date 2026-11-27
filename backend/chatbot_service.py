import logging
from typing import Optional, List, Dict, Any
import httpx

from config import settings
from knowledge_base import (
    clean_conversation_history,
    resolve_session_language,
    detect_intent_and_subject,
    count_repeated_question,
    build_grounded_context,
    resolve_intelligent_fallback,
)

logger = logging.getLogger("app.chatbot")

SYSTEM_PROMPT = """You are SAKRA-BOT V2.1, the AI Product Studio Assistant for SAKRA VISION (@sakravision), built by Likith Naidu Anumakonda.

CORE GUIDELINES:
1. ACCURACY & HONESTY: Rely strictly on the GROUNDED CONTEXT supplied with this request for all facts about SAKRA VISION, its founder, projects, URLs, and technologies. Never invent features, credentials, certifications, metrics, user counts, or live URLs. If something is outside your verified knowledge, state that honestly.
2. FOUNDER IDENTITY RULES (STRICT): Use ONLY these verified details for Likith Naidu Anumakonda: Founder & CEO of SAKRA VISION, AI/ML Engineer, B.Tech CSE (Artificial Intelligence) student at PBR VITS, Kavali, Pianist, and Author of "Echoes of an Unsaid Goodbye". Do not mention any other job titles, degrees, or external institutional certifications not listed in GROUNDED CONTEXT.
3. TECH STACK CLARITY: Keep technologies actually deployed in live projects distinct from in-development tools (LangChain/FAISS in BenchAI) and Research Lab explorations. When asked about one project (e.g. RESOLVIT AI), name only that project's stack.
4. NATURAL CONVERSATION & ANTI-REPETITION: Answer only what is asked. Never paste generic welcome menus or long marketing intros after specific answers. If the user asks a repeated question, give a concise variation/summary rather than repeating the same text verbatim.
5. MULTILINGUAL PRECISION: Follow the ACTIVE RESPONSE LANGUAGE instruction strictly (English, Telugu script తెలుగు, or Tanglish). Keep technical terms, libraries, and project names in English when helpful.
6. CLEAN MARKDOWN & LINKS: Always format links cleanly as [Label](https://...) such as [Explore RESOLVIT AI](https://www.resolvit-ai.online/) or [Visit Likith's Portfolio](https://likith-naidu-anumakonda.online/). Never use a raw URL as the clickable link text and never nest Markdown links inside bold or brackets. Wrap math expressions safely in backticks (`...`) so asterisks are not turned into italics."""


async def get_chatbot_reply_payload(
    message: str,
    history: Optional[List[Any]] = None,
    preferred_language: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Executes SAKRA-BOT V2.1 request lifecycle:
    1. Sanitizes history (excluding UI welcome / feedback system notices).
    2. Detects active session language (English, Telugu, Tanglish).
    3. Retrieves relevant verified knowledge + safe math verification.
    4. Invokes configured Groq API model if API key is set.
    5. Gracefully handles timeout / 429 / HTTP errors via contextual multilingual fallback.
    """
    cleaned_history = clean_conversation_history(history)
    active_language = resolve_session_language(message or "", cleaned_history, preferred_language)
    intent, project = detect_intent_and_subject(message or "", cleaned_history)
    repeat_count = count_repeated_question(message or "", cleaned_history)

    if not message or not message.strip():
        fallback = resolve_intelligent_fallback("hi", cleaned_history, active_language)
        return {
            "reply": fallback,
            "source": "fallback",
            "language": active_language,
            "model": None,
            "fallback_reason": "empty_message",
        }

    grounded_context = build_grounded_context(
        intent=intent,
        project=project,
        cleaned_history=cleaned_history,
        message=message,
        language=active_language,
        repeat_count=repeat_count,
    )

    api_key = (settings.GROQ_API_KEY or "").strip()
    configured_model = (settings.GROQ_MODEL or "llama-3.1-8b-instant").strip()
    temperature = float(getattr(settings, "GROQ_TEMPERATURE", 0.3))
    max_tokens = int(getattr(settings, "GROQ_MAX_TOKENS", 700))
    timeout_sec = float(getattr(settings, "GROQ_TIMEOUT_SECONDS", 15.0))

    fallback_reason: Optional[str] = None

    if api_key:
        try:
            formatted_messages: List[Dict[str, str]] = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "system", "content": f"GROUNDED CONTEXT:\n{grounded_context}"},
            ]

            for item in cleaned_history[-8:]:
                formatted_messages.append({"role": item["role"], "content": item["content"]})

            formatted_messages.append({"role": "user", "content": message.strip()})

            async with httpx.AsyncClient(timeout=timeout_sec) as client:
                res = await client.post(
                    settings.GROQ_API_URL,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": configured_model,
                        "messages": formatted_messages,
                        "temperature": temperature,
                        "max_tokens": max_tokens,
                    },
                )

                if res.status_code == 200:
                    data = res.json()
                    choices = data.get("choices") or []
                    reply_text = (choices[0].get("message", {}).get("content", "") if choices else "").strip()
                    if reply_text:
                        return {
                            "reply": reply_text,
                            "source": "groq",
                            "language": active_language,
                            "model": data.get("model") or configured_model,
                            "fallback_reason": None,
                        }
                    fallback_reason = "groq_empty_response"
                elif res.status_code == 429:
                    retry_after = res.headers.get("retry-after")
                    logger.warning(f"Groq API rate limited (429). retry-after={retry_after}")
                    fallback_reason = "groq_rate_limited"
                else:
                    logger.warning(f"Groq API returned HTTP {res.status_code}")
                    fallback_reason = f"groq_http_{res.status_code}"

        except httpx.TimeoutException:
            logger.warning(f"Groq API request timed out after {timeout_sec}s")
            fallback_reason = "groq_timeout"
        except httpx.RequestError as exc:
            logger.error(f"Groq API transport error: {exc.__class__.__name__}")
            fallback_reason = "groq_network_error"
        except Exception as exc:
            logger.error(f"Unexpected Groq API error: {exc.__class__.__name__}")
            fallback_reason = "groq_unexpected_error"
    else:
        fallback_reason = "groq_unconfigured"

    fallback_reply = resolve_intelligent_fallback(message, cleaned_history, active_language)
    return {
        "reply": fallback_reply,
        "source": "fallback",
        "language": active_language,
        "model": None,
        "fallback_reason": fallback_reason,
    }


async def get_chatbot_reply(message: str, history: Optional[List[Dict[str, str]]] = None) -> str:
    payload = await get_chatbot_reply_payload(message, history)
    return payload["reply"]
