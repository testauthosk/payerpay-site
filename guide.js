(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  // --- Header + mobile menu (same behaviour as the rest of the site) ---
  const header = $('[data-header]');
  const menu = $('[data-menu]');
  const menuToggle = $('[data-menu-toggle]');
  const navScrim = $('[data-nav-scrim]');
  const setMenuOpen = (open) => {
    if (!menu || !menuToggle) return;
    menu.classList.toggle('is-open', open);
    header?.classList.toggle('menu-visible', open);
    document.body.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    navScrim?.setAttribute('aria-hidden', String(!open));
  };
  menuToggle?.addEventListener('click', () => setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true'));
  navScrim?.addEventListener('click', () => setMenuOpen(false));
  menu?.addEventListener('click', (event) => { if (event.target.closest('a')) setMenuOpen(false); });
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenuOpen(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 760) setMenuOpen(false); });

  const syncHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });
  $$('[data-year]').forEach((node) => { node.textContent = String(new Date().getFullYear()); });

  // --- Chapter navigation (one chapter shown at a time) ---
  const guideNav = $('[data-guide-nav]');
  const chapters = $$('[data-guide-chapter]');
  const links = $$('[data-guide-link]');
  const navLinks = $$('.guide-nav-link');
  const navToggle = $('[data-guide-nav-toggle]');
  const navCurrent = $('[data-guide-nav-current]');
  const section = $('.guide-section');
  if (!chapters.length) return;

  // Gliding active indicator in the chapter nav
  const navList = $('.guide-nav-list');
  const marker = document.createElement('span');
  marker.className = 'guide-nav-marker';
  navList?.appendChild(marker);
  const moveMarker = (link, animate) => {
    if (!link || !navList) return;
    if (animate === false) marker.style.transition = 'none';
    marker.style.opacity = '1';
    marker.style.top = link.offsetTop + 'px';
    marker.style.left = link.offsetLeft + 'px';
    marker.style.width = link.offsetWidth + 'px';
    marker.style.height = link.offsetHeight + 'px';
    if (animate === false) { void marker.offsetWidth; marker.style.transition = ''; }
  };

  const headerGap = () => (header?.offsetHeight || 72) + 12;
  const gcontent = $('.guide-content');

  // Gentle eased scroll (smoother than native "smooth").
  let scrollRAF = null;
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const smoothScrollTo = (targetY) => {
    if (scrollRAF) cancelAnimationFrame(scrollRAF);
    const startY = window.scrollY;
    const dist = targetY - startY;
    if (Math.abs(dist) < 2) return;
    const duration = Math.min(720, Math.max(340, Math.abs(dist) * 0.6));
    let startT = null;
    const step = (ts) => {
      if (startT === null) startT = ts;
      const p = Math.min(1, (ts - startT) / duration);
      window.scrollTo(0, startY + dist * easeInOutCubic(p));
      if (p < 1) scrollRAF = requestAnimationFrame(step);
    };
    scrollRAF = requestAnimationFrame(step);
  };

  // Animate the content-area height between chapters so the footer glides, not snaps.
  let heightCleanup = null;
  const animateContentHeight = (mutate) => {
    if (!gcontent) { mutate(); return; }
    if (heightCleanup) heightCleanup();
    const oldH = gcontent.offsetHeight;
    mutate();
    const newH = gcontent.offsetHeight;
    if (Math.abs(newH - oldH) < 4) return;
    gcontent.style.height = oldH + 'px';
    gcontent.style.overflow = 'hidden';
    void gcontent.offsetHeight;
    gcontent.style.transition = 'height .44s cubic-bezier(.4, 0, .2, 1)';
    gcontent.style.height = newH + 'px';
    const cleanup = () => {
      gcontent.style.height = ''; gcontent.style.overflow = ''; gcontent.style.transition = '';
      gcontent.removeEventListener('transitionend', onEnd);
      heightCleanup = null;
    };
    const onEnd = (e) => { if (e.propertyName === 'height') cleanup(); };
    gcontent.addEventListener('transitionend', onEnd);
    heightCleanup = cleanup;
    window.setTimeout(() => { if (heightCleanup) cleanup(); }, 620);
  };

  const titleOf = (id) => {
    const link = navLinks.find((l) => l.dataset.target === id);
    return link ? (link.querySelector('.guide-nav-text').textContent || '').trim() : '';
  };

  const activate = (id, opts) => {
    opts = opts || {};
    if (!document.getElementById(id)) return;
    const swap = () => chapters.forEach((c) => c.classList.toggle('is-active', c.id === id));
    if (opts.instant) swap(); else animateContentHeight(swap);
    navLinks.forEach((l) => {
      const on = l.dataset.target === id;
      l.classList.toggle('is-active', on);
      l.setAttribute('aria-current', on ? 'true' : 'false');
    });
    moveMarker(navLinks.find((l) => l.dataset.target === id), opts.instant ? false : true);
    if (navCurrent) navCurrent.textContent = titleOf(id);
    if (guideNav) { guideNav.classList.remove('is-open'); navToggle?.setAttribute('aria-expanded', 'false'); }
    if (opts.push !== false && history.replaceState) history.replaceState(null, '', '#' + id);
    if (opts.scroll !== false && section) {
      smoothScrollTo(section.getBoundingClientRect().top + window.scrollY - headerGap());
    }
  };

  links.forEach((l) => l.addEventListener('click', () => { const id = l.dataset.target; if (id) activate(id); }));

  if (navToggle && guideNav) {
    navToggle.addEventListener('click', () => {
      const open = !guideNav.classList.contains('is-open');
      guideNav.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      if (open) requestAnimationFrame(() => moveMarker(navLinks.find((l) => l.classList.contains('is-active')), false));
    });
  }
  window.addEventListener('resize', () => moveMarker(navLinks.find((l) => l.classList.contains('is-active')), false));

  const search = $('[data-guide-search]');
  if (search) search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    let visible = 0;
    navLinks.forEach((l) => {
      const hay = ((l.dataset.keywords || '') + ' ' + (l.textContent || '')).toLowerCase();
      const show = !q || hay.includes(q);
      const li = l.closest('li');
      if (li) li.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    if (guideNav) guideNav.classList.toggle('is-empty', visible === 0);
  });

  window.addEventListener('hashchange', () => {
    const id = (window.location.hash || '').replace('#', '');
    if (chapters.some((c) => c.id === id)) activate(id, { push: false });
  });

  const initial = (window.location.hash || '').replace('#', '');
  const first = chapters.some((c) => c.id === initial) ? initial : chapters[0].id;
  activate(first, { scroll: false, push: false, instant: true });
  requestAnimationFrame(() => moveMarker(navLinks.find((l) => l.classList.contains('is-active')), false));
})();
