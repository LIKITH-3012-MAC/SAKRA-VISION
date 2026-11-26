/**
 * SAKRA VISION — Structured Logger with Guaranteed Secret Redaction
 */

const SECRET_PATTERNS = [
  'password',
  'secret',
  'key',
  'token',
  'auth',
  'bearer',
  'cookie',
  'authorization',
  'credential',
  'cert',
  'private_key',
  'groq',
  'firecrawl',
  'groww',
  'aiven',
];

export function redactSecrets(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redactSecrets);

  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    const isSecret = SECRET_PATTERNS.some((pattern) => k.toLowerCase().includes(pattern));
    if (isSecret && typeof v === 'string') {
      clean[k] = v ? '***REDACTED***' : '';
    } else if (typeof v === 'object' && v !== null) {
      clean[k] = redactSecrets(v);
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

export const logger = {
  info: (msg, meta = {}) => {
    console.log(
      JSON.stringify({
        level: 'INFO',
        timestamp: new Date().toISOString(),
        message: msg,
        ...redactSecrets(meta),
      })
    );
  },
  warn: (msg, meta = {}) => {
    console.warn(
      JSON.stringify({
        level: 'WARN',
        timestamp: new Date().toISOString(),
        message: msg,
        ...redactSecrets(meta),
      })
    );
  },
  error: (msg, meta = {}) => {
    console.error(
      JSON.stringify({
        level: 'ERROR',
        timestamp: new Date().toISOString(),
        message: msg,
        stack: meta.stack || undefined,
        ...redactSecrets(meta),
      })
    );
  },
};
