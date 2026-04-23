# WriteGooderer

WriteGooderer is a Chrome extension that proofreads and rewrites text directly inside webpages using Chrome's built-in on-device AI.

It adds a floating `W` button to supported text fields, scores your writing, suggests corrections, and can rewrite selected text in preset tones like Professional, Friendly, LinkedIn Influencer, or Passive Aggressive.

## What It Does

- Proofreads text for grammar, spelling, punctuation, and clarity
- Assigns a "Gooderness" score from `0` to `100`
- Shows inline diff-style corrections before you apply them
- Rewrites text in multiple tones without leaving the page
- Stores preferences locally, including last-used tone and disabled sites
- Runs fully on-device through Chrome's Prompt API

## Requirements

- Chrome `138+`
- A Chrome build with the Prompt API available
- The Gemini Nano model downloaded in Chrome

If the popup says the Prompt API is unavailable:

1. Open `chrome://flags`
2. Enable `Prompt API for Gemini Nano`
3. Open `chrome://components`
4. Update the on-device model component if Chrome has not already fetched it

## Local Development

Install dependencies:

```bash
npm install
```

Build the extension:

```bash
npm run build
```

Load it in Chrome:

1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click `Load unpacked`
4. Select the repo's `dist/` directory

## Development Commands

```bash
npm run build
npm run typecheck
npm run test
npm run test:e2e
```

`demo.html` is included as a local page for exercising supported fields like textareas, contenteditable editors, and compose boxes.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and PR guidelines, and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community expectations.

## How It Works

- `src/content/` injects the floating button and in-page card UI
- `src/popup/` contains the extension action popup
- `src/background/` hosts the MV3 service worker
- `src/shared/` holds prompts, storage helpers, types, and score/tone constants
- `simple-chromium-ai` manages Prompt API sessions and structured responses

The content script prewarms cached AI sessions, clones them per request, and destroys clones after each proofread or rewrite. That keeps interactions faster without keeping request state around longer than needed.

## Testing

Unit tests cover storage, prompts, constants, and field detection logic. End-to-end tests exercise the extension behavior through the demo page and mock AI mode.

## Current UX

- Click into a supported field to reveal the floating `W`
- Open the card to proofread or switch tone
- Review the diff or rewritten output
- Apply the result back into the field

## Notes

- This is a Manifest V3 extension
- It does not run on special Chrome pages like `chrome://...`
- Site-level enable/disable state is stored in `chrome.storage.local`

## License

Released under the [MIT License](LICENSE).
