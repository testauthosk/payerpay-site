(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
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
  menu?.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false);
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) setMenuOpen(false);
  });

  const syncHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });
  $$('[data-year]').forEach((node) => { node.textContent = String(new Date().getFullYear()); });

  // ---- Category accordion (single-open: opening one closes the others) ----
  const cats = $$('[data-faq-cat]');
  const catBody = (category) => {
    const btn = $('.faq-cat-head', category);
    return btn?.getAttribute('aria-controls') ? document.getElementById(btn.getAttribute('aria-controls')) : null;
  };
  const setCatOpen = (category, open) => {
    $('.faq-cat-head', category)?.setAttribute('aria-expanded', String(open));
    category.classList.toggle('is-open', open);
    catBody(category)?.setAttribute('aria-hidden', String(!open));
  };
  const openCatSolo = (category) => {
    cats.forEach((c) => { if (c !== category) setCatOpen(c, false); });
    setCatOpen(category, true);
  };
  const catsPanel = $('.faq-page-cats');
  const headerGap = () => (header?.offsetHeight || 72) + 14;

  // A bottom spacer keeps the page tall enough during a jump so that collapsing
  // categories can't shrink the page below the scroll position and clamp it (the
  // "everything flies to the top" jerk). Released — gliding — once the scroll settles,
  // below the fold, so the footer eases up instead of snapping.
  let spacer = null;
  const setReserve = (px) => {
    if (!spacer) {
      spacer = document.createElement('div');
      spacer.setAttribute('aria-hidden', 'true');
      spacer.style.cssText = 'height:0px;flex:none;pointer-events:none';
      (document.querySelector('main') || document.body).appendChild(spacer);
    }
    spacer.style.transition = 'none';
    spacer.style.height = px + 'px';
    void spacer.offsetHeight;
  };
  const releaseReserve = () => {
    if (!spacer) return;
    spacer.style.transition = 'height .42s cubic-bezier(.4, 0, .2, 1)';
    spacer.style.height = '0px';
  };

  // Gentle eased scroll (smoother than the browser's native "smooth", which flies).
  let scrollRAF = null;
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const smoothScrollTo = (targetY, done) => {
    if (scrollRAF) cancelAnimationFrame(scrollRAF);
    const startY = window.scrollY;
    const dist = targetY - startY;
    if (Math.abs(dist) < 2) { if (done) done(); return; }
    // The site sets html { scroll-behavior: smooth } globally, which would turn every
    // per-frame scrollTo below into its own native animation (they fight → freeze/snap).
    // Force instant scrolling for the duration of our own eased animation.
    const root = document.documentElement;
    root.style.scrollBehavior = 'auto';
    const duration = Math.min(720, Math.max(360, Math.abs(dist) * 0.6));
    let startT = null;
    const step = (ts) => {
      if (startT === null) startT = ts;
      const p = Math.min(1, (ts - startT) / duration);
      window.scrollTo(0, startY + dist * easeInOutCubic(p));
      if (p < 1) scrollRAF = requestAnimationFrame(step);
      else { root.style.scrollBehavior = ''; if (done) done(); }
    };
    scrollRAF = requestAnimationFrame(step);
  };

  // Open a topic and glide its header to the top. Others close instantly (accurate
  // target); the target opens ANIMATED (soft expand). The reserve stops the collapse
  // from clamping the scroll, so the page glides instead of jumping.
  const jumpToCat = (category) => {
    // Reserve a generous buffer FIRST (before collapsing) so the shrink can't clamp the
    // scroll to the top. Released — gliding, below the fold — once the scroll settles.
    setReserve(Math.round(window.innerHeight * 2.2));
    catsPanel?.classList.add('is-instant');
    cats.forEach((c) => { if (c !== category) setCatOpen(c, false); });
    void (catsPanel && catsPanel.offsetHeight); // reflow with the others already closed
    catsPanel?.classList.remove('is-instant');
    setCatOpen(category, true); // soft animated expand
    const targetY = category.getBoundingClientRect().top + window.scrollY - headerGap();
    smoothScrollTo(targetY, releaseReserve);
  };

  cats.forEach((category) => {
    const button = $('.faq-cat-head', category);
    catBody(category)?.setAttribute('aria-hidden', 'true');
    button?.addEventListener('click', () => {
      if (button.getAttribute('aria-expanded') === 'true') setCatOpen(category, false);
      else openCatSolo(category);
    });
  });

  // ---- Individual questions ----
  const setItemOpen = (item, open) => {
    const button = $('.faq-question', item);
    const answer = button?.getAttribute('aria-controls') ? document.getElementById(button.getAttribute('aria-controls')) : null;
    item.classList.toggle('is-open', open);
    button?.setAttribute('aria-expanded', String(open));
    answer?.setAttribute('aria-hidden', String(!open));
  };
  const allItems = $$('.faq-item');
  allItems.forEach((item) => {
    setItemOpen(item, false);
    $('.faq-question', item)?.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      if (willOpen) allItems.forEach((other) => { if (other !== item) setItemOpen(other, false); });
      setItemOpen(item, willOpen);
    });
  });

  // ---- Intelligent search across all questions + answers ----
  let clearSearch = () => {};
  const searchInput = $('[data-faq-search]');
  const searchStatus = $('[data-faq-status]');
  const catsWrap = $('.faq-page-cats');
  const items = $$('.faq-item');
  items.forEach((it) => { it._text = (it.textContent || '').toLowerCase().replace(/\s+/g, ' '); });

  if (searchInput) {
    let timer;
    const runSearch = () => {
      const raw = searchInput.value.trim();
      const words = raw.toLowerCase().split(/\s+/).filter(Boolean);
      catsWrap?.classList.toggle('is-searching', words.length > 0);

      if (!words.length) {
        cats.forEach((c) => { c.hidden = false; setCatOpen(c, false); });
        items.forEach((it) => { it.hidden = false; setItemOpen(it, false); });
        if (searchStatus) { searchStatus.hidden = true; searchStatus.textContent = ''; }
        return;
      }

      let total = 0;
      cats.forEach((category) => {
        let hits = 0;
        $$('.faq-item', category).forEach((it) => {
          const match = words.every((w) => it._text.includes(w));
          it.hidden = !match;
          setItemOpen(it, false); // list matches collapsed — the user expands what they need
          if (match) hits++;
        });
        category.hidden = hits === 0;
        total += hits;
      });

      if (searchStatus) {
        searchStatus.hidden = false;
        searchStatus.textContent = total
          ? `${total} result${total === 1 ? '' : 's'} for “${raw}”`
          : `Nothing found for “${raw}” — try another word.`;
      }
    };
    searchInput.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(runSearch, 140); });
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { searchInput.value = ''; runSearch(); searchInput.blur(); }
    });
    clearSearch = () => { if (searchInput.value) { searchInput.value = ''; runSearch(); } };
  }

  // ---- Sticky topic index — numbered nav with a gliding active indicator ----
  const indexNav = $('[data-faq-index]');
  if (indexNav) {
    const marker = document.createElement('span');
    marker.className = 'faq-index-marker';
    indexNav.appendChild(marker);
    const links = [];
    let activeLink = null;
    const moveMarker = (link, animate) => {
      if (!link) return;
      if (animate === false) marker.style.transition = 'none';
      marker.style.opacity = '1';
      marker.style.top = link.offsetTop + 'px';
      marker.style.left = link.offsetLeft + 'px';
      marker.style.width = link.offsetWidth + 'px';
      marker.style.height = link.offsetHeight + 'px';
      if (animate === false) { void marker.offsetWidth; marker.style.transition = ''; }
    };
    const setActive = (link) => {
      activeLink = link;
      links.forEach((l) => l.classList.toggle('is-active', l === link));
      moveMarker(link);
    };
    cats.forEach((category, i) => {
      const title = ($('.faq-cat-title', category)?.textContent || '').trim();
      const link = document.createElement('a');
      link.className = 'faq-index-link';
      link.href = '#';
      link.innerHTML = `<span class="faq-index-num">${i + 1}</span><span class="faq-index-text">${title}</span>`;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        clearSearch();
        jumpToCat(category);
        setActive(link);
      });
      indexNav.appendChild(link);
      category._indexLink = link;
      links.push(link);
    });
    if (links[0]) {
      links[0].classList.add('is-active');
      activeLink = links[0];
      requestAnimationFrame(() => moveMarker(links[0], false));
    }
    // The indicator moves only on click — no scroll-driven movement.
    window.addEventListener('resize', () => moveMarker(activeLink, false));
  }

  // ---- "First steps" cards jump into the matching category ----
  $$('[data-faq-jump]').forEach((el) => {
    const jump = () => {
      const category = cats[parseInt(el.getAttribute('data-faq-jump'), 10) - 1];
      if (!category) return;
      clearSearch();
      openCatSolo(category);
      scrollToCat(category);
    };
    el.addEventListener('click', (event) => { event.preventDefault(); jump(); });
    el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); jump(); }
    });
  });

  // ---- Deep-link support (#faq-cat-N / #faq-q-...) ----
  const hashTarget = window.location.hash ? document.querySelector(window.location.hash) : null;
  if (hashTarget) {
    const category = hashTarget.closest('[data-faq-cat]');
    if (category) openCatSolo(category);
    if (hashTarget.classList.contains('faq-question')) {
      setItemOpen(hashTarget.closest('.faq-item'), true);
    }
  }
})();
