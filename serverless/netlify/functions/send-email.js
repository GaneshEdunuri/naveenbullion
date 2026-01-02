// Netlify Function: Send email via Resend API
// 1) In Netlify, set environment variable RESEND_API_KEY
// 2) Deploy site with this function under netlify/functions
// 3) Set API_EMAIL_ENDPOINT in assets/js/app.js to /.netlify/functions/send-email

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const data = JSON.parse(event.body || '{}');
    const to = process.env.OWNER_EMAIL || data.to_email || 'info@naveenbullion.example';
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
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
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
      return { statusCode: 500, body: txt || 'Email send failed' };
    }
    return { statusCode: 200, body: 'OK' };
  } catch (e) {
    return { statusCode: 400, body: 'Bad Request' };
  }
}
