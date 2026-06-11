const projectsData = [
  {
    id: 'resolvit-ai',
    title: 'Resolvit AI',
    tagline: 'From Complaint to Completion',
    category: 'Civic-Tech AI Platform',
    status: 'Live',
    shortDesc: 'An AI-powered civic issue resolution platform connecting citizens, authorities, and NGOs through intelligent reporting, priority scoring, and real-time tracking.',
    fullDesc: 'Resolvit AI is a premium civic-tech application engineered to streamline how public complaints are filed, prioritized, and resolved. Utilizing intelligent computer vision and natural language models, it connects municipal entities and community NGOs directly with citizens to bring transparency and speed to local governance.',
    problemSolved: 'Traditional municipal reporting pipelines are slow, non-transparent, and lack structured tracking, leading to duplicate complaints and delayed resolutions.',
    howItWorks: 'Citizens upload reports with photos -> Computer Vision scans for details/duplicates -> FastAPI backend runs NLP to classify priority -> Automatically routes to local authorities and NGOs on a dashboard -> Real-time status maps notify citizens.',
    keyFeatures: [
      'Citizen issue reporting & photo upload',
      'AI-based issue classification & categorization',
      'Intelligent priority scoring system',
      'Duplicate complaint checking & detection',
      'Secure authority command dashboard',
      'NGO/community support workflow integration',
      'Real-time status tracking notifications',
      'Location-based issue mapping and geo-tagging'
    ],
    techStack: ['Next.js', 'FastAPI', 'PostgreSQL', 'Google Maps', 'JWT', 'AI Classification'],
    liveLink: 'https://www.resolvit-ai.online/',
    gitLink: 'https://github.com/LIKITH-3012-MAC',
    tags: ['Civic-Tech', 'AI Platforms', 'Full Stack']
  },
  {
    id: 'event-hub',
    title: 'SAKRA VISION Event Hub',
    tagline: 'Smart Registration. Intelligent Verification. Automated Execution.',
    category: 'AI Event Operations Platform',
    status: 'Live',
    shortDesc: 'A smart event registration platform with payment screenshot verification, admin approval, secure form submission, email automation, and backend workflow management.',
    fullDesc: 'SAKRA VISION Event Hub is a secure full-stack platform built to automate event check-ins and ticketing. By replacing manual spreadsheets, the system automatically checks payment receipts via OCR and triggers registration workflows, providing organizers with an admin control dashboard.',
    problemSolved: 'Verifying payment screenshots for paid events is manually intensive, prone to ticket spoofing, and introduces delays in confirmation delivery.',
    howItWorks: 'Attendees upload their transaction receipt on registration -> Python OCR scripts process transaction IDs -> Checks against backend records for validity -> Admin dashboard provides one-click approval -> Vercel/Render APIs fire confirmation emails.',
    keyFeatures: [
      'Dynamic event registration form input',
      'Payment screenshot upload module',
      'AI/OCR-based receipt checking algorithm',
      'Admin approval & rejection dashboard',
      'Secure form submission and token tracking',
      'Automated email confirmation workflows',
      'Attendance-ready data structures',
      'Certificate generation-ready architecture'
    ],
    techStack: ['React', 'FastAPI', 'MySQL', 'Aiven Cloud', 'Render', 'Vercel', 'OCR', 'JWT'],
    liveLink: 'https://forms-project-f3sb.vercel.app/',
    gitLink: 'https://github.com/LIKITH-3012-MAC',
    tags: ['AI Platforms', 'Full Stack', 'Automation']
  },
  {
    id: 'bench-ai',
    title: 'BenchAI',
    tagline: 'AI Learning Without Internet Dependency',
    category: 'Offline LLM + RAG Learning Assistant',
    status: 'In Development',
    shortDesc: 'An offline LLM + RAG learning assistant built to help students learn from local documents, textbooks, and educational material without depending on cloud AI.',
    fullDesc: 'Bench AI is an offline education terminal designed to assist students and researchers in offline environments. Using Retrieval-Augmented Generation (RAG) and local vector embeddings, it queries local documents (PDFs, PPTs) locally, running model inferences completely offline.',
    problemSolved: 'Cloud-based AI interfaces require continuous, high-bandwidth internet connections, leading to data privacy concerns and excluding remote classrooms.',
    howItWorks: 'Users load lecture material -> LangChain splits documents into text chunks -> Vector store (FAISS) indexes chunk embeddings locally -> User queries are retrieved via vector search -> Local LLMs (Ollama/Llama) generate answers.',
    keyFeatures: [
      'Offline-first AI execution environment',
      'Local document parsing and Q&A engine',
      'Retrieval-Augmented Generation (RAG) pipeline',
      'FAISS local vector search database',
      'Ollama local model node execution',
      'Student-focused clean learning dashboard',
      'Zero-data leakage private architecture',
      'Classroom-ready local network distribution concept'
    ],
    techStack: ['Python', 'Ollama', 'LangChain', 'FAISS', 'RAG', 'Llama', 'Local LLM'],
    liveLink: '#',
    gitLink: 'https://github.com/LIKITH-3012-MAC',
    tags: ['RAG / LLM', 'AI Platforms']
  },
  {
    id: 'prometheus-ai',
    title: 'Prometheus AI',
    tagline: 'Private Intelligence on Local Machines',
    category: 'Local-First GenAI System',
    status: 'Live',
    shortDesc: 'A privacy-first localized AI environment designed to run LLM capabilities, voice input, and intelligent assistant workflows directly on edge devices.',
    fullDesc: 'Prometheus AI V2.0 is a localized edge companion running large language models and voice translation scripts locally. By taking advantage of edge hardware acceleration (Apple MLX / local GPUs), it provides zero-latency agentic assistance.',
    problemSolved: 'Traditional voice assistants send audio data to third-party servers, compromising user privacy and creating internet dependency.',
    howItWorks: 'Whisper translates local audio logs -> Edge engine loads Llama weights using Ollama -> FastAPI processes command strings -> Activates custom desktop shell command workflows.',
    keyFeatures: [
      'Local-first GenAI execution terminal',
      'Llama-based conversational assistant',
      'Whisper-powered local voice input',
      'Zero-data-out private architecture',
      'FastAPI-powered background routing',
      'Edge-device hardware-accelerated processing',
      'Offline command and script workflows'
    ],
    techStack: ['Python', 'FastAPI', 'Llama', 'Ollama', 'Whisper', 'Apple MLX', 'Local AI'],
    liveLink: 'https://www.prometheuslikiths-ai.online/',
    gitLink: 'https://github.com/LIKITH-3012-MAC',
    tags: ['AI Platforms', 'RAG / LLM']
  },
  {
    id: 'aquasentinel-ai',
    title: 'AquaSentinel AI',
    tagline: 'AI for Ocean Monitoring and Marine Response',
    category: 'Marine Intelligence AI Platform',
    status: 'Live',
    shortDesc: 'A marine intelligence platform using satellite data, weather APIs, mapping, and multilingual AI assistance for ocean debris monitoring and response guidance.',
    fullDesc: 'AquaSentinel AI is a maritime sustainability assistant built to map and monitor marine pollution. By combining live weather maps, regional debris reports, and multilingual RAG capabilities, it gives coastal response teams actionable cleanup plans.',
    problemSolved: 'Tracking dynamic ocean waste streams and coordinating relief requires stitching together weather APIs, maps, and dialect translation guides.',
    howItWorks: 'Ingests real-time OpenWeather API vectors -> Renders OpenStreetMap trash locations -> Feeds environmental logs to Groq AI model -> Generates response instructions in regional Indian languages.',
    keyFeatures: [
      'Marine debris tracking and mapping',
      'Satellite weather api parsing system',
      'Live location rendering using OpenStreetMap',
      'Multilingual AI assistant with regional Indian dialects',
      'RAG-based environmental response guides',
      'Interactive pollution data metrics'
    ],
    techStack: ['React', 'APIs', 'OpenWeather', 'OpenStreetMap', 'Groq', 'RAG', 'AI Assistant'],
    liveLink: 'https://aquq-sentinel-phsv.vercel.app/',
    gitLink: 'https://github.com/LIKITH-3012-MAC',
    tags: ['AI Platforms', 'RAG / LLM']
  },

  {
    id: 'python-gui-utility',
    title: 'Python GUI Utility',
    category: 'Desktop Automation & Utility',
    status: 'Live',
    tagline: 'Automated File & Data Processing Workflows',
    shortDesc: 'A powerful desktop utility built using Python GUI libraries to automate complex file processing, data transformation, and local workflows.',
    fullDesc: 'Python GUI Utility is a desktop application engineered to simplify manual file operations and data parsing tasks. It provides a clean, user-friendly interface to configure, execute, and monitor automated local workflows, eliminating CLI overhead for non-technical tasks.',
    problemSolved: 'Manual file sorting, data format conversions, and local scripting require terminal usage and introduce repetitive manual steps for everyday workflows.',
    howItWorks: 'Users select target directories/files via the GUI -> Choose processing action (filter, convert, rename, audit) -> Python engine executes the background scripts -> Real-time status bar displays progress and generates output reports.',
    keyFeatures: [
      'Intuitive desktop GUI interface',
      'Automated file sorting and renaming rules',
      'Batch data processing and format conversion',
      'Real-time execution logging and progress indicators',
      'Custom workflow configuration savings',
      'Extensible Python script integration architecture'
    ],
    techStack: ['Python', 'Tkinter / PyQt', 'File I/O', 'Data Processing', 'Automation'],
    liveLink: '#',
    gitLink: 'https://github.com/LIKITH-3012-MAC',
    tags: ['Automation', 'Python Utilities']
  }
];

export default projectsData;
