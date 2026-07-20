(() => {
  const header = document.querySelector('[data-header]');
  const setHeaderState = () => header && header.classList.toggle('is-scrolled', window.scrollY > 16);
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  // Mobile menu
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const closeMenu = () => {
    if (!menuToggle || !menu) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    menu.classList.remove('is-open');
    header && header.classList.remove('menu-visible');
    document.body.classList.remove('menu-open');
  };
  menuToggle && menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu && menu.classList.toggle('is-open', open);
    header && header.classList.toggle('menu-visible', open);
    document.body.classList.toggle('menu-open', open);
  });
  menu && menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  // Level 1 — category accordion (multiple may stay open, independent toggle)
  document.querySelectorAll('.faq-cat-head').forEach((head) => {
    head.addEventListener('click', () => {
      const cat = head.closest('.faq-cat');
      const open = !cat.classList.contains('is-open');
      cat.classList.toggle('is-open', open);
      head.setAttribute('aria-expanded', String(open));
    });
  });

  // Level 2 — question accordion (one open at a time within its category)
  document.querySelectorAll('.faq-item').forEach((item) => {
    const question = item.querySelector('.faq-question');
    question && question.addEventListener('click', () => {
      const shouldOpen = !item.classList.contains('is-open');
      const list = item.closest('.faq-list');
      list.querySelectorAll('.faq-item').forEach((other) => {
        const open = other === item && shouldOpen;
        other.classList.toggle('is-open', open);
        const q = other.querySelector('.faq-question');
        const a = other.querySelector('.faq-answer');
        q && q.setAttribute('aria-expanded', String(open));
        a && a.setAttribute('aria-hidden', String(!open));
      });
    });
  });

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
