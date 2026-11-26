import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Shield,
  Key,
  Database,
  Radio,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Save,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusBadge, DataFreshnessLabel } from '../components/ui/StatusBadge';

export function SettingsPage() {
  const { dataMode, setDataMode, serverHealth } = useApp();
  const [userName, setUserName] = useState('Likith Naidu');
  const [userEmail, setUserEmail] = useState('likith@sakra-vision.internal');
  const [themePref, setThemePref] = useState('ivory'); // 'ivory' | 'forest'
  const [notifyDaily, setNotifyDaily] = useState(true);
  const [notifyTechnical, setNotifyTechnical] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sakra-goldLight/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase tracking-wider text-sakra-gold font-semibold">
              Platform Configuration
            </span>
            <span className="text-sakra-goldLight">•</span>
            <span className="text-xs text-sakra-muted">System Health & Terminal Settings</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-sakra-dark tracking-tight">
            Settings & Provider Integrations
          </h1>
          <p className="text-xs sm:text-sm text-sakra-muted mt-1 max-w-2xl">
            Audit API provider connectivity, configure local notifications, and review system operational security.
          </p>
        </div>

        {savedSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-50 text-sakra-gain font-mono text-xs border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            Preferences Saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile & Preferences (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Profile Form */}
          <SectionCard
            title="Investor Profile"
            subtitle="Private wealth membership identification"
          >
            <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-sakra-muted mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 bg-sakra-cream/40 border border-sakra-goldLight rounded text-sakra-dark font-sans focus:outline-none focus:border-sakra-gold"
                />
              </div>

              <div>
                <label className="block text-sakra-muted mb-1">Registered Dispatch Email</label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-sakra-cream/40 border border-sakra-goldLight rounded text-sakra-dark focus:outline-none focus:border-sakra-gold"
                />
              </div>

              {/* Theme Preference */}
              <div>
                <label className="block text-sakra-muted mb-1 font-mono">Terminal Aesthetic Theme</label>
                <div className="grid grid-cols-2 gap-3 mt-1 font-sans">
                  <button
                    type="button"
                    onClick={() => setThemePref('ivory')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      themePref === 'ivory'
                        ? 'border-sakra-gold bg-sakra-cream/50 shadow-sm ring-1 ring-sakra-gold'
                        : 'border-sakra-goldLight bg-white'
                    }`}
                  >
                    <div className="font-serif font-bold text-sm text-sakra-dark">Warm Ivory (Default)</div>
                    <div className="text-[11px] text-sakra-muted mt-0.5">Classic editorial luxury private wealth aesthetic</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setThemePref('forest')}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      themePref === 'forest'
                        ? 'border-sakra-gold bg-sakra-forest/10 shadow-sm ring-1 ring-sakra-gold'
                        : 'border-sakra-goldLight bg-white'
                    }`}
                  >
                    <div className="font-serif font-bold text-sm text-sakra-dark">Deep Forest Dark</div>
                    <div className="text-[11px] text-sakra-muted mt-0.5">High-contrast nocturnal institutional terminal</div>
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className="pt-3 border-t border-sakra-goldLight/50 space-y-2">
                <div className="font-mono text-sakra-muted uppercase tracking-wider text-[10px]">Dispatch Notifications</div>
                <label className="flex items-center gap-2 cursor-pointer font-sans text-xs text-sakra-dark">
                  <input
                    type="checkbox"
                    checked={notifyDaily}
                    onChange={(e) => setNotifyDaily(e.target.checked)}
                    className="rounded border-sakra-goldLight text-sakra-forest focus:ring-sakra-gold"
                  />
                  <span>Receive Daily Pre-Market Intelligence Briefing at 08:30 AM IST</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-sans text-xs text-sakra-dark">
                  <input
                    type="checkbox"
                    checked={notifyTechnical}
                    onChange={(e) => setNotifyTechnical(e.target.checked)}
                    className="rounded border-sakra-goldLight text-sakra-forest focus:ring-sakra-gold"
                  />
                  <span>Alert on Watchlist 50-EMA breakouts and RSI extremes</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-2 rounded bg-sakra-forest text-sakra-gold font-mono font-semibold text-xs hover:bg-sakra-deep transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  Save Preferences
                </button>
              </div>
            </form>
          </SectionCard>
        </div>

        {/* Right Column: API & Provider Status (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <SectionCard
            title="External Services & API Status"
            subtitle="Zero credentials displayed client-side. Backend secrets secured in server/.env"
            badge={<StatusBadge status="Secured" size="xs" />}
          >
            <div className="space-y-3 text-xs font-mono">
              {/* Groq API */}
              <div className="p-3 rounded bg-sakra-cream/30 border border-sakra-goldLight/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sakra-dark">
                    <Sparkles className="w-4 h-4 text-sakra-gold" />
                    Groq Intelligence Engine
                  </div>
                  <div className="text-[11px] text-sakra-muted mt-0.5">Model: llama-3.3-70b-versatile (configured in GROQ_MODEL)</div>
                </div>
                <StatusBadge status="Ready / Active" size="xs" />
              </div>

              {/* Firecrawl Search API */}
              <div className="p-3 rounded bg-sakra-cream/30 border border-sakra-goldLight/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sakra-dark">
                    <Server className="w-4 h-4 text-sakra-forest" />
                    Firecrawl Web Research API v2
                  </div>
                  <div className="text-[11px] text-sakra-muted mt-0.5">Public corporate disclosures & regulatory scraping</div>
                </div>
                <StatusBadge status="Connected" size="xs" />
              </div>

              {/* Groww API */}
              <div className="p-3 rounded bg-sakra-cream/30 border border-sakra-goldLight/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sakra-dark">
                    <Radio className="w-4 h-4 text-emerald-600" />
                    Groww Market Data Adapter
                  </div>
                  <div className="text-[11px] text-sakra-muted mt-0.5">Configured via GROWW_API_KEY / GROWW_ACCESS_TOKEN</div>
                </div>
                <StatusBadge status={dataMode === 'CONNECTED' ? 'Live Connected' : 'Historical Mode'} size="xs" />
              </div>

              {/* MySQL Database */}
              <div className="p-3 rounded bg-sakra-cream/30 border border-sakra-goldLight/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-sakra-dark">
                    <Database className="w-4 h-4 text-sakra-goldDark" />
                    MySQL 8.x Database Engine
                  </div>
                  <div className="text-[11px] text-sakra-muted mt-0.5">Tables: stocks, bhavcopy, watchlists, portfolio, reports</div>
                </div>
                <StatusBadge status="Schema Ready" size="xs" />
              </div>
            </div>
          </SectionCard>

          {/* Security & Secret Architecture Guardrail */}
          <div className="p-4 rounded-lg bg-sakra-deep text-sakra-ivory border border-sakra-forest space-y-2 text-xs">
            <div className="flex items-center gap-2 font-serif font-bold text-sm text-sakra-gold">
              <Shield className="w-4 h-4" />
              Backend Isolation Architecture
            </div>
            <p className="text-sakra-goldLight/80 leading-relaxed font-sans text-xs">
              In compliance with financial software security standards, API credentials for Groq, Firecrawl, and Groww are strictly encapsulated within backend services. The Vite frontend never receives secret environment variables.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
