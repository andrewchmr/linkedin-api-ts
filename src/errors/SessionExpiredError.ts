export class SessionExpiredError extends Error {
  override name = 'SessionExpiredError';

  constructor(message = 'LinkedIn session has expired. Please provide a new li_at cookie.') {
    super(message);
  }
}
