# -*- coding: utf-8 -*-
"""Reusable landing-page builder for PayerPay SEO/acquisition pages.
One template + per-page data -> /<slug>/index.html. Texts are taken verbatim
from PayerPay_Landing_Pages_Dev_Spec_v1.0. Run: python build_landings.py"""
import os, json, html

ROOT = os.path.dirname(os.path.abspath(__file__))
ORIGIN = "https://payerpay.io"

# ---------- shared chrome (root-absolute paths; landings live in /slug/) ----------
HEADER = '''  <header class="site-header" data-header>
    <div class="container nav-wrap">
      <a class="logo" href="/" aria-label="PayerPay home"><img src="/assets/logo-full.png?v=1" alt="PayerPay" class="logo-img"></a>
      <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-navigation" aria-label="Open menu" data-menu-toggle>
        <span></span><span></span><span></span>
      </button>
      <nav class="main-nav" id="main-navigation" aria-label="Main navigation" data-menu>
        <div class="main-nav-inner">
          <a href="/#how-it-works">How it works</a>
          <a href="/#destinations">Destinations</a>
          <a href="/#security">Security</a>
          <a href="/faq.html">FAQ</a>
          <a class="button button-small button-primary nav-cta" href="/register.html" data-register>Get account details</a>
        </div>
      </nav>
    </div>
  </header>
  <div class="nav-scrim" data-nav-scrim aria-hidden="true"></div>'''

FOOTER = '''  <footer class="site-footer">
    <div class="container footer-top">
      <div class="footer-brand">
        <a class="logo logo-light" href="/" aria-label="PayerPay home"><img src="/assets/logo-full-light.png?v=1786990000" alt="PayerPay" class="logo-img"></a>
        <p class="footer-tagline">Get paid abroad and send money home locally &mdash; through payment methods your family already knows.</p>
        <div class="footer-actions">
          <a class="footer-tg" href="https://t.me/PayerPay" target="_blank" rel="noopener">
            <svg class="footer-tg-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.94 4.3 18.7 19.42c-.24 1.08-.89 1.34-1.8.83l-4.98-3.67-2.4 2.31c-.27.27-.49.49-1 .49l.36-5.06L18.1 6.1c.4-.36-.09-.56-.62-.2L6.3 13.06l-4.9-1.53c-1.06-.33-1.09-1.06.23-1.57l19.13-7.38c.89-.33 1.66.2 1.37 1.66Z"/></svg>
            Join us on Telegram
          </a>
          <a class="footer-cta" href="/register.html" data-register>Get account details</a>
        </div>
      </div>
      <nav class="footer-cols" aria-label="Footer navigation">
        <div><h3>Product</h3><a href="/#how-it-works">How it works</a><a href="/#destinations">Destinations</a><a href="/#security">Security</a><a href="/faq.html">FAQ</a></div>
        <div><h3>Solutions</h3><a href="/usd-account-non-us-residents">USD payment details</a><a href="/send-money-to-india">Send money to India</a><a href="/send-money-to-philippines">Send money to the Philippines</a></div>
        <div><h3>Company</h3><a href="/#top">About</a><a href="/faq.html">Support</a><a href="/contact.html">Contact us</a></div>
        <div><h3>Legal</h3><a href="/terms.html">Terms</a><a href="/privacy.html">Privacy</a><a href="/aml-kyc.html">AML / KYC</a></div>
      </nav>
    </div>
    <div class="container footer-reg">
      <p class="footer-reg-line"><strong>PAYER PAY INTERNATIONAL INC.</strong> &middot; Company ID BC1526086 &middot; FINTRAC MSB C100001025 &middot; Registered with the Bank of Canada under the Retail Payment Activities Act.</p>
      <small>Payment services are subject to verification, eligibility, partner availability and compliance review.</small>
    </div>
    <div class="container footer-bottom"><span>&copy; <span data-year></span> PayerPay. All rights reserved.</span><span class="footer-motto">Move money with clarity.</span></div>
  </footer>'''


def shell(d, body):
    canonical = ORIGIN + "/" + d["slug"]
    schema = {
        "@context": "https://schema.org", "@type": "WebPage",
        "name": d["seo"]["title"], "description": d["seo"]["description"], "url": canonical,
        "inLanguage": "en",
        "isPartOf": {"@type": "WebSite", "name": "PayerPay", "url": ORIGIN + "/"},
        "publisher": {"@type": "Organization", "name": "PayerPay", "url": ORIGIN + "/"},
    }
    return f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{d["seo"]["title"]}</title>
  <meta name="description" content="{d["seo"]["description"]}">
  <link rel="canonical" href="{canonical}">
  <meta name="robots" content="index, follow">
  <meta name="theme-color" content="#0f1b33">
  <link rel="manifest" href="/site.webmanifest?v=1786988000">
  <link rel="apple-touch-icon" href="/assets/icons/apple-touch-icon.png?v=1786988000">
  <link rel="icon" type="image/png" sizes="64x64" href="/assets/icons/favicon-64.png?v=1786988000">
  <meta property="og:type" content="website">
  <meta property="og:title" content="{d["seo"]["ogTitle"]}">
  <meta property="og:description" content="{d["seo"]["ogDescription"]}">
  <meta property="og:url" content="{canonical}">
  <meta property="og:image" content="{ORIGIN}/assets/og-landing.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/styles.css?v=1786988000">
  <link rel="stylesheet" href="/landing.css?v=1">
  <script type="application/ld+json">{json.dumps(schema)}</script>
  <script src="https://cdn.amplitude.com/script/67224fe472135bc9132d5dc9c7de0c4a.js"></script>
  <script>window.amplitude.init('67224fe472135bc9132d5dc9c7de0c4a');</script>
</head>
<body class="lp-body" data-lp-slug="{d["slug"]}" data-lp-type="{d["pageType"]}" data-lp-country="{d.get("country","")}">
  <a class="skip-link" href="#main-content">Skip to content</a>
{HEADER}
  <main id="main-content">
{body}
  </main>
{FOOTER}
  <script src="/app.js?v=1786988000" defer></script>
  <script src="/landing.js?v=1" defer></script>
</body>
</html>
'''


# ---------- block helpers ----------
def cta_primary(pos, label="Get account details"):
    return f'<a class="button button-primary" href="/register.html" data-register data-cta="primary" data-pos="{pos}">{label} <span aria-hidden="true">&rarr;</span></a>'

def cta_secondary(label="See how it works"):
    return f'<a class="button button-secondary" href="#how-it-works" data-cta="secondary"><span class="play-icon" aria-hidden="true">&#9654;</span> {label}</a>'

def chips(items):
    lis = "".join(f"<li><span aria-hidden=\"true\">&#10003;</span> {c}</li>" for c in items)
    return f'<ul class="lp-chips" aria-label="Key benefits">{lis}</ul>'

def benefits(items):
    cards = ""
    for i, (h, p) in enumerate(items):
        cards += f'<article data-reveal style="--delay: {i*70}ms"><span aria-hidden="true">{i+1:02d}</span><h3>{h}</h3><p>{p}</p></article>'
    return f'<div class="lp-benefit-grid">{cards}</div>'

def steps(items):
    lis = ""
    for i, (h, p) in enumerate(items):
        lis += (f'<li class="lp-step" data-reveal style="--delay: {i*90}ms"><span class="lp-step-num">{i+1:02d}</span>'
                f'<div><h3>{h}</h3><p>{p}</p></div></li>')
    return f'<ol class="lp-steps">{lis}</ol>'

def trust_cards(items):
    cards = ""
    icons = [
        '<svg viewBox="0 0 24 24"><path d="M12 3 5 6v5c0 4.5 3 7.6 7 9 4-1.4 7-4.5 7-9V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></svg>',
        '<svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V5l-8-3Z"/><circle cx="12" cy="10" r="2.2"/><path d="M8.4 16c.6-1.7 2-2.6 3.6-2.6s3 .9 3.6 2.6"/></svg>',
        '<svg viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><path d="M3.5 9h17M7 13h6M7 16h4"/></svg>',
    ]
    for i, (h, p) in enumerate(items):
        cards += (f'<article data-reveal style="--delay: {i*70}ms"><div class="security-icon" aria-hidden="true">{icons[i%3]}</div>'
                  f'<h3>{h}</h3><p>{p}</p></article>')
    return f'<div class="security-cards">{cards}</div>'

def faq(items):
    rows = ""
    for i, (q, a) in enumerate(items, 1):
        rows += (f'<div class="lp-faq-item"><button class="lp-faq-q" id="faq-question-{i}" type="button" '
                 f'aria-expanded="false" aria-controls="faq-answer-{i}" data-faq-id="{i}">'
                 f'<span>{q}</span><span class="lp-faq-ic" aria-hidden="true"></span></button>'
                 f'<div class="lp-faq-a" id="faq-answer-{i}" role="region" aria-labelledby="faq-question-{i}">'
                 f'<div class="lp-faq-a-in"><p>{a}</p></div></div></div>')
    return (f'<section class="section lp-faq"><div class="container"><div class="section-heading center" data-reveal>'
            f'<p class="eyebrow">Support</p><h2>Frequently asked questions</h2></div>'
            f'<div class="lp-faq-list" data-reveal>{rows}</div></div></section>')

def flow(nodes):
    parts = []
    for i, (label, sub) in enumerate(nodes):
        parts.append(f'<div class="lp-flow-node"><span>{label}</span><small>{sub}</small></div>')
        if i < len(nodes) - 1:
            parts.append('<span class="lp-flow-arrow" aria-hidden="true">&rarr;</span>')
    return f'<div class="lp-flow" aria-hidden="true">{"".join(parts)}</div>'

def final_cta(h2, copy, note):
    return (f'<section class="final-cta lp-final" id="start"><div class="final-orb" aria-hidden="true"></div>'
            f'<div class="container final-inner" data-reveal><div><p class="eyebrow light">Ready to start?</p>'
            f'<h2>{h2}</h2><p>{copy}</p><div class="lp-final-cta">'
            f'<a class="button button-light" href="/register.html" data-register data-cta="primary" data-pos="final">Get account details <span aria-hidden="true">&rarr;</span></a>'
            f'<p class="lp-availability">{note}</p></div></div></div></section>')

def hero(d, visual):
    return (f'<section class="hero lp-hero" id="top"><div class="hero-orb hero-orb-one" aria-hidden="true"></div>'
            f'<div class="hero-orb hero-orb-two" aria-hidden="true"></div>'
            f'<div class="container hero-grid"><div class="hero-copy">'
            f'<p class="eyebrow hero-eyebrow"><span aria-hidden="true"></span> {d["eyebrow"]}</p>'
            f'<h1>{d["h1"]}</h1><p class="hero-lead">{d["heroCopy"]}</p>'
            f'<div class="hero-actions">{cta_primary("hero")}{cta_secondary()}</div>'
            f'{chips(d["trustChips"])}</div>'
            f'<div class="hero-visual lp-hero-visual">{visual}</div></div></section>')

def section_head(eyebrow, h2, sub=None, center=False):
    cls = "section-heading center" if center else "section-heading"
    p = f"<p>{sub}</p>" if sub else ""
    eb = f'<p class="eyebrow">{eyebrow}</p>' if eyebrow else ""
    return f'<div class="{cls}" data-reveal>{eb}<h2>{h2}</h2>{p}</div>'

def proof(items):
    cells = "".join(f"<div><strong>{a}</strong><span>{b}</span></div>" for a, b in items)
    return f'<section class="proof-bar" aria-label="Product assurances"><div class="container proof-grid">{cells}</div></section>'


# ---------- USD detail card visual ----------
def usd_card():
    return ('<div class="lp-card lp-card-usd" aria-hidden="true"><div class="lp-card-head"><span class="flag-chip">'
            '<svg class="flag-icon"><use href="#lp-flag-us"></use></svg></span><strong>Personal USD details</strong></div>'
            '<dl class="lp-card-rows">'
            '<div><dt>Account holder</dt><dd>Alex Morgan</dd></div>'
            '<div><dt>Account number</dt><dd>&bull;&bull;&bull;&bull; 4812</dd></div>'
            '<div><dt>Routing number</dt><dd>&bull;&bull;&bull;&bull; 8042</dd></div>'
            '</dl><div class="lp-card-status"><span aria-hidden="true">&#10003;</span> Status: Ready to receive</div></div>')

def details_visual():
    rows = ["Account holder name", "Account number", "Routing number", "ACH details", "Fedwire details"]
    r = "".join(f'<li><span aria-hidden="true">&#10003;</span> {x}</li>' for x in rows)
    return f'<div class="lp-card lp-card-list" aria-hidden="true"><strong>USD payment details</strong><ul>{r}</ul></div>'

FLAG_SPRITE = ('<svg class="svg-sprite" aria-hidden="true" focusable="false">'
    '<symbol id="lp-flag-us" viewBox="0 0 60 40"><rect width="60" height="40" rx="4" fill="#fff"/>'
    '<path fill="#d92d3f" d="M0 0h60v4H0zm0 8h60v4H0zm0 8h60v4H0zm0 8h60v4H0zm0 8h60v4H0z"/>'
    '<path fill="#22447b" d="M0 0h27v22H0z"/></symbol></svg>')

def cross_dest():
    return ('<section class="section lp-popular"><div class="container">'
            + section_head("Popular destinations", "Send money where your family is", center=True) +
            '<div class="lp-dest-cards">'
            '<a class="lp-dest-card" href="/send-money-to-india" data-crosslink="send-money-to-india"><strong>Send money to India</strong>'
            '<span>Receive USD or EUR and send INR via local bank transfer.</span><em aria-hidden="true">&rarr;</em></a>'
            '<a class="lp-dest-card" href="/send-money-to-philippines" data-crosslink="send-money-to-philippines"><strong>Send money to the Philippines</strong>'
            '<span>Receive USD or EUR and send PHP to GCash or a local bank.</span><em aria-hidden="true">&rarr;</em></a>'
            '</div></div></section>')

def cross_usd(text):
    return ('<div class="lp-crosslink"><a href="/usd-account-non-us-residents" data-crosslink="usd-account-non-us-residents">'
            + text + ' <span aria-hidden="true">&rarr;</span></a></div>')


# ============================ PAGE 1 - USD ============================
USD = {
  "slug": "usd-account-non-us-residents", "pageType": "product", "country": "",
  "seo": {
    "title": "USD Payment Details for Non-US Residents | PayerPay",
    "description": "Get personal USD payment details in your verified name and receive eligible ACH or Fedwire payments without US residency. No opening or monthly fee.",
    "ogTitle": "Get USD payment details without US residency",
    "ogDescription": "Receive eligible USD payments through ACH or Fedwire using personal payment details issued in your verified name.",
  },
  "eyebrow": "Personal USD payment details",
  "h1": "Get personal USD payment details without living in the US",
  "heroCopy": "Receive eligible salary and personal transfers through ACH or Fedwire using USD payment details issued in your verified name.",
  "trustChips": ["ACH &amp; Fedwire", "Details in your name", "No opening or monthly fee"],
}

def render_usd(d):
    b = FLAG_SPRITE
    b += hero(d, usd_card())
    b += '<section class="section section-soft"><div class="container">'
    b += section_head("Built for getting paid", "USD details built for getting paid abroad")
    b += benefits([
        ("Receive through ACH or Fedwire", "Use the USD details shown in your PayerPay account for eligible incoming payments."),
        ("Details issued in your name", "Your verified account holder name is included with the payment details provided after approval."),
        ("No opening or monthly fee", "There is no opening or monthly maintenance fee for personal USD payment details."),
        ("Manage onward payments from one account", "After funds arrive, use your PayerPay balance for supported transfers and currency exchange."),
    ])
    b += '</div></section>'
    b += ('<section class="section"><div class="container lp-two-col">'
          '<div>' + section_head("What you receive", "What USD details do you receive?") +
          '<ul class="lp-check-list">'
          '<li><span aria-hidden="true">&#10003;</span> Account holder name</li>'
          '<li><span aria-hidden="true">&#10003;</span> Account number</li>'
          '<li><span aria-hidden="true">&#10003;</span> Routing number</li>'
          '<li><span aria-hidden="true">&#10003;</span> ACH details</li>'
          '<li><span aria-hidden="true">&#10003;</span> Fedwire details</li>'
          '<li><span aria-hidden="true">&#10003;</span> Bank address and other required bank information</li>'
          '</ul></div><div class="lp-two-col-visual">' + details_visual() + '</div></div></section>')
    b += ('<section class="section section-soft"><div class="container">'
          + section_head("Eligible senders", "Who can send money to your personal USD details?") +
          '<div class="lp-benefit-grid lp-senders">'
          '<article><h3>Your own account</h3></article>'
          '<article><h3>Your employer as salary</h3></article>'
          '<article><h3>A company paying dividends</h3></article>'
          '<article><h3>A family member with the same surname</h3></article>'
          '<article><h3>A government body, insurer or educational institution</h3></article>'
          '</div>'
          '<p class="lp-note">The sender and payment purpose must reflect the real nature of the payment. '
          'Regular payments for goods or services require business verification.</p></div></section>')
    b += ('<section class="section how-section" id="how-it-works"><div class="container">'
          + section_head("How it works", "How it works", "Three clear steps to start receiving USD.", center=True)
          + steps([
              ("Create and verify your PayerPay account", "Register and complete identity verification."),
              ("Apply for USD payment details", "After verification, apply for personal USD details. Approval is subject to availability in your country."),
              ("Share your details with an eligible sender", "Once issued, use the details shown in your account to receive supported ACH or Fedwire payments."),
          ])
          + '<div class="lp-mid-cta">' + cta_primary("mid") + '</div></div></section>')
    b += ('<section class="section"><div class="container lp-transparency">'
          + section_head("Transparency", "Know the cost before you move money") +
          '<p class="lp-lead">When you create a supported transfer, PayerPay shows the applicable fee, exchange rate, debit amount and recipient amount before you confirm.</p>'
          '</div></section>')
    b += ('<section class="section security-section" id="security"><div class="security-orb" aria-hidden="true"></div>'
          '<div class="container">'
          + section_head("Trust and compliance", "Verification and security are part of the product")
          + trust_cards([
              ("Identity verification", "Accounts and transfers are subject to identity checks, sanctions screening and monitoring."),
              ("Two-factor confirmation", "Payments are protected with mandatory transaction confirmation."),
              ("Regulated service", "PayerPay is registered with FINTRAC and with the Bank of Canada as a payment service provider."),
          ]) + '</div></section>')
    b += cross_dest()
    b += faq([
        ("Can I get USD payment details if I do not live in the US?", "Yes. US residency is not required. Approval is subject to identity verification, availability in your country and compliance review."),
        ("Which USD details are provided?", "Account holder name, account number, routing number, ACH and Fedwire details, bank address and other required bank information."),
        ("Is there an opening or monthly fee?", "No. There is no opening or monthly maintenance fee for personal USD payment details."),
        ("Who can send money to my personal USD details?", "Eligible senders include your own account, an employer paying salary, a company paying dividends, a family member with the same surname, a government body, insurer or educational institution. The real sender and payment purpose must match the transaction."),
        ("Can I receive customer payments for goods or services?", "Regular payments for goods or services require business verification as a sole trader or company."),
        ("How long do incoming USD transfers take?", "ACH can take up to 24 hours excluding weekends and public holidays. Fedwire is typically much faster, depending on the sending bank."),
    ])
    b += final_cta("Ready to receive USD without US residency?",
                   "Apply for personal USD payment details in your verified name and receive eligible payments through ACH or Fedwire.",
                   "Availability is subject to eligibility, verification, banking-partner coverage and compliance review.")
    return b


# ======================= COUNTRY PAGES (India / Philippines) =======================
def render_country(d):
    b = hero(d, flow(d["flowNodes"]))
    b += '<section class="section section-soft"><div class="container">'
    b += section_head("How it flows", d["benefitsH2"])
    b += benefits(d["benefits"])
    b += '</div></section>'
    b += ('<section class="section how-section" id="how-it-works"><div class="container">'
          + section_head("How it works", "How it works", None, center=True)
          + steps(d["steps"])
          + '<div class="lp-mid-cta">' + cta_primary("mid") + '</div></div></section>')
    b += ('<section class="section"><div class="container lp-transparency">'
          + section_head("Recipient", d["recipientH2"]) +
          f'<p class="lp-lead">{d["recipientCopy"]}</p>' + cross_usd("Learn about USD payment details") + '</div></section>')
    b += ('<section class="section section-soft"><div class="container lp-transparency">'
          + section_head("Transparency", "See the price before you send") +
          f'<p class="lp-lead">{d["transparencyCopy"]}</p>'
          f'<p class="lp-note">{d["timeNote"]}</p></div></section>')
    b += ('<section class="section security-section" id="security"><div class="security-orb" aria-hidden="true"></div>'
          '<div class="container">'
          + section_head("Trust and compliance", "Built for verified international payments")
          + trust_cards(d["trustCards"]) + '</div></section>')
    b += faq(d["faqs"])
    b += final_cta(d["finalH2"], d["finalCopy"],
                   "Availability is subject to eligibility, verification, banking-partner coverage and compliance review.")
    return b


INDIA = {
  "slug": "send-money-to-india", "pageType": "country", "country": "India",
  "seo": {
    "title": "Send Money to India via Local Bank Transfer | PayerPay",
    "description": "Receive eligible payments in USD or EUR, convert to INR, and send money directly to a recipient's bank account in India via local bank transfer.",
    "ogTitle": "Get paid abroad. Send INR to a bank account in India.",
    "ogDescription": "Receive eligible USD or EUR payments, review the rate and fee, and send INR through a supported local bank transfer in India.",
  },
  "eyebrow": "India &middot; INR",
  "h1": "Send money to India via local bank transfer",
  "heroCopy": "Receive eligible payments in USD or EUR, convert to INR, and send funds directly to a recipient's bank account in India.",
  "trustChips": ["USD or EUR funding", "INR local bank transfer", "Rate &amp; fee shown before confirmation"],
  "flowNodes": [("USD / EUR", "You receive"), ("PayerPay balance", "Convert"), ("INR", "Local transfer"), ("Local bank account in India", "Recipient")],
  "benefitsH2": "From your income abroad to a bank account in India",
  "benefits": [
    ("Get paid in USD or EUR", "Use personal USD or EUR payment details, subject to eligibility and verification."),
    ("Convert to INR", "Choose the amount and review the exchange rate and applicable fee before confirmation."),
    ("Send through a local bank transfer", "Send INR to a supported recipient bank account in India."),
    ("Your recipient does not need PayerPay", "The recipient receives funds through the supported local banking route and does not need to register with PayerPay."),
  ],
  "steps": [
    ("Receive money", "Get paid into your personal USD or EUR payment details."),
    ("Choose India", "Select India as the destination and enter the amount you want to send."),
    ("Add the recipient's bank details", "Enter the supported bank account details requested in the transfer form."),
    ("Review and confirm", "Check the exchange rate, fee, debit amount, recipient amount and expected processing time before confirming."),
  ],
  "recipientH2": "Send INR directly to a local bank account",
  "recipientCopy": "Your recipient does not need a PayerPay account. Supported local payouts are sent to the bank account details you provide for the recipient in India.",
  "transparencyCopy": "PayerPay displays the applicable fee, exchange rate, amount debited and amount the recipient is expected to receive before you confirm the transfer.",
  "timeNote": "Supported local payouts can take up to one business day. The expected time for the specific route is shown before confirmation.",
  "trustCards": [
    ("Verified account", "Identity verification is required before using supported payment services."),
    ("Recipient screening", "Recipients and banks are screened for sanctions and other restrictions."),
    ("Clear status", "Track transfer status and review transaction details in your PayerPay account."),
  ],
  "faqs": [
    ("How can I send money to India with PayerPay?", "Receive funds in your PayerPay USD or EUR balance, choose India as the destination, enter the recipient's supported bank details, review the rate and fee, and confirm the transfer."),
    ("Does PayerPay use UPI for transfers to India?", "No. PayerPay currently supports local bank transfers to eligible recipient bank accounts in India."),
    ("Does the recipient need a PayerPay account?", "No. The recipient does not need to register with PayerPay for a supported local bank transfer."),
    ("What currency does the recipient receive?", "The recipient receives INR through the supported local bank-transfer route selected for the transaction."),
    ("Will I see the exchange rate and fee before sending?", "Yes. The applicable fee, exchange rate, debit amount and recipient amount are shown before confirmation."),
    ("How long does a local transfer to India take?", "Supported local payouts can take up to one business day. The expected time for the specific transaction is displayed before confirmation."),
    ("Who can I send money to?", "Supported outgoing payments may be sent to your own accounts, relatives, friends, individuals and companies for lawful purposes, subject to eligibility and compliance review."),
  ],
  "finalH2": "Get paid abroad. Send INR to India locally.",
  "finalCopy": "Open PayerPay, receive eligible USD or EUR payments, and send INR to a supported bank account in India.",
}

PHIL = {
  "slug": "send-money-to-philippines", "pageType": "country", "country": "Philippines",
  "seo": {
    "title": "Send Money to the Philippines via GCash or Bank | PayerPay",
    "description": "Receive eligible payments in USD or EUR and send PHP to a supported GCash wallet or local bank account in the Philippines. See the rate and fee before confirming.",
    "ogTitle": "Get paid abroad. Send PHP to the Philippines locally.",
    "ogDescription": "Receive eligible USD or EUR payments and send PHP to a supported GCash wallet or local bank account.",
  },
  "eyebrow": "Philippines &middot; PHP",
  "h1": "Send money to the Philippines via GCash or local bank transfer",
  "heroCopy": "Receive eligible payments in USD or EUR, convert to PHP, and send funds to a supported GCash wallet or local bank account in the Philippines.",
  "trustChips": ["USD or EUR funding", "GCash or local bank transfer", "Rate &amp; fee shown before confirmation"],
  "flowNodes": [("USD / EUR", "You receive"), ("PayerPay balance", "Convert"), ("PHP", "Local payout"), ("GCash / Local bank account", "Recipient")],
  "benefitsH2": "From your income abroad to the Philippines",
  "benefits": [
    ("Get paid in USD or EUR", "Use personal USD or EUR payment details, subject to eligibility and verification."),
    ("Convert to PHP", "Choose the amount and review the exchange rate and applicable fee before confirmation."),
    ("Choose a familiar local payout method", "Send PHP to a supported GCash wallet or local bank account."),
    ("Your recipient does not need PayerPay", "The recipient can receive a supported local payout without registering for a PayerPay account."),
  ],
  "steps": [
    ("Receive money", "Get paid into your personal USD or EUR payment details."),
    ("Choose the Philippines", "Select the destination and enter the amount you want to send."),
    ("Choose GCash or local bank transfer", "Select an available payout method and enter the recipient details requested in the transfer form."),
    ("Review and confirm", "Check the exchange rate, fee, debit amount, recipient amount and expected processing time before confirming."),
  ],
  "recipientH2": "Send PHP through a local method your recipient already uses",
  "recipientCopy": "Send to a supported GCash wallet or local bank account. Your recipient does not need a PayerPay account for a supported local payout.",
  "transparencyCopy": "PayerPay displays the applicable fee, exchange rate, amount debited and amount the recipient is expected to receive before you confirm the transfer.",
  "timeNote": "Supported local payouts can take up to one business day. The expected time for the selected route is shown before confirmation.",
  "trustCards": [
    ("Verified account", "Identity verification is required before using supported payment services."),
    ("Recipient screening", "Recipients and payout details are subject to sanctions and compliance checks."),
    ("Clear status", "Track transfer status and review transaction details in your PayerPay account."),
  ],
  "faqs": [
    ("How can I send money to the Philippines with PayerPay?", "Receive funds in your PayerPay USD or EUR balance, choose the Philippines, select an available payout method, enter the recipient details, review the rate and fee, and confirm."),
    ("Can I send money to GCash?", "Yes, where the GCash payout route is available for the recipient and transaction. Availability is shown when you create the transfer."),
    ("Can I send money to a local bank account in the Philippines?", "Yes, supported local bank transfers are available subject to route availability and compliance checks."),
    ("Does the recipient need a PayerPay account?", "No. The recipient does not need to register with PayerPay for a supported local payout."),
    ("What currency does the recipient receive?", "The recipient receives PHP through the selected supported local payout method."),
    ("Will I see the exchange rate and fee before sending?", "Yes. The applicable fee, exchange rate, debit amount and recipient amount are shown before confirmation."),
    ("How long does a local payout take?", "Supported local payouts can take up to one business day. The expected time for the specific transaction is displayed before confirmation."),
  ],
  "finalH2": "Get paid abroad. Send PHP to the Philippines locally.",
  "finalCopy": "Open PayerPay, receive eligible USD or EUR payments, and send PHP through a supported GCash or local bank payout.",
}


def build():
    pages = [(USD, render_usd(USD)), (INDIA, render_country(INDIA)), (PHIL, render_country(PHIL))]
    for d, body in pages:
        outdir = os.path.join(ROOT, d["slug"])
        os.makedirs(outdir, exist_ok=True)
        pretty = body.replace("</section>", "</section>\n").replace("<section", "\n<section")
        with open(os.path.join(outdir, "index.html"), "w", encoding="utf-8") as f:
            f.write(shell(d, pretty))
        print("built", d["slug"] + "/index.html")

if __name__ == "__main__":
    build()
