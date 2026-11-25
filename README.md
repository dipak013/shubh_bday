# Happy Birthday, Shubh!

A single-page birthday surprise. The deployable static site is in `dist/` and has no runtime dependencies or build step.

## Preview locally

From `D:\Z_shubh`, run `python -m http.server 4173 -d dist` and open `http://localhost:4173`.

## Photographs

The six original photographs stay in `img/`. The site uses optimized copies in `dist/assets/photos/`. To regenerate those copies after changing an original, run `powershell -File .\scripts\prepare-photos.ps1` from the project root. The script crops screenshot controls from several images without cutting off Shubh's face.

The presentation order, image descriptions, and screen positions are defined in the `photos` array at the top of `dist/app.js`: img5, img6, img3, img4, img2, then the close-up img1. The portraits rotate every 4.8 seconds; the eye detail stays for 3 seconds. Visitors can also use Previous, Next, swipe, keyboard arrows, and the thumbnail filmstrip. Automatic rotation pauses on interaction, when the section is offscreen, when the tab is hidden, and when reduced motion is requested.

## Wording

The introduction, greeting, and closing wish are in `dist/index.html`. Keep the greeting exactly `Happy Birthday, Shubh!` if preserving the original request.

## Hosting

The `dist/` folder can be hosted on any static site host. It is configured for ChatGPT Sites through `.openai/hosting.json`.
