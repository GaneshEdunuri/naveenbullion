# Naveen Bullion & Jewellery — Static Website

A modern, responsive static website to showcase bullion trading and jewellery services. Includes live market quotes, e-commerce shopping cart with Razorpay payment gateway, user authentication, and rich sections for products, services, gallery, FAQs, and contact.

## Features
- **E-commerce Shopping Cart**: Add gold/silver products (5g, 10g, 50g, 100g) to cart with live pricing
- **Razorpay Payment Gateway**: Secure online payments with UPI, cards, net banking, wallets
- **Live Market Quotes**: Gold (XAU), Silver (XAG) with real-time pricing
- **User Authentication**: Registration and login system with session management
- Currency toggle (INR / USD) with auto FX conversion
- Clean, responsive design with dark/light theme
- Products, services, gallery with SVG assets
- Quote form: Collects bullion requirements; sends via Web3Forms/API/EmailJS/Formspree
- Floating WhatsApp button for instant contact

## Structure
- `index.html` — main site
- `assets/css/styles.css` — styling
- `assets/js/app.js` — live quotes + interactivity
- `assets/img/*.svg` — royalty-free SVG icons (gold bar, coin, ring, necklace)

## Live Quotes
- Metals spot prices fetched from `https://api.metals.live/v1/spot` (no API key required). If unavailable, the site falls back to sample values.
- FX conversion INR from `https://api.exchangerate.host/latest?base=USD&symbols=INR` (free, no key). If unavailable, it falls back to a reasonable static value.
- A TradingView ticker tape is embedded for quick market glance.

## Run Locally (Windows)
- Open `index.html` directly in your browser, or start a simple server:

```powershell
# Option 1: Python (if installed)
python -m http.server 5500; Start-Process http://localhost:5500

# Option 2: Node.js (if installed)
npx serve . -p 5500; Start-Process http://localhost:5500
```

## Customize
- Brand name and contact: edit header, hero, and contact blocks in `index.html`.
- Replace gallery images: drop your photos into `assets/img/` and update the gallery `<img>` sources.
- Colors and theme: adjust CSS variables in `assets/css/styles.css`.
- WhatsApp and Phone: update `tel:` and `wa.me` links in the Contact section.

### Payment Gateway Setup (Razorpay)
1. **Create Razorpay Account**: Sign up at https://dashboard.razorpay.com/signup
2. **Get API Keys**:
   - Go to Settings → API Keys
   - Generate Test Keys (for testing) or Live Keys (for production)
   - Copy the **Key ID** (starts with `rzp_test_` or `rzp_live_`)
3. **Configure in Code**:
   - Open `assets/js/app.js`
   - Set `RAZORPAY_KEY_ID = 'your_key_id_here'`
   - Update `BUSINESS_NAME`, `CONTACT_EMAIL`, `CONTACT_PHONE`
4. **Testing**:
   - Use test mode cards from https://razorpay.com/docs/payments/payments/test-card-details/
   - Test UPI: success@razorpay
   - Switch to live keys when ready for production

**Important**: Never commit your secret key to GitHub. Only use Key ID in frontend code.

### Email Configuration
 - Quote form destination:
	 - Update `OWNER_EMAIL` in assets/js/app.js to your address.
	 - Web3Forms: set `WEB3FORMS_ACCESS_KEY` in assets/js/app.js (get it from https://web3forms.com/dashboard).
	 - API endpoint: set `API_EMAIL_ENDPOINT` in assets/js/app.js to your deployed serverless email relay.
	 - EmailJS: set `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, and `EMAILJS_TEMPLATE_ID` in assets/js/app.js.
	 - Formspree: set `FORM_ENDPOINT` (e.g., https://formspree.io/f/XXXXXXX) if you prefer their dashboard.

## Notes
- Quotes are for quick reference only; not for execution.
- TradingView embed requires internet connectivity.
- All SVGs are custom-made for royalty-free usage.

## Deploy
- Host on GitHub Pages, Netlify, Vercel, or any static server.
- For GitHub Pages: push this folder to a repo and enable Pages from the `main` branch (root).

## Form Services (Optional)
- Web3Forms (Recommended): Create a free account, get your Access Key from https://web3forms.com/dashboard, and set `WEB3FORMS_ACCESS_KEY` in assets/js/app.js. Submissions are delivered to your configured email and success triggers the modal.
- API Endpoint: Use a serverless function to send emails with a secure API key (so no secrets are exposed in the browser).
	- Samples in serverless/:
		- Cloudflare Worker: serverless/cloudflare/worker.js — set `RESEND_API_KEY` and deploy; set `API_EMAIL_ENDPOINT` in assets/js/app.js to the worker URL.
		- Netlify Function: serverless/netlify/functions/send-email.js — set `RESEND_API_KEY` in Netlify env; set `API_EMAIL_ENDPOINT` to `/.netlify/functions/send-email`.
	- In assets/js/app.js, set `API_EMAIL_ENDPOINT` to your deployed endpoint.
- EmailJS: SDK is already included via CDN in index.html. Set `EMAILJS_PUBLIC_KEY`, `EMAILJS_SERVICE_ID`, and `EMAILJS_TEMPLATE_ID` in assets/js/app.js.
- Formspree: Sign up, create a form, copy the endpoint, and paste into `FORM_ENDPOINT` in assets/js/app.js.

### Submission Order
Web3Forms → API Endpoint → EmailJS → Formspree. If one method fails, the next is attempted automatically.

## Authentication System
The site includes user authentication with separate registration and login pages. **All content is protected and only visible after logging in.**

### Page Structure
- **index.html** - Main site (protected, requires login)
- **register.html** - New user registration page
- **login.html** - User login page

### Demo Mode (Default)
By default, `USE_LOCALSTORAGE_AUTH = true` in [assets/js/auth.js](assets/js/auth.js) enables demo mode:
- User accounts stored in browser localStorage
- Passwords stored in plain text (browser only - not sent anywhere)
- Sessions managed via sessionStorage (clears on browser close)
- Perfect for testing without backend setup

**User Flow:**
1. Visit [index.html](index.html) → Auth gate shown with Login/Register options
2. Click **Register** → Redirects to [register.html](register.html)
3. Fill form: Name, Email, Phone (optional), Password (8+ chars), Confirm Password
4. Submit → Account created, session saved, redirected to [index.html](index.html)
5. Full site content and live prices now visible
6. Click **Logout** → Session cleared, auth gate shown again

**Or Login:**
1. Click **Login** from auth gate → Redirects to [login.html](login.html)
2. Enter email and password
3. Submit → Session saved, redirected to [index.html](index.html)

### Production Mode (Backend API)
For production, set `USE_LOCALSTORAGE_AUTH = false` and configure `AUTH_API_ENDPOINT` in [assets/js/auth.js](assets/js/auth.js).

**Required API Endpoints:**
```
POST /auth/register
Body: { name, email, phone, password }
Response: { success: true, user: { name, email } } or { success: false, error: "message" }

POST /auth/login
Body: { email, password }
Response: { success: true, user: { name, email }, token?: "jwt" } or { success: false, error: "message" }
```

**Backend Options:**
1. **Custom API:** Express.js, Django, Flask, etc. Use bcrypt for password hashing and JWT for tokens
2. **Firebase Authentication:** Use Firebase Auth SDK or REST API
3. **Supabase:** Built-in auth with PostgreSQL
4. **Auth0 / Clerk:** Third-party authentication services

### Security Notes
- **Demo mode:** Not secure - use only for local testing
- **Production:** Always hash passwords server-side (never send plain text)
- **HTTPS:** Required for production to protect credentials
- **CORS:** Configure your API to allow requests from your domain
- **Rate limiting:** Implement on backend to prevent brute force attacks
- **Content Protection:** All site content is hidden until user logs in
