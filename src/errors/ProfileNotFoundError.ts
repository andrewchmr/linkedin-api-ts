export class ProfileNotFoundError extends Error {
  override name = 'ProfileNotFoundError';

  constructor(username: string) {
    super(`Profile not found: ${username}`);
  }
}
