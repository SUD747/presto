# Add-on listing copy

Paste-ready text for the addons.mozilla.org submission form.

## Name

Taken from the manifest, so it is already set:

```
Presto – Video Speed Control
```

The toolbar popup and this repository keep the short form, "Presto". Only the
store listing needs the descriptive tail, so that people searching for a speed
controller find it.

## Categories

**Photos, Music & Videos.** It is the only category that fits, and it is where
people browsing for a player tool will look. Add **Other** as a second choice
only if the form insists on two.

## Add-on URL (slug)

```
presto-video-speed
```

## Summary

Shown in search results. The limit is 250 characters.

```
Playback speed control for every video on the web, not just YouTube. A control sits on each video, plus keyboard shortcuts. Works inside embedded players, and holds your speed through ad breaks and quality changes.
```

## Description

AMO accepts a little HTML here: `<b>`, `<i>`, `<a>`, `<ul>`, `<li>`, `<br>`.

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

## Screenshots

Upload both, in this order:

1. `docs/screenshot.png` — the control on a real video
2. `docs/popup.png` — the settings popup

## Other fields

- **License**: MIT
- **Privacy policy**: not needed. The manifest already declares that no data is
  collected, and the description says so.
- **Support site**: the GitHub repository, once it exists.
