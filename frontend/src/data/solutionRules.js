export const SOLUTION_SERVICES = [
  {
    id: 'ai-app',
    label: 'AI Application Development',
    briefType: 'AI/ML Application',
    category: 'Intelligent AI Applications',
    desc: 'End-to-end cognitive web or desktop products combining trained models, user interfaces, and backend orchestration.',
    approach:
      'Pair a responsive React or Next.js interface with an asynchronous FastAPI service layer that orchestrates model inference, structured validation, and database persistence.',
    technologies: ['Python', 'FastAPI', 'React', 'Next.js', 'PostgreSQL', 'REST APIs'],
    relatedProjectIds: ['resolvit-ai', 'aquasentinel-ai']
  },
  {
    id: 'ml',
    label: 'Machine Learning Solutions',
    briefType: 'AI/ML Application',
    category: 'Applied Machine Learning & Classification',
    desc: 'Custom scoring, prioritization, anomaly checks, and domain-specific predictive pipelines.',
    approach:
      'Establish clean training/inference data schemas, wrap scoring logic behind typed FastAPI endpoints, and connect predictions directly into operational dashboards.',
    technologies: ['Python', 'TensorFlow', 'PyTorch', 'NumPy', 'FastAPI', 'MySQL / PostgreSQL'],
    relatedProjectIds: ['resolvit-ai']
  },
  {
    id: 'cv',
    label: 'Computer Vision',
    briefType: 'Computer Vision',
    category: 'Computer Vision & OCR Systems',
    desc: 'Automated image scanning, duplicate detection, receipt/document OCR, and contour verification pipelines.',
    approach:
      'Build an OpenCV preprocessing and verification stage (boundary filtering, OCR parsing, or object detection) connected to automated approval or reporting workflows.',
    technologies: ['OpenCV', 'YOLO', 'Python OCR', 'NumPy', 'FastAPI'],
    relatedProjectIds: ['event-hub', 'resolvit-ai']
  },
  {
    id: 'agents',
    label: 'AI Agent Development',
    briefType: 'AI Agent',
    category: 'Autonomous & Tool-Calling AI Agents',
    desc: 'Multi-step reasoning workflows that inspect context, invoke tools or webhooks, and execute structured actions.',
    approach:
      'Design constrained tool-calling loops with explicit schema validation, rate limits, fallback logic, and audit logging before triggering automated downstream tasks.',
    technologies: ['Python', 'LangChain Agents', 'Tool Calling', 'Groq API', 'FastAPI', 'Webhooks'],
    relatedProjectIds: ['prometheus-ai']
  },
  {
    id: 'llm-rag',
    label: 'LLM and RAG Systems',
    briefType: 'AI/ML Application',
    category: 'LLM & Retrieval-Augmented Generation',
    desc: 'Document assistants, semantic search, and offline/cloud knowledge retrieval grounded in your own materials.',
    approach:
      'Parse source documents into chunked metadata, index embeddings locally with FAISS or vector stores, and ground LLM generation (local Ollama/Llama or cloud APIs) strictly on retrieved context.',
    technologies: ['LangChain', 'FAISS', 'Ollama / Llama', 'Groq API', 'Python', 'FastAPI'],
    relatedProjectIds: ['bench-ai', 'prometheus-ai']
  },
  {
    id: 'web-app',
    label: 'Web Application Development',
    briefType: 'Web Application',
    category: 'Full-Stack Web Platforms',
    desc: 'Production React/Next.js applications with JWT authentication, admin dashboards, and cloud databases.',
    approach:
      'Architect a modular React/Vite or Next.js frontend backed by FastAPI or Spring Boot APIs, JWT security gates, Turnstile bot protection, and SSL-backed MySQL or PostgreSQL storage.',
    technologies: ['React', 'Next.js', 'FastAPI', 'Spring Boot', 'MySQL / PostgreSQL', 'JWT'],
    relatedProjectIds: ['event-hub', 'resolvit-ai']
  },
  {
    id: 'automation',
    label: 'Workflow Automation',
    briefType: 'Automation',
    category: 'Process & Event Automation Systems',
    desc: 'Eliminating repetitive manual verification, file processing, email dispatch, and scheduled operational tasks.',
    approach:
      'Replace manual spreadsheets or CLI routines with automated validation scripts, webhook triggers, email notifications (Resend API), and clean admin review controls.',
    technologies: ['Python', 'FastAPI', 'Cron / Schedulers', 'Resend API', 'Webhooks', 'Tkinter / PyQt'],
    relatedProjectIds: ['event-hub', 'python-gui-utility']
  },
  {
    id: 'data',
    label: 'Data Processing and Intelligence',
    briefType: 'AI/ML Application',
    category: 'Data Ingestion & Decision Intelligence',
    desc: 'Consolidating external APIs, spatial mapping, and batch file pipelines into clear operational views.',
    approach:
      'Normalize multi-source feeds (external APIs, spatial layers, or local batches) into structured relational tables and surface actionable summaries through clean UI views.',
    technologies: ['Python', 'SQLAlchemy', 'PostgreSQL / MySQL', 'OpenStreetMap', 'REST APIs'],
    relatedProjectIds: ['aquasentinel-ai', 'python-gui-utility']
  }
];

export const PROJECT_STAGES = [
  {
    id: 'idea',
    label: 'Idea',
    timelineHint: 'Within 1 Month',
    nextStep:
      'Start with a focused Discovery & Architecture Scoping call to validate constraints, data availability, and a realistic first milestone.'
  },
  {
    id: 'research',
    label: 'Research',
    timelineHint: 'Within 1 Month',
    nextStep:
      'Run a time-boxed technical feasibility prototype to test model behavior, accuracy constraints, and data preprocessing before full buildout.'
  },
  {
    id: 'prototype',
    label: 'Prototype',
    timelineHint: 'Within 1 Month',
    nextStep:
      'Refactor the working prototype into structured FastAPI/frontend modules with validation, authentication, and clean error handling.'
  },
  {
    id: 'existing',
    label: 'Existing Application',
    timelineHint: '1-3 months',
    nextStep:
      'Audit existing API contracts and database schemas so new AI, vision, or automation capabilities integrate cleanly without disrupting live users.'
  },
  {
    id: 'production',
    label: 'Production Upgrade',
    timelineHint: '1-3 months',
    nextStep:
      'Prioritize rate limiting, input sanitization, database indexing, fallback handling, and responsive UI hardening for reliable deployment.'
  }
];

export function buildDeterministicRecommendation(serviceId, stageId, problemText) {
  const service =
    SOLUTION_SERVICES.find((s) => s.id === serviceId) || SOLUTION_SERVICES[0];
  const stage =
    PROJECT_STAGES.find((st) => st.id === stageId) || PROJECT_STAGES[0];

  const lowerProblem = (problemText || '').toLowerCase();
  const extraHints = [];

  if (/\b(offline|local|privacy|private|no internet)\b/.test(lowerProblem)) {
    extraHints.push('Consider local-first execution (Ollama / FAISS) to keep data on-device.');
  }
  if (/\b(image|photo|receipt|screenshot|scan|ocr|camera|video)\b/.test(lowerProblem)) {
    extraHints.push('Include an image validation and OCR/OpenCV preprocessing stage.');
  }
  if (/\b(email|notify|approval|registration|payment|admin)\b/.test(lowerProblem)) {
    extraHints.push('Pair automated webhook/email confirmation with an admin review queue.');
  }

  return {
    service,
    stage,
    extraHints
  };
}
