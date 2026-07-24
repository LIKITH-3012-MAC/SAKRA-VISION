import { sakraKnowledge } from '../data/knowledge';

const DETAILED_KNOWLEDGE = {
  founder: `### Likith Naidu Anumakonda
**Founder & CEO, SakraVision**

• **Role**: Founder & Lead Architect of SakraVision (@sakravision)
• **Background**: AI/ML Engineer, Python Full-Stack Developer, CSE (AI) student
• **Identity & Achievements**: IIT Patna Certified Learner, Pianist, Author, and builder of real-world intelligent systems
• **Instagram**: @likhithnaidu_anumakonda
• **Portfolio**: [https://likith-portfolio.online/](https://likith-portfolio.online/)

Likith specializes in designing agentic workflows, computer vision applications, LLM/RAG systems, and full-stack software solutions.`,

  company: `### SakraVision (@sakravision)
**AI Product Studio & Innovation Company**

• **Established**: 2026 (India)
• **Tagline**: *"From Ideas to Intelligent Systems"*
• **Description**: SakraVision converts ambitious ideas into useful, deployable, secure, and scalable real-world products using AI/ML, Computer Vision, LLMs, RAG, AI agents, and web technologies.
• **Name Origin**: SAKRA is inspired by the names of the founder's mother and father, representing family, vision, strength, and purpose.`,

  projects_list: `### SakraVision Project Portfolio

1. **Resolvit AI** *(Civic-Tech AI)*: Intelligent civic issue resolution platform with computer vision duplicate detection and NLP priority scoring. [Live App](https://www.resolvit-ai.online/)
2. **SAKRA VISION Event Hub** *(Event Tech)*: Smart registration platform with automated payment screenshot verification and admin approval workflows. [Live App](https://forms-project-f3sb.vercel.app/)
3. **BenchAI** *(Offline LLM + RAG)*: Offline AI learning assistant for studying from local documents without internet dependency.
4. **Prometheus AI** *(Edge GenAI)*: Local-first private intelligence system running edge LLMs and voice workflows. [Live App](https://www.prometheuslikiths-ai.online/)
5. **AquaSentinel AI** *(Marine Intelligence)*: Satellite data processing and ocean debris tracking platform. [Live App](https://aquq-sentinel-phsv.vercel.app/)
6. **AI Resume Builder** *(Career Tech)*: ATS-optimized resume generator.
7. **OpenCV Automation Tools** *(Computer Vision)*: Desktop visual processing utilities.`,

  top_project: `### Top & Featured Projects

| Project | Focus Area | Key Technical Highlight | Status |
| :--- | :--- | :--- | :--- |
| **Resolvit AI** | Civic Tech | Computer Vision duplicate detection & automated priority routing | Live Platform |
| **Prometheus AI** | Edge GenAI | Local-first private LLM execution without cloud dependencies | Live Platform |
| **SAKRA Event Hub** | Operations | OCR payment verification & automated attendee approval | Live Platform |
| **BenchAI** | Education | Offline RAG vector search for internet-free learning | Active Project |

**Resolvit AI** stands out for real-world civic impact, while **Prometheus AI** leads in localized edge privacy.`,

  services_list: `### SakraVision Core Services

• **AI Applications & Agents**: Custom autonomous workflows, decision agents, and task automation.
• **Computer Vision Systems**: OpenCV visual inspection, object detection, and image analysis.
• **LLM & RAG Engineering**: Contextual retrieval systems, intelligent chatbots, and document search.
• **Full-Stack Development**: Modern React/Next.js frontends and Python FastAPI backend architectures.
• **Civic & Event Tech**: Automated verification pipelines and dashboard management systems.`,

  tech_stack: `### Technical Stack & Ecosystem

• **Languages**: Python, JavaScript, HTML5/CSS3
• **Frameworks**: FastAPI, React, Next.js, Tailwind CSS
• **AI & Vision**: Groq API, LLMs, RAG Architectures, OpenCV, PyTorch
• **Cloud & Databases**: MySQL, PostgreSQL, Aiven Cloud, Resend API, Cloudflare`,

  contact: `### Contact SakraVision & Likith Naidu

• **Email**: likith.anumakonda@gmail.com / likith.naidu@icloud.com
• **Instagram**: @likhithnaidu_anumakonda
• **Website**: [https://www.sakra-vision.online/](https://www.sakra-vision.online/)
• **Inquiries**: Submit your project details via the contact form on our website.`
};

export const getLocalChatbotReply = (history = [], userMessage = '') => {
  const msg = (userMessage || '').toLowerCase().trim();

  // 1. Follow-up intent checking (e.g. "where did he study?", "tell me more about him")
  const isReferringToFounder = /\b(he|his|him|study|education|college|school)\b/i.test(msg);
  if (isReferringToFounder && Array.isArray(history) && history.length > 0) {
    const recentHistoryText = history.slice(-4).map(h => h.text || '').join(' ').toLowerCase();
    if (/\b(likith|founder|ceo|creator|developer)\b/i.test(recentHistoryText)) {
      return DETAILED_KNOWLEDGE.founder;
    }
  }

  // 2. Founder / Creator Intent
  if (/\b(likith|founder|ceo|creator|developer|owner|who made|who built|instagram)\b/i.test(msg)) {
    return DETAILED_KNOWLEDGE.founder;
  }

  // 3. Project Comparison Intent ("top project", "best project", "most advanced")
  if (/\b(top project|best project|most advanced|leading project|compare project|flagship)\b/i.test(msg)) {
    return DETAILED_KNOWLEDGE.top_project;
  }

  // 4. Specific Projects
  if (/\bresolvit\b/i.test(msg)) {
    return `### Resolvit AI\n**Civic-Tech Issue Resolution Platform**\n\n• **Overview**: Connects citizens, municipal authorities, and NGOs for streamlined issue tracking.\n• **AI Tech**: Computer Vision for duplicate photo detection + NLP for priority scoring.\n• **Live App**: [https://www.resolvit-ai.online/](https://www.resolvit-ai.online/)`;
  }
  if (/\b(event hub|event)\b/i.test(msg)) {
    return `### SAKRA VISION Event Hub\n**AI Event Operations Platform**\n\n• **Overview**: Automated registration platform with payment verification.\n• **Features**: Payment screenshot verification, admin approval workflow, automated ticket generation & emails.\n• **Live App**: [https://forms-project-f3sb.vercel.app/](https://forms-project-f3sb.vercel.app/)`;
  }
  if (/\bbench\b/i.test(msg)) {
    return `### BenchAI\n**Offline LLM + RAG Learning Assistant**\n\n• **Overview**: Internet-free learning assistant enabling students to study local textbooks and documents offline.\n• **Tech**: Local RAG vector search + lightweight offline LLMs.`;
  }
  if (/\bprometheus\b/i.test(msg)) {
    return `### Prometheus AI\n**Local-First GenAI System**\n\n• **Overview**: Privacy-focused localized AI environment running edge LLMs, voice commands, and agent workflows.\n• **Live App**: [https://www.prometheuslikiths-ai.online/](https://www.prometheuslikiths-ai.online/)`;
  }
  if (/\b(aqua|sentinel)\b/i.test(msg)) {
    return `### AquaSentinel AI\n**Marine Intelligence AI Platform**\n\n• **Overview**: Satellite data processing and ocean debris tracking platform.\n• **Live App**: [https://aquq-sentinel-phsv.vercel.app/](https://aquq-sentinel-phsv.vercel.app/)`;
  }

  // 5. List Questions
  if (/\b(list project|all project|projects|show project)\b/i.test(msg)) {
    return DETAILED_KNOWLEDGE.projects_list;
  }
  if (/\b(service|capabilities|what do you offer|what can you build|list service)\b/i.test(msg)) {
    return DETAILED_KNOWLEDGE.services_list;
  }
  if (/\b(tech|stack|python|fastapi|react|tools|framework)\b/i.test(msg)) {
    return DETAILED_KNOWLEDGE.tech_stack;
  }

  // 6. Contact Intent
  if (/\b(contact|email|reach|hire|touch|inquiry)\b/i.test(msg)) {
    return DETAILED_KNOWLEDGE.contact;
  }

  // 7. Company Intent
  if (/\b(company|sakra|vision|about|what is sakravision|studio)\b/i.test(msg)) {
    return DETAILED_KNOWLEDGE.company;
  }

  // Generic prompt-aware default response
  return `I am SAKRA-BOT, the AI assistant for **SakraVision** (@sakravision), founded by **Likith Naidu Anumakonda** (@likhithnaidu_anumakonda).\n\nHow can I help you?\n• Ask about our **Founder** (Likith Naidu Anumakonda)\n• Ask to **List Projects** or explore **Resolvit AI / Prometheus AI / Event Hub**\n• Ask about our **Services** or **Tech Stack**\n• Ask for **Contact** details`;
};
