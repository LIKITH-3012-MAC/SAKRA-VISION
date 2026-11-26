import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatPercent } from '../../utils/formatters';

export function TechnicalGauge({ rsi = 50, emaTrend = 'Bullish', macdSignal = 'Buy' }) {
  // RSI gauge: 0 to 100
  // <30 Oversold (Greenish accumulator), >70 Overbought (Caution), 30-70 Neutral
  const rsiNum = Number(rsi) || 50;
  const isOverbought = rsiNum >= 70;
  const isOversold = rsiNum <= 30;

  return (
    <div className="space-y-4">
      {/* RSI Meter */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-sakra-muted font-medium">Relative Strength Index (RSI 14)</span>
          <span className="font-mono font-bold text-sm text-sakra-dark tabular-nums">{rsiNum.toFixed(1)}</span>
        </div>
        
        {/* Progress bar */}
        <div className="relative h-2.5 bg-sakra-cream rounded-full overflow-hidden border border-sakra-goldLight/70">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isOversold ? 'bg-emerald-500' : isOverbought ? 'bg-rose-500' : 'bg-sakra-gold'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, rsiNum))}%` }}
          />
        </div>
        
        <div className="flex justify-between text-[10px] font-mono text-sakra-muted mt-1">
          <span>Oversold (30)</span>
          <span className="text-center font-sans font-medium text-sakra-dark">
            {isOversold ? 'Oversold Accumulation' : isOverbought ? 'Overbought Territory' : 'Neutral Range'}
          </span>
          <span>Overbought (70)</span>
        </div>
      </div>

      {/* Grid of indicators */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-sakra-goldLight/40">
        <div className="p-2.5 rounded bg-sakra-cream/40 border border-sakra-goldLight/50">
          <div className="text-[10px] text-sakra-muted uppercase tracking-wider">Trend vs 50 EMA</div>
          <div className={`font-semibold mt-0.5 ${emaTrend === 'Bullish' ? 'text-sakra-gain' : 'text-sakra-loss'}`}>
            {emaTrend}
          </div>
        </div>
        <div className="p-2.5 rounded bg-sakra-cream/40 border border-sakra-goldLight/50">
          <div className="text-[10px] text-sakra-muted uppercase tracking-wider">MACD Signal</div>
          <div className="font-semibold text-sakra-forest mt-0.5">
            {macdSignal}
          </div>
        </div>
      </div>
    </div>
  );
}

const ALLOCATION_COLORS = ['#0F2A24', '#193D32', '#C9A568', '#26754D', '#9A9283', '#726B5D'];

export function PortfolioAllocationChart({ holdings = [] }) {
  // Aggregate by sector
  const sectorMap = {};
  let totalVal = 0;

  holdings.forEach((h) => {
    const val = (h.quantity || 0) * (h.currentPrice || h.avgPrice || 0);
    totalVal += val;
    const sec = h.sector || 'Equities';
    sectorMap[sec] = (sectorMap[sec] || 0) + val;
  });

  const chartData = Object.entries(sectorMap).map(([name, value]) => ({
    name,
    value,
    percentage: totalVal > 0 ? (value / totalVal) * 100 : 0,
  }));

  if (chartData.length === 0) {
    return <div className="text-xs text-sakra-muted p-4 text-center">No portfolio holdings added yet.</div>;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="w-44 h-44 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]} stroke="#F8F3E8" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
              contentStyle={{ background: '#0F2A24', border: '1px solid #193D32', color: '#F8F3E8', borderRadius: '6px', fontSize: '11px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-[10px] font-mono uppercase text-sakra-muted">Allocation</span>
          <span className="text-sm font-serif font-bold text-sakra-dark">{chartData.length} Sectors</span>
        </div>
      </div>

      <div className="flex-1 space-y-2 w-full">
        {chartData.map((item, idx) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length] }}
              />
              <span className="text-sakra-dark font-medium truncate">{item.name}</span>
            </div>
            <span className="font-mono text-sakra-muted tabular-nums ml-2">
              {formatPercent(item.percentage, false)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
