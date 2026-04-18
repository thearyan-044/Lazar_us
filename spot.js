/**
=================================================================
  SPOTIFY SECTION JS — Now Playing + Top Artists
  File: spotify-script.js

  Customised for: Aryan Joshi
  Spotify User ID: 31tkfbg7r6axawov4zvodmgn7k7m

=================================================================
  ★ SETUP GUIDE (read before using) ★

  The Spotify Web API requires OAuth tokens. Since this is a
  static portfolio site (no backend), you have TWO options:

  OPTION A — Easiest: Use a Spotify "Now Playing" proxy
  ─────────────────────────────────────────────────────
  1. Deploy this FREE service to Vercel (takes ~5 min):
     https://github.com/leerob/leerob.io/blob/main/app/api/now-playing/route.ts
     OR use: https://github.com/novatorem/novatorem (GitHub README badge)

  2. Set SPOTIFY_NOW_PLAYING_URL below to your deployed endpoint.

  OPTION B — Use Spotify Implicit Grant (client-side only)
  ─────────────────────────────────────────────────────────
  1. Go to https://developer.spotify.com/dashboard
  2. Create an app → set Redirect URI to your portfolio URL
  3. Copy your Client ID → set SPOTIFY_CLIENT_ID below
  4. The first time you load the page, you'll be prompted to
     log in. After that, it runs automatically.

  OPTION C — Pure static / no API (current fallback mode)
  ─────────────────────────────────────────────────────────
  Leave everything as-is. The section shows your hardcoded
  top artists and playlist links with a nice "offline" state.
  This is perfectly fine for a portfolio site.
=================================================================
*/

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     CONFIGURATION — fill these in to enable live data
  ══════════════════════════════════════════════════════ */
  const CONFIG = {
    /* Option A: your deployed Now Playing proxy endpoint
       Leave empty ('') if using Option B or C           */
    SPOTIFY_NOW_PLAYING_URL: '',

    /* Option B: Spotify Developer App Client ID
       Leave empty ('') if using Option A or C           */
    SPOTIFY_CLIENT_ID: '',

    /* Your Spotify User ID (public, read from your URL) */
    SPOTIFY_USER_ID: '31tkfbg7r6axawov4zvodmgn7k7m',

    /* Polling interval for now-playing (ms)             */
    POLL_INTERVAL: 30000,     // 30 seconds

    /* Scopes needed for Implicit Grant (Option B)       */
    SCOPES: 'user-read-currently-playing user-top-read',

    /* Your portfolio URL (for OAuth redirect)           */
    REDIRECT_URI: window.location.origin + window.location.pathname,

    /* Hardcoded fallback top artists (shown when API offline) */
    FALLBACK_ARTISTS: [
      'J. Cole',
      'Seedhe Maut',
      'Kanye West',
      'Drake',
      'Divine',
    ],
  };

  /* ══════════════════════════════════════════════════════
     DOM ELEMENT REFERENCES
  ══════════════════════════════════════════════════════ */
  const $ = (id) => document.getElementById(id);

  const DOM = {
    statusDot:      $('sp-status-dot'),
    statusText:     $('sp-status-text'),
    trackName:      $('sp-track-name'),
    trackArtist:    $('sp-track-artist'),
    trackAlbum:     $('sp-track-album'),
    artImg:         $('sp-art-img'),
    artLogo:        $('sp-art-logo'),
    vinylRing:      $('sp-vinyl-ring'),
    eq:             $('sp-eq'),
    progressWrap:   $('sp-track-progress-wrap'),
    progressBar:    $('sp-track-progress-bar'),
    timeCurrent:    $('sp-time-current'),
    timeTotal:      $('sp-time-total'),
    openLink:       $('sp-open-link'),
    artistsList:    $('sp-artists-list'),
  };

  /* ══════════════════════════════════════════════════════
     UTILITY FUNCTIONS
  ══════════════════════════════════════════════════════ */

  /** Format milliseconds → "m:ss" */
  function fmtMs(ms) {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  /** Update the status badge */
  function setStatus(state) {
    if (!DOM.statusDot || !DOM.statusText) return;
    DOM.statusDot.className = 'sp-status-dot ' + state;
    const labels = {
      live:    'live',
      offline: 'offline',
      loading: 'connecting...',
    };
    DOM.statusText.textContent = labels[state] || state;
  }

  /** Set the now-playing state */
  function setNowPlaying(data) {
    if (!data || !data.isPlaying) {
      /* Nothing playing */
      if (DOM.trackName)   DOM.trackName.textContent   = 'not playing';
      if (DOM.trackArtist) DOM.trackArtist.textContent = '—';
      if (DOM.trackAlbum)  DOM.trackAlbum.textContent  = '';
      if (DOM.artImg)      DOM.artImg.style.display     = 'none';
      if (DOM.artLogo)     DOM.artLogo.style.display    = 'block';
      if (DOM.vinylRing)   DOM.vinylRing.classList.remove('spinning');
      if (DOM.eq)          DOM.eq.classList.remove('active');
      if (DOM.progressWrap) DOM.progressWrap.style.display = 'none';
      setStatus('offline');
      return;
    }

    /* Track is playing */
    if (DOM.trackName)   DOM.trackName.textContent   = data.title    || '—';
    if (DOM.trackArtist) DOM.trackArtist.textContent = data.artist   || '—';
    if (DOM.trackAlbum)  DOM.trackAlbum.textContent  = data.album    || '';

    /* Album art */
    if (data.albumArt && DOM.artImg) {
      DOM.artImg.src = data.albumArt;
      DOM.artImg.style.display = 'block';
      if (DOM.artLogo) DOM.artLogo.style.display = 'none';
    }

    /* Vinyl spin + EQ */
    if (DOM.vinylRing) DOM.vinylRing.classList.add('spinning');
    if (DOM.eq)        DOM.eq.classList.add('active');

    /* Progress bar */
    if (data.progress != null && data.duration) {
      if (DOM.progressWrap)  DOM.progressWrap.style.display = 'block';
      const pct = (data.progress / data.duration) * 100;
      if (DOM.progressBar)   DOM.progressBar.style.width = pct + '%';
      if (DOM.timeCurrent)   DOM.timeCurrent.textContent  = fmtMs(data.progress);
      if (DOM.timeTotal)     DOM.timeTotal.textContent    = fmtMs(data.duration);
    }

    /* Track link */
    if (data.songUrl && DOM.openLink) {
      DOM.openLink.href = data.songUrl;
    }

    setStatus('live');
  }

  /** Render top artists list */
  function renderArtists(artists) {
    if (!DOM.artistsList) return;
    DOM.artistsList.innerHTML = artists
      .slice(0, 5)
      .map((name, i) => `
        <li class="sp-artist-item">
          <span class="sp-artist-rank">${String(i + 1).padStart(2, '0')}</span>
          <span class="sp-artist-name">${name}</span>
        </li>`)
      .join('');
  }

  /* ══════════════════════════════════════════════════════
     OPTION A — Proxy endpoint fetch
  ══════════════════════════════════════════════════════ */
  async function fetchViaProxy() {
    const url = CONFIG.SPOTIFY_NOW_PLAYING_URL;
    if (!url) return null;

    try {
      const res = await fetch(url);
      if (!res.ok || res.status === 204) return { isPlaying: false };
      const json = await res.json();

      /* Normalise different proxy formats */
      return {
        isPlaying: json.isPlaying ?? json.is_playing ?? false,
        title:     json.title     ?? json.item?.name,
        artist:    json.artist    ?? json.item?.artists?.map(a => a.name).join(', '),
        album:     json.album     ?? json.item?.album?.name,
        albumArt:  json.albumImageUrl ?? json.item?.album?.images?.[0]?.url,
        progress:  json.progress_ms ?? json.item?.progress_ms,
        duration:  json.duration_ms ?? json.item?.duration_ms,
        songUrl:   json.songUrl   ?? json.item?.external_urls?.spotify,
      };
    } catch {
      return null;
    }
  }

  /* ══════════════════════════════════════════════════════
     OPTION B — Implicit Grant (client-side OAuth)
  ══════════════════════════════════════════════════════ */
  function getTokenFromHash() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('access_token');
  }

  function saveToken(token) {
    try {
      sessionStorage.setItem('sp_token', token);
      sessionStorage.setItem('sp_token_time', Date.now().toString());
    } catch {}
  }

  function loadToken() {
    try {
      const token = sessionStorage.getItem('sp_token');
      const time  = parseInt(sessionStorage.getItem('sp_token_time') || '0', 10);
      /* Implicit grant tokens last 3600 seconds */
      if (token && Date.now() - time < 3550000) return token;
    } catch {}
    return null;
  }

  function redirectToSpotify() {
    const params = new URLSearchParams({
      client_id:     CONFIG.SPOTIFY_CLIENT_ID,
      response_type: 'token',
      redirect_uri:  CONFIG.REDIRECT_URI,
      scope:         CONFIG.SCOPES,
      show_dialog:   'false',
    });
    window.location.href = 'https://accounts.spotify.com/authorize?' + params.toString();
  }

  async function fetchViaImplicitGrant(token) {
    if (!token) return null;
    try {
      const [npRes, topRes] = await Promise.all([
        fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: { Authorization: 'Bearer ' + token },
        }),
        fetch('https://api.spotify.com/v1/me/top/artists?limit=5&time_range=medium_term', {
          headers: { Authorization: 'Bearer ' + token },
        }),
      ]);

      /* Top artists */
      if (topRes.ok) {
        const topJson = await topRes.json();
        const artists = topJson.items?.map(a => a.name) || [];
        if (artists.length) renderArtists(artists);
      }

      /* Now playing */
      if (!npRes.ok || npRes.status === 204) return { isPlaying: false };
      const npJson = await npRes.json();
      const item = npJson.item;
      if (!item) return { isPlaying: false };

      return {
        isPlaying: npJson.is_playing,
        title:     item.name,
        artist:    item.artists?.map(a => a.name).join(', '),
        album:     item.album?.name,
        albumArt:  item.album?.images?.[0]?.url,
        progress:  npJson.progress_ms,
        duration:  item.duration_ms,
        songUrl:   item.external_urls?.spotify,
      };
    } catch {
      return null;
    }
  }

  /* ══════════════════════════════════════════════════════
     MAIN INIT
  ══════════════════════════════════════════════════════ */
  async function init() {
    setStatus('loading');

    /* ── Option A: proxy endpoint ── */
    if (CONFIG.SPOTIFY_NOW_PLAYING_URL) {
      const data = await fetchViaProxy();
      setNowPlaying(data);

      /* Poll every 30 seconds */
      setInterval(async () => {
        const fresh = await fetchViaProxy();
        setNowPlaying(fresh);
      }, CONFIG.POLL_INTERVAL);

      /* Render fallback artists (proxy doesn't return top artists) */
      renderArtists(CONFIG.FALLBACK_ARTISTS);
      return;
    }

    /* ── Option B: implicit grant ── */
    if (CONFIG.SPOTIFY_CLIENT_ID) {
      /* Check if we just came back from Spotify auth */
      const hashToken = getTokenFromHash();
      if (hashToken) {
        saveToken(hashToken);
        /* Clean hash from URL */
        history.replaceState(null, '', window.location.pathname);
      }

      const token = loadToken();

      if (token) {
        const data = await fetchViaImplicitGrant(token);
        setNowPlaying(data);

        setInterval(async () => {
          const fresh = await fetchViaImplicitGrant(loadToken());
          setNowPlaying(fresh);
        }, CONFIG.POLL_INTERVAL);
      } else {
        /* Prompt user to authorise */
        setStatus('offline');
        renderArtists(CONFIG.FALLBACK_ARTISTS);

        /* Add a small "connect" button below the section if desired */
        const connectBtn = document.createElement('button');
        connectBtn.textContent = 'connect spotify →';
        connectBtn.className = 'sp-connect-btn';
        connectBtn.onclick = redirectToSpotify;
        const section = document.getElementById('spotify');
        if (section) section.appendChild(connectBtn);
      }
      return;
    }

    /* ── Option C: static fallback ── */
    setStatus('offline');
    setNowPlaying({ isPlaying: false });
    renderArtists(CONFIG.FALLBACK_ARTISTS);
  }

  /* ── Boot when DOM is ready ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();