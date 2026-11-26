/**
 * SAKRA VISION — Formatters for Indian Financial Intelligence Terminal
 */

export function formatINR(val, decimals = 2) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const num = Number(val);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatINRRaw(val, decimals = 2) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const num = Number(val);
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatPercent(val, includeSign = true) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const num = Number(val);
  const formatted = Math.abs(num).toFixed(2) + '%';
  if (!includeSign) return formatted;
  return num > 0 ? `+${formatted}` : num < 0 ? `-${formatted}` : formatted;
}

export function formatCompactINR(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const num = Number(val);
  const abs = Math.abs(num);

  if (abs >= 1e7) {
    // Crores (1 Cr = 10,000,000)
    return `₹${(num / 1e7).toFixed(2)} Cr`;
  } else if (abs >= 1e5) {
    // Lakhs (1 L = 100,000)
    return `₹${(num / 1e5).toFixed(2)} L`;
  } else if (abs >= 1e3) {
    // Thousands
    return `₹${(num / 1e3).toFixed(1)} K`;
  }
  return formatINR(num);
}

export function formatVolume(val) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const num = Number(val);
  if (num >= 1e7) {
    return `${(num / 1e7).toFixed(2)} Cr`;
  } else if (num >= 1e5) {
    return `${(num / 1e5).toFixed(2)} L`;
  } else if (num >= 1e3) {
    return `${(num / 1e3).toFixed(1)} K`;
  }
  return num.toLocaleString('en-IN');
}

export function formatIST(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d) + ' IST';
  } catch {
    return String(dateStr);
  }
}
