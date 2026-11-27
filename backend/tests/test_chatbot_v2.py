import os
import sys
import json
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import httpx
from fastapi.testclient import TestClient

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_DIR.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Use isolated temp SQLite database for automated test suite
import tempfile
test_db = os.path.join(tempfile.gettempdir(), "sakra_pytest_v2.db")
if os.path.exists(test_db):
    os.remove(test_db)

import database
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

database.engine = create_engine(f"sqlite:///{test_db}", connect_args={"check_same_thread": False})
database.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=database.engine)

import main
import chatbot_service
import knowledge_base
from config import settings

database.create_tables()
client = TestClient(main.app)
HEADERS = {"X-Secret-Token": settings.SECRET_TOKEN}

BANNED_FOUNDER_PHRASES = [
    "Lead AI Architect",
    "Lead Architect",
    "Python Full-Stack Developer",
    "IIT Patna",
    "likith-portfolio.online",
]


def _assert_no_banned_founder_terms(text: str):
    lower = text.lower()
    for banned in BANNED_FOUNDER_PHRASES:
        assert banned.lower() not in lower, f"Banned/outdated founder phrase leaked: {banned}"


def test_knowledge_sources_have_zero_conflicts():
    kb_files = [
        BACKEND_DIR / "knowledge_base.py",
        BACKEND_DIR / "chatbot_service.py",
        REPO_ROOT / "frontend" / "src" / "data" / "knowledge.js",
        REPO_ROOT / "frontend" / "src" / "utils" / "chatbotHelper.js",
        REPO_ROOT / "frontend" / "src" / "components" / "AiResponseRenderer.jsx",
    ]
    for path in kb_files:
        content = path.read_text(encoding="utf-8")
        _assert_no_banned_founder_terms(content)

    # Verify authentic founder truth is present across primary sources
    kb_py = (BACKEND_DIR / "knowledge_base.py").read_text(encoding="utf-8")
    kb_js = (REPO_ROOT / "frontend" / "src" / "data" / "knowledge.js").read_text(encoding="utf-8")
    for text in (kb_py, kb_js):
        assert "Likith Naidu Anumakonda" in text
        assert "PBR VITS, Kavali" in text
        assert "Echoes of an Unsaid Goodbye" in text
        assert "https://likith-naidu-anumakonda.online/" in text
        assert "https://www.instagram.com/likhithnaidu_anumakonda" in text


def test_mandatory_queries_fallback_and_math():
    with patch.object(settings, "GROQ_API_KEY", ""):
        # 1. Tech stack grouped cleanly
        r1 = client.post("/api/chat", json={"message": "What technologies and stack do you use?"}, headers=HEADERS)
        assert r1.status_code == 200
        d1 = r1.json()
        assert d1["source"] == "fallback"
        assert "Deployed in Live" in d1["reply"]
        assert "In-Development" in d1["reply"]
        assert "BenchAI" in d1["reply"]
        _assert_no_banned_founder_terms(d1["reply"])

        # 2. Project-specific stack (RESOLVIT)
        r2 = client.post("/api/chat", json={"message": "What technologies are used in RESOLVIT?"}, headers=HEADERS)
        assert r2.status_code == 200
        d2 = r2.json()
        assert "Next.js" in d2["reply"] and "PostgreSQL" in d2["reply"]
        assert "Apple MLX" not in d2["reply"]  # Should not mix Prometheus tech into RESOLVIT

        # 3. Founder identity
        r3 = client.post("/api/chat", json={"message": "Who is Likith Naidu Anumakonda?"}, headers=HEADERS)
        assert r3.status_code == 200
        d3 = r3.json()
        assert "Founder & CEO" in d3["reply"]
        assert "PBR VITS, Kavali" in d3["reply"]
        assert "Echoes of an Unsaid Goodbye" in d3["reply"]
        assert "https://likith-naidu-anumakonda.online/" in d3["reply"]
        _assert_no_banned_founder_terms(d3["reply"])

        # 4. "nenu evaru?" without context must NOT assume user is Likith
        r4a = client.post("/api/chat", json={"message": "nenu evaru?"}, headers=HEADERS)
        assert r4a.status_code == 200
        d4a = r4a.json()
        assert d4a["language"] == "tanglish"
        assert "cheppaledu" in d4a["reply"].lower() or "guess" in d4a["reply"].lower()
        assert "you are likith" not in d4a["reply"].lower()

        # 4b. "nenu evaru?" WITH context identifying Likith
        r4b = client.post(
            "/api/chat",
            json={
                "message": "nenu evaru?",
                "history": [{"sender": "user", "text": "Nenu Likith ni"}],
            },
            headers=HEADERS,
        )
        assert r4b.status_code == 200
        assert "Likith Naidu Anumakonda" in r4b.json()["reply"]

        # 5. "Telugu lo cheppu." switches & persists Telugu for follow-up
        r5 = client.post(
            "/api/chat",
            json={
                "message": "Telugu lo cheppu.",
                "history": [{"sender": "user", "text": "Who is Likith Naidu Anumakonda?"}],
            },
            headers=HEADERS,
        )
        assert r5.status_code == 200
        d5 = r5.json()
        assert d5["language"] == "telugu"
        assert any("\u0C00" <= ch <= "\u0C7F" for ch in d5["reply"])

        # Follow-up in Telugu session remains Telugu
        r5_followup = client.post(
            "/api/chat",
            json={
                "message": "What is BenchAI?",
                "history": [
                    {"sender": "user", "text": "Telugu lo cheppu."},
                    {"sender": "bot", "text": d5["reply"]},
                ],
            },
            headers=HEADERS,
        )
        assert r5_followup.status_code == 200
        assert r5_followup.json()["language"] == "telugu"
        assert any("\u0C00" <= ch <= "\u0C7F" for ch in r5_followup.json()["reply"])

        # 6. Tanglish query
        r6 = client.post("/api/chat", json={"message": "Mee company em chesthundi?"}, headers=HEADERS)
        assert r6.status_code == 200
        assert r6.json()["language"] == "tanglish"
        assert "SAKRA VISION" in r6.json()["reply"]

        # 7 & 8. Prometheus AI and BenchAI
        r7 = client.post("/api/chat", json={"message": "Explain Prometheus AI."}, headers=HEADERS)
        assert "Apple MLX" in r7.json()["reply"] and "prometheuslikiths-ai.online" in r7.json()["reply"]
        r8 = client.post("/api/chat", json={"message": "What is BenchAI?"}, headers=HEADERS)
        assert "FAISS" in r8.json()["reply"] and "In Development" in r8.json()["reply"]

        # 9 & 10. Start project (even after prior project history) & clickable mailto contact email
        r9 = client.post(
            "/api/chat",
            json={
                "message": "How can I start a project?",
                "history": [
                    {"sender": "user", "text": "Explain Prometheus AI."},
                    {"sender": "bot", "text": r7.json()["reply"]},
                ],
            },
            headers=HEADERS,
        )
        assert "Starting a Project" in r9.json()["reply"] and "Smart Project Brief" in r9.json()["reply"]
        r10 = client.post("/api/chat", json={"message": "What is your contact email?"}, headers=HEADERS)
        assert "[likith.anumakonda@gmail.com](mailto:likith.anumakonda@gmail.com)" in r10.json()["reply"]
        assert "mailto:likith.naidu@icloud.com" in r10.json()["reply"]

        # 11. Math expression 8*8-9*21-827 = -952
        r11 = client.post("/api/chat", json={"message": "8*8-9*21-827"}, headers=HEADERS)
        assert r11.status_code == 200
        assert "-952" in r11.json()["reply"]
        assert "Welcome to SAKRA VISION" not in r11.json()["reply"]

        # 12. Asking the same question three times varies output cleanly
        hist = [
            {"sender": "user", "text": "Explain Prometheus AI."},
            {"sender": "bot", "text": r7.json()["reply"]},
            {"sender": "user", "text": "Explain Prometheus AI."},
            {"sender": "bot", "text": "Quick recap..."},
        ]
        r12 = client.post("/api/chat", json={"message": "Explain Prometheus AI.", "history": hist}, headers=HEADERS)
        assert "already covered" in r12.json()["reply"].lower()

        # 13. Follow-up question pronoun resolution even after earlier multi-project list
        r13 = client.post(
            "/api/chat",
            json={
                "message": "What stack does it use?",
                "history": [
                    {"sender": "user", "text": "Mee company em chesthundi?"},
                    {"sender": "bot", "text": r6.json()["reply"]},
                    {"sender": "user", "text": "What does AquaSentinel AI do?"},
                    {"sender": "bot", "text": "AquaSentinel AI uses satellite weather and mapping."},
                ],
            },
            headers=HEADERS,
        )
        assert "OpenWeather" in r13.json()["reply"] and "OpenStreetMap" in r13.json()["reply"]
        assert "Apple MLX" not in r13.json()["reply"]

        # 14. English -> Telugu -> Tanglish transition
        r14_te = client.post(
            "/api/chat",
            json={
                "message": "Telugu lo cheppu",
                "history": [{"sender": "user", "text": "What does SAKRA VISION build?"}],
            },
            headers=HEADERS,
        )
        assert r14_te.json()["language"] == "telugu"
        r14_tg = client.post(
            "/api/chat",
            json={
                "message": "RESOLVIT gurinchi cheppu",
                "history": [
                    {"sender": "user", "text": "Telugu lo cheppu"},
                    {"sender": "bot", "text": r14_te.json()["reply"]},
                ],
            },
            headers=HEADERS,
        )
        assert r14_tg.json()["language"] == "tanglish"
        assert "RESOLVIT AI" in r14_tg.json()["reply"]

        # 15. Special characters & URLs do not fail validation
        r15 = client.post(
            "/api/chat",
            json={"message": "Check https://example.com/path?a=1&b=2 with symbols * # @ & <https://test.dev>"},
            headers=HEADERS,
        )
        assert r15.status_code == 200
        assert r15.json()["success"] is True


def test_groq_config_success_and_error_fallback_handling():
    assert settings.GROQ_MODEL == "llama-3.1-8b-instant"

    # A. Mock successful Groq response and check payload sends configured model + strips system messages
    mock_ok_response = MagicMock()
    mock_ok_response.status_code = 200
    mock_ok_response.json.return_value = {
        "model": "llama-3.1-8b-instant",
        "choices": [{"message": {"content": "RESOLVIT AI uses Next.js, FastAPI, and PostgreSQL."}}],
    }

    captured_payloads = []

    async def fake_post_ok(url, headers=None, json=None):
        captured_payloads.append(json)
        return mock_ok_response

    with patch.object(settings, "GROQ_API_KEY", "gsk_test_dummy_key"):
        with patch("chatbot_service.httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client.post = AsyncMock(side_effect=fake_post_ok)
            mock_client_cls.return_value.__aenter__.return_value = mock_client

            r_ok = client.post(
                "/api/chat",
                json={
                    "message": "What does RESOLVIT use?",
                    "history": [
                        {"sender": "system", "text": "Thanks for the feedback!"},
                        {"sender": "bot", "text": "Welcome to SAKRA VISION."},
                        {"sender": "user", "text": "Hi"},
                    ],
                },
                headers=HEADERS,
            )
            assert r_ok.status_code == 200
            body_ok = r_ok.json()
            assert body_ok["source"] == "groq"
            assert body_ok["model"] == "llama-3.1-8b-instant"
            sent_roles_contents = captured_payloads[0]["messages"]
            assert captured_payloads[0]["model"] == "llama-3.1-8b-instant"
            assert captured_payloads[0]["temperature"] == 0.3
            assert all("Thanks for the feedback" not in m["content"] for m in sent_roles_contents)

        # B. Groq timeout -> clean fallback without error crash
        with patch("chatbot_service.httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client.post = AsyncMock(side_effect=httpx.ReadTimeout("Timed out"))
            mock_client_cls.return_value.__aenter__.return_value = mock_client

            r_timeout = client.post("/api/chat", json={"message": "What is BenchAI?"}, headers=HEADERS)
            assert r_timeout.status_code == 200
            bt = r_timeout.json()
            assert bt["source"] == "fallback"
            assert bt["fallback_reason"] == "groq_timeout"
            assert "BenchAI" in bt["reply"]

        # C. Groq 429 rate-limit -> clean fallback
        mock_429 = MagicMock()
        mock_429.status_code = 429
        mock_429.headers = {"retry-after": "3"}
        with patch("chatbot_service.httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client.post = AsyncMock(return_value=mock_429)
            mock_client_cls.return_value.__aenter__.return_value = mock_client

            r_429 = client.post("/api/chat", json={"message": "8*8-9*21-827"}, headers=HEADERS)
            assert r_429.status_code == 200
            b429 = r_429.json()
            assert b429["source"] == "fallback"
            assert b429["fallback_reason"] == "groq_rate_limited"
            assert "-952" in b429["reply"]


def test_feedback_persistence_mutually_exclusive_and_session_isolated():
    msg_id = "msg_unique_test_1"
    sess_a = "sess_alpha"
    sess_b = "sess_beta"

    # 1. Submit LIKE
    r_like = client.post(
        "/api/chat/feedback",
        json={"message_id": msg_id, "session_id": sess_a, "feedback": "LIKE", "user_query": "hi"},
        headers=HEADERS,
    )
    assert r_like.status_code == 200
    assert r_like.json()["feedback"] == "LIKE"

    # 2. Switch to DISLIKE on same message -> updates single DB row, never creates duplicate contradictory row
    r_dislike = client.post(
        "/api/chat/feedback",
        json={"message_id": msg_id, "session_id": sess_a, "feedback": "DISLIKE", "user_query": "hi"},
        headers=HEADERS,
    )
    assert r_dislike.status_code == 200
    assert r_dislike.json()["feedback"] == "DISLIKE"

    # 3. Another session rating same message_id remains isolated
    r_other = client.post(
        "/api/chat/feedback",
        json={"message_id": msg_id, "session_id": sess_b, "feedback": "LIKE"},
        headers=HEADERS,
    )
    assert r_other.status_code == 200

    db = database.SessionLocal()
    try:
        rows_a = db.query(database.Base.metadata.tables["chatbot_feedback"]).filter_by(
            message_id=msg_id, session_id=sess_a
        ).all()
        rows_b = db.query(database.Base.metadata.tables["chatbot_feedback"]).filter_by(
            message_id=msg_id, session_id=sess_b
        ).all()
        assert len(rows_a) == 1
        assert rows_a[0].feedback_type == "DISLIKE"
        assert len(rows_b) == 1
        assert rows_b[0].feedback_type == "LIKE"
    finally:
        db.close()

    # 4. Clear feedback removes only session A row
    r_clear = client.post(
        "/api/chat/feedback",
        json={"message_id": msg_id, "session_id": sess_a, "feedback": "CLEAR"},
        headers=HEADERS,
    )
    assert r_clear.status_code == 200
    assert r_clear.json()["feedback"] == "CLEAR"

    db = database.SessionLocal()
    try:
        rows_a_after = db.query(database.Base.metadata.tables["chatbot_feedback"]).filter_by(
            message_id=msg_id, session_id=sess_a
        ).all()
        rows_b_after = db.query(database.Base.metadata.tables["chatbot_feedback"]).filter_by(
            message_id=msg_id, session_id=sess_b
        ).all()
        assert len(rows_a_after) == 0
        assert len(rows_b_after) == 1
    finally:
        db.close()
