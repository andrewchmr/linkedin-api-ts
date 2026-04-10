import { Impit } from 'impit';
import { LinkedInConfig } from '../config/LinkedInConfig';
import { decodeApiKey } from '../utils/cookies';
import { buildHeaders } from '../utils/headers';
import { SessionExpiredError } from '../errors/SessionExpiredError';
import { RateLimitError } from '../errors/RateLimitError';
import { ProfileNotFoundError } from '../errors/ProfileNotFoundError';
import { ResourceType } from '../enums/ResourceType';

export class FetcherService {
  private readonly config: LinkedInConfig;
  private lastRequestTime = 0;
  private impit: Impit;
  private cachedHeaders: Record<string, string> | null = null;
  private cachedApiKey: string | undefined;

  private static readonly BASE_URL = 'https://www.linkedin.com';

  constructor(config: LinkedInConfig) {
    this.config = config;
    this.impit = new Impit({ browser: 'chrome' });
  }

  async get<T = unknown>(resource: ResourceType, params: Record<string, string> = {}): Promise<T> {
    let url = resource as string;
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`{${key}}`, encodeURIComponent(value));
    }

    return this.request<T>(`${FetcherService.BASE_URL}${url}`);
  }

  private getHeaders(): Record<string, string> {
    const currentKey = this.config.apiKey;
    if (!currentKey) {
      throw new Error('API key is required. Provide a base64-encoded li_at cookie.');
    }

    if (this.cachedHeaders && this.cachedApiKey === currentKey) {
      return this.cachedHeaders;
    }

    const cookies = decodeApiKey(currentKey);
    this.cachedHeaders = buildHeaders(cookies);
    this.cachedApiKey = currentKey;
    return this.cachedHeaders;
  }

  private async request<T>(url: string, attempt = 1): Promise<T> {
    await this.respectDelay();

    const headers = this.getHeaders();

    this.log(`GET ${url}`);

    try {
      const response = await this.impit.fetch(url, {
        method: 'GET',
        headers,
        timeout: this.config.timeout,
      });

      const statusCode = response.status;

      if (statusCode >= 200 && statusCode < 300) {
        return (await response.json()) as T;
      }

      this.handleErrorResponse(statusCode, url);

      if (attempt < this.config.maxRetries && statusCode >= 500) {
        return this.retry<T>(url, attempt, `Server error ${statusCode}`);
      }

      throw new Error(`LinkedIn API error: ${statusCode}`);
    } catch (err) {
      if (
        err instanceof SessionExpiredError ||
        err instanceof RateLimitError ||
        err instanceof ProfileNotFoundError
      ) {
        throw err;
      }

      if (attempt < this.config.maxRetries) {
        return this.retry<T>(url, attempt, 'Request failed');
      }
      throw err;
    }
  }

  private async retry<T>(url: string, attempt: number, reason: string): Promise<T> {
    const backoff = Math.min(1000 * 2 ** attempt, 10000);
    this.log(`${reason}, retrying in ${backoff}ms (attempt ${attempt + 1})`);
    await this.sleep(backoff);
    return this.request<T>(url, attempt + 1);
  }

  private handleErrorResponse(statusCode: number, url: string): never | void {
    switch (statusCode) {
      case 401:
      case 403:
        throw new SessionExpiredError();
      case 429:
        throw new RateLimitError();
      case 404: {
        const usernameMatch = url.match(/memberIdentity=([^&]+)/);
        if (usernameMatch) {
          throw new ProfileNotFoundError(decodeURIComponent(usernameMatch[1]));
        }
        throw new Error(`Resource not found: ${url}`);
      }
    }
  }

  private async respectDelay(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.config.delay) {
      await this.sleep(this.config.delay - elapsed);
    }
    this.lastRequestTime = Date.now();
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private log(message: string): void {
    if (this.config.logging) {
      console.log(`[linkedin-api] ${message}`);
    }
  }
}
