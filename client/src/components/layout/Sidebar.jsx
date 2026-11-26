import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  LineChart,
  SlidersHorizontal,
  BookmarkCheck,
  Newspaper,
  Briefcase,
  Sparkles,
  FileText,
  Settings,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Market Overview', path: '/market', icon: LineChart },
  { name: 'Stock Screener', path: '/screener', icon: SlidersHorizontal },
  { name: 'Watchlist', path: '/watchlist', icon: BookmarkCheck },
  { name: 'Research & News', path: '/research', icon: Newspaper },
  { name: 'Portfolio', path: '/portfolio', icon: Briefcase },
  { name: 'Prediction Lab', path: '/predictions', icon: Sparkles, badge: 'Alpha' },
  { name: 'Reports', path: '/reports', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export function Sidebar({ mobileOpen, setMobileOpen }) {
  const { dataMode, serverHealth } = useApp();

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-sakra-deep/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-sakra-deep text-sakra-ivory border-r border-sakra-forest flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-sakra-forest/80 flex flex-col items-center text-center">
          <NavLink to="/dashboard" className="group block focus:outline-none" onClick={() => setMobileOpen(false)}>
            <div className="relative mb-2 flex justify-center">
              <img
                src="/brand/sakra-vision-logo.png"
                alt="SAKRA VISION"
                className="h-16 w-auto max-w-[200px] object-contain transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </div>
            <div className="text-[10px] uppercase font-mono tracking-[0.24em] text-sakra-gold opacity-90 mt-1">
              Analyze · Anticipate · Accumulate
            </div>
          </NavLink>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-sakra-goldLight/50">
            Intelligence Suite
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-md text-xs font-medium tracking-wide transition-all duration-150 ${
                    isActive
                      ? 'bg-sakra-forest text-sakra-gold font-semibold shadow-inner border-l-2 border-sakra-gold'
                      : 'text-sakra-ivory/80 hover:bg-sakra-forest/50 hover:text-sakra-ivory'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 opacity-80" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sakra-gold/20 text-sakra-gold border border-sakra-gold/40 uppercase">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Platform Status Card */}
        <div className="p-4 border-t border-sakra-forest/80 bg-sakra-deep/95">
          <div className="rounded-lg bg-sakra-forest/60 p-3 border border-sakra-forest text-[11px] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sakra-goldLight/70 flex items-center gap-1.5 font-medium">
                <span className={`w-2 h-2 rounded-full ${dataMode === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {dataMode === 'CONNECTED' ? 'Live Terminal' : 'Historical Mode'}
              </span>
              <span className="font-mono text-[10px] text-sakra-gold">NSE/BSE</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-sakra-forest/80 text-[10px] text-sakra-goldLight/60 font-mono">
              <span>Groq Intelligence</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
