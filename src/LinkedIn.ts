import { LinkedInConfig } from './config/LinkedInConfig';
import { FetcherService } from './services/FetcherService';
import { AuthService } from './auth/AuthService';
import { ProfileService } from './services/ProfileService';
import { SearchService } from './services/SearchService';
import { ILinkedInConfig } from './interfaces';

export class LinkedIn {
  private readonly config: LinkedInConfig;
  private readonly fetcher: FetcherService;

  readonly auth: AuthService;
  readonly profile: ProfileService;
  readonly search: SearchService;

  constructor(options: ILinkedInConfig = {}) {
    this.config = new LinkedInConfig(options);
    this.fetcher = new FetcherService(this.config);
    this.auth = new AuthService(this.fetcher);
    this.profile = new ProfileService(this.fetcher);
    this.search = new SearchService(this.fetcher);
  }

  get apiKey(): string | undefined {
    return this.config.apiKey;
  }

  set apiKey(value: string | undefined) {
    this.config.apiKey = value;
  }
}
