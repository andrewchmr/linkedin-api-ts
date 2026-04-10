import { IProfile } from '../interfaces';
import { Experience } from './Experience';
import { Education } from './Education';
import { Skill } from './Skill';
import { Certification } from './Certification';
import { Language } from './Language';
import { Project } from './Project';
import { Publication } from './Publication';

export class Profile implements IProfile {
  readonly username: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly fullName: string;
  readonly headline: string | null;
  readonly location: string | null;
  readonly profilePicture: string | null;
  readonly summary: string | null;
  readonly url: string;
  readonly experiences: Experience[];
  readonly education: Education[];
  readonly skills: Skill[];
  readonly certifications: Certification[];
  readonly languages: Language[];
  readonly projects: Project[];
  readonly publications: Publication[];

  private readonly _raw: unknown;

  constructor(data: IProfile, raw: unknown) {
    this.username = data.username;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.fullName = data.fullName;
    this.headline = data.headline;
    this.location = data.location;
    this.profilePicture = data.profilePicture;
    this.summary = data.summary;
    this.url = data.url;
    this.experiences = data.experiences.map((e) => new Experience(e));
    this.education = data.education.map((e) => new Education(e));
    this.skills = data.skills.map((s) => new Skill(s));
    this.certifications = data.certifications.map((c) => new Certification(c));
    this.languages = data.languages.map((l) => new Language(l));
    this.projects = data.projects.map((p) => new Project(p));
    this.publications = data.publications.map((p) => new Publication(p));
    this._raw = raw;
  }

  get raw(): unknown {
    return this._raw;
  }

  toJSON(): IProfile {
    return {
      username: this.username,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.fullName,
      headline: this.headline,
      location: this.location,
      profilePicture: this.profilePicture,
      summary: this.summary,
      url: this.url,
      experiences: this.experiences.map((e) => e.toJSON()),
      education: this.education.map((e) => e.toJSON()),
      skills: this.skills.map((s) => s.toJSON()),
      certifications: this.certifications.map((c) => c.toJSON()),
      languages: this.languages.map((l) => l.toJSON()),
      projects: this.projects.map((p) => p.toJSON()),
      publications: this.publications.map((p) => p.toJSON()),
    };
  }
}
