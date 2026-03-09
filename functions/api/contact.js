/**
 * Cloudflare Pages Function: POST /api/contact
 * Receives contact form payload and sends email via Resend REST API.
 *
 * Required env (Settings > Variables and Secrets): RESEND_API_KEY, CONTACT_EMAIL
 */

function htmlBody(data) {
  return `
    <h2>Nova poruka s kontakt forme</h2>
    <p><strong>Ime i prezime:</strong> ${escapeHtml(data.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Telefon:</strong> ${escapeHtml(data.phone || '-')}</p>
    <p><strong>Lokacija:</strong> ${escapeHtml(data.propertyInterest || '-')}</p>
    <p><strong>Poruka:</strong></p>
    <p>${escapeHtml(data.message).replace(/\n/g, '<br>')}</p>
    <hr>
    <p><em>Poslano s Krov Mont web stranice</em></p>
  `.trim();
}

function escapeHtml(str) {
  if (str == null) return '';
  const s = String(str);
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const apiKey = env.RESEND_API_KEY;
  const toEmail = env.CONTACT_EMAIL;

  if (!apiKey || !toEmail) {
    return jsonResponse({ success: false, error: 'Server configuration error' }, 500);
  }

  let data;
  try {
    data = await request.json();
  } catch {
    return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
  }

  const name = data.name?.trim();
  const email = data.email?.trim();
  const message = data.message?.trim();

  if (!name || name.length < 2) {
    return jsonResponse({ success: false, error: 'Ime i prezime je obavezno' }, 400);
  }
  if (!email) {
    return jsonResponse({ success: false, error: 'Email adresa je obavezna' }, 400);
  }
  if (!message || message.length < 10) {
    return jsonResponse({ success: false, error: 'Poruka je obavezna (min. 10 znakova)' }, 400);
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Krov Mont <onboarding@resend.dev>',
        to: [toEmail],
        subject: `Kontakt forma: ${name} (${email})`,
        html: htmlBody({
          name,
          email,
          phone: data.phone?.trim(),
          message,
          propertyInterest: data.propertyInterest?.trim(),
        }),
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('[contact] Resend error:', result);
      return jsonResponse(
        { success: false, error: 'Failed to send email', details: result?.message },
        500,
      );
    }

    return jsonResponse({ success: true, id: result?.id });
  } catch (err) {
    console.error('[contact] Error:', err);
    return jsonResponse(
      { success: false, error: 'Failed to send email', details: err?.message },
      500,
    );
  }
}

export async function onRequestGet() {
  return jsonResponse({ success: false, error: 'Method not allowed. Use POST.' }, 405);
}
