# KRMII Sketchbook

A tiny, dependency-free personal journal. Built with plain HTML, CSS, and JavaScript; no build step, database, or CMS.

## Reading

The journal uses a full-width, borderless personal-wiki layout with the editorial plum-and-mauve palette. The header holds the journal identity and theme control; a compact page tree on the left groups entries by **year → month → post**, newest first. Breadcrumbs above each entry show its year and month. Years and months expand and collapse. Selecting an entry opens it in the main reading pane, with an address like `#note/2` that can be shared or bookmarked. Visiting the site without a post URL opens the **September 22, 2026 introduction** (ID `0`), which is also directly accessible at `#note/0`.

On smaller screens, use the **Archive** button to open the drawer. The light/dark theme choice is saved in your browser.

## Run locally

Run `python3 -m http.server 8000` in this directory, then open http://localhost:8000. It can also run on GitHub Pages or another static host.

## Write an entry

Edit `data/posts.js` and append or prepend an object to `window.posts`:

```js
{
  id: 4,
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

- `id` must be a unique non-negative integer. **ID `0` is reserved for the introductory page.** Give every new entry a new number (4, 5, 6, ...), even if you reorder entries or edit their titles later. **Do not renumber old entries:** their IDs are permanent links.
- `date` accepts `dd-mm-yyyy` or `yyyy-mm-dd`.
- `body` supports plain text paragraphs, individual images, and optional interactive photo stacks.
- Standalone images appear in a subtle centered plum frame, up to 560px wide.

### Stack several photos

Put a `stack` block among your paragraphs to create a small pile of photographs:

```js
body: [
  "A few moments from today.",
  {
    stack: [
      { image: "assets/first.jpg", alt: "A rainy street" },
      { image: "assets/second.jpg", alt: "The café window" },
      { image: "assets/third.jpg", alt: "A sleepy cat" }
    ],
    caption: "little pieces of my day" // optional
  },
  "And that's about it."
]
```

Drag or flick the top photo sideways (mouse or touch) to send it to the back and reveal the next photo. The **Next photo** button also cycles through the stack, including for keyboard users. The count shows the current photo. Reduced-motion settings disable the throw animation. Each photo keeps its original aspect ratio and colors; the stack's viewing area does not crop it.

If a stack contains only one valid image, it is displayed as a normal framed photo. The `stack` block is optional; existing posts do not need to change.
- Add images to `assets/` and reference them from the entry.
- Entries and archive groups are **sorted automatically by date** regardless of array order. The numeric ID is independent of the display order.
- Previously shared slug and date-title links to the first two entries continue working for compatibility; all new links are numeric.
- `labels` is an optional array of strings shown as subtle tags beneath the title. Use `labels: []` (or omit it) for an unlabelled entry.
- No `excerpt` is needed. Older entries using a single `label` string still render, though `labels` is the preferred format.

## Files

- `index.html`: reader and archive structure.
- `styles.css`: responsive layout and color tokens.
- `app.js`: archive grouping, entry routing, theme, and mobile drawer.
- `data/posts.js`: journal content.

The default theme is the editorial journal's muted plum palette with soft Nunito Sans typography, an optional light mode, and a responsive mobile page-tree drawer. All existing entries and image paths were preserved during the redesign.
