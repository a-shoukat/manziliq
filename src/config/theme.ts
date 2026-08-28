// Central Theme & Branding Configuration for ManzilIQ
// Defines standard colors, typography, and badges to ensure consistency.

export const THEME = {
  colors: {
    // Primary Brand Blue (Trust & Corporate Authority)
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A', // Main Trust Blue
      950: '#172554',
    },
    // Accent Green (Growth, Success, Verified Status)
    accent: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      500: '#22C55E',
      600: '#16A34A', // Main Accent Green
      700: '#15803D',
      800: '#166534',
      900: '#14532D',
    },
    // Warm Gold / Amber (Premium & AI Highlights)
    gold: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
    },
    // Neutral Grays (High-contrast, clean modern UI)
    slate: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A', // Dark Slate
      950: '#020617',
    },
  },
  typography: {
    fontFamily: {
      heading: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
      body: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
    scale: {
      h1: 'text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight',
      h2: 'text-2xl sm:text-3xl font-extrabold tracking-tight',
      h3: 'text-base sm:text-lg font-bold tracking-tight',
      body: 'text-sm sm:text-base leading-relaxed',
      meta: 'text-xs text-slate-500 font-medium',
    }
  },
  badges: {
    noc: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    escrow: 'bg-blue-50 text-blue-800 border border-blue-200',
    ai: 'bg-amber-50 text-amber-900 border border-amber-200',
    statusAvailable: 'bg-emerald-100 text-emerald-900 font-bold',
    statusReserved: 'bg-amber-100 text-amber-900 font-bold',
    statusSold: 'bg-slate-200 text-slate-700 font-bold',
  }
};
