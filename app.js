(() => {
  const posts = Array.isArray(window.posts) ? window.posts : [];
  const latestPosts = document.querySelector('#latest-posts');
  const archiveList = document.querySelector('#archive-list');
  const filterList = document.querySelector('#filter-list');
  const searchInput = document.querySelector('#search-input');
  const emptyState = document.querySelector('#empty-state');
  const modal = document.querySelector('#article-modal');
  const articleTitle = document.querySelector('#article-title');
  const articleMeta = document.querySelector('#article-meta');
  const articleBody = document.querySelector('#article-body');
  const themeToggle = document.querySelector('.theme-toggle');
  const form = document.querySelector('#newsletter-form');
  const formStatus = document.querySelector('#form-status');
  let activeFilter = 'All notes';

  // Accepts dd-mm-yyyy (preferred) or yyyy-mm-dd. Returns {iso, display}.
  const parseDate = (value) => {
    const parts = String(value).trim().split('-');
    let year, month, day;
    if (parts.length === 3 && parts[0].length === 4) {
      [year, month, day] = parts; // yyyy-mm-dd
    } else if (parts.length === 3) {
      [day, month, year] = parts; // dd-mm-yyyy
    } else {
      return { iso: '', display: String(value) };
    }
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const date = new Date(`${iso}T12:00:00`);
    const display = Number.isNaN(date.getTime())
      ? String(value)
      : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    return { iso, display };
  };
  const formatDate = (value) => parseDate(value).display;
  const isoDate = (value) => parseDate(value).iso;
  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

  function postCard(post, isLead) {
    return `<article class="post-card${isLead ? ' lead' : ''}">
      <div class="post-meta"><span class="post-label">${escapeHtml(post.label)}</span><time datetime="${escapeHtml(isoDate(post.date))}">${formatDate(post.date)}</time></div>
      <h3>${escapeHtml(post.title)}</h3>
      <p>${escapeHtml(post.excerpt)}</p>
      <a class="card-link" href="#note/${encodeURIComponent(post.slug)}" data-post="${escapeHtml(post.slug)}">Read note <span aria-hidden="true">↗</span></a>
    </article>`;
  }

  function archiveRow(post) {
    return `<a class="archive-row" href="#note/${encodeURIComponent(post.slug)}" data-post="${escapeHtml(post.slug)}">
      <time class="archive-date" datetime="${escapeHtml(isoDate(post.date))}">${formatDate(post.date)}</time>
      <span class="archive-title">${escapeHtml(post.title)}</span>
      <span class="archive-arrow" aria-hidden="true">↗</span>
    </a>`;
  }

  function renderLatest() { latestPosts.innerHTML = posts.slice(0, 3).map((post, index) => postCard(post, index === 0)).join(''); }

  function renderFilters() {
    const labels = ['All notes', ...new Set(posts.map((post) => post.label))];
    filterList.innerHTML = labels.map((label) => `<button class="filter-button" type="button" aria-pressed="${label === activeFilter}" data-filter="${escapeHtml(label)}">${escapeHtml(label)}</button>`).join('');
  }

  function renderArchive() {
    const query = searchInput.value.trim().toLowerCase();
    const visiblePosts = posts.filter((post) => {
      const matchesFilter = activeFilter === 'All notes' || post.label === activeFilter;
      const haystack = `${post.title} ${post.excerpt} ${post.label}`.toLowerCase();
      return matchesFilter && haystack.includes(query);
    });
    archiveList.innerHTML = visiblePosts.map(archiveRow).join('');
    emptyState.hidden = visiblePosts.length > 0;
  }

  function openPost(slug) {
    const post = posts.find((item) => item.slug === slug);
    if (!post) return;
    articleMeta.innerHTML = `<span class="post-label">${escapeHtml(post.label)}</span><time datetime="${escapeHtml(isoDate(post.date))}">${formatDate(post.date)}</time>`;
    articleTitle.textContent = post.title;
    articleBody.innerHTML = post.body.map((block) => {
      if (block && typeof block === 'object' && block.image) {
        const alt = block.alt ? escapeHtml(block.alt) : '';
        const caption = block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : '';
        return `<figure class="article-image"><img src="${escapeHtml(block.image)}" alt="${alt}" loading="lazy" />${caption}</figure>`;
      }
      return `<p>${escapeHtml(block)}</p>`;
    }).join('');
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close').focus();
  }

  function closePost() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (location.hash.startsWith('#note/')) history.replaceState(null, '', `${location.pathname}${location.search}#archive`);
  }

  function syncHash() {
    if (location.hash.startsWith('#note/')) openPost(decodeURIComponent(location.hash.slice(6)));
  }

  function setTheme(isDark) {
    document.body.classList.toggle('light-mode', !isDark);
    themeToggle.setAttribute('aria-pressed', String(!isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggle.querySelector('.theme-label').textContent = isDark ? 'Dark' : 'Light';
    themeToggle.querySelector('.theme-icon').textContent = isDark ? '☾' : '☼';
    localStorage.setItem('krmii-theme', isDark ? 'dark' : 'light');
  }

  latestPosts.addEventListener('click', (event) => { if (event.target.closest('[data-post]')) syncHash(); });
  archiveList.addEventListener('click', (event) => { if (event.target.closest('[data-post]')) syncHash(); });
  filterList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    activeFilter = button.dataset.filter;
    renderFilters();
    renderArchive();
  });
  searchInput.addEventListener('input', renderArchive);
  document.addEventListener('click', (event) => { if (event.target.matches('[data-close-modal]')) closePost(); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) closePost(); });
  window.addEventListener('hashchange', syncHash);
  themeToggle.addEventListener('click', () => setTheme(document.body.classList.contains('light-mode')));
  form.addEventListener('submit', (event) => { event.preventDefault(); formStatus.textContent = 'Thanks — the first note will arrive soon.'; form.reset(); });

  renderLatest();
  renderFilters();
  renderArchive();
  setTheme(localStorage.getItem('krmii-theme') !== 'light');
  syncHash();
})();
