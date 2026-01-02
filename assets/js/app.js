/* Naveen Bullion static site scripts */
(function () {
  // Configuration for form submission services
  const OWNER_EMAIL = 'info@naveenbullion.example'; // update to your email
  const FORM_ENDPOINT = null; // e.g., 'https://formspree.io/f/XXXXXXXX'
  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');
  const backdrop = document.querySelector('.nav-backdrop');
  function closeNav() {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute('aria-expanded', 'false');
    siteNav.classList.remove('open');
    backdrop?.classList.remove('show');
    document.body.classList.remove('no-scroll');
  }
  function openNav() {
    if (!navToggle || !siteNav) return;
    navToggle.setAttribute('aria-expanded', 'true');
    siteNav.classList.add('open');
    backdrop?.classList.add('show');
    document.body.classList.add('no-scroll');
  }
  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    expanded ? closeNav() : openNav();
  });
  backdrop?.addEventListener('click', closeNav);
  siteNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

  const ids = {
    gold: { price: 'goldPrice', delta: 'goldDelta' },
    silver: { price: 'silverPrice', delta: 'silverDelta' },
    platinum: { price: 'platinumPrice', delta: 'platinumDelta' },
    palladium: { price: 'palladiumPrice', delta: 'palladiumDelta' }
  };
  const lastUpdatedEl = document.getElementById('lastUpdated');
  const currencyEl = document.getElementById('currency');
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Theme toggle logic
  const themeToggle = document.querySelector('.theme-toggle');
  const docEl = document.documentElement;
  function applyTheme(theme) {
    docEl.setAttribute('data-theme', theme);
    const icon = themeToggle?.querySelector('.icon');
    if (icon) icon.textContent = theme === 'light' ? '☀️' : '🌙';
  }
  const savedTheme = localStorage.getItem('theme');
  const media = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  const systemTheme = () => (media && media.matches ? 'dark' : 'light');
  applyTheme(savedTheme || systemTheme());
  if (!savedTheme && media) {
    media.addEventListener('change', (e) => applyTheme(e.matches ? 'dark' : 'light'));
  }
  themeToggle?.addEventListener('click', () => {
    const current = docEl.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  let fxRateINR = 83.0; // fallback approx
  let quotesUSD = { gold: null, silver: null, platinum: null, palladium: null };
  let prevUSD = { ...quotesUSD };

  function formatMoney(val, ccy) {
    if (val == null || isNaN(val)) return '—';
    const opts = { style: 'currency', currency: ccy, maximumFractionDigits: 2 };
    return new Intl.NumberFormat(undefined, opts).format(val);
  }
  function setDelta(el, now, prev) {
    if (!el) return;
    if (prev == null || now == null) { el.textContent = '—'; el.className = 'delta'; return; }
    const d = now - prev;
    const pct = prev ? (d / prev) * 100 : 0;
    const dir = d >= 0 ? 'up' : 'down';
    el.textContent = `${dir === 'up' ? '▲' : '▼'} ${Math.abs(pct).toFixed(2)}%`;
    el.className = `delta ${dir}`;
  }
  function updateUI() {
    const ccy = currencyEl ? currencyEl.value : 'INR';
    const rate = ccy === 'INR' ? fxRateINR : 1;
    ['gold','silver','platinum','palladium'].forEach(sym => {
      const priceEl = document.getElementById(ids[sym].price);
      const deltaEl = document.getElementById(ids[sym].delta);
      const usd = quotesUSD[sym];
      const prev = prevUSD[sym];
      const val = usd != null ? usd * rate : null;
      if (priceEl) priceEl.textContent = formatMoney(val, ccy);
      setDelta(deltaEl, usd, prev);
    });
  }
  async function fetchFX() {
    try {
      const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=INR');
      const json = await res.json();
      fxRateINR = json?.rates?.INR || fxRateINR;
    } catch (e) {
      console.warn('FX fetch failed, using fallback', e);
    }
  }
  async function fetchMetals() {
    try {
      const res = await fetch('https://api.metals.live/v1/spot');
      const json = await res.json();
      // json is an array of objects like { gold: 2322.32 } etc
      prevUSD = { ...quotesUSD };
      const map = { gold: null, silver: null, platinum: null, palladium: null };
      json.forEach(obj => {
        for (const k of Object.keys(map)) {
          if (obj[k] != null) map[k] = obj[k];
        }
      });
      quotesUSD = map;
      lastUpdatedEl.textContent = `Updated ${new Date().toLocaleTimeString()}`;
    } catch (e) {
      console.warn('Metals fetch failed, using sample values', e);
      prevUSD = { ...quotesUSD };
      quotesUSD = { gold: 2300, silver: 29, platinum: 950, palladium: 1050 };
      lastUpdatedEl.textContent = 'Offline sample quotes';
    }
  }

  async function refresh() {
    await Promise.all([fetchMetals(), fetchFX()]);
    updateUI();
  }

  currencyEl?.addEventListener('change', updateUI);
  refresh();
  setInterval(refresh, 60 * 1000); // refresh every minute

  // Quote form handling
  const quoteForm = document.getElementById('quoteForm');
  const emailSubmitBtn = document.getElementById('emailSubmit');
  const formStatus = document.getElementById('formStatus');

  function getVal(id) { return (document.getElementById(id)?.value || '').trim(); }
  function setError(id, msg) {
    const el = document.querySelector(`small.error[data-for="${id}"]`);
    if (el) el.textContent = msg || '';
  }
  function validateForm() {
    let ok = true;
    const required = [
      ['qName', 'Please enter your name'],
      ['qPhone', 'Please enter a valid phone'],
      ['qEmail', 'Please enter a valid email'],
      ['qMetal', 'Select a metal'],
      ['qPurity', 'Select purity'],
      ['qSide', 'Select buy/sell'],
      ['qQty', 'Enter quantity'],
      ['qUnit', 'Select unit'],
      ['qCity', 'Enter delivery city'],
      ['qConsent', 'Please consent to be contacted']
    ];
    required.forEach(([id, msg]) => setError(id, ''));
    required.forEach(([id, msg]) => {
      const el = document.getElementById(id);
      const val = el?.type === 'checkbox' ? el.checked : (el?.value || '').trim();
      if (!val) { setError(id, msg); ok = false; }
    });
    // Basic email/phone checks
    const email = getVal('qEmail');
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('qEmail', 'Invalid email'); ok = false; }
    const phone = getVal('qPhone');
    if (phone && phone.replace(/\D/g, '').length < 10) { setError('qPhone', 'Invalid phone'); ok = false; }
    return ok;
  }
  function buildSummary() {
    const data = {
      name: getVal('qName'),
      phone: getVal('qPhone'),
      email: getVal('qEmail'),
      metal: getVal('qMetal'),
      purity: getVal('qPurity'),
      side: getVal('qSide'),
      quantity: getVal('qQty'),
      unit: getVal('qUnit'),
      budget: getVal('qBudget'),
      city: getVal('qCity'),
      date: getVal('qDate'),
      notes: getVal('qNotes')
    };
    const lines = [
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      `Email: ${data.email}`,
      `Type: ${data.side}`,
      `Metal: ${data.metal} | Purity: ${data.purity}`,
      `Quantity: ${data.quantity} ${data.unit}`,
      `Budget: ${data.budget || '—'}`,
      `City: ${data.city}`,
      `Preferred Date: ${data.date || '—'}`,
      `Notes: ${data.notes || '—'}`
    ];
    return { data, text: lines.join('\n') };
  }
  async function submitViaFormspree(summary) {
    if (!FORM_ENDPOINT) return false;
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary.data)
      });
      if (res.ok) return true;
      const t = await res.text();
      console.warn('Formspree error', t);
      return false;
    } catch (e) {
      console.warn('Formspree submit failed', e);
      return false;
    }
  }
  function submitViaMailto(summary) {
    const subject = encodeURIComponent('Bullion Quote Request');
    const body = encodeURIComponent(summary.text);
    const href = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;
    window.location.href = href;
    return true;
  }
  async function handleSubmit(e, forceMailto = false) {
    e?.preventDefault();
    formStatus && (formStatus.textContent = '');
    if (!validateForm()) { formStatus && (formStatus.textContent = 'Please correct highlighted fields.'); return; }
    const summary = buildSummary();
    let ok = false;
    if (!forceMailto) ok = await submitViaFormspree(summary);
    if (!ok) ok = submitViaMailto(summary);
    formStatus && (formStatus.textContent = ok ? 'Request ready in your mail client.' : 'Could not submit. Please email us directly.');
  }
  quoteForm?.addEventListener('submit', handleSubmit);
  emailSubmitBtn?.addEventListener('click', (e) => handleSubmit(e, true));
})();
