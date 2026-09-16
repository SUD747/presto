# Presto

Playback speed control for every video and audio element on the web, not just
YouTube. It works inside embedded players and holds your speed through ad
breaks, quality switches and single-page navigation.

![the control sits in the corner of the video](docs/screenshot.png)

## Use it

A small control sits in the top-right corner of every video: `<<` to slow down,
the current speed, `>>` to speed up. Clicking the speed toggles back to 1x and
back again. It fades when you are not pointing at it.

| Key | Action |
|-----|--------|
| `]` | faster by one step |
| `[` | slower by one step |
| `\` | toggle between 1x and your last speed |
| `;` | change the step size |

Speed ranges from 0.25x to 16x. Chrome mutes audio above roughly 4x, which is
the browser's behaviour, not this extension's.

![the popup, listing the step sizes and the shortcuts](docs/popup.png)

The step defaults to 0.25. Set it from the toolbar popup, or cycle it with `;`
through 0.05, 0.1, 0.25, 0.5 and 1. Either way the choice is saved and follows
your browser profile. The popup is also where the shortcuts are written down.

## Install

**Firefox** — [get it from addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/presto-video-speed-control/).

**Chrome, Edge, Brave** — not on the Chrome Web Store yet, so load it from
source: open `chrome://extensions`, turn on Developer mode, click *Load
unpacked*, and select this folder.

Content scripts only inject into pages loaded after the extension is installed,
so reload any tab you already had open.

| Browser | Status |
|---------|--------|
| Chrome, Edge, Brave, and other Chromium browsers | Supported |
| Firefox 142 and later | Supported |
| Firefox for Android 142 and later | Expected to work, untested |
| Safari | Needs separate packaging, not attempted |

## Privacy

Presto collects and transmits nothing. It has no background worker, no
analytics, and makes no network requests of any kind. Its one permission is
`storage`, used to remember your step size and nothing else.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for
the layout, how to run the tests, and how a release is published.

Security reports go through [SECURITY.md](SECURITY.md) rather than the issue
tracker.

## License

MIT, see [LICENSE](LICENSE).
