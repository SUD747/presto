# Add-on listing copy

Paste-ready text for the addons.mozilla.org listing. This file is the source of
truth: change it in the same commit as any Developer Hub edit, so it never
drifts from what is published.

Fields marked **LIVE** match the published listing. Fields marked **TO SET** are
pending in the Developer Hub.

## Name

Taken from the manifest, so it is already set:

```
Presto – Video Speed Control
```

The toolbar popup and this repository keep the short form, "Presto". Only the
store listing needs the descriptive tail, so that people searching for a speed
controller find it.

## Categories — LIVE

The listing currently sits in **Other**, which is not a category anyone looking
for a speed controller would browse. Every competitor with real users is in
Photos, Music & Videos:

| Add-on | Daily users | Categories |
|---|---|---|
| Video Speed Controller | 102,066 | appearance, photos-music-videos, social-communication |
| Global Speed | 56,668 | photos-music-videos |
| Presto (now) | 0 | other |

Set to **Photos, Music & Videos** + **Games & Entertainment**, and Other
removed. The form allows up to 3.

Found in: Developer Hub → Edit Product Page → **Describe Add-on**.

## Add-on URL (slug) — LIVE

```
presto-video-speed-control
```

This differs from the value originally drafted here (`presto-video-speed`).
**Do not change it.** The published URL is already in the README, CHANGELOG,
the GitHub release, and the product page; changing the slug breaks all of them.

## Summary — LIVE

Shown in search results. What is published differs from the text originally
drafted here; the published version is good and is recorded as-is. Do not
rewrite it without a reason.

```
Control video and audio playback speed on any website, including embedded players. Use on-video controls or keyboard shortcuts to speed up, slow down, and adjust playback instantly.
```

## Description — DRAFTED, NOT LIVE

**The published description is not this text.** What is live opens with
"Control video playback at your own pace." and uses a six-item feature list. It
reads well and nothing in the current plan calls for replacing it, so it has
been left alone.

The version below is the longer draft originally written here. It is more
specific — it spells out the shortcut keys, the speed range, and why the speed
survives ad breaks. Worth considering at the next listing edit, but that is a
judgement call, not a pending task.

**If it is ever used, it needs converting first.** The draft below is written in
HTML (`<b>`, `<ul>`, `<li>`). The Developer Hub field is **Markdown** — it says
"Some Markdown supported" and the live description is stored as `**bold**` and
`### Features`. The API returns rendered HTML, which is what made the HTML
assumption look right.

```
Presto puts a small speed control in the corner of every video you watch, on any site.

Most speed controllers only work on YouTube, or quietly stop working when a site embeds its player in a frame. Presto handles both.

<b>Controls</b>

Use the control on the video, or the keyboard:

<ul>
<li><b>]</b> faster by one step</li>
<li><b>[</b> slower by one step</li>
<li><b>\</b> toggle between 1x and your last speed</li>
<li><b>;</b> change the step size</li>
</ul>

Speed ranges from 0.25x to 16x. The step defaults to 0.25 and can be set to 0.05, 0.1, 0.25, 0.5 or 1 from the toolbar popup.

<b>Why it keeps working</b>

Streaming players reset the playback rate when an ad plays, when the quality changes, or when you move to the next video. Presto notices and puts your speed back.

It reaches videos inside embedded frames and inside shadow DOM, which is where most speed controllers give up.

It claims its keys before the page does, so it still works on players that bind the same keys for something else.

<b>Privacy</b>

Presto collects nothing and sends nothing anywhere. It has no analytics and makes no network requests of any kind. The only thing it stores is your chosen step size.

Presto is free and open source under the MIT license.
```

## Tags — LIVE

**Tags are a fixed vocabulary of 42 checkboxes, not free text.** An earlier
draft of this file listed `video`, `speed`, `playback`, `audio`, `podcast`,
`education` and `accessibility` — **none of those exist as tags.** Do not plan
around invented tags again; the list is below.

Set (8 of a maximum 10), each one true of the add-on:

```
youtube
streaming
music
twitch
dailymotion
facebook
reddit
social media
```

Deliberately left off:

- `mp3`, `video downloader`, `video converter`, `download` — Presto does not
  touch files. Claiming these would be tag-spam.
- `privacy` — means privacy *tools* (blockers, VPNs). Presto is private, but it
  is not a privacy tool.
- `whatsapp` — Global Speed uses it, and speeding up voice notes is a real use
  case, but it has not been tested. Add it once someone confirms it works.
- `zoom` — refers to the Zoom app, not video zoom.

The full available vocabulary, for future reference:

```
ad blocker, anti malware, anti tracker, antivirus, chat, container,
content blocker, coupon, dailymotion, dark mode, dndbeyond, download, facebook,
google, image search, mp3, music, password manager, pinterest, pixiv, privacy,
reddit, roblox, scholar, search, security, shopping, social media, streaming,
torrent, translate, twitch, twitter, user scripts, video converter,
video downloader, vpn, wayback machine, whatsapp, word counter, youtube, zoom
```

Found in: Developer Hub → Edit Product Page → **Additional Details**.

## Add-on links — LIVE

Only a support *email* is published right now, which puts the address in the
clear and gives a visitor nowhere to look.

- **Homepage**

  ```
  https://sud747.github.io/projects/presto/
  ```

- **Support site**

  ```
  https://sud747.github.io/projects/presto/#feedback
  ```

The product page is the homepage rather than the bare repository because it
carries an install call-to-action and plain-language copy, and links to the
source itself — a non-technical visitor dropped into a source tree is lost.

Support points at that page's own feedback form rather than GitHub issues: it
takes a bug report with **no account required** and reaches the same inbox,
while still linking out to issues for anyone who prefers to track it there.
Both URLs use the trailing-slash form, which is the canonical after the site's
`trailingSlash` export fix.

Sequencing: the `#feedback` anchor comes from `id="feedback"` on the section in
`app/projects/[slug]/page.tsx` in the `SUD747.github.io` repository. Both that
and the `trailingSlash` fix need to reach `main` and deploy before these URLs
behave as intended. Neither breaks if set early — a missing anchor just lands
the visitor at the top of the page — but deploy first if you can.

## Developer comments — LIVE

Currently empty. The permissions block on the listing reads *"Access your data
for all websites"*, the most alarming string AMO prints, and nothing on the page
answers it. This is the cheapest conversion win available: someone who wants the
feature and bounces on that line is a lost install.

The point it has to land is **needing access to pages is not the same as
collecting data from them**. Keep implementation detail out.

Every claim below is verified against the source: `grep` finds no `fetch`,
`XMLHttpRequest`, `WebSocket`, or `sendBeacon` anywhere in `src/`; the manifest
declares exactly one permission (`storage`) and `data_collection: none`; and the
only key written is the step size. The "follows your Firefox profile" clause is
deliberate — `chrome.storage.sync` does leave the device, so claiming nothing
ever does would be wrong.

```
Presto needs access to all websites because a speed control that only worked on a fixed list of sites would not do its job. It has to find the video on whatever page you are watching it on, including players embedded from somewhere else.

Access to a page is not the same as collecting anything from it. Presto has no analytics and makes no network requests of any kind, so nothing about what you watch or where you watch it ever leaves your browser. The only thing it stores is the step size you choose, which follows your Firefox profile like any other setting.

The whole source is on GitHub under the MIT license, and it is short enough to read: https://github.com/SUD747/presto
```

## Screenshots — LIVE IN THE REPO, NOT YET UPLOADED

Three, all 1280x800 so the carousel is not ragged, all generated from the real
extension rather than mocked up. Upload in this order:

1. `docs/screenshot.png` — the control on a video, reading 2x
2. `docs/store-popup.png` — the popup: step sizes and the rebindable shortcuts
3. `docs/store-embedded.png` — the control inside an embedded player

The previews currently published are the old pair and should be replaced.

These fix the problems recorded earlier: the old preview 1 used third-party
video content with a hand-drawn arrow and the control was invisible at thumbnail
size, and preview 2 was portrait and a quarter the width of preview 1.

How they were made, in case they need regenerating: the backdrop is an
ffmpeg-generated abstract gradient, so there is no third-party content to
license. The control and the popup in the images are the real `src/content.js`
and `src/popup.js` rendered in a browser, not a mockup, so the screenshots
cannot drift from what the extension actually looks like. Each carries a
headline, because at carousel-thumbnail size the headline is what a reader can
actually make out — the control itself is only legible at full size.

`docs/popup.png` is the same popup at natural size, portrait, for the README.

## Other fields

- **License**: MIT — LIVE.
- **Privacy policy**: not needed. The manifest declares no data collection, and
  the description and developer comments both say so.
- **Release notes**: empty on 1.0.0. From the next version onward, paste the
  matching section of `CHANGELOG.md` at submission time.

## Where each field lives

The Developer Hub splits the listing across three separately-saved forms, which
is not obvious:

| Form | Fields |
|---|---|
| **Describe Add-on** | Name, Add-on URL, Summary, Description, Categories, support Email, support Website |
| **Additional Details** | Tags, Contributions URL, Default Locale, **Homepage** |
| **Technical Details** | **Developer Comments**, UUID, Whiteboard |

Homepage and the support Website are in different forms, and "Website" under
Describe Add-on is the *support* site, not the homepage. Each form has its own
Save Changes button.
