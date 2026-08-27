import React, { useState, useMemo } from 'react';
import { Plot, Society, UserRole } from '../../types';
import { 
  MapPin, 
  Search, 
  Filter, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  Building2, 
  ShieldCheck,
  ChevronRight,
  Info,
  DollarSign,
  FileText,
  UserCheck,
  X
} from 'lucide-react';

interface InteractivePlotMapProps {
  plots: Plot[];
  societies?: Society[];
  selectedSocietyId?: string;
  userRole?: UserRole;
  onSelectPlot?: (plot: Plot) => void;
  onInitiateBooking?: (plot: Plot) => void;
  onUpdatePlotStatus?: (plotId: string, newStatus: 'available' | 'reserved' | 'sold') => void;
  roleAccent?: 'indigo' | 'emerald' | 'teal' | 'amber';
}

export const InteractivePlotMap: React.FC<InteractivePlotMapProps> = ({
  plots = [],
  societies = [],
  selectedSocietyId,
  userRole = 'buyer',
  onSelectPlot,
  onInitiateBooking,
  onUpdatePlotStatus,
  roleAccent = 'emerald'
}) => {
  const [activeSocietyId, setActiveSocietyId] = useState<string>(
    selectedSocietyId || (societies[0]?.id ?? 'soc-1')
  );
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectedPlot, setInspectedPlot] = useState<Plot | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const activeSociety = societies.find(s => s.id === activeSocietyId) || societies[0];

  // Filter plots for selected society and criteria
  const filteredPlots = useMemo(() => {
    return plots.filter(plot => {
      if (activeSocietyId && plot.societyId && plot.societyId !== activeSocietyId) {
        return false;
      }
      if (selectedSector !== 'all' && plot.sector !== selectedSector) {
        return false;
      }
      if (selectedStatus !== 'all') {
        if (selectedStatus === 'disputed') {
          if (!plot.isDisputed) return false;
        } else {
          if (plot.status !== selectedStatus) return false;
        }
      }
      if (selectedSize !== 'all' && String(plot.sizeMarla) !== selectedSize) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesNo = plot.plotNumber.toLowerCase().includes(q);
        const matchesBlock = plot.block?.toLowerCase().includes(q);
        const matchesSector = plot.sector.toLowerCase().includes(q);
        if (!matchesNo && !matchesBlock && !matchesSector) return false;
      }
      return true;
    });
  }, [plots, activeSocietyId, selectedSector, selectedStatus, selectedSize, searchQuery]);

  // Statistics
  const societyPlots = plots.filter(p => !activeSocietyId || p.societyId === activeSocietyId);
  const availableCount = societyPlots.filter(p => p.status === 'available' && !p.isDisputed).length;
  const reservedCount = societyPlots.filter(p => p.status === 'reserved' && !p.isDisputed).length;
  const soldCount = societyPlots.filter(p => p.status === 'sold' && !p.isDisputed).length;
  const disputedCount = societyPlots.filter(p => p.isDisputed).length;

  const handlePlotClick = (plot: Plot) => {
    setInspectedPlot(plot);
    if (onSelectPlot) {
      onSelectPlot(plot);
    }
  };

  const getStatusColor = (plot: Plot) => {
    if (plot.isDisputed) {
      return {
        bg: 'bg-slate-500 hover:bg-slate-600',
        text: 'text-white',
        border: 'border-slate-600',
        badge: 'bg-slate-100 text-slate-700 border-slate-300',
        label: 'Disputed / Blocked',
        hex: '#64748b'
      };
    }
    switch (plot.status) {
      case 'available':
        return {
          bg: 'bg-emerald-500 hover:bg-emerald-600',
          text: 'text-white',
          border: 'border-emerald-600',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-300',
          label: 'Available',
          hex: '#10b981'
        };
      case 'reserved':
        return {
          bg: 'bg-amber-400 hover:bg-amber-500',
          text: 'text-slate-950',
          border: 'border-amber-500',
          badge: 'bg-amber-50 text-amber-800 border-amber-300',
          label: 'Reserved',
          hex: '#f59e0b'
        };
      case 'sold':
        return {
          bg: 'bg-rose-500 hover:bg-rose-600',
          text: 'text-white',
          border: 'border-rose-600',
          badge: 'bg-rose-50 text-rose-700 border-rose-300',
          label: 'Sold Out',
          hex: '#ef4444'
        };
      default:
        return {
          bg: 'bg-slate-400',
          text: 'text-white',
          border: 'border-slate-500',
          badge: 'bg-slate-50 text-slate-700 border-slate-200',
          label: 'Unknown',
          hex: '#94a3b8'
        };
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col space-y-0">
      
      {/* Top Header & Society Selector */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Layers className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>Interactive Masterplan & Demarcation Grid</span>
              </h2>
              <p className="text-xs text-slate-500">
                Live color-coded status mapping across blocks and sectors.
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 shadow-xs inline-block" />
            <span className="text-slate-700">Available ({availableCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-400 shadow-xs inline-block" />
            <span className="text-slate-700">Reserved ({reservedCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-rose-500 shadow-xs inline-block" />
            <span className="text-slate-700">Sold ({soldCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-500 shadow-xs inline-block" />
            <span className="text-slate-700">Disputed ({disputedCount})</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
        {/* Society Dropdown if multiple */}
        {societies.length > 1 && (
          <select
            value={activeSocietyId}
            onChange={(e) => setActiveSocietyId(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-800 outline-none"
          >
            {societies.map(soc => (
              <option key={soc.id} value={soc.id}>{soc.name}</option>
            ))}
          </select>
        )}

        {/* Sector Filter */}
        <select
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 outline-none"
        >
          <option value="all">All Sectors & Blocks</option>
          <option value="Sector A">Sector A</option>
          <option value="Sector B">Sector B</option>
          <option value="Sector C">Sector C</option>
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 outline-none"
        >
          <option value="all">All Statuses</option>
          <option value="available">🟢 Available Only</option>
          <option value="reserved">🟡 Reserved Only</option>
          <option value="sold">🔴 Sold Only</option>
          <option value="disputed">⚪ Disputed / Frozen</option>
        </select>

        {/* Size Filter */}
        <select
          value={selectedSize}
          onChange={(e) => setSelectedSize(e.target.value)}
          className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-slate-700 outline-none"
        >
          <option value="all">All Plot Sizes</option>
          <option value="3">3 Marla</option>
          <option value="5">5 Marla</option>
          <option value="7">7 Marla</option>
          <option value="10">10 Marla</option>
          <option value="20">1 Kanal (20 Marla)</option>
        </select>

        {/* Search by Number */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Plot # (e.g. 42-A)..."
            className="w-full text-xs pl-8 pr-2.5 py-2 bg-white border border-slate-200 rounded-lg outline-none"
          />
        </div>
      </div>

      {/* Main Grid & Interactive Visual Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        
        {/* Left Interactive Canvas / Grid Stage */}
        <div className="lg:col-span-2 p-5 bg-slate-950 text-white min-h-[480px] flex flex-col justify-between relative overflow-hidden">
          {/* Header on map */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-amber-400">
                {activeSociety?.name || 'Al-Rehman Garden Phase 1'} • Official LDA Grid
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setZoomLevel(z => Math.max(0.8, z - 0.1))}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1 text-slate-300">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(z => Math.min(1.4, z + 0.1))}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Plots Grid Visualizer */}
          <div className="py-6 flex-1 flex items-center justify-center overflow-auto">
            <div
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              className="transition-transform duration-200 w-full max-w-2xl"
            >
              {filteredPlots.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
                  <p className="text-xs">No plots match the selected filter criteria in this society.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Sector Label Pill */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>NORTH: 100 FT COMMERCIAL BOULEVARD</span>
                    <span>NOC: TMA-NRW-2024-889</span>
                  </div>

                  {/* Grid of Plots */}
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                    {filteredPlots.map((plot) => {
                      const color = getStatusColor(plot);
                      const isInspected = inspectedPlot?.id === plot.id;

                      return (
                        <button
                          key={plot.id}
                          onClick={() => handlePlotClick(plot)}
                          className={`relative h-20 rounded-xl flex flex-col items-center justify-center p-1.5 text-center transition-all cursor-pointer shadow-md ${color.bg} ${color.text} ${
                            isInspected ? 'ring-3 ring-white scale-105 z-10 shadow-lg' : 'hover:scale-102'
                          }`}
                        >
                          <span className="text-[11px] font-extrabold tracking-tight truncate max-w-full">
                            {plot.plotNumber}
                          </span>
                          <span className="text-[10px] opacity-90 font-mono">
                            {plot.sizeMarla}M
                          </span>
                          <span className="text-[8px] uppercase tracking-tighter opacity-80 mt-0.5 font-bold">
                            {plot.isDisputed ? 'Dispute' : plot.status}
                          </span>

                          {plot.isDisputed && (
                            <AlertTriangle className="w-3 h-3 text-white absolute top-1 right-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Main Road Indicator */}
                  <div className="py-2 px-4 bg-slate-900 rounded-xl border border-slate-800 text-center text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                    === 60 FT RESIDENTIAL SECTOR LINK ACCESS ===
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer note on canvas */}
          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Cadastral Land Survey Map</span>
            </span>
            <span>Click any lot for legal demarcation details</span>
          </div>
        </div>

        {/* Right Inspector & Action Panel */}
        <div className="p-5 flex flex-col justify-between space-y-6 bg-slate-50/50">
          {inspectedPlot ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Inspecting Lot Details
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    Plot #{inspectedPlot.plotNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {inspectedPlot.societyName} • {inspectedPlot.sector}
                  </p>
                </div>

                {(() => {
                  const color = getStatusColor(inspectedPlot);
                  return (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${color.badge}`}>
                      {color.label}
                    </span>
                  );
                })()}
              </div>

              {/* Specs Grid */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Sector & Block:</span>
                  <span className="font-semibold text-slate-900">{inspectedPlot.sector} ({inspectedPlot.block || 'Main'})</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Plot Size:</span>
                  <span className="font-semibold text-slate-900">{inspectedPlot.sizeMarla} Marla ({inspectedPlot.sizeSqFt || inspectedPlot.sizeMarla * 225} Sq Ft)</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Dimensions:</span>
                  <span className="font-mono font-semibold text-slate-900">{inspectedPlot.dimensions || '25x45'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Category:</span>
                  <span className="capitalize font-semibold text-slate-900">{inspectedPlot.category || 'Residential'}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Demand:</span>
                  <span className="font-extrabold text-emerald-700 text-sm">PKR {inspectedPlot.pricePKR.toLocaleString('en-PK')}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">20% Downpayment:</span>
                  <span className="font-mono font-semibold text-slate-800">PKR {Math.round(inspectedPlot.pricePKR * 0.20).toLocaleString('en-PK')}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-500">36-Month Installment:</span>
                  <span className="font-mono font-semibold text-slate-800">PKR {Math.round((inspectedPlot.pricePKR * 0.80) / 36).toLocaleString('en-PK')} / mo</span>
                </div>

                {inspectedPlot.isDisputed && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Legal Title Dispute Recorded</span>
                    </div>
                    <p className="text-[11px] text-rose-700">
                      {inspectedPlot.disputeReason || 'Under review by Land Revenue Sub-Registrar. Transactions temporarily frozen.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Status Update for Admin/Society */}
              {(userRole === 'society_admin' || userRole === 'super_admin') && onUpdatePlotStatus && (
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <label className="block text-[11px] font-bold text-slate-700">Admin Status Control:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button
                      onClick={() => onUpdatePlotStatus(inspectedPlot.id, 'available')}
                      className={`py-1.5 text-xs font-bold rounded-lg border ${
                        inspectedPlot.status === 'available' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      onClick={() => onUpdatePlotStatus(inspectedPlot.id, 'reserved')}
                      className={`py-1.5 text-xs font-bold rounded-lg border ${
                        inspectedPlot.status === 'reserved' ? 'bg-amber-500 text-slate-950 border-amber-500' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Reserved
                    </button>
                    <button
                      onClick={() => onUpdatePlotStatus(inspectedPlot.id, 'sold')}
                      className={`py-1.5 text-xs font-bold rounded-lg border ${
                        inspectedPlot.status === 'sold' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Sold
                    </button>
                  </div>
                </div>
              )}

              {/* Public/Buyer Action */}
              {inspectedPlot.status === 'available' && !inspectedPlot.isDisputed && onInitiateBooking && (
                <div className="pt-2">
                  <button
                    onClick={() => onInitiateBooking(inspectedPlot)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Apply for Booking (PKR 100k Token)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 my-auto space-y-2">
              <Layers className="w-8 h-8 mx-auto text-slate-300" />
              <h4 className="text-xs font-bold text-slate-700">No Lot Selected</h4>
              <p className="text-[11px] text-slate-500">
                Click any lot on the visual masterplan canvas to inspect pricing, dimensions, and legal demarcation.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
