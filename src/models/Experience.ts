import { IExperience } from '../interfaces';

export class Experience implements IExperience {
  readonly title: string;
  readonly company: string;
  readonly location: string | null;
  readonly startDate: string | null;
  readonly endDate: string | null;
  readonly description: string | null;
  readonly employmentType: string | null;

  constructor(data: IExperience) {
    this.title = data.title;
    this.company = data.company;
    this.location = data.location;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.description = data.description;
    this.employmentType = data.employmentType;
  }

  toJSON(): IExperience {
    return { ...this };
  }
}
