import { ILanguage } from '../interfaces';

export class Language implements ILanguage {
  readonly name: string;
  readonly proficiency: string | null;

  constructor(data: ILanguage) {
    this.name = data.name;
    this.proficiency = data.proficiency;
  }

  toJSON(): ILanguage {
    return { ...this };
  }
}
