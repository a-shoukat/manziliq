// Supabase Edge Function: send-sms
// Deploy via Supabase Dashboard → Edge Functions → send-sms
// Required secrets: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }
  try {
    const { to, body } = await req.json();
    if (!to || !body) {
      return new Response(JSON.stringify({ error: 'to and body are required' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const from = Deno.env.get('TWILIO_PHONE_NUMBER');
    if (!accountSid || !authToken || !from) {
      return new Response(JSON.stringify({ error: 'Twilio is not configured on the server' }), {
        status: 500,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const params = new URLSearchParams({ To: to, From: from, Body: body });
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    const data = await resp.json();
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: data.message || 'Twilio API error' }), {
        status: resp.status,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ sid: data.sid, status: data.status }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
