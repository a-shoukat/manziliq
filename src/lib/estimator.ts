import { getSupabase } from './supabase';

export interface EstimateInput {
  city: string;
  area: string;
  sizeMarla: number;
  category: 'residential' | 'commercial';
  bedrooms: number | null;
  society: string;
}

export interface EstimateResult {
  low: number;
  mid: number;
  high: number;
  method: 'ai' | 'local';
  reasoning: string;
  samples: number;
}

/** Local heuristic: avg price/marla from society plots + marketplace, ±15% band. */
export async function estimateLocal(input: EstimateInput): Promise<EstimateResult> {
  const supabase = getSupabase();
  const rates: number[] = [];

  if (supabase) {
    const { data: plots } = await supabase
      .from('plots')
      .select('base_price, size_marla')
      .eq('category', input.category)
      .gt('size_marla', 0)
      .gt('base_price', 0)
      .limit(200);
    for (const p of (plots as { base_price: number; size_marla: number }[]) ?? []) {
      rates.push(Number(p.base_price) / Number(p.size_marla));
    }
    const { data: props } = await supabase
      .from('properties')
      .select('price, plot_size_marla')
      .eq('category', input.category)
      .ilike('city', `%${input.city}%`)
      .gt('plot_size_marla', 0)
      .gt('price', 0)
      .limit(200);
    for (const p of (props as { price: number; plot_size_marla: number }[]) ?? []) {
      rates.push(Number(p.price) / Number(p.plot_size_marla));
    }
  }

  // fallback base rates (PKR per marla) when no data
  const fallback = input.category === 'commercial' ? 2200000 : 950000;
  const avg = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : fallback;
  const mid = Math.round(avg * input.sizeMarla);

  return {
    low: Math.round(mid * 0.85),
    mid,
    high: Math.round(mid * 1.15),
    method: 'local',
    reasoning:
      rates.length > 0
        ? `Based on ${rates.length} comparable listings (avg PKR ${Math.round(avg).toLocaleString()}/marla).`
        : 'No comparable data yet — estimate uses regional baseline rates.',
    samples: rates.length,
  };
}

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

export function isAiConfigured(): boolean {
  return !!GEMINI_KEY && !GEMINI_KEY.includes('your-');
}

/** Gemini-powered estimate with local fallback. */
export async function estimatePrice(input: EstimateInput): Promise<EstimateResult> {
  const local = await estimateLocal(input);
  if (!isAiConfigured()) return local;

  try {
    const prompt = `You are a Pakistani real-estate valuer. Estimate the market price in PKR for: ${input.sizeMarla} marla ${input.category} property in ${input.area}, ${input.city}${input.society ? ` (${input.society})` : ''}${input.bedrooms ? `, ${input.bedrooms} bedrooms` : ''}. Local baseline suggests around PKR ${local.mid.toLocaleString()}. Reply ONLY with JSON: {"low": number, "mid": number, "high": number, "reasoning": "one short sentence"}. No markdown, no extra text.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      },
    );
    if (!res.ok) throw new Error('Gemini request failed');
    const json = await res.json();
    const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
    if (!parsed.mid) throw new Error('Bad AI response');
    return {
      low: Math.round(Number(parsed.low)),
      mid: Math.round(Number(parsed.mid)),
      high: Math.round(Number(parsed.high)),
      method: 'ai',
      reasoning: String(parsed.reasoning ?? ''),
      samples: local.samples,
    };
  } catch {
    return local;
  }
}
