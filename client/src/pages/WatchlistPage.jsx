import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookmarkCheck,
  Plus,
  Trash2,
  Edit3,
  Check,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  AlertCircle,
  Search,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  AlertTriangle,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusBadge, DataFreshnessLabel, EmptyState } from '../components/ui/StatusBadge';
import { formatINR, formatPercent } from '../utils/formatters';
import { api } from '../api/client';

export function WatchlistPage() {
  const { dataMode, setNotifications } = useApp();

  const [watchlistData, setWatchlistData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('symbol');
  const [sortDir, setSortDir] = useState('asc');

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSymbolInput, setNewSymbolInput] = useState('');
  const [newNotesInput, setNewNotesInput] = useState('');
  const [modalError, setModalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation State
  const [deletingItem, setDeletingItem] = useState(null);

  // Load Watchlist from Backend API
  const loadWatchlist = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getWatchlist('default');
      if (res.status === 'success') {
        setWatchlistData(res);
      } else {
        setError(res.message || 'Failed to load watchlist.');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with watchlist service.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const items = watchlistData?.items || [];
  const watchlist = watchlistData?.watchlist || { name: 'Primary Monitored Equities', itemCount: 0 };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        item.symbol.toLowerCase().includes(q) ||
        (item.companyName && item.companyName.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q))
      );
    });
  }, [items, searchQuery]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'changePct') {
        aVal = a.changePct;
        bVal = b.changePct;
      } else if (sortField === 'close') {
        aVal = a.latestClose;
        bVal = b.latestClose;
      }

      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? (aVal ?? 0) - (bVal ?? 0) : (bVal ?? 0) - (aVal ?? 0);
    });
  }, [filteredItems, sortField, sortDir]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);
    const sym = newSymbolInput.toUpperCase().trim();

    if (!sym || !/^[A-Za-z0-9_&-]{1,30}$/.test(sym)) {
      setModalError('Invalid stock symbol format. Must be alphanumeric up to 30 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.addWatchlistItem('default', {
        symbol: sym,
        notes: newNotesInput,
      });

      if (res.status === 'success') {
        setShowAddModal(false);
        setNewSymbolInput('');
        setNewNotesInput('');
        await loadWatchlist();
        setNotifications(prev => [
          { id: Date.now(), title: `${sym} added to monitored watchlist`, time: 'Just now', unread: true, category: 'Watchlist' },
          ...prev,
        ]);
      } else {
        setModalError(res.message || 'Failed to add symbol.');
      }
    } catch (err) {
      setModalError(err.message || 'Error adding symbol to watchlist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsSubmitting(true);
    try {
      const res = await api.removeWatchlistItem('default', deletingItem.symbol);
      if (res.status === 'success') {
        const sym = deletingItem.symbol;
        setDeletingItem(null);
        await loadWatchlist();
        setNotifications(prev => [
          { id: Date.now(), title: `${sym} removed from monitored watchlist`, time: 'Just now', unread: false, category: 'Watchlist' },
          ...prev,
        ]);
      } else {
        setError(res.message || 'Failed to remove symbol.');
      }
    } catch (err) {
      setError(err.message || 'Error removing symbol.');
    } finally {
      setIsSubmitting(false);
      setDeletingItem(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sakra-goldLight/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase tracking-wider text-sakra-gold font-semibold">
              Research Surveillance
            </span>
            <span className="text-sakra-goldLight">•</span>
            <span className="text-xs text-sakra-muted">{items.length} Monitored Equities</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-sakra-dark tracking-tight">
            Curated Indian Equities Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-sakra-muted mt-1 max-w-2xl">
            Surveillance list backed by verified NSE EOD closing prices, price deltas, and research investment theses.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={loadWatchlist}
            className="p-2 rounded-lg border border-sakra-goldLight/80 text-sakra-dark hover:border-sakra-gold bg-white transition-colors"
            title="Refresh Quotes"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sakra-gold' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sakra-forest hover:bg-sakra-deep text-sakra-gold font-mono font-medium text-xs transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Symbol
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <DataFreshnessLabel
          source="NSE Daily Historical Bhavcopy (Verified EOD Closes)"
          mode={dataMode}
          timestamp="Verified Sequential EOD Sessions"
        />
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200/80 text-[11px] font-mono text-amber-900">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Local Development Mode (Single-Tenant)</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={loadWatchlist} className="underline font-bold">Retry</button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-sakra-goldLight shadow-sakra-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-sakra-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter watchlist by symbol, company, or notes..."
            className="w-full pl-9 pr-3 py-2 bg-sakra-cream/20 border border-sakra-goldLight rounded-lg text-xs font-mono text-sakra-dark focus:outline-none focus:border-sakra-gold"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sakra-muted hover:text-sakra-dark"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="text-xs font-mono text-sakra-muted flex items-center gap-2">
          <span>Showing <strong>{sortedItems.length}</strong> of {items.length} equities</span>
        </div>
      </div>

      {/* Watchlist Items Ledger */}
      <SectionCard title={watchlist.name || 'Primary Watchlist'}>
        {items.length === 0 ? (
          <EmptyState
            title="Your Watchlist is Empty"
            description="Add stocks to track verified historical closing prices, session returns, and research theses."
            actionLabel="Add First Symbol"
            onAction={() => setShowAddModal(true)}
          />
        ) : (
          <div className="overflow-x-auto -mx-5 -mb-5">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-sakra-goldLight/60 bg-sakra-cream/40 text-[11px] font-mono uppercase tracking-wider text-sakra-muted">
                  <th className="py-2.5 px-4 cursor-pointer hover:text-sakra-forest" onClick={() => handleSort('symbol')}>
                    Symbol
                  </th>
                  <th className="py-2.5 px-4">Company Name</th>
                  <th className="py-2.5 px-3 text-right cursor-pointer hover:text-sakra-forest" onClick={() => handleSort('close')}>
                    Latest EOD Close
                  </th>
                  <th className="py-2.5 px-3 text-right cursor-pointer hover:text-sakra-forest" onClick={() => handleSort('changePct')}>
                    EOD Change
                  </th>
                  <th className="py-2.5 px-3 text-right">EOD Volume</th>
                  <th className="py-2.5 px-4">Investment Thesis / Notes</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sakra-goldLight/30 font-mono">
                {sortedItems.map((item) => {
                  const isGain = (item.change ?? 0) >= 0;
                  return (
                    <tr key={item.id} className="hover:bg-sakra-cream/20 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          to={`/stocks/${item.symbol}`}
                          className="font-bold text-sakra-forest hover:text-sakra-gold text-xs flex items-center gap-1.5"
                        >
                          <span>{item.symbol}</span>
                          <ExternalLink className="w-3 h-3 text-sakra-gold opacity-70" />
                        </Link>
                        <span className="text-[10px] text-sakra-muted font-sans block">{item.series || 'EQ'}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-sans text-xs text-sakra-dark font-medium truncate max-w-xs">
                          {item.companyName}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right tabular-nums">
                        {item.hasData ? (
                          <div>
                            <span className="font-bold text-sakra-dark text-xs">{formatINR(item.latestClose)}</span>
                            <div className="text-[10px] text-sakra-muted">{item.tradeDate}</div>
                          </div>
                        ) : (
                          <span className="text-stone-400 text-[10px]">No History</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right tabular-nums">
                        {item.hasData && item.change !== null ? (
                          <div className={`font-semibold ${isGain ? 'text-sakra-gain' : 'text-sakra-loss'}`}>
                            <div>{isGain ? '+' : ''}{item.change.toFixed(2)}</div>
                            <div className="text-[10px]">({isGain ? '+' : ''}{item.changePct}%)</div>
                          </div>
                        ) : (
                          <span className="text-sakra-muted">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right text-sakra-muted tabular-nums">
                        {item.volume ? Number(item.volume).toLocaleString('en-IN') : '—'}
                      </td>

                      <td className="py-3 px-4 font-sans text-xs text-sakra-dark max-w-xs">
                        <div className="truncate" title={item.notes}>
                          {item.notes || <span className="text-sakra-muted italic">No notes recorded</span>}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => setDeletingItem(item)}
                          className="p-1 rounded text-sakra-muted hover:text-red-700 hover:bg-red-50 transition-colors"
                          title={`Remove ${item.symbol} from watchlist`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
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
          Watchlist Regulatory Notice & Disclosure:
        </div>
        <div>• Prices and daily deltas are derived from official NSE EOD Bhavcopy records, not real-time intraday feeds.</div>
        <div>• Adding an instrument to a watchlist does not execute a trade or reserve exchange liquidity.</div>
      </div>

      {/* Add Symbol Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sakra-deep/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full border border-sakra-goldLight shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-sakra-goldLight/60">
              <h3 className="font-serif text-xl font-semibold text-sakra-dark">
                Add Stock to Watchlist
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
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

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-sakra-muted uppercase tracking-wider mb-1">
                  NSE Stock Symbol
                </label>
                <input
                  type="text"
                  value={newSymbolInput}
                  onChange={(e) => setNewSymbolInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN, BHARTIARTL, TCS"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-sakra-goldLight focus:border-sakra-gold focus:outline-none bg-white text-sakra-dark uppercase"
                />
              </div>

              <div>
                <label className="block text-sakra-muted uppercase tracking-wider mb-1">
                  Investment Thesis / Surveillance Note
                </label>
                <textarea
                  value={newNotesInput}
                  onChange={(e) => setNewNotesInput(e.target.value)}
                  placeholder="e.g. Waiting for 50-day EMA support test or quarterly earnings release"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-sakra-goldLight focus:border-sakra-gold focus:outline-none bg-white text-sakra-dark font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-sakra-goldLight/60">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-sakra-goldLight text-sakra-muted hover:text-sakra-dark transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-sakra-forest hover:bg-sakra-deep text-sakra-gold font-bold transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? 'Adding...' : 'Add to Watchlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sakra-deep/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full border border-red-200 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-700">
              <div className="p-2 rounded-full bg-red-100">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-serif text-lg font-bold">Remove from Watchlist</h3>
            </div>

            <p className="text-xs font-mono text-sakra-dark leading-relaxed">
              Remove <strong className="text-sakra-forest">{deletingItem.symbol}</strong> from your surveillance watchlist?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-sakra-goldLight/40">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
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
