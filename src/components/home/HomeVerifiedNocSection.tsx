import React, { useState } from 'react';
import { Society } from '../../types';
import { 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  FileText, 
  MapPin, 
  Layers, 
  Award, 
  ArrowRight,
  Eye
} from 'lucide-react';
import { NocDocumentViewerModal } from './NocDocumentViewerModal';

interface HomeVerifiedNocSectionProps {
  societies: Society[];
  onSelectSociety: (id: string) => void;
  onToast?: (msg: string) => void;
}

export const HomeVerifiedNocSection: React.FC<HomeVerifiedNocSectionProps> = ({
  societies,
  onSelectSociety,
  onToast,
}) => {
  const [selectedSocietyForNoc, setSelectedSocietyForNoc] = useState<Society | null>(null);

  // Masterplan blueprint mock images for housing societies
  const masterplanImages: Record<string, string> = {
    'soc-1': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=800',
    'soc-2': 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=800',
    'soc-3': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800',
    'soc-4': 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800',
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Legally Audited & Approved</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-[Outfit] text-slate-900 tracking-tight">
            Verified Housing Societies & Masterplans
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl">
            Every society listed on MANZILIQ is strictly verified with LDA, CDA, or local TMA authorities. Click on any NOC badge to view the official legal certificate.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>Zero Bogus Files Policy</span>
        </div>
      </div>

      {/* Grid of Verified Housing Societies */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {societies.map((society) => {
          const masterplanImg = masterplanImages[society.id] || society.heroImage;
          const availableCount = society.availablePlots || 10;
          const totalCount = society.totalPlots || 24;

          return (
            <div
              key={society.id}
              id={`verified-society-card-${society.id}`}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              {/* Media Thumbnail */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                <img
                  src={masterplanImg}
                  alt={society.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30" />

                {/* Top Badge: City */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider border border-slate-700">
                    {society.city}
                  </span>
                </div>

                {/* Top Right: Inventory Counter */}
                <div className="absolute top-3 right-3 z-10">
                  <span className="px-2 py-1 rounded-md bg-emerald-600/90 backdrop-blur-md text-white font-bold text-[10px] shadow-xs">
                    {availableCount} Available
                  </span>
                </div>

                {/* Bottom Overlay Title */}
                <div className="absolute bottom-2.5 left-3 right-3 z-10 text-white">
                  <h3 className="font-bold text-sm truncate">{society.name}</h3>
                  <p className="text-[11px] text-slate-300 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{society.location}</span>
                  </p>
                </div>
              </div>

              {/* Body: NOC details */}
              <div className="p-4 space-y-3.5 flex-1 flex flex-col justify-between">
                
                {/* Clickable Official NOC Certificate Badge */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Government Approval Record
                  </span>
                  
                  <button
                    type="button"
                    id={`btn-view-noc-doc-${society.id}`}
                    onClick={() => setSelectedSocietyForNoc(society)}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold transition cursor-pointer group/btn text-left"
                    title="Click to view full NOC Verification Certificate"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="truncate font-mono text-[11px]">
                        {society.nocNumber || 'LDA/PK/NOC-2023/419'}
                      </span>
                    </div>
                    <Eye className="w-3.5 h-3.5 text-emerald-700 shrink-0 group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>

                {/* Society Stats */}
                <div className="flex items-center justify-between text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="font-medium">Total Society Masterplan:</span>
                  <span className="font-bold text-slate-900">{totalCount} Plots</span>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectSociety(society.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>View Society Masterplan</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for viewing the selected society's NOC document */}
      <NocDocumentViewerModal
        isOpen={Boolean(selectedSocietyForNoc)}
        society={selectedSocietyForNoc}
        onClose={() => setSelectedSocietyForNoc(null)}
        onToast={onToast}
      />
    </div>
  );
};
