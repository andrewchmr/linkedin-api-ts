import { LinkedInCookies, cookiesToString } from './cookies';

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36';

const X_LI_TRACK = JSON.stringify({
  clientVersion: '1.13.43445',
  mpVersion: '1.13.43445',
  osName: 'web',
  timezoneOffset: 0,
  timezone: 'UTC',
  deviceFormFactor: 'DESKTOP',
  mpName: 'voyager-web',
  displayDensity: 2,
  displayWidth: 1920,
  displayHeight: 1080,
});

export function buildHeaders(cookies: LinkedInCookies): Record<string, string> {
  const csrfToken = cookies.JSESSIONID.replace(/"/g, '');

  return {
    'User-Agent': USER_AGENT,
    Accept: 'application/vnd.linkedin.normalized+json+2.1',
    'Accept-Language': 'en-US,en;q=0.9',
    'x-li-lang': 'en_US',
    'x-restli-protocol-version': '2.0.0',
    'x-li-page-instance': 'urn:li:page:d_flagship3_profile_view_base',
    'x-li-track': X_LI_TRACK,
    'sec-ch-ua': '"Google Chrome";v="147", "Chromium";v="147", "Not.A/Brand";v="8"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-site': 'same-origin',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    priority: 'u=1, i',
    Referer: 'https://www.linkedin.com/feed/',
    'csrf-token': csrfToken,
    Cookie: cookiesToString(cookies),
  };
}
