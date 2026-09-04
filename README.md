# Live Pomodoro

A developer is always mid-pomodoro in his room. You open the page and he is already seventeen minutes into a focus block, so you join a rhythm that is already moving instead of starting one.

The cycle is derived from the Unix epoch rather than from your click, so every visitor on earth sees the identical state at the identical moment. It is a shared clock, not a personal one. **He starts focusing on the hour and the half hour.**

The room is lit by your own local time, so the shared rhythm arrives in your light.

Outside the window there is a power line. Every person focusing right now is a bird sitting on it.

## How it works

Twenty five minutes of focus, five minutes of break, forever. A thirty minute cycle divides the day into exactly forty eight blocks, which is why it lands on `:00` and `:30`.

```
elapsed  = Date.now() % 1_800_000
phase    = elapsed < 1_500_000 ? 'focus' : 'break'
```

The clock needs no server. The only networked feature is the live count of people focusing alongside you, and the room works perfectly without it.

## Stack

| Layer | Choice |
|---|---|
| Build | Vite 6, React 19, TypeScript strict |
| Styling | Tailwind v4 for HUD, plain CSS for the scene |
| Animation | CSS keyframes plus one rAF loop, Motion for birds only |
| Tests | Vitest |
| Presence | Cloudflare Durable Object, WebSocket Hibernation |
| Hosting | Cloudflare Pages and Workers, one project |

One `requestAnimationFrame` loop writes CSS custom properties onto the root element and CSS does everything else. React renders the DOM once and then essentially never re-renders, except the countdown text at 1Hz. There is no per-frame React work anywhere in this project.

## Documentation

| File | Contents |
|---|---|
| [PLAN.md](PLAN.md) | Full build plan: design read, clock math, art pipeline, motion spec, architecture |
| [DEV_LEARN.md](DEV_LEARN.md) | The techniques behind this, taught from the code, with resources |
| [ART_PROMPTS.md](ART_PROMPTS.md) | Ready-to-paste prompts for all 35 art assets |
| [PROGRESS.md](PROGRESS.md) | Task tracker, phases 0 to 10, including the asset generation checklist |

## Development

Not yet scaffolded. See Phase 0 in [PROGRESS.md](PROGRESS.md).
