# jsonresume-theme-markdown-refined

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Deterministic Markdown renderer for [JSON Resume](https://jsonresume.org/) (v1.x schema). Built for reproducible output and easy downstream processing.

## Install

### Global

```bash
npm install -g git+ssh://git@github.com:data219/jsonresume-theme-markdown-refined.git
```

### Project-local (recommended)

```bash
npm install --save-dev git+ssh://git@github.com:data219/jsonresume-theme-markdown-refined.git
```

## Usage

```bash
# Markdown export
npx resume-cli export resume.json --format md --theme jsonresume-theme-markdown-refined
```

## Testing

```bash
npm test
```

## Country name language

Default country names are English. To switch language to German, set:

```bash
JSONRESUME_THEME_MARKDOWN_COUNTRY_LANG=de
```

## Contact layout example

Before:

```md
- jan@markmann.work
- https://data219.github.io
- Eime, Germany
- LinkedIn: jan-markmann (https://www.linkedin.com/in/jan-markmann)
```

After:

```md
- 📍 Eime, Germany
- ✉️ [jan@markmann.work](mailto:jan@markmann.work)
- 🔗 [data219.github.io](https://data219.github.io)
- 👤 [www.linkedin.com/in/jan-markmann](https://www.linkedin.com/in/jan-markmann) (LinkedIn)
```

## Notes

- This is a JSON Resume theme module (consumed by `resume-cli`).
- Output aims to be stable across runs.
- If an entry has a start date but no end date, it renders `present` (or `heute` when language is `de`).
