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

  menuToggle?.addEventListener('click', () => {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });
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

  const revealItems = $$('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const regionData = {
    usd: {
      flag: '#flag-us',
      kicker: 'United States · USD',
      title: 'Get personal USD account details',
      text: 'Receive eligible salary and personal transfers using account details issued in your name.',
      list: ['Receive through ACH or Fedwire', 'Details issued in your name', 'Send onward in local currency'],
      previewName: 'Personal USD details',
      balance: '$8,420.00',
      detailLabel: 'Routing number'
    },
    eur: {
      flag: '#flag-eu',
      kicker: 'European Union · EUR',
      title: 'Get personal EUR account details',
      text: 'Receive eligible euro transfers using personal details issued after verification.',
      list: ['Receive through SEPA or SEPA Instant', 'Personal IBAN and BIC details', 'Send onward in local currency'],
      previewName: 'Personal EUR details',
      balance: '€6,780.00',
      detailLabel: 'IBAN'
    }
  };

  const regionSwitch = $('[data-region-switch]');
  const regionPanel = $('#region-panel');
  const regionTabs = $$('[data-region]', regionSwitch || document);

  const selectRegion = (region) => {
    const data = regionData[region];
    if (!data || !regionSwitch || !regionPanel) return;
    const previous = regionSwitch.dataset.active || 'usd';
    regionSwitch.dataset.active = region;
    regionSwitch.classList.remove('is-switching');
    void regionSwitch.offsetWidth;
    regionSwitch.classList.add('is-switching');
    regionPanel.dataset.direction = previous === 'usd' && region === 'eur' ? 'forward' : 'backward';
    regionPanel.classList.remove('is-changing');
    void regionPanel.offsetWidth;
    regionPanel.classList.add('is-changing');

    regionTabs.forEach((tab) => {
      const active = tab.dataset.region === region;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active) regionPanel.setAttribute('aria-labelledby', tab.id);
    });

    $('[data-panel-kicker]')?.replaceChildren(data.kicker);
    $('[data-panel-title]')?.replaceChildren(data.title);
    $('[data-panel-text]')?.replaceChildren(data.text);
    $('[data-preview-name]')?.replaceChildren(data.previewName);
    $('[data-preview-balance]')?.replaceChildren(data.balance);
    $('[data-detail-label]')?.replaceChildren(data.detailLabel);
    const flagUse = $('[data-panel-flag] use');
    flagUse?.setAttribute('href', data.flag);
    const panelList = $('[data-panel-list]');
    if (panelList) {
      panelList.replaceChildren(...data.list.map((text) => {
        const item = document.createElement('li');
        const mark = document.createElement('span');
        mark.setAttribute('aria-hidden', 'true');
        mark.textContent = '✓';
        item.append(mark, document.createTextNode(` ${text}`));
        return item;
      }));
    }
    window.setTimeout(() => {
      regionSwitch.classList.remove('is-switching');
      regionPanel.classList.remove('is-changing');
    }, 520);
  };

  regionTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectRegion(tab.dataset.region));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let targetIndex = index;
      if (event.key === 'ArrowRight') targetIndex = (index + 1) % regionTabs.length;
      if (event.key === 'ArrowLeft') targetIndex = (index - 1 + regionTabs.length) % regionTabs.length;
      if (event.key === 'Home') targetIndex = 0;
      if (event.key === 'End') targetIndex = regionTabs.length - 1;
      regionTabs[targetIndex].focus();
      selectRegion(regionTabs[targetIndex].dataset.region);
    });
  });

  const setupDirectory = ({ inputSelector, listSelector, rowSelector, keywordsAttribute, quickSelector, moreSelector, emptySelector, moreText }) => {
    const input = $(inputSelector);
    const list = $(listSelector);
    const more = $(moreSelector);
    const empty = $(emptySelector);
    if (!input || !list) return null;
    const rows = $$(rowSelector, list);
    let expanded = false;

    const apply = () => {
      const query = input.value.trim().toLowerCase();
      let matches = 0;
      list.classList.toggle('is-expanded', expanded || Boolean(query));
      rows.forEach((row) => {
        const keywords = (row.getAttribute(keywordsAttribute) || row.textContent || '').toLowerCase();
        const matchesQuery = !query || keywords.includes(query);
        const allowedByCollapse = expanded || Boolean(query) || row.classList.contains('is-featured');
        const visible = matchesQuery && allowedByCollapse;
        row.hidden = !visible;
        if (visible) matches += 1;
      });
      if (more) {
        more.hidden = Boolean(query);
        more.setAttribute('aria-expanded', String(expanded));
        more.firstChild.textContent = expanded ? 'Show fewer ' : moreText;
      }
      empty?.classList.toggle('is-visible', matches === 0);
    };

    input.addEventListener('input', apply);
    $$(quickSelector).forEach((button) => {
      button.addEventListener('click', () => {
        input.value = button.dataset.search || button.dataset.euQuick || '';
        apply();
        input.focus({ preventScroll: true });
      });
    });
    more?.addEventListener('click', () => {
      expanded = !expanded;
      apply();
    });
    apply();
    return { input, apply };
  };

  const mainDirectory = setupDirectory({
    inputSelector: '#destination-search',
    listSelector: '[data-destination-list]',
    rowSelector: '.destination-row',
    keywordsAttribute: 'data-keywords',
    quickSelector: '[data-search]',
    moreSelector: '[data-show-more]',
    emptySelector: '[data-empty]',
    moreText: 'View all destinations '
  });

  setupDirectory({
    inputSelector: '#eu-search',
    listSelector: '[data-eu-list]',
    rowSelector: '.destination-row',
    keywordsAttribute: 'data-eu-keywords',
    quickSelector: '[data-eu-quick]',
    moreSelector: '[data-eu-more]',
    emptySelector: '[data-eu-empty]',
    moreText: 'View all countries '
  });

  $$('[data-hero-search]').forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!mainDirectory) return;
      event.preventDefault();
      mainDirectory.input.value = link.dataset.heroSearch || '';
      mainDirectory.apply();
      $('#destinations')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  $$('.faq-question').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const answer = button.getAttribute('aria-controls') ? document.getElementById(button.getAttribute('aria-controls')) : null;
      const open = button.getAttribute('aria-expanded') !== 'true';
      item?.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      answer?.setAttribute('aria-hidden', String(!open));
    });
  });
})();
