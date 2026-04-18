(function () {
  'use strict';

  const CONFIG = {
    osLabel: 'AryanOS v1.0 initializing...',
    typeSpeed: 42,
    dotCount: 12,
    dotSpeed: 28,
    lineDelay: 120,
    readyDelay: 280,
    nameDelay: 320,
    dismissDelay: 900,
  };

  const BOOT_LINES = [
    { key: 'mounting processes', val: '6 active', id: 1 },
    { key: 'memory allocation', val: '512MB — impact only', id: 2 },
    { key: 'sleep mode', val: 'disabled', id: 3 },
    { key: 'loading personality', val: 'done', id: 4 },
    { key: 'strategic ambitions', val: 'compiling...', id: 5 },
    { key: 'calibrating impact', val: 'ready', id: 6 },
  ];

  const LOADER_SESSION_KEY = 'aryanPortfolioLoaderShown';

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function typeText(el, text, speed = CONFIG.typeSpeed) {
    for (const ch of text) {
      el.textContent += ch;
      await sleep(speed);
    }
  }

  function setProgress(pct) {
    const bar = document.getElementById('ls-progress-bar');
    const label = document.getElementById('ls-progress-pct');
    if (bar) bar.style.width = pct + '%';
    if (label) label.textContent = Math.round(pct) + '%';
  }

  async function animateDots(dotsEl, count, speed) {
    let s = '';
    for (let i = 0; i < count; i++) {
      s += '.';
      dotsEl.textContent = s;
      await sleep(speed);
    }
  }

  async function runBoot() {
    const overlay = document.getElementById('ls-overlay');
    const cursor = document.getElementById('ls-cursor-loader');
    const typedOs = document.getElementById('ls-typed-os');
    const bootLines = document.getElementById('ls-boot-lines');
    const readyBlk = document.getElementById('ls-ready-block');
    const readyTxt = document.getElementById('ls-ready-text');
    const nameBlk = document.getElementById('ls-name-block');
    const flash = document.getElementById('ls-flash');

    if (!overlay) return;

    await typeText(typedOs, CONFIG.osLabel, CONFIG.typeSpeed);
    setProgress(8);

    bootLines.style.display = 'flex';
    bootLines.style.flexDirection = 'column';
    bootLines.style.gap = '4px';

    const progressPerLine = 72 / BOOT_LINES.length;

    for (let i = 0; i < BOOT_LINES.length; i++) {
      const { id, val } = BOOT_LINES[i];
      const dotsEl = document.getElementById(`ls-dots-${id}`);
      const valEl = document.getElementById(`ls-val-${id}`);

      if (!dotsEl || !valEl) continue;

      await animateDots(dotsEl, CONFIG.dotCount, CONFIG.dotSpeed);
      valEl.textContent = val;

      setProgress(8 + (i + 1) * progressPerLine);
      await sleep(CONFIG.lineDelay);
    }

    await sleep(CONFIG.readyDelay);
    setProgress(92);
    readyBlk.style.display = 'block';
    await typeText(readyTxt, 'ready.', CONFIG.typeSpeed);
    if (cursor) cursor.style.display = 'none';

    await sleep(CONFIG.nameDelay);
    setProgress(100);
    nameBlk.style.display = 'block';
    nameBlk.style.opacity = '0';
    nameBlk.style.transform = 'translateY(10px)';
    nameBlk.style.transition = 'opacity 0.55s ease, transform 0.55s ease';

    await sleep(20);
    nameBlk.style.opacity = '1';
    nameBlk.style.transform = 'translateY(0)';

    await sleep(CONFIG.dismissDelay);
    flash.classList.add('ls-flash--active');
    await sleep(350);
    overlay.classList.add('ls-hidden');

    // Save loader as "already shown"
    sessionStorage.setItem(LOADER_SESSION_KEY, 'true');

    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  function skipLoader() {
    const overlay = document.getElementById('ls-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }

  function initLoader() {
    const hasShownLoader = sessionStorage.getItem(LOADER_SESSION_KEY);

    if (hasShownLoader) {
      skipLoader();
      return;
    }

    document.body.style.overflow = 'hidden';
    runBoot();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoader);
  } else {
    initLoader();
  }

})();