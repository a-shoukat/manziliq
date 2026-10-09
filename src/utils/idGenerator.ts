/**
 * src/utils/idGenerator.ts
 * 
 * Auto-Generated Unique Prefix ID System Utility
 * Handles standard formatting, prefix categorization, society code extraction,
 * and live ID preview calculation for the ManzilIQ platform.
 */

import { Society, Plot, Property, IdCounter } from '../types';

export const PREFIX_LABELS: Record<string, { label: string; bgClass: string; textClass: string; borderClass: string }> = {
  SOC: {
    label: 'Housing Society',
    bgClass: 'bg-indigo-50',
    textClass: 'text-indigo-800',
    borderClass: 'border-indigo-200'
  },
  RPL: {
    label: 'Residential Plot',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-800',
    borderClass: 'border-emerald-200'
  },
  CPL: {
    label: 'Commercial Plot',
    bgClass: 'bg-purple-50',
    textClass: 'text-purple-800',
    borderClass: 'border-purple-200'
  },
  RES: {
    label: 'Residential Built',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-800',
    borderClass: 'border-blue-200'
  },
  COM: {
    label: 'Commercial Plaza/Shop',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-800',
    borderClass: 'border-amber-200'
  }
};

export function formatSocietyCode(code?: string): string {
  if (!code) return 'SOC';
  return code.toUpperCase().trim().replace(/[^A-Z0-9]/g, '').substring(0, 4);
}

/**
 * Derive short 2-4 uppercase code from Society Name
 */
export function deriveSocietyCode(societyName?: string, existingCodes: string[] = []): string {
  if (!societyName || !societyName.trim()) return 'GEN';

  // Specific hardcoded short codes for Narowal district societies
  const lower = societyName.toLowerCase();
  if (lower.includes('al-rehman') || lower.includes('al rehman')) return 'ARG';
  if (lower.includes('model city')) return 'MCH';
  if (lower.includes('royal palm')) return 'RPC';
  if (lower.includes('green valley')) return 'GVE';

  const clean = societyName.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
  const words = clean.split(/\s+/).filter(Boolean);

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
export function getCategoryPrefix(category?: any, type?: any): 'RPL' | 'CPL' | 'RES' | 'COM' {
  const cat = typeof category === 'string' ? category.toLowerCase() : String(category || '').toLowerCase();
  const t = typeof type === 'string' ? type.toLowerCase() : String(type || '').toLowerCase();

  if (cat.includes('residential plot') || cat.includes('residential_plot') || (t === 'plot' && !cat.includes('commercial'))) {
    return 'RPL';
  }
  if (cat.includes('commercial plot') || cat.includes('commercial_plot') || (t === 'commercial' && cat.includes('plot'))) {
    return 'CPL';
  }
  if (cat.includes('commercial plaza') || cat.includes('plaza') || cat.includes('shop') || cat.includes('office') || t === 'commercial') {
    return 'COM';
  }
  if (cat.includes('villa') || cat.includes('house') || t === 'house' || t === 'apartment' || cat.includes('apartment')) {
    return 'RES';
  }

  return 'RES';
}

/**
 * Calculate the next auto-generated unique ID preview in the client
 */
export function previewNextUniqueId(
  society: Society | string | undefined | null,
  category: any = '',
  type: any = '',
  existingProperties: Property[] = [],
  existingPlots: Plot[] = []
): string {
  let socCode = 'SOC';
  if (typeof society === 'string') {
    socCode = society.trim() || 'SOC';
  } else if (society && typeof society === 'object') {
    socCode = society.societyCode || (society as any).code || deriveSocietyCode(society.name || 'Society');
  }

  const prefix = getCategoryPrefix(category, type);

  // Count existing items in same society and category
  let maxSeq = 0;

  const socId = typeof society === 'object' && society ? society.id : null;
  const socName = typeof society === 'object' && society ? society.name : null;

  const plotsList = Array.isArray(existingPlots) ? existingPlots : [];
  const propsList = Array.isArray(existingProperties) ? existingProperties : [];

  if (prefix === 'RPL' || prefix === 'CPL') {
    const isCommercial = prefix === 'CPL';
    plotsList.forEach(p => {
      if (!p) return;
      if (!socId || p.societyId === socId || (p.societyName && socName && p.societyName === socName)) {
        const plotIsComm = String(p.category || '').toLowerCase() === 'commercial';
        if (plotIsComm === isCommercial && p.propertyId) {
          const match = String(p.propertyId).match(/-(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxSeq) maxSeq = num;
          }
        }
      }
    });
  }

  propsList.forEach(p => {
    if (!p) return;
    if (!socId || p.societyId === socId || (p.societyName && socName && p.societyName === socName)) {
      const pPrefix = getCategoryPrefix(p.category, p.type);
      if (pPrefix === prefix && p.propertyId) {
        const match = String(p.propertyId).match(/-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxSeq) maxSeq = num;
        }
      }
    }
  });

  const nextNum = maxSeq + 1;
  const padded = String(nextNum).padStart(4, '0');
  const prefixId = `${socCode}-${prefix}-${padded}`;

  return prefixId;
}

/**
 * Compute ID Counters Registry statistics from client store
 */
export function computeIdCountersStats(
  societies: Society[],
  properties: Property[],
  plots: Plot[]
): IdCounter[] {
  const map = new Map<string, IdCounter>();

  societies.forEach(soc => {
    const socCode = soc.societyCode || deriveSocietyCode(soc.name);
    const categories: Array<{ cat: string; prefix: string }> = [
      { cat: 'residential_plot', prefix: 'RPL' },
      { cat: 'commercial_plot', prefix: 'CPL' },
      { cat: 'residential_property', prefix: 'RES' },
      { cat: 'commercial_property', prefix: 'COM' }
    ];

    categories.forEach(({ cat, prefix }) => {
      const key = `${soc.id}:${cat}`;
      map.set(key, {
        id: `counter-${key}`,
        societyId: soc.id,
        societyName: soc.name,
        societyCode: socCode,
        category: cat,
        prefix,
        lastNumber: 0,
        updatedAt: new Date().toISOString()
      });
    });
  });

  // Calculate plot numbers
  plots.forEach(plot => {
    const isCommercial = (plot.category || '').toLowerCase() === 'commercial';
    const cat = isCommercial ? 'commercial_plot' : 'residential_plot';
    const key = `${plot.societyId}:${cat}`;
    const counter = map.get(key);

    let num = 0;
    if (plot.propertyId) {
      const match = plot.propertyId.match(/-(\d+)$/);
      if (match) num = parseInt(match[1], 10);
    }

    if (counter) {
      if (num > counter.lastNumber) counter.lastNumber = num;
    }
  });

  // Calculate property numbers
  properties.forEach(prop => {
    const prefix = getCategoryPrefix(prop.category, prop.type);
    let cat = 'residential_property';
    if (prefix === 'RPL') cat = 'residential_plot';
    else if (prefix === 'CPL') cat = 'commercial_plot';
    else if (prefix === 'COM') cat = 'commercial_property';

    const key = `${prop.societyId}:${cat}`;
    const counter = map.get(key);

    let num = 0;
    if (prop.propertyId) {
      const match = prop.propertyId.match(/-(\d+)$/);
      if (match) num = parseInt(match[1], 10);
    }

    if (counter) {
      if (num > counter.lastNumber) counter.lastNumber = num;
    }
  });

  return Array.from(map.values()).sort((a, b) => {
    if (a.societyCode !== b.societyCode) return a.societyCode.localeCompare(b.societyCode);
    return a.prefix.localeCompare(b.prefix);
  });
}
