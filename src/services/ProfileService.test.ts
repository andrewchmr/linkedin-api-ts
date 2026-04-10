import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ProfileService } from './ProfileService';
import { FetcherService } from './FetcherService';
import { Profile } from '../models/Profile';
import { VoyagerNormalizedResponse, VoyagerEntity } from '../types/voyager';
import { createMockFetcher } from './test-helpers';

function buildVoyagerProfileResponse(
  overrides: Partial<{
    username: string;
    firstName: string;
    lastName: string;
    headline: string;
    locationName: string;
    summary: string;
    memberId: string;
    positions: Array<Record<string, unknown>>;
    educations: Array<Record<string, unknown>>;
    skills: Array<Record<string, unknown>>;
    certifications: Array<Record<string, unknown>>;
    languages: Array<Record<string, unknown>>;
    profilePicture: Record<string, unknown> | null;
  }> = {},
): VoyagerNormalizedResponse {
  const {
    username = 'johndoe',
    firstName = 'John',
    lastName = 'Doe',
    headline = 'Software Engineer',
    locationName = 'San Francisco',
    summary = 'A great engineer',
    memberId = '12345',
    positions = [],
    educations = [],
    skills = [],
    certifications = [],
    languages = [],
    profilePicture = null,
  } = overrides;

  return {
    included: [
      {
        $type: 'com.linkedin.voyager.dash.identity.profile.Profile',
        entityUrn: `urn:li:fsd_profile:${memberId}`,
        publicIdentifier: username,
        firstName,
        lastName,
        headline,
        locationName,
        summary,
        ...(profilePicture ? { profilePicture } : {}),
      },
      ...positions.map((pos) => ({
        $type: 'com.linkedin.voyager.dash.identity.profile.Position',
        entityUrn: `urn:li:fsd_profilePosition:(${memberId},111)`,
        ...pos,
      })),
      ...educations.map((edu) => ({
        $type: 'com.linkedin.voyager.dash.identity.profile.Education',
        entityUrn: `urn:li:fsd_profileEducation:(${memberId},222)`,
        ...edu,
      })),
      ...skills.map((skill) => ({
        $type: 'com.linkedin.voyager.dash.identity.profile.Skill',
        entityUrn: `urn:li:fsd_profileSkill:(${memberId},333)`,
        ...skill,
      })),
      ...certifications.map((cert) => ({
        $type: 'com.linkedin.voyager.dash.identity.profile.Certification',
        entityUrn: `urn:li:fsd_profileCertification:(${memberId},444)`,
        ...cert,
      })),
      ...languages.map((lang) => ({
        $type: 'com.linkedin.voyager.dash.identity.profile.Language',
        entityUrn: `urn:li:fsd_profileLanguage:(${memberId},555)`,
        ...lang,
      })),
    ] as VoyagerEntity[],
  };
}

describe('ProfileService', () => {
  let fetcher: FetcherService;
  let service: ProfileService;

  beforeEach(() => {
    fetcher = createMockFetcher();
    service = new ProfileService(fetcher);
  });

  test('calls fetcher with correct resource and username', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(buildVoyagerProfileResponse());

    await service.details('johndoe');

    expect(fetcher.get).toHaveBeenCalledWith(expect.stringContaining('memberIdentity'), {
      username: 'johndoe',
    });
  });

  test('parses basic profile fields', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildVoyagerProfileResponse({
        username: 'janedoe',
        firstName: 'Jane',
        lastName: 'Doe',
        headline: 'CEO',
        locationName: 'NYC',
        summary: 'Leader',
      }),
    );

    const profile = await service.details('janedoe');

    expect(profile).toBeInstanceOf(Profile);
    expect(profile.username).toBe('janedoe');
    expect(profile.firstName).toBe('Jane');
    expect(profile.lastName).toBe('Doe');
    expect(profile.fullName).toBe('Jane Doe');
    expect(profile.headline).toBe('CEO');
    expect(profile.location).toBe('NYC');
    expect(profile.summary).toBe('Leader');
    expect(profile.url).toBe('https://www.linkedin.com/in/janedoe');
  });

  test('parses experiences with dates', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildVoyagerProfileResponse({
        positions: [
          {
            title: 'Senior Engineer',
            companyName: 'Acme',
            locationName: 'SF',
            description: 'Building things',
            employmentType: 'Full-time',
            dateRange: {
              start: { year: 2020, month: 1 },
              end: { year: 2023, month: 6 },
            },
          },
        ],
      }),
    );

    const profile = await service.details('johndoe');

    expect(profile.experiences).toHaveLength(1);
    expect(profile.experiences[0]).toEqual({
      title: 'Senior Engineer',
      company: 'Acme',
      location: 'SF',
      startDate: '2020-01',
      endDate: '2023-06',
      description: 'Building things',
      employmentType: 'Full-time',
    });
  });

  test('parses education', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildVoyagerProfileResponse({
        educations: [
          {
            schoolName: 'MIT',
            degreeName: 'BS',
            fieldOfStudy: 'CS',
            dateRange: {
              start: { year: 2014 },
              end: { year: 2018 },
            },
          },
        ],
      }),
    );

    const profile = await service.details('johndoe');

    expect(profile.education).toHaveLength(1);
    expect(profile.education[0]).toEqual({
      school: 'MIT',
      degree: 'BS',
      field: 'CS',
      startDate: '2014',
      endDate: '2018',
    });
  });

  test('parses skills', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildVoyagerProfileResponse({
        skills: [{ name: 'TypeScript', endorsementCount: 42 }],
      }),
    );

    const profile = await service.details('johndoe');

    expect(profile.skills).toHaveLength(1);
    expect(profile.skills[0]).toEqual({ name: 'TypeScript', endorsementCount: 42 });
  });

  test('parses certifications', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildVoyagerProfileResponse({
        certifications: [
          {
            name: 'AWS Certified',
            authority: 'Amazon',
            dateRange: { start: { year: 2022, month: 3 } },
          },
        ],
      }),
    );

    const profile = await service.details('johndoe');

    expect(profile.certifications).toHaveLength(1);
    expect(profile.certifications[0]).toEqual({
      name: 'AWS Certified',
      authority: 'Amazon',
      startDate: '2022-03',
      endDate: null,
    });
  });

  test('parses languages', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildVoyagerProfileResponse({
        languages: [{ name: 'English', proficiency: 'NATIVE_OR_BILINGUAL' }],
      }),
    );

    const profile = await service.details('johndoe');

    expect(profile.languages).toHaveLength(1);
    expect(profile.languages[0]).toEqual({
      name: 'English',
      proficiency: 'NATIVE_OR_BILINGUAL',
    });
  });

  test('parses profile picture from vector image', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(
      buildVoyagerProfileResponse({
        profilePicture: {
          displayImageReference: {
            vectorImage: {
              rootUrl: 'https://media.licdn.com/dms/image/',
              artifacts: [
                { fileIdentifyingUrlPathSegment: 'small.jpg', width: 100, height: 100 },
                { fileIdentifyingUrlPathSegment: 'large.jpg', width: 400, height: 400 },
              ],
            },
          },
        },
      }),
    );

    const profile = await service.details('johndoe');

    expect(profile.profilePicture).toBe('https://media.licdn.com/dms/image/large.jpg');
  });

  test('returns null profilePicture when not available', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(buildVoyagerProfileResponse());

    const profile = await service.details('johndoe');

    expect(profile.profilePicture).toBeNull();
  });

  test('filters entities belonging to a different profile', async () => {
    const response: VoyagerNormalizedResponse = {
      included: [
        {
          $type: 'com.linkedin.voyager.dash.identity.profile.Profile',
          entityUrn: 'urn:li:fsd_profile:AAA',
          publicIdentifier: 'johndoe',
          firstName: 'John',
          lastName: 'Doe',
        },
        {
          $type: 'com.linkedin.voyager.dash.identity.profile.Position',
          entityUrn: 'urn:li:fsd_profilePosition:(AAA,1)',
          title: "John's job",
          companyName: 'Acme',
        },
        {
          $type: 'com.linkedin.voyager.dash.identity.profile.Position',
          entityUrn: 'urn:li:fsd_profilePosition:(BBB,2)',
          title: "Someone else's job",
          companyName: 'Other',
        },
      ] as unknown as VoyagerEntity[],
    };

    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(response);

    const profile = await service.details('johndoe');

    expect(profile.experiences).toHaveLength(1);
    expect(profile.experiences[0].title).toBe("John's job");
  });

  test('stores raw response', async () => {
    const rawResponse = buildVoyagerProfileResponse();
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue(rawResponse);

    const profile = await service.details('johndoe');

    expect(profile.raw).toBe(rawResponse);
  });

  test('handles empty included array', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue({ included: [] });

    const profile = await service.details('johndoe');

    expect(profile.username).toBe('johndoe');
    expect(profile.fullName).toBe('');
    expect(profile.experiences).toHaveLength(0);
  });

  test('handles missing included field', async () => {
    (fetcher.get as ReturnType<typeof vi.fn>).mockResolvedValue({});

    const profile = await service.details('johndoe');

    expect(profile.username).toBe('johndoe');
    expect(profile.experiences).toHaveLength(0);
  });
});
