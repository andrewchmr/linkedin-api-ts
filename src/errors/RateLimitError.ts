export class RateLimitError extends Error {
  override name = 'RateLimitError';

  constructor(message = 'LinkedIn rate limit exceeded. Try again later.') {
    super(message);
  }
}
