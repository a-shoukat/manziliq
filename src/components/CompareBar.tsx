import React from 'react';
import { Property, Plot } from '../types';
import { SlidersHorizontal, X, ArrowRight, Scale } from 'lucide-react';

interface CompareBarProps {
  compareList: (Property | Plot | any)[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onOpenModal: () => void;
}

export const CompareBar: React.FC<CompareBarProps> = ({
  compareList,
  onRemove,
  onClear,
  onOpenModal
}) => {
  if (compareList.length === 0) return null;

  return (
    <div id="compare-floating-bar" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 border border-amber-500/40 text-white rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-md flex items-center gap-4 max-w-2xl w-[92vw]">
      
      <div className="flex items-center gap-2 pr-2 border-r border-slate-800 shrink-0">
        <Scale className="w-5 h-5 text-amber-400" />
        <div className="hidden sm:block">
          <p className="text-xs font-bold font-[Outfit]">Plot Comparison</p>
          <p className="text-[10px] text-slate-400 font-mono">{compareList.length} of 3 selected</p>
        </div>
      </div>

      {/* Selected Items */}
      <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1">
        {compareList.map(item => (
          <div 
            key={item.id}
            className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs whitespace-nowrap"
          >
            <span className="font-bold text-white max-w-[120px] truncate">
              {item.plotNumber ? `Plot #${item.plotNumber}` : item.title}
            </span>
            <button 
              onClick={() => onRemove(item.id)}
              className="text-slate-400 hover:text-white p-0.5"
              title="Remove"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          id="btn-compare-bar-clear"
          onClick={onClear}
          className="text-xs text-slate-400 hover:text-white px-2 py-1 transition cursor-pointer"
        >
          Clear
        </button>

        <button
          id="btn-compare-bar-open"
          onClick={onOpenModal}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <span>Compare Matrix</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
