# Universal Video Speed

Playback speed control for every `<video>` and `<audio>` on the web, not just
YouTube. It works inside iframes, inside shadow DOM, and it holds your speed
through ad breaks, quality switches, and single-page navigation.

![the control sits in the corner of the video](docs/screenshot.png)

## Use it

A small control sits in the top-right corner of every video: `<<` to slow down,
the current speed, `>>` to speed up. Clicking the speed toggles back to 1x and
back again. It fades when you are not pointing at it.

| Key | Action |
|-----|--------|
| `]` | faster by 0.25 |
| `[` | slower by 0.25 |
| `\` | toggle between 1x and your last speed |

Speed ranges from 0.1x to 16x. Chrome mutes audio above roughly 4x, which is the
browser's behaviour, not this extension's.

## Install

Not on any extension store yet, so load it from source.

**Chrome, Edge, Brave** — open `chrome://extensions`, turn on Developer mode,
click *Load unpacked*, and select this folder.

**Firefox** — open `about:debugging#/runtime/this-firefox`, click
*Load Temporary Add-on*, and select `manifest.json`.

Content scripts only inject into pages loaded after the extension is installed,
so reload any tab you already had open.

## How it works

Three problems make a naive speed controller feel broken, and each one is
handled in `content.js`.

**Players reset the rate behind your back.** Adaptive players reassign
`playbackRate` on quality switches, ad transitions, and source changes. Every
media element gets a guarded `ratechange` listener that re-asserts your speed.

**Every frame is an island.** Each frame on a page runs its own isolated copy of
the content script, so a key pressed in the top frame cannot reach a video in an
embedded player, and a key pressed while an embedded player has focus cannot
reach anything else. All speed changes are relayed to the top frame, which owns
the speed and broadcasts it down the whole frame tree. No frame applies a speed
on its own.

**Sites bind the same keys.** The key listener runs on `window` in the capture
phase and stops propagation, so it wins against players that bind their own
shortcuts. It bails out when you are typing in a field.

The control is positioned over each video rather than inserted into the player's
own markup, which keeps it from breaking sites that rebuild their controls.

## Develop

```sh
node test.js                             # unit tests
python3 -m http.server -d test 8000      # then open http://localhost:8000/page.html
```

Serve the test page over http rather than opening the file directly, or Chrome
will make you grant file-URL access separately.

The test page covers the cases that are easy to get wrong: a plain video, one
inside a shadow root, one inside an iframe, typing in a text field, and a video
added after load. For the ad-break and quality-switch behaviour, use a real site.

`test.js` extracts the speed function out of `content.js` rather than restating
it, so changing the step or the clamp fails the test.

The test clip and the icons are committed, and regenerated with:

```sh
ffmpeg -f lavfi -i testsrc=size=320x240:rate=30 -t 20 -pix_fmt yuv420p test/clip.mp4
for s in 16 32 48 128; do rsvg-convert -w $s -h $s icons/icon.svg -o icons/icon$s.png; done
```

## Contributing

Issues and pull requests are welcome. Keep `content.js` dependency-free and a
single file. If you change behaviour, add a case to `test.js` when it is
testable without a browser, or to `test/page.html` when it is not, and say in
the pull request which sites you checked it against.

## License

MIT, see [LICENSE](LICENSE).
