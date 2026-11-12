# krmi.self

A personal journal built with HTML, CSS, and JavaScript.

**Website:** https://krm1dre4m.github.io/krmi.self/

## Features

- Journal and Collections sections in the header
- Posts organized by year and month
- Listening Shelf for personal song recommendations
- Responsive masonry Gallery built automatically from journal photos
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

Edit `data/collections.js` to add your own genre sections under Listening Shelf:

```js
genres: [
  {
    id: "late-night",
    title: "Late Night",
    description: "Songs for the quieter hours.",
    songs: [
      {
        title: "Song title",
        artist: "Artist",
        url: "https://www.youtube.com/watch?v=VIDEO_ID",
        cover: "assets/album-cover.jpg", // optional
        note: "Why I recommend this song."
      }
    ]
  }
]
```

Genre names are entirely yours (genres, moods, or any grouping). Optional `description` text appears beneath the genre title, in the same metadata position as a journal entry's date (not in the song list). Each `id` must be unique within its collection, using lowercase letters, numbers, and hyphens. In the Collections sidebar, Listening Shelf expands and collapses like a year. Genres are direct links beneath it; clicking a genre shows its songs in the main content area, not in the sidebar. Listening Shelf itself has no overview page. Opening Collections automatically shows the first genre's songs, so the landing view is never blank when genres exist. Songs are displayed alphabetically by artist (then song title), regardless of their order in the file. Each song can specify `cover: "assets/album-cover.jpg"` (or an HTTPS image URL). Without a cover, YouTube links automatically show their video thumbnail; other songs use the music-note placeholder. Place local cover files in `assets/`. Song links open in a new tab. While viewing a genre, **Surprise me** opens a random linked song from that genre in a new tab; without playable links it is disabled. In Journal it still opens a random post. The shelf starts empty until you add your own genres. Other collections can still have a direct `songs` array.

## Gallery

Collections includes a **Gallery** alongside Listening Shelf. It automatically gathers individual photos and all images in `stack` blocks from `data/posts.js` — no second photo list needed.

Click a photo to expand it inside the masonry layout. Nearby photos rearrange smoothly; only one can be expanded at a time. Click it again or press **Escape** to collapse it, and use the arrow keys to move between photos. Animation is disabled when reduced motion is preferred.

Expanded photos show the caption (if present), **Posted** date from the journal entry, and a link back to that entry. To provide an exact upload date instead, add `uploaded: "13-11-2026"` to that image object (the date is then labeled **Uploaded**). Both `DD-MM-YYYY` and `YYYY-MM-DD` are accepted.

## Customize

- **Posts and default soundtrack:** `data/posts.js`
- **Recommendations and collections:** `data/collections.js`
- **Social links:** `index.html` (currently link to platform homepages)
- **Theme and layout:** `styles.css`
- **Website icon:** `assets/favicon.png`

No build step or dependencies required.
