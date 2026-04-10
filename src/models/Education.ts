import { IEducation } from '../interfaces';

export class Education implements IEducation {
  readonly school: string;
  readonly degree: string | null;
  readonly field: string | null;
  readonly startDate: string | null;
  readonly endDate: string | null;

  constructor(data: IEducation) {
    this.school = data.school;
    this.degree = data.degree;
    this.field = data.field;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
  }

  toJSON(): IEducation {
    return { ...this };
  }
}
