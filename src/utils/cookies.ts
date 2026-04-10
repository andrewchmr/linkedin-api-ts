export interface LinkedInCookies {
  li_at: string;
  JSESSIONID: string;
}

export function encodeApiKey(cookies: LinkedInCookies): string {
  return Buffer.from(JSON.stringify(cookies)).toString('base64');
}

export function decodeApiKey(apiKey: string): LinkedInCookies {
  const decoded = Buffer.from(apiKey, 'base64').toString();
  const parsed = JSON.parse(decoded) as LinkedInCookies;

  if (!parsed.li_at || !parsed.JSESSIONID) {
    throw new Error(
      'Invalid API key. Expected base64-encoded JSON with "li_at" and "JSESSIONID" fields.',
    );
  }

  return { li_at: parsed.li_at, JSESSIONID: parsed.JSESSIONID };
}

export function cookiesToString(cookies: LinkedInCookies): string {
  const jsessionid = cookies.JSESSIONID.replace(/"/g, '');
  return `li_at=${cookies.li_at}; JSESSIONID="${jsessionid}"`;
}
