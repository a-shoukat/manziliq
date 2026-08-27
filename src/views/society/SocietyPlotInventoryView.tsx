import React, { useState, useMemo } from 'react';
import { Plot, Society, Property, User } from '../../types';
import { 
  Layers, 
  Plus, 
  Search, 
  Filter, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  Trash2,
  Edit2,
  Upload,
  FileSpreadsheet,
  Download,
  X,
  Check,
  ShieldCheck,
  Lock,
  Tag,
  Maximize2,
  MapPin,
  Eye,
  AlertCircle,
  Mic
} from 'lucide-react';
import { CSVPlotUploadModal } from '../../components/society/CSVPlotUploadModal';
import { AddEditPropertyModal } from '../../components/properties/AddEditPropertyModal';
import { DeletePropertyModal } from '../../components/properties/DeletePropertyModal';
import { VoicePropertyListingModal } from '../../components/properties/VoicePropertyListingModal';

interface SocietyPlotInventoryViewProps {
  currentUser?: User;
  society: Society;
  societies?: Society[];
  plots: Plot[];
  properties?: Property[];
  onAddPlot: (plot: Plot) => void;
  onAddProperty?: (property: Property, plotData?: Partial<Plot>) => void;
  onUpdatePlotStatus: (plotId: string, newStatus: 'available' | 'assigned' | 'reserved' | 'sold' | 'disputed') => void;
  onEditPlot?: (updatedPlot: Plot) => void;
  onDeletePlot?: (plotId: string) => void;
  onBulkAddPlots?: (newPlots: Plot[]) => void;
}

export const SocietyPlotInventoryView: React.FC<SocietyPlotInventoryViewProps> = ({
  currentUser,
  society,
  societies = [],
  plots,
  properties = [],
  onAddPlot,
  onAddProperty,
  onUpdatePlotStatus,
  onEditPlot,
  onDeletePlot,
  onBulkAddPlots
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('all');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showFullPropertyModal, setShowFullPropertyModal] = useState(false);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);
  const [deletingPlot, setDeletingPlot] = useState<Plot | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Manual Plot Form State
  const [newPlotNo, setNewPlotNo] = useState('');
  const [newSector, setNewSector] = useState('Sector A');
  const [newBlock, setNewBlock] = useState('Executive Block');
  const [newCustomBlock, setNewCustomBlock] = useState('');
  const [newSizeValue, setNewSizeValue] = useState(5);
  const [newSizeUnit, setNewSizeUnit] = useState<'Marla' | 'Kanal'>('Marla');
  const [newCategory, setNewCategory] = useState<'residential' | 'commercial' | 'plot_file'>('residential');
  const [newPricePKR, setNewPricePKR] = useState(2600000);
  const [newStatus, setNewStatus] = useState<'available' | 'assigned' | 'reserved' | 'sold' | 'disputed'>('available');
  const [newDimensions, setNewDimensions] = useState('25x45');
  const [newFeatures, setNewFeatures] = useState<string[]>(['Main Access Road', 'NOC Verified Demarcation']);
  const [manualFormError, setManualFormError] = useState<string | null>(null);

  // All plots for this society
  const societyPlots = useMemo(() => {
    return plots.filter(p => p.societyId === society.id);
  }, [plots, society.id]);

  // Distinct blocks in this society
  const availableBlocks = useMemo(() => {
    const blocksSet = new Set<string>();
    societyPlots.forEach(p => {
      if (p.block) blocksSet.add(p.block);
    });
    // Add defaults if missing
    ['Executive Block', 'Rose Block', 'Commercial Block', 'Overseas Block'].forEach(b => blocksSet.add(b));
    return Array.from(blocksSet);
  }, [societyPlots]);

  // Filtered plots
  const filteredPlots = useMemo(() => {
    return societyPlots.filter(p => {
      const matchesSearch = 
        p.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.block && p.block.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.sector && p.sector.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.dealerName && p.dealerName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesBlock = selectedBlock === 'all' || p.block === selectedBlock;
      
      const matchesSize = selectedSizeFilter === 'all' || 
        (selectedSizeFilter === '5marla' && p.sizeMarla === 5) ||
        (selectedSizeFilter === '10marla' && p.sizeMarla === 10) ||
        (selectedSizeFilter === '1kanal' && (p.sizeMarla >= 20 || p.sizeUnit === 'Kanal')) ||
        (selectedSizeFilter === 'other' && p.sizeMarla !== 5 && p.sizeMarla !== 10 && p.sizeMarla < 20);

      const matchesCategory = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchesSearch && matchesBlock && matchesSize && matchesCategory && matchesStatus;
    });
  }, [societyPlots, searchTerm, selectedBlock, selectedSizeFilter, selectedCategoryFilter, statusFilter]);

  // Aggregate Metrics for Current Scope (All or Selected Block)
  const currentScopePlots = useMemo(() => {
    if (selectedBlock === 'all') return societyPlots;
    return societyPlots.filter(p => p.block === selectedBlock);
  }, [societyPlots, selectedBlock]);

  const totalCount = currentScopePlots.length;
  const availableCount = currentScopePlots.filter(p => p.status === 'available').length;
  const assignedCount = currentScopePlots.filter(p => p.status === 'assigned').length;
  const reservedCount = currentScopePlots.filter(p => p.status === 'reserved').length;
  const soldCount = currentScopePlots.filter(p => p.status === 'sold').length;
  const disputedCount = currentScopePlots.filter(p => p.status === 'disputed').length;

  // Handle Manual Create Plot with Duplicate Detection (Society + Block + Plot Number)
  const handleCreatePlot = (e: React.FormEvent) => {
    e.preventDefault();
    setManualFormError(null);

    const trimmedPlotNo = newPlotNo.trim();
    if (!trimmedPlotNo) {
      setManualFormError('Please enter a valid plot number (e.g. A-14, 102).');
      return;
    }

    const effectiveBlock = newBlock === 'CUSTOM' ? (newCustomBlock.trim() || 'Executive Block') : newBlock;

    // Strict Duplicate Prevention Check: Society + Block + Plot Number
    const isDuplicate = societyPlots.some(
      p => p.block?.toLowerCase() === effectiveBlock.toLowerCase() &&
           p.plotNumber.toLowerCase() === trimmedPlotNo.toLowerCase()
    );

    if (isDuplicate) {
      setManualFormError(`Duplicate Plot Error: Plot "${trimmedPlotNo}" already exists in ${effectiveBlock} for ${society.name}! Duplicate entries are prohibited.`);
      return;
    }

    // Size calculation
    const isKanal = newSizeUnit === 'Kanal';
    const marla = isKanal ? newSizeValue * 20 : newSizeValue;
    const sqFt = marla * 225;
    const price = Number(newPricePKR);

    const newPlot: Plot = {
      id: `plot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      societyId: society.id,
      societyName: society.name,
      plotNumber: trimmedPlotNo,
      sector: newSector,
      block: effectiveBlock,
      sizeMarla: marla,
      sizeUnit: newSizeUnit,
      sizeValue: newSizeValue,
      sizeSqFt: sqFt,
      pricePKR: price,
      basePrice: price,
      status: newStatus,
      category: newCategory,
      installmentMonths: 36,
      features: newFeatures,
      downPaymentPKR: Math.round(price * 0.20),
      monthlyInstallmentPKR: Math.round((price * 0.80) / 36),
      dimensions: newDimensions || (marla === 5 ? '25x45' : marla === 10 ? '35x65' : '50x90'),
      coordinates: { x: Math.floor(Math.random() * 80) + 10, y: Math.floor(Math.random() * 80) + 10 }
    };

    onAddPlot(newPlot);
    setShowAddModal(false);
    setNewPlotNo('');
    setNotificationMsg({
      type: 'success',
      text: `Successfully added Plot ${newPlot.plotNumber} in ${effectiveBlock}!`
    });
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  // Handle Bulk Add from CSV
  const handleBulkAdd = (validPlots: Plot[]) => {
    if (onBulkAddPlots) {
      onBulkAddPlots(validPlots);
    } else {
      validPlots.forEach(p => onAddPlot(p));
    }

    setNotificationMsg({
      type: 'success',
      text: `Successfully imported ${validPlots.length} valid plots into ${society.name} master inventory!`
    });
    setTimeout(() => setNotificationMsg(null), 6000);
  };

  const handleSaveEditPlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlot || !onEditPlot) return;
    onEditPlot(editingPlot);
    setEditingPlot(null);
    setNotificationMsg({
      type: 'success',
      text: `Plot ${editingPlot.plotNumber} updated successfully.`
    });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleConfirmDelete = () => {
    if (!deletingPlot || !onDeletePlot) return;
    onDeletePlot(deletingPlot.id);
    setDeletingPlot(null);
    setNotificationMsg({
      type: 'success',
      text: `Plot ${deletingPlot.plotNumber} was removed from society inventory.`
    });
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  return (
    <div className="space-y-8">
      
      {/* Toast Notification */}
      {notificationMsg && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold shadow-sm transition-all ${
          notificationMsg.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-rose-50 border-rose-300 text-rose-950'
        }`}>
          <div className="flex items-center gap-2">
            {notificationMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notificationMsg.text}</span>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-slate-400 hover:text-slate-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            <Building2 className="w-4 h-4" />
            <span>{society.name} • Module 2 Operational Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-emerald-800" />
            <span>Master Plot Inventory & Block Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Maintain land records, enforce single-broker lot exclusivity, upload CSV/Excel spreadsheets, and prevent duplicate plot allocations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowVoiceModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-xl text-xs font-black transition shadow-xs hover:shadow-md cursor-pointer flex items-center gap-2 group"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
            </span>
            <Mic className="w-4 h-4 text-slate-950 group-hover:scale-110 transition" />
            <span>Add Property by Voice</span>
          </button>

          <button
            onClick={() => setShowBulkUploadModal(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>CSV / Excel Upload</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Manual Plot Entry</span>
          </button>
        </div>
      </div>

      {/* Block Hierarchy Navigation Selector */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>Housing Society Block Organization Hierarchy</span>
          </div>
          <div className="text-xs text-slate-500">
            Selected Scope: <strong className="text-slate-900">{selectedBlock === 'all' ? 'Entire Masterplan' : selectedBlock}</strong>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedBlock('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
              selectedBlock === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>All Blocks Overview</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${selectedBlock === 'all' ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {societyPlots.length}
            </span>
          </button>

          {availableBlocks.map(blockName => {
            const count = societyPlots.filter(p => p.block === blockName).length;
            const isSelected = selectedBlock === blockName;
            return (
              <button
                key={blockName}
                onClick={() => setSelectedBlock(blockName)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs ring-2 ring-emerald-500'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{blockName}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-emerald-950 text-emerald-100' : 'bg-slate-200 text-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Metric Summary for Selected Scope */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Plots</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Demarcated units</div>
        </div>

        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 shadow-xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Available</div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{availableCount}</div>
          <div className="text-[10px] text-emerald-700 mt-0.5">Open for lotting / sale</div>
        </div>

        <div className="p-4 bg-teal-50/50 rounded-2xl border border-teal-200 shadow-xs">
          <div className="text-[11px] font-bold text-teal-800 uppercase tracking-wider">Assigned to Dealer</div>
          <div className="text-2xl font-black text-teal-900 mt-1">{assignedCount}</div>
          <div className="text-[10px] text-teal-700 mt-0.5">Exclusive broker rights</div>
        </div>

        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-200 shadow-xs">
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Reserved</div>
          <div className="text-2xl font-black text-amber-900 mt-1">{reservedCount}</div>
          <div className="text-[10px] text-amber-700 mt-0.5">Token money paid</div>
        </div>

        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200 shadow-xs">
          <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Sold Out</div>
          <div className="text-2xl font-black text-blue-900 mt-1">{soldCount}</div>
          <div className="text-[10px] text-blue-700 mt-0.5">Allotted & registered</div>
        </div>

        <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-200 shadow-xs">
          <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Disputed / Frozen</div>
          <div className="text-2xl font-black text-rose-900 mt-1">{disputedCount}</div>
          <div className="text-[10px] text-rose-700 mt-0.5">Title review locked</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by plot number, block, sector, dealer..."
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {/* Size Filter */}
          <div>
            <select
              value={selectedSizeFilter}
              onChange={(e) => setSelectedSizeFilter(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">All Sizes (Marla & Kanal)</option>
              <option value="5marla">5 Marla (1,125 Sq. Ft)</option>
              <option value="10marla">10 Marla (2,250 Sq. Ft)</option>
              <option value="1kanal">1 Kanal (20 Marla / 4,500 Sq. Ft)</option>
              <option value="other">Commercial / Custom Sizes</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">All Categories</option>
              <option value="residential">Residential Plots</option>
              <option value="commercial">Commercial Plots</option>
              <option value="plot_file">Plot Files / Affidavit</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="assigned">Assigned to Dealer</option>
              <option value="reserved">Reserved (Token in Progress)</option>
              <option value="sold">Sold Out</option>
              <option value="disputed">Disputed / Frozen</option>
            </select>
          </div>

        </div>

        {/* Active Filter Chips & View Mode Toggle */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
          <div className="text-slate-500 font-medium">
            Showing <strong className="text-slate-900">{filteredPlots.length}</strong> of {societyPlots.length} plots in {society.name}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'table' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Table Grid
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Card View
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table / Cards */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Plot Number</th>
                  <th className="p-4">Block & Sector</th>
                  <th className="p-4">Plot Size</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Base Demand (PKR)</th>
                  <th className="p-4">20% Downpayment</th>
                  <th className="p-4">Status & Dealer</th>
                  <th className="p-4 text-right">Inventory Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPlots.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No plots match the selected filters or block. Click <strong>"+ Manual Plot Entry"</strong> or <strong>"CSV / Excel Upload"</strong> to add demarcations.
                    </td>
                  </tr>
                ) : (
                  filteredPlots.map((plot) => (
                    <tr key={plot.id} className="hover:bg-slate-50/60 transition">
                      
                      {/* Plot Number */}
                      <td className="p-4 font-black text-slate-900 text-sm">
                        <div className="flex items-center gap-1.5">
                          <span>{plot.plotNumber}</span>
                          {plot.status === 'disputed' && (
                            <span className="p-1 rounded bg-rose-100 text-rose-700" title="Under Legal Dispute">
                              <Lock className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Block & Sector */}
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{plot.block || 'Executive Block'}</div>
                        <div className="text-slate-400 text-[11px]">{plot.sector || 'Sector A'} • {plot.dimensions || '25x45'}</div>
                      </td>

                      {/* Plot Size */}
                      <td className="p-4 font-semibold text-slate-800">
                        <div>
                          {plot.sizeUnit === 'Kanal' ? `${plot.sizeValue || (plot.sizeMarla / 20)} Kanal` : `${plot.sizeMarla} Marla`}
                        </div>
                        <div className="text-slate-400 text-[10px]">
                          {plot.sizeSqFt || plot.sizeMarla * 225} Sq. Ft
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          plot.category === 'commercial' ? 'bg-purple-100 text-purple-800' :
                          plot.category === 'plot_file' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {plot.category || 'residential'}
                        </span>
                      </td>

                      {/* Base Price */}
                      <td className="p-4 font-extrabold text-emerald-950">
                        PKR {plot.pricePKR.toLocaleString('en-PK')}
                      </td>

                      {/* 20% Downpayment */}
                      <td className="p-4 font-medium text-slate-600">
                        PKR {(plot.downPaymentPKR || Math.round(plot.pricePKR * 0.20)).toLocaleString('en-PK')}
                      </td>

                      {/* Status & Dealer Allocation */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            plot.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                            plot.status === 'assigned' ? 'bg-teal-100 text-teal-800' :
                            plot.status === 'reserved' ? 'bg-amber-100 text-amber-800' :
                            plot.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {plot.status === 'available' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {plot.status === 'assigned' && <ShieldCheck className="w-3 h-3 text-teal-600" />}
                            {plot.status === 'reserved' && <Clock className="w-3 h-3 text-amber-600" />}
                            {plot.status === 'sold' && <Check className="w-3 h-3 text-blue-600" />}
                            {plot.status === 'disputed' && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                            <span>{plot.status}</span>
                          </span>

                          {plot.dealerName && (
                            <div className="text-[10px] text-teal-900 font-semibold flex items-center gap-1">
                              <span>Broker:</span>
                              <span className="font-bold truncate max-w-[120px]">{plot.dealerName}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* Quick Lifecycle Status Dropdown */}
                          <select
                            value={plot.status}
                            onChange={(e) => onUpdatePlotStatus(plot.id, e.target.value as any)}
                            className="text-[11px] font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-emerald-600 cursor-pointer"
                          >
                            <option value="available">Set: Available</option>
                            <option value="assigned">Set: Assigned</option>
                            <option value="reserved">Set: Reserved</option>
                            <option value="sold">Set: Sold</option>
                            <option value="disputed">Set: Disputed</option>
                          </select>

                          {/* Edit Plot */}
                          {onEditPlot && (
                            <button
                              onClick={() => setEditingPlot(plot)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg transition cursor-pointer"
                              title="Edit Plot Specifications"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Plot */}
                          {onDeletePlot && (
                            <button
                              onClick={() => setDeletingPlot(plot)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                              title="Delete Plot from Inventory"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlots.map((plot) => (
            <div key={plot.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-lg font-black text-slate-900">{plot.plotNumber}</div>
                  <div className="text-xs text-slate-500 font-medium">{plot.block || 'Executive Block'} • {plot.sector}</div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                  plot.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                  plot.status === 'assigned' ? 'bg-teal-100 text-teal-800' :
                  plot.status === 'reserved' ? 'bg-amber-100 text-amber-800' :
                  plot.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {plot.status}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Size:</span>
                  <span className="font-bold text-slate-900">{plot.sizeMarla} Marla ({plot.sizeSqFt || plot.sizeMarla * 225} Sq Ft)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-bold capitalize text-slate-900">{plot.category || 'Residential'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Price:</span>
                  <span className="font-black text-emerald-950">PKR {plot.pricePKR.toLocaleString('en-PK')}</span>
                </div>
                {plot.dealerName && (
                  <div className="flex justify-between text-teal-900">
                    <span className="text-teal-700">Assigned Dealer:</span>
                    <span className="font-bold truncate max-w-[140px]">{plot.dealerName}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <select
                  value={plot.status}
                  onChange={(e) => onUpdatePlotStatus(plot.id, e.target.value as any)}
                  className="text-xs font-bold bg-white border border-slate-200 rounded-xl px-2 py-1.5 outline-none focus:ring-1 focus:ring-emerald-600"
                >
                  <option value="available">Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                  <option value="disputed">Disputed</option>
                </select>

                <div className="flex items-center gap-1">
                  {onEditPlot && (
                    <button
                      onClick={() => setEditingPlot(plot)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {onDeletePlot && (
                    <button
                      onClick={() => setDeletingPlot(plot)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL: Manual Plot Entry */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Manual Plot Demarcation Entry</h3>
                  <p className="text-xs text-slate-300">Add individual plot to {society.name} master inventory</p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlot} className="p-6 space-y-4 text-xs">
              
              {/* Duplicate Prevention Error Alert */}
              {manualFormError && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-950 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-bold">{manualFormError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {/* Plot Number */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Plot Number *</label>
                  <input
                    type="text"
                    required
                    value={newPlotNo}
                    onChange={(e) => {
                      setNewPlotNo(e.target.value);
                      setManualFormError(null);
                    }}
                    placeholder="e.g. A-14, 102, C-05"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 font-bold"
                  />
                </div>

                {/* Sector */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Sector</label>
                  <input
                    type="text"
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
                    placeholder="e.g. Sector A, Sector B"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {/* Block Selection */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Society Block *</label>
                <select
                  value={newBlock}
                  onChange={(e) => setNewBlock(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                >
                  <option value="Executive Block">Executive Block</option>
                  <option value="Rose Block">Rose Block</option>
                  <option value="Commercial Block">Commercial Block</option>
                  <option value="Overseas Block">Overseas Block</option>
                  <option value="CUSTOM">+ Enter Custom Block Name...</option>
                </select>

                {newBlock === 'CUSTOM' && (
                  <input
                    type="text"
                    required
                    value={newCustomBlock}
                    onChange={(e) => setNewCustomBlock(e.target.value)}
                    placeholder="Enter block name (e.g. Diamond Block)"
                    className="w-full mt-2 p-2.5 bg-white border border-emerald-400 rounded-xl outline-none"
                  />
                )}
              </div>

              {/* Size and Unit */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">Plot Size *</label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    required
                    value={newSizeValue}
                    onChange={(e) => setNewSizeValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Unit</label>
                  <select
                    value={newSizeUnit}
                    onChange={(e) => setNewSizeUnit(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                  >
                    <option value="Marla">Marla</option>
                    <option value="Kanal">Kanal</option>
                  </select>
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                    <option value="plot_file">Plot File / Affidavit</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Initial Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                  >
                    <option value="available">Available</option>
                    <option value="assigned">Assigned</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                    <option value="disputed">Disputed</option>
                  </select>
                </div>
              </div>

              {/* Base Price */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Base Demand Price (PKR) *</label>
                <input
                  type="number"
                  required
                  value={newPricePKR}
                  onChange={(e) => setNewPricePKR(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 font-black text-emerald-950"
                />
                <p className="text-[11px] text-slate-400">
                  Calculated 20% Downpayment: <strong>PKR {Math.round(newPricePKR * 0.20).toLocaleString('en-PK')}</strong>
                </p>
              </div>

              {/* Dimensions */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Dimensions (Width x Length in Feet)</label>
                <input
                  type="text"
                  value={newDimensions}
                  onChange={(e) => setNewDimensions(e.target.value)}
                  placeholder="e.g. 25x45, 35x65, 50x90"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                >
                  Save Plot Demarcation
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* CSV Bulk Upload Modal (5-step Workflow) */}
      <CSVPlotUploadModal
        isOpen={showBulkUploadModal}
        onClose={() => setShowBulkUploadModal(false)}
        society={society}
        existingPlots={societyPlots}
        onImportPlots={handleBulkAdd}
      />

      {/* MODAL: Edit Plot */}
      {editingPlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <h3 className="font-bold text-sm">Edit Plot {editingPlot.plotNumber}</h3>
              <button onClick={() => setEditingPlot(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPlot} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Plot Number</label>
                  <input
                    type="text"
                    value={editingPlot.plotNumber}
                    onChange={(e) => setEditingPlot({ ...editingPlot, plotNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Block</label>
                  <input
                    type="text"
                    value={editingPlot.block}
                    onChange={(e) => setEditingPlot({ ...editingPlot, block: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Size (Marla)</label>
                  <input
                    type="number"
                    value={editingPlot.sizeMarla}
                    onChange={(e) => setEditingPlot({ ...editingPlot, sizeMarla: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Price (PKR)</label>
                  <input
                    type="number"
                    value={editingPlot.pricePKR}
                    onChange={(e) => setEditingPlot({ ...editingPlot, pricePKR: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Status</label>
                <select
                  value={editingPlot.status}
                  onChange={(e) => setEditingPlot({ ...editingPlot, status: e.target.value as any })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="available">Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                  <option value="disputed">Disputed</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPlot(null)}
                  className="px-4 py-2 font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 text-white rounded-xl font-bold cursor-pointer"
                >
                  Update Plot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Voice-to-Listing AI Modal */}
      {currentUser && (
        <VoicePropertyListingModal
          isOpen={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          currentUser={currentUser}
          societies={societies.length > 0 ? societies : [society]}
          plots={plots}
          onAddProperty={(prop, plotData) => {
            if (onAddProperty) {
              onAddProperty(prop, plotData);
            }
            if (plotData && onAddPlot) {
              const fullPlot: Plot = {
                id: `plot-${Date.now()}`,
                societyId: society.id,
                societyName: society.name,
                plotNumber: plotData.plotNumber || `VN-${Math.floor(100 + Math.random() * 900)}`,
                block: plotData.block || 'Executive Block',
                sector: plotData.sector || 'Sector A',
                sizeMarla: plotData.sizeMarla || 5,
                sizeUnit: plotData.sizeUnit || 'Marla',
                sizeSqFt: (plotData.sizeMarla || 5) * 225,
                pricePKR: plotData.pricePKR || 3500000,
                downPaymentPKR: Math.round((plotData.pricePKR || 3500000) * 0.2),
                monthlyInstallmentPKR: Math.round(((plotData.pricePKR || 3500000) * 0.8) / 36),
                installmentMonths: 36,
                status: 'available',
                category: plotData.category || 'residential',
                dimensions: plotData.dimensions || '25x45',
                features: plotData.features || ['Possession-ready'],
                coordinates: plotData.coordinates || { x: 250, y: 150 },
              };
              onAddPlot(fullPlot);
            }
            setNotificationMsg({
              type: 'success',
              text: `Property "${prop.title}" added via Voice Note successfully.`
            });
            setTimeout(() => setNotificationMsg(null), 4000);
          }}
        />
      )}

      {/* MODAL: Delete Confirmation */}
      {deletingPlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Delete Plot Demarcation?</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to remove Plot <strong>{deletingPlot.plotNumber}</strong> in {deletingPlot.block || 'Executive Block'} from {society.name}'s master inventory?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingPlot(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold"
              >
                Delete Plot
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
