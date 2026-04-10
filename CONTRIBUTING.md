# Contributing to linkedin-api-ts

Thanks for your interest in contributing! This is an unofficial LinkedIn API client and we welcome bug reports, fixes, new features, and documentation improvements.

## Development setup

Requirements:

- Node.js `>=20`
- [pnpm](https://pnpm.io/) `>=9`

```bash
git clone https://github.com/andrewchmr/linkedin-api-ts.git
cd linkedin-api-ts
pnpm install
```

## Running checks locally

Before opening a pull request, please make sure all of the following pass:

```bash
pnpm tsc --noEmit   # type check
pnpm test           # unit tests
pnpm run build      # bundles dist/
```

## Working with a real LinkedIn session

Most of the test suite uses recorded fixtures and does not need real cookies. If you are adding a feature that requires hitting the live Voyager API, copy your cookies into a local `.env` file (already gitignored):

```
LI_AT=...
JSESSIONID=...
```

Never commit cookies, raw Voyager dumps, or profile JSON for real people. The `.gitignore` blocks the common patterns, but please double-check `git status` before committing.

## Pull request guidelines

- Keep PRs focused. Unrelated refactors or formatting changes make review harder — open a separate PR.
- Add or update tests for any behavior change. Vitest specs live next to the file they cover (`*.test.ts`).
- Update `README.md` if you change the public API.
- Follow the existing code style. Prettier config is in `.prettierrc`.
- Conventional commit prefixes (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`) are appreciated but not required.

## Reporting bugs

Please open a [GitHub issue](https://github.com/andrewchmr/linkedin-api-ts/issues) with:

- A minimal reproduction (code snippet or steps)
- The version of `linkedin-api-ts` you are on
- Node.js version and OS
- The error message / stack trace, with any sensitive cookies redacted

## Reporting security issues

Please **do not** file public issues for security problems. Report them privately via [GitHub Security Advisories](https://github.com/andrewchmr/linkedin-api-ts/security/advisories/new).

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
