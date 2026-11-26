import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { MarketOverviewPage } from './pages/MarketOverviewPage';
import { StockScreenerPage } from './pages/StockScreenerPage';
import { StockResearchPage } from './pages/StockResearchPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { ResearchNewsPage } from './pages/ResearchNewsPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { PredictionLabPage } from './pages/PredictionLabPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppShell />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="market" element={<MarketOverviewPage />} />
            <Route path="screener" element={<StockScreenerPage />} />
            <Route path="stocks/:symbol" element={<StockResearchPage />} />
            <Route path="watchlist" element={<WatchlistPage />} />
            <Route path="research" element={<ResearchNewsPage />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="predictions" element={<PredictionLabPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
