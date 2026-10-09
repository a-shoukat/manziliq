// Supabase Edge Function: send-whatsapp
// Sends WhatsApp messages via Meta WhatsApp Business Cloud API (free tier: 1,000 convos/month).
// Required secrets: WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TOKEN (permanent system-user token).
// Body: { to: string (digits only, e.g. "923001234567"), template?: string, language?: string, text?: string }
// - template (default "hello_world"): pre-approved template for business-initiated messages.
// - text: free-form text; only delivers inside an active 24h customer-service window.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
const GRAPH_VERSION = 'v22.0';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }
  const json = (obj: unknown, status = 200) =>
    new Response(JSON.stringify(obj), {
      status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  try {
    const { to, template = 'hello_world', language = 'en_US', text } = await req.json();
    if (!to) return json({ error: 'to (phone number) is required' }, 400);

    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    const token = Deno.env.get('WHATSAPP_TOKEN');
    if (!phoneNumberId || !token) {
      return json({ error: 'WhatsApp is not configured on the server' }, 500);
    }

    const cleanTo = String(to).replace(/\D/g, '');
    const payload = text
      ? {
          messaging_product: 'whatsapp',
          to: cleanTo,
          type: 'text',
          text: { body: String(text).slice(0, 1000), preview_url: false },
        }
      : {
          messaging_product: 'whatsapp',
          to: cleanTo,
          type: 'template',
          template: { name: template, language: { code: language } },
        };

    const resp = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );
    const data = await resp.json();
    if (!resp.ok) {
      const msg =
        (data as { error?: { message?: string } }).error?.message || 'WhatsApp API error';
      return json({ error: msg }, resp.status);
    }
    return json({ ok: true, id: (data as { messages?: { id: string }[] }).messages?.[0]?.id });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
