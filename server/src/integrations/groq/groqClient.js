import { env } from '../../config/env.js';
import { logger } from '../../utils/logger.js';

/**
 * SAKRA VISION — Groq API Client (Official Groq API Endpoint)
 * Strictly backend-only. Never expose API key to client or logs.
 * Strictly NO Ollama, Python, Java, or Spring Boot.
 */

export class GroqClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey !== undefined ? options.apiKey : env.GROQ_API_KEY;
    this.model = options.model || env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    this.baseUrl = options.baseUrl || env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
    this.timeoutMs = options.timeoutMs || 25000;
  }

  isConfigured() {
    return Boolean(this.apiKey && typeof this.apiKey === 'string' && this.apiKey.trim().length > 0);
  }

  /**
   * Health and connectivity check against Groq API
   */
  async checkHealth() {
    if (!this.isConfigured()) {
      return {
        configured: false,
        status: 'unconfigured',
        model: this.model,
        message: 'GROQ_API_KEY is not configured in server environment.',
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return {
          configured: true,
          status: 'connected',
          model: this.model,
          message: 'Groq Cloud API is operational and authenticated.',
        };
      }

      return {
        configured: true,
        status: 'error',
        model: this.model,
        message: `Groq authentication returned HTTP ${response.status}`,
      };
    } catch (err) {
      clearTimeout(timeoutId);
      return {
        configured: true,
        status: 'unreachable',
        model: this.model,
        message: err.name === 'AbortError' ? 'Groq health check timed out' : 'Unable to connect to Groq endpoint',
      };
    }
  }

  /**
   * Execute chat completion with JSON mode support and strict timeout
   */
  async chatCompletion({ messages, temperature = 0.2, responseFormat = null, maxTokens = 2000 }) {
    if (!this.isConfigured()) {
      logger.warn('[GroqClient] GROQ_API_KEY is not set.');
      return null;
    }

    const candidateModels = Array.from(new Set([
      this.model,
      'openai/gpt-oss-20b',
      'openai/gpt-oss-120b',
      'qwen/qwen3.8-27b',
    ]));

    let lastError = null;

    for (const modelToTry of candidateModels) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const body = {
        model: modelToTry,
        messages,
        temperature,
        max_tokens: maxTokens,
      };

      if (responseFormat) {
        body.response_format = responseFormat;
      }

      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          let safeError = `HTTP ${response.status}`;
          try {
            const errJson = await response.json();
            safeError = errJson?.error?.message || safeError;
          } catch {
            const text = await response.text();
            safeError = text.slice(0, 150) || safeError;
          }

          // If model was not found (404) or rate-limited on specific tier (429), try next candidate
          if (response.status === 404 || response.status === 429) {
            logger.warn(`[GroqClient] Model ${modelToTry} returned HTTP ${response.status}, attempting fallback...`);
            lastError = new Error(response.status === 429 ? 'Groq API rate limit reached' : `Groq model ${modelToTry} not found`);
            continue;
          }

          logger.error('[GroqClient] API request returned error status', {
            status: response.status,
            model: modelToTry,
            errorMessage: safeError,
          });

          if (response.status === 503) {
            throw new Error('Groq AI service is temporarily unavailable. Please retry later.');
          } else if (response.status === 401) {
            throw new Error('Groq API key authentication failed. Please check credentials.');
          }

          throw new Error(`Groq API error (${response.status}): ${safeError}`);
        }

        const data = await response.json();
        // Update model to active working model
        this.model = modelToTry;
        return data.choices?.[0]?.message?.content || null;
      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          logger.error(`[GroqClient] Request timed out after ${this.timeoutMs}ms`);
          throw new Error(`Groq API request timed out after ${this.timeoutMs / 1000}s`);
        }
        if ((err.message?.includes('not found') || err.message?.includes('rate limit')) && candidateModels.indexOf(modelToTry) < candidateModels.length - 1) {
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('No compatible Groq model available on this account.');
  }
}

export const groqClient = new GroqClient();
