# Naveen Bullion & Jewellery — Static Website

A modern, responsive static website to showcase bullion trading and jewellery services. Includes live market quotes for gold, silver, platinum, and palladium, plus rich sections for products, services, gallery, testimonials, FAQs, and contact.

## Features
- Live quotes: Gold (XAU), Silver (XAG), Platinum (XPT), Palladium (XPD)
- Currency toggle (INR / USD) with auto FX conversion
- Clean, responsive design with accessible components
- Products, services, gallery with SVG assets
- Testimonials, FAQs, and contact with mailto/WhatsApp CTA
 - Quote form: Collects bullion requirements and sends via email or Formspree

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
	 - Update `OWNER_EMAIL` in `assets/js/app.js` to your address.
	 - Optional: create a free Formspree form and set `FORM_ENDPOINT` (e.g., `https://formspree.io/f/XXXXXXX`) for direct submissions without opening an email client.

## Notes
- Quotes are for quick reference only; not for execution.
- TradingView embed requires internet connectivity.
- All SVGs are custom-made for royalty-free usage.

## Deploy
- Host on GitHub Pages, Netlify, Vercel, or any static server.
- For GitHub Pages: push this folder to a repo and enable Pages from the `main` branch (root).

## Form Services (Optional)
- Formspree: Sign up, create a form, copy the endpoint, and paste into `FORM_ENDPOINT` in `assets/js/app.js`. Submissions will be emailed to you and visible in your Formspree dashboard.
- EmailJS: Alternatively, integrate EmailJS by adding their SDK and using your service/template IDs; reach out if you want me to wire this in.
