(() => {
  const root = document.getElementById('archive-tree');
  const title = document.getElementById('entry-title');
  const breadcrumbs = document.getElementById('breadcrumbs');
  const dateNode = document.getElementById('entry-date');
  const body = document.getElementById('entry-body');
  const labelsNode = document.getElementById('entry-labels');
  const older = document.getElementById('older-link');
  const newer = document.getElementById('newer-link');
  const sidebar = document.getElementById('sidebar');
  const menu = document.getElementById('menu-toggle');
  const backdrop = document.getElementById('mobile-backdrop');
  const theme = document.querySelector('.theme-toggle');
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const parseDate = value => {
    const parts = String(value || '').split('-');
    if (parts.length !== 3) return null;
    const [y, m, d] = parts[0].length === 4 ? parts.map(Number) : [Number(parts[2]), Number(parts[1]), Number(parts[0])];
    const result = new Date(Date.UTC(y, m - 1, d));
    return result.getUTCFullYear() === y && result.getUTCMonth() === m - 1 && result.getUTCDate() === d ? result : null;
  };
  const longDate = d => new Intl.DateTimeFormat('en', {timeZone:'UTC', month:'long', day:'numeric', year:'numeric'}).format(d);
  const monthName = d => new Intl.DateTimeFormat('en', {timeZone:'UTC', month:'long'}).format(d);
  const getLabels = post => (Array.isArray(post.labels) ? post.labels : (typeof post.label === 'string' ? [post.label] : []))
    .filter(label => typeof label === 'string' && label.trim())
    .map(label => label.trim());
  // IDs are explicit positive integers, not positional indices. Reordering posts
  // or editing a title/date will therefore never change the permalink.
  const posts = (Array.isArray(window.posts) ? window.posts : [])
    .map((post, index) => ({...post, parsedDate:parseDate(post.date), originalIndex:index}))
    .filter(post => post.parsedDate && typeof post.title === 'string' && Number.isSafeInteger(post.id) && post.id > 0)
    .sort((a,b) => b.parsedDate - a.parsedDate || a.originalIndex - b.originalIndex);
  const seenIds = new Set();
  for (const post of posts) {
    if (seenIds.has(post.id)) console.warn('Duplicate journal ID:', post.id);
    seenIds.add(post.id);
  }
  // Preserve links from both previous routing schemes.
  const legacyIds = {
    'life-is-going-well-i-guess': 1,
    'smth smth': 2,
    '2026-10-16-trying-my-best': 1,
    '2026-10-20-what-a-tuesday': 2
  };
  const years = new Map();
  for (const post of posts) {
    const year = String(post.parsedDate.getUTCFullYear());
    const month = String(post.parsedDate.getUTCMonth() + 1).padStart(2,'0');
    if (!years.has(year)) years.set(year, new Map());
    if (!years.get(year).has(month)) years.get(year).set(month, []);
    years.get(year).get(month).push(post);
  }
  let selectedId = null;
  function renderTree() {
    // Keep manually opened archive groups open when changing entries.
    const archiveScrollTop = sidebar.scrollTop;
    const expandedYears = new Set([...root.querySelectorAll('.year[open]')].map(node => node.dataset.year));
    const expandedMonths = new Set([...root.querySelectorAll('.month[open]')].map(node => node.dataset.month));
    const hadTree = root.children.length > 0;
    root.innerHTML = Array.from(years, ([year, months]) => {
      const containsSelected = [...months.values()].some(items => items.some(p => p.id === selectedId));
      return `<details class="year" data-year="${escapeHtml(year)}" ${(containsSelected || (hadTree && expandedYears.has(year))) ? 'open' : ''}>
        <summary>${escapeHtml(year)}</summary>
        <div class="months">${Array.from(months, ([month, items]) => {
          const active = items.some(p => p.id === selectedId);
          return `<details class="month" data-month="${escapeHtml(year + '-' + month)}" ${(active || (hadTree && expandedMonths.has(year + '-' + month))) ? 'open' : ''}>
            <summary>${escapeHtml(monthName(items[0].parsedDate))} <span class="count">${items.length}</span></summary>
            <div class="post-links">${items.map(p => `<a href="#note/${p.id}" ${p.id === selectedId ? 'aria-current="page"' : ''}>${escapeHtml(p.title)}</a>`).join('')}</div>
          </details>`;
        }).join('')}</div>
      </details>`;
    }).join('') || '<p class="empty">No entries yet.</p>';
    sidebar.scrollTop = archiveScrollTop;
  }
  // Native details remain keyboard accessible; enhance their open/close motion
  // without adding a framework or animating on initial render.
  root.addEventListener('click', event => {
    const summary = event.target.closest('summary');
    if (!summary || !root.contains(summary)) return;
    const details = summary.parentElement;
    const content = details.classList.contains('year')
      ? details.querySelector(':scope > .months')
      : details.querySelector(':scope > .post-links');
    if (!content || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !content.animate) return;
    event.preventDefault();
    if (details.classList.contains('archive-animating')) return;
    const opening = !details.open;
    if (opening) details.open = true;
    const height = content.scrollHeight;
    details.classList.add('archive-animating');
    const animation = content.animate([
      { height: opening ? '0px' : height + 'px', opacity: opening ? 0 : 1 },
      { height: opening ? height + 'px' : '0px', opacity: opening ? 1 : 0 }
    ], { duration: 240, easing: 'cubic-bezier(.2,.7,.25,1)' });
    const finish = () => {
      if (!opening) details.open = false;
      details.classList.remove('archive-animating');
    };
    animation.finished.then(finish, finish);
  });

  function closeMenu() {
    sidebar.classList.remove('is-open');
    menu.setAttribute('aria-expanded','false');
    menu.setAttribute('aria-label','Open archive');
    backdrop.hidden = true;
    document.body.classList.remove('menu-open');
  }
  function openMenu() {
    sidebar.classList.add('is-open');
    menu.setAttribute('aria-expanded','true');
    menu.setAttribute('aria-label','Close archive');
    backdrop.hidden = false;
    document.body.classList.add('menu-open');
  }
  function imageFigure(photo) {
    const caption = photo.caption ? `<figcaption>${escapeHtml(photo.caption)}</figcaption>` : '';
    return `<figure class="journal-photo"><img src="${escapeHtml(photo.image)}" alt="${escapeHtml(photo.alt || '')}" loading="lazy">${caption}</figure>`;
  }

  function initPhotoStacks() {
    for (const figure of body.querySelectorAll('.photo-stack')) {
      const stage = figure.querySelector('.stack-stage');
      const count = figure.querySelector('.stack-count');
      const next = figure.querySelector('.stack-next');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let moving = false;
      let gesture = null;
      function refresh() {
        [...stage.children].forEach((card, index) => {
          card.dataset.depth = String(index);
          card.style.setProperty('--depth', String(Math.min(index, 3)));
          card.setAttribute('aria-hidden', String(index !== 0));
          card.style.removeProperty('transform');
          card.style.removeProperty('transition');
          card.style.removeProperty('z-index');
        });
        const photos = stage.children.length;
        const current = Number(figure.dataset.current || 0);
        count.textContent = `${current + 1} / ${photos}`;
      }
      function throwTop(direction = 1, startX = 0, startY = 0) {
        if (moving) return;
        const top = stage.firstElementChild;
        if (!top) return;
        moving = true;
        next.disabled = true;
        const finish = () => {
          stage.appendChild(top);
          figure.dataset.current = String((Number(figure.dataset.current || 0) + 1) % stage.children.length);
          moving = false;
          next.disabled = false;
          refresh();
        };
        if (reducedMotion || !top.animate) { finish(); return; }
        const distance = Math.max(360, stage.clientWidth + 160);
        const animation = top.animate([
          { transform: `translate(${startX}px, ${startY}px) rotate(${startX * .045 - 2}deg)`, opacity: 1 },
          { transform: `translate(${direction * distance}px, ${startY + 36}px) rotate(${direction * 28}deg)`, opacity: .1 }
        ], { duration: 310, easing: 'cubic-bezier(.25,.8,.3,1)' });
        animation.finished.then(finish, finish);
      }
      next.addEventListener('click', () => throwTop());
      stage.addEventListener('pointerdown', event => {
        if (moving || !event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
        gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, dx: 0, dy: 0 };
        stage.setPointerCapture(event.pointerId);
        stage.classList.add('is-dragging');
      });
      stage.addEventListener('pointermove', event => {
        if (!gesture || gesture.id !== event.pointerId) return;
        gesture.dx = event.clientX - gesture.x;
        gesture.dy = event.clientY - gesture.y;
        const top = stage.firstElementChild;
        top.style.transform = `translate(${gesture.dx}px, ${gesture.dy * .35}px) rotate(${gesture.dx * .045 - 2}deg)`;
      });
      const endDrag = (event, cancelled = false) => {
        if (!gesture || gesture.id !== event.pointerId) return;
        const {dx, dy} = gesture;
        gesture = null;
        stage.classList.remove('is-dragging');
        if (!cancelled && Math.abs(dx) > 55) {
          throwTop(Math.sign(dx), dx, dy * .35);
        } else {
          stage.firstElementChild.style.removeProperty('transform');
        }
      };
      stage.addEventListener('pointerup', event => endDrag(event));
      stage.addEventListener('pointercancel', event => endDrag(event, true));
      stage.addEventListener('lostpointercapture', event => endDrag(event, true));
      refresh();
    }
  }

  function renderPost() {
    const hash = location.hash;
    let token = null;
    if (hash.startsWith('#note/')) {
      try { token = decodeURIComponent(hash.slice(6)); } catch (_) { token = null; }
    }
    const numericId = token && /^[1-9]\d*$/.test(token) ? Number(token) : null;
    const targetId = token === null ? posts[0]?.id : (legacyIds[token] ?? numericId);
    const foundIndex = posts.findIndex(p => p.id === targetId);
    const index = foundIndex;
    const post = posts[index];
    if (!post) {
      selectedId = null;
      dateNode.textContent = '';
      breadcrumbs.innerHTML = '<span>Journal</span>';
      title.textContent = posts.length ? 'Entry not found.' : 'Nothing here yet.';
      labelsNode.hidden = true;
      labelsNode.replaceChildren();
      body.textContent = posts.length ? 'Choose an entry from the archive.' : 'Add your first entry in data/posts.js.';
      older.hidden = newer.hidden = true;
      renderTree();
      closeMenu();
      return;
    }
    selectedId = post.id;
    document.title = `${post.title} — KRMII's Journal`;
    dateNode.textContent = longDate(post.parsedDate);
    dateNode.dateTime = post.parsedDate.toISOString().slice(0,10);
    title.textContent = post.title;
    const year = String(post.parsedDate.getUTCFullYear());
    const month = monthName(post.parsedDate);
    breadcrumbs.innerHTML = `<a href="#" aria-label="Journal home">Journal</a><span aria-hidden="true">/</span><span>${escapeHtml(year)}</span><span aria-hidden="true">/</span><span>${escapeHtml(month)}</span>`;
    const labels = [...new Set(getLabels(post))];
    labelsNode.hidden = labels.length === 0;
    labelsNode.innerHTML = labels.map(label => `<span class="entry-label">${escapeHtml(label)}</span>`).join('');
    body.innerHTML = (Array.isArray(post.body) ? post.body : []).map((block, blockIndex) => {
      if (block && typeof block === 'object' && Array.isArray(block.stack)) {
        const photos = block.stack.filter(photo => photo && typeof photo.image === 'string' && photo.image.trim());
        if (!photos.length) return '';
        if (photos.length === 1) return imageFigure(photos[0]);
        const cards = photos.map((photo, i) => `<div class="stack-card" data-depth="${i}" aria-hidden="${i !== 0}" style="--depth:${Math.min(i, 3)}">
          <img src="${escapeHtml(photo.image)}" alt="${escapeHtml(photo.alt || '')}" draggable="false" loading="lazy">
        </div>`).join('');
        const caption = block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : '';
        return `<figure class="photo-stack" data-stack-id="${blockIndex}">
          <div class="stack-stage" aria-label="A stack of ${photos.length} photos. Drag the top photo sideways to move it to the back.">${cards}</div>
          <div class="stack-toolbar"><span class="stack-count" role="status" aria-live="polite">1 / ${photos.length}</span>
            <button class="stack-next" type="button" aria-label="Move top photo to the back">Next photo ↗</button></div>
          ${caption}
        </figure>`;
      }
      if (block && typeof block === 'object' && block.image) return imageFigure(block);
      return `<p>${escapeHtml(block)}</p>`;
    }).join('');
    initPhotoStacks();
    // Set the mat from each image's intrinsic width, capped at 560px,
    // instead of measuring the unclamped image and leaving an empty strip.
    for (const image of body.querySelectorAll('.journal-photo img')) {
      const sizeFrame = () => {
        if (image.naturalWidth) image.closest('.journal-photo').style.setProperty('--photo-width', Math.min(image.naturalWidth, 560) + 18 + 'px');
      };
      if (image.complete) sizeFrame();
      else image.addEventListener('load', sizeFrame, { once: true });
    }
    const previous = posts[index + 1];
    const next = posts[index - 1];
    older.hidden = !previous;
    newer.hidden = !next;
    if (previous) { older.href = '#note/' + previous.id; older.textContent = '← Older entry'; }
    if (next) { newer.href = '#note/' + next.id; newer.textContent = 'Newer entry →'; }
    renderTree();
    closeMenu();
    window.scrollTo(0, 0);
  }
  function setTheme(light) {
    document.body.classList.toggle('light-mode', light);
    theme.textContent = light ? '☼' : '☾';
    theme.setAttribute('aria-pressed', String(light));
    theme.setAttribute('aria-label', light ? 'Switch to dark mode' : 'Switch to light mode');
    try { localStorage.setItem('krmii-theme', light ? 'light' : 'dark'); } catch (_) {}
  }
  menu.addEventListener('click', () => sidebar.classList.contains('is-open') ? closeMenu() : openMenu());
  backdrop.addEventListener('click', closeMenu);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  theme.addEventListener('click', () => setTheme(!document.body.classList.contains('light-mode')));
  window.addEventListener('hashchange', renderPost);
  // The archive is navigable by native details/summary controls, without JS state for expanded groups.
  try { setTheme(localStorage.getItem('krmii-theme') === 'light'); } catch (_) { setTheme(false); }
  document.body.classList.add('theme-ready');
  renderPost();
})();
