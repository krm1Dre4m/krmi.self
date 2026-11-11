# KRMII Sketchbook

A tiny, dependency-free personal journal. Built with plain HTML, CSS, and JavaScript; no build step, database, or CMS.

## Reading

The journal uses a full-width, borderless personal-wiki layout with the editorial plum-and-mauve palette. The header holds the journal identity and theme control; a compact page tree on the left groups entries by **year → month → post**, newest first. Breadcrumbs above each entry show its year and month. Years and months expand and collapse. Selecting an entry opens it in the main reading pane, with an address like `#note/2` that can be shared or bookmarked. Visiting the site without a post URL opens the **September 22, 2026 introduction** (ID `0`), which is also directly accessible at `#note/0`.

On smaller screens, use the **Archive** button to open the drawer. The light/dark theme choice is saved in your browser.

## Atmospheric constellation theme

The entire website shares a quiet, purely decorative star-map backdrop: constellation groups span the header, left archive, and reading area, with scattered stars and very slow twinkling. The desktop sidebar uses a translucent background so the shared sky remains visible, while the mobile archive drawer stays opaque for legibility. The sky is dimmer than the original version, fades in on load, draws its constellation lines in a staggered reveal, and drifts only a few pixels over nearly a minute. It uses a single inline SVG plus CSS — no particle engine, extra requests, or scrolling script. The existing archive remains a normal tree; stars are not links or interactive elements.

Dark mode uses muted lavender against plum, light mode shows a much fainter chart, and small screens reduce its visibility. Motion is disabled by the visitor's reduced-motion preference. Edit the `.sky-map` SVG in `index.html` to change star positions and `.sky-*` rules in `styles.css` to adjust the intensity.

The main controls also use a restrained celestial icon language: a constellation-inspired brand star, a small shooting-star accent for **Surprise me**, moon/sun theme symbols with star detail, star-shaped archive disclosures and active-entry markers, and a matching music-dock icon. These are still ordinary accessible buttons and links, with no icon library or new runtime dependency.

## Social links

Each journal entry ends with a centered, constellation-styled row linking to **X, Reddit, Pixiv, Facebook, YouTube, GitHub, and LinkedIn**. All currently point to their platforms' **homepages**, not personal accounts. To change them later, edit the `href` attributes in the `.social-footer` section of `index.html`. Icons are locally inlined SVGs that follow the site's dark/light theme; they require no icon-font or external scripts.

## Random entry and music player

Use **Surprise me** in the header to open a random journal entry other than the ID `0` introduction. When possible it chooses an entry different from the one currently open.

Every journal entry can optionally define a soundtrack using one line:

```js
music: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
```

The site-wide fallback lives at the top of `data/posts.js` as `window.defaultMusicUrl`. Entries without a `music` field inherit that URL. Changing posts cues the matching soundtrack **without autoplaying**; the visitor presses Play in the YouTube player. An explicitly specified URL overrides the default.

The minimal floating YouTube dock is visible by default at the bottom-right. It uses the same **250 × 80px embedded YouTube viewport** found in QioCas's recap posts, plus a compact volume slider. This is an experimental, below-minimum-size YouTube embed: controls may be cramped or inconsistent, and it does not meet YouTube's documented 200 × 200px minimum. To restore a supported player size, change the iframe dimensions in `music-player.js` and `.music-video iframe` in `styles.css` to at least 200 × 200px. The Music pill and expanded dock are now one connected surface: when paused, pressing the pill morphs it smoothly closed or open. The pill remains the bottom edge of the expanded player, and its animated bars continue to indicate playback. The player cannot be minimized while YouTube is actively playing. Visitors cannot enter or choose their own YouTube links: the current blog's `music` field (or `window.defaultMusicUrl`) decides the soundtrack.

- YouTube's official embedded player provides visible playback, volume, seeking, and attribution controls.
- A dedicated compact **Play / Pause** button beside the volume slider controls playback through YouTube's IFrame API. Its icon and accessible label follow YouTube's reported playback state. It stays disabled until YouTube is ready.
- Playback starts only when the visitor presses Play; switching blogs cues the new song without autoplay.
- To minimize the panel, pause the video first; the panel cannot hide an actively playing YouTube embed. The frequency-style bars on the Music button animate during playback but do not analyze audio frequencies.
- The custom volume slider adjusts the YouTube player's volume and remembers the setting locally.
- The page automatically reserves scroll space equal to the floating player's height and bottom offset, so the last paragraph and entry links can scroll completely above it. The space shrinks when the player collapses.
- The small external-link icon opens the selected video directly on YouTube.
- Some creators disable embedding or restrict playback. No audio files, API key, or downloaded music are needed.

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
  music: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID", // optional
  body: [
    "A paragraph of text.",
    { image: "assets/sunset.jpg", alt: "Sunset outside", caption: "Optional caption" },
    "Another paragraph."
  ]
}
```

- `id` must be a unique non-negative integer. **ID `0` is reserved for the introductory page.** Give every new entry a new number (4, 5, 6, ...), even if you reorder entries or edit their titles later. **Do not renumber old entries:** their IDs are permanent links.
- `date` accepts `dd-mm-yyyy` or `yyyy-mm-dd`.
- `music` is optional. Omit it to use the global YouTube default, or provide a link to use a different song for this entry.
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
