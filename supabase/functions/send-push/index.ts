// Supabase Edge Function: send-push
// Sends web push notifications via Firebase Cloud Messaging (HTTP v1 API).
// Required secret: FCM_SERVICE_ACCOUNT (full service-account JSON).
// Body: { tokens?: string|string[], user_ids?: string|string[], title: string, body: string }
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { create } from 'https://deno.land/x/djwt@v3.0.2/mod.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function pemToKey(pem: string): Promise<CryptoKey> {
  const b64 = pem
    .replace(/-----(BEGIN|END) PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return crypto.subtle.importKey(
    'pkcs8',
    bytes.buffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
}

async function getAccessToken(sa: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const key = await pemToKey(sa.private_key);
  const jwt = await create(
    { alg: 'RS256', typ: 'JWT' },
    {
      iss: sa.client_email,
      sub: sa.client_email,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
      scope: 'https://www.googleapis.com/auth/firebase.messaging',
    },
    key,
  );
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await resp.json();
  if (!data.access_token) throw new Error('FCM access-token exchange failed');
  return data.access_token as string;
}

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
    const { tokens, user_ids, title, body } = await req.json();
    if (!title || !body) return json({ error: 'title and body are required' }, 400);

    const saRaw = Deno.env.get('FCM_SERVICE_ACCOUNT');
    if (!saRaw) return json({ error: 'Push notifications are not configured' }, 500);
    const sa = JSON.parse(saRaw);

    let targets: string[] = [];
    if (tokens) targets = Array.isArray(tokens) ? tokens : [tokens];

    if (targets.length === 0 && user_ids) {
      const ids = Array.isArray(user_ids) ? user_ids : [user_ids];
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const list = ids.map((id: string) => `"${id}"`).join(',');
      const r = await fetch(
        `${supabaseUrl}/rest/v1/push_tokens?select=token&user_id=in.(${list})`,
        { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } },
      );
      const rows = await r.json();
      if (Array.isArray(rows)) targets = rows.map((x: { token: string }) => x.token);
    }

    if (targets.length === 0) return json({ sent: 0, note: 'no push tokens found' });

    const accessToken = await getAccessToken(sa);
    const projectId = sa.project_id as string;
    let sent = 0;
    const errors: string[] = [];
    for (const t of targets) {
      const resp = await fetch(
        `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: { token: t, notification: { title, body } },
          }),
        },
      );
      if (resp.ok) {
        sent++;
      } else {
        const e = await resp.json().catch(() => ({}));
        const msg =
          (e as { error?: { message?: string } }).error?.message || resp.statusText;
        errors.push(msg);
      }
    }
    return json({ sent, total: targets.length, errors: errors.slice(0, 3) });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
