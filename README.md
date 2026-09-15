# Noderunners Radio website

Noderunners Radio is a community radio station with a Lightning jukebox. Listeners pay a few sats to request a song. This repository holds the public pages of https://noderunnersradio.com.

The code is static HTML, CSS and JavaScript. The pages talk to the station's API at noderunnersradio.com for the stream, the jukebox, now-playing data and the funding counter.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Homepage: player, jukebox, now playing, backdrops |
| `funding.html` | How the station is funded |
| `manifesto.html` | What the station is and why it exists |
| `dj-handbook.html` | Handbook for DJs who host a live session |
| `obs-guide.html` | How to set up OBS for a live session |
| `progress.html` | The progress log |
| `roadmap.html` | What is planned |
| `why-sats.html` | Why a request costs sats |
| `overlay.html` | Browser overlay for live streams (OBS) |

## Assets

`assets/` holds the logo, favicons, images, the page-edit helper (`nr-edit.js`) and two third-party scripts (`hls.min.js`, `qrcode.min.js`).

`assets/backdrops/` holds the backdrop index (`index.json`) and the thumbnails (`t/`). The full-size backdrop images are served from the station and are not in this repository.

## Not in this repository

The station API, the jukebox backend, the bots (Telegram, X, Nostr), the stream servers and the captain's console are not part of this repository. Only the public pages and the files they use are here.

## View locally

Open `index.html` in a browser. The pages call the live station API at noderunnersradio.com, so the player, the jukebox and the live data need a network connection. The full-size backdrops load from the station too.

## Licence

- The code (the HTML, CSS and JavaScript written for this site) is licensed under the GNU General Public License v3.0. See `LICENSE`.
- The texts, logo, artwork, images and the name "Noderunners Radio" are copyright Noderunners Radio, all rights reserved. They are not covered by the GPL. See `NOTICE.md`.
- `assets/hls.min.js` and `assets/qrcode.min.js` are third-party files and keep their own licences. See `NOTICE.md`.
