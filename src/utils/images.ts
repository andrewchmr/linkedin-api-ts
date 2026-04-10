import { VoyagerVectorImage } from '../types/voyager';

export function buildProfilePictureUrl(
  vectorImage: VoyagerVectorImage | undefined | null,
): string | null {
  const artifacts = vectorImage?.artifacts;
  if (!Array.isArray(artifacts) || artifacts.length === 0) return null;

  const largest = artifacts[artifacts.length - 1];
  const rootUrl = vectorImage?.rootUrl ?? '';
  const segment = largest.fileIdentifyingUrlPathSegment ?? '';

  if (!segment) return null;

  return segment.startsWith('http') ? segment : `${rootUrl}${segment}`;
}
