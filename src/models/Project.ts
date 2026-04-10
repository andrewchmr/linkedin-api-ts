import { IProject } from '../interfaces';

export class Project implements IProject {
  readonly title: string;
  readonly description: string | null;
  readonly url: string | null;
  readonly startDate: string | null;
  readonly endDate: string | null;

  constructor(data: IProject) {
    this.title = data.title;
    this.description = data.description;
    this.url = data.url;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
  }

  toJSON(): IProject {
    return { ...this };
  }
}
