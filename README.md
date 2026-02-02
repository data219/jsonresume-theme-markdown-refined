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

## Notes

- This is a JSON Resume theme module (consumed by `resume-cli`).
- Output aims to be stable across runs.

