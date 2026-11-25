# Happy Birthday, Shubh!

A single-page birthday surprise. The finished static site is in `dist/` and does not require a build step or external packages.

## Preview locally

From `D:\Z_shubh`, run `python -m http.server 4173 -d dist` and open `http://localhost:4173`.

## Add photos

1. Put 3–4 photos in `dist/assets/photos/` (create the folder if needed).
2. Edit the `photos` array at the top of `dist/app.js`. Set each `src`, a useful `alt` description, and the `position` for the crop. Remove the fourth array entry if you use only three photos. For example:

```js
{ src: './assets/photos/photo-1.jpg', alt: 'Shubh smiling outdoors', position: '50% 35%' }
```

The page currently uses four clearly marked photo placeholders because no images were in the workspace when it was built. If an image fails to load, that card displays a fallback.

## Edit the message

Update the greeting and wishes in `dist/index.html`. Keep the main greeting exactly `Happy Birthday, Shubh!` if you want to retain the original brief.

## Hosting

The `dist/` folder can be hosted on any static site host. It is also configured for ChatGPT Sites through `.openai/hosting.json`.
