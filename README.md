# krmi.self

A personal journal built with HTML, CSS, and JavaScript.

**Website:** https://krm1dre4m.github.io/krmi.self/

## Features

- Journal and Collections sections in the header
- Posts organized by year and month
- Listening Shelf for personal song recommendations
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
  time: "21:30", // optional; used for sorting only
  labels: ["Life"],
  music: "https://www.youtube.com/watch?v=VIDEO_ID",
  body: [
    "A paragraph.",
    { dim: "A quieter aside or passing thought." },
    { highlight: "A sentence worth emphasizing." },
    { text: ["Some thoughts deserve ", { highlight: "extra emphasis" }, "."] },
    { question: "Why did you choose this place?" },
    "Because I believe there's something more here.",
    { image: "assets/photo.jpg", alt: "Description", caption: "Optional caption", tilt: true }
  ],
  closing: "A final thought, if there is one."
}
```

Keep each `id` unique; `0` is reserved for the welcome page. Don't change existing IDs. Posts are sorted newest first by date, then optional `time` (`HH:mm`, 24-hour format) when posts share a date. The time is **never displayed**. Posts without a time sort as `00:00`; ties keep their order in `posts.js`. `labels`, `music`, and images are optional. Add image files to `assets/`.

Inside `body`, use `{ dim: "..." }` for muted paragraphs, `{ highlight: "..." }` for a brighter paragraph, or `{ text: ["Normal words ", { highlight: "bright words" }, " again."] }` for inline emphasis. Highlights have no underline. Use `{ question: "..." }` for a quoted question with a vertical line, and write its answer as the next normal paragraph. Use `closing: "..."` for an optional closing thought.

Add `tilt: true` to an individual image to give its card a subtle 3D mouse-following effect. It's off by default and disabled on touch devices and for reduced-motion visitors. The tarot backing tilts along with the photo.

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

## Collections

Use **Journal** and **Collections** beside “Surprise me” in the top-right header. Journal has its own year/month archive; Collections has a separate sidebar. The first collection is **Listening Shelf**.

Edit `data/collections.js` to add recommended songs:

```js
songs: [
  {
    title: "Song title",
    artist: "Artist",
    url: "https://www.youtube.com/watch?v=VIDEO_ID",
    note: "Why I recommend this song."
  }
]
```

Song titles with URLs open the track in a new tab. The shelf starts empty until you add your own songs. You can add further collections to the `window.collections` array.

## Customize

- **Posts and default soundtrack:** `data/posts.js`
- **Recommendations and collections:** `data/collections.js`
- **Social links:** `index.html` (currently link to platform homepages)
- **Theme and layout:** `styles.css`
- **Website icon:** `assets/favicon.png`

No build step or dependencies required.
