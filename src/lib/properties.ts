import { getSupabase } from './supabase';
import type { Property } from '../types';

export async function fetchProperties(): Promise<{
  list: Property[];
}> {
  const supabase = getSupabase();
  if (!supabase) return { list: [] };
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !data) {
    return { list: [] };
  }
  return { list: data as Property[] };
}

export async function fetchProperty(id: string): Promise<Property | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from('properties').select('*').eq('id', id).single();
  return (data as Property) ?? null;
}

export async function createProperty(
  p: Omit<Property, 'id' | 'created_at' | 'owner_id'>,
  ownerId: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Database not connected');
  const { error } = await supabase.from('properties').insert({ ...p, owner_id: ownerId });
  if (error) throw error;
}

export function formatPrice(n: number): string {
  if (n >= 10000000) return `PKR ${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `PKR ${(n / 100000).toFixed(1)} Lakh`;
  return `PKR ${n.toLocaleString()}`;
}
