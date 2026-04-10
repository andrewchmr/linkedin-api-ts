import { ICertification } from '../interfaces';

export class Certification implements ICertification {
  readonly name: string;
  readonly authority: string | null;
  readonly startDate: string | null;
  readonly endDate: string | null;

  constructor(data: ICertification) {
    this.name = data.name;
    this.authority = data.authority;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
  }

  toJSON(): ICertification {
    return { ...this };
  }
}
