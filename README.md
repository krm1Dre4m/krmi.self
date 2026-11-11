# KRMII Sketchbook

A tiny, dependency-free personal journal. Built with plain HTML, CSS, and JavaScript; no build step, database, or CMS.

## Reading

The journal uses a full-width, borderless personal-wiki layout with the editorial plum-and-mauve palette. The header holds the journal identity and theme control; a compact page tree on the left groups entries by **year → month → post**, newest first. Breadcrumbs above each entry show its year and month. Years and months expand and collapse. Selecting an entry opens it in the main reading pane, with an address like `#note/my-entry` that can be shared or bookmarked.

On smaller screens, use the **Archive** button to open the drawer. The light/dark theme choice is saved in your browser.

## Run locally

Run `python3 -m http.server 8000` in this directory, then open http://localhost:8000. It can also run on GitHub Pages or another static host.

## Write an entry

Edit `data/posts.js` and append or prepend an object to `window.posts`:

```js
{
  slug: "a-quiet-sunday",
  title: "A quiet Sunday",
  date: "12-11-2026",
  labels: ["Life", "Coding"], // optional; use as many as you like
  body: [
    "A paragraph of text.",
    { image: "assets/sunset.jpg", alt: "Sunset outside", caption: "Optional caption" },
    "Another paragraph."
  ]
}
```

- `slug` must be unique and URL-safe; use lowercase words separated by hyphens.
- `date` accepts `dd-mm-yyyy` or `yyyy-mm-dd`.
- `body` supports plain text paragraphs and image blocks.
- Add images to `assets/` and reference them from the entry.
- Entries and archive groups are **sorted automatically by date** regardless of array order.
- `labels` is an optional array of strings shown as subtle tags beneath the title. Use `labels: []` (or omit it) for an unlabelled entry.
- No `excerpt` is needed. Older entries using a single `label` string still render, though `labels` is the preferred format.

## Files

- `index.html`: reader and archive structure.
- `styles.css`: responsive layout and color tokens.
- `app.js`: archive grouping, entry routing, theme, and mobile drawer.
- `data/posts.js`: journal content.

The default theme is the editorial journal's muted plum palette with soft Nunito Sans typography, an optional light mode, and a responsive mobile page-tree drawer. All existing entries and image paths were preserved during the redesign.
