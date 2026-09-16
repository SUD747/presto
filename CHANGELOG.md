# Changelog

Notable changes to Presto. Versions follow [semantic versioning](https://semver.org),
and every submission to an add-on store needs a new version number.

## 1.0.0 — 2026-09-15

First release, published on [addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/presto-video-speed-control/).

### Added

- Playback speed control for every `video` and `audio` element on any site.
- An on-video control in the corner of each player: slower, the current speed,
  faster. Clicking the speed toggles back to 1x and back again.
- Keyboard shortcuts: `]` faster, `[` slower, `\` toggle 1x, `;` change the
  step size.
- A toolbar popup for choosing the step size, from 0.05 to 1, and for reading
  the shortcuts. The choice is saved and follows your browser profile.
- Speed is re-asserted when a player resets it, which happens on ad breaks,
  quality switches, and moving to the next video.
- Videos inside iframes and inside shadow DOM are found and controlled, with
  all frames driven from one speed.
- Firefox support alongside Chromium browsers, from the same source.
