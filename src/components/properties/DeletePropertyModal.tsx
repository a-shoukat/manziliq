import React from 'react';
import { Property } from '../../types';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeletePropertyModalProps {
  isOpen: boolean;
  property: Property | null;
  onClose: () => void;
  onConfirmDelete: (propertyId: string) => void;
}

export const DeletePropertyModal: React.FC<DeletePropertyModalProps> = ({
  isOpen,
  property,
  onClose,
  onConfirmDelete
}) => {
  if (!isOpen || !property) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white max-w-md w-full rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-5 animate-slide-down">
        
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-extrabold text-slate-900 font-[Outfit]">
            Delete Property Listing?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-slate-900 font-bold">"{property.title}"</strong> ({property.societyName})?
          </p>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Plot / Unit:</span>
              <strong className="text-slate-900">{property.plotNumber || 'Unspecified'}</strong>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Price:</span>
              <strong className="text-emerald-900 font-mono">PKR {property.pricePKR.toLocaleString('en-PK')}</strong>
            </div>
          </div>
          <p className="text-[11px] text-rose-600 font-medium pt-1">
            This action will immediately delist the property and remove it from the public marketplace and interactive plot grid.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(property.id);
              onClose();
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Confirm & Delete</span>
          </button>
        </div>

      </div>
    </div>
  );
};
