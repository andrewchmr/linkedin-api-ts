import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { FetcherService } from './FetcherService';
import { LinkedInConfig } from '../config/LinkedInConfig';
import { ResourceType } from '../enums/ResourceType';
import { SessionExpiredError } from '../errors/SessionExpiredError';
import { RateLimitError } from '../errors/RateLimitError';
import { ProfileNotFoundError } from '../errors/ProfileNotFoundError';
import { encodeApiKey } from '../utils/cookies';

const mockFetch = vi.fn();
vi.mock('impit', () => ({
  Impit: class MockImpit {
    fetch = mockFetch;
  },
}));

function createService(overrides: Partial<ConstructorParameters<typeof LinkedInConfig>[0]> = {}) {
  const apiKey = encodeApiKey({ li_at: 'test_token', JSESSIONID: 'ajax:csrf123' });
  const config = new LinkedInConfig({
    apiKey,
    delay: 0,
    maxRetries: 3,
    timeout: 5000,
    ...overrides,
  });
  return new FetcherService(config);
}

function fakeResponse(status: number, body: unknown = {}) {
  return {
    status,
    json: () => Promise.resolve(body),
  };
}

function mockSequence(
  responses: Array<{
    status?: number;
    body?: unknown;
    error?: Error;
  }>,
) {
  let i = 0;
  mockFetch.mockImplementation(() => {
    const r = responses[i] ?? responses[responses.length - 1];
    i++;
    if (r.error) return Promise.reject(r.error);
    return Promise.resolve(fakeResponse(r.status ?? 200, r.body ?? {}));
  });
}

describe('FetcherService', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('makes GET request and returns parsed JSON', async () => {
    const service = createService();
    const responseBody = { data: 'test' };

    mockFetch.mockResolvedValue(fakeResponse(200, responseBody));

    const result = await service.get(ResourceType.ME);
    expect(result).toEqual(responseBody);
  });

  test('substitutes URL parameters', async () => {
    const service = createService();
    mockFetch.mockResolvedValue(fakeResponse(200, {}));

    await service.get(ResourceType.PROFILE_BY_USERNAME, { username: 'johndoe' });

    const urls = mockFetch.mock.calls.map((c: any) => c[0]);
    expect(urls.some((u: string) => u.includes('memberIdentity=johndoe'))).toBe(true);
  });

  test('throws SessionExpiredError on 401', async () => {
    const service = createService();
    mockSequence([{ status: 401 }]);

    await expect(service.get(ResourceType.ME)).rejects.toThrow(SessionExpiredError);
  });

  test('throws SessionExpiredError on 403', async () => {
    const service = createService();
    mockSequence([{ status: 403 }]);

    await expect(service.get(ResourceType.ME)).rejects.toThrow(SessionExpiredError);
  });

  test('throws RateLimitError on 429', async () => {
    const service = createService();
    mockSequence([{ status: 429 }]);

    await expect(service.get(ResourceType.ME)).rejects.toThrow(RateLimitError);
  });

  test('throws ProfileNotFoundError on 404 with username', async () => {
    const service = createService();
    mockSequence([{ status: 404 }]);

    await expect(
      service.get(ResourceType.PROFILE_BY_USERNAME, { username: 'nobody' }),
    ).rejects.toThrow(ProfileNotFoundError);
  });

  test('throws generic error on 404 without username pattern', async () => {
    const service = createService({ maxRetries: 1 });
    mockSequence([{ status: 404 }]);

    await expect(service.get(ResourceType.ME)).rejects.toThrow('Resource not found');
  });

  test('retries on 500 errors', async () => {
    const service = createService();
    mockSequence([{ status: 500 }, { status: 200, body: { ok: true } }]);

    const result = await service.get(ResourceType.ME);
    expect(result).toEqual({ ok: true });
  });

  test('retries on network errors', async () => {
    const service = createService();
    mockSequence([{ error: new Error('ECONNRESET') }, { status: 200, body: { ok: true } }]);

    const result = await service.get(ResourceType.ME);
    expect(result).toEqual({ ok: true });
  });

  test('does not retry SessionExpiredError', async () => {
    const service = createService();
    mockSequence([{ status: 401 }]);

    await expect(service.get(ResourceType.ME)).rejects.toThrow(SessionExpiredError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('does not retry RateLimitError', async () => {
    const service = createService();
    mockSequence([{ status: 429 }]);

    await expect(service.get(ResourceType.ME)).rejects.toThrow(RateLimitError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('throws error without API key', async () => {
    const config = new LinkedInConfig({ delay: 0 });
    const service = new FetcherService(config);

    await expect(service.get(ResourceType.ME)).rejects.toThrow('API key is required');
  });

  test('does not perform a warm-up navigation to /feed/', async () => {
    const service = createService();
    mockFetch.mockResolvedValue(fakeResponse(200, { data: 'test' }));

    await service.get(ResourceType.ME);
    await service.get(ResourceType.ME);

    const feedCalls = mockFetch.mock.calls.filter((c: any) => c[0].includes('/feed/'));
    expect(feedCalls.length).toBe(0);
  });
});
