export const RESEARCH_CATEGORIES = [
  'All',
  'Artificial Intelligence',
  'Machine Learning',
  'Large Language Models',
  'Computer Vision',
  'AI Agents',
  'Retrieval-Augmented Generation',
  'Data Intelligence',
  'Automation',
  'Experimental Applications'
];

export const RESEARCH_STATUS_STYLES = {
  'In Development': {
    badge: 'bg-sky-500/15 text-[#38bdf8] border-[#38bdf8]/40',
    desc: 'Active engineering iteration connected to a live studio product roadmap.'
  },
  'Experimental Prototype': {
    badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/35',
    desc: 'Working technical prototype validating feasibility on real hardware or workflows.'
  },
  'Technical Exploration': {
    badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/35',
    desc: 'Focused engineering investigation improving robustness, pipelines, or preprocessing.'
  },
  'Research Concept': {
    badge: 'bg-white/10 text-slate-200 border-white/25',
    desc: 'Architectural design study shaping upcoming studio capabilities.'
  }
};

const researchData = [
  {
    id: 'offline-classroom-rag',
    title: 'Offline Classroom RAG & Local Vector Retrieval',
    primaryCategory: 'Retrieval-Augmented Generation',
    categories: [
      'Retrieval-Augmented Generation',
      'Large Language Models',
      'Artificial Intelligence'
    ],
    status: 'In Development',
    groundedIn: 'BenchAI',
    relatedProjectId: 'bench-ai',
    summary:
      'Exploring document chunking, local FAISS vector indexing, and on-device Llama orchestration so educational Q&A works completely offline inside resource-constrained classrooms.',
    motivation:
      'Many schools and underserved learning centers lack dependable broadband connectivity, making cloud-hosted AI tutors impractical or completely inaccessible during day-to-day lessons.',
    approach:
      'Course textbooks and lecture slides are parsed locally via Python loaders, divided into overlapping segments with LangChain text splitters, and indexed in a local FAISS vector store. Queries retrieve grounded passages first and pass bounded context prompts to local Llama weights served via Ollama.',
    openQuestions: [
      'Balancing chunk overlap size between dense STEM chapters and concise slide decks.',
      'Keeping vector index lookup responsive alongside local LLM memory budgets on standard classroom hardware.',
      'Presenting clear source excerpts alongside answers so students can verify material directly.'
    ],
    technologies: ['Python', 'LangChain', 'FAISS Vector Search', 'Ollama', 'Llama']
  },
  {
    id: 'edge-voice-mlx-orchestration',
    title: 'Edge Voice Inference & Apple MLX Orchestration',
    primaryCategory: 'Large Language Models',
    categories: [
      'Large Language Models',
      'AI Agents',
      'Experimental Applications'
    ],
    status: 'Experimental Prototype',
    groundedIn: 'Prometheus AI V2.0',
    relatedProjectId: 'prometheus-ai',
    summary:
      'Validating low-latency voice transcription paired with local Apple MLX hardware acceleration and FastAPI routing so personal AI workflows run offline with zero cloud telemetry.',
    motivation:
      'Desktop and developer assistants handle sensitive local files and spoken notes where sending audio streams or prompts to external third-party APIs creates avoidable privacy and connectivity dependencies.',
    approach:
      'Local audio capture passes directly to an on-device Whisper transcription stage, which sends normalized command strings into a Python FastAPI router. Inference executes through local Ollama and Apple MLX runtimes before dispatching synthesized replies or local desktop workflows.',
    openQuestions: [
      'Minimizing end-to-end delay between speech endpoint detection and first-token response streaming.',
      'Coordinating safe handoffs between conversational responses and shell/automation commands.'
    ],
    technologies: ['Python', 'FastAPI', 'Whisper (Local)', 'Ollama', 'Apple MLX']
  },
  {
    id: 'opencv-payment-ocr-verification',
    title: 'Automated Payment Receipt Verification via OpenCV & OCR',
    primaryCategory: 'Computer Vision',
    categories: ['Computer Vision', 'Automation'],
    status: 'Technical Exploration',
    groundedIn: 'SAKRA VISION Event Hub & OpenCV Tools',
    relatedProjectId: 'event-hub',
    summary:
      'Refining image preprocessing, contour normalization, and OCR extraction pipelines so varied mobile payment screenshots verify cleanly inside automated event registration workflows.',
    motivation:
      'Manual screenshot inspection creates bottlenecks during high-volume student and community registrations, yet mobile payment receipts vary significantly across devices, themes, and compression ratios.',
    approach:
      'Uploaded receipt images run through OpenCV preprocessing (grayscale contrast normalization, boundary filtering, and crop alignment) before OCR text parsing validates transaction fields against Spring Boot and FastAPI registration queues and triggers verification webhooks.',
    openQuestions: [
      'Improving character extraction stability across dark-mode payment apps and messaging compression.',
      'Handling ambiguous low-resolution captures gracefully via structured manual review fallbacks.'
    ],
    technologies: ['OpenCV', 'Python OCR', 'NumPy', 'FastAPI', 'Spring Boot']
  },
  {
    id: 'civic-issue-dedup-routing',
    title: 'AI Complaint Deduplication & Priority Triage for Civic Portals',
    primaryCategory: 'Artificial Intelligence',
    categories: ['Artificial Intelligence', 'Machine Learning', 'Computer Vision'],
    status: 'Experimental Prototype',
    groundedIn: 'RESOLVIT AI',
    relatedProjectId: 'resolvit-ai',
    summary:
      'Combining visual image verification, NLP text classification, and geospatial clustering in PostgreSQL to organize citizen infrastructure reports into actionable priority queues.',
    motivation:
      'Public grievance portals often receive repeated submissions for the same street-level issue, making it harder for municipal authorities and partner NGOs to separate urgent problems from duplicate noise.',
    approach:
      'Citizen submissions pair location coordinates and issue photos with a FastAPI pipeline that performs computer vision duplicate inspection and NLP category scoring before persisting indexed tickets in PostgreSQL alongside Google Maps layers.',
    openQuestions: [
      'Clustering nearby duplicate reports without merging genuinely distinct incidents on adjacent streets.',
      'Calibrating priority scoring criteria transparently so authorities understand why tickets escalate.'
    ],
    technologies: ['Next.js', 'FastAPI', 'PostgreSQL', 'Google Maps API', 'NLP Classification']
  },
  {
    id: 'marine-geospatial-telemetry',
    title: 'Multilingual Marine Safety & Spatial Zone Aggregation',
    primaryCategory: 'Data Intelligence',
    categories: ['Data Intelligence', 'Artificial Intelligence'],
    status: 'Technical Exploration',
    groundedIn: 'AquaSentinel AI',
    relatedProjectId: 'aquasentinel-ai',
    summary:
      'Investigating resilient API normalization and multilingual interface patterns for surfacing real-time marine weather alerts and OpenStreetMap boundary layers on coastal devices.',
    motivation:
      'Small-scale coastal communities rely on accessible mobile tools when sea conditions shift rapidly, requiring clear risk communication across regional languages and intermittent coastal networks.',
    approach:
      'External meteorological data streams and spatial maritime overlays are normalized through Python APIs and rendered onto responsive OpenStreetMap canvases paired with lightweight, multilingual condition summaries.',
    openQuestions: [
      'Compressing weather and spatial state updates for slow or unstable coastal mobile connections.',
      'Designing intuitive hazard indicators that stay legible in bright outdoor lighting.'
    ],
    technologies: ['Python', 'OpenStreetMap', 'Weather APIs', 'REST APIs', 'Multilingual UI']
  },
  {
    id: 'constrained-agent-guardrails',
    title: 'Schema-Validated Guardrails for Operational AI Agents',
    primaryCategory: 'AI Agents',
    categories: ['AI Agents', 'Automation', 'Large Language Models'],
    status: 'Research Concept',
    groundedIn: 'SAKRA VISION Agent Architecture Studies',
    relatedProjectId: null,
    summary:
      'Conceptual engineering patterns for constraining multi-step LLM tool-calling loops behind typed validation schemas, rate limits, and audit logs before webhook execution.',
    motivation:
      'Unconstrained autonomous agents introduce unpredictable side effects when connected directly to production APIs, mail dispatchers, or enterprise datastores.',
    approach:
      'Separates reasoning steps from execution tools via typed Pydantic request contracts, SlowAPI rate boundaries, explicit fallback states, and auditable action summaries prior to committing external API calls.',
    openQuestions: [
      'Standardizing deterministic fallback paths when external webhooks or upstream inference APIs time out.',
      'Designing lightweight operator approval hooks for high-impact automated steps.'
    ],
    technologies: ['LangChain Agents', 'Tool Calling', 'Groq API', 'FastAPI', 'Pydantic']
  }
];

export default researchData;
