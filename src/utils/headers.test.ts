import { describe, test, expect } from 'vitest';
import { buildHeaders } from './headers';

describe('buildHeaders', () => {
  test('builds headers with correct csrf token', () => {
    const cookies = { li_at: 'token123', JSESSIONID: '"ajax:abc"' };
    const headers = buildHeaders(cookies);

    expect(headers['csrf-token']).toBe('ajax:abc');
    expect(headers['User-Agent']).toContain('Chrome');
    expect(headers['Accept']).toBe('application/vnd.linkedin.normalized+json+2.1');
    expect(headers['x-restli-protocol-version']).toBe('2.0.0');
  });

  test('includes cookies in Cookie header', () => {
    const cookies = { li_at: 'mytoken', JSESSIONID: 'ajax:123' };
    const headers = buildHeaders(cookies);

    expect(headers['Cookie']).toContain('li_at=mytoken');
    expect(headers['Cookie']).toContain('JSESSIONID="ajax:123"');
  });
});
