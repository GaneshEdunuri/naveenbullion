/* Authentication for separate login/register pages */
(function () {
  // Configuration
  const AUTH_API_ENDPOINT = null; // e.g., 'https://your-api.example.com/auth'
  const USE_LOCALSTORAGE_AUTH = true; // Set to false when you have a real backend

  // Validation helpers
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10;
  }

  function validatePassword(password) {
    return password.length >= 8;
  }

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

  function clearErrors(ids) {
    ids.forEach(id => setError(id, ''));
  }

  // LocalStorage auth (demo mode)
  function registerWithLocalStorage(data) {
    const users = JSON.parse(localStorage.getItem('nbUsers') || '[]');
    const exists = users.find(u => u.email === data.email);
    if (exists) {
      return { success: false, error: 'Email already registered' };
    }
    users.push({
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      password: data.password,
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('nbUsers', JSON.stringify(users));
    return { success: true, user: { name: data.name, email: data.email } };
  }

  function loginWithLocalStorage(email, password) {
    const users = JSON.parse(localStorage.getItem('nbUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }
    return { success: true, user: { name: user.name, email: user.email } };
  }

  // API auth (production mode)
  async function registerWithAPI(data) {
    if (!AUTH_API_ENDPOINT) return { success: false, error: 'API not configured' };
    try {
      const res = await fetch(`${AUTH_API_ENDPOINT}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      return json;
    } catch (e) {
      console.warn('API registration failed', e);
      return { success: false, error: 'Network error' };
    }
  }

  async function loginWithAPI(email, password) {
    if (!AUTH_API_ENDPOINT) return { success: false, error: 'API not configured' };
    try {
      const res = await fetch(`${AUTH_API_ENDPOINT}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const json = await res.json();
      return json;
    } catch (e) {
      console.warn('API login failed', e);
      return { success: false, error: 'Network error' };
    }
  }

  // Registration form handler
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors(['regName', 'regEmail', 'regPhone', 'regPassword', 'regConfirmPassword']);

      const name = (document.getElementById('regName')?.value || '').trim();
      const email = (document.getElementById('regEmail')?.value || '').trim();
      const phone = (document.getElementById('regPhone')?.value || '').trim();
      const password = document.getElementById('regPassword')?.value || '';
      const confirmPassword = document.getElementById('regConfirmPassword')?.value || '';

      let valid = true;
      if (!name) { setError('regName', 'Name is required'); valid = false; }
      if (!validateEmail(email)) { setError('regEmail', 'Invalid email'); valid = false; }
      if (phone && !validatePhone(phone)) { setError('regPhone', 'Invalid phone'); valid = false; }
      if (!validatePassword(password)) { setError('regPassword', 'Minimum 8 characters'); valid = false; }
      if (password !== confirmPassword) { setError('regConfirmPassword', 'Passwords do not match'); valid = false; }

      if (!valid) return;

      const data = { name, email, phone, password };
      const result = USE_LOCALSTORAGE_AUTH ? registerWithLocalStorage(data) : await registerWithAPI(data);

      if (result.success) {
        // Save session
        sessionStorage.setItem('currentUser', JSON.stringify(result.user));
        // Redirect to home
        window.location.href = 'index.html';
      } else {
        setError('regEmail', result.error || 'Registration failed');
      }
    });

    // Real-time validation
    const fields = ['regName', 'regEmail', 'regPhone', 'regPassword', 'regConfirmPassword'];
    fields.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        if (id === 'regPhone') {
          const digits = el.value.replace(/\D/g, '').slice(0, 10);
          if (el.value !== digits) el.value = digits;
        }
        setError(id, '');
      });
    });
  }

  // Login form handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors(['loginEmail', 'loginPassword']);

      const email = (document.getElementById('loginEmail')?.value || '').trim();
      const password = document.getElementById('loginPassword')?.value || '';

      let valid = true;
      if (!validateEmail(email)) { setError('loginEmail', 'Invalid email'); valid = false; }
      if (!password) { setError('loginPassword', 'Password is required'); valid = false; }

      if (!valid) return;

      const result = USE_LOCALSTORAGE_AUTH ? loginWithLocalStorage(email, password) : await loginWithAPI(email, password);

      if (result.success) {
        // Save session
        sessionStorage.setItem('currentUser', JSON.stringify(result.user));
        // Redirect to home
        window.location.href = 'index.html';
      } else {
        setError('loginPassword', result.error || 'Login failed');
      }
    });

    // Real-time validation
    ['loginEmail', 'loginPassword'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => setError(id, ''));
    });
  }
})();
