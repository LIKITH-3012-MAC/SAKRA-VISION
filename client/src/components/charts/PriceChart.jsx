import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  ComposedChart,
  Line,
} from 'recharts';
import { formatINR, formatCompactINR } from '../../utils/formatters';

const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y'];

export function PriceChart({
  title,
  currentPrice,
  changePct,
  data = [],
  timeframe = '1M',
  onTimeframeChange,
  showVolume = true,
  height = 360,
}) {
  const [internalTf, setInternalTf] = useState(timeframe);
  const activeTf = timeframe || internalTf;
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(false);

  const handleTfChange = (tf) => {
    setInternalTf(tf);
    if (onTimeframeChange) onTimeframeChange(tf);
  };

  const isPositive = changePct >= 0;
  const strokeColor = isPositive ? '#26754D' : '#B84B43';
  const fillColor = isPositive ? '#26754D' : '#B84B43';

  // Custom luxury tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const p = payload[0].payload;
      return (
        <div className="bg-sakra-deep text-sakra-ivory p-3 rounded-lg shadow-sakra-elevated border border-sakra-forest text-xs space-y-1 font-mono">
          <div className="text-sakra-gold text-[11px] pb-1 border-b border-sakra-forest/80 font-sans font-semibold">
            {p.date || label}
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sakra-goldLight/70">Close:</span>
            <span className="font-bold text-white tabular-nums">{formatINR(p.close || p.price)}</span>
          </div>
          {p.open && (
            <div className="flex justify-between gap-4 text-[11px]">
              <span className="text-sakra-goldLight/60">Open:</span>
              <span className="tabular-nums">{formatINR(p.open)}</span>
            </div>
          )}
          {p.high && (
            <div className="flex justify-between gap-4 text-[11px]">
              <span className="text-sakra-goldLight/60">High:</span>
              <span className="text-emerald-400 tabular-nums">{formatINR(p.high)}</span>
            </div>
          )}
          {p.low && (
            <div className="flex justify-between gap-4 text-[11px]">
              <span className="text-sakra-goldLight/60">Low:</span>
              <span className="text-rose-400 tabular-nums">{formatINR(p.low)}</span>
            </div>
          )}
          {p.volume && (
            <div className="flex justify-between gap-4 text-[10px] pt-1 border-t border-sakra-forest/60 text-sakra-goldLight/60">
              <span>Vol:</span>
              <span className="tabular-nums">{formatCompactINR(p.volume)}</span>
            </div>
          )}
          {showSMA20 && p.sma20 && (
            <div className="flex justify-between gap-4 text-[10px] text-amber-300">
              <span>SMA (20):</span>
              <span className="tabular-nums">{formatINR(p.sma20)}</span>
            </div>
          )}
          {showSMA50 && p.sma50 && (
            <div className="flex justify-between gap-4 text-[10px] text-amber-500">
              <span>SMA (50):</span>
              <span className="tabular-nums">{formatINR(p.sma50)}</span>
            </div>
          )}
          {p.forecastClose !== undefined && (
            <div className="flex justify-between gap-4 text-xs font-semibold text-amber-300 pt-1 border-t border-sakra-forest/80">
              <span>Projected:</span>
              <span className="tabular-nums">{formatINR(p.forecastClose)}</span>
            </div>
          )}
          {p.lowerBound !== undefined && p.upperBound !== undefined && (
            <div className="flex justify-between gap-4 text-[10px] text-sakra-goldLight/70">
              <span>95% Conf Band:</span>
              <span className="tabular-nums">{formatINR(p.lowerBound)} – {formatINR(p.upperBound)}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Chart Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-sakra-goldLight/50">
        <div>
          {title && <h4 className="font-serif font-semibold text-sakra-dark text-base">{title}</h4>}
          {currentPrice !== undefined && (
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-serif text-2xl font-bold text-sakra-dark tabular-nums tracking-tight">
                {formatINR(currentPrice)}
              </span>
              {changePct !== undefined && (
                <span className={`text-xs font-mono font-medium ${isPositive ? 'text-sakra-gain' : 'text-sakra-loss'}`}>
                  {isPositive ? '+' : ''}{changePct.toFixed(2)}%
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* SMA Overlays */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowSMA20(!showSMA20)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors border ${
                showSMA20
                  ? 'bg-sakra-cream text-sakra-forest font-semibold border-sakra-gold'
                  : 'bg-white text-sakra-muted border-sakra-goldLight/60 hover:border-sakra-gold'
              }`}
            >
              SMA 20
            </button>
            <button
              type="button"
              onClick={() => setShowSMA50(!showSMA50)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors border ${
                showSMA50
                  ? 'bg-sakra-cream text-sakra-forest font-semibold border-sakra-gold'
                  : 'bg-white text-sakra-muted border-sakra-goldLight/60 hover:border-sakra-gold'
              }`}
            >
              SMA 50
            </button>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center bg-sakra-cream/70 p-0.5 rounded-md border border-sakra-goldLight/70 text-xs font-mono">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => handleTfChange(tf)}
                className={`px-2.5 py-1 rounded text-xs transition-all ${
                  activeTf === tf
                    ? 'bg-sakra-deep text-sakra-gold font-bold shadow-sm'
                    : 'text-sakra-muted hover:text-sakra-dark'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Financial Chart Canvas */}
      <div style={{ height: height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={fillColor} stopOpacity={0.25} />
                <stop offset="95%" stopColor={fillColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              stroke="#726B5D"
              tickLine={false}
              axisLine={{ stroke: '#E5D7BB' }}
              tick={{ fill: '#726B5D', fontSize: 10, fontFamily: 'monospace' }}
              dy={5}
            />

            <YAxis
              yAxisId="price"
              domain={['auto', 'auto']}
              orientation="right"
              stroke="#726B5D"
              tickLine={false}
              axisLine={{ stroke: '#E5D7BB' }}
              tick={{ fill: '#726B5D', fontSize: 10, fontFamily: 'monospace' }}
              tickFormatter={(val) => `₹${val}`}
              dx={5}
            />

            <YAxis
              yAxisId="vol"
              orientation="left"
              domain={[0, (dataMax) => (dataMax ? dataMax * 4 : 1000)]}
              hide
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              yAxisId="price"
              type="monotone"
              dataKey="close"
              stroke={strokeColor}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#chartGradient)"
            />

            {showSMA20 && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="sma20"
                stroke="#C9A568"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
                name="SMA 20"
              />
            )}

            {showSMA50 && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="sma50"
                stroke="#9E7B35"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                dot={false}
                name="SMA 50"
              />
            )}

            {data.some(d => d.forecastClose !== undefined) && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="forecastClose"
                stroke="#C9A568"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={{ r: 3, fill: '#C9A568' }}
                name="Forecast Baseline"
              />
            )}

            {showVolume && (
              <Bar
                dataKey="volume"
                yAxisId="vol"
                fill="#C9A568"
                opacity={0.3}
                barSize={4}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
