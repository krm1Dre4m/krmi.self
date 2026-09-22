# KRMII Sketchbook

A personal sketchbook-style blog built as a dependency-free static site. It can be opened locally, hosted from GitHub Pages, or moved to another static host without a build step.

## Run it locally

Open `index.html` in a browser. If your browser blocks local scripts, run a tiny local server from this folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Add a blog post

Open `data/posts.js` and add a new object at the top of `window.posts`. Copy an existing post and change:

- `slug`: URL-safe unique ID
- `title`, `excerpt`, `date`, `label`, `readTime`
- `accent`: `blue`, `yellow`, `pink`, or `green`
- `body`: an array of paragraphs

The homepage and archive update automatically. No database or CMS is needed for the starter version.

## Customize the site

- Main content and page structure: `index.html`
- Colors, typography, responsive layout: `styles.css`
- Filtering, search, article modal, theme toggle: `app.js`
- Font choice: Google Fonts are loaded in `index.html` and `styles.css`

For GitHub setup and publishing instructions, see `GITHUB-SETUP.md`.
