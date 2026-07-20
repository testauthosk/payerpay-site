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

  $$('[data-faq-cat]').forEach((category) => {
    const button = $('.faq-cat-head', category);
    const body = button?.getAttribute('aria-controls') ? document.getElementById(button.getAttribute('aria-controls')) : null;
    body?.setAttribute('aria-hidden', 'true');
    button?.addEventListener('click', () => {
      const open = button.getAttribute('aria-expanded') !== 'true';
      category.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      body?.setAttribute('aria-hidden', String(!open));
    });
  });

  $$('.faq-question').forEach((button) => {
    const answer = button.getAttribute('aria-controls') ? document.getElementById(button.getAttribute('aria-controls')) : null;
    answer?.setAttribute('aria-hidden', 'true');
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const open = button.getAttribute('aria-expanded') !== 'true';
      item?.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      answer?.setAttribute('aria-hidden', String(!open));
    });
  });

  const hashTarget = window.location.hash ? document.querySelector(window.location.hash) : null;
  if (hashTarget) {
    const category = hashTarget.closest('[data-faq-cat]');
    const categoryButton = category ? $('.faq-cat-head', category) : null;
    category?.classList.add('is-open');
    categoryButton?.setAttribute('aria-expanded', 'true');
    if (hashTarget.classList.contains('faq-question')) hashTarget.click();
  }
})();
