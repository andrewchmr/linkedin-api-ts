import { IPublication } from '../interfaces';

export class Publication implements IPublication {
  readonly name: string;
  readonly description: string | null;
  readonly url: string | null;
  readonly publisher: string | null;
  readonly publishedOn: string | null;

  constructor(data: IPublication) {
    this.name = data.name;
    this.description = data.description;
    this.url = data.url;
    this.publisher = data.publisher;
    this.publishedOn = data.publishedOn;
  }

  toJSON(): IPublication {
    return { ...this };
  }
}
