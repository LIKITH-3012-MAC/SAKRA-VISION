import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  Sliders,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Play,
  RotateCcw,
  BarChart3,
  Scale,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SectionCard } from '../components/ui/SectionCard';
import { StatusBadge, DataFreshnessLabel } from '../components/ui/StatusBadge';
import { PriceChart } from '../components/charts/PriceChart';
import { formatINR, formatPercent } from '../utils/formatters';
import { api } from '../api/client';

const QUICK_STOCKS = ['RELIANCE', 'HDFCBANK', 'TCS', 'INFY', 'BHARTIARTL', 'SBIN'];

const HORIZON_OPTIONS = [
  { value: 1, label: '1 Session', sublabel: 'Next Trading Day' },
  { value: 5, label: '5 Sessions', sublabel: '1 Trading Week' },
  { value: 20, label: '20 Sessions', sublabel: '1 Trading Month' },
];

const MODEL_OPTIONS = [
  { id: 'trend', name: 'Linear Drift (OLS)', desc: 'Ordinary Least Squares trend extrapolation over observed closes.' },
  { id: 'sma', name: 'Moving Average (SMA)', desc: 'Adaptive rolling mean of recent trading closes projected forward.' },
  { id: 'exponential_smoothing', name: 'Exponential Smoothing', desc: 'Recursive exponential weighting (alpha = 0.3) emphasizing recent price discovery.' },
  { id: 'naive', name: 'Naive Persistence', desc: 'Baseline persistence model: P(t+k) = P(t). Fundamental benchmark.' },
];

export function PredictionLabPage() {
  const { dataMode } = useApp();

  const [selectedStock, setSelectedStock] = useState('RELIANCE');
  const [horizon, setHorizon] = useState(5);
  const [modelType, setModelType] = useState('trend');

  const [isLoading, setIsLoading] = useState(false);
  const [predictionData, setPredictionData] = useState(null);
  const [backtestData, setBacktestData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch prediction and execute walk-forward backtest
  const loadForecastAndBacktest = async (sym, h, m) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch prediction
      const predRes = await api.getStockPrediction(sym, h, m);
      if (predRes.status === 'success') {
        setPredictionData(predRes);
      } else {
        setError(predRes.message || 'Could not compute forecast.');
        setPredictionData(null);
      }

      // 2. Fetch walk-forward backtest
      const btRes = await api.runBacktest(sym, h, m, 5);
      if (btRes.status === 'success') {
        setBacktestData(btRes);
      } else {
        setBacktestData(null); // Insufficient data or pending
      }
    } catch (err) {
      setError(err.message || 'Error executing statistical model.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadForecastAndBacktest(selectedStock, horizon, modelType);
  }, [selectedStock, horizon, modelType]);

  const handleStockChange = (sym) => {
    setSelectedStock(sym);
  };

  const isPos = (predictionData?.forecastChangePct ?? 0) >= 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-sakra-goldLight/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase tracking-wider text-sakra-gold font-semibold">
              Quantitative Lab & Model Evaluation
            </span>
            <span className="text-sakra-goldLight">•</span>
            <span className="text-xs text-sakra-muted">Statistical Baselines & Walk-Forward Testing</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-sakra-dark tracking-tight">
            Prediction & Backtesting Lab
          </h1>
          <p className="text-xs sm:text-sm text-sakra-muted mt-1 max-w-2xl">
            Evaluate statistical forecasting models using leakage-safe, walk-forward testing over verified historical NSE Bhavcopy records.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1.5 rounded bg-white border border-sakra-goldLight text-sakra-forest font-semibold shadow-sm flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-sakra-gold" />
            Zero Look-Ahead Bias Verified
          </span>
        </div>
      </div>

      <DataFreshnessLabel
        source="NSE Historical Bhavcopy (EOD Sequential Sessions)"
        mode={dataMode}
        timestamp={predictionData?.dataCoverage?.to ? `${predictionData.dataCoverage.to} EOD Session` : "Verified Closes"}
      />

      {/* Model & Parameter Control Console */}
      <div className="bg-white p-5 rounded-xl border border-sakra-goldLight shadow-sakra-subtle space-y-4">
        {/* Quick select pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono pb-3 border-b border-sakra-goldLight/50">
          <div className="flex items-center gap-2 text-sakra-muted">
            <span>Select Security:</span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_STOCKS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleStockChange(s)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors border ${
                    selectedStock.toUpperCase() === s
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
            Observed: <strong className="text-sakra-forest">{predictionData?.dataCoverage?.tradingDays || 0} Sessions</strong>
          </div>
        </div>

        {/* Configuration Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Horizon Selection (5 cols) */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="block text-[11px] font-mono text-sakra-muted uppercase tracking-wider">
              Forecast Horizon (Trading Sessions)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {HORIZON_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setHorizon(opt.value)}
                  className={`p-2 rounded-lg text-left border transition-all ${
                    horizon === opt.value
                      ? 'bg-sakra-deep text-sakra-gold border-sakra-forest shadow-sm'
                      : 'bg-sakra-cream/30 text-sakra-dark border-sakra-goldLight/70 hover:border-sakra-gold'
                  }`}
                >
                  <div className="font-mono font-bold text-xs">{opt.label}</div>
                  <div className={`text-[10px] truncate ${horizon === opt.value ? 'text-sakra-goldLight/80' : 'text-sakra-muted'}`}>
                    {opt.sublabel}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection (7 cols) */}
          <div className="md:col-span-7 space-y-1.5">
            <label className="block text-[11px] font-mono text-sakra-muted uppercase tracking-wider">
              Statistical Model Algorithm
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MODEL_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModelType(m.id)}
                  className={`p-2 rounded-lg text-left border transition-all ${
                    modelType === m.id
                      ? 'bg-sakra-forest text-sakra-gold border-sakra-forest shadow-sm'
                      : 'bg-sakra-cream/30 text-sakra-dark border-sakra-goldLight/70 hover:border-sakra-gold'
                  }`}
                  title={m.desc}
                >
                  <div className="font-mono font-semibold text-xs truncate">{m.name}</div>
                  <div className={`text-[9px] truncate ${modelType === m.id ? 'text-sakra-goldLight/80' : 'text-sakra-muted'}`}>
                    {m.id === 'trend' ? 'Regression' : m.id === 'sma' ? 'Moving Mean' : m.id === 'exponential_smoothing' ? 'SES alpha 0.3' : 'P(t+k)=P(t)'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error & Insufficient Data Warning */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="font-bold mb-0.5">Evaluation Scope Notice</div>
            <p className="text-[11px] text-amber-800 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Forecast Output Details */}
      {predictionData && (
        <div className="space-y-6">
          {/* Key Metric Snapshot Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Current Observed Close */}
            <div className="bg-white p-4 rounded-xl border border-sakra-goldLight shadow-sakra-subtle">
              <span className="text-sakra-muted text-[10px] font-mono uppercase tracking-wider block mb-1">
                Latest Observed Close
              </span>
              <div className="font-serif text-2xl font-bold text-sakra-dark tabular-nums">
                {formatINR(predictionData.latestClose)}
              </div>
              <span className="text-[10px] text-sakra-muted font-mono mt-1 block">
                Session {predictionData.dataCoverage?.to}
              </span>
            </div>

            {/* Projected Close */}
            <div className="bg-white p-4 rounded-xl border border-sakra-goldLight shadow-sakra-subtle">
              <span className="text-sakra-muted text-[10px] font-mono uppercase tracking-wider block mb-1">
                Projected T+{horizon} Close
              </span>
              <div className="font-serif text-2xl font-bold text-sakra-forest tabular-nums">
                {formatINR(predictionData.forecastClose)}
              </div>
              <span className="text-[10px] text-sakra-goldDark font-mono mt-1 block">
                {predictionData.modelName}
              </span>
            </div>

            {/* Projected Return */}
            <div className="bg-white p-4 rounded-xl border border-sakra-goldLight shadow-sakra-subtle">
              <span className="text-sakra-muted text-[10px] font-mono uppercase tracking-wider block mb-1">
                Projected Delta
              </span>
              <div className={`font-serif text-2xl font-bold tabular-nums ${isPos ? 'text-sakra-gain' : 'text-sakra-loss'}`}>
                {isPos ? '+' : ''}{predictionData.forecastChangePct}%
              </div>
              <span className="text-[10px] text-sakra-muted font-mono mt-1 block">
                {isPos ? '+' : ''}{formatINR(predictionData.forecastChange)} vs latest close
              </span>
            </div>

            {/* In-Sample Standard Error */}
            <div className="bg-white p-4 rounded-xl border border-sakra-goldLight shadow-sakra-subtle">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sakra-muted text-[10px] font-mono uppercase tracking-wider block">
                  Residual Std Error
                </span>
                <span className="text-[9px] font-mono text-sakra-forest bg-sakra-cream px-1 rounded border border-sakra-goldLight">
                  95% Band
                </span>
              </div>
              <div className="font-serif text-2xl font-bold text-sakra-dark tabular-nums">
                ±{formatINR(predictionData.standardError)}
              </div>
              <span className="text-[10px] text-sakra-muted font-mono mt-1 block">
                Sample residual dispersion
              </span>
            </div>
          </div>

          {/* Historical Chart with Distinct Dashed Forecast Overlay */}
          <SectionCard
            title={`Historical Price Action & ${predictionData.modelName} Projection`}
            subtitle={`Observed closes through ${predictionData.dataCoverage?.to} • Dashed gold line indicates statistical estimate through T+${horizon}`}
            badge={
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sakra-cream text-sakra-forest font-bold border border-sakra-goldLight">
                STATISTICAL ESTIMATE
              </span>
            }
          >
            {isLoading ? (
              <div className="h-[360px] flex items-center justify-center text-xs font-mono text-sakra-muted">
                <RefreshCw className="w-4 h-4 animate-spin text-sakra-gold mr-2" />
                Computing trajectory over historical trading sessions...
              </div>
            ) : (
              <PriceChart
                currentPrice={predictionData.latestClose}
                changePct={predictionData.forecastChangePct}
                data={predictionData.chartData}
                timeframe="1M"
                showVolume={false}
                height={360}
              />
            )}

            {/* Projected Path Schedule */}
            <div className="mt-4 pt-3 border-t border-sakra-goldLight/40">
              <div className="flex items-center justify-between text-xs font-mono text-sakra-muted mb-2">
                <span className="font-bold text-sakra-dark">Step-by-Step Forecast Schedule (T+1 to T+{horizon}):</span>
                <span>Values represent non-guaranteed mathematical projections</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                {predictionData.projectedSeries?.slice(0, 5).map((step, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-sakra-cream/40 border border-sakra-goldLight/60">
                    <div className="flex items-center justify-between text-[10px] text-sakra-muted mb-0.5">
                      <span className="font-bold text-sakra-forest">{step.label}</span>
                      <span>{step.date}</span>
                    </div>
                    <div className="font-bold text-sakra-dark text-sm tabular-nums">
                      {formatINR(step.forecastClose)}
                    </div>
                    <div className="text-[10px] text-sakra-muted tabular-nums">
                      [{formatINR(step.lowerBound)} – {formatINR(step.upperBound)}]
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>

          {/* Walk-Forward Backtest Verification Panel */}
          <SectionCard
            title="Leakage-Safe Walk-Forward Backtesting Evaluation"
            subtitle="Strictly expanding historical windows with zero look-ahead bias • Predictions evaluated against actual subsequent outcomes"
            badge={
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sakra-forest text-sakra-gold font-bold">
                WALK-FORWARD VERIFIED
              </span>
            }
          >
            {backtestData && backtestData.metrics ? (
              <div className="space-y-6">
                {/* Metric Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-sakra-cream/70 border-b border-sakra-goldLight font-mono uppercase text-[11px] text-sakra-muted">
                        <th className="py-2.5 px-4">Evaluation Metric</th>
                        <th className="py-2.5 px-4 text-right">{backtestData.modelName}</th>
                        <th className="py-2.5 px-4 text-right">Naive Baseline Benchmark</th>
                        <th className="py-2.5 px-4 text-center">Empirical Comparison</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-sakra-goldLight/40 font-mono">
                      <tr>
                        <td className="py-3 px-4 font-sans font-medium text-sakra-dark">
                          Mean Absolute Error (MAE)
                          <div className="text-[10px] text-sakra-muted">Average absolute deviation in ₹</div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-sakra-dark text-sm">
                          {formatINR(backtestData.metrics.mae)}
                        </td>
                        <td className="py-3 px-4 text-right text-sakra-muted">
                          {formatINR(backtestData.naiveBenchmark.mae)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            backtestData.metrics.mae <= backtestData.naiveBenchmark.mae
                              ? 'bg-emerald-50 text-sakra-gain'
                              : 'bg-rose-50 text-sakra-loss'
                          }`}>
                            {backtestData.metrics.mae <= backtestData.naiveBenchmark.mae ? 'Lower Error' : 'Higher Error'}
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td className="py-3 px-4 font-sans font-medium text-sakra-dark">
                          Root Mean Squared Error (RMSE)
                          <div className="text-[10px] text-sakra-muted">Penalizes larger outliers quadratically</div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-sakra-dark text-sm">
                          {formatINR(backtestData.metrics.rmse)}
                        </td>
                        <td className="py-3 px-4 text-right text-sakra-muted">
                          {formatINR(backtestData.naiveBenchmark.rmse)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            backtestData.metrics.rmse <= backtestData.naiveBenchmark.rmse
                              ? 'bg-emerald-50 text-sakra-gain'
                              : 'bg-rose-50 text-sakra-loss'
                          }`}>
                            {backtestData.benchmarkComparison?.verdict || 'Evaluated'}
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td className="py-3 px-4 font-sans font-medium text-sakra-dark">
                          Directional Accuracy (%)
                          <div className="text-[10px] text-sakra-muted">Forecasted price direction vs actual outcome</div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-sakra-forest text-sm">
                          {backtestData.metrics.directionalAccuracyPct}%
                        </td>
                        <td className="py-3 px-4 text-right text-sakra-muted">
                          {backtestData.naiveBenchmark.directionalAccuracyPct}% (Zero-delta)
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sakra-cream text-sakra-forest border border-sakra-goldLight">
                            {backtestData.metrics.directionalAccuracyPct >= 50 ? 'Positive Edge' : 'Sub-50% Edge'}
                          </span>
                        </td>
                      </tr>

                      <tr>
                        <td className="py-3 px-4 font-sans font-medium text-sakra-dark">
                          Mean Absolute % Error (MAPE)
                          <div className="text-[10px] text-sakra-muted">Normalized percentage deviation</div>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-sakra-dark text-sm">
                          {backtestData.metrics.mape !== null ? `${backtestData.metrics.mape}%` : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right text-sakra-muted">
                          {backtestData.naiveBenchmark.mape !== null ? `${backtestData.naiveBenchmark.mape}%` : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-center text-sakra-muted text-[10px]">
                          Evaluated over {backtestData.dataCoverage?.evaluatedWindows} windows
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Walk-Forward Sample Windows Table */}
                {backtestData.evaluationWindowsSample && backtestData.evaluationWindowsSample.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-sakra-goldLight/40">
                    <div className="flex items-center justify-between text-xs font-mono text-sakra-muted">
                      <span className="font-bold text-sakra-dark">Walk-Forward Evaluation Windows Sample:</span>
                      <span>Showing {backtestData.evaluationWindowsSample.length} consecutive trading horizons</span>
                    </div>

                    <div className="overflow-x-auto max-h-56">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="bg-sakra-cream/40 text-[10px] uppercase text-sakra-muted border-b border-sakra-goldLight/50">
                            <th className="py-1.5 px-3">#</th>
                            <th className="py-1.5 px-3">Training Cutoff</th>
                            <th className="py-1.5 px-3">Target Date</th>
                            <th className="py-1.5 px-3 text-right">Actual Close</th>
                            <th className="py-1.5 px-3 text-right">Model Forecast</th>
                            <th className="py-1.5 px-3 text-right">Error (₹)</th>
                            <th className="py-1.5 px-3 text-center">Direction</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sakra-goldLight/30 text-[11px]">
                          {backtestData.evaluationWindowsSample.map((w) => (
                            <tr key={w.windowIndex} className="hover:bg-sakra-cream/20">
                              <td className="py-1.5 px-3 text-sakra-muted">{w.windowIndex}</td>
                              <td className="py-1.5 px-3">{w.trainEndDate}</td>
                              <td className="py-1.5 px-3 font-semibold text-sakra-dark">{w.evalDate}</td>
                              <td className="py-1.5 px-3 text-right font-bold tabular-nums">{formatINR(w.actualPrice)}</td>
                              <td className="py-1.5 px-3 text-right tabular-nums text-sakra-forest">{formatINR(w.modelForecast)}</td>
                              <td className={`py-1.5 px-3 text-right tabular-nums ${w.modelError <= 0 ? 'text-sakra-gain' : 'text-sakra-loss'}`}>
                                {w.modelError > 0 ? '+' : ''}{w.modelError}
                              </td>
                              <td className="py-1.5 px-3 text-center">
                                {w.directionalHit ? (
                                  <span className="text-sakra-gain font-bold text-[10px]">CORRECT</span>
                                ) : (
                                  <span className="text-sakra-loss font-bold text-[10px]">MISMATCH</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-xs font-mono text-sakra-muted space-y-1">
                <Info className="w-5 h-5 mx-auto text-sakra-gold mb-2" />
                <div>Insufficient sequential trading sessions in database for horizon {horizon} backtesting.</div>
                <div className="text-[11px] text-sakra-muted/80">
                  Walk-forward testing requires at least {5 + horizon} historical sessions (minimum 5 training sessions + {horizon} evaluation lag).
                </div>
              </div>
            )}
          </SectionCard>

          {/* Model Limitations & Transparency Notice */}
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-[11px] font-mono text-sakra-muted space-y-1">
            <div className="font-semibold text-stone-700 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-stone-500" />
              Statistical Transparency & Algorithmic Notice:
            </div>
            {(predictionData.limitations || []).map((lim, idx) => (
              <div key={idx}>• {lim}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
