import { describe, test, expect } from 'vitest';
import { cookiesToString } from './cookies';

describe('cookiesToString', () => {
  test('formats basic cookies', () => {
    const result = cookiesToString({ li_at: 'abc', JSESSIONID: 'ajax:123' });
    expect(result).toContain('li_at=abc');
    expect(result).toContain('JSESSIONID="ajax:123"');
  });

  test('wraps JSESSIONID in quotes and strips existing quotes', () => {
    const result = cookiesToString({ li_at: 'abc', JSESSIONID: '"ajax:123"' });
    expect(result).toContain('JSESSIONID="ajax:123"');
    expect(result).not.toContain('""');
  });
});
