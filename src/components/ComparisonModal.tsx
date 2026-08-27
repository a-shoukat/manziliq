import React from 'react';
import { Property } from '../types';
import { X, Check, MapPin, Building2, CheckCircle2 } from 'lucide-react';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  compareList: Property[];
  onBookNow: (property: Property) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  compareList,
  onBookNow
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full p-6 text-white shadow-2xl relative my-8">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="bg-amber-500/20 text-amber-400 font-bold text-xs px-2 py-0.5 rounded border border-amber-500/30">
            Side-by-Side Analysis
          </span>
          <h2 className="text-2xl font-black font-[Outfit] mt-1">Property Comparison Matrix</h2>
          <p className="text-xs text-slate-400">Comparing {compareList.length} properties</p>
        </div>

        {compareList.length === 0 ? (
          <p className="text-slate-400 text-sm">No properties selected for comparison.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr>
                  <th className="p-3 bg-slate-800/80 text-slate-400 font-bold w-1/4 rounded-tl-xl border-b border-slate-700">
                    Feature / Spec
                  </th>
                  {compareList.map(item => (
                    <th key={item.id} className="p-3 bg-slate-800/40 text-white font-bold w-1/4 border-b border-slate-700">
                      <div className="space-y-2">
                        <img src={item.images[0]} alt={item.title} className="w-full h-28 rounded-lg object-cover" />
                        <div className="text-sm font-bold truncate">{item.title}</div>
                        <div className="text-base font-black text-amber-400 font-[Outfit]">
                          PKR {item.pricePKR.toLocaleString('en-PK')}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800 text-xs">
                <tr>
                  <td className="p-3 font-semibold text-slate-400">Location</td>
                  {compareList.map(item => (
                    <td key={item.id} className="p-3 text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span>{item.location}</span>
                      </div>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-400">Society / Developer</td>
                  {compareList.map(item => (
                    <td key={item.id} className="p-3 text-emerald-400 font-semibold">
                      {item.societyName}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-400">Area Size</td>
                  {compareList.map(item => (
                    <td key={item.id} className="p-3 font-bold text-white">
                      {item.sizeMarla} Marla ({item.sizeMarla * 225} Sq. Ft)
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-400">Rate per Marla</td>
                  {compareList.map(item => (
                    <td key={item.id} className="p-3 text-amber-300 font-mono font-bold">
                      PKR {Math.round(item.pricePKR / item.sizeMarla).toLocaleString('en-PK')} / Marla
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-400">Bedrooms & Baths</td>
                  {compareList.map(item => (
                    <td key={item.id} className="p-3 text-slate-300">
                      {item.bedrooms ? `${item.bedrooms} Beds, ${item.bathrooms} Baths` : 'Plot / Open Land'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-400">Amenities</td>
                  {compareList.map(item => (
                    <td key={item.id} className="p-3 text-slate-300">
                      <ul className="space-y-1">
                        {item.amenities.map((a, idx) => (
                          <li key={idx} className="flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="p-3 font-semibold text-slate-400">Action</td>
                  {compareList.map(item => (
                    <td key={item.id} className="p-3">
                      <button
                        onClick={() => { onBookNow(item); onClose(); }}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-lg text-xs"
                      >
                        Book Property
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
