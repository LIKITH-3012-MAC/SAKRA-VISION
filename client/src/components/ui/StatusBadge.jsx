import React from 'react';

export function StatusBadge({ status, label, size = 'sm' }) {
  const normalized = (status || label || '').toLowerCase();
  
  let styles = 'bg-stone-100 text-sakra-muted border-stone-200';
  let dotColor = 'bg-stone-400';

  if (normalized.includes('bull') || normalized.includes('gain') || normalized.includes('accumulate') || normalized.includes('positive') || normalized.includes('open')) {
    styles = 'bg-emerald-50 text-sakra-gain border-emerald-200/80';
    dotColor = 'bg-sakra-gain';
  } else if (normalized.includes('bear') || normalized.includes('loss') || normalized.includes('caution') || normalized.includes('negative') || normalized.includes('closed')) {
    styles = 'bg-rose-50 text-sakra-loss border-rose-200/80';
    dotColor = 'bg-sakra-loss';
  } else if (normalized.includes('neutral') || normalized.includes('hold') || normalized.includes('consolidat')) {
    styles = 'bg-amber-50 text-amber-800 border-amber-200/80';
    dotColor = 'bg-amber-500';
  } else if (normalized.includes('ai') || normalized.includes('insight') || normalized.includes('intel')) {
    styles = 'bg-sakra-forest/10 text-sakra-forest border-sakra-goldLight';
    dotColor = 'bg-sakra-gold';
  } else if (normalized.includes('live') || normalized.includes('connected')) {
    styles = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    dotColor = 'bg-emerald-500 animate-pulse';
  } else if (normalized.includes('demo') || normalized.includes('historical') || normalized.includes('sample')) {
    styles = 'bg-amber-50 text-amber-900 border-amber-300/70';
    dotColor = 'bg-amber-500';
  }

  const sizeClasses = size === 'xs' 
    ? 'text-[10px] px-1.5 py-0.5 gap-1' 
    : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${sizeClasses} ${styles}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      <span>{label || status}</span>
    </span>
  );
}

export function DataFreshnessLabel({ source = 'NSE Bhavcopy', timestamp, mode = 'DEMO' }) {
  return (
    <div className="flex items-center gap-2 text-xs text-sakra-muted">
      <span className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${mode === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
        <span className="font-medium text-sakra-dark">{mode === 'CONNECTED' ? 'LIVE CONNECTED' : 'HISTORICAL / DEMO'}</span>
      </span>
      <span>•</span>
      <span>Source: <strong className="font-medium text-sakra-forest">{source}</strong></span>
      {timestamp && (
        <>
          <span>•</span>
          <span className="font-mono text-[11px]">{timestamp}</span>
        </>
      )}
    </div>
  );
}

export function SourceAttribution({ source, url, timestamp, author }) {
  return (
    <div className="flex items-center flex-wrap gap-2 text-xs text-sakra-muted pt-2 border-t border-sakra-goldLight/40">
      <span>Source:</span>
      {url ? (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sakra-forest font-medium hover:text-sakra-gold hover:underline transition-colors flex items-center gap-1"
        >
          {source || 'External Research'} ↗
        </a>
      ) : (
        <span className="font-medium text-sakra-dark">{source || 'NSE / BSE Public Filings'}</span>
      )}
      {author && <span>• {author}</span>}
      {timestamp && <span>• <time className="font-mono text-[11px]">{timestamp}</time></span>}
    </div>
  );
}

export function LoadingSkeleton({ rows = 4, className = '' }) {
  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-sakra-cream/60 rounded border border-sakra-goldLight/40" />
      ))}
    </div>
  );
}

export function EmptyState({ title, description, action, icon: Icon }) {
  return (
    <div className="py-12 px-4 text-center max-w-md mx-auto">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-sakra-cream/80 text-sakra-gold flex items-center justify-center mx-auto mb-4 border border-sakra-goldLight">
          <Icon className="w-6 h-6 text-sakra-forest" />
        </div>
      )}
      <h4 className="font-serif text-lg font-semibold text-sakra-dark mb-1">{title}</h4>
      <p className="text-sm text-sakra-muted mb-5 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
