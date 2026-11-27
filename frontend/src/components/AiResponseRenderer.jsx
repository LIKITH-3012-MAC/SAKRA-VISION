import React, { useState } from 'react';
import { Copy, Check, Terminal, ArrowUpRight, Compass, FolderGit2, FlaskConical, Sparkles } from 'lucide-react';

const SAFE_URL_PROTOCOLS = new Set(['https:', 'http:', 'mailto:']);

const CLEAN_URL_LABELS = [
  { match: 'resolvit-ai.online', label: 'Explore RESOLVIT AI' },
  { match: 'prometheuslikiths-ai.online', label: 'Explore Prometheus AI V2.0' },
  { match: 'forms-project-f3sb.vercel.app', label: 'Open SAKRA VISION Event Hub' },
  { match: 'aquq-sentinel-phsv.vercel.app', label: 'Explore AquaSentinel AI' },
  { match: 'likith-naidu-anumakonda.online', label: "Visit Likith's Portfolio" },
  { match: 'instagram.com/likhithnaidu_anumakonda', label: 'View SAKRA VISION on Instagram' },
  { match: 'github.com/LIKITH-3012-MAC', label: 'View SAKRA VISION on GitHub' },
  { match: 'linkedin.com/in/likith-naidu-anumakonda', label: 'Connect on LinkedIn' },
  { match: 'meet.google.com/grg-hytm-ahw', label: 'Open Google Meet Consultation' },
  { match: 'sakra-vision.online', label: 'Visit SAKRA VISION Website' }
];

function sanitizeSafeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  try {
    const parsed = new URL(trimmed);
    if (!SAFE_URL_PROTOCOLS.has(parsed.protocol)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

function getReadableUrlLabel(url, explicitLabel) {
  const cleanExplicit = (explicitLabel || '').replace(/[*_`]/g, '').trim();
  const isRawUrlLabel =
    !cleanExplicit ||
    /^https?:\/\//i.test(cleanExplicit) ||
    cleanExplicit === url;

  if (!isRawUrlLabel) return cleanExplicit;

  const lower = url.toLowerCase();
  const known = CLEAN_URL_LABELS.find((entry) => lower.includes(entry.match));
  if (known) return known.label;

  try {
    const u = new URL(url);
    return `Visit ${u.hostname.replace(/^www\./, '')}`;
  } catch {
    return 'Open Link';
  }
}

/**
 * Repairs common malformed or nested Markdown links emitted by LLMs, such as:
 * - [[Label](https://...) ](https://...)
 * - **[Label](https://...)**
 * - ([https://...](https://...))
 */
function normalizeMalformedMarkdown(rawText) {
  let out = String(rawText || '');
  // Unwrap double-nested markdown link syntax: [[Text](url1)](url2) -> [Text](url1)
  out = out.replace(/\[\s*\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\s*\]\((https?:\/\/[^)\s]+)\)/g, '[$1]($2)');
  // Unwrap bold around standalone link label: **[Label](url)** or [**Label**](url) -> [Label](url)
  out = out.replace(/\*\*\s*\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)\s*\*\*/g, '[$1]($2)');
  out = out.replace(/\[\*\*([^\]]+)\*\*\]\((https?:\/\/[^)\s]+)\)/g, '[$1]($2)');
  return out;
}

// Parse top-level fenced code blocks cleanly
function parseCodeBlocks(rawText) {
  const normalized = normalizeMalformedMarkdown(rawText);
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(normalized)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: normalized.slice(lastIndex, match.index) });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'code',
      content: match[2].trim()
    });
    lastIndex = codeBlockRegex.lastIndex;
  }
  if (lastIndex < normalized.length) {
    parts.push({ type: 'text', content: normalized.slice(lastIndex) });
  }
  return parts.length > 0 ? parts : [{ type: 'text', content: normalized }];
}

function CodeBlockComponent({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <div className="my-2.5 rounded-xl border border-white/15 bg-slate-950/95 overflow-hidden text-left">
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/75 border-b border-white/10 font-mono text-xs text-slate-300">
        <span className="flex items-center gap-1.5 font-semibold text-[#38bdf8] uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Code copied' : 'Copy code snippet'}
          className="flex items-center gap-1 text-xs text-slate-200 hover:text-white transition-colors cursor-pointer px-2 py-1 rounded bg-white/10 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="p-3 overflow-x-auto text-xs font-mono text-slate-100 leading-relaxed project-modal-scroll">
        <pre>{code}</pre>
      </div>
    </div>
  );
}

/**
 * Single-pass recursive inline scanner supporting:
 * - `inline code` (protected from math asterisk mangling or nested bold/link parsing)
 * - [Label](url) with safe protocol checks and readable domain/brand labels
 * - Bare https://... URLs and studio emails (preserving trailing punctuation outside links)
 * - **bold** and *italic* without corrupting arithmetic expressions like 8*8-9*21-827
 */
function renderInlineNodes(text, keyPrefix = 'in') {
  if (!text) return null;
  const nodes = [];
  let i = 0;
  let buffer = '';
  let keyIdx = 0;

  const flushBuffer = () => {
    if (buffer) {
      nodes.push(<React.Fragment key={`${keyPrefix}-t-${keyIdx++}`}>{buffer}</React.Fragment>);
      buffer = '';
    }
  };

  while (i < text.length) {
    // 1. Inline code: `...`
    if (text[i] === '`') {
      const endTick = text.indexOf('`', i + 1);
      if (endTick !== -1 && !text.slice(i + 1, endTick).includes('\n')) {
        flushBuffer();
        const codeContent = text.slice(i + 1, endTick);
        nodes.push(
          <code
            key={`${keyPrefix}-c-${keyIdx++}`}
            className="px-1.5 py-0.5 rounded bg-white/10 border border-white/10 font-mono text-[12px] text-[#7dd3fc] break-all"
          >
            {codeContent}
          </code>
        );
        i = endTick + 1;
        continue;
      }
    }

    // 2. Markdown link: [Label](url)
    if (text[i] === '[') {
      const closeBracket = text.indexOf(']', i + 1);
      if (closeBracket !== -1 && text[closeBracket + 1] === '(') {
        const closeParen = text.indexOf(')', closeBracket + 2);
        if (closeParen !== -1) {
          const rawLabel = text.slice(i + 1, closeBracket);
          const rawHref = text.slice(closeBracket + 2, closeParen);
          const safeHref = sanitizeSafeUrl(rawHref);
          if (safeHref) {
            flushBuffer();
            const isMailto = safeHref.startsWith('mailto:');
            const label = isMailto ? (rawLabel || '').trim() : getReadableUrlLabel(safeHref, rawLabel);
            nodes.push(
              <a
                key={`${keyPrefix}-a-${keyIdx++}`}
                href={safeHref}
                target={isMailto ? undefined : '_blank'}
                rel={isMailto ? undefined : 'noopener noreferrer'}
                className="inline-flex items-center gap-0.5 text-[#38bdf8] hover:text-white font-medium underline underline-offset-2 transition-colors break-words"
              >
                <span>{label}</span>
                {!isMailto && <ArrowUpRight className="w-3 h-3 inline shrink-0" aria-hidden="true" />}
              </a>
            );
            i = closeParen + 1;
            continue;
          }
        }
      }
    }

    // 3. Bare URL: https://... or http://...
    if (text.startsWith('https://', i) || text.startsWith('http://', i)) {
      const prevChar = i > 0 ? text[i - 1] : '';
      if (!prevChar || /[\s([{"':]/.test(prevChar)) {
        const rest = text.slice(i);
        const urlMatch = rest.match(/^https?:\/\/[^\s<>]+/);
        if (urlMatch) {
          let rawUrl = urlMatch[0];
          let trailing = '';
          while (/[.,;:!?\])'"]$/.test(rawUrl)) {
            trailing = rawUrl.slice(-1) + trailing;
            rawUrl = rawUrl.slice(0, -1);
          }
          const safeHref = sanitizeSafeUrl(rawUrl);
          if (safeHref) {
            flushBuffer();
            const label = getReadableUrlLabel(safeHref, rawUrl);
            nodes.push(
              <a
                key={`${keyPrefix}-u-${keyIdx++}`}
                href={safeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-[#38bdf8] hover:text-white font-medium underline underline-offset-2 transition-colors break-words"
              >
                <span>{label}</span>
                <ArrowUpRight className="w-3 h-3 inline shrink-0" aria-hidden="true" />
              </a>
            );
            if (trailing) {
              nodes.push(<React.Fragment key={`${keyPrefix}-tr-${keyIdx++}`}>{trailing}</React.Fragment>);
            }
            i += urlMatch[0].length;
            continue;
          }
        }
      }
    }

    // 4. Bare email address
    const emailSlice = text.slice(i);
    const emailMatch = emailSlice.match(/^([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/);
    if (emailMatch && (i === 0 || /[\s([{"':]/.test(text[i - 1]))) {
      flushBuffer();
      const email = emailMatch[1];
      nodes.push(
        <a
          key={`${keyPrefix}-m-${keyIdx++}`}
          href={`mailto:${email}`}
          className="text-[#38bdf8] hover:text-white font-medium underline underline-offset-2 transition-colors break-words"
        >
          {email}
        </a>
      );
      i += email.length;
      continue;
    }

    // 5. Bold: **...**
    if (text.startsWith('**', i)) {
      const endBold = text.indexOf('**', i + 2);
      if (endBold !== -1 && !text.slice(i + 2, endBold).includes('\n')) {
        const inner = text.slice(i + 2, endBold);
        if (inner.trim().length > 0) {
          flushBuffer();
          nodes.push(
            <strong key={`${keyPrefix}-b-${keyIdx++}`} className="font-semibold text-white">
              {renderInlineNodes(inner, `${keyPrefix}-b${keyIdx}`)}
            </strong>
          );
          i = endBold + 2;
          continue;
        }
      }
    }

    // 6. Italic: *...* (only outside arithmetic digits/operators like 8*8-9*21-827)
    if (text[i] === '*' && text[i + 1] !== '*') {
      const prevChar = i > 0 ? text[i - 1] : '';
      const nextChar = text[i + 1] || '';
      const isMathContext = /\d/.test(prevChar) || /\d/.test(nextChar) || /\s/.test(nextChar);
      if (!isMathContext && (!prevChar || /[\s([{"']/.test(prevChar))) {
        const endStar = text.indexOf('*', i + 1);
        if (
          endStar !== -1 &&
          text[endStar - 1] !== ' ' &&
          !/\d/.test(text[endStar - 1]) &&
          !text.slice(i + 1, endStar).includes('\n')
        ) {
          const inner = text.slice(i + 1, endStar);
          flushBuffer();
          nodes.push(
            <em key={`${keyPrefix}-em-${keyIdx++}`} className="italic text-slate-200">
              {renderInlineNodes(inner, `${keyPrefix}-e${keyIdx}`)}
            </em>
          );
          i = endStar + 1;
          continue;
        }
      }
    }

    buffer += text[i];
    i++;
  }

  flushBuffer();
  return nodes;
}

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

    // Markdown Table
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      const rows = tableLines
        .filter((r) => !/^\|[\s:|-]+\|$/.test(r))
        .map((r) => r.slice(1, -1).split('|').map((cell) => cell.trim()));

      if (rows.length > 0) {
        const [headerRow, ...bodyRows] = rows;
        elements.push(
          <div key={`tbl-${i}`} className="my-2 overflow-x-auto rounded-xl border border-white/15 bg-black/50">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/15 bg-white/[0.04]">
                  {headerRow.map((cell, cIdx) => (
                    <th key={cIdx} className="px-2.5 py-2 font-mono font-semibold text-[#38bdf8] whitespace-nowrap">
                      {renderInlineNodes(cell, `th-${i}-${cIdx}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-2.5 py-2 text-slate-200 align-top">
                        {renderInlineNodes(cell, `td-${i}-${rIdx}-${cIdx}`)}
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

    // Heading (#, ##, ###)
    if (trimmed.startsWith('#')) {
      const headerText = trimmed.replace(/^#+\s*/, '').replace(/[*_`]/g, '');
      elements.push(
        <h3
          key={`h-${i}`}
          className="text-sm font-bold text-white tracking-tight font-sans border-l-2 border-[#38bdf8] pl-2.5 mt-2 mb-1"
        >
          {headerText}
        </h3>
      );
      i++;
      continue;
    }

    // Ordered list item
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      elements.push(
        <div key={`ol-${i}`} className="flex items-start gap-2 my-1 pl-0.5">
          <span className="text-[#38bdf8] font-mono font-semibold text-xs mt-0.5 shrink-0">
            {numMatch[1]}.
          </span>
          <div className="flex-1 min-w-0 break-words">
            {renderInlineNodes(numMatch[2], `ol-${i}`)}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // Bullet list item
    if (/^(•|\*(?!\*)|-)\s+/.test(trimmed)) {
      const bulletContent = trimmed.replace(/^(•|\*|-)\s+/, '');
      elements.push(
        <div key={`li-${i}`} className="flex items-start gap-2 my-1 pl-0.5">
          <span className="text-[#38bdf8] mt-1 text-xs shrink-0" aria-hidden="true">
            ▪
          </span>
          <div className="flex-1 min-w-0 break-words">
            {renderInlineNodes(bulletContent, `li-${i}`)}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('>')) {
      const quoteContent = trimmed.replace(/^>\s*/, '');
      elements.push(
        <blockquote
          key={`q-${i}`}
          className="my-1.5 pl-3 border-l-2 border-white/25 text-slate-300 italic text-xs sm:text-[13px]"
        >
          {renderInlineNodes(quoteContent, `q-${i}`)}
        </blockquote>
      );
      i++;
      continue;
    }

    // Paragraph
    elements.push(
      <p key={`p-${i}`} className="my-1 break-words">
        {renderInlineNodes(trimmed, `p-${i}`)}
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

/**
 * Computes concise in-app studio navigation hints ONLY when helpful,
 * avoiding duplicate profile/project/stack dumps.
 */
function getContextualAppActions(text, onNavigate) {
  if (!onNavigate || !text) return [];
  const lower = text.toLowerCase();
  if (
    lower.includes("don't have verified information") ||
    lower.includes('offline studio fallback mode') ||
    lower.includes('బయటి విషయాలను') ||
    lower.includes('external topics search')
  ) {
    return [];
  }
  const actions = [];

  if (/\b(smart project brief|inquire|start a project|project ela start|ప్రారంభించాలి|start_project)\b/i.test(lower)) {
    actions.push({
      label: 'Open Smart Project Brief',
      icon: Sparkles,
      onClick: () => onNavigate('inquire', 'project-brief')
    });
  }
  if (/\b(resolvit|prometheus|benchai|event hub|aquasentinel|product showcase)\b/i.test(lower)) {
    actions.push({
      label: 'Explore Projects Showcase',
      icon: FolderGit2,
      onClick: () => onNavigate('projects', 'product-showcase')
    });
  }
  if (/\b(research lab|offline rag|guardrail|technical exploration)\b/i.test(lower)) {
    actions.push({
      label: 'Open SAKRA Research Lab',
      icon: FlaskConical,
      onClick: () => onNavigate('research')
    });
  }
  if (/\b(architecture explorer|capabilit|services|solution explorer|సేవలు)\b/i.test(lower) && actions.length < 2) {
    actions.push({
      label: 'Explore AI Solution Explorer',
      icon: Compass,
      onClick: () => onNavigate('capabilities', 'solution-explorer')
    });
  }

  return actions.slice(0, 2);
}

export default function AiResponseRenderer({ text, meta = null, onNavigate = null, showActions = true }) {
  if (!text) return null;
  const contentBlocks = parseCodeBlocks(text);
  const contextualActions = showActions ? getContextualAppActions(text, onNavigate) : [];

  return (
    <div className="ai-response-rendered space-y-2.5 font-sans text-left">
      {/* Compact Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10 text-[11px] font-mono text-slate-300 tracking-wider">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" aria-hidden="true" />
          <span className="font-semibold text-white">SAKRA-BOT</span>
          <span className="text-[#38bdf8]">V2.1</span>
        </div>
        {meta?.source === 'groq' && meta?.model && (
          <span className="text-[10px] text-slate-400">Groq · {meta.model}</span>
        )}
        {meta?.source === 'fallback' && (
          <span className="text-[10px] text-amber-300/90">Offline Studio Fallback</span>
        )}
      </div>

      {/* Rendered Markdown Blocks */}
      {contentBlocks.map((block, idx) =>
        block.type === 'code' ? (
          <CodeBlockComponent key={idx} code={block.content} language={block.language} />
        ) : (
          <MarkdownTextBlock key={idx} content={block.content} />
        )
      )}

      {/* Optional Compact App Navigation Shortcuts (Non-duplicating) */}
      {contextualActions.length > 0 && (
        <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2">
          {contextualActions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.label}
                type="button"
                onClick={act.onClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-xl bg-white/[0.06] hover:bg-[#0071e3]/25 border border-white/15 hover:border-[#38bdf8]/45 text-xs font-medium text-slate-100 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
              >
                <Icon className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" aria-hidden="true" />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
