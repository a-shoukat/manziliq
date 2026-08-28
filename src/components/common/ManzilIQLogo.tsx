import React from 'react';

export interface ManzilIQLogoProps {
  variant?: 'full' | 'horizontal' | 'compact' | 'icon' | 'badge' | 'hero';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  theme?: 'light' | 'dark' | 'auto';
  showTagline?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ManzilIQLogo: React.FC<ManzilIQLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  theme = 'light',
  showTagline = true,
  className = '',
  onClick
}) => {
  // Size mapping with larger, highly visible dimensions
  const sizeConfig = {
    xs: { iconSize: 32, textScale: 'text-sm', subScale: 'text-[9px]' },
    sm: { iconSize: 40, textScale: 'text-base', subScale: 'text-[10px]' },
    md: { iconSize: 48, textScale: 'text-xl', subScale: 'text-[11px]' },
    lg: { iconSize: 64, textScale: 'text-2xl', subScale: 'text-xs' },
    xl: { iconSize: 84, textScale: 'text-3xl', subScale: 'text-sm' },
    '2xl': { iconSize: 120, textScale: 'text-5xl', subScale: 'text-base' },
  }[size];

  const isDark = theme === 'dark';
  const textColorManzil = isDark ? 'text-white' : 'text-slate-950';
  const textColorTagline = isDark ? 'text-slate-300' : 'text-slate-600';
  const houseColor = isDark ? '#FFFFFF' : '#0F172A';
  const windowColor = isDark ? '#38BDF8' : '#0F172A';

  // Crisp, high-contrast, scalable SVG Emblem designed for crystal-clear visibility at any size
  const renderCrestSvg = (dimension: number) => (
    <svg 
      width={dimension} 
      height={dimension} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105 select-none"
      style={{ minWidth: dimension, minHeight: dimension }}
    >
      <defs>
        {/* Luxury Gold Linear Gradients */}
        <linearGradient id={`goldGrad-${theme}-${size}`} x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        <linearGradient id={`goldBright-${theme}-${size}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        <filter id={`goldShadow-${theme}-${size}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#D97706" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* 1. BOLD GOLDEN CRESCENT ARC (Thick, highly visible curve) */}
      <path 
        d="M 52 14
           C 30 15, 12 32, 12 55
           C 12 78, 30 94, 55 94
           C 68 94, 78 89, 86 81
           C 74 86, 62 86, 50 84
           C 33 81, 21 68, 21 53
           C 21 38, 33 24, 52 14 Z" 
        fill={`url(#goldGrad-${theme}-${size})`}
        filter={`url(#goldShadow-${theme}-${size})`}
      />

      {/* 2. HOUSE SILHOUETTE: Chimney + Gable Roof (Bold thick strokes) */}
      {/* Chimney */}
      <rect x="58" y="29" width="6" height="12" fill={houseColor} rx="1" />
      
      {/* Main Roof Pitch & Overhang */}
      <path 
        d="M 23 50 L 49 26 L 75 50 L 71 53 L 49 32 L 27 53 Z" 
        fill={houseColor} 
      />

      {/* 3. 4-PANE WINDOW (Clear, crisp geometric squares) */}
      <g transform="translate(43, 38)">
        <rect x="0" y="0" width="5.5" height="5.5" fill={windowColor} rx="0.8" />
        <rect x="7" y="0" width="5.5" height="5.5" fill={windowColor} rx="0.8" />
        <rect x="0" y="7" width="5.5" height="5.5" fill={windowColor} rx="0.8" />
        <rect x="7" y="7" width="5.5" height="5.5" fill={windowColor} rx="0.8" />
      </g>

      {/* 4. THE 'IQ' TECH EMBLEM */}
      {/* Bold Serif 'I' with circuit nodes */}
      <g transform="translate(68, 52)">
        {/* I stem */}
        <path d="M 0 0 L 12 0 L 12 3 L 8 3 L 8 21 L 12 21 L 12 24 L 0 24 L 0 21 L 4 21 L 4 3 L 0 3 Z" fill={houseColor} />
        {/* Gold Circuit Trace on I */}
        <circle cx="6" cy="8" r="1.5" fill="#F59E0B" />
        <circle cx="6" cy="16" r="1.5" fill="#F59E0B" />
        <line x1="6" y1="8" x2="6" y2="16" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
      </g>

      {/* Bold Serif 'Q' with AI Neural Core */}
      <g transform="translate(78, 50)">
        {/* Q Outer Body */}
        <circle cx="12" cy="13" r="9.5" stroke={houseColor} strokeWidth="3.5" fill="none" />
        {/* Q Tail */}
        <path d="M 16 18 L 22 25 L 18 26 L 13 20" fill={houseColor} />
        {/* Gold Circuit Node inside Q */}
        <circle cx="12" cy="13" r="3.5" fill={`url(#goldBright-${theme}-${size})`} />
        <circle cx="12" cy="13" r="1.8" fill={isDark ? '#0F172A' : '#FFFFFF'} />
      </g>
    </svg>
  );

  // Variant: Icon Only
  if (variant === 'icon') {
    return (
      <div 
        onClick={onClick} 
        className={`inline-flex items-center justify-center ${className} ${onClick ? 'cursor-pointer' : ''}`}
        title="MANZIL IQ"
      >
        {renderCrestSvg(sizeConfig.iconSize)}
      </div>
    );
  }

  // Variant: Luxury Rounded Badge Container (Guarantees 100% visibility on any background)
  if (variant === 'badge') {
    return (
      <div 
        onClick={onClick} 
        className={`inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-slate-900 border-2 border-amber-400/60 shadow-lg shadow-amber-500/15 group select-none ${className} ${onClick ? 'cursor-pointer hover:border-amber-400' : ''}`}
        title="MANZIL IQ — Discover • Manage • Decide Smarter"
      >
        {renderCrestSvg(sizeConfig.iconSize)}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-white text-base sm:text-lg font-black tracking-tight font-[Outfit]">
              MANZIL
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-base sm:text-lg font-black font-[Outfit]">
              IQ
            </span>
          </div>
          <span className="text-[9px] font-bold text-amber-300 uppercase tracking-widest mt-0.5">
            AI Real Estate Portal
          </span>
        </div>
      </div>
    );
  }

  // Variant: Hero Showcase Block (For landing page hero & prominent banners)
  if (variant === 'hero') {
    return (
      <div 
        onClick={onClick} 
        className={`inline-flex flex-col sm:flex-row items-center gap-4 sm:gap-5 px-6 py-4 rounded-3xl bg-slate-900/90 border-2 border-amber-400/50 backdrop-blur-xl shadow-2xl shadow-black/60 group select-none ${className} ${onClick ? 'cursor-pointer' : ''}`}
      >
        {/* Large Crest Icon */}
        <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-400/30">
          {renderCrestSvg(sizeConfig.iconSize * 1.2)}
        </div>

        {/* Text & Tagline */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-white text-2xl sm:text-3xl font-black tracking-tight font-[Outfit]">
              MANZIL
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 text-2xl sm:text-3xl font-black font-[Outfit]">
              IQ
            </span>
            <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs ml-1">
              OFFICIAL
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1">
            <span>DISCOVER</span>
            <span className="w-1 h-1 rounded-full bg-amber-400" />
            <span>MANAGE</span>
            <span className="w-1 h-1 rounded-full bg-amber-400" />
            <span>DECIDE SMARTER</span>
          </div>

          <p className="text-slate-400 text-[9px] sm:text-[10px] font-medium tracking-wide mt-0.5">
            AI-POWERED PROPERTY & SOCIETY MANAGEMENT PLATFORM
          </p>
        </div>
      </div>
    );
  }

  // Variant: Full Vertically Stacked (Identical to Original Artwork)
  if (variant === 'full') {
    return (
      <div 
        onClick={onClick} 
        className={`flex flex-col items-center text-center group select-none p-4 rounded-3xl ${isDark ? 'bg-slate-900/80 border border-slate-800' : 'bg-white/90 border border-slate-200'} shadow-sm ${className} ${onClick ? 'cursor-pointer' : ''}`}
      >
        {/* Crest Icon */}
        <div className="mb-3 p-2 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          {renderCrestSvg(sizeConfig.iconSize * 1.4)}
        </div>

        {/* Wordmark: MANZIL (Black/White) IQ (Gold) */}
        <div className="flex items-center tracking-tight font-[Outfit] font-black leading-none">
          <span className={`${textColorManzil} text-3xl sm:text-4xl tracking-tight`}>
            MANZIL
          </span>
          <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-3xl sm:text-4xl tracking-tight font-black">
            IQ
          </span>
        </div>

        {/* Divider & Tagline */}
        {showTagline && (
          <div className="mt-3 space-y-1.5 max-w-xs w-full">
            <div className="flex items-center justify-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">
              <span>DISCOVER</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>MANAGE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>DECIDE SMARTER</span>
            </div>
            
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
            
            <p className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${textColorTagline} leading-snug`}>
              AI-POWERED PROPERTY & SOCIETY MANAGEMENT PLATFORM
            </p>
          </div>
        )}
      </div>
    );
  }

  // Variant: Compact Horizontal (Wordmark only without tagline)
  if (variant === 'compact') {
    return (
      <div 
        onClick={onClick} 
        className={`flex items-center gap-2.5 group select-none ${className} ${onClick ? 'cursor-pointer' : ''}`}
      >
        {renderCrestSvg(sizeConfig.iconSize)}
        <div className="flex items-baseline tracking-tight font-[Outfit] font-black leading-none">
          <span className={`${textColorManzil} ${sizeConfig.textScale} tracking-tight font-black`}>
            MANZIL
          </span>
          <span className={`ml-1 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 ${sizeConfig.textScale} tracking-tight font-black`}>
            IQ
          </span>
        </div>
      </div>
    );
  }

  // Variant: Horizontal (Default Nav & Header Brand Display - Ultra-Visible)
  return (
    <div 
      onClick={onClick} 
      className={`flex items-center gap-3 group select-none ${className} ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Icon Emblem Container with Gold Glow Accent */}
      <div className="shrink-0 p-1 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/80 border border-amber-300/80 shadow-xs group-hover:border-amber-400 group-hover:shadow-md transition-all">
        {renderCrestSvg(sizeConfig.iconSize)}
      </div>

      {/* Typography & Subtitles */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-2 leading-none">
          <div className="flex items-baseline tracking-tight font-[Outfit] font-black">
            <span className={`${textColorManzil} text-xl sm:text-2xl tracking-tight font-black group-hover:text-amber-600 transition-colors`}>
              MANZIL
            </span>
            <span className="ml-1 text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-xl sm:text-2xl tracking-tight font-black">
              IQ
            </span>
          </div>

          <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shadow-2xs">
            PK
          </span>
        </div>

        {showTagline && (
          <p className={`text-[10px] sm:text-[11px] ${textColorTagline} font-bold tracking-tight truncate mt-1`}>
            Discover • Manage • Decide Smarter
          </p>
        )}
      </div>
    </div>
  );
};
