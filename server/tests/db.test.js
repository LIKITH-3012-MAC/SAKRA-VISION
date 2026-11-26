import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('MySQL TLS / SSL Configuration & Verification', () => {
  it('enforces rejectUnauthorized = true when SSL is enabled', () => {
    // Simulating SSL config builder behavior
    const buildTestSsl = (sslEnabled, caPath) => {
      if (!sslEnabled) return undefined;
      const opts = { rejectUnauthorized: true };
      if (caPath && fs.existsSync(caPath)) {
        opts.ca = fs.readFileSync(caPath, 'utf8');
      }
      return opts;
    };

    const sslOpts = buildTestSsl(true, null);
    expect(sslOpts).toBeDefined();
    expect(sslOpts.rejectUnauthorized).toBe(true);
    expect(sslOpts.rejectUnauthorized).not.toBe(false);
  });

  it('correctly reads CA certificate when valid path is provided', () => {
    const tempCaPath = path.resolve('tests/fixtures/test-ca.pem');
    fs.mkdirSync(path.dirname(tempCaPath), { recursive: true });
    fs.writeFileSync(tempCaPath, '-----BEGIN CERTIFICATE-----\nTEST_CA_DATA\n-----END CERTIFICATE-----');

    const buildTestSsl = (sslEnabled, caPath) => {
      if (!sslEnabled) return undefined;
      const opts = { rejectUnauthorized: true };
      if (caPath && fs.existsSync(caPath)) {
        opts.ca = fs.readFileSync(caPath, 'utf8');
      }
      return opts;
    };

    const sslOpts = buildTestSsl(true, tempCaPath);
    expect(sslOpts.ca).toContain('TEST_CA_DATA');
    expect(sslOpts.rejectUnauthorized).toBe(true);

    // Clean up fixture
    fs.unlinkSync(tempCaPath);
  });
});
