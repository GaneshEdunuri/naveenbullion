// Cloudflare Worker: Send email via Resend API
// 1) Create a Worker, set ENV var RESEND_API_KEY
// 2) Deploy and set API_EMAIL_ENDPOINT in assets/js/app.js to this worker URL

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
    try {
      const data = await request.json();
      const to = env.OWNER_EMAIL || data.to_email || 'info@naveenbullion.example';
      const subject = 'Bullion Quote Request';
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
      const bodyText = lines.join('\n');

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'Naveen Bullion <no-reply@naveenbullion.example>',
          to: [to],
          subject,
          text: bodyText
        })
      });
      if (!res.ok) {
        const txt = await res.text();
        return new Response(txt || 'Email send failed', { status: 500 });
      }
      return new Response('OK', { status: 200 });
    } catch (e) {
      return new Response('Bad Request', { status: 400 });
    }
  }
};
