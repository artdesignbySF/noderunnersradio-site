# Noderunners Radio website

Noderunners Radio is a community radio station with a Lightning jukebox. Listeners pay a few sats to request a song. This repository holds the public pages of https://noderunnersradio.com.

## Support the station ⚡

Noderunners Radio is not a business. Listeners, DJs and friends keep the ship afloat. If you enjoy the station, or this code is useful to you, please send a tip to the station's tip jar:

- **Lightning Address:** `radio@lnbits.plebprojects.com` (works from any Lightning wallet)
- **Zap on Nostr:** the station is [`npub1ua6fxn9ktc4jncanf79jzvklgjftcdrt5etverwzzg0lgpmg3hsq2gh6v6`](https://njump.me/npub1ua6fxn9ktc4jncanf79jzvklgjftcdrt5etverwzzg0lgpmg3hsq2gh6v6); zaps land in the same tip jar
- **Where the sats go:** https://noderunnersradio.com/funding

A tip is a gift to the station, never a payment for music. Every sat helps keep the radio on the air.

## How it works

The code is static HTML, CSS and JavaScript. The pages talk to the station's API at noderunnersradio.com for the stream, the jukebox, now-playing data and the funding counter.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | Homepage: player, jukebox, catalog ("Browse the ship"), now playing, history, backdrops |
| `play.html` | The one-page "play a song" guide with QR codes |
| `top.html` | The most requested songs |
| `first-sats.html` | "Your first sats": a beginner's guide to a Lightning wallet |
| `podcast.xml` | The podcast feed (Podcasting 2.0, with value-for-value) |
| `funding.html` | How the station is funded |
| `manifesto.html` | What the station is and why it exists |
| `dj-handbook.html` | Handbook for DJs who host a live session |
| `obs-guide.html` | How to set up OBS for a live session |
| `progress.html` | The progress log |
| `roadmap.html` | What is planned |
| `why-sats.html` | Why a request costs sats |
| `overlay.html` | Browser overlay for live streams (OBS) |

## Assets

`assets/` holds the logo, favicons, images, the page scripts and two third-party scripts (`hls.min.js`, `qrcode.min.js`).

Some scripts only draw something for the station's captain when he is logged in: the page editor (`nr-edit-2.js`), the rotation button (`nr-rot-1.js`) and the captain's playlists (`nr-mylists-1.js`). For everyone else they do nothing. The station checks the captain's login on every call, so the scripts hold no secrets.

`assets/backdrops/` holds the backdrop index (`index.json`) and the thumbnails (`t/`). The full-size backdrop images are served from the station and are not in this repository.

## Not in this repository

The station API, the jukebox backend, the bots (Telegram, X, Nostr), the stream servers and the captain's console are not part of this repository. Only the public pages and the files they use are here.

## View locally

Open `index.html` in a browser. The pages call the live station API at noderunnersradio.com, so the player, the jukebox and the live data need a network connection. The full-size backdrops load from the station too.

## Links

**The station**
- Website and player: https://noderunnersradio.com · request a song: https://noderunnersradio.com/play
- Telegram group and jukebox bot: https://t.me/noderunnersradio
- Live on Nostr: [zap.stream](https://zap.stream/naddr1qqgkummyv4e82mnwv4e8xttjv9jxjmczyq6cyfd8ctcrcxs0p9h3tawy3nggp68r9zc58zwmq9gk6gng8q6j7qcyqqq8vecwz2klw) · the station on Nostr: [`npub1ua6f…6v6`](https://njump.me/npub1ua6fxn9ktc4jncanf79jzvklgjftcdrt5etverwzzg0lgpmg3hsq2gh6v6)
- The jukebox on X: https://x.com/JukeboxLNDbot
- This code on GitHub: https://github.com/artdesignbySF/noderunnersradio-site · on gittr (Nostr): https://gittr.space/npub1ua6fxn9ktc4jncanf79jzvklgjftcdrt5etverwzzg0lgpmg3hsq2gh6v6/noderunnersradio-site

**Friends and sister projects**
- [Noderunners](https://noderunners.network): the Dutch bitcoin-only community the station grew from
- [Pleb Projects](https://plebprojects.com): the home of our other projects and the tools we like
- [Bitcoin Fortune Cookie](https://bitcoinfortunecookie.com): crack a cookie for a few sats
- [Pleb Royale](https://plebroyale.com): art and design

## Licence

- The code (the HTML, CSS and JavaScript written for this site) is licensed under the GNU General Public License v3.0. See `LICENSE`.
- The texts, logo, artwork, images and the name "Noderunners Radio" are copyright Noderunners Radio, all rights reserved. They are not covered by the GPL. See `NOTICE.md`.
- `assets/hls.min.js` and `assets/qrcode.min.js` are third-party files and keep their own licences. See `NOTICE.md`.
