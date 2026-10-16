# KRMII Sketchbook

A personal sketchbook-style blog built as a dependency-free static site. It can be opened locally, hosted from GitHub Pages, or moved to another static host without a build step.

The site is **dark-first** and follows the **Analog Violet** desktop palette: deep violet-plum backgrounds (`#1A1020`), lavender and lilac type, and burnt-orange accents (`#C56A22`). A light theme is available through the header toggle.

The homepage leads with the notes: a short intro strip, then the latest posts, the searchable archive, about, and newsletter.

## Run it locally

Open `index.html` in a browser. If your browser blocks local scripts, run a tiny local server from this folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Add a blog post

Open `data/posts.js` and add a new object at the top of `window.posts`. Copy an existing post and change:

- `slug`: URL-safe unique ID
- `title`, `excerpt`, `date` (dd-mm-yyyy), `label`
- `body`: an array of paragraphs

The homepage and archive update automatically. No database or CMS is needed for the starter version.

## Customize the site

- Main content and page structure: `index.html`
- Colors, typography, responsive layout: `styles.css`
- Filtering, search, article modal, theme toggle: `app.js`
- Font choice: Google Fonts are loaded in `index.html` and `styles.css`
- Design tokens source: `design-system/krmii-sketchbook/MASTER.md`

For GitHub setup and publishing instructions, see `GITHUB-SETUP.md`.
