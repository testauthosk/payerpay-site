/* PayerPay landing pages — attribution, analytics (lp_*), FAQ accordion. */
(function () {
  'use strict';
  var body = document.body;
  var slug = body.getAttribute('data-lp-slug') || '';
  var pageType = body.getAttribute('data-lp-type') || '';
  var country = body.getAttribute('data-lp-country') || '';

  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'];
  var STORE = 'pp_attr';

  // ---- attribution: capture on first landing, persist, carry to /register ----
  function readStored() {
    try { return JSON.parse(sessionStorage.getItem(STORE) || '{}'); } catch (e) { return {}; }
  }
  function captureAttribution() {
    var params = new URLSearchParams(location.search);
    var stored = readStored();
    var changed = false;
    UTM_KEYS.forEach(function (k) {
      var v = params.get(k);
      if (v && !stored[k]) { stored[k] = v; changed = true; } // first-touch
    });
    if (changed) { try { sessionStorage.setItem(STORE, JSON.stringify(stored)); } catch (e) {} }
    return stored;
  }
  function attrQuery(attr) {
    var qs = new URLSearchParams();
    UTM_KEYS.forEach(function (k) { if (attr[k]) qs.set(k, attr[k]); });
    var s = qs.toString();
    return s ? '?' + s : '';
  }
  function decorateRegisterLinks(attr) {
    var q = attrQuery(attr);
    if (!q) return;
    var links = document.querySelectorAll('a[data-register]');
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href') || '/register.html';
      if (href.indexOf('?') === -1) links[i].setAttribute('href', href + q);
    }
  }

  var attr = captureAttribution();
  decorateRegisterLinks(attr);

  // ---- analytics helper (Amplitude; degrades gracefully) ----
  function track(event, props) {
    try { if (window.amplitude && window.amplitude.track) window.amplitude.track(event, props); } catch (e) {}
  }
  var baseProps = { page_slug: slug, page_type: pageType, destination_country: country };
  UTM_KEYS.forEach(function (k) { if (attr[k]) baseProps[k] = attr[k]; });

  track('lp_view', baseProps);

  document.addEventListener('click', function (e) {
    var primary = e.target.closest ? e.target.closest('[data-cta="primary"]') : null;
    if (primary) { track('lp_primary_cta_click', { page_slug: slug, position: primary.getAttribute('data-pos') || 'hero', ref: attr.ref || null }); return; }
    var secondary = e.target.closest ? e.target.closest('[data-cta="secondary"]') : null;
    if (secondary) { track('lp_secondary_cta_click', { page_slug: slug, position: 'hero' }); return; }
    var cross = e.target.closest ? e.target.closest('[data-crosslink]') : null;
    if (cross) { track('lp_crosslink_click', { page_slug: slug, target_slug: cross.getAttribute('data-crosslink') }); }
  });

  // ---- FAQ accordion (self-contained) ----
  var questions = document.querySelectorAll('.lp-faq-q');
  for (var q = 0; q < questions.length; q++) {
    questions[q].addEventListener('click', function () {
      var open = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!open));
      var ans = document.getElementById(this.getAttribute('aria-controls'));
      if (ans) ans.setAttribute('aria-hidden', String(open));
      if (!open) track('lp_faq_open', { page_slug: slug, question_id: Number(this.getAttribute('data-faq-id')) });
    });
  }
})();
