# Happy Birthday, Shubh!

A single-page birthday surprise. The deployable static site is in `dist/` and has no runtime dependencies or build step.

## Preview locally

From `D:\Z_shubh`, run `python -m http.server 4173 -d dist` and open `http://localhost:4173`.

## Photographs

The six original photographs stay in `img/`. The site uses optimized copies in `dist/assets/photos/`. To regenerate those copies after changing an original, run `powershell -File .\scripts\prepare-photos.ps1` from the project root. The script crops screenshot controls from several images without cutting off Shubh's face.

The presentation order, short messages, image descriptions, and screen positions are defined in the `photos` array at the top of `dist/app.js`: img5, img6, img3, img4, img2, then the close-up img1. After the gift opens, each photo fills one screen for 3.6 seconds; the close-up stays for 3 seconds. A separate final wish follows the six photos. Visitors can advance with a left or upward swipe, a downward scroll, a tap on the right side, or the right/down arrow keys. Reverse those directions to go back. A center tap or Space pauses and resumes the photos. Automatic advance pauses while the tab is hidden and is disabled for reduced motion.

## Wording

The introduction and final wish are in `dist/index.html`; the photo messages are in `dist/app.js`. The final screen includes `Made by Dipak`. Keep the greeting exactly `Happy Birthday, Shubh!` if preserving the original request.

## Background music

The optional background track is `dist/assets/audio/happy-birthday-to-you-classical-serge-quadrado.mp3`. The visitor starts or mutes it with the visible music control; it never starts automatically. It continues across scenes and fades out at the final wish. The MP3 was downloaded from [Free Music Archive](https://freemusicarchive.org/music/serge-quadrado/happy-birthday-to-you-instrumentals/happy-birthday-to-you-classical/) and is credited on the final screen under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/). This site is intended for personal, non-commercial sharing.

## Hosting

The `dist/` folder can be hosted on any static site host. It is configured for ChatGPT Sites through `.openai/hosting.json`.
