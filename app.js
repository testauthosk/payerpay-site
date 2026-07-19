(() => {
  const header = document.querySelector('[data-header]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const menu = document.querySelector('[data-menu]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const setHeaderState = () => header?.classList.toggle('is-scrolled', window.scrollY > 16);
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  const closeMenu = () => {
    if (!menuToggle || !menu) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open menu');
    menu.classList.remove('is-open');
    header?.classList.remove('menu-visible');
    document.body.classList.remove('menu-open');
  };

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu?.classList.toggle('is-open', open);
    header?.classList.toggle('menu-visible', open);
    document.body.classList.toggle('menu-open', open);
  });

  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 760) closeMenu();
  });

  const revealElements = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -45px' });
    revealElements.forEach((element) => revealObserver.observe(element));
  }

  const regionData = {
    usd: {
      kicker: 'United States · USD',
      title: 'Get personal USD account details',
      text: 'Receive eligible salary and personal transfers using account details issued in your name.',
      list: ['Receive through ACH or Fedwire', 'Details issued in your name', 'Send onward in local currency'],
      previewName: 'Personal USD details',
      balance: '$8,420.00',
      detailLabel: 'Routing number',
      flag: '#flag-us'
    },
    eur: {
      kicker: 'European Union · EUR',
      title: 'Get personal EUR account details',
      text: 'Receive eligible salary and personal transfers using EUR account details issued in your name.',
      list: ['Receive through SEPA', 'Details issued in your name', 'Send onward in local currency'],
      previewName: 'Personal EUR details',
      balance: '€7,860.00',
      detailLabel: 'IBAN',
      flag: '#flag-eu'
    }
  };

  const tabs = [...document.querySelectorAll('[data-region]')];
  const panel = document.querySelector('#region-panel');
  const regionSwitch = document.querySelector('[data-region-switch]');
  let activeRegion = 'usd';
  let switchTimer;
  const renderRegion = (key) => {
    const data = regionData[key];
    if (!data || !panel) return;
    const direction = key === 'eur' ? 'forward' : 'backward';
    panel.classList.remove('is-changing');
    panel.dataset.direction = direction;
    void panel.offsetWidth;
    panel.classList.add('is-changing');
    regionSwitch.dataset.active = key;
    regionSwitch.classList.remove('is-switching');
    void regionSwitch.offsetWidth;
    regionSwitch.classList.add('is-switching');
    window.clearTimeout(switchTimer);
    switchTimer = window.setTimeout(() => regionSwitch.classList.remove('is-switching'), 700);
    panel.querySelector('[data-panel-kicker]').textContent = data.kicker;
    panel.querySelector('[data-panel-flag] use').setAttribute('href', data.flag);
    panel.querySelector('[data-panel-title]').textContent = data.title;
    panel.querySelector('[data-panel-text]').textContent = data.text;
    panel.querySelector('[data-panel-list]').innerHTML = data.list.map((item) => `<li><span aria-hidden="true">✓</span> ${item}</li>`).join('');
    panel.querySelector('[data-preview-name]').textContent = data.previewName;
    panel.querySelector('[data-preview-balance]').textContent = data.balance;
    panel.querySelector('[data-detail-label]').textContent = data.detailLabel;
    panel.setAttribute('aria-labelledby', `tab-${key}`);
    activeRegion = key;
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      if (tab.dataset.region === activeRegion) return;
      tabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
        item.tabIndex = active ? 0 : -1;
      });
      renderRegion(tab.dataset.region);
    });
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + direction + tabs.length) % tabs.length;
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    });
  });

  const searchInput = document.querySelector('#destination-search');
  const destinationList = document.querySelector('[data-destination-list]');
  const destinations = [...document.querySelectorAll('[data-keywords]')];
  const emptyState = document.querySelector('[data-empty]');
  const showMore = document.querySelector('[data-show-more]');

  const filterDestinations = () => {
    if (!searchInput || !destinationList || !emptyState || !showMore) return;
    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;

    destinations.forEach((destination) => {
      const matches = !query || destination.dataset.keywords.includes(query);
      const allowed = Boolean(query) || destinationList.classList.contains('is-expanded') || destination.classList.contains('is-featured');
      const show = matches && allowed;
      destination.hidden = !show;
      if (show) visible += 1;
    });

    emptyState.classList.toggle('is-visible', visible === 0);
    showMore.hidden = Boolean(query);
  };

  searchInput?.addEventListener('input', filterDestinations);
  document.querySelectorAll('[data-search]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!searchInput) return;
      searchInput.value = button.dataset.search;
      filterDestinations();
      searchInput.focus({ preventScroll: true });
    });
  });

  showMore?.addEventListener('click', () => {
    if (!destinationList) return;
    const expanded = !destinationList.classList.contains('is-expanded');
    destinationList.classList.toggle('is-expanded', expanded);
    showMore.setAttribute('aria-expanded', String(expanded));
    showMore.innerHTML = `${expanded ? 'Show fewer destinations' : 'View all destinations'} <span aria-hidden="true">↓</span>`;
    filterDestinations();
  });

  const faqItems = [...document.querySelectorAll('.faq-item')];
  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');
    question?.addEventListener('click', () => {
      const shouldOpen = !item.classList.contains('is-open');
      faqItems.forEach((otherItem) => {
        const open = otherItem === item && shouldOpen;
        otherItem.classList.toggle('is-open', open);
        otherItem.querySelector('.faq-question')?.setAttribute('aria-expanded', String(open));
        otherItem.querySelector('.faq-answer')?.setAttribute('aria-hidden', String(!open));
      });
    });
  });

  // Reusable country list (search + expand/collapse), scoped to its own hooks.
  const initCountryList = (opts) => {
    const search = document.querySelector(opts.search);
    const list = document.querySelector(opts.list);
    const empty = document.querySelector(opts.empty);
    const more = document.querySelector(opts.more);
    const rows = [...document.querySelectorAll(opts.rows)];
    if (!search || !list || !empty || !more) return;

    const filter = () => {
      const query = search.value.trim().toLowerCase();
      let visible = 0;
      rows.forEach((row) => {
        const matches = !query || (row.dataset[opts.dataKey] || '').includes(query);
        const allowed = Boolean(query) || list.classList.contains('is-expanded') || row.classList.contains('is-featured');
        const show = matches && allowed;
        row.hidden = !show;
        if (show) visible += 1;
      });
      empty.classList.toggle('is-visible', visible === 0);
      more.hidden = Boolean(query);
    };

    search.addEventListener('input', filter);
    document.querySelectorAll(opts.quick).forEach((button) => {
      button.addEventListener('click', () => {
        search.value = button.dataset[opts.quickKey];
        filter();
        search.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      });
    });
    more.addEventListener('click', () => {
      const expanded = !list.classList.contains('is-expanded');
      list.classList.toggle('is-expanded', expanded);
      more.setAttribute('aria-expanded', String(expanded));
      more.innerHTML = `${expanded ? opts.lessLabel : opts.moreLabel} <span aria-hidden="true">↓</span>`;
      filter();
    });
    filter();
  };

  initCountryList({
    search: '#eu-search',
    list: '[data-eu-list]',
    empty: '[data-eu-empty]',
    more: '[data-eu-more]',
    rows: '[data-eu-keywords]',
    dataKey: 'euKeywords',
    quick: '[data-eu-quick]',
    quickKey: 'euQuick',
    moreLabel: 'View all countries',
    lessLabel: 'Show fewer countries',
  });

  document.querySelector('[data-year]').textContent = new Date().getFullYear();
  filterDestinations();
})();
