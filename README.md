# Live Pomodoro

An animated room with a shared 25-minute focus / 5-minute break rhythm. The clock is derived from absolute time, so refreshing or reopening the tab restores the current session. Lighting follows each visitor's local time.

The first release includes working and headphone poses, seated and standing stretches, direct cat play, ambient room movement, saved preferences, optional desktop notifications/chimes, and screen wake lock. Live presence and screen artwork are deferred. Walking and pushups are intentionally excluded.

## Develop and verify

Use Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

`npm run art` regenerates runtime WebP sheets from the retained source art. It is not required during deployment: the reviewed runtime images are committed.

## Deploy

Build output is a standalone static site in `dist/`. No API keys, database, or presence server are needed. `.openai/hosting.json` identifies the private Sites staging deployment. The root `wrangler.toml` also supports Cloudflare Workers Static Assets without a Worker entry point; with Cloudflare access configured, use `npx wrangler deploy` after building.

See [Cloudflare static asset configuration](https://developers.cloudflare.com/workers/static-assets/binding/) for the hosting contract.

## Browser behavior

- Calm and reduced-motion preferences suppress character activities.
- The countdown recomputes from the current clock after tab visibility changes.
- Notifications require browser permission and an open page. Browsers may delay alerts in background tabs; closed-page push notifications are not supported. Some mobile browsers do not support desktop notifications.
- Sound needs a user interaction to unlock browser audio, including after a reload. Switch Sound on to hear a sample.
- Wake lock depends on browser support, visibility and battery policy.
- Preferences stay in local storage; the app has no accounts or visitor-count collection.

## Release notes

[RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) records validation and outstanding checks. [PROGRESS.md](PROGRESS.md) tracks scope. [art/SPRITE_WORKFLOW.md](art/SPRITE_WORKFLOW.md) documents the current art and prompts; earlier plans are historical.
