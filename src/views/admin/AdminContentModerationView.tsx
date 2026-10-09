import React from 'react';
import { Property } from '../../types';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  Building2, 
  MapPin, 
  Eye, 
  EyeOff,
  Plus,
  PlusCircle
} from 'lucide-react';

interface AdminContentModerationViewProps {
  properties: Property[];
  onToggleDuplicateFlag: (propertyId: string) => void;
  onDeleteProperty: (propertyId: string) => void;
  onApproveProperty?: (propertyId: string) => void;
  onRejectProperty?: (propertyId: string) => void;
  onNavigate?: (route: string) => void;
  onOpenAddProperty?: () => void;
}

export const AdminContentModerationView: React.FC<AdminContentModerationViewProps> = ({
  properties,
  onToggleDuplicateFlag,
  onDeleteProperty,
  onApproveProperty,
  onRejectProperty,
  onNavigate,
  onOpenAddProperty
}) => {
  const pendingProperties = properties.filter(p => p.status === 'pending');
  const flaggedProperties = properties.filter(p => p.isDuplicateFlagged);
  const cleanProperties = properties.filter(p => !p.isDuplicateFlagged);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-amber-600" />
            <span>Marketplace Moderation & Approval Desk</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review and approve pending submissions, detect duplicated listings, and ensure compliance with LDA/TMA standards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenAddProperty || (() => onNavigate && onNavigate('/properties/add'))}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
            title="Create New Property Listing"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Property</span>
          </button>

          <div className="text-xs font-bold text-slate-600 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <span>Pending: <strong className="text-amber-600">{pendingProperties.length}</strong></span>
            <span>•</span>
            <span>Duplicates: <strong className="text-rose-600">{flaggedProperties.length}</strong></span>
          </div>
        </div>
      </div>

      {/* PENDING APPROVAL QUEUE SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
            <span>Pending Listings Awaiting Approval ({pendingProperties.length})</span>
          </h3>
          <span className="text-xs text-slate-500">Requires Super Admin clearance before marketplace visibility</span>
        </div>

        {pendingProperties.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
            No pending listings awaiting moderation. All new submissions are up to date!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-3xl border-2 border-amber-200 shadow-xs p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Pending Review
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">{prop.propertyId || prop.id}</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{prop.title}</h4>
                  
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prop.location || prop.societyName}</span>
                    </p>
                    <p className="flex items-center gap-3 text-slate-500">
                      <span>{prop.sizeMarla} Marla</span>
                      <span>•</span>
                      <span className="font-bold text-slate-900">PKR {prop.pricePKR.toLocaleString('en-PK')}</span>
                      <span>•</span>
                      <span>By: <strong className="text-slate-800">{prop.dealerName || 'Direct Owner'}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {onApproveProperty && (
                      <button
                        onClick={() => onApproveProperty(prop.id)}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve Listing</span>
                      </button>
                    )}
                    {onRejectProperty && (
                      <button
                        onClick={() => onRejectProperty(prop.id)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                      >
                        Reject
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => onDeleteProperty(prop.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                    title="Delete permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Flagged Duplicate Listings Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-600" />
          <span>High Similarity Duplicate Listings ({flaggedProperties.length})</span>
        </h3>

        {flaggedProperties.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
            No flagged duplicate listings currently in the queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {flaggedProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-3xl border-2 border-rose-200 shadow-xs p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> 89% Title & Plot Match
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">{prop.id}</span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{prop.title}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{prop.location} ({prop.societyName})</span>
                  </p>

                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100 text-xs text-rose-950 space-y-1">
                    <div className="font-bold">Automated Heuristic Reason:</div>
                    <p className="text-[11px] text-rose-800">
                      Matches existing verified listing with identical dimensions and demarcated lot.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => onToggleDuplicateFlag(prop.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition cursor-pointer"
                  >
                    Dismiss & Unflag Listing
                  </button>

                  <button
                    onClick={() => onDeleteProperty(prop.id)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delist Permanently</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verified Clean Public Listings Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900">All Marketplace Listings ({properties.length})</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="p-3">Title</th>
                <th className="p-3">Society</th>
                <th className="p-3">Size</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3">Realtor</th>
                <th className="p-3 text-right">Moderator Control</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {properties.map((prop) => (
                <tr key={prop.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-3 font-bold text-slate-900">{prop.title}</td>
                  <td className="p-3 font-semibold text-emerald-800">{prop.societyName}</td>
                  <td className="p-3">{prop.sizeMarla} Marla</td>
                  <td className="p-3 font-extrabold text-slate-900">PKR {prop.pricePKR.toLocaleString('en-PK')}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      prop.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      prop.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {prop.status || 'approved'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{prop.dealerName || 'Direct Listing'}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {prop.status === 'pending' && onApproveProperty && (
                        <button
                          onClick={() => onApproveProperty(prop.id)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => onToggleDuplicateFlag(prop.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                          prop.isDuplicateFlagged
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        {prop.isDuplicateFlagged ? 'Flagged Duplicate' : 'Flag Duplicate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
