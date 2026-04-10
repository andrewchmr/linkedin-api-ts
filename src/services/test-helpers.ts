import { vi } from 'vitest';
import { FetcherService } from './FetcherService';

export function createMockFetcher() {
  return {
    get: vi.fn(),
  } as unknown as FetcherService;
}
