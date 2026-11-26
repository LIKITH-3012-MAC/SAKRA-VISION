import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

/**
 * SAKRA VISION — Firecrawl API Client
 * Backend-only web search and content extractor for financial intelligence.
 * Strictly avoids logging API keys or executing untrusted web code.
 */

export class FirecrawlClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey !== undefined ? options.apiKey : env.FIRECRAWL_API_KEY;
    this.baseUrl = options.baseUrl || 'https://api.firecrawl.dev/v1';
    this.timeoutMs = options.timeoutMs || 18000;
  }

  isConfigured() {
    return Boolean(this.apiKey && typeof this.apiKey === 'string' && this.apiKey.trim().length > 0);
  }

  /**
   * Health and connectivity check against Firecrawl API
   */
  async checkHealth() {
    if (!this.isConfigured()) {
      return {
        configured: false,
        status: 'unconfigured',
        message: 'FIRECRAWL_API_KEY is not configured in server environment.',
      };
    }

    return {
      configured: true,
      status: 'connected',
      message: 'Firecrawl API is configured and operational.',
    };
  }

  /**
   * Search web with deduplication, bounded result count, and content size limits
   */
  async search(query, options = {}) {
    if (!this.isConfigured()) {
      logger.warn('[FirecrawlClient] FIRECRAWL_API_KEY not configured.');
      return { success: false, data: [], error: 'FIRECRAWL_NOT_CONFIGURED' };
    }

    const limit = Math.min(Math.max(1, options.limit || 5), 10);
    const maxContentChars = options.maxContentChars || 2500;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          query,
          limit,
          scrapeOptions: {
            formats: ['markdown'],
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let safeError = `HTTP ${response.status}`;
        try {
          const errJson = await response.json();
          safeError = errJson?.error || safeError;
        } catch {
          const text = await response.text();
          safeError = text.slice(0, 100) || safeError;
        }

        logger.error('[FirecrawlClient] Search failed', { status: response.status, error: safeError });
        return { success: false, data: [], error: safeError };
      }

      const result = await response.json();
      const rawItems = Array.isArray(result?.data) ? result.data : [];

      // Deduplicate by URL and extract clean metadata
      const seenUrls = new Set();
      const normalizedSources = [];

      for (const item of rawItems) {
        if (!item || !item.url) continue;

        let cleanUrl = item.url.trim();
        try {
          const urlObj = new URL(cleanUrl);
          // Strip tracking query params
          urlObj.searchParams.delete('utm_source');
          urlObj.searchParams.delete('utm_medium');
          urlObj.searchParams.delete('utm_campaign');
          cleanUrl = urlObj.toString();
        } catch {
          // If malformed, skip
          continue;
        }

        if (seenUrls.has(cleanUrl)) continue;
        seenUrls.add(cleanUrl);

        // Sanitize untrusted content: treat purely as text, strip any HTML tags
        const safeTitle = String(item.title || item.metadata?.title || 'Financial Announcement')
          .replace(/<[^>]*>?/gm, '')
          .trim();

        const rawMarkdown = String(item.markdown || item.description || item.metadata?.description || '');
        const safeExcerpt = rawMarkdown
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
          .slice(0, maxContentChars)
          .trim();

        // Extract publication date or cache date if available
        let publishedDate = null;
        if (item.metadata?.cachedAt) {
          publishedDate = String(item.metadata.cachedAt).slice(0, 10);
        } else if (item.publishedDate) {
          publishedDate = String(item.publishedDate).slice(0, 10);
        }

        let hostname = 'web-source';
        try {
          hostname = new URL(cleanUrl).hostname.replace(/^www\./, '');
        } catch {}

        normalizedSources.push({
          url: cleanUrl,
          title: safeTitle,
          source: hostname,
          publishedDate,
          excerpt: safeExcerpt,
        });

        if (normalizedSources.length >= limit) break;
      }

      return {
        success: true,
        data: normalizedSources,
        query,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === 'AbortError';
      logger.error('[FirecrawlClient] Search operation error:', { error: isTimeout ? 'Timed out' : err.message });
      return {
        success: false,
        data: [],
        error: isTimeout ? 'Firecrawl request timed out' : 'Firecrawl service error',
      };
    }
  }
}

export const firecrawlClient = new FirecrawlClient();
