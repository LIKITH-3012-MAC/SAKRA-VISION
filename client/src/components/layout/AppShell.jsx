import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { SearchModal } from './SearchModal';

export function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-sakra-ivory flex">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Topbar setMobileOpen={setMobileOpen} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        {/* Global Footer */}
        <footer className="border-t border-sakra-goldLight/60 bg-white/60 py-6 px-4 sm:px-6 lg:px-8 text-xs text-sakra-muted">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sakra-deep text-sm">SAKRA VISION</span>
              <span>—</span>
              <span className="text-[11px] font-mono tracking-wider uppercase text-sakra-goldDark">Analyze · Anticipate · Accumulate</span>
            </div>
            <div className="text-[11px] text-center sm:text-right text-sakra-muted">
              Market Intelligence Terminal for Research & Educational Purpose Only. Not SEBI Registered Investment Advice.
            </div>
          </div>
        </footer>
      </div>

      {/* Global Spotlight Search Modal */}
      <SearchModal />
    </div>
  );
}
