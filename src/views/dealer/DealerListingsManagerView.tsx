import React, { useState } from 'react';
import { Property, Society, Plot, User } from '../../types';
import { 
  Building2, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Trash2, 
  Edit3, 
  Sparkles,
  ShieldAlert,
  Search,
  Filter,
  Eye,
  Mic
} from 'lucide-react';
import { AddEditPropertyModal } from '../../components/properties/AddEditPropertyModal';
import { DeletePropertyModal } from '../../components/properties/DeletePropertyModal';
import { VoicePropertyListingModal } from '../../components/properties/VoicePropertyListingModal';

interface DealerListingsManagerViewProps {
  currentUser: User;
  properties: Property[];
  societies: Society[];
  plots?: Plot[];
  onAddProperty: (property: Property, plotData?: Partial<Plot>) => void;
  onUpdateProperty?: (property: Property, plotData?: Partial<Plot>) => void;
  onDeleteProperty: (propertyId: string) => void;
  onNavigate?: (route: string) => void;
}

export const DealerListingsManagerView: React.FC<DealerListingsManagerViewProps> = ({
  currentUser,
  properties,
  societies,
  plots = [],
  onAddProperty,
  onUpdateProperty,
  onDeleteProperty,
  onNavigate
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Dealer's own listings or assigned listings
  const dealerProps = properties.filter(p => 
    p.dealerId === currentUser.id || 
    p.assignedDealerId === currentUser.id ||
    !p.dealerId // fallback for demonstration
  );

  const filteredProps = dealerProps.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.societyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.plotNumber && p.plotNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || (p.listingStatus || 'available') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveProperty = (propData: Property, plotData?: Partial<Plot>) => {
    if (editingProperty) {
      if (onUpdateProperty) {
        onUpdateProperty(propData, plotData);
      } else {
        onAddProperty(propData, plotData);
      }
      setEditingProperty(null);
    } else {
      onAddProperty(propData, plotData);
    }
  };

  const getStatusBadge = (status: string = 'available') => {
    switch (status) {
      case 'available':
        return <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">Available</span>;
      case 'reserved':
        return <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-xs">Reserved</span>;
      case 'sold':
        return <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-xs">Sold</span>;
      case 'disputed':
        return <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-600 text-white shadow-xs">Disputed</span>;
      default:
        return <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">Available</span>;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 uppercase tracking-wider">
              Dealer Portfolio
            </span>
            <span className="text-xs text-slate-500">• {dealerProps.length} Active Listings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5 mt-1 font-[Outfit]">
            <Building2 className="w-7 h-7 text-emerald-800" />
            <span>Marketplace Listings & Inventory</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Create, demarcate, and publish verified plot listings directly to the public marketplace and interactive plot grid.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsVoiceModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-xl text-xs font-black transition shadow-sm hover:shadow-md cursor-pointer group"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
            </span>
            <Mic className="w-4 h-4 text-slate-950 group-hover:scale-110 transition" />
            <span>Add Property by Voice</span>
          </button>

          <button
            onClick={() => {
              setEditingProperty(null);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black transition shadow-sm hover:shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, plot #, society..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available (Green)</option>
            <option value="reserved">Reserved (Yellow)</option>
            <option value="sold">Sold (Red)</option>
            <option value="disputed">Disputed (Gray)</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {filteredProps.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No property listings found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all' 
              ? 'No listings match your search criteria. Try resetting filters.'
              : 'You have not added any properties yet. Click "Add Property" to list your first plot!'}
          </p>
          <button
            onClick={() => {
              setEditingProperty(null);
              setIsAddModalOpen(true);
            }}
            className="px-5 py-2.5 bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-900 transition"
          >
            + Add First Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProps.map((prop) => {
            const currentStatus = prop.listingStatus || 'available';

            return (
              <div
                key={prop.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between group"
              >
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={prop.images && prop.images[0] ? prop.images[0] : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800'}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    referrerPolicy="no-referrer"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-900/90 text-white uppercase tracking-wider">
                      {prop.type}
                    </span>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono">
                      {prop.sizeMarla} Marla
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(currentStatus)}
                  </div>

                  {prop.isDuplicateFlagged && (
                    <div className="absolute bottom-2 left-3 right-3 bg-red-600/95 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-sm">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Duplicate Flagged by Super Admin</span>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-extrabold text-emerald-800">
                      {prop.societyName} {prop.plotNumber ? `• Plot ${prop.plotNumber}` : ''}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 font-[Outfit] line-clamp-1">{prop.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{prop.location}</span>
                    </p>
                  </div>

                  {/* Amenities Preview */}
                  {prop.amenities && prop.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {prop.amenities.slice(0, 3).map((a, i) => (
                        <span key={i} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {a}
                        </span>
                      ))}
                      {prop.amenities.length > 3 && (
                        <span className="text-[10px] font-bold text-slate-400">+{prop.amenities.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Demand</div>
                      <div className="text-sm font-black font-mono text-emerald-950">
                        PKR {prop.pricePKR.toLocaleString('en-PK')}
                      </div>
                    </div>

                    {/* Edit & Delete Controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingProperty(prop);
                          setIsAddModalOpen(true);
                        }}
                        className="p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                        title="Edit Listing"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeletingProperty(prop)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Property Modal */}
      <AddEditPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingProperty(null);
        }}
        currentUser={currentUser}
        societies={societies}
        plots={plots}
        existingProperty={editingProperty}
        onSave={handleSaveProperty}
      />

      {/* Voice-to-Listing Modal */}
      <VoicePropertyListingModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        currentUser={currentUser}
        societies={societies}
        plots={plots}
        onAddProperty={handleSaveProperty}
      />

      {/* Delete Confirmation Modal */}
      <DeletePropertyModal
        isOpen={!!deletingProperty}
        property={deletingProperty}
        onClose={() => setDeletingProperty(null)}
        onConfirmDelete={(id) => {
          onDeleteProperty(id);
          setDeletingProperty(null);
        }}
      />

    </div>
  );
};

