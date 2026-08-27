/**
 * server/idGenerator.ts
 * 
 * Auto-Generated Unique Prefix ID System for Properties, Societies & Plots
 * Provides concurrency-safe incrementing counters, category mapping,
 * society code derivation, and sequence registry metrics.
 * 
 * ID Formats:
 * - Societies: SOC-0001, SOC-0002, ... with unique society_code (ARG, MCH, RPC, GVE)
 * - Residential Plot: RPL -> [SOCIETY_CODE]-RPL-[NUMBER] (e.g. ARG-RPL-0001)
 * - Commercial Plot:  CPL -> [SOCIETY_CODE]-CPL-[NUMBER] (e.g. ARG-CPL-0001)
 * - Residential Prop: RES -> [SOCIETY_CODE]-RES-[NUMBER] (e.g. ARG-RES-0001)
 * - Commercial Prop:  COM -> [SOCIETY_CODE]-COM-[NUMBER] (e.g. ARG-COM-0001)
 */

export interface IdCounterEntry {
  societyId: string;
  societyCode: string;
  societyName: string;
  category: 'residential_plot' | 'commercial_plot' | 'residential_property' | 'commercial_property' | 'society';
  prefix: 'RPL' | 'CPL' | 'RES' | 'COM' | 'SOC';
  lastNumber: number;
  updatedAt: string;
}

// In-Memory Thread-Safe Counter Registry (synchronized with DB state)
const idCountersStore: Map<string, IdCounterEntry> = new Map();

// Known default society code mappings
const DEFAULT_SOCIETY_CODES: Record<string, { code: string; name: string }> = {
  'soc-nwl-1': { code: 'ARG', name: 'Al-Rehman Garden Narowal' },
  'soc-1': { code: 'ARG', name: 'Al-Rehman Garden Narowal' },
  'soc-nwl-2': { code: 'MCH', name: 'Model City Housing Narowal' },
  'soc-2': { code: 'MCH', name: 'Model City Housing Narowal' },
  'soc-nwl-3': { code: 'RPC', name: 'Royal Palm City Narowal' },
  'soc-3': { code: 'RPC', name: 'Royal Palm City Narowal' },
  'soc-nwl-4': { code: 'GVE', name: 'Green Valley Enclave Shakargarh' },
  'soc-4': { code: 'GVE', name: 'Green Valley Enclave Shakargarh' },
};

// Simple in-process Mutex to guarantee atomic sequential generation under concurrency
let isLocked = false;
const mutexQueue: Array<() => void> = [];

const acquireLock = (): Promise<void> => {
  return new Promise((resolve) => {
    if (!isLocked) {
      isLocked = true;
      resolve();
    } else {
      mutexQueue.push(resolve);
    }
  });
};

const releaseLock = () => {
  if (mutexQueue.length > 0) {
    const next = mutexQueue.shift();
    if (next) next();
  } else {
    isLocked = false;
  }
};

/**
 * Initialize counters from seed data or database state
 */
export function initializeCounters(
  societies: Array<{ id: string; name: string; societyCode?: string }>,
  plots: Array<{ societyId: string; category?: string; propertyId?: string; plotNumber?: string }>,
  properties: Array<{ societyId: string; category?: string; type?: string; propertyId?: string }>
) {
  // 1. Initialize for all societies
  societies.forEach((soc) => {
    const socCode = soc.societyCode || deriveSocietyCode(soc.name);
    const categories: Array<{ cat: IdCounterEntry['category']; prefix: IdCounterEntry['prefix'] }> = [
      { cat: 'residential_plot', prefix: 'RPL' },
      { cat: 'commercial_plot', prefix: 'CPL' },
      { cat: 'residential_property', prefix: 'RES' },
      { cat: 'commercial_property', prefix: 'COM' }
    ];

    categories.forEach(({ cat, prefix }) => {
      const key = `${soc.id}:${cat}`;
      if (!idCountersStore.has(key)) {
        idCountersStore.set(key, {
          societyId: soc.id,
          societyCode: socCode,
          societyName: soc.name,
          category: cat,
          prefix,
          lastNumber: 0,
          updatedAt: new Date().toISOString()
        });
      }
    });
  });

  // 2. Count existing plots
  plots.forEach((plot) => {
    const isCommercial = (plot.category || '').toLowerCase() === 'commercial';
    const catKey: IdCounterEntry['category'] = isCommercial ? 'commercial_plot' : 'residential_plot';
    const key = `${plot.societyId}:${catKey}`;
    const counter = idCountersStore.get(key);

    let num = 0;
    if (plot.propertyId) {
      const match = plot.propertyId.match(/-(\d+)$/);
      if (match) num = parseInt(match[1], 10);
    }

    if (counter) {
      if (num > counter.lastNumber) {
        counter.lastNumber = num;
        counter.updatedAt = new Date().toISOString();
      } else if (num === 0) {
        counter.lastNumber += 1;
        counter.updatedAt = new Date().toISOString();
      }
    }
  });

  // 3. Count existing properties
  properties.forEach((prop) => {
    const prefix = getCategoryPrefix(prop.category, prop.type);
    let catKey: IdCounterEntry['category'] = 'residential_property';
    if (prefix === 'RPL') catKey = 'residential_plot';
    else if (prefix === 'CPL') catKey = 'commercial_plot';
    else if (prefix === 'COM') catKey = 'commercial_property';

    const key = `${prop.societyId}:${catKey}`;
    const counter = idCountersStore.get(key);

    let num = 0;
    if (prop.propertyId) {
      const match = prop.propertyId.match(/-(\d+)$/);
      if (match) num = parseInt(match[1], 10);
    }

    if (counter) {
      if (num > counter.lastNumber) {
        counter.lastNumber = num;
        counter.updatedAt = new Date().toISOString();
      }
    }
  });
}

/**
 * Derive short 2-4 uppercase alphanumeric code from Society Name
 */
export function deriveSocietyCode(societyName?: string, existingCodes: string[] = []): string {
  if (!societyName || !societyName.trim()) return 'GEN';

  const clean = societyName.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
  const words = clean.split(/\s+/).filter(Boolean);

  // Common stop words to ignore
  const stopWords = new Set(['THE', 'AND', 'OF', 'NEAR', 'PHASE', 'SECTOR', 'BLOCK', 'HOUSING', 'SOCIETY', 'CITY', 'ESTATE']);
  
  let candidate = '';
  words.forEach(w => {
    const upper = w.toUpperCase();
    if (!stopWords.has(upper)) {
      candidate += upper[0];
    }
  });

  if (candidate.length < 2) {
    candidate = clean.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase();
  } else if (candidate.length > 4) {
    candidate = candidate.substring(0, 4);
  }

  if (!candidate) candidate = 'SOC';

  // Check collision with existing
  let finalCode = candidate;
  let suffix = 2;
  while (existingCodes.includes(finalCode)) {
    finalCode = `${candidate.substring(0, 2)}${suffix}`;
    suffix++;
  }

  return finalCode;
}

/**
 * Map category/type to standard prefix: RPL, CPL, RES, COM
 */
export function getCategoryPrefix(category?: string, type?: string): 'RPL' | 'CPL' | 'RES' | 'COM' {
  const cat = (category || '').toLowerCase();
  const t = (type || '').toLowerCase();

  // 1. Residential Plot
  if (cat.includes('residential plot') || cat.includes('residential_plot') || (t === 'plot' && !cat.includes('commercial'))) {
    return 'RPL';
  }

  // 2. Commercial Plot
  if (cat.includes('commercial plot') || cat.includes('commercial_plot') || (t === 'commercial' && cat.includes('plot'))) {
    return 'CPL';
  }

  // 3. Commercial Property (plaza, shop, office)
  if (cat.includes('commercial plaza') || cat.includes('plaza') || cat.includes('shop') || cat.includes('office') || t === 'commercial') {
    return 'COM';
  }

  // 4. Residential Property (house, villa, apartment)
  if (cat.includes('villa') || cat.includes('house') || t === 'house' || t === 'apartment' || cat.includes('apartment')) {
    return 'RES';
  }

  return 'RES';
}

/**
 * Atomic Concurrency-Safe ID Generator
 * Generates [SOCIETY_CODE]-[CATEGORY_PREFIX]-[0000]
 * (e.g. ARG-RES-0001, RPC-RPL-0042, MCH-CPL-0005)
 */
export async function generateUniquePropertyId(params: {
  societyId?: string;
  societyName?: string;
  societyCode?: string;
  category?: string;
  type?: string;
}): Promise<{ propertyId: string; categoryPrefix: string; societyCode: string; sequenceNumber: number }> {
  await acquireLock();

  try {
    const socId = params.societyId || 'soc-gen';
    const prefix = getCategoryPrefix(params.category, params.type);

    let catKey: IdCounterEntry['category'] = 'residential_property';
    if (prefix === 'RPL') catKey = 'residential_plot';
    else if (prefix === 'CPL') catKey = 'commercial_plot';
    else if (prefix === 'COM') catKey = 'commercial_property';

    // Resolve society code
    let socCode = params.societyCode;
    if (!socCode && params.societyId && DEFAULT_SOCIETY_CODES[params.societyId]) {
      socCode = DEFAULT_SOCIETY_CODES[params.societyId].code;
    }
    if (!socCode) {
      socCode = deriveSocietyCode(params.societyName || 'Society');
    }

    const key = `${socId}:${catKey}`;
    let counter = idCountersStore.get(key);

    if (!counter) {
      counter = {
        societyId: socId,
        societyCode: socCode,
        societyName: params.societyName || 'Housing Society',
        category: catKey,
        prefix,
        lastNumber: 0,
        updatedAt: new Date().toISOString()
      };
      idCountersStore.set(key, counter);
    }

    // Increment atomically (Never reuse numbers, strictly increment)
    counter.lastNumber += 1;
    counter.updatedAt = new Date().toISOString();
    counter.societyCode = socCode;

    const sequenceNumber = counter.lastNumber;
    const paddedNumber = String(sequenceNumber).padStart(4, '0');
    const propertyId = `${socCode}-${prefix}-${paddedNumber}`;

    return {
      propertyId,
      categoryPrefix: prefix,
      societyCode: socCode,
      sequenceNumber
    };
  } finally {
    releaseLock();
  }
}

/**
 * Preview what the next ID would be WITHOUT incrementing counter
 */
export function previewNextPropertyId(params: {
  societyId?: string;
  societyName?: string;
  societyCode?: string;
  category?: string;
  type?: string;
}): { nextPropertyId: string; categoryPrefix: string; societyCode: string; currentCount: number } {
  const socId = params.societyId || 'soc-gen';
  const prefix = getCategoryPrefix(params.category, params.type);

  let catKey: IdCounterEntry['category'] = 'residential_property';
  if (prefix === 'RPL') catKey = 'residential_plot';
  else if (prefix === 'CPL') catKey = 'commercial_plot';
  else if (prefix === 'COM') catKey = 'commercial_property';

  let socCode = params.societyCode;
  if (!socCode && params.societyId && DEFAULT_SOCIETY_CODES[params.societyId]) {
    socCode = DEFAULT_SOCIETY_CODES[params.societyId].code;
  }
  if (!socCode) {
    socCode = deriveSocietyCode(params.societyName || 'Society');
  }

  const key = `${socId}:${catKey}`;
  const counter = idCountersStore.get(key);
  const currentCount = counter ? counter.lastNumber : 0;
  const nextNum = currentCount + 1;
  const paddedNumber = String(nextNum).padStart(4, '0');

  return {
    nextPropertyId: `${socCode}-${prefix}-${paddedNumber}`,
    categoryPrefix: prefix,
    societyCode: socCode,
    currentCount
  };
}

/**
 * Get all counter records for the Super Admin / Society Admin Registry
 */
export function getAllIdCounters(): IdCounterEntry[] {
  return Array.from(idCountersStore.values()).sort((a, b) => {
    if (a.societyCode !== b.societyCode) return a.societyCode.localeCompare(b.societyCode);
    return a.prefix.localeCompare(b.prefix);
  });
}
