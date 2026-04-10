import { describe, test, expect } from 'vitest';
import {
  LinkedIn,
  encodeApiKey,
  decodeApiKey,
  Profile,
  SessionExpiredError,
  RateLimitError,
  ProfileNotFoundError,
} from './index';

describe('LinkedIn', () => {
  test('creates instance without config', () => {
    const linkedin = new LinkedIn();
    expect(linkedin).toBeInstanceOf(LinkedIn);
    expect(linkedin.apiKey).toBeUndefined();
  });

  test('creates instance with apiKey', () => {
    const apiKey = encodeApiKey({ li_at: 'test', JSESSIONID: 'ajax:123' });
    const linkedin = new LinkedIn({ apiKey });
    expect(linkedin.apiKey).toBe(apiKey);
  });

  test('hot-swaps apiKey', () => {
    const linkedin = new LinkedIn();
    const apiKey = encodeApiKey({ li_at: 'test', JSESSIONID: 'ajax:123' });
    linkedin.apiKey = apiKey;
    expect(linkedin.apiKey).toBe(apiKey);
  });

  test('has auth and profile services', () => {
    const linkedin = new LinkedIn();
    expect(linkedin.auth).toBeDefined();
    expect(linkedin.profile).toBeDefined();
  });
});

describe('Cookie utilities', () => {
  test('encodes and decodes API key', () => {
    const cookies = { li_at: 'my_cookie', JSESSIONID: 'ajax:token123' };
    const encoded = encodeApiKey(cookies);
    const decoded = decodeApiKey(encoded);
    expect(decoded).toEqual(cookies);
  });

  test('throws on invalid API key', () => {
    const invalid = Buffer.from(JSON.stringify({ foo: 'bar' })).toString('base64');
    expect(() => decodeApiKey(invalid)).toThrow('Invalid API key');
  });

  test('throws on non-base64 input', () => {
    expect(() => decodeApiKey('not-valid')).toThrow();
  });
});

describe('Profile model', () => {
  test('creates profile with .raw and .toJSON()', () => {
    const rawData = { some: 'raw data' };
    const profile = new Profile(
      {
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        headline: 'Software Engineer',
        location: 'San Francisco',
        profilePicture: 'https://example.com/pic.jpg',
        summary: 'A great engineer',
        url: 'https://www.linkedin.com/in/johndoe',
        experiences: [
          {
            title: 'Senior Engineer',
            company: 'Acme Inc',
            location: 'SF',
            startDate: '2020-01',
            endDate: null,
            description: 'Building things',
            employmentType: 'Full-time',
          },
        ],
        education: [
          {
            school: 'MIT',
            degree: 'BS',
            field: 'Computer Science',
            startDate: '2014',
            endDate: '2018',
          },
        ],
        skills: [{ name: 'TypeScript', endorsementCount: 42 }],
        certifications: [],
        languages: [{ name: 'English', proficiency: 'Native' }],
        projects: [],
        publications: [],
      },
      rawData,
    );

    expect(profile.fullName).toBe('John Doe');
    expect(profile.raw).toBe(rawData);
    expect(profile.experiences).toHaveLength(1);
    expect(profile.skills[0].name).toBe('TypeScript');

    const json = profile.toJSON();
    expect(json.username).toBe('johndoe');
    expect(json.experiences).toHaveLength(1);
    expect((json as any).raw).toBeUndefined();
  });
});

describe('Error classes', () => {
  test('SessionExpiredError', () => {
    const err = new SessionExpiredError();
    expect(err.name).toBe('SessionExpiredError');
    expect(err.message).toContain('expired');
  });

  test('RateLimitError', () => {
    const err = new RateLimitError();
    expect(err.name).toBe('RateLimitError');
    expect(err.message).toContain('rate limit');
  });

  test('ProfileNotFoundError', () => {
    const err = new ProfileNotFoundError('johndoe');
    expect(err.name).toBe('ProfileNotFoundError');
    expect(err.message).toContain('johndoe');
  });
});
