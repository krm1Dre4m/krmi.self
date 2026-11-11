(() => {
  const root = document.getElementById('archive-tree');
  const title = document.getElementById('entry-title');
  const dateNode = document.getElementById('entry-date');
  const body = document.getElementById('entry-body');
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
  const posts = (Array.isArray(window.posts) ? window.posts : [])
    .map((post, index) => ({...post, parsedDate:parseDate(post.date), originalIndex:index}))
    .filter(post => post.parsedDate && typeof post.slug === 'string')
    .sort((a,b) => b.parsedDate - a.parsedDate || a.originalIndex - b.originalIndex);
  const years = new Map();
  for (const post of posts) {
    const year = String(post.parsedDate.getUTCFullYear());
    const month = String(post.parsedDate.getUTCMonth() + 1).padStart(2,'0');
    if (!years.has(year)) years.set(year, new Map());
    if (!years.get(year).has(month)) years.get(year).set(month, []);
    years.get(year).get(month).push(post);
  }
  let selectedSlug = null;
  function renderTree() {
    root.innerHTML = Array.from(years, ([year, months]) => {
      const containsSelected = [...months.values()].some(items => items.some(p => p.slug === selectedSlug));
      return `<details class="year" ${containsSelected ? 'open' : ''}>
        <summary>${escapeHtml(year)}</summary>
        <div class="months">${Array.from(months, ([month, items]) => {
          const active = items.some(p => p.slug === selectedSlug);
          return `<details class="month" ${active ? 'open' : ''}>
            <summary>${escapeHtml(monthName(items[0].parsedDate))} <span class="count">${items.length}</span></summary>
            <div class="post-links">${items.map(p => `<a href="#note/${encodeURIComponent(p.slug)}" ${p.slug === selectedSlug ? 'aria-current="page"' : ''}>${escapeHtml(p.title)}</a>`).join('')}</div>
          </details>`;
        }).join('')}</div>
      </details>`;
    }).join('') || '<p class="empty">No entries yet.</p>';
  }
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
  function renderPost() {
    const hash = location.hash;
    let slug = null;
    if (hash.startsWith('#note/')) {
      try { slug = decodeURIComponent(hash.slice(6)); } catch (_) { slug = null; }
    }
    const index = Math.max(0, posts.findIndex(p => p.slug === slug));
    const post = posts[index];
    if (!post) {
      selectedSlug = null;
      dateNode.textContent = '';
      title.textContent = 'Nothing here yet.';
      body.textContent = 'Add your first entry in data/posts.js.';
      older.hidden = newer.hidden = true;
      renderTree();
      closeMenu();
      return;
    }
    selectedSlug = post.slug;
    document.title = `${post.title} — KRMII's Journal`;
    dateNode.textContent = longDate(post.parsedDate);
    dateNode.dateTime = post.parsedDate.toISOString().slice(0,10);
    title.textContent = post.title;
    body.innerHTML = (Array.isArray(post.body) ? post.body : []).map(block => {
      if (block && typeof block === 'object' && block.image) {
        const caption = block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : '';
        return `<figure><img src="${escapeHtml(block.image)}" alt="${escapeHtml(block.alt || '')}" loading="lazy">${caption}</figure>`;
      }
      return `<p>${escapeHtml(block)}</p>`;
    }).join('');
    const previous = posts[index + 1];
    const next = posts[index - 1];
    older.hidden = !previous;
    newer.hidden = !next;
    if (previous) { older.href = '#note/' + encodeURIComponent(previous.slug); older.textContent = '← Older entry'; }
    if (next) { newer.href = '#note/' + encodeURIComponent(next.slug); newer.textContent = 'Newer entry →'; }
    renderTree();
    closeMenu();
    window.scrollTo({top:0, behavior:'instant'});
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
  renderPost();
})();
