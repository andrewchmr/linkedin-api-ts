import { FetcherService } from './FetcherService';
import { ResourceType } from '../enums/ResourceType';
import { SearchResult } from '../models/SearchResult';
import { buildProfilePictureUrl } from '../utils/images';
import { IPersonResult, ISearchOptions } from '../interfaces/ISearchResult';
import { VoyagerEntity, VoyagerSearchEntity, VoyagerSearchResponse } from '../types/voyager';

const TYPES = {
  ENTITY_RESULT: 'com.linkedin.voyager.dash.search.EntityResultViewModel',
} as const;

export class SearchService {
  private readonly fetcher: FetcherService;

  constructor(fetcher: FetcherService) {
    this.fetcher = fetcher;
  }

  async people(keywords: string, options: ISearchOptions = {}): Promise<SearchResult> {
    const { start = 0 } = options;

    const raw = await this.fetcher.get<VoyagerSearchResponse>(ResourceType.PEOPLE_SEARCH, {
      keywords,
      start: String(start),
    });

    return this.parseSearchResponse(raw, start);
  }

  private parseSearchResponse(raw: VoyagerSearchResponse, start: number): SearchResult {
    const included: VoyagerEntity[] = raw.included ?? [];

    const entityResults = included.filter(
      (i): i is VoyagerSearchEntity => i.$type === TYPES.ENTITY_RESULT,
    );

    const results: IPersonResult[] = entityResults.map((entity) => {
      const profileUrl = this.extractProfileUrl(entity);
      const usernameMatch = profileUrl.match(/\/in\/([^/]+)/);

      return {
        fullName: entity.title?.text ?? '',
        headline: entity.primarySubtitle?.text ?? null,
        location: entity.secondarySubtitle?.text ?? null,
        profilePicture: this.extractProfilePicture(entity),
        profileUrl,
        username: usernameMatch ? usernameMatch[1] : null,
      };
    });

    const clusters = raw.data?.data?.searchDashClustersByAll ?? raw.data?.searchDashClustersByAll;
    const paging = clusters?.paging ?? {};

    return new SearchResult(
      {
        results,
        total: paging.total ?? 0,
        start: paging.start ?? start,
        count: paging.count ?? results.length,
      },
      raw,
    );
  }

  private extractProfilePicture(entity: VoyagerSearchEntity): string | null {
    const detailData = entity.image?.attributes?.[0]?.detailData;
    if (!detailData) return null;

    const vectorImage =
      detailData.nonEntityProfilePicture?.vectorImage ?? detailData.profilePicture?.vectorImage;

    return buildProfilePictureUrl(vectorImage);
  }

  private extractProfileUrl(entity: VoyagerSearchEntity): string {
    const navUrl = entity.navigationUrl ?? entity.navigationContext?.url ?? '';
    return navUrl.split('?')[0];
  }
}
