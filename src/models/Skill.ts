import { ISkill } from '../interfaces';

export class Skill implements ISkill {
  readonly name: string;
  readonly endorsementCount: number;

  constructor(data: ISkill) {
    this.name = data.name;
    this.endorsementCount = data.endorsementCount;
  }

  toJSON(): ISkill {
    return { ...this };
  }
}
