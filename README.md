# Moxie · Funding Floor — Dashboard (GitHub Pages build)

This is the externalized, GitHub-Pages-ready version of the Moxie dashboard.
The heavy inline HTML file has been split so the HTML itself is tiny (~2 KB) and
the CSS/JS load as separate cached files.

## Structure

```
/
├── index.html            ← lean HTML (~2 KB): references the assets below
└── assets/
    ├── bootstrap.js       ← loads React/ReactDOM/Recharts from CDN + prefetches data
    ├── app.css            ← all styles (minified)
    ├── preflight.js       ← shows a message if a CDN library is blocked
    └── app.js             ← the application (React.createElement, no build step)
```

All paths are **relative**, so it works under a GitHub Pages project subpath
(e.g. `https://USERNAME.github.io/REPO/`) without changes.

## Deploy to GitHub Pages

1. Create a new GitHub repository (e.g. `moxie-dashboard`).
2. Upload the contents of this folder to the repo root — so the repo has
   `index.html` at the top level and an `assets/` folder beside it.
   (Drag-and-drop works: GitHub repo → **Add file → Upload files** → drop
   `index.html` and the `assets` folder → **Commit**.)
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a branch**.
5. Set **Branch** to `main` and folder to `/ (root)`, then **Save**.
6. Wait ~1 minute. GitHub shows the live URL, e.g.
   `https://USERNAME.github.io/moxie-dashboard/`.
7. Open that URL to confirm the dashboard loads (it should look identical to
   the single-file version and show your live data).

## Embed in Lofty

In a Lofty **Custom HTML / Code** widget, paste only this (replace the URL):

```html
<iframe
  src="https://USERNAME.github.io/moxie-dashboard/"
  title="Moxie Funding Floor"
  style="width:100%; height:1200px; border:0; display:block;"
  loading="lazy"></iframe>
```

Lofty now holds ~5 lines instead of a 320 KB file, so the size/loading problem
goes away — the browser loads the dashboard directly from GitHub Pages.

> The iframe height is fixed (`1200px` above). Set it tall enough for your
> tallest view. If you want the iframe to auto-grow with the content, ask for
> the auto-resize snippet.

## Updating later

Change a file, and re-upload just that file to the repo (or `git push`). GitHub
Pages redeploys automatically in ~1 minute. Because the CSS/JS are separate,
editing the app doesn't force browsers to re-download the font or libraries.

To force a refresh through caches after an update, hard-refresh
(Cmd/Ctrl + Shift + R), or bump a version query in the iframe src
(e.g. `.../moxie-dashboard/?v=2`).

## Notes

- **Not a bundler build.** This app was hand-authored using
  `React.createElement` (no JSX, no Vite/CRA). So there is no webpack/Vite
  production build to run — externalizing the CSS/JS as done here *is* the
  correct production layout for it.
- **Libraries via CDN.** React 18.2.0, ReactDOM 18.2.0, and Recharts 2.12.7
  load from cdnjs with an unpkg fallback (version-pinned). No new dependencies
  were introduced.
- **CSS is minified.** JS is left unminified on purpose to guarantee identical
  behavior; you can run a proper minifier (e.g. `terser`) on `assets/app.js`
  later if you want to shave more size, but it is not required.
