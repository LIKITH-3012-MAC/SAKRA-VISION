import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Sparkles, User, Code2, Video, Terminal, Cpu, ArrowUpRight } from 'lucide-react';

const MEETING_URL = "https://meet.google.com/grg-hytm-ahw";
const CONSULTATION_HOURS = "Every day · 6:00 PM – 9:00 PM IST";

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
    <div className="my-4 rounded-xl border border-white/10 bg-slate-950/90 overflow-hidden shadow-xl text-left">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/60 border-b border-white/5 font-mono text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 font-semibold text-[#38bdf8] uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5" />
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded bg-white/5 hover:bg-white/10"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      {/* Code Body with Horizontal Scroll */}
      <div className="p-4 overflow-x-auto text-xs font-mono text-slate-200 leading-relaxed scrollbar-thin">
        <pre>{code}</pre>
      </div>
    </div>
  );
}

// Founder Profile Layout Component
function FounderProfileCard() {
  return (
    <div className="my-3 p-5 rounded-2xl bg-gradient-to-b from-[#080c17]/90 to-[#020617]/95 border border-[#38bdf8]/30 shadow-2xl text-left relative overflow-hidden backdrop-blur-xl">
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#0071e3]/20 blur-[60px] rounded-full pointer-events-none" />
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0071e3] to-[#38bdf8] p-0.5 shadow-lg flex-shrink-0">
          <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center text-[#38bdf8]">
            <User className="w-6 h-6" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#38bdf8] uppercase font-bold">
              ✦ FOUNDER & LEAD ARCHITECT
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-white font-sans tracking-tight mt-0.5">
            Likith Naidu Anumakonda
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Founder & CEO of SAKRA VISION (@sakravision)
          </p>
        </div>
      </div>

      {/* Credentials List */}
      <div className="mt-4 pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 font-sans">
        <div className="flex items-center gap-2">
          <span className="text-[#38bdf8]">▪</span> AI/ML Engineer
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#38bdf8]">▪</span> Python Full-Stack Developer
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#38bdf8]">▪</span> CSE (AI) Student
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#38bdf8]">▪</span> IIT Patna Certified Learner
        </div>
        <div className="flex items-center gap-2 sm:col-span-2">
          <span className="text-[#38bdf8]">▪</span> Pianist, Author & Intelligent Systems Builder
        </div>
      </div>

      {/* Action CTAs */}
      <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap gap-2">
        <a
          href="https://www.instagram.com/likhithnaidu_anumakonda"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 text-pink-300 hover:text-white text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer"
        >
          <span>Instagram (@likhithnaidu_anumakonda)</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>

        <a
          href="https://likith-portfolio.online/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer"
        >
          <span>Portfolio</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

// Project Portfolio Grid Layout Component
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
      category: 'Marine Intelligence',
      desc: 'Satellite data processing and ocean debris tracking platform using deep learning vision models.',
      tags: ['Satellite Data', 'Computer Vision'],
      link: 'https://aquq-sentinel-phsv.vercel.app/'
    }
  ];

  return (
    <div className="my-4 text-left">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-mono tracking-widest text-[#38bdf8] uppercase font-bold">
          ✦ SAKRA VISION PROJECT PORTFOLIO
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {projects.map((proj, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#38bdf8]/40 transition-all duration-300 flex flex-col justify-between group backdrop-blur-md"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <h4 className="text-sm font-bold text-white font-sans group-hover:text-[#38bdf8] transition-colors">
                  {proj.title}
                </h4>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                  {proj.category}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-light leading-relaxed mb-3">
                {proj.desc}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {proj.tags.map((tag, tIdx) => (
                  <span key={tIdx} className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#0071e3]/10 text-[#38bdf8] border border-[#38bdf8]/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {proj.link && (
              <a
                href={proj.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between text-xs font-semibold text-[#38bdf8] hover:text-white pt-2 border-t border-white/5 transition-colors cursor-pointer"
              >
                <span>Explore Project</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            )}
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
    <div className="my-4 text-left p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md">
      <div className="text-[10px] font-mono tracking-widest text-[#38bdf8] uppercase font-bold mb-3">
        ✦ TECHNICAL STACK & ECOSYSTEM
      </div>
      <div className="flex flex-wrap gap-2">
        {stacks.map((tech, idx) => (
          <div
            key={idx}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-200 transition-all hover:scale-[1.03] flex items-center gap-1.5"
          >
            <Cpu className="w-3 h-3 text-[#38bdf8]" />
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
    <div className="my-4 p-5 rounded-2xl bg-gradient-to-b from-[#080c17]/90 to-[#020617]/95 border border-[#38bdf8]/40 shadow-2xl text-left relative overflow-hidden backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-2">
        <Video className="w-4 h-4 text-[#38bdf8]" />
        <span className="text-[10px] font-mono tracking-widest text-[#38bdf8] uppercase font-bold">
          DIRECT CONSULTATION GATEWAY
        </span>
      </div>

      <h4 className="text-base font-bold text-white font-sans">
        Schedule a Direct Meeting with SAKRA VISION
      </h4>
      <p className="text-xs text-slate-300 font-light mt-1 mb-4 leading-relaxed">
        Connect with our AI product studio on Google Meet. Project scope and commercial terms are discussed individually.
      </p>

      <div className="p-3 rounded-xl bg-black/60 border border-white/10 mb-4 flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400">Availability:</span>
        <span className="text-xs font-mono text-white font-semibold">{CONSULTATION_HOURS}</span>
      </div>

      <a
        href={MEETING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0071e3] hover:bg-[#0a84ff] text-white text-xs font-semibold transition-all hover:shadow-[0_4px_16px_rgba(0,113,227,0.4)] cursor-pointer w-full border border-[#38bdf8]/30"
      >
        <span>Schedule a Meeting ↗</span>
      </a>
    </div>
  );
}

// Main AI Response Renderer Component
export default function AiResponseRenderer({ text }) {
  if (!text) return null;

  const lowerText = text.toLowerCase();

  // 1. Detect if text represents Founder Intent
  const isFounderResponse = lowerText.includes('likith naidu anumakonda') || lowerText.includes('founder & ceo') || lowerText.includes('lead architect of sakravision');

  // 2. Detect if text represents Project List Intent
  const isProjectListResponse = (lowerText.includes('resolvit ai') && lowerText.includes('prometheus ai')) || lowerText.includes('sakra vision project portfolio') || lowerText.includes('top & featured projects');

  // 3. Detect if text represents Tech Stack Intent
  const isTechStackResponse = lowerText.includes('technical stack') || (lowerText.includes('fastapi') && lowerText.includes('pytorch') && lowerText.includes('opencv'));

  // 4. Detect if text represents Direct Consultation / Contact Intent
  const isContactResponse = lowerText.includes('google meet') || lowerText.includes('consultation window') || lowerText.includes('https://meet.google.com');

  // Break response into Code vs Normal Text blocks
  const contentBlocks = parseCodeBlocks(text);

  return (
    <div className="ai-response-rendered space-y-3 font-sans text-left">
      
      {/* Visual Subhead Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-white/5 text-[10px] font-mono text-slate-400 tracking-wider">
        <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
        <span className="font-semibold text-white">SAKRA-BOT</span>
        <span className="text-[#38bdf8]">✦ INTELLIGENCE</span>
      </div>

      {/* Primary Content Render */}
      {contentBlocks.map((block, idx) => {
        if (block.type === 'code') {
          return <CodeBlockComponent key={idx} code={block.content} language={block.language} />;
        }

        // Parse formatted paragraphs, bullet points, headers, and clean syntax
        const rawLines = block.content.split('\n');
        
        return (
          <div key={idx} className="space-y-2 text-xs md:text-sm text-slate-200 leading-relaxed font-light">
            {rawLines.map((line, lIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={lIdx} className="h-1" />;

              // Clean Header Tags (### Header -> Rendered Section Title)
              if (trimmed.startsWith('#')) {
                const headerText = trimmed.replace(/^#+\s*/, '').replace(/[*_]/g, '');
                return (
                  <div key={lIdx} className="mt-3 mb-1">
                    <h4 className="text-sm font-bold text-white tracking-tight font-sans border-l-2 border-[#38bdf8] pl-2.5">
                      {headerText}
                    </h4>
                  </div>
                );
              }

              // Clean Bullet Lists (• item or * item)
              if (trimmed.startsWith('•') || trimmed.startsWith('*') || trimmed.startsWith('-')) {
                const bulletContent = trimmed.replace(/^[•*-]\s*/, '');
                // Extract Bold Labels if present
                const parts = bulletContent.split('**');
                return (
                  <div key={lIdx} className="flex items-start gap-2.5 my-1.5 pl-1">
                    <span className="text-[#38bdf8] mt-1 text-[10px] flex-shrink-0">▪</span>
                    <div className="flex-1">
                      {parts.map((p, pIdx) => {
                        // Alternate between bold and normal based on markdown split
                        if (pIdx % 2 === 1) {
                          return <strong key={pIdx} className="font-semibold text-white">{p}</strong>;
                        }
                        return <span key={pIdx}>{formatInlineLinks(p)}</span>;
                      })}
                    </div>
                  </div>
                );
              }

              // Key Insight Block Detection
              if (trimmed.toLowerCase().startsWith('key insight') || trimmed.toLowerCase().startsWith('note:')) {
                return (
                  <div key={lIdx} className="my-3 p-3.5 rounded-xl bg-[#0071e3]/10 border border-[#38bdf8]/30 text-xs text-slate-200">
                    <span className="text-[10px] font-mono font-bold text-[#38bdf8] block mb-1 uppercase">✦ KEY INSIGHT</span>
                    {formatInlineLinks(trimmed.replace(/^(key insight|note:)\s*/i, ''))}
                  </div>
                );
              }

              // Normal Paragraph
              const boldParts = trimmed.split('**');
              return (
                <p key={lIdx} className="my-1">
                  {boldParts.map((p, pIdx) => {
                    if (pIdx % 2 === 1) {
                      return <strong key={pIdx} className="font-semibold text-white">{p}</strong>;
                    }
                    return <span key={pIdx}>{formatInlineLinks(p)}</span>;
                  })}
                </p>
              );
            })}
          </div>
        );
      })}

      {/* Specialized Rich Card Injectors based on AI Response Context */}
      {isFounderResponse && <FounderProfileCard />}
      {isProjectListResponse && <ProjectPortfolioGrid />}
      {isTechStackResponse && <TechStackChips />}
      {isContactResponse && <DirectConsultationCard />}
    </div>
  );
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
        className="inline-flex items-center gap-0.5 text-[#38bdf8] hover:text-white font-medium underline underline-offset-2 transition-colors"
      >
        <span>{match[1]}</span>
        <ArrowUpRight className="w-3 h-3 inline" />
      </a>
    );
    lastIndex = linkRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
