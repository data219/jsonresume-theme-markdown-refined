# Repository Guidelines

## Project Structure & Module Organization
- `index.js` contains the JSON Resume theme renderer (exports `render`).
- `package.json` defines the package metadata (no build scripts).
- `README.md` documents install and usage; `CHANGELOG.md` tracks releases.

## Build, Test, and Development Commands
- `npm install --save-dev git+ssh://git@github.com:data219/jsonresume-theme-markdown-refined.git` installs the theme locally (recommended).
- `npx resume-cli export resume.json --format md --theme jsonresume-theme-markdown-refined` renders Markdown from a JSON Resume.
- No build/test scripts are defined in `package.json` at this time.

## Coding Style & Naming Conventions
- JavaScript (Node/CommonJS): functions are camelCase, exported via `module.exports`.
- Indentation: 2 spaces (see `index.js`).
- Strings use double quotes; prefer small, pure helper functions.
- No formatter or linter config is present; keep style consistent with `index.js`.

## Testing Guidelines
- No automated tests or test framework are configured.
- If you add business logic, include a minimal test setup and document how to run it.
- If you introduce tests, follow `*.test.js` naming and keep fixtures in `test/fixtures/`.

## Commit & Pull Request Guidelines
- Git history shows Conventional Commits (e.g., `feat: ...`). Continue this format.
- No PR template is present; include a short description, rationale, and test notes.
- If output changes, attach a before/after Markdown sample.

## Security & Configuration Tips
- Treat resume input as untrusted; sanitize/escape output where needed.
- Avoid logging personal data from resumes; keep examples anonymized.

## Agent-Specific Notes
- Keep output deterministic; avoid non-deterministic ordering or timestamps.
- Prefer small, isolated changes with clear examples in `README.md` if behavior changes.
