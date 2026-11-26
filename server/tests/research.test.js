import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { researchOutputSchema, AIResearchService } from '../src/services/aiResearchService.js';
import { GroqClient, groqClient } from '../src/integrations/groq/groqClient.js';
import { FirecrawlClient, firecrawlClient } from '../src/integrations/firecrawl/firecrawlClient.js';

describe('Phase 4: AI Research & Market Intelligence Suite', () => {

  describe('1. Groq Client Integration & Error Handling', () => {
    it('detects missing API key correctly', () => {
      const client = new GroqClient({ apiKey: '' });
      expect(client.isConfigured()).toBe(false);
    });

    it('detects valid API key configuration', () => {
      const client = new GroqClient({ apiKey: 'gsk_test_key_12345' });
      expect(client.isConfigured()).toBe(true);
    });

    it('returns unconfigured status on checkHealth when key is empty', async () => {
      const client = new GroqClient({ apiKey: '' });
      const health = await client.checkHealth();
      expect(health.configured).toBe(false);
      expect(health.status).toBe('unconfigured');
    });

    it('handles simulated HTTP 429 rate limit gracefully without crashing', async () => {
      const client = new GroqClient({ apiKey: 'gsk_test' });
      const origFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: () => Promise.resolve('Rate limit exceeded'),
        json: () => Promise.resolve({ error: { message: 'TPM Limit exceeded' } }),
      });

      await expect(client.chatCompletion({ messages: [{ role: 'user', content: 'test' }] }))
        .rejects.toThrow();

      global.fetch = origFetch;
    });

    it('handles simulated timeout using AbortController', async () => {
      const client = new GroqClient({ apiKey: 'gsk_test', timeoutMs: 10 });
      const origFetch = global.fetch;
      global.fetch = vi.fn().mockImplementation(() => {
        return new Promise((_, reject) => {
          const err = new Error('The operation was aborted');
          err.name = 'AbortError';
          setTimeout(() => reject(err), 20);
        });
      });

      await expect(client.chatCompletion({ messages: [{ role: 'user', content: 'test' }] }))
        .rejects.toThrow(/timed out/i);

      global.fetch = origFetch;
    });
  });

  describe('2. Firecrawl Web Intelligence & Source Deduplication', () => {
    it('detects unconfigured state when API key is empty', () => {
      const client = new FirecrawlClient({ apiKey: '' });
      expect(client.isConfigured()).toBe(false);
    });

    it('deduplicates sources by URL and normalizes tracking params', async () => {
      const client = new FirecrawlClient({ apiKey: 'fc-test' });
      const origFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: [
            {
              url: 'https://economictimes.indiatimes.com/news/1?utm_source=twitter',
              title: '<b>Reliance Quarterly Results</b>',
              markdown: 'Refining margins improved.<script>alert(1)</script>',
              metadata: { cachedAt: '2026-10-27T10:00:00Z' },
            },
            {
              // Duplicate URL with different query param
              url: 'https://economictimes.indiatimes.com/news/1?utm_medium=email',
              title: 'Reliance Quarterly Results Duplicate',
              markdown: 'Duplicate content',
            },
            {
              url: 'https://www.bseindia.com/filings/doc.pdf',
              title: 'BSE India Official Filing',
              markdown: 'Capital allocation disclosure',
              publishedDate: '2026-10-26',
            },
          ],
        }),
      });

      const res = await client.search('Reliance Industries', { limit: 5 });
      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(2); // Duplicate removed

      // Check sanitization: HTML tags stripped from title
      expect(res.data[0].title).toBe('Reliance Quarterly Results');
      expect(res.data[0].source).toBe('economictimes.indiatimes.com');
      expect(res.data[0].publishedDate).toBe('2026-10-27');
      expect(res.data[0].excerpt).not.toContain('<script>');

      global.fetch = origFetch;
    });

    it('bounds content excerpt size to prevent context overflow', async () => {
      const client = new FirecrawlClient({ apiKey: 'fc-test' });
      const longText = 'A'.repeat(5000);
      const origFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: [
            {
              url: 'https://nseindia.com/announcements',
              title: 'NSE Disclosure',
              markdown: longText,
            },
          ],
        }),
      });

      const res = await client.search('NSE', { limit: 1, maxContentChars: 500 });
      expect(res.data[0].excerpt.length).toBeLessThanOrEqual(500);

      global.fetch = origFetch;
    });

    it('handles empty search results gracefully without fabricating sources', async () => {
      const client = new FirecrawlClient({ apiKey: 'fc-test' });
      const origFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, data: [] }),
      });

      const res = await client.search('XYZ_NON_EXISTENT_SECURITY');
      expect(res.success).toBe(true);
      expect(res.data).toHaveLength(0);

      global.fetch = origFetch;
    });
  });

  describe('3. AI Research Output Schema Validation & Baseline Synthesis', () => {
    it('validates a conformant structured research response', () => {
      const validPayload = {
        summary: 'Institutional synthesis of Reliance Industries indicates stable downstream margins.',
        keyFindings: ['EOD Close at ₹1,405.00', 'Period return +1.80%'],
        bullishFactors: ['Jio telecom ARPU expansion', 'Retail network growth'],
        bearishFactors: ['Petrochemical margin cyclicality'],
        businessRisks: ['Global crude price swings', 'Regulatory spectrum fees'],
        historicalPriceVolumeContext: 'Traded in a tight ₹1,380 - ₹1,410 band with 8.15% annualized volatility.',
        unverifiedOrMissingInformation: ['Forward guidance for next fiscal year pending release'],
        followUpQuestions: ['What is the projected solar gigafactory commissioning timeline?'],
      };

      const result = researchOutputSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      expect(result.data.keyFindings).toHaveLength(2);
      expect(result.data.businessRisks).toHaveLength(2);
    });

    it('rejects an invalid payload missing required summary string', () => {
      const invalidPayload = {
        summary: '',
        keyFindings: [],
      };
      const result = researchOutputSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('generates a deterministic calibrated baseline incorporating real EOD metrics', () => {
      const service = new AIResearchService();
      const baseline = service.generateCalibratedBaseline({
        symbol: 'RELIANCE',
        task: 'comprehensive',
        question: 'Analyze fundamentals',
        historicalContext: {
          available: true,
          symbol: 'RELIANCE',
          latestClose: 1405.00,
          changePct: 0.38,
          periodLow: 1380.20,
          periodHigh: 1410.30,
          periodReturnPct: 1.80,
          averageVolume: 21771386,
          annualizedVolatilityPct: 8.15,
          latestTradeDate: '2025-04-30',
          tradingDaysCount: 11,
          dateRange: { from: '2025-04-15', to: '2025-04-30' },
        },
        sources: [
          {
            title: 'NSE Corporate Announcement',
            url: 'https://nseindia.com',
            source: 'nseindia.com',
            publishedDate: '2025-04-30',
          },
        ],
      });

      expect(baseline.summary).toContain('RELIANCE');
      expect(baseline.summary).toContain('1405');
      expect(baseline.summary).toContain('+1.8%');
      expect(baseline.historicalPriceVolumeContext).toContain('8.15%');
      expect(baseline.keyFindings.length).toBeGreaterThan(0);
      expect(baseline.bullishFactors.length).toBeGreaterThan(0);
      expect(baseline.bearishFactors.length).toBeGreaterThan(0);
      expect(baseline.followUpQuestions.length).toBeGreaterThan(0);
    });
  });

  describe('4. Research API Endpoints Integration (Mocked Providers)', () => {
    beforeEach(() => {
      vi.spyOn(firecrawlClient, 'search').mockResolvedValue({
        success: true,
        data: [
          {
            title: 'HDFC Bank Deposits Surge in Q2',
            url: 'https://economictimes.indiatimes.com/article1',
            source: 'economictimes.indiatimes.com',
            publishedDate: '2026-10-27',
            excerpt: 'Retail deposit mobilization increased 15.8% YoY.',
          },
        ],
      });

      vi.spyOn(groqClient, 'chatCompletion').mockResolvedValue(JSON.stringify({
        summary: 'Rigorous analysis shows resilient operating liquidity and disciplined capital management.',
        keyFindings: ['Deposit mobilization grew double-digits', 'Asset quality remains sound at 1.24% Gross NPA'],
        bullishFactors: ['CASA ratio stabilization', 'Retail cross-sell expansion'],
        bearishFactors: ['Elevated systemic liquidity competition'],
        businessRisks: ['Regulatory liquidity coverage ratio adjustments'],
        historicalPriceVolumeContext: 'Price maintained consolidation above 50-day moving average.',
        unverifiedOrMissingInformation: ['Full consolidated subsidiaries breakdown pending release'],
        followUpQuestions: ['What is the targeted deposit cost for the coming fiscal quarter?'],
      }));
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('GET /api/research/health returns 200 with provider operational status', async () => {
      const res = await request(app).get('/api/research/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('operational');
      expect(res.body.providers).toBeDefined();
      expect(res.body.providers.historicalEOD).toBeDefined();
      expect(res.body.supportedTasks).toContain('comprehensive');
      expect(res.body.supportedTasks).toContain('bull_bear');
    });

    it('POST /api/research/company rejects invalid symbol with 400', async () => {
      const res = await request(app)
        .post('/api/research/company')
        .send({ symbol: 'INVALID<SCRIPT>BAD' });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/research/company accepts valid symbol and returns structured synthesis', async () => {
      const res = await request(app)
        .post('/api/research/company')
        .send({ symbol: 'RELIANCE', task: 'overview' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.summary).toBeDefined();
      expect(Array.isArray(res.body.keyFindings)).toBe(true);
      expect(Array.isArray(res.body.bullishFactors)).toBe(true);
      expect(Array.isArray(res.body.bearishFactors)).toBe(true);
      expect(res.body.historicalDataContext).toBeDefined();
      expect(Array.isArray(res.body.sources)).toBe(true);
      expect(Array.isArray(res.body.dataLimitations)).toBe(true);
    });

    it('POST /api/research/news returns news synthesis for Indian equities query', async () => {
      const res = await request(app)
        .post('/api/research/news')
        .send({ query: 'HDFC Bank deposit growth', limit: 3 });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.summary).toBeDefined();
      expect(res.body.sources).toBeDefined();
    });

    it('POST /api/research/analyze rejects question under 3 characters with 400', async () => {
      const res = await request(app)
        .post('/api/research/analyze')
        .send({ question: 'Hi' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });

    it('POST /api/research/analyze executes custom research inquiry and separates EOD data from AI interpretation', async () => {
      const res = await request(app)
        .post('/api/research/analyze')
        .send({
          question: 'What are the main risks facing telecom revenue growth?',
          symbol: 'BHARTIARTL',
          task: 'risks',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.query.task).toBe('risks');
      expect(Array.isArray(res.body.businessRisks)).toBe(true);
      expect(res.body.providerStatus).toBeDefined();
    });
  });

});
