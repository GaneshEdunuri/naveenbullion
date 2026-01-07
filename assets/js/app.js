/* Naveen Bullion static site scripts */
(function () {
  // Authentication check - protect only live prices
  function getCurrentUser() {
    const user = sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  function updateAuthUI() {
    const user = getCurrentUser();
    const authControls = document.querySelector('.auth-controls');
    const userMenu = document.querySelector('.user-menu');
    const userName = document.getElementById('userName');
    const quotesContent = document.getElementById('quotesContent');
    const quotesAuthPrompt = document.getElementById('quotesAuthPrompt');

    if (user) {
      // User is logged in
      authControls && (authControls.style.display = 'none');
      userMenu && (userMenu.style.display = 'flex');
      userName && (userName.textContent = user.name || user.email);
      // Show live prices
      quotesContent && (quotesContent.style.display = 'block');
      quotesAuthPrompt && (quotesAuthPrompt.style.display = 'none');
    } else {
      // User not logged in
      authControls && (authControls.style.display = 'flex');
      userMenu && (userMenu.style.display = 'none');
      // Hide live prices, show login prompt
      quotesContent && (quotesContent.style.display = 'none');
      quotesAuthPrompt && (quotesAuthPrompt.style.display = 'block');
    }
  }

  // Initialize auth UI immediately
  updateAuthUI();

  // Shopping Cart Management
  let cart = [];
  const CART_STORAGE_KEY = 'nbCart';

  // Load cart from localStorage
  function loadCart() {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      cart = saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to load cart', e);
      cart = [];
    }
    updateCartBadge();
    renderProductButtons();
  }

  // Render product buttons based on cart state
  function renderProductButtons() {
    document.querySelectorAll('.product-card').forEach(card => {
      const metal = card.dataset.metal;
      const weight = parseInt(card.dataset.weight);
      const cartItem = cart.find(item => item.metal === metal && item.weight === weight);
      const btnContainer = card.querySelector('.product-btn-container');
      
      if (!btnContainer) return;
      
      if (cartItem) {
        // Show quantity controls
        btnContainer.innerHTML = `
          <div class="product-qty-controls">
            <button class="product-qty-btn" data-action="decrease" data-metal="${metal}" data-weight="${weight}">−</button>
            <span class="product-qty">${cartItem.quantity}</span>
            <button class="product-qty-btn" data-action="increase" data-metal="${metal}" data-weight="${weight}">+</button>
          </div>
        `;
      } else {
        // Show Add to Cart button
        btnContainer.innerHTML = `
          <button class="btn btn-add-cart" data-metal="${metal}" data-weight="${weight}">Add to Cart</button>
        `;
      }
    });
    
    // Attach event listeners
    attachProductButtonListeners();
  }

  // Attach event listeners to product buttons
  function attachProductButtonListeners() {
    // Add to cart buttons
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const metal = e.target.dataset.metal;
        const weight = parseInt(e.target.dataset.weight);
        if (metal && weight) {
          addToCart(metal, weight);
        }
      });
    });
    
    // Quantity control buttons
    document.querySelectorAll('.product-qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const metal = e.target.dataset.metal;
        const weight = parseInt(e.target.dataset.weight);
        const action = e.target.dataset.action;
        const item = cart.find(i => i.metal === metal && i.weight === weight);
        if (item) {
          const newQty = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
          updateCartItem(metal, weight, newQty);
        }
      });
    });
  }

  // Save cart to localStorage
  function saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to save cart', e);
    }
    updateCartBadge();
  }

  // Update cart badge count
  function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  }

  // Add item to cart
  function addToCart(metal, weight) {
    const existingItem = cart.find(item => item.metal === metal && item.weight === weight);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        metal: metal,
        weight: weight,
        quantity: 1,
        pricePerGram: getCurrentPricePerGram(metal)
      });
    }
    saveCart();
    renderCart();
    renderProductButtons();
    showCartNotification(metal, weight);
  }

  // Get current price per gram from live data
  function getCurrentPricePerGram(metal) {
    const ccy = document.getElementById('currency')?.value || 'INR';
    const rate = ccy === 'INR' ? fxRateINR : 1;
    const ozPrice = quotesUSD[metal] || 0;
    // 1 troy oz = 31.1035 grams
    return (ozPrice * rate) / 31.1035;
  }

  // Update item quantity
  function updateCartItem(metal, weight, newQuantity) {
    const item = cart.find(item => item.metal === metal && item.weight === weight);
    if (item) {
      if (newQuantity <= 0) {
        removeFromCart(metal, weight);
      } else {
        item.quantity = newQuantity;
        saveCart();
        renderCart();
        renderProductButtons();
      }
    }
  }

  // Remove item from cart
  function removeFromCart(metal, weight) {
    cart = cart.filter(item => !(item.metal === metal && item.weight === weight));
    saveCart();
    renderCart();
    renderProductButtons();
  }

  // Clear entire cart
  function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
      cart = [];
      saveCart();
      renderCart();
      renderProductButtons();
    }
  }

  // Calculate cart total
  function calculateCartTotal() {
    return cart.reduce((total, item) => {
      const currentPrice = getCurrentPricePerGram(item.metal);
      return total + (currentPrice * item.weight * item.quantity);
    }, 0);
  }

  // Format money
  function formatCartMoney(value) {
    const ccy = document.getElementById('currency')?.value || 'INR';
    const opts = { style: 'currency', currency: ccy, maximumFractionDigits: 2 };
    return new Intl.NumberFormat(undefined, opts).format(value);
  }

  // Render cart modal content
  function renderCart() {
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');

    if (cart.length === 0) {
      cartEmpty.style.display = 'block';
      cartItems.style.display = 'none';
      cartFooter.style.display = 'none';
      return;
    }

    cartEmpty.style.display = 'none';
    cartItems.style.display = 'block';
    cartFooter.style.display = 'flex';

    // Render cart items
    cartItems.innerHTML = cart.map(item => {
      const currentPrice = getCurrentPricePerGram(item.metal);
      const itemTotal = currentPrice * item.weight * item.quantity;
      return `
        <div class="cart-item" data-metal="${item.metal}" data-weight="${item.weight}">
          <div class="cart-item-info">
            <h4>${item.metal.charAt(0).toUpperCase() + item.metal.slice(1)} - ${item.weight}g</h4>
            <p class="cart-item-price">${formatCartMoney(currentPrice)} per gram</p>
          </div>
          <div class="cart-item-controls">
            <div class="quantity-controls">
              <button class="qty-btn" data-action="decrease" data-metal="${item.metal}" data-weight="${item.weight}">−</button>
              <input type="number" class="qty-input" value="${item.quantity}" min="1" data-metal="${item.metal}" data-weight="${item.weight}" />
              <button class="qty-btn" data-action="increase" data-metal="${item.metal}" data-weight="${item.weight}">+</button>
            </div>
            <div class="cart-item-total">${formatCartMoney(itemTotal)}</div>
            <button class="remove-btn" data-metal="${item.metal}" data-weight="${item.weight}" aria-label="Remove item">×</button>
          </div>
        </div>
      `;
    }).join('');

    // Update total
    cartTotal.textContent = formatCartMoney(calculateCartTotal());

    // Add event listeners for cart controls
    attachCartEventListeners();
  }

  // Attach event listeners to cart item controls
  function attachCartEventListeners() {
    // Quantity buttons
    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const metal = e.target.dataset.metal;
        const weight = parseInt(e.target.dataset.weight);
        const action = e.target.dataset.action;
        const item = cart.find(i => i.metal === metal && i.weight === weight);
        if (item) {
          const newQty = action === 'increase' ? item.quantity + 1 : item.quantity - 1;
          updateCartItem(metal, weight, newQty);
        }
      });
    });

    // Quantity inputs
    document.querySelectorAll('.qty-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const metal = e.target.dataset.metal;
        const weight = parseInt(e.target.dataset.weight);
        const newQty = parseInt(e.target.value) || 1;
        updateCartItem(metal, weight, newQty);
      });
    });

    // Remove buttons
    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const metal = e.target.dataset.metal;
        const weight = parseInt(e.target.dataset.weight);
        removeFromCart(metal, weight);
      });
    });
  }

  // Show cart notification
  function showCartNotification(metal, weight) {
    // Simple notification - you can enhance this with a toast/snackbar
    console.log(`Added ${metal} ${weight}g to cart`);
  }

  // Cart modal controls
  const cartToggle = document.querySelector('.cart-toggle');
  const cartModal = document.getElementById('cartModal');
  const cartModalClose = document.getElementById('cartModalClose');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function openCartModal() {
    if (!cartModal) return;
    renderCart();
    cartModal.classList.add('show');
    cartModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeCartModal() {
    if (!cartModal) return;
    cartModal.classList.remove('show');
    cartModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  cartToggle?.addEventListener('click', openCartModal);
  cartModalClose?.addEventListener('click', closeCartModal);
  cartModal?.querySelector('.modal-backdrop')?.addEventListener('click', closeCartModal);
  clearCartBtn?.addEventListener('click', clearCart);
  checkoutBtn?.addEventListener('click', () => {
    alert('Checkout functionality coming soon! Your cart total is: ' + formatCartMoney(calculateCartTotal()));
  });

  // Initialize cart on page load
  loadCart();

  // Configuration for form submission services
  const OWNER_EMAIL = 'info@naveenbullion.example'; // update to your email
  const FORM_ENDPOINT = null; // e.g., 'https://formspree.io/f/XXXXXXXX'
  const API_EMAIL_ENDPOINT = null; // e.g., 'https://your-worker.example.com/send-email'
  // EmailJS config (fill these to enable direct sending)
  const EMAILJS_PUBLIC_KEY = ''; // e.g., 'YOUR_PUBLIC_KEY'
  const EMAILJS_SERVICE_ID = ''; // e.g., 'service_xxxxx'
  const EMAILJS_TEMPLATE_ID = ''; // e.g., 'template_xxxxx'
  // Web3Forms config
  const WEB3FORMS_ACCESS_KEY = ''; // Get from https://web3forms.com/dashboard
  
  // Authentication API config
  const AUTH_API_ENDPOINT = null; // e.g., 'https://your-api.example.com/auth' or Firebase/Supabase URL
  const USE_LOCALSTORAGE_AUTH = true; // Set to false when you have a real backend
  
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
    
    // Update spot price references
    const goldSpotEl = document.getElementById('goldSpotPrice');
    const silverSpotEl = document.getElementById('silverSpotPrice');
    if (goldSpotEl) {
      const goldVal = quotesUSD.gold != null ? quotesUSD.gold * rate : null;
      goldSpotEl.textContent = formatMoney(goldVal, ccy);
    }
    if (silverSpotEl) {
      const silverVal = quotesUSD.silver != null ? quotesUSD.silver * rate : null;
      silverSpotEl.textContent = formatMoney(silverVal, ccy);
    }

    // Update product prices (per gram prices for gold and silver)
    updateProductPrices('gold', rate);
    updateProductPrices('silver', rate);

    // Update existing quote cards if they exist
    ['gold','silver','platinum','palladium'].forEach(sym => {
      const priceEl = document.getElementById(ids[sym]?.price);
      const deltaEl = document.getElementById(ids[sym]?.delta);
      if (priceEl) {
        const usd = quotesUSD[sym];
        const prev = prevUSD[sym];
        const val = usd != null ? usd * rate : null;
        priceEl.textContent = formatMoney(val, ccy);
        setDelta(deltaEl, usd, prev);
      }
    });
  }

  // Update product prices in the catalog
  function updateProductPrices(metal, rate) {
    const pricePerGram = getCurrentPricePerGram(metal);
    const ccy = currencyEl ? currencyEl.value : 'INR';
    
    // Update all product cards for this metal
    [5, 10, 50, 100].forEach(weight => {
      const priceEl = document.querySelector(`[data-price-target="${metal}-${weight}"]`);
      if (priceEl) {
        const totalPrice = pricePerGram * weight;
        priceEl.textContent = formatMoney(totalPrice, ccy);
      }
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
  const successModal = document.getElementById('successModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTitleEl = document.getElementById('modalTitle');
  const modalTextEl = successModal?.querySelector('.modal-card p');

  function getVal(id) { return (document.getElementById(id)?.value || '').trim(); }
  function setError(id, msg) {
    const el = document.querySelector(`small.error[data-for="${id}"]`);
    if (el) el.textContent = msg || '';
    const field = document.getElementById(id);
    if (field) {
      if (msg) {
        field.classList.add('invalid');
        field.setAttribute('aria-invalid', 'true');
      } else {
        field.classList.remove('invalid');
        field.removeAttribute('aria-invalid');
      }
    }
  }
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function validatePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10; // enforce 10-digit local mobile number
  }
  function validateDateNotPast(dateStr) {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    return d >= today;
  }
  function validatePositiveNumber(val) {
    if (val === '') return false;
    const num = Number(val);
    return Number.isFinite(num) && num > 0;
  }
  function clearErrors(ids) { ids.forEach(id => setError(id, '')); }
  function validateField(id) {
    switch (id) {
      case 'qName': {
        const v = getVal('qName');
        setError('qName', v ? '' : 'Please enter your name');
        break;
      }
      case 'qPhone': {
        const v = getVal('qPhone');
        setError('qPhone', validatePhone(v) ? '' : 'Invalid phone');
        break;
      }
      case 'qEmail': {
        const v = getVal('qEmail');
        setError('qEmail', validateEmail(v) ? '' : 'Invalid email');
        break;
      }
      case 'qMetal':
      case 'qPurity':
      case 'qSide':
      case 'qUnit': {
        const v = getVal(id);
        setError(id, v ? '' : 'Required');
        break;
      }
      case 'qQty': {
        const v = getVal('qQty');
        setError('qQty', validatePositiveNumber(v) ? '' : 'Enter a quantity > 0');
        break;
      }
      case 'qBudget': {
        const v = getVal('qBudget');
        if (v) setError('qBudget', validatePositiveNumber(v) ? '' : 'Enter a valid amount'); else setError('qBudget', '');
        break;
      }
      case 'qCity': {
        const v = getVal('qCity');
        setError('qCity', v ? '' : 'Enter delivery city');
        break;
      }
      case 'qDate': {
        const v = getVal('qDate');
        setError('qDate', validateDateNotPast(v) ? '' : 'Date cannot be in the past');
        break;
      }
      case 'qConsent': {
        const el = document.getElementById('qConsent');
        const ok = !!el && el.checked;
        setError('qConsent', ok ? '' : 'Please consent to be contacted');
        break;
      }
      default: break;
    }
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
    required.forEach(([id]) => setError(id, ''));
    required.forEach(([id, msg]) => {
      const el = document.getElementById(id);
      const val = el?.type === 'checkbox' ? el.checked : (el?.value || '').trim();
      if (!val) { setError(id, msg); ok = false; }
    });
    // Email
    const email = getVal('qEmail');
    if (!validateEmail(email)) { setError('qEmail', 'Invalid email'); ok = false; }
    // Phone
    const phone = getVal('qPhone');
    if (!validatePhone(phone)) { setError('qPhone', 'Invalid phone'); ok = false; }
    // Quantity
    const qty = getVal('qQty');
    if (!validatePositiveNumber(qty)) { setError('qQty', 'Enter a quantity > 0'); ok = false; }
    // Budget optional
    const budget = getVal('qBudget');
    if (budget && !validatePositiveNumber(budget)) { setError('qBudget', 'Enter a valid amount'); ok = false; }
    // Date not past
    const date = getVal('qDate');
    if (date && !validateDateNotPast(date)) { setError('qDate', 'Date cannot be in the past'); ok = false; }
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
  async function submitViaWeb3Forms(summary) {
    if (!WEB3FORMS_ACCESS_KEY) return false;
    try {
      const payload = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: 'Bullion Quote Request',
        from_name: 'Naveen Bullion Website',
        replyto: summary.data.email,
        // include structured fields for convenience
        name: summary.data.name,
        phone: summary.data.phone,
        email: summary.data.email,
        side: summary.data.side,
        metal: summary.data.metal,
        purity: summary.data.purity,
        quantity: summary.data.quantity,
        unit: summary.data.unit,
        budget: summary.data.budget || '—',
        city: summary.data.city,
        date: summary.data.date || '—',
        notes: summary.data.notes || '—'
      };
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      return !!json && json.success === true;
    } catch (e) {
      console.warn('Web3Forms submit failed', e);
      return false;
    }
  }
  async function submitViaAPI(summary) {
    if (!API_EMAIL_ENDPOINT) return false;
    try {
      const res = await fetch(API_EMAIL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(summary.data)
      });
      return res.ok;
    } catch (e) {
      console.warn('API email submit failed', e);
      return false;
    }
  }
  async function submitViaEmailJS(summary) {
    try {
      if (!window.emailjs) return false;
      if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) return false;
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
      const params = {
        to_email: OWNER_EMAIL,
        name: summary.data.name,
        phone: summary.data.phone,
        email: summary.data.email,
        side: summary.data.side,
        metal: summary.data.metal,
        purity: summary.data.purity,
        quantity: `${summary.data.quantity} ${summary.data.unit}`,
        budget: summary.data.budget || '—',
        city: summary.data.city,
        date: summary.data.date || '—',
        notes: summary.data.notes || '—'
      };
      const res = await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
      return !!res && res.status === 200;
    } catch (e) {
      console.warn('EmailJS submit failed', e);
      return false;
    }
  }
  async function handleSubmit(e) {
    e?.preventDefault();
    formStatus && (formStatus.textContent = '');
    if (!validateForm()) { formStatus && (formStatus.textContent = 'Please correct highlighted fields.'); return; }
    const summary = buildSummary();
    let ok = false;
    // Prefer Web3Forms → API endpoint → EmailJS → Formspree; no mail client fallback
    ok = await submitViaWeb3Forms(summary);
    if (!ok) ok = await submitViaAPI(summary);
    if (!ok) ok = await submitViaEmailJS(summary);
    if (!ok) ok = await submitViaFormspree(summary);
    formStatus && (formStatus.textContent = ok ? 'Request submitted successfully.' : 'Submission not configured. Please contact us by phone or WhatsApp.');
    if (successModal) {
      if (ok) {
        modalTitleEl && (modalTitleEl.textContent = 'Request Submitted');
        modalTextEl && (modalTextEl.textContent = 'Thank you! Your details were submitted successfully. We will contact you soon.');
      } else {
        modalTitleEl && (modalTitleEl.textContent = 'Submission Not Configured');
        modalTextEl && (modalTextEl.textContent = 'Your form is valid, but email delivery is not configured. Please reach us via phone or WhatsApp while we set this up.');
      }
      successModal.classList.add('show');
      successModal.setAttribute('aria-hidden', 'false');
      modalCloseBtn?.focus();
    }
  }
  quoteForm?.addEventListener('submit', handleSubmit);
  emailSubmitBtn?.addEventListener('click', (e) => handleSubmit(e));
  // Real-time validation
  const watchIds = ['qName','qPhone','qEmail','qMetal','qPurity','qSide','qQty','qUnit','qBudget','qCity','qDate','qConsent'];
  watchIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const evt = el.type === 'checkbox' ? 'change' : 'input';
    el.addEventListener(evt, () => {
      // digits-only sanitizer for phone
      if (id === 'qPhone') {
        const digits = el.value.replace(/\D/g, '').slice(0, 10);
        if (el.value !== digits) el.value = digits;
      }
      validateField(id);
    });
    el.addEventListener('blur', () => validateField(id));
  });

  // Modal close interactions
  modalCloseBtn?.addEventListener('click', () => {
    successModal?.classList.remove('show');
    successModal?.setAttribute('aria-hidden', 'true');
  });
  successModal?.addEventListener('click', (ev) => {
    if (ev.target === successModal || ev.target.classList.contains('modal-backdrop')) {
      successModal.classList.remove('show');
      successModal.setAttribute('aria-hidden', 'true');
    }
  });

  // ========================================
  // LOGOUT HANDLER
  // ========================================
  
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn?.addEventListener('click', () => {
    sessionStorage.removeItem('currentUser');
    window.location.reload(); // Reload to show auth gate
  });
})();
