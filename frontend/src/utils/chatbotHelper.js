import { sakraKnowledge } from '../data/knowledge.js';

// ---------------------------------------------------------------------------
// 1. SAFE ARITHMETIC EVALUATOR (Zero eval / Zero Function constructor)
// ---------------------------------------------------------------------------

export function evaluateSafeMath(message = '') {
  const raw = String(message || '').trim();
  if (!raw || raw.includes('http://') || raw.includes('https://') || raw.includes('@')) {
    return null;
  }

  const candidate = raw
    .replace(/^(what is|calculate|compute|solve|evaluate|equals|answer for)\s+/i, '')
    .replace(/[?.!]+$/g, '')
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\^/g, '**')
    .trim();

  if (!/^[0-9+\-*/().%\s]+$/.test(candidate) || !/[+\-*/%]/.test(candidate) || !/\d/.test(candidate)) {
    return null;
  }

  // Recursive descent parser supporting + - * / % ** and parentheses
  let pos = 0;
  const skipWs = () => {
    while (pos < candidate.length && /\s/.test(candidate[pos])) pos++;
  };

  const parseNumber = () => {
    skipWs();
    const start = pos;
    let seenDot = false;
    while (pos < candidate.length) {
      const ch = candidate[pos];
      if (/\d/.test(ch)) {
        pos++;
      } else if (ch === '.' && !seenDot) {
        seenDot = true;
        pos++;
      } else {
        break;
      }
    }
    if (pos === start) throw new Error('Expected number');
    const num = Number(candidate.slice(start, pos));
    if (!Number.isFinite(num)) throw new Error('Invalid number');
    return num;
  };

  const parsePrimary = () => {
    skipWs();
    if (candidate[pos] === '(') {
      pos++;
      const val = parseExpr();
      skipWs();
      if (candidate[pos] !== ')') throw new Error('Unmatched paren');
      pos++;
      return val;
    }
    if (candidate[pos] === '+') {
      pos++;
      return parsePrimary();
    }
    if (candidate[pos] === '-') {
      pos++;
      return -parsePrimary();
    }
    return parseNumber();
  };

  const parsePower = () => {
    let base = parsePrimary();
    skipWs();
    if (candidate.slice(pos, pos + 2) === '**') {
      pos += 2;
      const exp = parsePower();
      if (Math.abs(exp) > 100) throw new Error('Exponent too large');
      base = Math.pow(base, exp);
    }
    return base;
  };

  const parseTerm = () => {
    let left = parsePower();
    while (true) {
      skipWs();
      const ch = candidate[pos];
      if (ch === '*' && candidate[pos + 1] !== '*') {
        pos++;
        left *= parsePower();
      } else if (ch === '/') {
        pos++;
        const right = parsePower();
        if (right === 0) throw new Error('DIVISION_BY_ZERO');
        left /= right;
      } else if (ch === '%') {
        pos++;
        const right = parsePower();
        if (right === 0) throw new Error('DIVISION_BY_ZERO');
        left %= right;
      } else {
        break;
      }
    }
    return left;
  };

  const parseExpr = () => {
    let left = parseTerm();
    while (true) {
      skipWs();
      const ch = candidate[pos];
      if (ch === '+') {
        pos++;
        left += parseTerm();
      } else if (ch === '-') {
        pos++;
        left -= parseTerm();
      } else {
        break;
      }
    }
    return left;
  };

  const formatNum = (val) => {
    if (Math.abs(val - Math.round(val)) < 1e-12) return String(Math.round(val));
    return Number(val.toFixed(6)).toString();
  };

  try {
    const value = parseExpr();
    skipWs();
    if (pos !== candidate.length || !Number.isFinite(value)) return null;
    const formatted = formatNum(value);

    const mulDivMatches = candidate.match(/\d+(?:\.\d+)?\s*[*\/]\s*\d+(?:\.\d+)?/g) || [];
    const steps = [];
    if (mulDivMatches.length > 0 && /[+-]/.test(candidate)) {
      let reduced = candidate;
      for (const tok of mulDivMatches) {
        const sub = evaluateSafeMath(tok);
        if (sub && 'result' in sub) {
          steps.push(`\`${tok.trim()}\` = \`${sub.result}\``);
          reduced = reduced.replace(tok, sub.result);
        }
      }
      steps.push(`\`${reduced}\` = \`${formatted}\``);
    }

    return { expression: candidate, result: formatted, steps };
  } catch (err) {
    if (err.message === 'DIVISION_BY_ZERO') {
      return { expression: candidate, error: 'division_by_zero' };
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// 2. LANGUAGE DETECTION & CONVERSATION STATE
// ---------------------------------------------------------------------------

const TELUGU_UNICODE_RE = /[\u0C00-\u0C7F]/;
const EXPLICIT_TELUGU_RE = /\b(telugu\s*lo(\s*cheppu|\s*matladu|\s*explain|\s*cheppandi)?|in\s+simple\s+telugu|in\s+telugu|speak\s+telugu|respond\s+in\s+telugu)\b|తెలుగులో/i;
const EXPLICIT_TANGLISH_RE = /\b(tanglish(\s*lo)?|telugu\s+in\s+english|switch\s+to\s+tanglish|in\s+tanglish)\b/i;
const EXPLICIT_ENGLISH_RE = /\b(in\s+english|english\s*lo(\s*cheppu)?|switch\s+to\s+english|speak\s+english|english\s+please|back\s+to\s+english)\b/i;
const TANGLISH_MARKER_RE = /\b(em|enti|evaru|evvaru|cheppu|cheppandi|gurinchi|nenu|mee|naaku|naku|ela|ekkada|enduku|undhi|undi|unnayi|chesthundi|chestundi|chestharu|kavali|teliyadu|manaki|naadi|meedi|meeru|ledu|avunu|bagundi|chala)\b/i;

function cleanHistory(history = []) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((item) => {
      if (!item) return false;
      const t = String(item.text ?? item.content ?? '').trim();
      if (!t) return false;
      const s = String(item.sender ?? item.role ?? '').toLowerCase();
      if (s === 'system') return false;
      if ((s === 'bot' || s === 'assistant') && (t.startsWith('Welcome to SAKRA VISION.') || t.startsWith('Session reset. SAKRA-BOT'))) {
        return false;
      }
      return true;
    })
    .map((item) => ({
      role: ['bot', 'assistant'].includes(String(item.sender ?? item.role ?? '').toLowerCase()) ? 'assistant' : 'user',
      content: String(item.text ?? item.content ?? '').trim().slice(0, 800)
    }))
    .slice(-8);
}

function detectLanguageSignal(message = '') {
  const msg = String(message || '').trim();
  if (!msg) return { sig: null, isExplicit: false };

  if (EXPLICIT_TELUGU_RE.test(msg)) return { sig: 'telugu', isExplicit: true };
  if (EXPLICIT_TANGLISH_RE.test(msg)) return { sig: 'tanglish', isExplicit: true };
  if (EXPLICIT_ENGLISH_RE.test(msg)) return { sig: 'english', isExplicit: true };
  if (TELUGU_UNICODE_RE.test(msg)) return { sig: 'telugu', isExplicit: false };
  if (TANGLISH_MARKER_RE.test(msg)) return { sig: 'tanglish', isExplicit: false };

  if (evaluateSafeMath(msg) !== null || /^https?:\/\/\S+$/i.test(msg)) {
    return { sig: null, isExplicit: false };
  }

  const shortNeutral = new Set([
    'more', 'details', 'tell me more', 'explain more', 'why', 'how',
    'yes', 'no', 'ok', 'okay', 'and', 'what else', 'continue'
  ]);
  if (shortNeutral.has(msg.toLowerCase().replace(/[?.! ]+$/g, ''))) {
    return { sig: null, isExplicit: false };
  }

  const alphaWords = msg.match(/[A-Za-z]+/g) || [];
  if (alphaWords.length >= 2) return { sig: 'english', isExplicit: false };
  return { sig: null, isExplicit: false };
}

export function resolveSessionLanguage(message = '', history = [], preferredLanguage = null) {
  if (preferredLanguage && preferredLanguage !== 'auto') {
    const pref = String(preferredLanguage).toLowerCase();
    const curr = detectLanguageSignal(message);
    if (curr.isExplicit && curr.sig) return curr.sig;
    if (pref === 'telugu' || pref === 'te') {
      if (curr.sig === 'tanglish') return 'tanglish';
      return 'telugu';
    }
    if (pref === 'tanglish' || pref === 'te-latn') {
      if (curr.sig === 'telugu') return 'telugu';
      return 'tanglish';
    }
    if (pref === 'english' || pref === 'en') {
      if (curr.sig === 'telugu' || curr.sig === 'tanglish') return curr.sig;
      return 'english';
    }
  }

  const cleaned = cleanHistory(history);
  let lockedLang = null;
  let lastLang = 'english';

  for (const turn of cleaned) {
    if (turn.role !== 'user') continue;
    const { sig, isExplicit } = detectLanguageSignal(turn.content);
    if (isExplicit && sig) {
      lockedLang = sig;
      lastLang = sig;
    } else if (sig === 'tanglish') {
      lockedLang = null;
      lastLang = 'tanglish';
    } else if (sig === 'telugu') {
      lockedLang = 'telugu';
      lastLang = 'telugu';
    } else if (sig === 'english' && !lockedLang) {
      lastLang = 'english';
    }
  }

  const curr = detectLanguageSignal(message);
  if (curr.isExplicit && curr.sig) return curr.sig;
  if (curr.sig === 'telugu') return 'telugu';
  if (curr.sig === 'tanglish') return 'tanglish';
  if (lockedLang === 'telugu') return 'telugu';
  if (lockedLang === 'tanglish') return 'tanglish';
  if (curr.sig === 'english') return 'english';
  return lastLang;
}

function extractSessionIdentity(cleanedHistory = [], currentMessage = '') {
  const turns = [...cleanedHistory.filter((t) => t.role === 'user').map((t) => t.content), currentMessage];
  const patterns = [
    /\b(?:i am|i'm|im|my name is|this is|call me)\s+([A-Za-z][A-Za-z\s]{1,40})/i,
    /\b(?:nenu|naa peru|na peru)\s+([A-Za-z][A-Za-z\s]{1,35}?)(?:\s+ni|\s*$|\s*[,.!?])/i
  ];
  let found = null;
  for (const text of turns) {
    if (/\b(nenu evaru|who am i)\b/i.test(text)) continue;
    for (const pat of patterns) {
      const m = text.trim().match(pat);
      if (m && m[1]) {
        const cand = m[1].replace(/[.,!?]+$/g, '').trim();
        if (!['a', 'an', 'the', 'asking', 'testing', 'interested', 'looking'].includes(cand.toLowerCase())) {
          found = cand;
        }
      }
    }
  }
  return found;
}

function countRepeats(message = '', cleanedHistory = []) {
  const norm = String(message || '').toLowerCase().replace(/[^\w\s]/g, '').trim();
  if (!norm || norm.length < 4) return 1;
  let prior = 0;
  for (const turn of cleanedHistory) {
    if (turn.role === 'user') {
      const prev = turn.content.toLowerCase().replace(/[^\w\s]/g, '').trim();
      if (prev === norm) prior++;
    }
  }
  return prior + 1;
}

function matchProjects(text = '') {
  const lower = text.toLowerCase();
  return sakraKnowledge.projects.filter((p) =>
    p.aliases.some((alias) => new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(lower))
  );
}

function resolveFollowupSubject(cleanedHistory = [], msg = '') {
  const wantsTech = /\b(tech|stack|framework|database|use)\b/i.test(msg);

  // Scan recent turns newest-first for a single unambiguous project mention (ignoring multi-project overview lists)
  for (const rolePref of ['user', 'assistant']) {
    for (let i = cleanedHistory.length - 1; i >= 0; i--) {
      const turn = cleanedHistory[i];
      if (turn.role !== rolePref) continue;
      const matches = matchProjects(turn.content);
      if (matches.length === 1) {
        return {
          intent: wantsTech ? 'project_tech' : 'project_followup',
          project: matches[0]
        };
      }
    }
  }

  for (let i = cleanedHistory.length - 1; i >= 0; i--) {
    const txt = cleanedHistory[i].content;
    if (/\b(likith|anumakonda|founder|ceo|pbr|piano|echoes)\b/i.test(txt)) return { intent: 'founder', project: null };
    if (/\b(start a project|inquire|smart project brief|consultation|schedule)\b/i.test(txt)) return { intent: 'start_project', project: null };
    if (/\b(tech stack|deployed in live|in-development)\b/i.test(txt)) return { intent: 'tech_stack', project: null };
    if (/\b(services?|capabilities|offer)\b/i.test(txt)) return { intent: 'services', project: null };
    if (/\b(sakravision|sakra vision|company|studio)\b/i.test(txt)) return { intent: 'company', project: null };
  }

  return null;
}

function detectIntent(message = '', cleanedHistory = []) {
  const msg = String(message || '').toLowerCase().trim();
  if (evaluateSafeMath(message) !== null) return { intent: 'math', project: null };
  if (/\b(nenu\s+evaru|who\s+am\s+i)\b/i.test(msg)) return { intent: 'user_identity', project: null };

  if ((EXPLICIT_TELUGU_RE.test(msg) || EXPLICIT_TANGLISH_RE.test(msg) || EXPLICIT_ENGLISH_RE.test(msg)) && msg.split(/\s+/).length <= 5) {
    for (let i = cleanedHistory.length - 1; i >= 0; i--) {
      if (cleanedHistory[i].role === 'user') {
        const prev = detectIntent(cleanedHistory[i].content, []);
        if (!['language_switch', 'greeting', 'general_or_unknown'].includes(prev.intent)) return prev;
      }
    }
    return { intent: 'language_switch', project: null };
  }

  const matchedProjects = matchProjects(msg);
  if (matchedProjects.length === 1) {
    const matchedProject = matchedProjects[0];
    if (/\b(tech|stack|technologies|tools|built with|use|used|database|backend|frontend|framework)\b/i.test(msg)) {
      return { intent: 'project_tech', project: matchedProject };
    }
    return { intent: 'project_detail', project: matchedProject };
  }

  // Explicit direct intents run BEFORE follow-up heuristics
  if (/\b(start a project|start project|how can i start|how to start|build a project|hire|collaborate|submit.*brief|book.*consult|schedule)\b/i.test(msg)) {
    return { intent: 'start_project', project: null };
  }
  if (/\b(instagram|insta|social|portfolio|github|linkedin|follow|handle)\b/i.test(msg)) {
    return { intent: 'social_links', project: null };
  }
  if (/\b(contact|email|mail|reach|phone|meet link|google meet)\b/i.test(msg)) {
    return { intent: 'contact', project: null };
  }
  if (/\b(likith|anumakonda|founder|ceo|owner|who built|who made|who created|author|pianist|pbr)\b/i.test(msg)) {
    return { intent: 'founder', project: null };
  }
  if (/\b(research|lab|experiment|prototype|r&d)\b/i.test(msg)) {
    return { intent: 'research', project: null };
  }
  if (/\b(top project|best project|flagship|compare)\b/i.test(msg)) {
    return { intent: 'project_comparison', project: null };
  }
  if (/\b(projects?|products?|built|show me.*work|what.*built)\b/i.test(msg) && !/\b(company|studio)\b/i.test(msg)) {
    return { intent: 'projects_list', project: null };
  }
  if (/\b(services?|capabilities|what do you offer|what can you build)\b/i.test(msg)) {
    return { intent: 'services', project: null };
  }
  if (/\b(sakra|company|studio|about|what does.*build|em chesthundi|chestundi)\b/i.test(msg)) {
    return { intent: 'company', project: null };
  }

  const isFollowUp =
    /^(more|details|tell me more|explain more|what else|why|elaborate|and\b|what about\b|daani gurinchi|inka cheppu)\b/i.test(msg) ||
    (msg.split(/\s+/).length <= 7 && /\b(it|its|that|this|he|his|him|they|their)\b/i.test(msg));

  if (isFollowUp && cleanedHistory.length > 0) {
    const resolved = resolveFollowupSubject(cleanedHistory, msg);
    if (resolved) return resolved;
  }

  if (/\b(tech|stack|technologies|frameworks|libraries|languages|database|tools|groq|fastapi|react)\b/i.test(msg)) {
    return { intent: 'tech_stack', project: null };
  }
  if (/^(hi|hello|hey|namaste|namaskaram|good morning|good evening|hii+)[\s!.]*$/i.test(msg)) {
    return { intent: 'greeting', project: null };
  }
  return { intent: 'general_or_unknown', project: null };
}

const cleanLink = (label, url) => `[${label}](${url})`;

export function getLocalChatbotReplyPayload(history = [], userMessage = '', preferredLanguage = null) {
  const cleanedHistory = cleanHistory(history);
  const language = resolveSessionLanguage(userMessage, cleanedHistory, preferredLanguage);
  const { intent, project } = detectIntent(userMessage, cleanedHistory);
  const repeatCount = countRepeats(userMessage, cleanedHistory);

  const f = sakraKnowledge.founder;
  const org = sakraKnowledge.company;

  let reply = '';

  if (repeatCount >= 3 && intent !== 'math') {
    if (language === 'telugu') {
      reply =
        'ఇదే ప్రశ్నకు సంబంధించిన సమాచారాన్ని మనం ఇప్పటికే చర్చించాము. మీకు టెక్ స్టాక్, ఆర్కిటెక్చర్ లేదా ప్రాజెక్ట్ ప్రారంభంపై మరింత వివరణ కావాలంటే చెప్పండి.';
    } else if (language === 'tanglish') {
      reply =
        'Idhe question ki main details already share chesanu. Meeku tech stack, architecture, leda project start process gurinchi specific ga kavali ante cheppandi!';
    } else {
      reply =
        "I've already shared these details in this session. Let me know if you'd like to explore the architecture, tech stack breakdown, or starting a build instead.";
    }
    return { reply, source: 'fallback', language };
  }

  if (intent === 'math') {
    const math = evaluateSafeMath(userMessage);
    if (math?.error === 'division_by_zero') {
      reply =
        language === 'telugu'
          ? `\`${math.expression}\` లో సున్నాతో భాగహారం సాధ్యం కాదు.`
          : language === 'tanglish'
            ? `\`${math.expression}\` lo zero tho divide cheyyadam valid kaadu.`
            : `Cannot evaluate \`${math.expression}\` because division by zero is undefined.`;
    } else if (math) {
      const steps = math.steps.length ? math.steps.join(' -> ') : `\`${math.expression}\` = \`${math.result}\``;
      reply =
        language === 'telugu'
          ? `**గణన ఫలితం:** \`${math.expression} = ${math.result}\`\n\nదశలవారీగా: ${steps}`
          : language === 'tanglish'
            ? `**Result:** \`${math.expression} = ${math.result}\`\n\nStep-by-step (BODMAS prakaram): ${steps}`
            : `**Result:** \`${math.expression} = ${math.result}\`\n\nCalculation breakdown: ${steps}`;
    }
    return { reply, source: 'fallback', language };
  }

  if (intent === 'user_identity') {
    const idName = extractSessionIdentity(cleanedHistory, userMessage);
    if (idName && idName.toLowerCase().includes('likith')) {
      reply =
        language === 'telugu'
          ? `ఈ సెషన్ ఆధారంగా మీరు **${f.fullName}** — SAKRA VISION Founder & CEO, AI/ML Engineer, ${f.education}, పియానిస్ట్ మరియు *Echoes of an Unsaid Goodbye* రచయిత.\n\n• ${cleanLink("Visit Likith's Portfolio", f.portfolio)}`
          : language === 'tanglish'
            ? `Ee chat context prakaram meeru **${f.fullName}** — SAKRA VISION Founder & CEO, AI/ML Engineer, ${f.education}, pianist, mariyu *Echoes of an Unsaid Goodbye* author.\n\n• ${cleanLink("Visit Likith's Portfolio", f.portfolio)}`
            : `Based on this session, you are **${f.fullName}** — ${f.role}, ${f.title}, and ${f.education}.`;
    } else if (idName) {
      reply =
        language === 'tanglish'
          ? `Meeru ee session lo mee peru **${idName}** ani chepparu. SAKRA VISION gurinchi emaina adagandi!`
          : language === 'telugu'
            ? `ఈ సెషన్‌లో మీరు మీ పేరు **${idName}** అని పరిచయం చేసుకున్నారు.`
            : `In this session, you introduced yourself as **${idName}**.`;
    } else {
      reply =
        language === 'telugu'
          ? `మీరు ఈ చాట్‌లో మీ పేరు చెప్పనందున మీరు ఎవరో నాకు తెలియదు (నేను వ్యక్తిగత మెమరీని శాశ్వతంగా సేవ్ చేయను). అయితే **SAKRA VISION** స్థాపకుడు **${f.fullName}**.`
          : language === 'tanglish'
            ? `Meeru ee chat lo mee peru inka cheppaledu kabatti meeru evaro nenu guess cheyyalenu (nenu permanent memory save cheyyanu). **SAKRA VISION** founder aite **${f.fullName}** (Founder & CEO, AI/ML Engineer). Meeru mee gurinchi chebite ee session lo gurthu pettukuntanu!`
            : `I don't know who you are unless you introduce yourself here—I don't assume every visitor is the founder or retain persistent personal memory across sessions. (SAKRA VISION's founder is **${f.fullName}**.)`;
    }
    return { reply, source: 'fallback', language };
  }

  if (intent === 'language_switch') {
    reply =
      language === 'telugu'
        ? 'తప్పకుండా, ఇకపై మనం **తెలుగులో** మాట్లాడుకుందాం! SAKRA VISION ప్రాజెక్టులు, టెక్ స్టాక్ లేదా ఫౌండర్ గురించి ఏది కావాలంటే అది అడగండి.'
        : language === 'tanglish'
          ? 'Sure! Ippati nunchi **Tanglish** lo chat cheddam. SAKRA VISION projects, tech stack, founder Likith, leda mee project gurinchi adagandi!'
          : 'Switched back to **English**. How can I assist you with SAKRA VISION?';
    return { reply, source: 'fallback', language };
  }

  if (intent === 'project_tech' && project) {
    const stackStr = project.techStack.join(', ');
    const linkLine = project.liveUrl
      ? `\n\n• ${cleanLink(project.liveLabel, project.liveUrl)}`
      : '\n\n*(Currently offline / in development without a public web demo.)*';
    if (language === 'telugu') {
      reply = `### ${project.name} టెక్నాలజీ స్టాక్\n**${project.name}** (${project.status}) లో ఉపయోగించినవి:\n\n• **Core Stack**: ${stackStr}\n• **విధానం**: ${project.solution}${linkLine}`;
    } else if (language === 'tanglish') {
      reply = `### ${project.name} Technology Stack\n**${project.name}** (${project.status}) lo vaadina verified stack:\n\n• **Core Stack**: ${stackStr}\n• **Architecture**: ${project.solution}${linkLine}`;
    } else {
      reply = `### Technologies Used in ${project.name}\n**Status:** ${project.status}\n\n• **Stack**: ${stackStr}\n• **Architecture Role**: ${project.solution}${linkLine}`;
    }
    return { reply, source: 'fallback', language };
  }

  if ((intent === 'project_detail' || intent === 'project_followup') && project) {
    if (repeatCount === 2) {
      reply =
        language === 'tanglish'
          ? `**${project.name}** quick recap: ${project.solution} (Stack: ${project.techStack.slice(0, 4).join(', ')}).`
          : `**Quick recap on ${project.name} (${project.status}):** ${project.solution}`;
      return { reply, source: 'fallback', language };
    }
    const TE_PROJECTS = {
      'prometheus-ai': [
        'క్లౌడ్ సర్వర్లపై ఆధారపడకుండా ఆడియో మరియు ప్రశ్నలను స్థానిక డివైస్‌లోనే ప్రాసెస్ చేయడం.',
        'Whisper వాయిస్ ట్రాన్స్‌క్రిప్షన్, FastAPI రూటింగ్ మరియు Apple MLX / Ollama ద్వారా స్థానికంగా Llama AI ను నడిపే ఎడ్జ్ సిస్టమ్.'
      ],
      'resolvit-ai': [
        'ప్రజా ఫిర్యాదులలో డూప్లికేట్ రిపోర్టులు మరియు ఆలస్యమైన పరిష్కారం.',
        'Computer Vision డూప్లికేట్ చెకింగ్, FastAPI NLP ప్రయారిటీ స్కోరింగ్, PostgreSQL మరియు Google Maps తో అధికారులకు రియల్-టైమ్ డాష్‌బోర్డ్.'
      ],
      'bench-ai': [
        'ఇంటర్నెట్ లేని గ్రామీణ తరగతి గదుల్లో విద్యార్థులు క్లౌడ్ AI పై ఆధారపడలేకపోవడం.',
        'స్థానిక PDFలు, పాఠ్యపుస్తకాలను LangChain మరియు FAISS vector search తో ఇండెక్స్ చేసి, పూర్తిగా ఆఫ్‌లైన్‌లో Ollama / Llama ద్వారా సమాధానాలు ఇచ్చే లెర్నింగ్ అసిస్టెంట్.'
      ],
      'event-hub': [
        'ఈవెంట్ రిజిస్ట్రేషన్లలో పేమెంట్ స్క్రీన్‌షాట్లను మాన్యువల్‌గా తనిఖీ చేయడం.',
        'Python OCR ద్వారా రసీదులను తనిఖీ చేసి MySQL మరియు అడ్మిన్ అప్రూవల్‌తో ఆటోమేటెడ్ కన్ఫర్మేషన్ అందించే ఫుల్-స్టాక్ ప్లాట్‌ఫారమ్.'
      ],
      'aquasentinel-ai': [
        'సముద్ర కాలుష్యం మరియు వాతావరణ హెచ్చరికలను స్థానిక భాషల్లో సమన్వయం చేయడం.',
        'OpenWeather, OpenStreetMap మరియు Groq ఆధారిత RAG సహాయంతో ప్రాంతీయ భారతీయ భాషల్లో మత్స్యకారులకు మార్గదర్శకం ఇచ్చే ప్లాట్‌ఫారమ్.'
      ]
    };
    const TG_PROJECTS = {
      'prometheus-ai': [
        'Cloud servers ki audio leda data pampakunda, local device lo AI run avvadam.',
        'Whisper voice input, FastAPI router, mariyu Apple MLX / Ollama tho local Llama inference chese edge AI companion.'
      ],
      'resolvit-ai': [
        'Public complaints tracking lo delay mariyu duplicate reports bottleneck.',
        'Computer Vision duplicate check, FastAPI NLP priority scoring, PostgreSQL mariyu Google Maps tho authority command portal.'
      ],
      'bench-ai': [
        'Internet leni classrooms lo students cloud AI tutors vaadakapovadam.',
        'Local PDFs mariyu textbooks ni LangChain + FAISS tho index chesi offline Ollama / Llama tho Q&A chese study terminal.'
      ],
      'event-hub': [
        'Event payment screenshots manual ga verify cheyadam lo time delay.',
        'Python OCR tho payment receipt check chesi, JWT admin portal mariyu MySQL tho automated email confirmation pampedi.'
      ],
      'aquasentinel-ai': [
        'Marine debris tracking, weather data, mariyu regional dialects okachota kalapadam.',
        'OpenWeather, OpenStreetMap, mariyu Groq RAG tho multi-language marine guidance icche platform.'
      ]
    };

    const caps = project.capabilities.slice(0, 4).map((c) => `• ${c}`).join('\n');
    const linkBlock = project.liveUrl
      ? `\n\n• ${cleanLink(project.liveLabel, project.liveUrl)}`
      : '\n\n• **Access**: Offline / In Development (no live web demo yet)';
    if (language === 'telugu') {
      const [teProb, teSol] = TE_PROJECTS[project.id] || [project.problem, project.solution];
      const teLink = project.liveUrl
        ? `\n\n• ${cleanLink(project.liveLabel, project.liveUrl)}`
        : '\n\n• **లభ్యత**: ఆఫ్‌లైన్ / అభివృద్ధి దశలో (పబ్లిక్ వెబ్ లింక్ ఇంకా లేదు)';
      reply = `### ${project.name} (${project.status})\n**${project.category}**\n\n• **సమస్య**: ${teProb}\n• **పరిష్కారం**: ${teSol}\n• **టెక్ స్టాక్**: ${project.techStack.join(', ')}${teLink}`;
    } else if (language === 'tanglish') {
      const [tgProb, tgSol] = TG_PROJECTS[project.id] || [project.problem, project.solution];
      reply = `### ${project.name} (${project.status})\n**${project.category}**\n\n• **Problem**: ${tgProb}\n• **Solution**: ${tgSol}\n• **Tech Stack**: ${project.techStack.join(', ')}${linkBlock}`;
    } else {
      reply = `### ${project.name} (${project.status})\n**${project.category}**\n\n• **Problem Solved**: ${project.problem}\n• **How It Works**: ${project.solution}\n\n**Core Capabilities**\n${caps}\n\n• **Technologies**: ${project.techStack.join(', ')}${linkBlock}`;
    }
    return { reply, source: 'fallback', language };
  }

  if (intent === 'founder') {
    if (language === 'telugu') {
      reply =
        `### ${f.fullName}\n**${f.role}**\n\n` +
        `• **వృత్తి**: ${f.title}\n` +
        `• **విద్య**: ${f.education}\n` +
        `• **సృజనాత్మక రంగం**: పియానిస్ట్ మరియు *"Echoes of an Unsaid Goodbye"* రచయిత\n` +
        `• ${cleanLink("Visit Likith's Portfolio", f.portfolio)} · ${cleanLink('View Likith on Instagram', f.instagram)}`;
    } else if (language === 'tanglish') {
      reply =
        `### ${f.fullName}\n**${f.role}**\n\n` +
        `• **Role**: ${f.title}\n` +
        `• **Education**: ${f.education}\n` +
        `• **Creative Work**: Pianist mariyu *"Echoes of an Unsaid Goodbye"* author\n` +
        `• ${cleanLink("Visit Likith's Portfolio", f.portfolio)} · ${cleanLink('View Likith on Instagram', f.instagram)}`;
    } else {
      reply =
        `### ${f.fullName}\n**${f.role} · ${f.title}**\n\n` +
        `• **Education**: ${f.education}\n` +
        `• **Creative Work**: Pianist and author of *"Echoes of an Unsaid Goodbye"*\n` +
        `• **Focus**: Building real-world AI, Computer Vision, RAG, and full-stack software products.\n\n` +
        `• ${cleanLink("Visit Likith's Portfolio", f.portfolio)}\n` +
        `• ${cleanLink('View Likith on Instagram', f.instagram)} (${f.instagramHandle})\n` +
        `• ${cleanLink('View SAKRA VISION on GitHub', f.github)}`;
    }
    return { reply, source: 'fallback', language };
  }

  if (intent === 'tech_stack') {
    const dep = sakraKnowledge.techStack.deployed;
    if (language === 'telugu') {
      reply =
        '### SAKRA VISION టెక్నాలజీ స్టాక్\n\n' +
        '• **లైవ్ ప్రాజెక్టులలో వాడుతున్నవి**: React, Next.js, Tailwind CSS, Python, FastAPI, PostgreSQL (RESOLVIT AI), MySQL / Aiven Cloud, Groq API, Ollama, Llama, Whisper (Local), Apple MLX, OpenCV / OCR, OpenStreetMap, OpenWeather, Vercel, Render.\n' +
        '• **అభివృద్ధి దశలో (In Development)**: BenchAI కోసం LangChain మరియు FAISS local vector search (Offline RAG).\n' +
        '• **పరిశోధన దశలో (Research Lab)**: Constrained AI agent guardrails (Pydantic) మరియు low-contrast receipt OCR.';
    } else if (language === 'tanglish') {
      reply =
        '### SAKRA VISION Technology Stack\n\n' +
        '• **Deployed in Live Products**: React, Next.js, Tailwind CSS, Python, FastAPI, PostgreSQL (RESOLVIT AI), MySQL / Aiven Cloud, Groq API, Ollama, Llama, Whisper, Apple MLX, OpenCV / OCR, OpenStreetMap, OpenWeather, Vercel, Render.\n' +
        '• **In Development (BenchAI)**: LangChain chunking mariyu FAISS local vector search (Offline RAG).\n' +
        '• **Research Lab Explorations**: Schema-validated AI agent guardrails (Pydantic) & mobile receipt OCR improvements.';
    } else {
      reply =
        '### SAKRA VISION Technology Stack\n\n' +
        '**1. Deployed in Live Products**\n' +
        `• **Frontend**: ${dep['Frontend & UI'].join(', ')}\n` +
        `• **Backend & Security**: ${dep['Backend, Security & Messaging'].join(', ')}\n` +
        `• **Databases & Hosting**: ${dep['Databases & Hosting'].join(', ')}\n` +
        `• **AI, Vision & Spatial**: ${dep['AI, Vision & Geospatial'].join(', ')}\n\n` +
        '**2. Used in In-Development Products**\n' +
        `• ${sakraKnowledge.techStack.inDevelopment.join(', ')}\n\n` +
        '**3. Explored in SAKRA Research Lab**\n' +
        `• ${sakraKnowledge.techStack.explored.join('; ')}`;
    }
    return { reply, source: 'fallback', language };
  }

  if (intent === 'projects_list' || intent === 'project_comparison') {
    const items = sakraKnowledge.projects
      .slice(0, 5)
      .map((p) => {
        const link = p.liveUrl ? ` — ${cleanLink(p.liveLabel, p.liveUrl)}` : ' — *(In Development / Offline)*';
        return `• **${p.name}** *(${p.category})*: ${p.solution}${link}`;
      })
      .join('\n');
    reply =
      language === 'telugu'
        ? `### SAKRA VISION ప్రధాన ప్రాజెక్టులు\n\n${items}`
        : language === 'tanglish'
          ? `### SAKRA VISION Projects\n\n${items}`
          : `### SAKRA VISION Products\n\n${items}`;
    return { reply, source: 'fallback', language };
  }

  if (intent === 'services') {
    const email1 = `[${org.emails[0]}](mailto:${org.emails[0]})`;
    const svc = sakraKnowledge.services.map((s) => `• **${s.name}**: ${s.summary}`).join('\n');
    reply =
      language === 'telugu'
        ? `### SAKRA VISION సేవలు\n\n${svc}`
        : language === 'tanglish'
          ? `### SAKRA VISION Services\n\n${svc}\n\nKotha project start cheyalante Website lo **Smart Project Brief** use cheyyachu.`
          : `### SAKRA VISION Capabilities\n\n${svc}\n\n• Ready to discuss a build? Email ${email1} or ${cleanLink('Open Google Meet Consultation', org.consultation.meetUrl)}.`;
    return { reply, source: 'fallback', language };
  }

  if (intent === 'start_project') {
    const email1 = `[${org.emails[0]}](mailto:${org.emails[0]})`;
    const email2 = `[${org.emails[1]}](mailto:${org.emails[1]})`;
    if (language === 'telugu') {
      reply =
        '### ప్రాజెక్ట్ ఎలా ప్రారంభించాలి?\n\n' +
        '1. **Smart Project Brief**: వెబ్‌సైట్‌లోని **Inquire** పేజీలో మీ అవసరాలు పంపండి.\n' +
        `2. **Google Meet**: ${cleanLink('Open Google Meet Consultation', org.consultation.meetUrl)} (${org.consultation.hours})\n` +
        `3. **ఇమెయిల్**: ${email1}`;
    } else if (language === 'tanglish') {
      reply =
        '### Project Ela Start Cheyali?\n\n' +
        '1. **Smart Project Brief**: Website lo **Inquire** page open chesi mee requirements submit cheyandi.\n' +
        `2. **Google Meet**: ${cleanLink('Open Google Meet Consultation', org.consultation.meetUrl)} (${org.consultation.hours})\n` +
        `3. **Email**: ${email1}`;
    } else {
      reply =
        '### How to Start a Project with SAKRA VISION\n\n' +
        '1. **Smart Project Brief**: Open the **Inquire** page to outline your scope, requirements, and target timeline.\n' +
        `2. **Consultation Call**: Book a session or join ${cleanLink('Open Google Meet Consultation', org.consultation.meetUrl)} (${org.consultation.hours}).\n` +
        `3. **Primary Email**: ${email1}\n` +
        `4. **Secondary Email**: ${email2}`;
    }
    return { reply, source: 'fallback', language };
  }

  if (intent === 'contact' || intent === 'social_links') {
    const email1 = `[${org.emails[0]}](mailto:${org.emails[0]})`;
    const email2 = `[${org.emails[1]}](mailto:${org.emails[1]})`;
    reply =
      language === 'telugu'
        ? `### సంప్రదించే వివరాలు\n\n• **ప్రాథమిక ఇమెయిల్**: ${email1}\n• **ప్రత్యామ్నాయ ఇమెయిల్**: ${email2}\n• **Google Meet**: ${cleanLink('Open Google Meet Consultation', org.consultation.meetUrl)} (${org.consultation.hours})\n• **Portfolio**: ${cleanLink("Visit Likith's Portfolio", f.portfolio)}\n• **Instagram**: ${cleanLink('View Likith on Instagram', f.instagram)}`
        : language === 'tanglish'
          ? `### SAKRA VISION Contact Details\n\n• **Primary Email**: ${email1}\n• **Secondary Email**: ${email2}\n• **Google Meet**: ${cleanLink('Open Google Meet Consultation', org.consultation.meetUrl)} (${org.consultation.hours})\n• **Portfolio**: ${cleanLink("Visit Likith's Portfolio", f.portfolio)}\n• **Instagram**: ${cleanLink('View Likith on Instagram', f.instagram)}`
          : `### Contact SAKRA VISION\n\n• **Primary Email**: ${email1}\n• **Secondary Email**: ${email2}\n• **Google Meet**: ${cleanLink('Open Google Meet Consultation', org.consultation.meetUrl)} (${org.consultation.hours})\n• **Portfolio**: ${cleanLink("Visit Likith's Portfolio", f.portfolio)}\n• **Instagram**: ${cleanLink('View Likith on Instagram', f.instagram)}\n• **Website**: ${cleanLink('Visit SAKRA VISION Website', org.website)}`;
    return { reply, source: 'fallback', language };
  }

  if (intent === 'research') {
    reply =
      '### SAKRA Research Lab\n\n' +
      sakraKnowledge.techStack.explored.map((e) => `• ${e}`).join('\n') +
      '\n\n• Explore detailed engineering notes directly in the **Research Lab** view.';
    return { reply, source: 'fallback', language };
  }

  if (intent === 'company') {
    if (language === 'telugu') {
      reply =
        `### SAKRA VISION (సక్ర విజన్)\n**AI Product Studio · స్థాపన: 2026**\n\n` +
        `${f.fullName} స్థాపించిన SAKRA VISION, AI అప్లికేషన్లు, Computer Vision, LLM/RAG టూల్స్, ఆటోమేషన్ మరియు ఫుల్-స్టాక్ వెబ్ సిస్టమ్స్ నిర్మిస్తుంది.\n\n` +
        `• **ప్రధాన ప్రొడక్టులు**: Prometheus AI V2.0, RESOLVIT AI, BenchAI, Event Hub, AquaSentinel AI.`;
    } else if (language === 'tanglish') {
      reply =
        `### SAKRA VISION (@sakravision)\n**AI Product Studio · Est. 2026**\n\n` +
        `**${f.fullName}** sthapinchina **SAKRA VISION**, AI applications, Computer Vision pipelines, LLM/RAG tools, workflow automation, mariyu full-stack web products ni build chesthundi.\n\n` +
        `• **Products**: Prometheus AI V2.0, RESOLVIT AI, BenchAI (In Development), Event Hub, AquaSentinel AI.`;
    } else {
      reply =
        `### SAKRA VISION (@sakravision)\nFounded in 2026 by **${f.fullName}**, SAKRA VISION is an AI product studio engineering practical AI applications, Computer Vision systems, local & cloud RAG tools, automation workflows, and full-stack platforms.\n\n• ${cleanLink('Visit SAKRA VISION Website', org.website)}`;
    }
    return { reply, source: 'fallback', language };
  }

  if (intent === 'greeting') {
    reply =
      language === 'telugu'
        ? 'నమస్కారం! నేను SAKRA-BOT. SAKRA VISION ప్రాజెక్టులు, టెక్నాలజీ స్టాక్ లేదా కొత్త ప్రాజెక్ట్ గురించి ఏమి సహాయం చేయగలను?'
        : language === 'tanglish'
          ? 'Namaskaram! Nenu SAKRA-BOT. SAKRA VISION projects, tech stack, founder Likith, leda project brief gurinchi adagandi!'
          : "Hello! I'm SAKRA-BOT. What would you like to know about SAKRA VISION's products, technologies, or starting a project?";
    return { reply, source: 'fallback', language };
  }

  reply =
    language === 'telugu'
      ? 'ప్రస్తుతం ఆఫ్‌లైన్ స్టూడియో ఫాల్‌బ్యాక్ మోడ్‌లో ఉన్నాను కాబట్టి బయటి విషయాలను లైవ్‌లో శోధించలేను. SAKRA VISION ప్రొడక్టులు, టెక్ స్టాక్, ఫౌండర్ వివరాలు లేదా గణిత లెక్కలపై అడగండి.'
      : language === 'tanglish'
        ? 'Prasthutham offline studio fallback mode lo unnanu kabatti external topics search cheyyalenu. Kani SAKRA VISION products, tech stack, founder Likith details, project process, leda math calculations gurinchi adagandi!'
        : "I'm currently responding in offline studio fallback mode while the live Groq inference endpoint is unavailable, so I can't answer outside topics right now. I can help with SAKRA VISION products, tech stack, founder details, studio contact info, or math calculations.";
  return { reply, source: 'fallback', language };
}

export const getLocalChatbotReply = (history = [], userMessage = '', preferredLanguage = null) =>
  getLocalChatbotReplyPayload(history, userMessage, preferredLanguage).reply;
