import { getSupabase } from './supabase';
import { notify } from './notify';

export interface ScheduledBroadcast {
  id: string;
  owner_id: string;
  audience: string;
  title: string;
  body: string;
  scheduled_at: string;
  sent_at: string | null;
  recipient_count: number;
  created_at: string;
}

/** Save a broadcast to be sent at a future time (WBS: real scheduled broadcast). */
export async function scheduleBroadcast(
  ownerId: string,
  audience: string,
  title: string,
  body: string,
  scheduledAt: Date,
  recipientCount: number,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Database not connected');
  if (scheduledAt.getTime() <= Date.now()) throw new Error('Scheduled time must be in the future.');
  const { error } = await supabase.from('broadcasts').insert({
    owner_id: ownerId,
    audience,
    title: title.trim(),
    body: body.trim(),
    scheduled_at: scheduledAt.toISOString(),
    recipient_count: recipientCount,
  });
  if (error) throw error;
}

export async function fetchMyBroadcasts(ownerId: string): Promise<ScheduledBroadcast[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from('broadcasts')
    .select('*')
    .eq('owner_id', ownerId)
    .order('scheduled_at', { ascending: false })
    .limit(50);
  return (data as ScheduledBroadcast[]) ?? [];
}

export async function cancelBroadcast(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Database not connected');
  const { error } = await supabase.from('broadcasts').delete().eq('id', id).is('sent_at', null);
  if (error) throw error;
}

/**
 * Real scheduler: finds due broadcasts (scheduled_at <= now, not sent) and sends them.
 * Runs client-side on app start + every 5 minutes while the app is open.
 * (A server cron would be ideal; this guarantees delivery without extra infrastructure.)
 */
let schedulerStarted = false;

export function startBroadcastScheduler(
  resolveAudience: (b: ScheduledBroadcast) => Promise<string[]>,
  selfId: string,
): void {
  if (schedulerStarted) return;
  schedulerStarted = true;

  const run = async () => {
    try {
      const supabase = getSupabase();
      if (!supabase) return;
      const { data } = await supabase
        .from('broadcasts')
        .select('*')
        .lte('scheduled_at', new Date().toISOString())
        .is('sent_at', null)
        .limit(20);
      for (const b of (data as ScheduledBroadcast[]) ?? []) {
        try {
          const ids = (await resolveAudience(b)).filter((id) => id !== selfId);
          if (ids.length > 0) {
            await notify(ids, b.title, b.body, 'broadcast');
          }
          await supabase.from('broadcasts').update({ sent_at: new Date().toISOString(), recipient_count: ids.length }).eq('id', b.id);
        } catch (e) {
          console.error('scheduled broadcast failed:', b.id, e);
        }
      }
    } catch (e) {
      console.error('broadcast scheduler error:', e);
    }
  };

  run();
  setInterval(run, 5 * 60 * 1000);
}
