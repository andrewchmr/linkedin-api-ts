import { ISearchResult } from '../interfaces/ISearchResult';
import { PersonResult } from './PersonResult';

export class SearchResult implements ISearchResult {
  readonly results: PersonResult[];
  readonly total: number;
  readonly start: number;
  readonly count: number;

  private readonly _raw: unknown;

  constructor(data: ISearchResult, raw: unknown) {
    this.results = data.results.map((r) => new PersonResult(r));
    this.total = data.total;
    this.start = data.start;
    this.count = data.count;
    this._raw = raw;
  }

  get raw(): unknown {
    return this._raw;
  }

  toJSON(): ISearchResult {
    return {
      results: this.results.map((r) => r.toJSON()),
      total: this.total,
      start: this.start,
      count: this.count,
    };
  }
}
