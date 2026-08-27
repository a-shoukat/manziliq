import React, { useState } from 'react';
import { Society, Plot, User } from '../../types';
import { 
  Building2, 
  MapPin, 
  ShieldCheck, 
  FileText, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Phone, 
  Download,
  Filter,
  Sparkles,
  Info,
  Scale
} from 'lucide-react';
import { generatePDFDocument } from '../../utils/pdfGenerator';
import { DualLayerPlotMap } from '../../components/society/DualLayerPlotMap';

interface SocietyDetailViewProps {
  society: Society;
  plots: Plot[];
  currentUser?: User;
  onOpenBooking?: (plot: Plot) => void;
  onInitiateBooking?: (target: { id: string; title: string; societyName: string; sector: string; pricePKR: number; sizeMarla: number }) => void;
  onToggleCompare?: (plot: Plot) => void;
  comparedPlotIds?: string[];
  onNavigate: (route: string) => void;
}

export const SocietyDetailView: React.FC<SocietyDetailViewProps> = ({
  society,
  plots = [],
  currentUser,
  onOpenBooking,
  onInitiateBooking,
  onToggleCompare,
  comparedPlotIds = [],
  onNavigate
}) => {
  const societyPlots = (plots || []).filter(p => p.societyId === society.id);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(societyPlots[0] || null);

  const handleBookingAction = (plot: Plot) => {
    if (onOpenBooking) {
      onOpenBooking(plot);
    } else if (onInitiateBooking) {
      onInitiateBooking({
        id: plot.id,
        title: `Plot #${plot.plotNumber} - ${plot.sizeMarla} Marla (${plot.sector})`,
        societyName: society.name,
        sector: plot.sector,
        pricePKR: plot.pricePKR,
        sizeMarla: plot.sizeMarla
      });
    }
  };

  const handleDownloadNOC = () => {
    generatePDFDocument({
      docType: 'noc_certificate',
      buyerName: 'Public Record / Allottee Access',
      buyerPhone: society.contactPhone || '+92 301 4455889',
      plotNumber: 'Overall Masterplan Phase 1',
      societyName: society.name,
      totalPricePKR: 0,
      nocNumber: society.nocNumber,
      date: '2026-08-19'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="society-detail-view-root">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[300px] flex flex-col justify-end p-6 sm:p-10 shadow-xl border border-slate-800">
        <img
          src={society.heroImage}
          alt={society.name}
          className="absolute inset-0 w-full h-full object-cover opacity-35"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>LDA / TMA Approved Housing Project</span>
            </span>
            {society.nocNumber && (
              <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold">
                NOC: {society.nocNumber}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-[Outfit]">{society.name}</h1>
          <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{society.location}</span>
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={handleDownloadNOC}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Download Verified NOC & SECP PDF</span>
            </button>
            <a
              href={`tel:${society.contactPhone}`}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition border border-slate-700"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Society Office: {society.contactPhone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Dual-Layer Interactive Plot Map Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 font-[Outfit]">
            <Layers className="w-6 h-6 text-emerald-800" />
            <span>Dual-Layer Society Map (Google Maps + SVG Masterplan)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Explore real-world GPS coordinates on Google Maps and toggle the high-fidelity SVG Demarcation Grid to inspect plots, check real-time availability, and book online.
          </p>
        </div>

        <DualLayerPlotMap
          society={society}
          plots={societyPlots}
          currentUser={currentUser}
          selectedPlotId={selectedPlot?.id}
          onSelectPlot={(plot) => setSelectedPlot(plot)}
          onBookPlot={handleBookingAction}
          onToggleCompare={onToggleCompare}
          comparedPlotIds={comparedPlotIds}
          initialLayer="svg_masterplan"
        />
      </div>

    </div>
  );
};
