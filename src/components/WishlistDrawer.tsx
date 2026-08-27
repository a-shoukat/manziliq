import React from 'react';
import { Property } from '../types';
import { X, Heart, Trash2, ArrowRight, MapPin, Building2 } from 'lucide-react';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: Property[];
  onRemove: (propertyId: string) => void;
  onSelectProperty: (property: Property) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlist,
  onRemove,
  onSelectProperty
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-md h-full shadow-2xl flex flex-col text-white border-l border-slate-800">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="font-bold text-lg font-[Outfit]">Saved Wishlist ({wishlist.length})</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {wishlist.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Heart className="w-12 h-12 mx-auto stroke-1 text-slate-600 mb-2" />
              <p className="text-sm font-semibold">Your wishlist is empty</p>
              <p className="text-xs mt-1">Click the heart icon on any property to save it here for comparison.</p>
            </div>
          ) : (
            wishlist.map(item => (
              <div 
                key={item.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-xl overflow-hidden p-3 flex gap-3 relative group"
              >
                <img 
                  src={item.images[0]} 
                  alt={item.title} 
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-amber-400 tracking-wider">
                    {item.sizeMarla} Marla • {item.type}
                  </span>
                  <h4 className="text-sm font-bold text-white truncate">{item.title}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    <span>{item.location}</span>
                  </p>
                  <p className="text-sm font-extrabold text-amber-400 font-[Outfit] mt-1">
                    PKR {item.pricePKR.toLocaleString('en-PK')}
                  </p>
                </div>

                <div className="flex flex-col justify-between items-end">
                  <button
                    onClick={() => onRemove(item.id)}
                    className="text-slate-400 hover:text-rose-400 p-1"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => { onSelectProperty(item); onClose(); }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 p-1.5 rounded-lg text-xs font-bold"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
