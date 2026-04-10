import { describe, test, expect, vi, beforeEach } from 'vitest';
import { SearchService } from './SearchService';
import { FetcherService } from './FetcherService';
import { SearchResult } from '../models/SearchResult';
import { VoyagerSearchResponse } from '../types/voyager';
import { createMockFetcher } from './test-helpers';

function buildSearchResponse(
  overrides: {
    entities?: Array<Record<string, unknown>>;
    paging?: { total?: number; start?: number; count?: number };
    nestedData?: boolean;
  } = {},
): VoyagerSearchResponse {
  const { entities = [], paging = {}, nestedData = false } = overrides;

  const included = entities.map((entity) => ({
    $type: 'com.linkedin.voyager.dash.search.EntityResultViewModel',
    ...entity,
  }));

  const clusters = { paging };

  return {
    included,
    data: nestedData
      ? { data: { searchDashClustersByAll: clusters } }
      : { searchDashClustersByAll: clusters },
  };
}

describe('SearchService', () => {
  let fetcher: FetcherService;
  let service: SearchService;

  beforeEach(() => {
    fetcher = createMockFetcher();
    service = new SearchService(fetcher);
  });

  test('calls fetcher with keywords and default start', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(buildSearchResponse());

    await service.people('software engineer');

    expect(fetcher.get).toHaveBeenCalledWith(expect.stringContaining('Search'), {
      keywords: 'software engineer',
      start: '0',
    });
  });

  test('passes custom start option', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(buildSearchResponse());

    await service.people('engineer', { start: 10 });

    expect(fetcher.get).toHaveBeenCalledWith(expect.anything(), {
      keywords: 'engineer',
      start: '10',
    });
  });

  test('parses search results with person details', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildSearchResponse({
        entities: [
          {
            title: { text: 'Jane Doe' },
            primarySubtitle: { text: 'CEO at Acme' },
            secondarySubtitle: { text: 'New York' },
            navigationUrl: 'https://www.linkedin.com/in/janedoe?miniProfileUrn=xxx',
          },
        ],
        paging: { total: 100, start: 0, count: 10 },
      }),
    );

    const result = await service.people('jane');

    expect(result).toBeInstanceOf(SearchResult);
    expect(result.results).toHaveLength(1);
    expect(result.results[0].fullName).toBe('Jane Doe');
    expect(result.results[0].headline).toBe('CEO at Acme');
    expect(result.results[0].location).toBe('New York');
    expect(result.results[0].profileUrl).toBe('https://www.linkedin.com/in/janedoe');
    expect(result.results[0].username).toBe('janedoe');
    expect(result.total).toBe(100);
    expect(result.start).toBe(0);
    expect(result.count).toBe(10);
  });

  test('extracts username from profile URL', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildSearchResponse({
        entities: [
          {
            title: { text: 'Bob' },
            navigationUrl: 'https://www.linkedin.com/in/bob-smith',
          },
        ],
      }),
    );

    const result = await service.people('bob');
    expect(result.results[0].username).toBe('bob-smith');
  });

  test('returns null username when URL has no /in/ pattern', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildSearchResponse({
        entities: [
          {
            title: { text: 'Unknown' },
            navigationUrl: 'https://www.linkedin.com/company/acme',
          },
        ],
      }),
    );

    const result = await service.people('unknown');
    expect(result.results[0].username).toBeNull();
  });

  test('uses navigationContext.url as fallback', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildSearchResponse({
        entities: [
          {
            title: { text: 'Alice' },
            navigationContext: { url: 'https://www.linkedin.com/in/alice?trk=abc' },
          },
        ],
      }),
    );

    const result = await service.people('alice');
    expect(result.results[0].profileUrl).toBe('https://www.linkedin.com/in/alice');
    expect(result.results[0].username).toBe('alice');
  });

  test('extracts profile picture from nonEntityProfilePicture', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildSearchResponse({
        entities: [
          {
            title: { text: 'User' },
            navigationUrl: 'https://www.linkedin.com/in/user',
            image: {
              attributes: [
                {
                  detailData: {
                    nonEntityProfilePicture: {
                      vectorImage: {
                        rootUrl: 'https://media.licdn.com/',
                        artifacts: [{ fileIdentifyingUrlPathSegment: 'pic.jpg' }],
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      }),
    );

    const result = await service.people('user');
    expect(result.results[0].profilePicture).toBe('https://media.licdn.com/pic.jpg');
  });

  test('extracts profile picture from profilePicture fallback', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildSearchResponse({
        entities: [
          {
            title: { text: 'User' },
            navigationUrl: 'https://www.linkedin.com/in/user',
            image: {
              attributes: [
                {
                  detailData: {
                    profilePicture: {
                      vectorImage: {
                        rootUrl: 'https://media.licdn.com/',
                        artifacts: [{ fileIdentifyingUrlPathSegment: 'pic2.jpg' }],
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      }),
    );

    const result = await service.people('user');
    expect(result.results[0].profilePicture).toBe('https://media.licdn.com/pic2.jpg');
  });

  test('returns null profile picture when no image data', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildSearchResponse({
        entities: [
          {
            title: { text: 'User' },
            navigationUrl: 'https://www.linkedin.com/in/user',
          },
        ],
      }),
    );

    const result = await service.people('user');
    expect(result.results[0].profilePicture).toBeNull();
  });

  test('handles nested data structure', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildSearchResponse({
        entities: [{ title: { text: 'User' }, navigationUrl: 'https://www.linkedin.com/in/user' }],
        paging: { total: 50, start: 0, count: 10 },
        nestedData: true,
      }),
    );

    const result = await service.people('user');
    expect(result.total).toBe(50);
  });

  test('handles empty results', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(buildSearchResponse());

    const result = await service.people('nonexistent');
    expect(result.results).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  test('stores raw response', async () => {
    const rawResponse = buildSearchResponse();
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(rawResponse);

    const result = await service.people('test');
    expect(result.raw).toBe(rawResponse);
  });

  test('filters out non-entity-result types', async () => {
    const response = buildSearchResponse({
      entities: [{ title: { text: 'User' }, navigationUrl: 'https://www.linkedin.com/in/user' }],
    });
    response.included!.push({
      $type: 'com.linkedin.voyager.dash.search.SomeOtherType',
      entityUrn: 'urn:li:other:123',
    });

    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(response);

    const result = await service.people('test');
    expect(result.results).toHaveLength(1);
  });
});
