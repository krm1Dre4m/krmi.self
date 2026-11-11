/* Optional YouTube jukebox: no downloaded audio, no API key, no autoplay.
 * The YouTube iframe stays visible while playing, with its native controls.
 * The little bars react to playback state, not actual audio frequencies. */
(() => {
  const launch = document.getElementById('music-launch');
  const panel = document.getElementById('music-panel');
  const close = document.getElementById('music-close');
  const form = document.getElementById('music-form');
  const input = document.getElementById('music-url');
  const video = document.getElementById('music-video');
  const bars = document.getElementById('music-bars');
  const status = document.getElementById('music-status');
  const watch = document.getElementById('music-watch');
  if (!launch || !panel || !form) return;

  let player = null;
  let ready = false;
  let selectedVideo = null;
  let playerApiPromise = null;
  let pendingVideo = null;

  function parseYouTubeId(raw) {
    let url;
    try { url = new URL(raw.trim()); } catch (_) { return null; }
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    const host = url.hostname.toLowerCase();
    const segments = url.pathname.split('/').filter(Boolean);
    let id;
    if (host === 'youtu.be' || host === 'www.youtu.be') id = segments[0];
    else if (['youtube.com','www.youtube.com','m.youtube.com','music.youtube.com','www.youtube-nocookie.com','youtube-nocookie.com'].includes(host)) {
      if (segments[0] === 'watch') id = url.searchParams.get('v');
      else if (['shorts','live','embed','v'].includes(segments[0])) id = segments[1];
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  }

  function setPlaying(playing) {
    bars.classList.toggle('is-playing', playing);
    if (playing) status.textContent = 'Playing on YouTube';
    else if (selectedVideo) status.textContent = 'Paused / ready to play';
  }

  function showPanel(show) {
    if (!show && player && ready && typeof player.pauseVideo === 'function') player.pauseVideo();
    panel.hidden = !show;
    launch.setAttribute('aria-expanded', String(show));
    if (show && !selectedVideo) input.focus();
  }

  function loadPlayerApi() {
    if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
    if (playerApiPromise) return playerApiPromise;
    playerApiPromise = new Promise((resolve, reject) => {
      const oldCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (typeof oldCallback === 'function') oldCallback();
        resolve(window.YT);
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => reject(new Error('Could not load the YouTube player API.'));
      document.head.append(script);
    }).catch(error => {
      playerApiPromise = null;
      throw error;
    });
    return playerApiPromise;
  }

  async function selectVideo(id) {
    selectedVideo = id;
    pendingVideo = id;
    video.hidden = false;
    watch.hidden = false;
    watch.href = 'https://www.youtube.com/watch?v=' + id;
    input.value = watch.href;
    setPlaying(false);
    status.textContent = 'Loading YouTube player…';
    try { localStorage.setItem('krmi-youtube-video', id); } catch (_) {}
    try {
      const YT = await loadPlayerApi();
      if (player && ready) {
        player.cueVideoById(pendingVideo);
        status.textContent = 'Press play in the YouTube player';
        return;
      }
      if (player) return; // onReady will cue the latest requested ID
      player = new YT.Player('youtube-player', {
        width: '320', height: '200', videoId: pendingVideo,
        playerVars: { controls: 1, playsinline: 1, rel: 0 },
        events: {
          onReady: event => {
            ready = true;
            if (pendingVideo) event.target.cueVideoById(pendingVideo);
            status.textContent = 'Press play in the YouTube player';
          },
          onStateChange: event => {
            if (event.data === YT.PlayerState.PLAYING) setPlaying(true);
            else if (event.data === YT.PlayerState.ENDED) {
              setPlaying(false);
              status.textContent = 'Finished playing';
            } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.CUED) setPlaying(false);
          },
          onError: () => { setPlaying(false); status.textContent = 'Video unavailable or embedding disabled'; }
        }
      });
    } catch (error) {
      status.textContent = 'YouTube could not load. Try again later.';
      video.hidden = true;
      console.warn(error);
    }
  }

  launch.addEventListener('click', () => showPanel(panel.hidden));
  close.addEventListener('click', () => { showPanel(false); launch.focus(); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    const id = parseYouTubeId(input.value);
    if (!id) {
      input.setCustomValidity('Enter a valid YouTube video link.');
      input.reportValidity();
      input.setCustomValidity('');
      return;
    }
    selectVideo(id);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) { showPanel(false); launch.focus(); }
  });
  try {
    const saved = localStorage.getItem('krmi-youtube-video');
    if (saved && /^[A-Za-z0-9_-]{11}$/.test(saved)) {
      input.value = 'https://www.youtube.com/watch?v=' + saved;
      status.textContent = 'Previous video ready — press Load';
    }
  } catch (_) {}
})();
