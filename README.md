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

## Add images to a note

Images live in the `assets/` folder. Drop your file there, then reference it from a post's `body` array using an object instead of a plain string.

1. Save the image into `assets/`, e.g. `assets/sunset.jpg`. Use web-friendly formats (`.jpg`, `.png`, `.webp`) and keep files reasonably small.
2. In `data/posts.js`, mix image objects into the `body` array wherever you want them to appear:

```js
body: [
  "A paragraph of text comes through as a plain string.",
  { image: "assets/sunset.jpg", alt: "The view from the window", caption: "Optional caption under the image" },
  "Another paragraph after the image."
]
```

- `image`: path relative to the site root (keep the `assets/` prefix).
- `alt`: short description for screen readers — always include it.
- `caption`: optional text shown beneath the image; omit the key to skip it.

Images load lazily and scale to the note width automatically. Plain-string paragraphs keep working exactly as before, so old posts need no changes.

## Resize an image before adding it

Big image files make the page load slowly. For a note, a width of **1200px** is plenty, and most files should land **under ~300 KB**. Your screen never needs the full camera-size image.

You have ImageMagick installed (`magick`), so resize from this folder like this:

```bash
# Resize to 1200px wide (height scales automatically), save as a new file
magick assets/original.png -resize 1200x assets/sunset.jpg

# Same, but also compress a bit to shrink the file (quality 82 is a good web default)
magick assets/original.png -resize 1200x -quality 82 assets/sunset.jpg
```

- `-resize 1200x` sets the width to 1200px and keeps the aspect ratio. The image is only ever shrunk, never blown up past its original size.
- Converting a `.png` photo to `.jpg` (just change the output extension) usually shrinks the file a lot. Keep `.png` for screenshots or anything with sharp text/lines.
- Check the result afterwards:

```bash
magick identify -format "%wx%h %b\n" assets/sunset.jpg
```

That prints the new dimensions and file size so you can confirm it slimmed down before you reference it in a post.

## Customize the site

- Main content and page structure: `index.html`
- Colors, typography, responsive layout: `styles.css`
- Filtering, search, article modal, theme toggle: `app.js`
- Font choice: Google Fonts are loaded in `index.html` and `styles.css`
- Design tokens source: `design-system/krmii-sketchbook/MASTER.md`
