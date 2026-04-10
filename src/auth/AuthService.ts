import { FetcherService } from '../services/FetcherService';
import { ResourceType } from '../enums/ResourceType';

export class AuthService {
  private readonly fetcher: FetcherService;

  constructor(fetcher: FetcherService) {
    this.fetcher = fetcher;
  }

  async verify(): Promise<boolean> {
    try {
      await this.fetcher.get(ResourceType.ME);
      return true;
    } catch {
      return false;
    }
  }
}
