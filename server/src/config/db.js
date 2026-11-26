import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let pool = null;
let isDbConnected = false;
let lastConnectionError = null;
let sslDiagnostics = {
  enabled: env.DB_SSL,
  caConfigured: Boolean(env.DB_SSL_CA_PATH),
  caPath: env.DB_SSL_CA_PATH || null,
  caFound: false,
};

/**
 * Configure TLS/SSL options strictly for Aiven Cloud MySQL
 */
function buildSslOptions() {
  if (!env.DB_SSL) {
    return undefined;
  }

  const sslOpts = {
    // Strictly require certificate verification (never false)
    rejectUnauthorized: true,
  };

  if (env.DB_SSL_CA_PATH) {
    const resolvedPath = path.isAbsolute(env.DB_SSL_CA_PATH)
      ? env.DB_SSL_CA_PATH
      : path.resolve(process.cwd(), env.DB_SSL_CA_PATH);

    if (fs.existsSync(resolvedPath)) {
      try {
        sslOpts.ca = fs.readFileSync(resolvedPath, 'utf8');
        sslDiagnostics.caFound = true;
        sslDiagnostics.caPath = resolvedPath;
        logger.info('Loaded MySQL TLS CA certificate for verification', { caPath: resolvedPath });
      } catch (err) {
        sslDiagnostics.caFound = false;
        logger.error('Failed to read MySQL CA certificate from DB_SSL_CA_PATH', {
          caPath: resolvedPath,
          error: err.message,
        });
      }
    } else {
      sslDiagnostics.caFound = false;
      sslDiagnostics.caPath = resolvedPath;
      logger.warn('Specified DB_SSL_CA_PATH file does not exist. TLS certificate verification will fail if Aiven CA is required.', {
        caPath: resolvedPath,
      });
    }
  }

  return sslOpts;
}

try {
  const sslOptions = buildSslOptions();

  pool = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 8000,
    decimalNumbers: true,
    ssl: sslOptions,
  });

  logger.info('Initialized MySQL connection pool', {
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    sslEnabled: env.DB_SSL,
    caConfigured: sslDiagnostics.caConfigured,
  });
} catch (err) {
  isDbConnected = false;
  lastConnectionError = err.message;
  logger.error('Failed to initialize MySQL pool', { error: err.message });
}

/**
 * Actively test database connectivity with live ping and latency timing
 */
export async function testConnection() {
  if (!pool) {
    return {
      connected: false,
      status: 'uninitialized',
      error: 'Database connection pool is not initialized.',
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      ssl: sslDiagnostics,
      missingPrerequisites: [
        'Initialize database configuration in .env',
      ],
    };
  }

  const start = Date.now();
  try {
    const conn = await pool.getConnection();
    const latencyMs = Date.now() - start;

    try {
      const [rows] = await conn.query('SELECT 1 AS ok, NOW() AS server_time, VERSION() AS version');
      conn.release();

      isDbConnected = true;
      lastConnectionError = null;

      const serverInfo = rows && rows[0] ? rows[0] : {};

      return {
        connected: true,
        status: 'healthy',
        latencyMs,
        host: env.DB_HOST,
        port: env.DB_PORT,
        database: env.DB_NAME,
        serverTime: serverInfo.server_time || null,
        mysqlVersion: serverInfo.version || 'Unknown',
        ssl: {
          enabled: env.DB_SSL,
          rejectUnauthorized: true,
          caConfigured: sslDiagnostics.caConfigured,
        },
      };
    } catch (queryErr) {
      conn.release();
      throw queryErr;
    }
  } catch (err) {
    isDbConnected = false;
    lastConnectionError = err.message;

    // Diagnose missing prerequisites safely without leaking credentials
    const missingPrerequisites = [];

    if (env.DB_SSL && env.DB_SSL_CA_PATH && !sslDiagnostics.caFound) {
      missingPrerequisites.push(
        `Aiven CA Certificate missing or unreadable at DB_SSL_CA_PATH: "${sslDiagnostics.caPath}". Download the Aiven Project CA certificate and save to this path.`
      );
    } else if (env.DB_SSL && !env.DB_SSL_CA_PATH) {
      missingPrerequisites.push(
        'DB_SSL is enabled but DB_SSL_CA_PATH is not set. Aiven requires the Project CA certificate for verified TLS connections.'
      );
    }

    if (env.DB_HOST === 'localhost' || env.DB_HOST === '127.0.0.1') {
      missingPrerequisites.push(
        'Localhost configured for database. For Aiven Cloud MySQL, set DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD in server/.env.'
      );
    }

    if (!env.DB_PASSWORD) {
      missingPrerequisites.push('DB_PASSWORD is empty in server/.env.');
    }

    return {
      connected: false,
      status: 'disconnected',
      code: err.code || 'DB_CONNECTION_FAILED',
      error: err.message,
      host: env.DB_HOST,
      port: env.DB_PORT,
      database: env.DB_NAME,
      ssl: sslDiagnostics,
      missingPrerequisites: missingPrerequisites.length > 0 ? missingPrerequisites : [
        'Check network connectivity and verify Aiven MySQL credentials in server/.env.',
      ],
    };
  }
}

// Initial async connectivity check on module load
testConnection().then((res) => {
  if (res.connected) {
    logger.info('MySQL Database connection verified successfully', {
      host: res.host,
      latencyMs: res.latencyMs,
      mysqlVersion: res.mysqlVersion,
    });
  } else {
    logger.warn('Initial MySQL connection check failed. Server will continue in resilient mode.', {
      code: res.code,
      error: res.error,
      missingPrerequisites: res.missingPrerequisites,
    });
  }
});

export { pool, isDbConnected };

export async function query(sql, params = []) {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return await pool.query(sql, params);
}
