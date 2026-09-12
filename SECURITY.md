# Security policy

Presto runs a content script on every page you visit, so it deserves more
scrutiny than its size suggests. Reports are welcome.

## Reporting a vulnerability

Use GitHub's private vulnerability reporting: open the **Security** tab on this
repository and choose **Report a vulnerability**. That keeps the report private
until a fix exists. Please do not open a public issue for a security problem.

This is a small project maintained by one person, so expect a reply in days
rather than hours. You will get an acknowledgement either way, including when a
report turns out not to be a vulnerability.

## Supported versions

Only the latest release is supported. Fixes ship as a new version to the add-on
stores rather than as patches to older ones.

## What is in scope

Presto has no server, no network requests, and no analytics. The interesting
surface is entirely local:

- The content script, which runs on every page and in every frame.
- The cross-frame relay, which passes messages between frames with `postMessage`.
- The popup, and the one setting it stores.

## Known and accepted

These are deliberate, already understood, and not treated as vulnerabilities.

**A page can change its own playback speed.** The cross-frame relay listens for
`postMessage` on the window, which any script on the page can send. A hostile
page could set the speed of its own videos to an unexpected value. It cannot
read anything back, reach another tab, or reach any extension API, and a page
can already set `playbackRate` on its own videos directly. Locking the relay to
an origin would break the embedded-player case the relay exists to solve.

**The stored step size is readable by the extension only.** It is a number
between 0.05 and 1, held in extension storage, and never sent anywhere.

**Broad host permissions are required, not incidental.** A universal speed
control has to reach every site. The extension requests no other permission
beyond `storage`.
