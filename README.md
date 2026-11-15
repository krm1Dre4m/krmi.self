# krmi.self

A personal journal and collection of songs and photographs.

**Website:** https://krm1dre4m.github.io/krmi.self/

## Run locally

No installation or build step is needed.

```sh
git clone https://github.com/krm1Dre4m/krmi.self.git
cd krmi.self
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000).

## Add a journal post

Open `data/posts.js` and add an object inside the `window.posts` array:

```js
{
  id: 5,
  title: "A new entry",
  date: "16-11-2026",
  labels: ["Life"],
  music: "https://www.youtube.com/watch?v=VIDEO_ID",
  body: [
    "Write your first paragraph here.",
    "Add another paragraph here.",
    { image: "assets/photo.jpg", alt: "A short description", caption: "Optional caption" }
  ],
  closing: "An optional final thought."
}
```

- Give every post a unique `id`. Keep existing IDs; `0` is reserved for the welcome post.
- Use `DD-MM-YYYY` for dates. Posts appear newest first.
- Add `time: "21:30"` to order posts published on the same day. It is not shown on the website.
- `labels`, `music`, and `closing` are optional. A post without `music` uses the default soundtrack at the top of `data/posts.js`.
- Put image files in `assets/` and reference them with paths such as `assets/photo.jpg`.

### Writing blocks

The `body` array accepts plain strings (paragraphs) and these optional blocks:

```js
{ dim: "A quieter aside." }
{ highlight: "A sentence to emphasize." }
{ text: ["Normal text ", { highlight: "emphasized text" }, " more text."] }
{ text: ["I almost wrote ", { strike: "old wording" }, " but ", { text: "changed my mind", bold: true, strike: true }, "."] }
{ text: ["Today I discussed about ", { censor: "something private" }, " with my ", { censor: "friend" }, "."] }
{ question: "Why did you choose this place?" } // Put the answer in the next paragraph.
{ image: "assets/photo.jpg", alt: "Description", caption: "Optional caption", tilt: true }
```

Use `strike` to cross out wording. Inline effects can be combined on the same text with flags, for example `{ text: "old wording", bold: true, strike: true }`. You can also nest effects, as in `{ bold: { strike: "old wording" } }`.

Use `censor` inside a `text` block for a transparent, Threads-style spoiler made of dense, irregular dots that softly fluctuate in opacity. Its approximate width follows the supplied text, but the original value remains in `data/posts.js`: this is visual concealment, not encryption.

Use `tilt: true` for a subtle mouse-following effect on an individual image. It is disabled on touch devices and for visitors who prefer reduced motion.

For a draggable photo stack, use:

```js
{
  stack: [
    { image: "assets/one.jpg", alt: "First photo" },
    { image: "assets/two.jpg", alt: "Second photo" }
  ],
  caption: "Optional caption"
}
```

## Add songs and genres

Open `data/collections.js`. Add a genre inside the Listening Shelf's `genres` array:

```js
{
  id: "late-night",
  title: "Late Night",
  description: "Songs for the quieter hours.",
  songs: [
    {
      title: "Song title",
      artist: "Artist",
      url: "https://youtu.be/VIDEO_ID",
      cover: "assets/album-cover.jpg", // optional
      note: "Why I recommend this song."
    }
  ]
}
```

- Give each genre a unique, lowercase `id` using letters, numbers, and hyphens.
- Add songs to its `songs` array. Songs are sorted by artist, then title.
- `description`, `cover`, and `note` are optional. YouTube links provide a thumbnail automatically when no cover is set.
- Genre names are up to you: use genres, moods, eras, or any grouping you like.
- **Surprise me** opens a random linked song from the genre currently on screen.

## Gallery

The Gallery is filled automatically from journal images, including images inside `stack` blocks. You do not need to maintain a separate photo list.

Click a photo to expand it; the other photos rearrange around it. Only one photo can be expanded at a time. Press **Escape** to close it, or use the arrow keys to browse.

A photo shows its journal date and caption. To show its upload date instead, add `uploaded: "13-11-2026"` to the image object. Use `DD-MM-YYYY` or `YYYY-MM-DD`.

## Useful files

| File | What to edit |
| --- | --- |
| `data/posts.js` | Journal posts and the default soundtrack |
| `data/collections.js` | Listening Shelf, genres, and songs |
| `styles.css` | Colors, layout, and animations |
| `index.html` | Page structure and social links |
| `assets/` | Photos, album covers, and website icon |
| `app.js` | Journal and Collections behavior |
| `gallery.js` | Gallery behavior |
| `music-player.js` | Floating soundtrack player |

## Check the Gallery

Run the layout and photo-collection tests with Node.js:

```sh
node --test tests/gallery.test.cjs
```
