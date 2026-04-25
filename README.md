# WriteGooderer

![License: MIT](https://img.shields.io/github/license/victorhuangwq/WriteGooderer)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/tested%20with-vitest-6E9F18?logo=vitest&logoColor=white)
![Chrome MV3](https://img.shields.io/badge/Chrome-MV3-4285F4?logo=googlechrome&logoColor=white)
![On-device AI](https://img.shields.io/badge/AI-on--device-00A67E)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)
![GitHub stars](https://img.shields.io/github/stars/victorhuangwq/WriteGooderer?style=social)

WriteGooderer is a Chrome extension that proofreads and rewrites text in the page you're already typing in. It runs on Chrome's built-in, on-device AI — nothing you write leaves the browser.

![WriteGooderer in action](assets/screenshot.png)

Click into a text field, a floating `W` appears, and from there you can catch typos, score how the sentence is landing, or swap the whole thing into a different tone without tabbing away.

## Install

1. Clone this repo: `git clone https://github.com/victorhuangwq/WriteGooderer.git`
2. Open `chrome://extensions` and turn on **Developer mode**
3. Click **Load unpacked** and select the `dist/` folder

That's it — the extension is now active. See [Requirements](#requirements) if the popup says the Prompt API is unavailable.

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

## License

Released under the [MIT License](LICENSE).
