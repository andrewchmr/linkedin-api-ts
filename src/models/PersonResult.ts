import { IPersonResult } from '../interfaces/ISearchResult';

export class PersonResult implements IPersonResult {
  readonly fullName: string;
  readonly headline: string | null;
  readonly location: string | null;
  readonly profilePicture: string | null;
  readonly profileUrl: string;
  readonly username: string | null;

  constructor(data: IPersonResult) {
    this.fullName = data.fullName;
    this.headline = data.headline;
    this.location = data.location;
    this.profilePicture = data.profilePicture;
    this.profileUrl = data.profileUrl;
    this.username = data.username;
  }

  toJSON(): IPersonResult {
    return {
      fullName: this.fullName,
      headline: this.headline,
      location: this.location,
      profilePicture: this.profilePicture,
      profileUrl: this.profileUrl,
      username: this.username,
    };
  }
}
