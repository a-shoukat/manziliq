import { getSupabase } from './supabase';

/** Send a real SMS via Twilio (through the send-sms Edge Function). */
export async function sendSms(to: string, body: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Database not connected' };
  try {
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: { to, body },
    });
    if (error) return { ok: false, error: error.message };
    const d = data as { error?: string; sid?: string } | null;
    if (d?.error) return { ok: false, error: d.error };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'SMS failed' };
  }
}
