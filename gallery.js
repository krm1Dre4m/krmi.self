/* Inline, reflowing masonry gallery for photos already used in journal entries. */
(() => {
  'use strict';

  const dateLabel = new Intl.DateTimeFormat('en', {
    timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric'
  });
  const parseDate = value => {
    const parts = String(value || '').split('-');
    if (parts.length !== 3) return null;
    const [year, month, day] = parts[0].length === 4
      ? parts.map(Number) : [Number(parts[2]), Number(parts[1]), Number(parts[0])];
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
      ? date : null;
  };
  const isString = value => typeof value === 'string' && value.trim().length > 0;

  function collectPhotos(posts) {
    const photos = [];
    for (const post of posts) {
      if (!post || !Array.isArray(post.body) || !Number.isSafeInteger(post.id)) continue;
      const append = (photo, parentCaption = '') => {
        if (!photo || !isString(photo.image)) return;
        const explicitDate = parseDate(photo.uploaded);
        const postDate = post.parsedDate || parseDate(post.date);
        photos.push({
          image: photo.image.trim(),
          alt: isString(photo.alt) ? photo.alt.trim() : '',
          caption: isString(photo.caption) ? photo.caption.trim() : parentCaption,
          postTitle: post.title || 'Journal entry',
          postId: post.id,
          date: explicitDate || postDate,
          isUploadDate: Boolean(explicitDate),
          ratio: 4 / 3
        });
      };
      for (const block of post.body) {
        if (block && typeof block === 'object' && Array.isArray(block.stack)) {
          for (const photo of block.stack) append(photo, isString(block.caption) ? block.caption.trim() : '');
        } else if (block && typeof block === 'object') append(block);
      }
    }
    return photos;
  }

  // Shortest-column skyline placement. The active tile spans up to two columns;
  // every tile after it is placed again, so it cannot overlap its neighbors.
  function planMasonry(photos, width, activeIndex = -1, detailHeight = 0) {
    const columns = width >= 860 ? 4 : width >= 600 ? 3 : width >= 360 ? 2 : 1;
    const gap = width < 480 ? 10 : 14;
    const columnWidth = Math.max(1, (width - (columns - 1) * gap) / columns);
    const heights = Array(columns).fill(0);
    const items = photos.map((photo, index) => {
      const expanded = index === activeIndex;
      const span = expanded ? Math.min(2, columns) : 1;
      const tileWidth = columnWidth * span + gap * (span - 1);
      const ratio = Number.isFinite(photo.ratio) && photo.ratio > 0 ? photo.ratio : 4 / 3;
      const imageHeight = Math.max(80, Math.min(tileWidth / ratio, expanded ? 610 : 520));
      const height = imageHeight + (expanded ? detailHeight : 0);
      let firstColumn = 0;
      let y = Infinity;
      for (let column = 0; column <= columns - span; column++) {
        const position = Math.max(...heights.slice(column, column + span));
        if (position < y) { firstColumn = column; y = position; }
      }
      for (let column = firstColumn; column < firstColumn + span; column++)
        heights[column] = y + height + gap;
      return { x: firstColumn * (columnWidth + gap), y, width: tileWidth, height, imageHeight, span };
    });
    return { items, height: Math.max(0, ...heights) - (photos.length ? gap : 0), columns };
  }

  let instance = null;
  function unmount() {
    if (instance) instance.destroy();
    instance = null;
  }

  function mount(host, posts) {
    unmount();
    const photos = collectPhotos(posts);
    host.replaceChildren();
    if (!photos.length) {
      const empty = document.createElement('p');
      empty.className = 'collection-empty';
      empty.textContent = 'No photographs yet. Images from your journal will appear here. ✧';
      host.append(empty);
      return;
    }

    const gallery = document.createElement('div');
    gallery.className = 'gallery-grid';
    gallery.setAttribute('aria-label', 'Photographs from journal entries');
    host.append(gallery);

    let activeIndex = -1;
    let scheduled = 0;
    let ready = false;
    let destroyed = false;
    let lastWidth = 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const tiles = photos.map((photo, index) => {
      const tile = document.createElement('article');
      tile.className = 'gallery-tile';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'gallery-image-trigger';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-label', `Enlarge photograph from ${photo.postTitle}`);
      const image = document.createElement('img');
      image.src = photo.image;
      image.alt = photo.alt;
      image.loading = 'lazy';
      image.decoding = 'async';
      const fallback = document.createElement('span');
      fallback.className = 'gallery-image-fallback';
      fallback.textContent = '✧';
      fallback.hidden = true;
      button.append(image, fallback);
      image.addEventListener('load', () => {
        if (destroyed) return;
        const ratio = image.naturalWidth / image.naturalHeight;
        if (Number.isFinite(ratio) && ratio > 0) photo.ratio = ratio;
        schedule();
      });
      image.addEventListener('error', () => {
        fallback.hidden = false;
        image.hidden = true;
      });

      const details = document.createElement('div');
      details.className = 'gallery-details';
      details.hidden = true;
      if (photo.caption) {
        const caption = document.createElement('p');
        caption.className = 'gallery-caption';
        caption.textContent = photo.caption;
        details.append(caption);
      }
      const metadata = document.createElement('div');
      metadata.className = 'gallery-metadata';
      const date = document.createElement('span');
      date.className = 'gallery-date';
      date.textContent = photo.date
        ? `${photo.isUploadDate ? 'Uploaded' : 'Posted'} ${dateLabel.format(photo.date)}` : 'From the journal';
      const entryLink = document.createElement('a');
      entryLink.href = '#note/' + photo.postId;
      entryLink.textContent = 'Read original entry ↗';
      metadata.append(date, entryLink);
      details.append(metadata);
      tile.append(button, details);
      gallery.append(tile);
      const item = { tile, button, image, details };
      button.addEventListener('click', () => setActive(activeIndex === index ? -1 : index));
      return item;
    });

    function layout() {
      scheduled = 0;
      if (destroyed) return;
      const width = gallery.clientWidth;
      if (!width) return;
      lastWidth = width;
      // Set the new widths before measuring the open caption/date block.
      const preliminary = planMasonry(photos, width, activeIndex);
      tiles.forEach(({ tile, button, details }, index) => {
        const selected = index === activeIndex;
        const item = preliminary.items[index];
        tile.classList.toggle('is-expanded', selected);
        tile.style.width = `${item.width}px`;
        button.style.height = `${item.imageHeight}px`;
        button.setAttribute('aria-expanded', String(selected));
        button.setAttribute('aria-label', `${selected ? 'Collapse' : 'Enlarge'} photograph from ${photos[index].postTitle}`);
        details.hidden = !selected;
      });
      const detailHeight = activeIndex < 0 ? 0 : tiles[activeIndex].details.offsetHeight;
      const plan = planMasonry(photos, width, activeIndex, detailHeight);
      tiles.forEach(({ tile }, index) => {
        const item = plan.items[index];
        tile.style.height = `${item.height}px`;
        tile.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
      });
      gallery.style.height = `${plan.height}px`;
      if (!ready) {
        requestAnimationFrame(() => { if (!destroyed) { gallery.classList.add('is-ready'); ready = true; } });
      }
    }
    function schedule() {
      if (!scheduled && !destroyed) scheduled = requestAnimationFrame(layout);
    }
    function setActive(index, scrollToImage = false) {
      if (destroyed || index === activeIndex) return;
      activeIndex = index;
      schedule();
      if (scrollToImage && index >= 0) {
        requestAnimationFrame(() => {
          if (destroyed) return;
          tiles[index].button.focus({ preventScroll: true });
          tiles[index].tile.scrollIntoView({ block: 'nearest', behavior: reducedMotion.matches ? 'instant' : 'smooth' });
        });
      }
    }
    function onKeydown(event) {
      if (activeIndex < 0 || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        setActive(-1);
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        setActive((activeIndex + (event.key === 'ArrowRight' ? 1 : -1) + photos.length) % photos.length, true);
      }
    }
    document.addEventListener('keydown', onKeydown);
    let observer = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        if (gallery.clientWidth !== lastWidth) schedule();
      });
      observer.observe(gallery);
    } else window.addEventListener('resize', schedule);
    instance = {
      count: photos.length,
      random() {
        const choices = photos.map((_, index) => index).filter(index => photos.length === 1 || index !== activeIndex);
        if (!choices.length) return;
        setActive(choices[Math.floor(Math.random() * choices.length)], true);
      },
      destroy() {
        destroyed = true;
        if (scheduled) cancelAnimationFrame(scheduled);
        if (observer) observer.disconnect();
        else window.removeEventListener('resize', schedule);
        document.removeEventListener('keydown', onKeydown);
      }
    };
    schedule();
  }

  window.krmiGallery = {
    mount, unmount,
    random: () => instance?.random(),
    count: () => instance?.count || 0
  };
  // Expose pure calculations for lightweight tests, without requiring a browser.
  if (typeof module !== 'undefined' && module.exports) module.exports = { collectPhotos, planMasonry };
})();