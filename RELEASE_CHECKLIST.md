# Release verification — 2026-09-15

## Verified

- Automated full 25-minute focus / 5-minute break cycle with animation frames unavailable; each boundary alerts once.
- Wall-clock recovery after sleep; no notification on initial load; timers clean up on unmount.
- Notification permission gating and unsupported delivery handling.
- Audio is not created by an unsolicited phase change; rejected autoplay resumes are handled.
- Wake lock avoids duplicate acquisition, reacquires a released lock, and releases on unmount.
- Browser checks: settings at 390 × 844 and 320 × 568, saved sound after reload, Escape dismissal and focus restoration; desktop back stretch renders.
- Seated atlas loading is independent of floor sheets. Failed or unfinished floor sheets keep the seated character visible.

## Platform limits and follow-up

- Background timer callbacks may still be throttled by the browser; sleeping devices and closed pages cannot deliver timely alerts. There is no push service.
- Notification permission is denied in the verification browser, so actual operating-system notification display requires a permitted browser.
- Sound needs a fresh user gesture after reload. Physical speaker output and mobile Safari should be checked on real devices.
- Narrow portrait view intentionally crops the room; landscape shows more of the room and floor activities.
- Slow-network behavior was reviewed in code; a throttled-network performance measurement and a real-device soak test remain to be performed.
