/* Read-only journal soundtrack powered by YouTube's official embedded player.
 * Songs are selected by each entry (or the site fallback), never by visitors.
 * No autoplay: playback requires interacting with YouTube's visible controls.
 * Bars indicate playing state, not actual audio frequencies. */
(() => {
  const launch = document.getElementById('music-launch');
  const panel = document.getElementById('music-panel');
  const close = document.getElementById('music-close');
  const bars = document.getElementById('music-bars');
  const volume = document.getElementById('music-volume');
  const volumeValue = document.getElementById('music-volume-value');
  let volumeLevel = 65;
  try {
    const saved = Number(localStorage.getItem('krmi-music-volume'));
    if (localStorage.getItem('krmi-music-volume') !== null && Number.isFinite(saved)) volumeLevel = Math.max(0, Math.min(100, saved));
  } catch (_) {}
  volume.value = String(volumeLevel);
  volumeValue.textContent = volumeLevel + '%';
  const status = document.getElementById('music-status');
  const watch = document.getElementById('music-watch');
  if (!launch || !panel) return;

  let player = null;
  let ready = false;
  let selectedVideo = null;
  let pendingVideo = null;
  let apiPromise = null;
  let loadingPlayer = false;
  let playing = false;
  let cuedVideo = null;

  function parseYouTubeId(raw) {
    let url;
    try { url = new URL(String(raw || '').trim()); } catch (_) { return null; }
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    const segments = url.pathname.split('/').filter(Boolean);
    let id = null;
    if (host === 'youtu.be' || host === 'www.youtu.be') id = segments[0];
    else if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com',
      'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(host)) {
      if (segments[0] === 'watch') id = url.searchParams.get('v');
      else if (['shorts', 'live', 'embed', 'v'].includes(segments[0])) id = segments[1];
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  }

  function setPlaying(isPlaying) {
    playing = isPlaying;
    bars.classList.toggle('is-playing', isPlaying);
    launch.setAttribute('aria-label', isPlaying ? 'Music playing — open player' : 'Open journal music player');
    if (isPlaying) status.textContent = 'Playing';
    else if (selectedVideo) status.textContent = 'Ready to play';
  }

  function applyVolume(value) {
    volumeLevel = Math.max(0, Math.min(100, Number(value) || 0));
    volume.value = String(volumeLevel);
    volumeValue.textContent = volumeLevel + '%';
    if (ready && player?.setVolume) player.setVolume(volumeLevel);
    try { localStorage.setItem('krmi-music-volume', String(volumeLevel)); } catch (_) {}
  }

  volume.addEventListener('input', () => applyVolume(volume.value));

  function loadApi() {
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (apiPromise) return apiPromise;
    apiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof previous === 'function') previous();
        resolve(window.YT);
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => reject(new Error('Could not load YouTube iframe API'));
      document.head.append(script);
    }).catch(error => { apiPromise = null; throw error; });
    return apiPromise;
  }

  async function ensurePlayer() {
    if (!selectedVideo || panel.hidden) return;
    if (player && ready) {
      if (cuedVideo !== pendingVideo) {
        player.cueVideoById(pendingVideo);
        cuedVideo = pendingVideo;
      }
      return;
    }
    if (player || loadingPlayer) return;
    loadingPlayer = true;
    status.textContent = 'Loading…';
    try {
      const YT = await loadApi();
      if (panel.hidden) return;
      player = new YT.Player('youtube-player', {
        width: '240', height: '200', videoId: pendingVideo,
        playerVars: { controls: 1, playsinline: 1, rel: 0 },
        events: {
          onReady: event => {
            ready = true;
            event.target.setVolume(volumeLevel);
            if (pendingVideo) { event.target.cueVideoById(pendingVideo); cuedVideo = pendingVideo; }
            if (panel.hidden) event.target.pauseVideo();
            status.textContent = panel.hidden ? 'Ready to listen' : 'Press play above';
          },
          onStateChange: event => {
            if (event.data === YT.PlayerState.PLAYING) {
              if (panel.hidden) { event.target.pauseVideo(); return; }
              setPlaying(true);
            } else if (event.data === YT.PlayerState.ENDED) {
              setPlaying(false);
              status.textContent = 'Finished';
            } else if ([YT.PlayerState.PAUSED, YT.PlayerState.CUED].includes(event.data)) {
              setPlaying(false);
            }
          },
          onError: () => {
            setPlaying(false);
            status.textContent = 'Video unavailable';
          }
        }
      });
    } catch (error) {
      status.textContent = 'Could not load YouTube';
      console.warn(error);
    } finally {
      loadingPlayer = false;
    }
  }

  function updateMusic(raw) {
    const id = parseYouTubeId(raw);
    if (!id || selectedVideo === id) return;
    selectedVideo = pendingVideo = id;
    watch.hidden = false;
    watch.href = 'https://www.youtube.com/watch?v=' + id;
    setPlaying(false);
    status.textContent = 'Ready to listen';
    if (!panel.hidden) ensurePlayer();
  }

  function showPanel(open) {
    // The official YouTube video must remain visible while it plays.
    // Visitors can pause inside the player and then close this panel.
    if (!open && playing) {
      status.textContent = 'Pause the video before closing';
      return;
    }
    panel.hidden = !open;
    launch.setAttribute('aria-expanded', String(open));
    if (open) ensurePlayer();
    else setPlaying(false);
  }

  launch.addEventListener('click', () => showPanel(panel.hidden));
  close.addEventListener('click', () => { showPanel(false); launch.focus(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) { showPanel(false); launch.focus(); }
  });
  window.addEventListener('journal:entrychange', event => updateMusic(event.detail?.music));
  updateMusic(window.currentJournalMusicUrl || window.defaultMusicUrl);
  ensurePlayer(); // Show the selected soundtrack by default; no autoplay.
})();
