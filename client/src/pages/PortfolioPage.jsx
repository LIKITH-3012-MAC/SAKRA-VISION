import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Trash2,
  Edit2,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  ShieldAlert,
  Calendar,
  CheckCircle,
  X,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  RefreshCw,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MetricCard } from '../components/ui/MetricCard';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusBadge, DataFreshnessLabel, EmptyState } from '../components/ui/StatusBadge';
import { PortfolioAllocationChart } from '../components/charts/TechnicalGauge';
import { formatINR, formatPercent } from '../utils/formatters';
import { api } from '../api/client';

export function PortfolioPage() {
  const { dataMode, setNotifications } = useApp();

  const [portfolioData, setPortfolioData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sorting
  const [sortField, setSortField] = useState('marketValue');
  const [sortDir, setSortDir] = useState('desc');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Form Fields
  const [formSymbol, setFormSymbol] = useState('');
  const [formExchange, setFormExchange] = useState('NSE');
  const [formQty, setFormQty] = useState('');
  const [formAvgPrice, setFormAvgPrice] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Delete Confirmation State
  const [deletingHolding, setDeletingHolding] = useState(null);

  // Fetch portfolio data from backend API
  const loadPortfolio = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getPortfolio('default');
      if (res.status === 'success') {
        setPortfolioData(res);
      } else {
        setError(res.message || 'Failed to load portfolio.');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with portfolio service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const holdings = portfolioData?.holdings || [];
  const summary = portfolioData?.summary || {
    totalInvested: 0,
    totalMarketValue: 0,
    coveredInvestedAmount: 0,
    unrealizedPL: 0,
    unrealizedPLPct: 0,
    coveredHoldingsCount: 0,
    uncoveredHoldingsCount: 0,
    valuationCoveragePct: 100,
    isFullCoverage: true,
  };

  const sortedHoldings = useMemo(() => {
    return [...holdings].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'pl') {
        aVal = a.unrealizedPL;
        bVal = b.unrealizedPL;
      } else if (sortField === 'invested') {
        aVal = a.investedAmount;
        bVal = b.investedAmount;
      }

      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? (aVal ?? 0) - (bVal ?? 0) : (bVal ?? 0) - (aVal ?? 0);
    });
  }, [holdings, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleOpenAdd = () => {
    setEditingHolding(null);
    setFormSymbol('');
    setFormExchange('NSE');
    setFormQty('');
    setFormAvgPrice('');
    setFormNotes('');
    setModalError(null);
    setShowModal(true);
  };

  const handleOpenEdit = (h) => {
    setEditingHolding(h);
    setFormSymbol(h.symbol);
    setFormExchange(h.exchange || 'NSE');
    setFormQty(String(h.quantity));
    setFormAvgPrice(String(h.averageBuyPrice));
    setFormNotes(h.notes || '');
    setModalError(null);
    setShowModal(true);
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    setModalError(null);

    const qty = parseFloat(formQty);
    const avg = parseFloat(formAvgPrice);
    const sym = formSymbol.toUpperCase().trim();

    if (!sym || !/^[A-Za-z0-9_&-]{1,30}$/.test(sym)) {
      setModalError('Invalid stock symbol format. Must be alphanumeric up to 30 characters.');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      setModalError('Quantity must be a positive number.');
      return;
    }
    if (isNaN(avg) || avg <= 0) {
      setModalError('Average buy price must be a positive number.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingHolding) {
        // Update existing holding
        const res = await api.updatePortfolioHolding('default', editingHolding.id, {
          quantity: qty,
          averageBuyPrice: avg,
          notes: formNotes,
        });
        if (res.status === 'success') {
          setShowModal(false);
          await loadPortfolio();
          setNotifications(prev => [
            { id: Date.now(), title: `Position updated: ${sym} (${qty} shares @ ₹${avg})`, time: 'Just now', unread: true, category: 'Portfolio' },
            ...prev,
          ]);
        } else {
          setModalError(res.message || 'Failed to update holding.');
        }
      } else {
        // Add new holding
        const res = await api.addPortfolioHolding('default', {
          symbol: sym,
          quantity: qty,
          averageBuyPrice: avg,
          exchange: formExchange,
          notes: formNotes,
        });
        if (res.status === 'success') {
          setShowModal(false);
          await loadPortfolio();
          setNotifications(prev => [
            { id: Date.now(), title: `New holding added: ${sym} (${qty} shares @ ₹${avg})`, time: 'Just now', unread: true, category: 'Portfolio' },
            ...prev,
          ]);
        } else {
          setModalError(res.message || 'Failed to add holding.');
        }
      }
    } catch (err) {
      setModalError(err.message || 'An error occurred while saving holding.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingHolding) return;
    setIsSubmitting(true);
    try {
      const res = await api.deletePortfolioHolding('default', deletingHolding.id);
      if (res.status === 'success') {
        const sym = deletingHolding.symbol;
        setDeletingHolding(null);
        await loadPortfolio();
        setNotifications(prev => [
          { id: Date.now(), title: `Position deleted: ${sym} removed from portfolio`, time: 'Just now', unread: false, category: 'Portfolio' },
          ...prev,
        ]);
      } else {
        setError(res.message || 'Failed to delete holding.');
      }
    } catch (err) {
      setError(err.message || 'Error deleting holding.');
    } finally {
      setIsSubmitting(false);
      setDeletingHolding(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sakra-goldLight/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase tracking-wider text-sakra-gold font-semibold">
              Private Wealth Holdings
            </span>
            <span className="text-sakra-goldLight">•</span>
            <span className="text-xs text-sakra-muted">{holdings.length} Tracked Positions</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-sakra-dark tracking-tight">
            Personal Investment Portfolio
          </h1>
          <p className="text-xs sm:text-sm text-sakra-muted mt-1 max-w-2xl">
            Unrealized profit/loss audit, position allocation weights, and legitimate historical EOD valuation tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadPortfolio}
            className="p-2 rounded-lg border border-sakra-goldLight/80 text-sakra-dark hover:border-sakra-gold bg-white transition-colors"
            title="Refresh valuation"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sakra-gold' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sakra-forest hover:bg-sakra-deep text-sakra-gold font-mono font-medium text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Equity Position
          </button>
        </div>
      </div>

      {/* Freshness Label & Single-Tenant Auth Mode Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <DataFreshnessLabel
          source="NSE Daily Historical Bhavcopy (Verified EOD Closes)"
          mode={dataMode}
          timestamp={summary.latestValuationDate ? `${summary.latestValuationDate} EOD Session` : 'Historical Market Data'}
        />
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200/80 text-[11px] font-mono text-amber-900">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Local Development Mode (Single-Tenant) • Auth Required for Production</span>
        </div>
      </div>

      {/* Missing or Stale Price Coverage Warning */}
      {!summary.isFullCoverage && (
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs font-mono text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <span className="font-bold">Partial Valuation Notice: </span>
            {summary.uncoveredHoldingsCount} of {summary.totalHoldingsCount} holdings have no verified historical EOD closing price in the database.
            Their cost basis (₹{summary.totalInvested.toLocaleString('en-IN')}) is retained, but unverified valuations are excluded from market value totals.
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={loadPortfolio} className="underline font-bold">Retry</button>
        </div>
      )}

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Current Portfolio Value"
          value={formatINR(summary.totalMarketValue)}
          subtitle={summary.latestValuationDate ? `Valued as of ${summary.latestValuationDate} EOD` : 'Historical Valuation'}
          icon={Briefcase}
        />
        <MetricCard
          label="Total Invested Cost"
          value={formatINR(summary.totalInvested)}
          subtitle={`${holdings.length} tracked positions`}
        />
        <MetricCard
          label="Net Unrealized P&L"
          value={formatINR(summary.unrealizedPL)}
          changePct={summary.unrealizedPLPct}
          changeLabel="on covered positions"
        />
        <MetricCard
          label="Valuation Coverage"
          value={`${summary.valuationCoveragePct}%`}
          subtitle={`${summary.coveredHoldingsCount} of ${summary.totalHoldingsCount} priced from historical EOD`}
        />
      </div>

      {/* Main Content Layout: Holdings Table (8 cols) + Allocation Chart (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <SectionCard
            title="Portfolio Holdings & Valuation Ledger"
            subtitle="Calculated from actual shares, purchase prices, and legitimate historical EOD closes."
          >
            {holdings.length === 0 ? (
              <EmptyState
                title="No Portfolio Holdings"
                description="Start tracking your Indian equity portfolio by recording your first position."
                actionLabel="Add First Holding"
                onAction={handleOpenAdd}
              />
            ) : (
              <div className="overflow-x-auto -mx-5 -mb-5">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-sakra-goldLight/60 bg-sakra-cream/40 text-[11px] font-mono uppercase tracking-wider text-sakra-muted">
                      <th className="py-2.5 px-4 cursor-pointer hover:text-sakra-forest" onClick={() => handleSort('symbol')}>
                        Security
                      </th>
                      <th className="py-2.5 px-3 text-right cursor-pointer hover:text-sakra-forest" onClick={() => handleSort('quantity')}>
                        Quantity
                      </th>
                      <th className="py-2.5 px-3 text-right cursor-pointer hover:text-sakra-forest" onClick={() => handleSort('averageBuyPrice')}>
                        Avg Buy Price
                      </th>
                      <th className="py-2.5 px-3 text-right cursor-pointer hover:text-sakra-forest" onClick={() => handleSort('valuationPrice')}>
                        EOD Close
                      </th>
                      <th className="py-2.5 px-4 text-right cursor-pointer hover:text-sakra-forest" onClick={() => handleSort('marketValue')}>
                        Market Value
                      </th>
                      <th className="py-2.5 px-4 text-right cursor-pointer hover:text-sakra-forest" onClick={() => handleSort('pl')}>
                        Unrealized P&L
                      </th>
                      <th className="py-2.5 px-3 text-right">Allocation</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sakra-goldLight/30 font-mono">
                    {sortedHoldings.map((h) => {
                      const isGain = (h.unrealizedPL || 0) >= 0;
                      return (
                        <tr key={h.id} className="hover:bg-sakra-cream/20 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-sakra-forest text-xs">{h.symbol}</div>
                            <div className="font-sans text-[11px] text-sakra-muted truncate max-w-[140px]">{h.companyName}</div>
                          </td>
                          <td className="py-3 px-3 text-right text-sakra-dark tabular-nums font-semibold">
                            {Number(h.quantity).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-right text-sakra-muted tabular-nums">
                            {formatINR(h.averageBuyPrice)}
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums">
                            {h.isValuationAvailable ? (
                              <div>
                                <div className="font-semibold text-sakra-dark">{formatINR(h.valuationPrice)}</div>
                                <div className="text-[10px] text-sakra-muted">{h.valuationDate}</div>
                              </div>
                            ) : (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-stone-100 text-stone-500 border border-stone-200">
                                Stale / Unavailable
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-sakra-dark tabular-nums">
                            {h.isValuationAvailable ? formatINR(h.marketValue) : '—'}
                          </td>
                          <td className="py-3 px-4 text-right tabular-nums">
                            {h.isValuationAvailable ? (
                              <div>
                                <span className={`font-bold ${isGain ? 'text-sakra-gain' : 'text-sakra-loss'}`}>
                                  {isGain ? '+' : ''}{formatINR(h.unrealizedPL)}
                                </span>
                                <div className={`text-[10px] font-semibold ${isGain ? 'text-sakra-gain' : 'text-sakra-loss'}`}>
                                  {isGain ? '+' : ''}{h.unrealizedPLPct}%
                                </div>
                              </div>
                            ) : (
                              <span className="text-sakra-muted">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right text-sakra-dark tabular-nums font-medium">
                            {h.allocationPct}%
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(h)}
                                className="p-1 rounded text-sakra-muted hover:text-sakra-forest hover:bg-sakra-cream/40 transition-colors"
                                title="Edit Position"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingHolding(h)}
                                className="p-1 rounded text-sakra-muted hover:text-red-700 hover:bg-red-50 transition-colors"
                                title="Delete Position"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* Statutory Regulatory Safe Harbor */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-[11px] font-mono text-sakra-muted space-y-1">
            <div className="font-semibold text-stone-700 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-stone-500" />
              Statutory Accounting & Valuation Disclosure:
            </div>
            <div>• All valuations represent unrealized market values derived from official NSE EOD closing prices.</div>
            <div>• Realized P&L is not supported as trade executions and matching buy/sell order fills are not tracked.</div>
            <div>• SAKRA VISION is an analytical workspace and does not execute broker trades or provide registered investment advice.</div>
          </div>
        </div>

        {/* Right Column: Allocation & Summary Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <SectionCard
            title="Asset Allocation by Symbol"
            subtitle="Weight distribution across covered positions."
          >
            <PortfolioAllocationChart
              holdings={holdings.map(h => ({
                name: h.symbol,
                quantity: h.quantity,
                currentPrice: h.valuationPrice || h.averageBuyPrice,
                avgPrice: h.averageBuyPrice,
                sector: h.symbol, // Group by symbol for transparent allocation
              }))}
            />
          </SectionCard>

          {/* Quick Holding Performance Highlights */}
          <SectionCard title="Performance Highlights">
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-sakra-cream/30 border border-sakra-goldLight/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-sakra-muted block">Top Performer</span>
                  <strong className="text-sakra-forest text-sm">{summary.largestGainer?.symbol || 'None'}</strong>
                </div>
                {summary.largestGainer ? (
                  <span className="font-bold text-sakra-gain text-sm">+{summary.largestGainer.plPct}%</span>
                ) : (
                  <span className="text-sakra-muted">—</span>
                )}
              </div>

              <div className="p-3 rounded-lg bg-sakra-cream/30 border border-sakra-goldLight/40 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-sakra-muted block">Underperformer</span>
                  <strong className="text-sakra-forest text-sm">{summary.largestLoser?.symbol || 'None'}</strong>
                </div>
                {summary.largestLoser ? (
                  <span className={`font-bold text-sm ${summary.largestLoser.plPct >= 0 ? 'text-sakra-gain' : 'text-sakra-loss'}`}>
                    {summary.largestLoser.plPct > 0 ? '+' : ''}{summary.largestLoser.plPct}%
                  </span>
                ) : (
                  <span className="text-sakra-muted">—</span>
                )}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Add / Edit Holding Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sakra-deep/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-sakra-goldLight shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sakra-goldLight/60">
              <h3 className="font-serif text-xl font-semibold text-sakra-dark">
                {editingHolding ? `Edit Position — ${editingHolding.symbol}` : 'Add New Equity Position'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-sakra-muted hover:text-sakra-dark hover:bg-sakra-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-mono text-red-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-sakra-muted uppercase tracking-wider mb-1">
                  Stock Symbol (NSE)
                </label>
                <input
                  type="text"
                  value={formSymbol}
                  onChange={(e) => setFormSymbol(e.target.value.toUpperCase())}
                  disabled={Boolean(editingHolding)}
                  placeholder="e.g. RELIANCE, INFY, TCS"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-sakra-goldLight focus:border-sakra-gold focus:outline-none bg-sakra-cream/20 text-sakra-dark disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sakra-muted uppercase tracking-wider mb-1">
                    Quantity (Shares)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.0001"
                    value={formQty}
                    onChange={(e) => setFormQty(e.target.value)}
                    placeholder="e.g. 50"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-sakra-goldLight focus:border-sakra-gold focus:outline-none bg-white text-sakra-dark"
                  />
                </div>
                <div>
                  <label className="block text-sakra-muted uppercase tracking-wider mb-1">
                    Avg Buy Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formAvgPrice}
                    onChange={(e) => setFormAvgPrice(e.target.value)}
                    placeholder="e.g. 2850.00"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-sakra-goldLight focus:border-sakra-gold focus:outline-none bg-white text-sakra-dark"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sakra-muted uppercase tracking-wider mb-1">
                  Exchange
                </label>
                <select
                  value={formExchange}
                  onChange={(e) => setFormExchange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-sakra-goldLight focus:border-sakra-gold focus:outline-none bg-white text-sakra-dark"
                >
                  <option value="NSE">NSE (National Stock Exchange)</option>
                  <option value="BSE">BSE (Bombay Stock Exchange)</option>
                </select>
              </div>

              <div>
                <label className="block text-sakra-muted uppercase tracking-wider mb-1">
                  Investment Notes / Rationale
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Long-term core allocation, capital compounding"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-sakra-goldLight focus:border-sakra-gold focus:outline-none bg-white text-sakra-dark"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-sakra-goldLight/60">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-sakra-goldLight text-sakra-muted hover:text-sakra-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-sakra-forest hover:bg-sakra-deep text-sakra-gold font-bold transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : editingHolding ? 'Update Position' : 'Save Holding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingHolding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sakra-deep/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-red-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <div className="p-2 rounded-full bg-red-100">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-serif text-lg font-bold">Remove Position</h3>
            </div>

            <p className="text-xs font-mono text-sakra-dark leading-relaxed">
              Are you sure you want to remove <strong className="text-sakra-forest">{deletingHolding.symbol}</strong> ({deletingHolding.quantity} shares) from your portfolio?
              This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-sakra-goldLight/40">
              <button
                type="button"
                onClick={() => setDeletingHolding(null)}
                className="px-3.5 py-1.5 rounded-lg border border-sakra-goldLight text-xs font-mono text-sakra-muted hover:text-sakra-dark"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold transition-colors disabled:opacity-60"
              >
                {isSubmitting ? 'Removing...' : 'Confirm Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
