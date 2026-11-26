import React, { useState } from 'react';
import { Copy, Check, User, Video, Terminal, Cpu, ArrowUpRight } from 'lucide-react';

const MEETING_URL = 'https://meet.google.com/grg-hytm-ahw';
const CONSULTATION_HOURS = 'Every day · 6:00 PM – 9:00 PM IST';

// Helper: Parse code blocks from markdown text
const parseCodeBlocks = (rawText) => {
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: rawText.substring(lastIndex, match.index) });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'code',
      content: match[2].trim()
    });
    lastIndex = codeBlockRegex.lastIndex;
  }
  if (lastIndex < rawText.length) {
    parts.push({ type: 'text', content: rawText.substring(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: rawText }];
};

// Code Block Component with Copy functionality
function CodeBlockComponent({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  return (
    <div className="my-3 rounded-xl border border-white/15 bg-slate-950/90 overflow-hidden shadow-xl text-left">
      <div className="flex items-center justify-between px-3.5 py-2 bg-black/70 border-b border-white/10 font-mono text-xs text-slate-300">
        <span className="flex items-center gap-1.5 font-semibold text-[#38bdf8] uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Code copied' : 'Copy code snippet'}
          className="flex items-center gap-1 text-xs text-slate-200 hover:text-white transition-colors cursor-pointer px-2.5 py-1 rounded bg-white/10 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto text-xs font-mono text-slate-100 leading-relaxed project-modal-scroll">
        <pre>{code}</pre>
      </div>
    </div>
  );
}

// Inline Markdown formatting (bold, italic, inline links)
function renderFormattedInline(text) {
  if (!text) return null;
  const boldParts = text.split('**');
  return boldParts.map((part, pIdx) => {
    if (pIdx % 2 === 1) {
      return (
        <strong key={pIdx} className="font-semibold text-white">
          {formatInlineLinks(part)}
        </strong>
      );
    }
    return <span key={pIdx}>{formatInlineLinks(part)}</span>;
  });
}

// Inline link formatter replacing raw Markdown links [Label](Url) with clean interactive chips
function formatInlineLinks(text) {
  if (!text) return null;
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-0.5 text-[#38bdf8] hover:text-white font-medium underline underline-offset-2 transition-colors break-all"
      >
        <span>{match[1]}</span>
        <ArrowUpRight className="w-3 h-3 inline shrink-0" aria-hidden="true" />
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

// Founder Profile Layout Component
function FounderProfileCard() {
  return (
    <div className="my-3 p-4 rounded-2xl bg-gradient-to-b from-[#0a1020] to-[#040814] border border-[#38bdf8]/30 shadow-xl text-left relative overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0071e3] to-[#38bdf8] p-0.5 shadow-lg flex-shrink-0">
          <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center text-[#38bdf8]">
            <User className="w-5 h-5" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-mono tracking-wider text-[#38bdf8] uppercase font-bold block">
            ✦ FOUNDER &amp; LEAD ARCHITECT
          </span>
          <h3 className="text-base font-extrabold text-white font-sans tracking-tight mt-0.5">
            Likith Naidu Anumakonda
          </h3>
          <p className="text-xs text-slate-300 font-sans mt-0.5">
            Founder &amp; CEO of SAKRA VISION (@sakravision)
          </p>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 gap-1.5 text-xs text-slate-200 font-sans">
        <div className="flex items-center gap-2">
          <span className="text-[#38bdf8]">▪</span> AI/ML Engineer &amp; Python Full-Stack Developer
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#38bdf8]">▪</span> CSE (AI) Student &amp; IIT Patna Certified Learner
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#38bdf8]">▪</span> Pianist, Author &amp; Intelligent Systems Builder
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
        <a
          href="https://www.instagram.com/likhithnaidu_anumakonda"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/35 text-pink-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          <span>Instagram (@likhithnaidu_anumakonda)</span>
          <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        </a>

        <a
          href="https://likith-portfolio.online/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
        >
          <span>Portfolio</span>
          <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

// Single-column Project Portfolio Cards inside Chatbot Drawer (prevents cramped 2-col squish)
function ProjectPortfolioGrid() {
  const projects = [
    {
      title: 'Resolvit AI',
      category: 'Civic Tech',
      desc: 'Intelligent civic issue resolution platform with computer vision duplicate detection & NLP priority routing.',
      tags: ['AI', 'CV', 'NLP'],
      link: 'https://www.resolvit-ai.online/'
    },
    {
      title: 'SAKRA VISION Event Hub',
      category: 'Event Tech',
      desc: 'Smart registration platform with automated payment screenshot OCR verification and admin approval workflows.',
      tags: ['OCR', 'Automation', 'FastAPI'],
      link: 'https://forms-project-f3sb.vercel.app/'
    },
    {
      title: 'Prometheus AI',
      category: 'Edge GenAI',
      desc: 'Local-first private intelligence system running edge LLMs, voice workflows, and localized agent execution.',
      tags: ['Edge AI', 'Voice', 'LLM'],
      link: 'https://www.prometheuslikiths-ai.online/'
    },
    {
      title: 'BenchAI',
      category: 'Education AI',
      desc: 'Offline LLM + RAG learning assistant for studying from local documents without internet connection.',
      tags: ['Offline RAG', 'Vector Search'],
      link: null
    },
    {
      title: 'AquaSentinel AI',
      category: 'Marine AI',
      desc: 'Satellite data processing and ocean debris tracking platform using deep learning vision models.',
      tags: ['Satellite Data', 'Computer Vision'],
      link: 'https://aquq-sentinel-phsv.vercel.app/'
    }
  ];

  return (
    <div className="my-3 text-left">
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-[11px] font-mono tracking-wider text-[#38bdf8] uppercase font-bold">
          ✦ SAKRA VISION PROJECT PORTFOLIO
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {projects.map((proj, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/15 hover:border-[#38bdf8]/40 transition-colors duration-200 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-white font-sans truncate">
                {proj.title}
              </h4>
              <span className="shrink-0 whitespace-nowrap text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-slate-200">
                {proj.category}
              </span>
            </div>

            <p className="text-xs text-slate-200 font-normal leading-relaxed">
              {proj.desc}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap gap-1.5">
                {proj.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0071e3]/15 text-[#38bdf8] border border-[#38bdf8]/25 whitespace-nowrap"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {proj.link && (
                <a
                  href={proj.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#38bdf8] hover:text-white transition-colors cursor-pointer whitespace-nowrap ml-auto"
                >
                  <span>Explore</span>
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tech Stack Chips Grid Component
function TechStackChips() {
  const stacks = [
    'Python', 'FastAPI', 'React', 'Next.js', 'Groq API', 'LLMs', 'RAG Architecture',
    'Computer Vision (OpenCV)', 'PyTorch', 'MySQL', 'PostgreSQL', 'Aiven Cloud', 'Resend API', 'Cloudflare'
  ];

  return (
    <div className="my-3 text-left p-3.5 rounded-2xl bg-white/[0.03] border border-white/15">
      <div className="text-[11px] font-mono tracking-wider text-[#38bdf8] uppercase font-bold mb-2.5">
        ✦ TECHNICAL STACK &amp; ECOSYSTEM
      </div>
      <div className="flex flex-wrap gap-1.5">
        {stacks.map((tech, idx) => (
          <div
            key={idx}
            className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/15 text-xs font-mono text-slate-100 flex items-center gap-1.5"
          >
            <Cpu className="w-3 h-3 text-[#38bdf8] shrink-0" aria-hidden="true" />
            <span>{tech}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Direct Consultation Card Component
function DirectConsultationCard() {
  return (
    <div className="my-3 p-4 rounded-2xl bg-gradient-to-b from-[#0a1020] to-[#040814] border border-[#38bdf8]/35 shadow-xl text-left">
      <div className="flex items-center gap-2 mb-1.5">
        <Video className="w-4 h-4 text-[#38bdf8] shrink-0" aria-hidden="true" />
        <span className="text-[11px] font-mono tracking-wider text-[#38bdf8] uppercase font-bold">
          DIRECT CONSULTATION GATEWAY
        </span>
      </div>

      <h4 className="text-sm sm:text-base font-bold text-white font-sans">
        Schedule a Direct Meeting with SAKRA VISION
      </h4>
      <p className="text-xs text-slate-200 font-normal mt-1 mb-3 leading-relaxed">
        Connect with our AI product studio on Google Meet. Project scope and commercial terms are discussed individually.
      </p>

      <div className="p-3 rounded-xl bg-black/60 border border-white/15 mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-mono text-slate-300">Availability:</span>
        <span className="text-xs font-mono text-white font-semibold">{CONSULTATION_HOURS}</span>
      </div>

      <a
        href={MEETING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[40px] rounded-xl bg-[#0071e3] hover:bg-[#0a84ff] text-white text-xs font-semibold transition-colors cursor-pointer w-full border border-[#38bdf8]/30"
      >
        <span>Schedule a Meeting</span>
        <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      </a>
    </div>
  );
}

// Render lines including Markdown tables, headings, bullets, and paragraphs
function MarkdownTextBlock({ content }) {
  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (!trimmed) {
      elements.push(<div key={`sp-${i}`} className="h-1" />);
      i++;
      continue;
    }

    // Markdown Table parsing
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      const rows = tableLines
        .filter((r) => !/^\|[\s:|-]+\|$/.test(r))
        .map((r) =>
          r
            .slice(1, -1)
            .split('|')
            .map((cell) => cell.trim())
        );

      if (rows.length > 0) {
        const [headerRow, ...bodyRows] = rows;
        elements.push(
          <div key={`tbl-${i}`} className="my-2 overflow-x-auto rounded-xl border border-white/15 bg-black/50">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/15 bg-white/[0.04]">
                  {headerRow.map((cell, cIdx) => (
                    <th key={cIdx} className="px-2.5 py-2 font-mono font-semibold text-[#38bdf8] whitespace-nowrap">
                      {renderFormattedInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-2.5 py-2 text-slate-200 align-top">
                        {renderFormattedInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      continue;
    }

    // Headers
    if (trimmed.startsWith('#')) {
      const headerText = trimmed.replace(/^#+\s*/, '').replace(/[*_]/g, '');
      elements.push(
        <div key={`h-${i}`} className="mt-2.5 mb-1">
          <h3 className="text-sm font-bold text-white tracking-tight font-sans border-l-2 border-[#38bdf8] pl-2.5">
            {headerText}
          </h3>
        </div>
      );
      i++;
      continue;
    }

    // Bullet / Numbered list items
    if (
      trimmed.startsWith('•') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('-') ||
      /^\d+\.\s/.test(trimmed)
    ) {
      const bulletContent = trimmed.replace(/^([•*-]|\d+\.)\s*/, '');
      elements.push(
        <div key={`li-${i}`} className="flex items-start gap-2 my-1 pl-0.5">
          <span className="text-[#38bdf8] mt-1 text-xs flex-shrink-0" aria-hidden="true">
            ▪
          </span>
          <div className="flex-1 min-w-0 break-words">{renderFormattedInline(bulletContent)}</div>
        </div>
      );
      i++;
      continue;
    }

    // Key Insight block
    if (trimmed.toLowerCase().startsWith('key insight') || trimmed.toLowerCase().startsWith('note:')) {
      elements.push(
        <div
          key={`note-${i}`}
          className="my-2.5 p-3 rounded-xl bg-[#0071e3]/15 border border-[#38bdf8]/30 text-xs text-slate-100"
        >
          <span className="text-[11px] font-mono font-bold text-[#38bdf8] block mb-1 uppercase">
            ✦ KEY INSIGHT
          </span>
          {renderFormattedInline(trimmed.replace(/^(key insight|note:)\s*/i, ''))}
        </div>
      );
      i++;
      continue;
    }

    // Normal paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1 break-words">
        {renderFormattedInline(trimmed)}
      </p>
    );
    i++;
  }

  return (
    <div className="space-y-1.5 text-xs sm:text-[13px] text-slate-100 leading-relaxed font-normal">
      {elements}
    </div>
  );
}

// Main AI Response Renderer Component
export default function AiResponseRenderer({ text }) {
  if (!text) return null;

  const lowerText = text.toLowerCase();

  const isFounderResponse =
    lowerText.includes('likith naidu anumakonda') ||
    lowerText.includes('founder & ceo') ||
    lowerText.includes('lead architect of sakravision');

  const isProjectListResponse =
    (lowerText.includes('resolvit ai') && lowerText.includes('prometheus ai')) ||
    lowerText.includes('sakra vision project portfolio') ||
    lowerText.includes('top & featured projects');

  const isTechStackResponse =
    lowerText.includes('technical stack') ||
    (lowerText.includes('fastapi') && lowerText.includes('pytorch') && lowerText.includes('opencv'));

  const isContactResponse =
    lowerText.includes('google meet') ||
    lowerText.includes('consultation window') ||
    lowerText.includes('https://meet.google.com');

  const contentBlocks = parseCodeBlocks(text);

  return (
    <div className="ai-response-rendered space-y-2.5 font-sans text-left">
      {/* Visual Subhead Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-[11px] font-mono text-slate-300 tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" aria-hidden="true" />
        <span className="font-semibold text-white">SAKRA-BOT</span>
        <span className="text-[#38bdf8]">✦ INTELLIGENCE</span>
      </div>

      {/* Primary Content Render */}
      {contentBlocks.map((block, idx) =>
        block.type === 'code' ? (
          <CodeBlockComponent key={idx} code={block.content} language={block.language} />
        ) : (
          <MarkdownTextBlock key={idx} content={block.content} />
        )
      )}

      {/* Specialized Rich Card Injectors */}
      {isFounderResponse && <FounderProfileCard />}
      {isProjectListResponse && <ProjectPortfolioGrid />}
      {isTechStackResponse && <TechStackChips />}
      {isContactResponse && <DirectConsultationCard />}
    </div>
  );
}
