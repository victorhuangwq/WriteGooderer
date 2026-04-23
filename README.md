# WriteGooderer

WriteGooderer is a Chrome extension that proofreads and rewrites text in the page you're already typing in. It runs on Chrome's built-in, on-device AI — nothing you write leaves the browser.

Click into a text field, a floating `W` appears, and from there you can catch typos, score how the sentence is landing, or swap the whole thing into a different tone without tabbing away.

## What It Does

- Catches grammar, spelling, punctuation, and clarity slips
- Assigns a Gooderness score from `0` to `100`
- Shows inline, diff-style corrections before anything gets applied
- Rewrites selections in preset tones: Professional, Friendly, LinkedIn Influencer, Passive Aggressive
- Remembers your last tone and any sites you've muted it on
- Runs fully on-device through Chrome's Prompt API

## Requirements

- Chrome `138+`
- A Chrome build that ships the Prompt API
- The Gemini Nano model downloaded locally

If the popup tells you the Prompt API is unavailable:

1. Open `chrome://flags`
2. Enable `Prompt API for Gemini Nano`
3. Open `chrome://components`
4. Update the on-device model if Chrome hasn't already pulled it down

## How It Works

The heavy lifting on top of the Prompt API is done by [`simple-chromium-ai`](https://www.npmjs.com/package/simple-chromium-ai), which handles session creation, cloning, and structured JSON responses so the extension can stay focused on UI and prompts. Sessions are prewarmed, cloned per request, and destroyed once the proofread or rewrite is done — fast to respond, nothing lingering in memory.

The rest of the code is organized like this:

- `src/content/` — the floating button and the in-page card UI
- `src/popup/` — the extension action popup
- `src/background/` — the MV3 service worker
- `src/shared/` — prompts, storage helpers, types, and score/tone constants

## Using it

1. Click into a supported field; the floating `W` shows up
2. Open the card to proofread or pick a tone
3. Look over the diff or the rewritten version
4. Apply it back into the field

## Contributing

Contributions welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, dev commands, and PR guidelines, and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community expectations.

## Notes

- Manifest V3 extension
- Does not run on `chrome://...` pages — Chrome won't let it, and fair enough
- Per-site enable/disable state lives in `chrome.storage.local`

## License

Released under the [MIT License](LICENSE).
