import { FetcherService } from './FetcherService';
import { ResourceType } from '../enums/ResourceType';
import { Profile } from '../models/Profile';
import { parseVoyagerDate } from '../utils/dates';
import { buildProfilePictureUrl } from '../utils/images';
import {
  IExperience,
  IEducation,
  ISkill,
  ICertification,
  ILanguage,
  IProject,
  IPublication,
} from '../interfaces';
import {
  VoyagerNormalizedResponse,
  VoyagerEntity,
  VoyagerProfileEntity,
  VoyagerPositionEntity,
  VoyagerEducationEntity,
  VoyagerSkillEntity,
  VoyagerCertificationEntity,
  VoyagerLanguageEntity,
  VoyagerProjectEntity,
  VoyagerPublicationEntity,
  VoyagerGeoEntity,
} from '../types/voyager';

const TYPES = {
  PROFILE: 'com.linkedin.voyager.dash.identity.profile.Profile',
  POSITION: 'com.linkedin.voyager.dash.identity.profile.Position',
  EDUCATION: 'com.linkedin.voyager.dash.identity.profile.Education',
  SKILL: 'com.linkedin.voyager.dash.identity.profile.Skill',
  CERTIFICATION: 'com.linkedin.voyager.dash.identity.profile.Certification',
  LANGUAGE: 'com.linkedin.voyager.dash.identity.profile.Language',
  PROJECT: 'com.linkedin.voyager.dash.identity.profile.Project',
  PUBLICATION: 'com.linkedin.voyager.dash.identity.profile.Publication',
  GEO: 'com.linkedin.voyager.dash.common.Geo',
} as const;

export class ProfileService {
  private readonly fetcher: FetcherService;

  constructor(fetcher: FetcherService) {
    this.fetcher = fetcher;
  }

  async details(username: string): Promise<Profile> {
    const raw = await this.fetcher.get<VoyagerNormalizedResponse>(
      ResourceType.PROFILE_BY_USERNAME,
      {
        username,
      },
    );

    return this.parseNormalizedResponse(raw, username);
  }

  private parseNormalizedResponse(raw: VoyagerNormalizedResponse, username: string): Profile {
    const included: VoyagerEntity[] = raw.included ?? [];

    const profilesAll: VoyagerProfileEntity[] = [];
    const positionsAll: VoyagerPositionEntity[] = [];
    const educationsAll: VoyagerEducationEntity[] = [];
    const skillsAll: VoyagerSkillEntity[] = [];
    const certsAll: VoyagerCertificationEntity[] = [];
    const langsAll: VoyagerLanguageEntity[] = [];
    const projectsAll: VoyagerProjectEntity[] = [];
    const pubsAll: VoyagerPublicationEntity[] = [];
    const geoByUrn = new Map<string, VoyagerGeoEntity>();

    for (const i of included) {
      switch (i.$type) {
        case TYPES.PROFILE:
          profilesAll.push(i as VoyagerProfileEntity);
          break;
        case TYPES.POSITION:
          positionsAll.push(i as VoyagerPositionEntity);
          break;
        case TYPES.EDUCATION:
          educationsAll.push(i as VoyagerEducationEntity);
          break;
        case TYPES.SKILL:
          skillsAll.push(i as VoyagerSkillEntity);
          break;
        case TYPES.CERTIFICATION:
          certsAll.push(i as VoyagerCertificationEntity);
          break;
        case TYPES.LANGUAGE:
          langsAll.push(i as VoyagerLanguageEntity);
          break;
        case TYPES.PROJECT:
          projectsAll.push(i as VoyagerProjectEntity);
          break;
        case TYPES.PUBLICATION:
          pubsAll.push(i as VoyagerPublicationEntity);
          break;
        case TYPES.GEO:
          if (i.entityUrn) geoByUrn.set(i.entityUrn, i as VoyagerGeoEntity);
          break;
      }
    }

    const profileData = profilesAll.find((i) => i.publicIdentifier === username) ?? profilesAll[0];

    // URN format: urn:li:fsd_profilePosition:(MEMBER_ID,POSITION_ID)
    const memberId = profileData?.entityUrn?.split(':').pop() ?? '';
    const profileScopeMarker = `(${memberId},`;
    const belongsToProfile = (item: VoyagerEntity): boolean =>
      memberId !== '' && (item.entityUrn?.includes(profileScopeMarker) ?? false);

    const positions = positionsAll.filter(belongsToProfile);
    const educations = educationsAll.filter(belongsToProfile);
    const skillEntities = skillsAll.filter(belongsToProfile);
    const certEntities = certsAll.filter(belongsToProfile);
    const langEntities = langsAll.filter(belongsToProfile);
    const projectEntities = projectsAll.filter(belongsToProfile);
    const pubEntities = pubsAll.filter(belongsToProfile);

    const geoUrn = profileData?.geoLocation?.['*geo'] ?? profileData?.geoLocation?.geoUrn;
    const geoLocationName = geoUrn ? (geoByUrn.get(geoUrn)?.defaultLocalizedName ?? null) : null;

    const firstName = profileData?.firstName ?? '';
    const lastName = profileData?.lastName ?? '';

    const profilePicture = buildProfilePictureUrl(
      profileData?.profilePicture?.displayImageReference?.vectorImage,
    );

    const experiences: IExperience[] = positions.map((pos) => ({
      title: pos.title ?? '',
      company: pos.companyName ?? '',
      location: pos.locationName ?? null,
      startDate: parseVoyagerDate(pos.dateRange?.start),
      endDate: parseVoyagerDate(pos.dateRange?.end),
      description: pos.description ?? null,
      employmentType: pos.employmentType ?? null,
    }));

    const education: IEducation[] = educations.map((edu) => ({
      school: edu.schoolName ?? '',
      degree: edu.degreeName ?? null,
      field: edu.fieldOfStudy ?? null,
      startDate: parseVoyagerDate(edu.dateRange?.start),
      endDate: parseVoyagerDate(edu.dateRange?.end),
    }));

    const skills: ISkill[] = skillEntities.map((skill) => ({
      name: skill.name ?? '',
      endorsementCount: skill.endorsementCount ?? 0,
    }));

    const certifications: ICertification[] = certEntities.map((cert) => ({
      name: cert.name ?? '',
      authority: cert.authority ?? null,
      startDate: parseVoyagerDate(cert.dateRange?.start),
      endDate: parseVoyagerDate(cert.dateRange?.end),
    }));

    const languages: ILanguage[] = langEntities.map((lang) => ({
      name: lang.name ?? '',
      proficiency: lang.proficiency ?? null,
    }));

    const projects: IProject[] = projectEntities.map((proj) => ({
      title: proj.title ?? '',
      description: proj.description ?? null,
      url: proj.url ?? null,
      startDate: parseVoyagerDate(proj.dateRange?.start),
      endDate: parseVoyagerDate(proj.dateRange?.end),
    }));

    const publications: IPublication[] = pubEntities.map((pub) => ({
      name: pub.name ?? '',
      description: pub.description ?? null,
      url: pub.url ?? null,
      publisher: pub.publisher ?? null,
      publishedOn: parseVoyagerDate(pub.publishedOn),
    }));

    const resolvedUsername = profileData?.publicIdentifier ?? username;

    return new Profile(
      {
        username: resolvedUsername,
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`.trim(),
        headline: profileData?.headline ?? null,
        location: profileData?.locationName ?? geoLocationName,
        profilePicture,
        summary: profileData?.summary ?? null,
        url: `https://www.linkedin.com/in/${resolvedUsername}`,
        experiences,
        education,
        skills,
        certifications,
        languages,
        projects,
        publications,
      },
      raw,
    );
  }
}
