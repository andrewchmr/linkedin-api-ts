# linkedin-api-ts

[![npm version](https://img.shields.io/npm/v/linkedin-api-ts.svg)](https://npm.im/linkedin-api-ts)
[![types](https://img.shields.io/npm/types/linkedin-api-ts.svg)](https://npm.im/linkedin-api-ts)
[![license](https://img.shields.io/npm/l/linkedin-api-ts.svg)](https://github.com/andrewchmr/linkedin-api-ts/blob/main/LICENSE)

Node.js/TypeScript client for fetching data from LinkedIn for free.

## Install

```bash
npm install linkedin-api-ts
```

## Getting Your API Key

The `apiKey` is **not** an API key issued by LinkedIn — LinkedIn does not give those out. It is a base64 encoding of your own LinkedIn session cookies (`li_at` and `JSESSIONID`), which is what the library sends with every request to authenticate as you.

### Step 1: Get your cookies

1. Log in to [linkedin.com](https://www.linkedin.com) in your browser (use an **incognito window** for a longer-lived session — cookies can last up to 1 year)
2. Open DevTools (`F12` or `Cmd+Shift+I`)
3. Go to **Application** → **Cookies** → `https://www.linkedin.com`
4. Copy the values of:
   - `li_at` — your session token
   - `JSESSIONID` — your CSRF token (remove surrounding quotes if present)

### Step 2: Encode as API key

```typescript
import { encodeApiKey } from 'linkedin-api-ts';

const apiKey = encodeApiKey({
  li_at: 'your_li_at_value',
  JSESSIONID: 'your_jsessionid_value',
});

console.log(apiKey); // Use this as your API key
```

Or encode manually:

```bash
echo -n '{"li_at":"your_li_at_value","JSESSIONID":"your_jsessionid_value"}' | base64
```

## Usage

```typescript
import { LinkedIn } from 'linkedin-api-ts';

const linkedin = new LinkedIn({ apiKey: 'BASE64_ENCODED_API_KEY' });

// Verify your session is valid
const isValid = await linkedin.auth.verify();
console.log('Session valid:', isValid);

// Fetch a profile
const profile = await linkedin.profile.details('williamhgates');

console.log(profile.fullName); // "Bill Gates"
console.log(profile.headline); // "Co-chair, Bill & Melinda Gates Foundation"
console.log(profile.experiences); // Work history
console.log(profile.education); // Education history
console.log(profile.skills); // Skills with endorsement counts

// Get raw Voyager API response
console.log(profile.raw);

// Serialize to JSON
console.log(profile.toJSON());
```

### People Search

```typescript
const results = await linkedin.search.people('software engineer', {
  start: 0, // Pagination offset (default: 0)
});

console.log(results.total); // Total matching people
console.log(results.results.length); // Results in this page

for (const person of results.results) {
  console.log(person.fullName); // "John Doe"
  console.log(person.headline); // "Software Engineer at Google"
  console.log(person.location); // "San Francisco Bay Area"
  console.log(person.username); // "johndoe"
  console.log(person.profileUrl); // "https://www.linkedin.com/in/johndoe"
  console.log(person.profilePicture); // URL or null
}

// Pagination
const page2 = await linkedin.search.people('software engineer', { start: 10 });

// Raw response & serialization
console.log(results.raw); // Raw Voyager API response
console.log(results.toJSON()); // JSON-serializable
```

### Hot-swap API Key

Rotate session cookies without creating a new client:

```typescript
linkedin.apiKey = 'NEW_BASE64_KEY';
```

## Example Response

`profile.toJSON()` returns structured data like this:

```json
{
  "username": "williamhgates",
  "firstName": "Bill",
  "lastName": "Gates",
  "fullName": "Bill Gates",
  "headline": "Co-chair, Bill & Melinda Gates Foundation",
  "location": "Seattle, Washington, United States",
  "profilePicture": "https://media.licdn.com/dms/image/...",
  "summary": "Co-chair of the Bill & Melinda Gates Foundation. Founder of Breakthrough Energy...",
  "url": "https://www.linkedin.com/in/williamhgates",
  "experiences": [
    {
      "title": "Co-chair",
      "company": "Bill & Melinda Gates Foundation",
      "location": "Seattle, Washington, United States",
      "startDate": "2000-01",
      "endDate": null,
      "description": null,
      "employmentType": "Full-time"
    },
    {
      "title": "Founder",
      "company": "Breakthrough Energy",
      "location": null,
      "startDate": "2015-01",
      "endDate": null,
      "description": null,
      "employmentType": null
    }
  ],
  "education": [
    {
      "school": "Harvard University",
      "degree": null,
      "field": null,
      "startDate": "1973",
      "endDate": "1975"
    }
  ],
  "skills": [
    { "name": "Public Speaking", "endorsementCount": 99 },
    { "name": "Entrepreneurship", "endorsementCount": 99 },
    { "name": "Strategic Planning", "endorsementCount": 82 }
  ],
  "certifications": [],
  "languages": [{ "name": "English", "proficiency": "Native or bilingual" }]
}
```

## Configuration

```typescript
const linkedin = new LinkedIn({
  apiKey: 'BASE64_ENCODED_API_KEY', // Required for authenticated access
  proxyUrl: 'http://proxy:8080', // HTTP proxy URL
  timeout: 10000, // Request timeout in ms (default: 10000)
  delay: 200, // Delay between requests in ms (default: 200)
  maxRetries: 3, // Retry attempts on failure (default: 3)
  logging: false, // Enable debug logging (default: false)
  errorHandler: customErrorHandler, // Custom error handler (see below)
});
```

### Custom Error Handler

```typescript
import type { IErrorHandler } from 'linkedin-api-ts';

const errorHandler: IErrorHandler = {
  handle(error: Error): void {
    // Your custom error handling logic
    console.error('LinkedIn API error:', error.message);
  },
};
```

## Search Data

The `results.toJSON()` method returns an `ISearchResult` object:

```typescript
{
  results: IPersonResult[];
  total: number;    // Total matching people
  start: number;    // Pagination offset
  count: number;    // Page size
}
```

Each `IPersonResult`:

```typescript
{
  fullName: string;
  headline: string | null;
  location: string | null;
  profilePicture: string | null;
  profileUrl: string;
  username: string | null;
}
```

## Profile Data

The `profile.toJSON()` method returns an `IProfile` object:

```typescript
{
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  headline: string | null;
  location: string | null;
  profilePicture: string | null;  // URL
  summary: string | null;
  url: string;                     // LinkedIn profile URL
  experiences: IExperience[];
  education: IEducation[];
  skills: ISkill[];
  certifications: ICertification[];
  languages: ILanguage[];
}
```

<details>
<summary>Nested types</summary>

```typescript
interface IExperience {
  title: string;
  company: string;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
  employmentType: string | null;
}

interface IEducation {
  school: string;
  degree: string | null;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
}

interface ISkill {
  name: string;
  endorsementCount: number;
}

interface ICertification {
  name: string;
  authority: string | null;
  startDate: string | null;
  endDate: string | null;
}

interface ILanguage {
  name: string;
  proficiency: string | null;
}
```

</details>

## Error Handling

The library throws specific errors you can catch:

```typescript
import { SessionExpiredError, RateLimitError, ProfileNotFoundError } from 'linkedin-api-ts';

// Works for both profile and search calls

try {
  const profile = await linkedin.profile.details('username');
} catch (error) {
  if (error instanceof SessionExpiredError) {
    // Session cookie has expired — get a new li_at cookie
  } else if (error instanceof RateLimitError) {
    // Too many requests — back off and retry later
  } else if (error instanceof ProfileNotFoundError) {
    // Username doesn't exist
  }
}
```

## Usage Limits

LinkedIn enforces rate limits on API usage. The library includes built-in request delays and retry logic, but you should still be mindful of how many requests you make. Excessive usage may result in your account being temporarily or permanently restricted. See [LinkedIn's Commercial Use Limit](https://www.linkedin.com/help/linkedin/answer/a1339498) for more details.

## Security

Your `li_at` and `JSESSIONID` cookies are equivalent to a logged-in LinkedIn session — treat them like passwords. Never commit them, never log them in plain text, and rotate them if you suspect they have leaked.

If you find a vulnerability in how this library handles credentials or request data, please report it privately via [GitHub Security Advisories](https://github.com/andrewchmr/linkedin-api-ts/security/advisories/new) instead of opening a public issue.

## Roadmap

- [ ] Browser extension ("LinkedIn Auth Helper") — one-click `apiKey` generation for non-programmers
- [ ] CLI tool
- [ ] Company page scraping
- [ ] Job search

## License

MIT — This project is not affiliated with or endorsed by LinkedIn. Using your account's session cookies may risk account restriction. Use responsibly.
