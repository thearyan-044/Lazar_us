/**
 * Aryan Joshi — Portfolio
 * aryan-script.js  |  v2.0
 *
 * MODULES
 *  1. Custom Cursor
 *  2. Navbar Scroll Behaviour
 *  3. Scroll Reveal (IntersectionObserver)
 *  4. Smooth Anchor Scrolling
 *  5. Active Nav Link Highlight
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. CUSTOM CURSOR ─────────────────── */
  const cursor = document.getElementById('cursor');

  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });

  const hoverTargets = document.querySelectorAll(
    'a, button, .service-card, .project-row, .testimonial-card, ' +
    '.process-step, .nav-cta, .eh-feature-card, .slide-btn, .slide-dot'
  );
  hoverTargets.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
  });

  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });


  /* ── 2. NAVBAR SCROLL ─────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });


  /* ── 3. SCROLL REVEAL ─────────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.09 });
  revealEls.forEach(el => revealObserver.observe(el));


  /* ── 4. SMOOTH ANCHOR SCROLLING ──────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = (navbar ? navbar.offsetHeight : 80) + 20;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
      }
    });
  });


  /* ── 5. ACTIVE NAV LINK ───────────────── */
  const sections = document.querySelectorAll('section[id], div[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 100) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href').replace('#', '') === current) {
        link.style.color = 'var(--gold)';
      }
    });
  }, { passive: true });

});

/**
 * EcoHaven Project Page
 * ecohaven-script.js  |  v1.0
 *
 * MODULES
 *  1. Slideshow (prev / next / dots / keyboard / auto-advance / touch)
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── SLIDESHOW ─────────────────────────── */
  const slides    = document.querySelectorAll('.slide');
  const dots      = document.querySelectorAll('.slide-dot');
  const prevBtn   = document.getElementById('slidePrev');
  const nextBtn   = document.getElementById('slideNext');

  if (!slides.length) return;

  let current   = 0;
  let autoTimer = null;
  const DELAY   = 5000;   // 5 s auto-advance

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  /* Auto-advance */
  function startAuto() {
    stopAuto();
    autoTimer = setInterval(next, DELAY);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  /* Buttons */
  nextBtn && nextBtn.addEventListener('click', () => { next(); startAuto(); });
  prevBtn && prevBtn.addEventListener('click', () => { prev(); startAuto(); });

  /* Dot clicks */
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      goTo(Number(dot.dataset.index));
      startAuto();
    });
  });

  /* Keyboard */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { next(); startAuto(); }
    if (e.key === 'ArrowLeft')  { prev(); startAuto(); }
  });

  /* Touch / swipe */
  let touchStartX = 0;
  const slideshowEl = document.querySelector('.slideshow-wrap');
  if (slideshowEl) {
    slideshowEl.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    slideshowEl.addEventListener('touchend', e => {
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) {
        delta < 0 ? next() : prev();
        startAuto();
      }
    }, { passive: true });

    /* Pause on hover */
    slideshowEl.addEventListener('mouseenter', stopAuto);
    slideshowEl.addEventListener('mouseleave', startAuto);
  }

  /* Start */
  startAuto();

});


/**
 * Interact Club Treasurer — Project Page
 * interact-script.js  |  v1.0
 *
 * MODULES
 *  1. Animated Counters  (metrics bar numbers count up on scroll)
 *  2. Gold line reveal   (photo frame top-border animation trigger)
 *  3. Parallax tilt      (achievement card subtle hover tilt)
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. ANIMATED COUNTERS ─────────────────
     Counts up numbers in .ic-metric-num when
     the metrics bar enters the viewport.
  ───────────────────────────────────────── */
  const metricsBar = document.querySelector('.ic-metrics');
  if (!metricsBar) return;

  // Map each metric to its target value + suffix
  const metricData = [
    { value: 1,   suffix: 'Cr',  prefix: '₹' },
    { value: 6,   suffix: '+',   prefix: ''  },
    { value: 12,  suffix: '',    prefix: ''  },
    { value: 1,   suffix: '',    prefix: '#' },
  ];

  let countersRun = false;

  function animateCounter(el, target, prefix, suffix, duration = 1400) {
    const start     = performance.now();
    const isDecimal = String(target).includes('.');

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = isDecimal
        ? (eased * target).toFixed(1)
        : Math.round(eased * target);
      el.innerHTML   = `${prefix}${current}<span>${suffix}</span>`;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !countersRun) {
        countersRun = true;
        const nums = document.querySelectorAll('.ic-metric-num');
        nums.forEach((num, i) => {
          const d = metricData[i];
          if (d) animateCounter(num, d.value, d.prefix, d.suffix);
        });
        counterObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });

  counterObserver.observe(metricsBar);


  /* ── 2. GOLD LINE REVEAL on photo frame ──
     Adds .visible to .ic-hero-photo-frame when
     it enters view, triggering the CSS width
     transition on ::before pseudo-element.
  ───────────────────────────────────────── */
  const photoFrame = document.querySelector('.ic-hero-photo-frame');
  if (photoFrame) {
    const frameObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Small delay so it fires after the fade-in reveal
          setTimeout(() => photoFrame.classList.add('visible'), 400);
          frameObserver.disconnect();
        }
      });
    }, { threshold: 0.2 });
    frameObserver.observe(photoFrame);
  }


  /* ── 3. SUBTLE HOVER TILT on achievement card ──
     Gives the achievement card a gentle 3-D tilt
     on mouse movement — adds depth without jank.
  ───────────────────────────────────────── */
  const tiltCards = document.querySelectorAll('.ic-achievement-card, .ic-pm-card');

  tiltCards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const rotX   = (-dy * 2).toFixed(2);
      const rotY   = ( dx * 2).toFixed(2);
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

});


/**
 * Artha 99 — Work Experience Page
 * artha-script.js  |  v1.0
 *
 * MODULES
 *  1. Animated counters  — metrics bar + impact stats count up on scroll
 *  2. Responsibility hover line  — gold left-border width animation
 *  3. Skill item stagger  — each skill row fades in with a delay
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. ANIMATED COUNTERS ─────────────────────────────────────────
     Runs once when the element enters the viewport.
     Supports plain integers and formatted numbers (e.g. 7000 → "7,000+").
  ────────────────────────────────────────────────────────────────── */

  function formatNumber(n) {
    // Add thousands separators
    return n.toLocaleString('en-IN');
  }

  function countUp(el, target, suffix = '', duration = 1600) {
    const start = performance.now();
    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out quart
      const eased    = 1 - Math.pow(1 - progress, 4);
      const value    = Math.round(eased * target);
      el.innerHTML   = `${formatNumber(value)}<span>${suffix}</span>`;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* Metrics bar */
  const metricsBar = document.querySelector('.ar-metrics');
  const metricDefs = [
    { target: 70,   suffix: '+' },
    { target: 7000, suffix: '+' },
    { target: 200,  suffix: '+' },
    { target: 50,   suffix: '+' },
  ];
  let metricsRun = false;

  if (metricsBar) {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !metricsRun) {
        metricsRun = true;
        document.querySelectorAll('.ar-metric-num').forEach((el, i) => {
          const d = metricDefs[i];
          if (d) countUp(el, d.target, d.suffix);
        });
        obs.disconnect();
      }
    }, { threshold: 0.35 });
    obs.observe(metricsBar);
  }

  /* Impact & Results card stats */
  const impactCard = document.querySelector('.ar-impact-card');
  let impactRun = false;

  if (impactCard) {
    const impactNums = impactCard.querySelectorAll('.ar-impact-num');
    const impactDefs = [
      { target: 70,   suffix: '+' },
      { target: 7000, suffix: '+' },
      { target: 50,   suffix: '+' },
    ];

    const obs2 = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !impactRun) {
        impactRun = true;
        impactNums.forEach((el, i) => {
          const d = impactDefs[i];
          if (d) countUp(el, d.target, d.suffix, 1400);
        });
        obs2.disconnect();
      }
    }, { threshold: 0.3 });
    obs2.observe(impactCard);
  }

  /* VC right-panel stats */
  const vcRight = document.querySelector('.ar-vc-right');
  let vcRun = false;

  if (vcRight) {
    const vcDefs = [
      { target: 50,  suffix: '+' },
      { target: 1,   suffix: '' },
      { target: 10,  suffix: 'yr' },
    ];

    const obs3 = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !vcRun) {
        vcRun = true;
        vcRight.querySelectorAll('.ar-vc-num').forEach((el, i) => {
          const d = vcDefs[i];
          if (d) countUp(el, d.target, d.suffix, 1200);
        });
        obs3.disconnect();
      }
    }, { threshold: 0.3 });
    obs3.observe(vcRight);
  }


  /* ── 2. RESPONSIBILITY HOVER HIGHLIGHT ───────────────────────────
     When a responsibility row is hovered the left gold dot
     scales up and glows — purely CSS-driven but we add a class
     so complex transitions can be triggered via JS if needed.
  ────────────────────────────────────────────────────────────────── */
  document.querySelectorAll('.ar-resp-item').forEach(item => {
    item.addEventListener('mouseenter', () => item.querySelector('.ar-resp-dot')?.classList.add('pulse'));
    item.addEventListener('mouseleave', () => item.querySelector('.ar-resp-dot')?.classList.remove('pulse'));
  });


  /* ── 3. SKILL ITEM STAGGER ────────────────────────────────────────
     Each .ar-skill-item fades + slides in with increasing delay
     once the skills card enters the viewport.
  ────────────────────────────────────────────────────────────────── */
  const skillsList = document.querySelector('.ar-skills-list');

  if (skillsList) {
    const skillItems = skillsList.querySelectorAll('.ar-skill-item');

    // Set initial hidden state
    skillItems.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateX(-12px)';
      item.style.transition = 'opacity .4s ease, transform .4s ease';
    });

    const skillObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        skillItems.forEach((item, i) => {
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
          }, i * 90);   // 90 ms stagger between each item
        });
        skillObs.disconnect();
      }
    }, { threshold: 0.2 });

    skillObs.observe(skillsList);
  }

});

/**
 * Community Initiatives — Project Page
 * community-script.js  |  v1.0
 *
 * MODULES
 *  1. Metrics bar count-up animation
 *  2. Photo frame gold-line reveal trigger
 *  3. Initiative section entrance highlight
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. METRICS COUNT-UP ──────────────────────────────────────────
     Numbers in the metrics bar animate upwards when they enter view.
  ──────────────────────────────────────────────────────────────────*/
  const metricsBar = document.querySelector('.ci-metrics');

  const metricDefs = [
    { id: 'm1', target: 50,  suffix: '+' },
    { id: 'm2', target: 200, suffix: '+' },
    { id: 'm3', target: 3,   suffix: ''  },
    // 4th metric (100%) is static — left as is
  ];

  function countUp(el, target, suffix, duration = 1600) {
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      el.innerHTML = `${Math.round(eased * target)}<span>${suffix}</span>`;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  let metricsRun = false;
  if (metricsBar) {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !metricsRun) {
        metricsRun = true;
        metricDefs.forEach(({ id, target, suffix }) => {
          const el = document.getElementById(id);
          if (el) countUp(el, target, suffix);
        });
        obs.disconnect();
      }
    }, { threshold: 0.4 });
    obs.observe(metricsBar);
  }


  /* ── 2. PHOTO FRAME GOLD-LINE REVEAL ─────────────────────────────
     Adds .visible to each .ci-photo-frame when it enters the viewport,
     which triggers the CSS ::before width transition (gold top border).
  ──────────────────────────────────────────────────────────────────*/
  const photoFrames = document.querySelectorAll('.ci-photo-frame');

  if (photoFrames.length) {
    const frameObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // slight delay so it fires after the reveal fade-in
          setTimeout(() => entry.target.classList.add('visible'), 350);
          frameObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    photoFrames.forEach(frame => frameObs.observe(frame));
  }


  /* ── 3. INITIATIVE NUMBER PARALLAX TINT ──────────────────────────
     On scroll, the large ghost .ci-init-num values slowly drift
     upward for a subtle depth effect.
  ──────────────────────────────────────────────────────────────────*/
  const initNums = document.querySelectorAll('.ci-init-num');

  function onScroll() {
    const scrollY = window.scrollY;
    initNums.forEach(num => {
      const parent   = num.closest('.ci-initiative-header');
      if (!parent) return;
      const rect     = parent.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const offset   = (window.innerHeight / 2 - midpoint) * 0.06;
      num.style.transform = `translateY(${offset}px)`;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });


  /* ── Cursor hover targets for this page ──────────────────────────*/
  const extraTargets = document.querySelectorAll(
    '.ci-info-card, .ci-photo-frame, .ci-c-stat'
  );
  const cursor = document.getElementById('cursor');
  if (cursor) {
    extraTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });
  }

});

/**
 * ============================================================
 *  WORK EXPERIENCE BUTTON CARDS
 *  exp-buttons.js  |  v1.0
 *
 *  Handles all interactivity for the three experience cards
 *  (.expb-card) in the Work Experience section.
 *
 *  MODULES
 *  ───────
 *  1.  Scroll reveal       — fades each card in on scroll
 *  2.  Staggered entrance  — 120 ms delay between cards
 *  3.  Keyboard navigation — Enter / Space fires the link
 *  4.  Custom cursor sync  — enlarges site cursor on hover
 * ============================================================
 */

(function () {
  'use strict';

  /* Run after DOM is ready ---------------------------------- */
  document.addEventListener('DOMContentLoaded', init);

  function init() {

    const cards  = document.querySelectorAll('.expb-card');
    const cursor = document.getElementById('cursor'); // site-wide cursor

    if (!cards.length) return;

    /* ── 1 & 2. SCROLL REVEAL WITH STAGGER ──────────────────
       Sets each card's initial state (invisible, shifted down)
       then fires a staggered fade-in as they enter the viewport.
    ────────────────────────────────────────────────────────── */
    cards.forEach((card, index) => {
      card.style.opacity    = '0';
      card.style.transform  = 'translateY(28px)';
      card.style.transition =
        `opacity 0.65s ease ${index * 120}ms,
         transform 0.65s ease ${index * 120}ms`;
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity   = '1';
            entry.target.style.transform = 'translateY(0)';
            revealObserver.unobserve(entry.target); // fire once only
          }
        });
      },
      { threshold: 0.12 }
    );

    cards.forEach((card) => revealObserver.observe(card));


    /* ── 3. KEYBOARD NAVIGATION ──────────────────────────────
       Makes each card fully keyboard-accessible:
       - Tab       → focuses the card (outline shown)
       - Enter / Space → navigates to href
    ────────────────────────────────────────────────────────── */
    cards.forEach((card) => {
      /* Ensure the <a> is reachable via Tab */
      if (!card.getAttribute('tabindex')) {
        card.setAttribute('tabindex', '0');
      }

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
    });


    /* ── 4. CUSTOM CURSOR SYNC ───────────────────────────────
       When the site uses a custom cursor element (#cursor),
       enlarge it on card hover to match the rest of the site.
    ────────────────────────────────────────────────────────── */
    if (cursor) {
      cards.forEach((card) => {
        card.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        card.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
      });
    }

  } /* end init */

})();