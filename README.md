# Naveen Bullion & Jewellery — Static Website

A modern, responsive static website to showcase bullion trading and jewellery services. Includes live market quotes for gold, silver, platinum, and palladium, plus rich sections for products, services, gallery, testimonials, FAQs, and contact.

## Features
- Live quotes: Gold (XAU), Silver (XAG), Platinum (XPT), Palladium (XPD)
- Currency toggle (INR / USD) with auto FX conversion
- Clean, responsive design with accessible components
- Products, services, gallery with SVG assets
- Testimonials, FAQs, and contact with mailto/WhatsApp CTA
 - Quote form: Collects bullion requirements; sends via Web3Forms/API/EmailJS/Formspree

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
