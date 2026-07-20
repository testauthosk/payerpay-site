/* Reusable custom select — smooth expanding dropdown. Markup: [data-cselect] with
   [data-cselect-trigger], [data-cselect-value], [data-cselect-panel], [data-cselect-input], .c-select-option[data-value]. */
(() => {
  'use strict';
  const all = () => Array.from(document.querySelectorAll('[data-cselect]'));

  const setOpen = (root, open) => {
    root.classList.toggle('is-open', open);
    const trg = root.querySelector('[data-cselect-trigger]');
    if (trg) trg.setAttribute('aria-expanded', String(open));
    // Keep the panel clipped during the max-height animation (avoids a scrollbar flashing
    // while the content briefly exceeds the growing max-height); enable scroll once open.
    const panel = root.querySelector('[data-cselect-panel]');
    if (panel) {
      panel.style.overflowY = 'hidden';
      if (open) {
        const onEnd = (e) => {
          if (e.target === panel && e.propertyName === 'max-height') {
            panel.style.overflowY = 'auto';
            panel.removeEventListener('transitionend', onEnd);
          }
        };
        panel.addEventListener('transitionend', onEnd);
      }
    }
    if (!open) root.querySelectorAll('.c-select-option.is-active').forEach((o) => o.classList.remove('is-active'));
  };
  const closeAll = (except) => all().forEach((r) => { if (r !== except) setOpen(r, false); });

  all().forEach((root) => {
    const trigger = root.querySelector('[data-cselect-trigger]');
    const valueEl = root.querySelector('[data-cselect-value]');
    const panel = root.querySelector('[data-cselect-panel]');
    const input = root.querySelector('[data-cselect-input]');
    const options = Array.from(root.querySelectorAll('.c-select-option'));
    if (!trigger || !valueEl || !panel || !input) return;

    const select = (opt) => {
      valueEl.textContent = opt.textContent.trim();
      valueEl.classList.remove('is-placeholder');
      input.value = opt.dataset.value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      options.forEach((o) => o.classList.toggle('is-selected', o === opt));
      setOpen(root, false);
      trigger.focus();
    };
    const active = () => root.querySelector('.c-select-option.is-active');
    const move = (dir) => {
      const cur = active();
      let idx = cur ? options.indexOf(cur) : (dir > 0 ? -1 : 0);
      idx = (idx + dir + options.length) % options.length;
      options.forEach((o) => o.classList.remove('is-active'));
      options[idx].classList.add('is-active');
      options[idx].scrollIntoView({ block: 'nearest' });
    };

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !root.classList.contains('is-open');
      closeAll(root);
      setOpen(root, willOpen);
    });
    options.forEach((opt) => {
      opt.addEventListener('click', (e) => { e.stopPropagation(); select(opt); });
      opt.addEventListener('mousemove', () => { options.forEach((o) => o.classList.remove('is-active')); opt.classList.add('is-active'); });
    });
    trigger.addEventListener('keydown', (e) => {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        if (!root.classList.contains('is-open')) { closeAll(root); setOpen(root, true); move(e.key === 'ArrowUp' ? -1 : 1); }
        else if (e.key === 'ArrowDown') move(1);
        else if (e.key === 'ArrowUp') move(-1);
        else if (active()) select(active());
      }
    });
    root.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && root.classList.contains('is-open')) { setOpen(root, false); trigger.focus(); }
    });
  });

  document.addEventListener('click', () => closeAll(null));
})();
