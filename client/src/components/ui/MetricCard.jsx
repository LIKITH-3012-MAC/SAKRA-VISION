import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, Info } from 'lucide-react';
import { formatPercent } from '../../utils/formatters';

export function MetricCard({
  label,
  value,
  change,
  changePct,
  changeLabel = 'vs prev close',
  subtitle,
  icon: Icon,
  trend, // 'up' | 'down' | 'neutral'
  className = '',
  tooltip,
}) {
  const isPositive = trend === 'up' || (changePct !== undefined && changePct > 0);
  const isNegative = trend === 'down' || (changePct !== undefined && changePct < 0);
  const isNeutral = !isPositive && !isNegative;

  return (
    <div className={`bg-white rounded-lg border border-sakra-goldLight/70 p-5 shadow-sakra-subtle transition-all duration-200 hover:border-sakra-gold hover:shadow-sakra-card ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-medium tracking-wider uppercase text-sakra-muted flex items-center gap-1.5">
          {label}
          {tooltip && (
            <span className="cursor-help text-sakra-subtle hover:text-sakra-dark" title={tooltip}>
              <Info className="w-3.5 h-3.5" />
            </span>
          )}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-full bg-sakra-cream/60 flex items-center justify-center text-sakra-forest">
            <Icon className="w-4 h-4 text-sakra-forest" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <div className="text-2xl lg:text-3xl font-serif font-semibold text-sakra-dark tabular-nums tracking-tight">
          {value}
        </div>
      </div>

      {(changePct !== undefined || subtitle) && (
        <div className="mt-3 pt-3 border-t border-sakra-goldLight/40 flex items-center justify-between text-xs">
          {changePct !== undefined ? (
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded font-mono font-medium text-xs ${
                  isPositive
                    ? 'bg-emerald-50 text-sakra-gain border border-emerald-200/60'
                    : isNegative
                    ? 'bg-rose-50 text-sakra-loss border border-rose-200/60'
                    : 'bg-stone-100 text-sakra-muted'
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                ) : isNegative ? (
                  <ArrowDownRight className="w-3 h-3 mr-0.5" />
                ) : (
                  <Minus className="w-3 h-3 mr-0.5" />
                )}
                {formatPercent(changePct)}
              </span>
              {changeLabel && <span className="text-sakra-muted text-[11px]">{changeLabel}</span>}
            </div>
          ) : (
            <span className="text-sakra-muted text-[11px]">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
