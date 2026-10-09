import { getSupabase } from './supabase';

/** WBS: System admin — audit log of key actions. */
export async function logAudit(
  actorId: string | null,
  actorEmail: string | null,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: string,
): Promise<void> {
  try {
    const supabase = getSupabase();
    if (!supabase) return;
    await supabase.from('audit_logs').insert({
      actor_id: actorId,
      actor_email: actorEmail,
      action,
      entity_type: entityType ?? null,
      entity_id: entityId ?? null,
      details: details ?? null,
    });
  } catch {
    // audit logging must never break the main flow
  }
}

export interface AuditEntry {
  id: string;
  actor_email: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: string | null;
  created_at: string;
}

export async function fetchAuditLogs(limit = 200): Promise<AuditEntry[]> {
  const supabase = getSupabase();
  if (!supabase) return [];
  const { data } = await supabase
    .from('audit_logs')
    .select('id, actor_email, action, entity_type, entity_id, details, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data as AuditEntry[]) ?? [];
}

/** WBS: System admin — key/value system settings. */
export async function fetchSettings(): Promise<Record<string, string>> {
  const supabase = getSupabase();
  if (!supabase) return {};
  const { data } = await supabase.from('system_settings').select('key, value');
  const out: Record<string, string> = {};
  for (const r of (data as { key: string; value: string }[]) ?? []) out[r.key] = r.value;
  return out;
}

export async function saveSetting(key: string, value: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Database not connected');
  const { error } = await supabase
    .from('system_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw error;
}
