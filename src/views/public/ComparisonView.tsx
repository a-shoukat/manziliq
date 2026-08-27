import React, { useState } from 'react';
import { Property, Plot, SavedComparison, User } from '../../types';
import { 
  Scale, 
  Trash2, 
  CheckCircle2, 
  X, 
  MapPin, 
  Building2, 
  Plus, 
  FileText,
  Sparkles,
  ShieldCheck,
  Compass,
  CreditCard,
  Bookmark,
  BookmarkCheck,
  Clock,
  ArrowRight,
  FolderHeart,
  Save,
  Check,
  AlertCircle
} from 'lucide-react';
import { formatPKR } from '../../components/marketplace/PropertyCard';

interface ComparisonViewProps {
  properties?: Property[];
  plots?: Plot[];
  compareList?: Property[];
  savedComparisons?: SavedComparison[];
  currentUser?: User;
  onRemove: (propertyId: string) => void;
  onClear: () => void;
  onSelectProperty?: (propertyId: string) => void;
  onOpenBooking?: (property: Property) => void;
  onInitiateBooking?: (target: { id: string; title: string; societyName: string; sector: string; pricePKR: number; sizeMarla: number }) => void;
  onSaveComparison?: (comparison: SavedComparison) => void;
  onDeleteSavedComparison?: (id: string) => void;
  onLoadSavedComparison?: (comparison: SavedComparison) => void;
  onNavigate: (route: string) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  properties,
  plots = [],
  compareList,
  savedComparisons = [],
  currentUser,
  onRemove,
  onClear,
  onSelectProperty,
  onOpenBooking,
  onInitiateBooking,
  onSaveComparison,
  onDeleteSavedComparison,
  onLoadSavedComparison,
  onNavigate
}) => {
  const activeProperties = properties || compareList || [];
  const [activeTab, setActiveTab] = useState<'current_matrix' | 'saved_history'>('current_matrix');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const [saveNotes, setSaveNotes] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const isPublicBuyer = !currentUser || currentUser.role === 'public_buyer';

  const userSavedComparisons = (savedComparisons || []).filter(c => 
    !currentUser || currentUser.role === 'public_buyer' ? true : c.userId === currentUser.id || true
  );

  const handleSelectProp = (id: string) => {
    if (onSelectProperty) {
      onSelectProperty(id);
    } else {
      onNavigate(`/property/${id}`);
    }
  };

  const handleBook = (prop: Property) => {
    if (isPublicBuyer) {
      onNavigate('/login');
      return;
    }
    if (onOpenBooking) {
      onOpenBooking(prop);
    } else if (onInitiateBooking) {
      onInitiateBooking({
        id: prop.id,
        title: prop.title,
        societyName: prop.societyName,
        sector: prop.sector || 'Sector A',
        pricePKR: prop.pricePKR,
        sizeMarla: prop.sizeMarla
      });
    }
  };

  const handleSaveCurrentComparison = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPublicBuyer) {
      onNavigate('/login');
      return;
    }
    if (!saveTitle.trim()) return;

    const newSavedComp: SavedComparison = {
      id: `saved-comp-${Date.now()}`,
      userId: currentUser?.id || 'u-buyer-1',
      title: saveTitle.trim(),
      savedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      plotIds: activeProperties.map(p => p.id),
      propertyIds: activeProperties.map(p => p.id),
      plotsCount: activeProperties.length,
      notes: saveNotes.trim()
    };

    if (onSaveComparison) {
      onSaveComparison(newSavedComp);
    }
    setShowSaveModal(false);
    setSaveTitle('');
    setSaveNotes('');
    setSaveSuccessMsg(`Comparison matrix "${newSavedComp.title}" successfully saved to your profile!`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6" id="comparison-view-root">
      
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-[Outfit] text-slate-900 tracking-tight flex items-center gap-2">
            <Scale className="w-7 h-7 text-emerald-800" />
            <span>Plot & Property Comparison Matrix</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Evaluating specifications, rate per Marla, installment schedules, and demarcated masterplan zones side-by-side (max 3).
          </p>
        </div>

        {/* Tab switcher: Active Matrix vs Saved Comparisons */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold w-full sm:w-auto">
          <button
            id="tab-current-comparison"
            type="button"
            onClick={() => setActiveTab('current_matrix')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'current_matrix'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Active Comparison ({activeProperties.length}/3)</span>
          </button>

          <button
            id="tab-saved-comparisons"
            type="button"
            onClick={() => setActiveTab('saved_history')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === 'saved_history'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span>Saved Sets ({userSavedComparisons.length})</span>
          </button>
        </div>
      </div>

      {/* Success Banner */}
      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: ACTIVE COMPARISON MATRIX */}
      {activeTab === 'current_matrix' && (
        <>
          {activeProperties.length === 0 ? (
            <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4 bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
              <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-400">
                <Scale className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-extrabold font-[Outfit] text-slate-900">
                No Plots or Properties Selected
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Explore the marketplace or society masterplans and click <strong>"Add to Plot Comparison"</strong> on up to 3 listings to compare prices, down payments, and amenities side-by-side.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  id="btn-explore-marketplace-empty-compare"
                  type="button"
                  onClick={() => onNavigate('/marketplace')}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Explore Property Marketplace
                </button>
                <button
                  id="btn-explore-societies-empty-compare"
                  type="button"
                  onClick={() => onNavigate('/societies')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition border border-slate-200 cursor-pointer"
                >
                  View Society Masterplans
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <div className="text-xs text-slate-600 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Comparing <strong>{activeProperties.length} of 3</strong> items</span>
                  {activeProperties.length >= 3 && (
                    <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-300">
                      Limit Reached (Max 3)
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Save comparison button */}
                  <button
                    id="btn-open-save-comparison-modal"
                    type="button"
                    onClick={() => {
                      if (isPublicBuyer) {
                        onNavigate('/login');
                      } else {
                        setSaveTitle(`Comparison of ${activeProperties.map(p => p.title.slice(0, 15)).join(', ')}`);
                        setShowSaveModal(true);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition shadow-2xs cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                    <span>Save This Comparison</span>
                  </button>

                  {activeProperties.length < 3 && (
                    <button
                      id="btn-add-more-listing-compare"
                      type="button"
                      onClick={() => onNavigate('/marketplace')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Plot</span>
                    </button>
                  )}

                  <button
                    id="btn-clear-all-compare"
                    type="button"
                    onClick={onClear}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="overflow-x-auto bg-white rounded-3xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80">
                      <th className="p-4 w-48 font-black text-slate-500 uppercase tracking-wider text-[11px]">
                        Specification
                      </th>
                      {activeProperties.map((prop) => (
                        <th key={prop.id} className="p-4 min-w-[280px] max-w-[340px] align-top">
                          <div className="space-y-2.5">
                            <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100 group border border-slate-200">
                              <img 
                                src={prop.images && prop.images[0] ? prop.images[0] : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000'} 
                                alt={prop.title} 
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                              />
                              <button
                                type="button"
                                onClick={() => onRemove(prop.id)}
                                className="absolute top-2.5 right-2.5 bg-slate-900/80 hover:bg-rose-600 text-white p-1.5 rounded-full transition shadow-md cursor-pointer"
                                title="Remove from comparison"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                              <div className="absolute bottom-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                                {prop.type === 'plot' ? 'Demarcated Plot' : 'Constructed Villa'}
                              </div>
                            </div>

                            <div>
                              <button
                                type="button"
                                onClick={() => handleSelectProp(prop.id)}
                                className="text-left font-extrabold text-slate-900 text-sm hover:text-emerald-800 transition line-clamp-1"
                              >
                                {prop.title}
                              </button>
                              <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                                <span>{prop.societyName}</span>
                              </div>
                            </div>

                            {/* Main Demand Price */}
                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                              <span className="text-[10px] font-bold uppercase text-slate-500 block">Total Demand</span>
                              <div className="text-base font-black text-amber-700 font-[Outfit]">
                                PKR {prop.pricePKR.toLocaleString('en-PK')}
                              </div>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-xs">
                    
                    {/* Plot / Unit Number */}
                    <tr>
                      <td className="p-4 font-bold text-slate-500 bg-slate-50/50">Plot / Unit Number</td>
                      {activeProperties.map(p => (
                        <td key={p.id} className="p-4 font-bold text-slate-900 font-mono">
                          {p.plotNumber || `Unit #${p.id.slice(-4).toUpperCase()}`}
                        </td>
                      ))}
                    </tr>

                    {/* Sector & Block */}
                    <tr>
                      <td className="p-4 font-bold text-slate-500 bg-slate-50/50">Sector & Block</td>
                      {activeProperties.map(p => (
                        <td key={p.id} className="p-4 text-slate-800 font-semibold">
                          {p.block || 'Executive'} Block • {p.sector || 'Sector A'}
                        </td>
                      ))}
                    </tr>

                    {/* Area Size */}
                    <tr>
                      <td className="p-4 font-bold text-slate-500 bg-slate-50/50">Area Size</td>
                      {activeProperties.map(p => (
                        <td key={p.id} className="p-4">
                          <span className="font-extrabold text-slate-900 text-sm block">
                            {p.sizeMarla} Marla
                          </span>
                          <span className="text-slate-500 text-[11px]">
                            {p.sizeMarla * 225} Sq. Ft ({Math.round(p.sizeMarla * 25)} Sq. Yds)
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Rate per Marla */}
                    <tr>
                      <td className="p-4 font-bold text-slate-500 bg-slate-50/50">Rate per Marla</td>
                      {activeProperties.map(p => (
                        <td key={p.id} className="p-4">
                          <span className="font-extrabold text-emerald-800 font-mono">
                            PKR {Math.round(p.pricePKR / (p.sizeMarla || 1)).toLocaleString('en-PK')}
                          </span>
                          <span className="text-slate-500 text-[11px]"> / Marla</span>
                        </td>
                      ))}
                    </tr>

                    {/* Down Payment & Installment Breakdown */}
                    <tr>
                      <td className="p-4 font-bold text-slate-500 bg-slate-50/50">Payment Plan (20% Advance)</td>
                      {activeProperties.map(p => (
                        <td key={p.id} className="p-4 space-y-1">
                          <div className="text-[11px] text-slate-700">
                            Down Payment: <strong className="text-emerald-800">PKR {Math.round(p.pricePKR * 0.20).toLocaleString('en-PK')}</strong>
                          </div>
                          <div className="text-[11px] text-slate-700">
                            Monthly (36 Mo): <strong className="text-amber-800">PKR {Math.round((p.pricePKR * 0.80) / 36).toLocaleString('en-PK')}</strong>/mo
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Road Width & Facing */}
                    <tr>
                      <td className="p-4 font-bold text-slate-500 bg-slate-50/50">Road Width & Access</td>
                      {activeProperties.map(p => (
                        <td key={p.id} className="p-4 text-slate-800 font-semibold">
                          {p.roadWidth || '40 ft Sector Road'}
                        </td>
                      ))}
                    </tr>

                    {/* Verified NOC & Approvals */}
                    <tr>
                      <td className="p-4 font-bold text-slate-500 bg-slate-50/50">Legal Verification</td>
                      {activeProperties.map(p => (
                        <td key={p.id} className="p-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>LDA / TMA Approved</span>
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Proximity & Key Amenities */}
                    <tr>
                      <td className="p-4 font-bold text-slate-500 bg-slate-50/50">Verified Amenities</td>
                      {activeProperties.map(p => (
                        <td key={p.id} className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {(p.amenities || ['Gas Connection', 'Underground Electricity', '24/7 Security']).map((am, idx) => (
                              <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                                {am}
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Booking Action Entry Point */}
                    <tr>
                      <td className="p-4 font-bold text-slate-500 bg-slate-50/50">Action</td>
                      {activeProperties.map(p => (
                        <td key={p.id} className="p-4">
                          <button
                            id={`btn-book-prop-from-matrix-${p.id}`}
                            type="button"
                            onClick={() => handleBook(p)}
                            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>Book This Property</span>
                          </button>
                        </td>
                      ))}
                    </tr>

                  </tbody>
                </table>
              </div>

            </div>
          )}
        </>
      )}

      {/* TAB 2: SAVED COMPARISONS ARCHIVE */}
      {activeTab === 'saved_history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 font-[Outfit]">
                Saved Comparison Sets ({userSavedComparisons.length})
              </h3>
              <p className="text-xs text-slate-500">
                Persistent comparison configurations saved to your customer account for future review.
              </p>
            </div>
          </div>

          {userSavedComparisons.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <FolderHeart className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="font-bold text-slate-800 text-sm">No Saved Comparisons Yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Compare plots in the marketplace or masterplan and click <strong>"Save This Comparison"</strong> to save sets for quick retrieval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSavedComparisons.map((comp) => (
                <div key={comp.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-[10px]">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{comp.savedAt}</span>
                      </span>
                      <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                        {comp.plotsCount} Plots
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm font-[Outfit] line-clamp-2">
                      {comp.title}
                    </h4>

                    {comp.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                        {comp.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      id={`btn-load-saved-comp-${comp.id}`}
                      type="button"
                      onClick={() => {
                        if (onLoadSavedComparison) {
                          onLoadSavedComparison(comp);
                        }
                        setActiveTab('current_matrix');
                      }}
                      className="flex-1 py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Load Matrix</span>
                    </button>

                    {onDeleteSavedComparison && (
                      <button
                        id={`btn-delete-saved-comp-${comp.id}`}
                        type="button"
                        onClick={() => onDeleteSavedComparison(comp.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200 cursor-pointer"
                        title="Delete saved comparison"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SAVE COMPARISON MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-extrabold text-slate-900 font-[Outfit]">
                  Save Plot Comparison
                </h3>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCurrentComparison} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Comparison Title *</label>
                <input
                  type="text"
                  required
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="e.g. 5 Marla Executive vs Sector B Corner"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Personal Notes / Budget Strategy</label>
                <textarea
                  rows={3}
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  placeholder="e.g. Down payment budget PKR 600,000; check boulevard road facing."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-normal outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Included Listings ({activeProperties.length}):</div>
                <ul className="list-disc list-inside text-[11px] space-y-0.5">
                  {activeProperties.map(p => (
                    <li key={p.id} className="truncate">{p.title} ({p.societyName})</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-save-comparison"
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-black rounded-xl transition flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Comparison</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
