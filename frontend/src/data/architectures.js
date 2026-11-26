const architecturesData = {
  'prometheus-ai': {
    id: 'prometheus-ai',
    name: 'Prometheus AI V2.0',
    subtitle: 'Local-First Edge GenAI & Voice Pipeline',
    summary:
      'All voice transcription, FastAPI orchestration, and Llama inference execute directly on the user’s edge hardware without sending audio or prompts to external cloud APIs.',
    nodes: [
      {
        id: 'ui',
        label: 'Edge Terminal UI',
        layer: 'Interface',
        tech: 'Local Interactive Terminal',
        x: 12,
        y: 26,
        desc: 'Captures local user prompts, voice triggers, and displays streamed responses inside a zero-data-out desktop shell.'
      },
      {
        id: 'whisper',
        label: 'Voice Input (Whisper)',
        layer: 'Audio Processing',
        tech: 'Whisper (Local)',
        x: 12,
        y: 74,
        desc: 'Transcribes spoken audio logs directly on-device into structured text commands before handing off to backend routing.'
      },
      {
        id: 'fastapi',
        label: 'FastAPI Router',
        layer: 'Backend API',
        tech: 'Python · FastAPI',
        x: 42,
        y: 50,
        desc: 'Validates command strings, manages session state, and routes inference requests to the local model runtime.'
      },
      {
        id: 'ollama',
        label: 'Ollama + Llama Runtime',
        layer: 'LLM Engine',
        tech: 'Ollama · Llama Weights',
        x: 70,
        y: 26,
        desc: 'Loads and executes local Llama language model weights offline for conversational and agentic reasoning.'
      },
      {
        id: 'mlx',
        label: 'Apple MLX / Edge GPU',
        layer: 'Hardware Acceleration',
        tech: 'Apple MLX · Local GPUs',
        x: 70,
        y: 74,
        desc: 'Provides edge hardware tensor acceleration so localized inference responds with minimal latency.'
      },
      {
        id: 'response',
        label: 'Response & Shell Workflows',
        layer: 'Execution',
        tech: 'Offline Command Workflows',
        x: 90,
        y: 50,
        desc: 'Returns synthesized guidance or triggers safe local desktop command scripts.'
      }
    ],
    edges: [
      { from: 'ui', to: 'whisper', label: 'Audio capture' },
      { from: 'ui', to: 'fastapi', label: 'Text prompt' },
      { from: 'whisper', to: 'fastapi', label: 'Transcribed text' },
      { from: 'fastapi', to: 'ollama', label: 'Model call' },
      { from: 'ollama', to: 'mlx', label: 'Edge compute' },
      { from: 'mlx', to: 'response', label: 'Inference stream' },
      { from: 'ollama', to: 'response', label: 'Generated output' }
    ]
  },
  'resolvit-ai': {
    id: 'resolvit-ai',
    name: 'RESOLVIT AI',
    subtitle: 'Civic-Tech Issue Reporting, CV & Priority Pipeline',
    summary:
      'Streamlines municipal complaint resolution by pairing photo verification and NLP priority scoring with a geo-tagged PostgreSQL datastore and authority command dashboard.',
    nodes: [
      {
        id: 'citizen',
        label: 'Citizen Interface',
        layer: 'Frontend',
        tech: 'Next.js · Geo-Tagging',
        x: 12,
        y: 50,
        desc: 'Enables citizens to file civic issue reports with location coordinates and supporting photo evidence.'
      },
      {
        id: 'cv',
        label: 'Computer Vision Scanner',
        layer: 'Visual Verification',
        tech: 'CV Duplicate Detection',
        x: 36,
        y: 24,
        desc: 'Scans uploaded issue images for visual details and detects duplicate complaints before routing.'
      },
      {
        id: 'api',
        label: 'FastAPI + JWT Backend',
        layer: 'API & Classification',
        tech: 'FastAPI · JWT · NLP',
        x: 36,
        y: 76,
        desc: 'Authenticates requests via JWT, categorizes complaint text with NLP, and calculates intelligent priority scores.'
      },
      {
        id: 'postgres',
        label: 'PostgreSQL + Maps Store',
        layer: 'Data & Geo Layer',
        tech: 'PostgreSQL · Google Maps',
        x: 64,
        y: 50,
        desc: 'Persists structured issue states, priority scores, and mapped coordinates for real-time spatial tracking.'
      },
      {
        id: 'authority',
        label: 'Authority & NGO Dashboard',
        layer: 'Command Portal',
        tech: 'Role-Based Dashboard',
        x: 88,
        y: 28,
        desc: 'Routes prioritized civic issues to municipal authorities and partner NGOs for coordinated field action.'
      },
      {
        id: 'tracking',
        label: 'Live Status Tracking',
        layer: 'Resolution Loop',
        tech: 'Status Notifications',
        x: 88,
        y: 74,
        desc: 'Broadcasts real-time resolution updates and map status changes back to the reporting citizens.'
      }
    ],
    edges: [
      { from: 'citizen', to: 'cv', label: 'Photo upload' },
      { from: 'citizen', to: 'api', label: 'Report payload' },
      { from: 'cv', to: 'api', label: 'Duplicate check' },
      { from: 'api', to: 'postgres', label: 'Priority score' },
      { from: 'postgres', to: 'authority', label: 'Routed ticket' },
      { from: 'authority', to: 'tracking', label: 'Status update' },
      { from: 'postgres', to: 'tracking', label: 'Map state' }
    ]
  },
  'bench-ai': {
    id: 'bench-ai',
    name: 'BenchAI',
    subtitle: 'Offline Document Parsing & Local FAISS RAG Pipeline',
    summary:
      'Designed for internet-free classrooms: local study documents are split into chunks, indexed in a FAISS vector store, retrieved semantically, and answered offline by Ollama/Llama.',
    nodes: [
      {
        id: 'parser',
        label: 'Local Document Loader',
        layer: 'Ingestion',
        tech: 'Python · PDF / PPT',
        x: 12,
        y: 26,
        desc: 'Reads textbooks, lecture slides, and educational notes directly from local storage with zero cloud upload.'
      },
      {
        id: 'langchain',
        label: 'LangChain Text Splitter',
        layer: 'Chunking',
        tech: 'LangChain',
        x: 38,
        y: 26,
        desc: 'Splits raw educational material into structured overlapping text chunks ready for local embedding.'
      },
      {
        id: 'faiss',
        label: 'FAISS Vector Store',
        layer: 'Local Index',
        tech: 'FAISS Vector Search',
        x: 64,
        y: 26,
        desc: 'Stores local vector embeddings on-device so relevant textbook passages can be retrieved in milliseconds.'
      },
      {
        id: 'classroom',
        label: 'Classroom Interface',
        layer: 'Student UI',
        tech: 'Offline Dashboard',
        x: 12,
        y: 74,
        desc: 'Provides students and educators with a clean Q&A dashboard usable across offline classroom environments.'
      },
      {
        id: 'rag',
        label: 'RAG Retrieval Pipeline',
        layer: 'Context Assembly',
        tech: 'Semantic Similarity',
        x: 50,
        y: 74,
        desc: 'Matches student questions against the FAISS index to gather grounded source excerpts.'
      },
      {
        id: 'llm',
        label: 'Local LLM (Ollama / Llama)',
        layer: 'Offline Inference',
        tech: 'Ollama · Llama',
        x: 86,
        y: 50,
        desc: 'Synthesizes clear study explanations from retrieved context completely offline with zero data leakage.'
      }
    ],
    edges: [
      { from: 'parser', to: 'langchain', label: 'Extracted text' },
      { from: 'langchain', to: 'faiss', label: 'Text chunks' },
      { from: 'classroom', to: 'rag', label: 'Student question' },
      { from: 'faiss', to: 'rag', label: 'Relevant passages' },
      { from: 'rag', to: 'llm', label: 'Grounded context' },
      { from: 'llm', to: 'classroom', label: 'Study answer' }
    ]
  }
};

export default architecturesData;
