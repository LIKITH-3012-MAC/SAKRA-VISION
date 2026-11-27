/**
 * Verified single source of truth for SAKRA VISION frontend knowledge fallback.
 * Kept strictly synchronized with backend/knowledge_base.py.
 */
export const sakraKnowledge = {
  company: {
    name: 'SAKRA VISION',
    brandIdentifier: '@sakravision',
    established: '2026',
    country: 'India',
    tagline: 'From Ideas to Intelligent Systems',
    alternativeTagline: 'Engineering Intelligence Into Reality',
    nameMeaning:
      'SAKRA is inspired by the names of founder Likith Naidu Anumakonda’s mother and father, representing family, vision, strength, and purpose.',
    description:
      'SAKRA VISION is an AI product studio and innovation company building practical, deployable intelligent systems across AI/ML applications, Computer Vision, LLMs, RAG pipelines, AI agents, workflow automation, and full-stack web software.',
    website: 'https://www.sakra-vision.online/',
    emails: ['likith.anumakonda@gmail.com', 'likith.naidu@icloud.com'],
    consultation: {
      meetUrl: 'https://meet.google.com/grg-hytm-ahw',
      hours: 'Every day · 6:00 PM – 9:00 PM IST',
      intake:
        'Smart Project Brief or Quick Direct Form on the Inquire page, or schedule a 1-on-1 video slot on the Book page.'
    }
  },

  founder: {
    fullName: 'Likith Naidu Anumakonda',
    role: 'Founder & CEO of SAKRA VISION',
    title: 'AI/ML Engineer',
    education: 'B.Tech CSE (Artificial Intelligence) student at PBR VITS, Kavali',
    otherPursuits: ['Pianist', 'Author of "Echoes of an Unsaid Goodbye"'],
    portfolio: 'https://likith-naidu-anumakonda.online/',
    instagram: 'https://www.instagram.com/likhithnaidu_anumakonda',
    instagramHandle: '@likhithnaidu_anumakonda',
    github: 'https://github.com/LIKITH-3012-MAC',
    linkedin: 'https://in.linkedin.com/in/likith-naidu-anumakonda-33a347327'
  },

  projects: [
    {
      id: 'prometheus-ai',
      name: 'Prometheus AI V2.0',
      aliases: ['prometheus', 'prometheus ai', 'prometheus v2', 'prometheus ai v2.0'],
      category: 'Local-First Edge GenAI System',
      status: 'Live',
      problem:
        'Traditional cloud voice and chat assistants send audio and prompts to third-party servers, raising privacy concerns and depending on continuous internet connectivity.',
      solution:
        'A localized edge GenAI companion running Whisper local audio transcription, FastAPI command routing, and Ollama / Llama models with Apple MLX and edge GPU hardware acceleration.',
      capabilities: [
        'Local-first GenAI interactive terminal',
        'On-device Whisper voice transcription',
        'Ollama + Llama conversational reasoning',
        'Apple MLX / local GPU hardware acceleration',
        'Zero-data-out desktop shell and script workflows'
      ],
      techStack: ['Python', 'FastAPI', 'Llama', 'Ollama', 'Whisper', 'Apple MLX'],
      liveUrl: 'https://www.prometheuslikiths-ai.online/',
      liveLabel: 'Explore Prometheus AI V2.0',
      repoUrl: 'https://github.com/LIKITH-3012-MAC'
    },
    {
      id: 'resolvit-ai',
      name: 'RESOLVIT AI',
      aliases: ['resolvit', 'resolvit ai', 'resolvit-ai'],
      category: 'Civic-Tech Issue Resolution Platform',
      status: 'Live',
      problem:
        'Municipal public complaint workflows are often slow, opaque, and flooded with duplicate submissions that delay field resolution.',
      solution:
        'A geo-tagged civic issue reporting and authority resolution platform using Computer Vision duplicate checking, NLP priority classification, PostgreSQL storage, and role-based dashboards.',
      capabilities: [
        'Citizen issue submission with photos and location coordinates',
        'Computer Vision duplicate photo inspection',
        'FastAPI backend with JWT authentication and NLP priority scoring',
        'PostgreSQL persistence paired with Google Maps spatial tracking',
        'Authority and NGO command dashboards with live resolution status updates'
      ],
      techStack: ['Next.js', 'FastAPI', 'PostgreSQL', 'Google Maps', 'JWT', 'Computer Vision', 'NLP Classification'],
      liveUrl: 'https://www.resolvit-ai.online/',
      liveLabel: 'Explore RESOLVIT AI',
      repoUrl: 'https://github.com/LIKITH-3012-MAC'
    },
    {
      id: 'bench-ai',
      name: 'BenchAI',
      aliases: ['bench', 'benchai', 'bench ai', 'bench-ai'],
      category: 'Offline LLM + RAG Learning Assistant',
      status: 'In Development',
      problem:
        'Many classrooms and students in low-connectivity regions cannot rely on cloud AI tutors due to internet dependencies and privacy constraints.',
      solution:
        'An internet-free study terminal that ingests local textbooks, PDFs, and lecture slides using LangChain chunking, FAISS local vector search, and offline Ollama / Llama Q&A generation.',
      capabilities: [
        '100% offline document parsing (PDFs, slides, study notes)',
        'LangChain overlapping text chunking',
        'Local FAISS vector embedding index and similarity retrieval',
        'Offline Q&A via local Ollama / Llama weights',
        'Zero cloud dependency or external data leakage'
      ],
      techStack: ['Python', 'LangChain', 'FAISS', 'Ollama', 'Local Llama', 'RAG'],
      liveUrl: null,
      liveLabel: null,
      repoUrl: 'https://github.com/LIKITH-3012-MAC'
    },
    {
      id: 'event-hub',
      name: 'SAKRA VISION Event Hub',
      aliases: ['event hub', 'sakra event hub', 'event platform'],
      category: 'AI Event Operations Platform',
      status: 'Live',
      problem:
        'Manual checking of event payment screenshots and spreadsheet attendee lists introduces human bottlenecks and confirmation delays.',
      solution:
        'A full-stack registration and approval portal automating receipt verification via Python OCR, JWT-secured admin review, MySQL persistence, and automated confirmation workflows.',
      capabilities: [
        'Dynamic registration forms with receipt screenshot uploads',
        'Python OCR extraction and transaction verification',
        'Admin approval dashboard stored on Aiven Cloud MySQL',
        'Automated confirmation workflow dispatch'
      ],
      techStack: ['React', 'FastAPI', 'MySQL', 'Aiven Cloud', 'Python OCR', 'JWT', 'Render', 'Vercel'],
      liveUrl: 'https://forms-project-f3sb.vercel.app/',
      liveLabel: 'Open SAKRA VISION Event Hub',
      repoUrl: 'https://github.com/LIKITH-3012-MAC'
    },
    {
      id: 'aquasentinel-ai',
      name: 'AquaSentinel AI',
      aliases: ['aquasentinel', 'aqua sentinel', 'aquasentinel ai', 'marine'],
      category: 'Marine Intelligence AI Platform',
      status: 'Live',
      problem:
        'Coordinating coastal cleanup and fishing safety requires combining live marine weather feeds, spatial mapping, and regional language guidance.',
      solution:
        'A marine intelligence web platform combining OpenWeather feeds, OpenStreetMap debris plotting, Groq-powered RAG guidance, and regional Indian language support.',
      capabilities: [
        'OpenStreetMap debris tracking and hazard plotting',
        'Live OpenWeather marine feed parsing',
        'Groq-assisted RAG cleanup and safety guidance',
        'Multilingual Indian regional language assistance'
      ],
      techStack: ['React', 'OpenWeather API', 'OpenStreetMap', 'Groq API', 'RAG'],
      liveUrl: 'https://aquq-sentinel-phsv.vercel.app/',
      liveLabel: 'Explore AquaSentinel AI',
      repoUrl: 'https://github.com/LIKITH-3012-MAC'
    },
    {
      id: 'python-gui-utility',
      name: 'Python GUI Utility / OpenCV Automation Tools',
      aliases: ['python gui', 'gui utility', 'opencv automation', 'opencv tools'],
      category: 'Desktop Automation & Utility',
      status: 'Local Desktop Tool',
      problem:
        'Repetitive local file sorting, format conversions, and image preprocessing often force users into fragile manual CLI scripts.',
      solution:
        'Local Python desktop utilities using Tkinter/PyQt and OpenCV scripts to configure and monitor batch file and visual workflows.',
      capabilities: [
        'Automated file sorting, renaming, and batch format conversion',
        'OpenCV visual contour and verification automation helpers',
        'Real-time desktop progress logging'
      ],
      techStack: ['Python', 'Tkinter / PyQt', 'OpenCV', 'File I/O'],
      liveUrl: null,
      liveLabel: null,
      repoUrl: 'https://github.com/LIKITH-3012-MAC'
    }
  ],

  techStack: {
    deployed: {
      'Frontend & UI': ['React', 'Next.js', 'Vite', 'Tailwind CSS', 'Framer Motion'],
      'Backend, Security & Messaging': [
        'Python',
        'FastAPI',
        'SQLAlchemy ORM',
        'JWT Auth',
        'SlowAPI',
        'Cloudflare Turnstile',
        'Resend API'
      ],
      'Databases & Hosting': [
        'PostgreSQL (RESOLVIT AI)',
        'MySQL / Aiven Cloud (Event Hub & Studio Backend)',
        'Vercel',
        'Render'
      ],
      'AI, Vision & Geospatial': [
        'Groq API',
        'Ollama',
        'Llama',
        'Whisper (Local)',
        'Apple MLX',
        'OpenCV / Python OCR',
        'Google Maps API',
        'OpenStreetMap',
        'OpenWeather API'
      ]
    },
    inDevelopment: [
      'LangChain document chunking',
      'FAISS local vector search',
      'Offline RAG retrieval (BenchAI)'
    ],
    explored: [
      'Constrained tool-calling AI agent guardrails (Pydantic validation & bounded execution)',
      'OpenCV OCR preprocessing for compressed / dark-mode mobile receipts',
      'Offline coastal telemetry caching strategies'
    ],
    capabilities: [
      'AI Application Development',
      'Computer Vision & OCR Systems',
      'LLM & RAG Assistants',
      'Autonomous AI Agents & Workflow Automation',
      'Civic-Tech, Event Tech & Full-Stack Web Platforms'
    ]
  },

  services: [
    {
      name: 'AI Applications & ML Systems',
      summary: 'Custom cognitive apps, scoring pipelines, and FastAPI inference backends.'
    },
    {
      name: 'Computer Vision & OCR',
      summary: 'Automated receipt checking, image duplicate detection, and OpenCV preprocessing.'
    },
    {
      name: 'LLM & RAG Engineering',
      summary: 'Grounded document Q&A, FAISS local vector search, and offline/cloud assistants.'
    },
    {
      name: 'AI Agents & Workflow Automation',
      summary: 'Constrained tool-calling workflows, webhooks, validation scripts, and email pipelines.'
    },
    {
      name: 'Full-Stack Product Engineering',
      summary: 'React/Next.js frontends, MySQL/PostgreSQL datastores, JWT security, and cloud deploys.'
    }
  ]
};
