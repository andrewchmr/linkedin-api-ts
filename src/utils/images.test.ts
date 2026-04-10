import { describe, test, expect } from 'vitest';
import { buildProfilePictureUrl } from './images';

describe('buildProfilePictureUrl', () => {
  test('returns null for undefined', () => {
    expect(buildProfilePictureUrl(undefined)).toBeNull();
  });

  test('returns null for null', () => {
    expect(buildProfilePictureUrl(null)).toBeNull();
  });

  test('returns null when artifacts is empty', () => {
    expect(buildProfilePictureUrl({ artifacts: [] })).toBeNull();
  });

  test('returns null when artifacts is not an array', () => {
    expect(buildProfilePictureUrl({ artifacts: undefined })).toBeNull();
  });

  test('returns null when segment is empty', () => {
    expect(
      buildProfilePictureUrl({
        rootUrl: 'https://media.licdn.com/',
        artifacts: [{ fileIdentifyingUrlPathSegment: '' }],
      }),
    ).toBeNull();
  });

  test('concatenates rootUrl and segment for relative path', () => {
    expect(
      buildProfilePictureUrl({
        rootUrl: 'https://media.licdn.com/dms/image/',
        artifacts: [
          { fileIdentifyingUrlPathSegment: 'small.jpg', width: 100, height: 100 },
          { fileIdentifyingUrlPathSegment: 'large.jpg', width: 400, height: 400 },
        ],
      }),
    ).toBe('https://media.licdn.com/dms/image/large.jpg');
  });

  test('returns segment directly when it starts with http', () => {
    expect(
      buildProfilePictureUrl({
        rootUrl: 'https://media.licdn.com/',
        artifacts: [{ fileIdentifyingUrlPathSegment: 'https://cdn.example.com/pic.jpg' }],
      }),
    ).toBe('https://cdn.example.com/pic.jpg');
  });

  test('uses last artifact (largest)', () => {
    expect(
      buildProfilePictureUrl({
        rootUrl: 'https://media.licdn.com/',
        artifacts: [
          { fileIdentifyingUrlPathSegment: 'small.jpg' },
          { fileIdentifyingUrlPathSegment: 'medium.jpg' },
          { fileIdentifyingUrlPathSegment: 'large.jpg' },
        ],
      }),
    ).toBe('https://media.licdn.com/large.jpg');
  });
});
