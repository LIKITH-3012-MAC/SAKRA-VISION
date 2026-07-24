import { sakraKnowledge } from '../data/knowledge';

export const getLocalChatbotReply = (message) => {
  if (!message || typeof message !== 'string') {
    return "I am SAKRA-BOT, your intelligent assistant for SakraVision (@sakravision). How can I help you today?";
  }

  const msg = message.toLowerCase().strip ? message.toLowerCase().strip() : message.toLowerCase().trim();

  // Founder & Creator Queries
  if (/\b(founder|likith|ceo|creator|developer|owner|who made|who built|instagram)\b/i.test(msg)) {
    return `${sakraKnowledge.founder.name} (${sakraKnowledge.founder.role}) is the founder and lead architect of SakraVision (@sakravision).\n\n${sakraKnowledge.founder.description}\n\nInstagram: ${sakraKnowledge.founder.instagram}`;
  }

  // Company & Brand Queries
  if (/\b(sakra|company|about|vision|studio|brand|sakravision)\b/i.test(msg)) {
    return `${sakraKnowledge.company.name} (${sakraKnowledge.company.brandIdentifier}) is an AI product studio established in 2026.\n\n${sakraKnowledge.company.description}\n\nTagline: "${sakraKnowledge.company.tagline}"`;
  }

  // Services Queries
  if (/\b(service|build|offer|develop|capabilities|work|what can you do)\b/i.test(msg)) {
    return `SakraVision offers specialized AI engineering and product services:\n\n• ${sakraKnowledge.services.join('\n• ')}\n\nNeed to start a project? Fill out our inquiry form or contact ${sakraKnowledge.company.contactEmail}!`;
  }

  // Projects Queries
  if (/\b(project|portfolio|product|resolvit|bench|prometheus|aqua|gui|utility)\b/i.test(msg)) {
    const projectList = sakraKnowledge.projects
      .map(p => `• ${p.name} (${p.category}): ${p.description}`)
      .join('\n\n');
    return `Here are key projects built by SakraVision:\n\n${projectList}`;
  }

  // Specific project queries
  if (/\bresolvit\b/i.test(msg)) {
    const p = sakraKnowledge.projects.find(x => x.name.toLowerCase().includes('resolvit'));
    return `${p.name} (${p.category})\nTagline: ${p.tagline}\n\n${p.description}\nLive App: ${p.liveUrl}`;
  }

  if (/\bevent\s*hub\b/i.test(msg)) {
    const p = sakraKnowledge.projects.find(x => x.name.toLowerCase().includes('event hub'));
    return `${p.name} (${p.category})\nTagline: ${p.tagline}\n\n${p.description}\nLive Demo: ${p.liveUrl}`;
  }

  if (/\bbench\b/i.test(msg)) {
    const p = sakraKnowledge.projects.find(x => x.name.toLowerCase().includes('bench'));
    return `${p.name} (${p.category})\nTagline: ${p.tagline}\n\n${p.description}`;
  }

  if (/\bprometheus\b/i.test(msg)) {
    const p = sakraKnowledge.projects.find(x => x.name.toLowerCase().includes('prometheus'));
    return `${p.name} (${p.category})\nTagline: ${p.tagline}\n\n${p.description}\nLive App: ${p.liveUrl}`;
  }

  if (/\baqua\b/i.test(msg)) {
    const p = sakraKnowledge.projects.find(x => x.name.toLowerCase().includes('aqua'));
    return `${p.name} (${p.category})\nTagline: ${p.tagline}\n\n${p.description}\nLive App: ${p.liveUrl}`;
  }

  // Contact Queries
  if (/\b(contact|email|reach|connect|hire|talk|touch)\b/i.test(msg)) {
    return `You can connect with SakraVision and founder Likith Naidu directly via email at:\n${sakraKnowledge.company.contactEmail}\n\nOr scroll to our Contact section on the page to submit a project inquiry!`;
  }

  // Pricing Queries
  if (/\b(price|cost|budget|charge|payment|fee)\b/i.test(msg)) {
    return `Project pricing depends on your requirements, architecture, integrations, and timeline. Contact us with your project details to get a customized estimate.`;
  }

  // Generic fallback
  return `I am SAKRA-BOT, intelligent assistant for SakraVision (@sakravision) founded by Likith Naidu (Instagram: @likhithnaidu_anumakonda).\n\nI can answer questions about our company, founder, AI services (Computer Vision, LLMs/RAG, AI Agents, Web Apps), and projects (Resolvit AI, Event Hub, BenchAI, Prometheus AI, AquaSentinel AI). What can I help you with?`;
};
