import { describe, test, expect, vi, beforeEach } from 'vitest';
import { AuthService } from './AuthService';
import { FetcherService } from '../services/FetcherService';
import { ResourceType } from '../enums/ResourceType';
import { createMockFetcher } from '../services/test-helpers';

describe('AuthService', () => {
  let fetcher: FetcherService;
  let service: AuthService;

  beforeEach(() => {
    fetcher = createMockFetcher();
    service = new AuthService(fetcher);
  });

  test('returns true when session is valid', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue({ sub: '12345' });

    const result = await service.verify();

    expect(result).toBe(true);
    expect(fetcher.get).toHaveBeenCalledWith(ResourceType.ME);
  });

  test('returns false when session is expired', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('401'));

    const result = await service.verify();

    expect(result).toBe(false);
  });
});
