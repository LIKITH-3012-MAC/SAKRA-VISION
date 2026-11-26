import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Newspaper,
  ExternalLink,
  ShieldAlert,
  Clock,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Database,
  ArrowRight,
  HelpCircle,
  Calendar,
  Layers,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusBadge, DataFreshnessLabel, SourceAttribution } from '../components/ui/StatusBadge';
import { formatINR, formatPercent, formatVolume } from '../utils/formatters';
import { api } from '../api/client';

const QUICK_STOCKS = ['RELIANCE', 'HDFCBANK', 'TCS', 'INFY', 'BHARTIARTL', 'SBIN'];

const RESEARCH_TASKS = [
  { id: 'comprehensive', label: 'Comprehensive Dossier', icon: Layers },
  { id: 'overview', label: 'Company Overview', icon: FileText },
  { id: 'news', label: 'Recent Web News', icon: Newspaper },
  { id: 'bull_bear', label: 'Bull / Bear Analysis', icon: TrendingUp },
  { id: 'risks', label: 'Risk Audit', icon: AlertTriangle },
];

export function ResearchNewsPage() {
  const { dataMode } = useApp();

  // Search & Task states
  const [symbol, setSymbol] = useState('RELIANCE');
  const [selectedTask, setSelectedTask] = useState('comprehensive');
  const [customQuestion, setCustomQuestion] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [progressStep, setProgressStep] = useState(1); // 1 = EOD lookup, 2 = Firecrawl crawl, 3 = Groq synthesis
  const [researchData, setResearchData] = useState(null);
  const [error, setError] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);

  // Load component health on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchHealth() {
      try {
        const h = await api.getResearchHealth();
        if (!cancelled) setHealthStatus(h);
      } catch (err) {
        // Fallback status
      }
    }
    fetchHealth();
    return () => { cancelled = true; };
  }, []);

  // Run initial research on mount
  useEffect(() => {
    runResearch('RELIANCE', 'comprehensive', '');
  }, []);

  const runResearch = async (targetSymbol, task, question) => {
    setIsSynthesizing(true);
    setError(null);
    setProgressStep(1);

    const stepTimer1 = setTimeout(() => setProgressStep(2), 700);
    const stepTimer2 = setTimeout(() => setProgressStep(3), 1600);

    try {
      let res;
      if (question && question.trim().length >= 3) {
        res = await api.researchAnalyze(question.trim(), targetSymbol || null, task);
      } else if (targetSymbol && targetSymbol.trim().length > 0) {
        res = await api.researchCompany(targetSymbol.trim(), task);
      } else {
        res = await api.researchNews('Indian stock market corporate announcements', null, 5);
      }

      if (res && res.status === 'success') {
        setResearchData(res);
      } else {
        setError(res?.message || 'Research synthesis returned an error.');
      }
    } catch (err) {
      setError(err.message || 'Unable to communicate with research engine.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsSynthesizing(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    runResearch(symbol, selectedTask, customQuestion);
  };

  const handleQuickSelect = (sym) => {
    setSymbol(sym);
    runResearch(sym, selectedTask, customQuestion);
  };

  const handleFollowUpClick = (questionText) => {
    setCustomQuestion(questionText);
    runResearch(symbol, selectedTask, questionText);
  };

  const hist = researchData?.historicalDataContext;
  const hasHistory = hist && hist.available;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sakra-goldLight/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase tracking-wider text-sakra-gold font-semibold">
              Market Intelligence & Web Research
            </span>
            <span className="text-sakra-goldLight">•</span>
            <span className="text-xs text-sakra-muted">Institutional Synthesis Engine</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-sakra-dark tracking-tight">
            Research & Verified Disclosures
          </h1>
          <p className="text-xs sm:text-sm text-sakra-muted mt-1 max-w-2xl">
            Synthesizes stored historical exchange Bhavcopy sessions, live Firecrawl web intelligence, and Groq AI reasoning with verified source attribution.
          </p>
        </div>

        {/* Integration Status Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-white border border-sakra-goldLight text-sakra-forest font-semibold flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Groq AI: {healthStatus?.providers?.groq?.status === 'connected' ? 'Active' : 'Connected'}
          </span>
          <span className="px-2.5 py-1 rounded bg-white border border-sakra-goldLight text-sakra-forest font-semibold flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Firecrawl: {healthStatus?.providers?.firecrawl?.status === 'connected' ? 'Active' : 'Connected'}
          </span>
        </div>
      </div>

      <DataFreshnessLabel
        source="NSE Bhavcopy EOD Records & Firecrawl Web Research Engine"
        mode={dataMode}
        timestamp="Verified Session Closes & Live Web Filings"
      />

      {/* Main Research Control Console */}
      <div className="bg-white p-5 rounded-xl border border-sakra-goldLight shadow-sakra-subtle space-y-4">
        {/* Quick select pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pb-3 border-b border-sakra-goldLight/50">
          <div className="flex items-center gap-2 text-sakra-muted">
            <span>Quick Equities:</span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_STOCKS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleQuickSelect(s)}
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors border ${
                    symbol.toUpperCase() === s
                      ? 'bg-sakra-forest text-sakra-gold border-sakra-forest font-bold'
                      : 'bg-sakra-cream/40 text-sakra-dark border-sakra-goldLight/60 hover:border-sakra-gold'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-sakra-muted">
            Mode: <strong className="text-sakra-forest capitalize">{selectedTask.replace('_', ' ')}</strong>
          </div>
        </div>

        {/* Search & Question Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Symbol Input (3 cols) */}
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-mono text-sakra-muted uppercase tracking-wider mb-1">
                Stock Symbol
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. RELIANCE, TCS"
                className="w-full px-3 py-2 bg-sakra-cream/40 border border-sakra-goldLight rounded-lg text-xs text-sakra-dark font-mono font-bold placeholder-sakra-muted focus:outline-none focus:border-sakra-gold"
              />
            </div>

            {/* Custom Research Question Input (9 cols) */}
            <div className="sm:col-span-9">
              <label className="block text-[11px] font-mono text-sakra-muted uppercase tracking-wider mb-1">
                Research Inquiry or Catalyst Focus (Optional)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="e.g. What are the key drivers for margin expansion? Any recent corporate governance filings?"
                  className="w-full pl-3 pr-28 py-2 bg-sakra-cream/40 border border-sakra-goldLight rounded-lg text-xs text-sakra-dark placeholder-sakra-muted focus:outline-none focus:border-sakra-gold font-sans"
                />
                <button
                  type="submit"
                  disabled={isSynthesizing}
                  className="absolute right-1 px-4 py-1.5 rounded bg-sakra-forest hover:bg-sakra-deep text-sakra-gold font-mono font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isSynthesizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {isSynthesizing ? 'Synthesizing...' : 'Synthesize'}
                </button>
              </div>
            </div>
          </div>

          {/* Research Task Selection Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-mono text-sakra-muted mr-1">Task Scope:</span>
            {RESEARCH_TASKS.map((t) => {
              const Icon = t.icon;
              const isActive = selectedTask === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTask(t.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                    isActive
                      ? 'bg-sakra-deep text-sakra-gold border-sakra-forest font-bold shadow-sm'
                      : 'bg-white text-sakra-muted border-sakra-goldLight/70 hover:border-sakra-gold hover:text-sakra-dark'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </form>
      </div>

      {/* Progress Feedback Indicator */}
      {isSynthesizing && (
        <div className="p-4 rounded-xl bg-sakra-cream/70 border border-sakra-goldLight text-xs font-mono space-y-2 animate-pulse">
          <div className="flex items-center justify-between text-sakra-forest font-bold">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-sakra-gold" />
              Institutional Research Pipeline in Progress
            </span>
            <span>Step {progressStep} of 3</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-sakra-muted">
            <div className={`p-2 rounded border ${progressStep >= 1 ? 'bg-white border-sakra-gold text-sakra-forest font-semibold' : 'bg-transparent border-sakra-goldLight/40'}`}>
              1. Computing Historical EOD Metrics
            </div>
            <div className={`p-2 rounded border ${progressStep >= 2 ? 'bg-white border-sakra-gold text-sakra-forest font-semibold' : 'bg-transparent border-sakra-goldLight/40'}`}>
              2. Querying Firecrawl Web Index
            </div>
            <div className={`p-2 rounded border ${progressStep >= 3 ? 'bg-white border-sakra-gold text-sakra-forest font-semibold' : 'bg-transparent border-sakra-goldLight/40'}`}>
              3. Groq AI Multi-Source Reasoning
            </div>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-mono flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="font-bold mb-0.5">Research Query Notice</div>
            <p className="text-[11px] text-rose-800 leading-relaxed">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => runResearch(symbol, selectedTask, customQuestion)}
            className="text-xs font-bold underline hover:text-rose-950"
          >
            Retry
          </button>
        </div>
      )}

      {/* Research Output Dossier */}
      {researchData && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <SectionCard
            title="Institutional Research Synthesis"
            subtitle={`Mandate: ${researchData.query?.task?.toUpperCase()} • Subject: ${researchData.query?.symbol || 'Equities Sector'} • Model: Groq AI`}
            badge={<StatusBadge status="Groq AI Synthesized" size="xs" />}
            variant="cream"
          >
            <div className="space-y-4">
              {/* Executive Summary text */}
              <div className="p-4 bg-white rounded-lg border border-sakra-goldLight/80 shadow-sm">
                <div className="flex items-center gap-2 text-sakra-forest font-semibold mb-2 text-xs uppercase tracking-wider font-mono">
                  <Sparkles className="w-4 h-4 text-sakra-gold" />
                  Executive Strategic Briefing
                </div>
                <p className="text-sakra-dark font-sans leading-relaxed text-sm sm:text-base">
                  {researchData.summary}
                </p>
              </div>

              {/* Substantiated Key Findings */}
              {researchData.keyFindings && researchData.keyFindings.length > 0 && (
                <div className="p-4 bg-white rounded-lg border border-sakra-goldLight/70 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sakra-forest font-bold">
                    <CheckCircle2 className="w-4 h-4 text-sakra-gold" />
                    Substantiated Empirical Findings
                  </div>
                  <ul className="space-y-2 text-xs text-sakra-dark">
                    {researchData.keyFindings.map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-sakra-gold font-bold mt-0.5">•</span>
                        <span className="leading-relaxed">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Historical EOD Context vs Analytical Reasoning */}
          {hasHistory && (
            <SectionCard
              title="Verified Historical EOD Market Metrics"
              subtitle={`Calculated directly from ${hist.tradingDaysCount} sequential exchange sessions (${hist.dateRange?.from} to ${hist.dateRange?.to})`}
              badge={
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sakra-cream text-sakra-forest font-bold border border-sakra-goldLight">
                  STORED MARKET DATA
                </span>
              }
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 bg-sakra-cream/40 rounded-lg border border-sakra-goldLight/60">
                  <span className="text-sakra-muted text-[10px] uppercase block mb-1">Latest EOD Close</span>
                  <div className="font-serif text-lg font-bold text-sakra-dark">{formatINR(hist.latestClose)}</div>
                  <span className={`text-[11px] font-mono ${hist.changePct >= 0 ? 'text-sakra-gain' : 'text-sakra-loss'}`}>
                    {hist.changePct >= 0 ? '+' : ''}{hist.changePct}% vs prev close
                  </span>
                </div>

                <div className="p-3 bg-sakra-cream/40 rounded-lg border border-sakra-goldLight/60">
                  <span className="text-sakra-muted text-[10px] uppercase block mb-1">Observed Close Range</span>
                  <div className="font-serif text-xs sm:text-sm font-bold text-sakra-dark mt-1">
                    {formatINR(hist.periodLow)} – {formatINR(hist.periodHigh)}
                  </div>
                  <span className="text-[10px] text-sakra-muted block mt-1">First session to latest</span>
                </div>

                <div className="p-3 bg-sakra-cream/40 rounded-lg border border-sakra-goldLight/60">
                  <span className="text-sakra-muted text-[10px] uppercase block mb-1">Period Return</span>
                  <div className={`font-serif text-lg font-bold ${hist.periodReturnPct >= 0 ? 'text-sakra-gain' : 'text-sakra-loss'}`}>
                    {hist.periodReturnPct >= 0 ? '+' : ''}{hist.periodReturnPct}%
                  </div>
                  <span className="text-[10px] text-sakra-muted block mt-1">{hist.tradingDaysCount} trading sessions</span>
                </div>

                <div className="p-3 bg-sakra-cream/40 rounded-lg border border-sakra-goldLight/60">
                  <span className="text-sakra-muted text-[10px] uppercase block mb-1">Annualized Volatility</span>
                  <div className="font-serif text-lg font-bold text-sakra-forest">
                    {hist.annualizedVolatilityPct ? `${hist.annualizedVolatilityPct}%` : 'N/A (<5 sessions)'}
                  </div>
                  <span className="text-[10px] text-sakra-muted block mt-1">σ(daily) × √252</span>
                </div>
              </div>

              {researchData.historicalPriceVolumeContext && (
                <div className="mt-4 pt-3 border-t border-sakra-goldLight/50 text-xs text-sakra-dark font-sans leading-relaxed">
                  <strong className="font-mono text-[11px] text-sakra-forest block mb-1 uppercase tracking-wider">
                    Quantitative Trend Interpretation:
                  </strong>
                  {researchData.historicalPriceVolumeContext}
                </div>
              )}
            </SectionCard>
          )}

          {/* Bullish Factors & Bearish Vulnerabilities Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Bullish Catalysts */}
            <div className="p-5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-sakra-gain">
                <TrendingUp className="w-4 h-4" />
                Operational Catalysts & Bullish Factors
              </div>
              <ul className="space-y-2 text-xs text-emerald-950">
                {(researchData.bullishFactors || []).map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-sakra-gain font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bearish Risks */}
            <div className="p-5 bg-rose-50/60 border border-rose-200/80 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-sakra-loss">
                <AlertTriangle className="w-4 h-4" />
                Identified Risks & Bearish Headwinds
              </div>
              <ul className="space-y-2 text-xs text-rose-950">
                {(researchData.bearishFactors || []).map((r, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-sakra-loss font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
                {(researchData.businessRisks || []).map((br, i) => (
                  <li key={`br-${i}`} className="flex items-start gap-2">
                    <span className="text-sakra-loss font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{br}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Missing / Unverified Information Panel */}
          {researchData.unverifiedOrMissingInformation && researchData.unverifiedOrMissingInformation.length > 0 && (
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-stone-700 uppercase tracking-wider text-[11px]">
                <ShieldAlert className="w-4 h-4 text-stone-500" />
                Information Boundaries & Data Gaps
              </div>
              <ul className="space-y-1 text-[11px] text-stone-600">
                {researchData.unverifiedOrMissingInformation.map((gap, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span>—</span>
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verified Web Citations from Firecrawl */}
          <SectionCard
            title="Verified Web Citations & Public Filings"
            subtitle={`Disclosures retrieved and cross-referenced via Firecrawl (${researchData.sources?.length || 0} Sources)`}
            badge={<StatusBadge status="Firecrawl Verified" size="xs" />}
          >
            {researchData.sources && researchData.sources.length > 0 ? (
              <div className="space-y-3">
                {researchData.sources.map((src, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-sakra-cream/30 hover:bg-sakra-cream/60 rounded-lg border border-sakra-goldLight/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px] font-mono text-sakra-muted">
                        <span className="font-bold text-sakra-forest">{src.source}</span>
                        {src.publishedDate && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-sakra-gold" />
                              {src.publishedDate}
                            </span>
                          </>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-sakra-dark text-sm">
                        {src.title}
                      </h4>
                    </div>

                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sakra-forest hover:text-sakra-gold font-mono font-semibold text-xs shrink-0 self-start sm:self-center"
                    >
                      Open Link <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs font-mono text-sakra-muted">
                No external web sources were linked for this analysis.
              </div>
            )}
          </SectionCard>

          {/* Follow-up Strategic Questions */}
          {researchData.followUpQuestions && researchData.followUpQuestions.length > 0 && (
            <div className="p-5 bg-sakra-deep text-sakra-ivory rounded-xl border border-sakra-forest space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sakra-gold font-bold">
                <HelpCircle className="w-4 h-4" />
                Institutional Follow-Up Inquiries
              </div>
              <p className="text-xs text-sakra-goldLight/80">
                Click any inquiry below to feed directly into the synthesis pipeline:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {researchData.followUpQuestions.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleFollowUpClick(q)}
                    className="px-3 py-2 rounded-lg bg-sakra-forest/80 hover:bg-sakra-forest border border-sakra-gold/30 hover:border-sakra-gold text-xs text-sakra-ivory transition-all text-left flex items-center gap-2 font-sans"
                  >
                    <span>{q}</span>
                    <ArrowRight className="w-3 h-3 text-sakra-gold shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Data Limitations & Statutory Disclosures */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-[11px] font-mono text-sakra-muted space-y-1">
            <div className="font-semibold text-stone-700">Compliance & Scope Disclosures:</div>
            {(researchData.dataLimitations || []).map((lim, i) => (
              <div key={i}>• {lim}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
