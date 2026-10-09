import { getSupabase } from './supabase';

/** Send a WhatsApp message via the send-whatsapp Edge Function (Meta Cloud API). */
export async function sendWhatsApp(
  to: string,
  opts: { template?: string; language?: string; text?: string } = {},
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Database not connected' };
  try {
    const { data, error } = await supabase.functions.invoke('send-whatsapp', {
      body: { to, ...opts },
    });
    if (error) return { ok: false, error: error.message };
    const d = data as { error?: string; ok?: boolean } | null;
    if (d?.error) return { ok: false, error: d.error };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'WhatsApp send failed' };
  }
}
