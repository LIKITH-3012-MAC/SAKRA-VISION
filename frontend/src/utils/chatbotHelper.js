import { sakraKnowledge } from '../data/knowledge';

const DETAILED_KNOWLEDGE = {
  founder: `### Likith Naidu Anumakonda
**Founder & CEO, SakraVision**

• **Role**: Founder & Lead Architect of SakraVision (@sakravision)
• **Background**: AI/ML Engineer, Python Full-Stack Developer, CSE (AI) student
• **Identity & Credentials**: IIT Patna Certified Learner, Pianist, Author, builder of intelligent systems
• **Instagram**: **@likhithnaidu_anumakonda** ([https://www.instagram.com/likhithnaidu_anumakonda](https://www.instagram.com/likhithnaidu_anumakonda))
• **Portfolio**: [https://likith-portfolio.online/](https://likith-portfolio.online/)`,

  instagram: `### SakraVision & Founder Instagram / Social Handles

• **Founder Instagram**: **@likhithnaidu_anumakonda**  
  [https://www.instagram.com/likhithnaidu_anumakonda](https://www.instagram.com/likhithnaidu_anumakonda)
• **Official Brand Identifier**: **@sakravision**
• **Founder Portfolio**: [https://likith-portfolio.online/](https://likith-portfolio.online/)
• **GitHub**: [https://github.com/LIKITH-3012-MAC](https://github.com/LIKITH-3012-MAC)
• **LinkedIn**: [https://in.linkedin.com/in/likith-naidu-anumakonda-33a347327](https://in.linkedin.com/in/likith-naidu-anumakonda-33a347327)`,

  start_project: `### How to Start a Project with SakraVision

Starting a project with us is quick and seamless:

1. **Direct Consultation / Google Meet**: Schedule a meeting directly in our official room:
   • **Google Meet**: [https://meet.google.com/grg-hytm-ahw](https://meet.google.com/grg-hytm-ahw)
   • **Consultation Window**: Every day · 6:00 PM – 9:00 PM IST
2. **Website Inquiry**: Submit your project details via our **Inquire Form**. Project scope and commercial terms are discussed individually.
3. **Direct Email**: Email founder Likith Naidu Anumakonda directly at:
   • **likith.anumakonda@gmail.com**
   • **likith.naidu@icloud.com**
4. **Instagram DM**: Connect on Instagram: **@likhithnaidu_anumakonda** ([https://www.instagram.com/likhithnaidu_anumakonda](https://www.instagram.com/likhithnaidu_anumakonda))`,

  company: `### SakraVision (@sakravision)
**AI Product Studio & Innovation Company**

• **Established**: 2026 (India)
• **Tagline**: *"From Ideas to Intelligent Systems"*
• **Description**: SakraVision converts ambitious ideas into deployable, secure, and scalable real-world products using AI/ML, Computer Vision, LLMs, RAG, AI agents, and web technologies.
• **Name Origin**: SAKRA is inspired by the names of the founder's mother and father, representing family, vision, strength, and purpose.`,

  projects_list: `### SakraVision Project Portfolio

1. **Resolvit AI** *(Civic-Tech AI)*: Intelligent civic issue resolution platform with computer vision duplicate detection and NLP priority scoring. [Live App](https://www.resolvit-ai.online/)
2. **SAKRA VISION Event Hub** *(Event Tech)*: Smart registration platform with automated payment screenshot verification and admin approval workflows. [Live App](https://forms-project-f3sb.vercel.app/)
3. **BenchAI** *(Offline LLM + RAG)*: Offline AI learning assistant for studying from local documents without internet.
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

• **Google Meet Consultation**: [https://meet.google.com/grg-hytm-ahw](https://meet.google.com/grg-hytm-ahw) (Every day · 6:00 PM – 9:00 PM IST)
• **Email**: likith.anumakonda@gmail.com / likith.naidu@icloud.com
• **Instagram**: **@likhithnaidu_anumakonda** ([https://www.instagram.com/likhithnaidu_anumakonda](https://www.instagram.com/likhithnaidu_anumakonda))
• **Website**: [https://www.sakra-vision.online/](https://www.sakra-vision.online/)
• **Inquiries**: Submit your project details via the contact form on our website.`
};

export const getLocalChatbotReply = (history = [], userMessage = '') => {
  const msg = (userMessage || '').toLowerCase().trim();

  // 1. Instagram & Social Media Intent
  if (/\b(insta|instagram|handle|social|follow|dm)\b/i.test(msg)) {
    return DETAILED_KNOWLEDGE.instagram;
  }

  // 2. How to Start a Project / Hire / Collaborate Intent
  if (/\b(start a project|start project|how to start|build a project|how can i start|hire|collaborate|work together|submit project|inquiry|get started)\b/i.test(msg)) {
    return DETAILED_KNOWLEDGE.start_project;
  }

  // 3. Follow-up prompts ("more", "tell me more", "explain more", "details")
  if (/\b(more|tell me more|details|explain more|go on|what else)\b/i.test(msg) && Array.isArray(history) && history.length > 0) {
    const recentHistoryText = history.slice(-4).map(h => h.text || '').join(' ').toLowerCase();
    if (/\b(project|resolvit|prometheus|event hub)\b/i.test(recentHistoryText)) {
      return DETAILED_KNOWLEDGE.projects_list;
    }
    if (/\b(likith|founder|ceo|creator|developer)\b/i.test(recentHistoryText)) {
      return DETAILED_KNOWLEDGE.founder;
    }
    if (/\b(service|capabilities|build)\b/i.test(recentHistoryText)) {
      return DETAILED_KNOWLEDGE.services_list;
    }
  }

  // 4. Follow-up pronouns referring to Founder
  const isReferringToFounder = /\b(he|his|him|study|education|college|school)\b/i.test(msg);
  if (isReferringToFounder && Array.isArray(history) && history.length > 0) {
    const recentHistoryText = history.slice(-4).map(h => h.text || '').join(' ').toLowerCase();
    if (/\b(likith|founder|ceo|creator|developer)\b/i.test(recentHistoryText)) {
      return DETAILED_KNOWLEDGE.founder;
    }
  }

  // 5. Founder Intent
  if (/\b(likith|founder|ceo|creator|developer|owner|who made|who built)\b/i.test(msg)) {
    return DETAILED_KNOWLEDGE.founder;
  }

  // 6. Project Comparison Intent ("top project", "best project", "most advanced")
  if (/\b(top project|best project|most advanced|leading project|compare project|flagship)\b/i.test(msg)) {
    return DETAILED_KNOWLEDGE.top_project;
  }

  // 7. Specific Projects
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

  // 8. List Questions
  if (/\b(list project|all project|projects|show project)\b/i.test(msg)) {
    return DETAILED_KNOWLEDGE.projects_list;
  }
  if (/\b(service|capabilities|what do you offer|what can you build|list service)\b/i.test(msg)) {
    return DETAILED_KNOWLEDGE.services_list;
  }
  if (/\b(tech|stack|python|fastapi|react|tools|framework)\b/i.test(msg)) {
    return DETAILED_KNOWLEDGE.tech_stack;
  }

  // 9. Contact Intent
  if (/\b(contact|email|reach|hire|touch|inquiry)\b/i.test(msg)) {
    return DETAILED_KNOWLEDGE.contact;
  }

  // 10. Company Intent
  if (/\b(company|sakra|vision|about|what is sakravision|studio)\b/i.test(msg)) {
    return DETAILED_KNOWLEDGE.company;
  }

  // Generic prompt-aware default response
  return `I am SAKRA-BOT, intelligent assistant for **SakraVision** (@sakravision), founded by **Likith Naidu Anumakonda** (@likhithnaidu_anumakonda).\n\nHow can I assist you?\n• **Start a Project**: Ask *'How can I start a project?'*\n• **Founder & Instagram**: Ask for *'Founder'* or *'Instagram'* (@likhithnaidu_anumakonda)\n• **Projects**: Ask to *'List projects'* or explore *Resolvit AI / Prometheus AI / Event Hub*\n• **Services & Contact**: Ask about our *Services*, *Tech Stack*, or *Contact email*`;
};
