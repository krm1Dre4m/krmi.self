# krmi.self

A personal journal built with HTML, CSS, and JavaScript.

**Website:** https://krm1dre4m.github.io/krmi.self/

## Features

- Posts organized by year and month
- Dark/light themes and a mobile-friendly layout
- Photos, draggable photo stacks, and subtle tarot-style frames
- A soundtrack player for each post
- Constellation background and gentle page animations

## Run locally

```sh
python3 -m http.server 8000
```

Open http://localhost:8000.

## Add a post

Edit `data/posts.js` and add an entry to `window.posts`:

```js
{
  id: 5,
  title: "A new entry",
  date: "12-11-2026",
  labels: ["Life"],
  music: "https://www.youtube.com/watch?v=VIDEO_ID",
  body: [
    "A paragraph.",
    { dim: "A quieter aside or passing thought." },
    { question: "Why did you choose this place?" },
    "Because I believe there's something more here.",
    { image: "assets/photo.jpg", alt: "Description", caption: "Optional caption" }
  ],
  closing: "A final thought, if there is one."
}
```

Keep each `id` unique; `0` is reserved for the welcome page. Don't change existing IDs. Posts are sorted by date automatically. `labels`, `music`, and images are optional. Add image files to `assets/`.

Inside `body`, use `{ dim: "..." }` for a muted paragraph or `{ question: "..." }` for a quoted question with a vertical line. Write the answer as the next normal paragraph. Use `closing: "..."` for an optional closing thought.

For multiple photos in one draggable stack, use a `stack` block:

```js
{
  stack: [
    { image: "assets/one.jpg", alt: "First photo" },
    { image: "assets/two.jpg", alt: "Second photo" }
  ],
  caption: "Optional caption"
}
```

## Customize

- **Posts and default soundtrack:** `data/posts.js`
- **Social links:** `index.html` (currently link to platform homepages)
- **Theme and layout:** `styles.css`
- **Website icon:** `assets/favicon.png`

No build step or dependencies required.
