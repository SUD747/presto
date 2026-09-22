# Presto

Playback speed control for every video and audio element on the web, not just
YouTube. It works inside embedded players, holds your speed through ad breaks,
quality switches and single-page navigation, and remembers it for the next
video you open.

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

Any of them can be changed: open the toolbar popup, click a key, and press the
one you want instead. If you pick a key another action already uses, the two
trade places rather than collide. This matters on layouts where `[`, `]` and
`\` sit behind AltGr, which is most of continental Europe.

Speed ranges from 0.25x to 16x. Chrome mutes audio above roughly 4x, which is
the browser's behaviour, not this extension's.

The speed is remembered. Set a lecture to 2x and the next video starts at 2x
rather than dropping back to normal, so there is nothing to set again each time.
Press `\` or click the speed readout to return to 1x, which is remembered the
same way.

![the popup, with the step sizes and a rebindable key for each shortcut](docs/popup.png)

The step defaults to 0.25. Set it from the toolbar popup, or cycle it with `;`
through 0.05, 0.1, 0.25, 0.5 and 1. Either way the choice is saved and follows
your browser profile, as the speed and the key bindings do.

## Install

**Firefox** — [get it from addons.mozilla.org](https://addons.mozilla.org/en-US/firefox/addon/presto-video-speed-control/).

**Chrome, Edge, Brave** — not on the Chrome Web Store yet, so load it from
source: open `chrome://extensions`, turn on Developer mode, click *Load
unpacked*, and select this folder.

Content scripts only inject into pages loaded after the extension is installed,
so reload any tab you already had open.

On Android there is no keyboard, so the control on the video is the whole
interface: tap `<<` and `>>` to change speed and tap the readout to return to
1x. The step size is set from the popup, reached through the browser menu under
*Extensions*.

| Browser | Status |
|---------|--------|
| Chrome, Edge, Brave, and other Chromium browsers | Supported |
| Firefox 142 and later | Supported |
| Firefox for Android 142 and later | Supported |
| Safari | Coming soon |

## Privacy

Presto collects and transmits nothing. It has no background worker, no
analytics, and makes no network requests of any kind. Its one permission is
`storage`, which holds three things and nothing else: your step size, the speed
you last chose, and your key bindings.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for
the layout, how to run the tests, and how a release is published.

Security reports go through [SECURITY.md](SECURITY.md) rather than the issue
tracker.

## License

MIT, see [LICENSE](LICENSE).
