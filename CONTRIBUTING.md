# Contributing to WriteGooderer

Thanks for your interest in improving WriteGooderer.

## Prerequisites

- Node.js (LTS)
- Chrome `138+` with the Prompt API enabled and Gemini Nano downloaded (see [README](README.md#requirements))

## Setup

```bash
npm install
npm run build
```

Then load the unpacked extension from `dist/` via `chrome://extensions` (Developer Mode → Load unpacked).

## Development loop

```bash
npm run typecheck
npm run test          # unit tests
npm run test:e2e      # end-to-end tests via the demo page
```

`demo.html` is a local page for exercising textareas, contenteditable editors, and compose boxes.

## Pull requests

- Target `main`
- Keep PRs focused — one concern per PR
- Add or update tests for new logic in `src/shared/` and `src/content/`
- Run `npm run typecheck` and `npm run test` before pushing
- Match the existing commit style: short imperative subjects (see `git log`)

## Reporting bugs

Open an issue using the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md). Include your Chrome version, whether the Prompt API is available, and console output if relevant.

## Feature requests

Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md).
