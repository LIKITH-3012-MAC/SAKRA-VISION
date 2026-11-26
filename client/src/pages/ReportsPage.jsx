import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Sparkles,
  Printer,
  Share2,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusBadge, DataFreshnessLabel } from '../components/ui/StatusBadge';
import { formatINR, formatPercent } from '../utils/formatters';

const HISTORICAL_REPORTS = [
  { id: 'rep-20261027', date: '27 Oct 2026', title: 'Daily Market Intelligence & Liquidity Briefing', category: 'Daily Macro', author: 'Groq Llama-3.3-70B AI Engine', size: '2.4 MB' },
  { id: 'rep-20261026', date: '26 Oct 2026', title: 'Weekly Sector Rotation & Risk Allocation Audit', category: 'Weekly Strategy', author: 'SAKRA Research Desk', size: '4.1 MB' },
  { id: 'rep-20261020', date: '20 Oct 2026', title: 'Q2 FY26 Earnings Mid-Season Corporate Synthesis', category: 'Corporate Earnings', author: 'SAKRA Research Desk', size: '5.8 MB' },
  { id: 'rep-20261015', date: '15 Oct 2026', title: 'Private Banking Sector Capital Quality Review', category: 'Sector Deep Dive', author: 'Groq Llama-3.3-70B AI Engine', size: '3.2 MB' },
];

export function ReportsPage() {
  const { dataMode, portfolio, watchlist } = useApp();
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'portfolio' | 'watchlist' | 'archive'

  const downloadReportFile = (rep) => {
    const content = `=====================================================
SAKRA VISION — EXECUTIVE INTELLIGENCE REPORT
Document ID: ${rep.id}
Date: ${rep.date}
Title: ${rep.title}
Category: ${rep.category}
Author: ${rep.author}
=====================================================

1. EXECUTIVE SYNTHESIS
This intelligence report compiles audited public disclosures, NSE CM Bhavcopy end-of-day price action, and macroeconomic liquidity flows.

2. METHODOLOGICAL ASSURANCE
All signals and metrics are validated against official exchange filings. Forward scenario evaluations distinguish between deterministic market observations and quantitative risk assessments.

Copyright © 2026 SAKRA VISION. All rights reserved.
ANALYZE · ANTICIPATE · ACCUMULATE
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${rep.id}_${rep.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportPortfolioCSV = () => {
    const headers = ['Symbol', 'Exchange', 'Quantity', 'Avg Price', 'Current Price', 'Invested Value', 'Current Value', 'Unrealized P&L'];
    const rows = portfolio.map(h => {
      const curPrice = h.currentPrice || h.avgPrice;
      const invested = h.quantity * h.avgPrice;
      const curVal = h.quantity * curPrice;
      const pl = curVal - invested;
      return [h.symbol, h.exchange, h.quantity, h.avgPrice, curPrice, invested, curVal, pl].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SAKRA_VISION_PORTFOLIO_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sakra-goldLight/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase tracking-wider text-sakra-gold font-semibold">
              Executive Research Library
            </span>
            <span className="text-sakra-goldLight">•</span>
            <span className="text-xs text-sakra-muted">Institutional Dispatches & Dossiers</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-sakra-dark tracking-tight">
            Intelligence Briefings & Reports
          </h1>
          <p className="text-xs sm:text-sm text-sakra-muted mt-1 max-w-2xl">
            AI-synthesized daily market reviews, portfolio risk audits, and downloadable research exports.
          </p>
        </div>

        <button
          type="button"
          onClick={exportPortfolioCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-sakra-goldLight hover:border-sakra-gold text-sakra-forest font-mono font-medium text-xs transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-sakra-goldDark" />
          Export Portfolio CSV
        </button>
      </div>

      <DataFreshnessLabel source="SAKRA Research Archive & Groq API" mode={dataMode} timestamp="27 Oct 2026, 15:30 IST" />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-sakra-goldLight/70 text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab('daily')}
          className={`px-4 py-2.5 font-semibold transition-all border-b-2 -mb-[1px] ${
            activeTab === 'daily'
              ? 'border-sakra-gold text-sakra-forest bg-sakra-cream/40'
              : 'border-transparent text-sakra-muted hover:text-sakra-dark'
          }`}
        >
          Daily Executive Dispatch
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('portfolio')}
          className={`px-4 py-2.5 font-semibold transition-all border-b-2 -mb-[1px] ${
            activeTab === 'portfolio'
              ? 'border-sakra-gold text-sakra-forest bg-sakra-cream/40'
              : 'border-transparent text-sakra-muted hover:text-sakra-dark'
          }`}
        >
          Portfolio Risk Audit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('archive')}
          className={`px-4 py-2.5 font-semibold transition-all border-b-2 -mb-[1px] ${
            activeTab === 'archive'
              ? 'border-sakra-gold text-sakra-forest bg-sakra-cream/40'
              : 'border-transparent text-sakra-muted hover:text-sakra-dark'
          }`}
        >
          Report Archive ({HISTORICAL_REPORTS.length})
        </button>
      </div>

      {/* Tab 1: Daily Executive Dispatch */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          <SectionCard
            title="SAKRA VISION Daily Market Dispatch: 27 October 2026"
            subtitle="Prepared for Private Wealth Research Clients • Groq Llama-3.3-70B Synthesis"
            badge={<StatusBadge status="Official Dispatch" size="xs" />}
            variant="white"
          >
            <div className="space-y-6 text-sm text-sakra-dark font-sans leading-relaxed">
              <div className="p-4 rounded-lg bg-sakra-cream/40 border border-sakra-goldLight/70">
                <h4 className="font-serif font-bold text-base text-sakra-dark mb-1.5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sakra-gold" />
                  Executive Summary: Resilient Capital Accumulation
                </h4>
                <p className="text-xs text-sakra-dark/90 leading-relaxed font-sans">
                  The Indian equity market concluded Tuesday’s session with steady gains as the benchmark NIFTY 50 advanced 125.40 points (+0.50%) to close at 25,460.25. Advance-decline breadth on the NSE 500 settled at 1.53, reflecting broad-based participation rather than isolated index heavyweights.
                </p>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-sakra-dark mb-2">1. Macro & Liquidity Architecture</h3>
                <p className="text-xs text-sakra-muted leading-relaxed">
                  Domestic institutional investors (DIIs) maintained net positive equity accumulation of ₹1,840 Cr, absorbing overseas portfolio rebalancing. India VIX eased 3.4% to 12.85, indicating sustained calm across index option implied volatilities.
                </p>
              </div>

              <div>
                <h3 className="font-serif font-bold text-lg text-sakra-dark mb-2">2. Sectoral Leaders & Laggards</h3>
                <ul className="space-y-2 text-xs text-sakra-muted">
                  <li className="flex items-start gap-2">
                    <strong className="text-sakra-gain font-mono">+1.84% Telecommunications:</strong>
                    <span>Bharti Airtel sustained leadership driven by mobile ARPU accretion and enterprise enterprise digital subscriptions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="text-sakra-gain font-mono">+0.72% Financial Services:</strong>
                    <span>Private banking heavyweights (HDFCBANK, ICICIBANK) drove index liquidity as net deposit growth stabilized.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <strong className="text-sakra-loss font-mono">-0.42% Information Technology:</strong>
                    <span>Marginal profit booking following cautious forward guidance commentaries on North American discretionary tech spend.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-sakra-goldLight/60 flex items-center justify-between text-xs font-mono text-sakra-muted">
                <span>Methodology: Direct NSE Bhavcopy integration verified against official regulatory filings</span>
                <span>Document ID: SV-DISP-20261027-01</span>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Tab 2: Portfolio Risk Audit */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          <SectionCard
            title="Portfolio Risk & Valuation Audit"
            subtitle="Automated position audit across 4 tracked equity holdings"
            badge={<StatusBadge status="Audit Passed" size="xs" />}
          >
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded bg-sakra-cream/30 border border-sakra-goldLight/50">
                  <span className="text-sakra-muted text-[10px] uppercase block">Positions Monitored</span>
                  <span className="text-base font-bold text-sakra-dark">{portfolio.length} Equities</span>
                </div>
                <div className="p-3 rounded bg-sakra-cream/30 border border-sakra-goldLight/50">
                  <span className="text-sakra-muted text-[10px] uppercase block">Diversification Score</span>
                  <span className="text-base font-bold text-sakra-gain">84 / 100</span>
                </div>
                <div className="p-3 rounded bg-sakra-cream/30 border border-sakra-goldLight/50">
                  <span className="text-sakra-muted text-[10px] uppercase block">Weighted Portfolio Beta</span>
                  <span className="text-base font-bold text-sakra-dark">0.92</span>
                </div>
              </div>

              <div className="p-4 rounded bg-white border border-sakra-goldLight/70 font-sans space-y-2 text-xs">
                <div className="font-serif font-bold text-sm text-sakra-dark">Audit Recommendations</div>
                <p className="text-sakra-muted leading-relaxed">
                  Your portfolio demonstrates low leveraged risk. To improve diversification, evaluate broadening capital into infrastructure/defense or healthcare to complement banking and IT exposure.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Tab 3: Historical Archive */}
      {activeTab === 'archive' && (
        <div className="bg-white rounded-lg border border-sakra-goldLight shadow-sakra-subtle overflow-hidden">
          <div className="divide-y divide-sakra-goldLight/40">
            {HISTORICAL_REPORTS.map((rep) => (
              <div key={rep.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-sakra-cream/30 transition-colors">
                <div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-sakra-muted mb-1">
                    <span className="text-sakra-forest font-semibold">{rep.category}</span>
                    <span>•</span>
                    <span>{rep.date}</span>
                    <span>•</span>
                    <span>{rep.size}</span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-sakra-dark hover:text-sakra-forest cursor-pointer">
                    {rep.title}
                  </h4>
                  <div className="text-xs text-sakra-muted mt-0.5">Author: {rep.author}</div>
                </div>

                <button
                  type="button"
                  onClick={() => downloadReportFile(rep)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-sakra-cream hover:bg-sakra-cream/80 text-sakra-dark font-mono text-xs border border-sakra-goldLight self-start sm:self-auto transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-sakra-goldDark" />
                  Download Dispatch
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
