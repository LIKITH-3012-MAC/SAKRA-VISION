import React, { useState, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Clock,
  Radio,
  ChevronDown,
  User,
  CheckCircle2,
  AlertCircle,
  Database,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function Topbar({ setMobileOpen }) {
  const { dataMode, setDataMode, setIsSearchOpen, notifications, setNotifications } = useApp();
  const [timeIST, setTimeIST] = useState('');
  const [marketStatus, setMarketStatus] = useState({ isOpen: false, label: 'Post-Market' });
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Live IST Clock and Market Session Calculation
  useEffect(() => {
    function updateIST() {
      const now = new Date();
      const istString = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setTimeIST(istString);

      // Check Indian Market hours: Mon-Fri 09:15 to 15:30 IST
      // Convert current time to IST components
      const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      const day = istDate.getDay(); // 0 is Sunday, 6 is Saturday
      const hours = istDate.getHours();
      const minutes = istDate.getMinutes();
      const totalMinutes = hours * 60 + minutes;

      const isWeekday = day >= 1 && day <= 5;
      const isOpen = isWeekday && totalMinutes >= (9 * 60 + 15) && totalMinutes <= (15 * 60 + 30);
      const isPreMarket = isWeekday && totalMinutes >= (9 * 60) && totalMinutes < (9 * 60 + 15);

      if (isOpen) {
        setMarketStatus({ isOpen: true, label: 'NSE Open' });
      } else if (isPreMarket) {
        setMarketStatus({ isOpen: false, label: 'Pre-Market' });
      } else {
        setMarketStatus({ isOpen: false, label: 'Post-Market' });
      }
    }

    updateIST();
    const interval = setInterval(updateIST, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-sakra-goldLight/70 px-4 lg:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile hamburger & Search trigger */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-md text-sakra-dark hover:bg-sakra-cream/70 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-sakra-cream/50 hover:bg-sakra-cream/80 border border-sakra-goldLight text-xs text-sakra-muted transition-all duration-150 w-48 sm:w-64 md:w-80 text-left shadow-inner"
        >
          <Search className="w-3.5 h-3.5 text-sakra-goldDark" />
          <span className="flex-1 truncate">Search equities, symbols (e.g. RELIANCE)...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-white text-sakra-muted border border-sakra-goldLight">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: IST Clock, Market Status, Mode Toggle, Notifications & Profile */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* IST Clock & Market Status */}
        <div className="hidden md:flex items-center gap-2.5 px-3 py-1 rounded-md bg-sakra-cream/40 border border-sakra-goldLight/50 text-xs text-sakra-dark">
          <Clock className="w-3.5 h-3.5 text-sakra-goldDark" />
          <span className="font-mono tabular-nums font-medium text-xs">{timeIST || '15:30:00'} IST</span>
          <span className="text-sakra-goldLight">•</span>
          <span className={`inline-flex items-center gap-1 font-medium text-[11px] ${
            marketStatus.isOpen ? 'text-sakra-gain' : 'text-sakra-muted'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${marketStatus.isOpen ? 'bg-sakra-gain animate-pulse' : 'bg-stone-400'}`} />
            {marketStatus.label}
          </span>
        </div>

        {/* Mode Toggle Switch: DEMO vs CONNECTED */}
        <div className="flex items-center bg-sakra-cream/60 p-0.5 rounded-lg border border-sakra-goldLight text-xs font-mono">
          <button
            type="button"
            onClick={() => setDataMode('DEMO')}
            className={`px-2.5 py-1 rounded-md transition-all text-[11px] font-medium ${
              dataMode === 'DEMO'
                ? 'bg-sakra-deep text-sakra-gold shadow-sm font-semibold'
                : 'text-sakra-muted hover:text-sakra-dark'
            }`}
            title="Demonstration / Sample Data Mode"
          >
            DEMO
          </button>
          <button
            type="button"
            onClick={() => setDataMode('CONNECTED')}
            className={`px-2.5 py-1 rounded-md transition-all text-[11px] font-medium flex items-center gap-1 ${
              dataMode === 'CONNECTED'
                ? 'bg-sakra-gain text-white shadow-sm font-semibold'
                : 'text-sakra-muted hover:text-sakra-dark'
            }`}
            title="Real-time connected feed via Groww / NSE API"
          >
            <Radio className="w-2.5 h-2.5" />
            LIVE
          </button>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-sakra-cream/70 text-sakra-dark transition-colors border border-transparent hover:border-sakra-goldLight"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-sakra-forest" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sakra-loss ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-sakra-elevated border border-sakra-goldLight p-3 z-50 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2 border-b border-sakra-goldLight/60 mb-2">
                <span className="font-serif font-semibold text-sm text-sakra-dark">Platform Intelligence Alerts</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                    className="text-[10px] text-sakra-goldDark hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-2 rounded text-xs transition-colors ${n.unread ? 'bg-sakra-cream/40' : 'bg-transparent'}`}>
                    <div className="flex items-center justify-between text-[10px] text-sakra-muted mb-0.5">
                      <span className="font-mono font-medium text-sakra-forest">{n.category}</span>
                      <span>{n.time}</span>
                    </div>
                    <p className="text-sakra-dark font-medium leading-snug">{n.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Monogram Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-sakra-goldLight/60">
          <div className="w-8 h-8 rounded-full bg-sakra-forest text-sakra-gold flex items-center justify-center font-serif font-bold text-xs shadow-inner border border-sakra-gold/40">
            SV
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-sakra-dark leading-tight">Private Terminal</div>
            <div className="text-[10px] font-mono text-sakra-muted">HNW Member</div>
          </div>
        </div>
      </div>
    </header>
  );
}
