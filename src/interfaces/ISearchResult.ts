export interface IPersonResult {
  fullName: string;
  headline: string | null;
  location: string | null;
  profilePicture: string | null;
  profileUrl: string;
  username: string | null;
}

export interface ISearchOptions {
  start?: number;
}

export interface ISearchResult {
  results: IPersonResult[];
  total: number;
  start: number;
  count: number;
}
