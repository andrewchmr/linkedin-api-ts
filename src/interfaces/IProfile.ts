export interface IExperience {
  title: string;
  company: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  employmentType: string | null;
}

export interface IEducation {
  school: string;
  degree: string | null;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface ISkill {
  name: string;
  endorsementCount: number;
}

export interface ICertification {
  name: string;
  authority: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface ILanguage {
  name: string;
  proficiency: string | null;
}

export interface IProject {
  title: string;
  description: string | null;
  url: string | null;
  startDate: string | null;
  endDate: string | null;
}

export interface IPublication {
  name: string;
  description: string | null;
  url: string | null;
  publisher: string | null;
  publishedOn: string | null;
}

export interface IProfile {
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  headline: string | null;
  location: string | null;
  profilePicture: string | null;
  summary: string | null;
  url: string;
  experiences: IExperience[];
  education: IEducation[];
  skills: ISkill[];
  certifications: ICertification[];
  languages: ILanguage[];
  projects: IProject[];
  publications: IPublication[];
}
