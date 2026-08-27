import React from 'react';
import { Property, Society, Plot, User } from '../../types';
import { AddEditPropertyModal } from '../../components/properties/AddEditPropertyModal';
import { 
  Building2, 
  ShieldAlert, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  Layers,
  MapPin,
  Image,
  DollarSign
} from 'lucide-react';

interface AddPropertyViewProps {
  currentUser: User;
  societies: Society[];
  plots: Plot[];
  existingProperty?: Property | null;
  onSaveProperty: (prop: Property, plotData?: Partial<Plot>) => void;
  onNavigate: (route: string) => void;
  onRoleSwitch?: (role: any) => void;
}

export const AddPropertyView: React.FC<AddPropertyViewProps> = ({
  currentUser,
  societies,
  plots,
  existingProperty = null,
  onSaveProperty,
  onNavigate,
  onRoleSwitch
}) => {
  // CRITICAL ACCESS CONTROL CHECK:
  // Customers/Buyers are informed to switch to an authorized persona
  const isCustomer = !currentUser || currentUser.role === 'buyer' || currentUser.role === 'public_buyer';

  if (isCustomer) {
    return (
      <div className="max-w-2xl mx-auto my-8 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
          <Building2 className="w-8 h-8" />
        </div>
        
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-[Outfit]">Authorized Listing Persona Required</h2>
          <p className="text-xs text-slate-600 max-w-lg mx-auto mt-1 leading-relaxed">
            In Pakistani real estate (LDA/TMA guidelines), property listings and demarcations can only be registered by <strong>Authorized Dealers</strong>, <strong>Society Admins</strong>, or <strong>Super Admins</strong>.
          </p>
          <p className="text-xs text-amber-800 font-semibold bg-amber-50 p-2.5 rounded-xl border border-amber-200 mt-3 max-w-md mx-auto">
            پراپرٹی ایڈ کرنے کے لیے نیچے دیے گئے کسی بھی مجاز کردار (Dealer / Society Admin) پر کلک کریں۔
          </p>
        </div>

        <div className="pt-2 space-y-2.5">
          <div className="text-xs font-black text-slate-700 uppercase tracking-wider">
            1-Click Demo Persona Switcher:
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            <button
              onClick={() => onRoleSwitch && onRoleSwitch('dealer')}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              🏢 Switch to Dealer / Agent
            </button>
            <button
              onClick={() => onRoleSwitch && onRoleSwitch('society_admin')}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              🏛️ Switch to Society Admin
            </button>
            <button
              onClick={() => onRoleSwitch && onRoleSwitch('super_admin')}
              className="px-4 py-2.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              🛡️ Switch to Super Admin
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigate('/marketplace')}
              className="px-5 py-2 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              ← Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner & Context Info */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              if (currentUser.role === 'dealer') onNavigate('/dealer/listings');
              else if (currentUser.role === 'society_admin') onNavigate('/society/inventory');
              else if (currentUser.role === 'super_admin') onNavigate('/admin/moderation');
              else onNavigate('/marketplace');
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 uppercase">
                {currentUser.role.replace('_', ' ')} Portal
              </span>
              <span className="text-xs text-slate-500">• Ready for Marketplace & Masterplan</span>
            </div>
            <h1 className="text-2xl font-black font-[Outfit] text-slate-900 mt-1">
              {existingProperty ? 'Edit Property Listing' : 'Add New Property Listing'}
            </h1>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs text-slate-600">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>Real-time georeferencing & instant plot color sync</span>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs space-y-1.5 shadow-xs">
          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span>1. Verified Demarcation</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Ensure plot dimensions and block numbers correspond to the LDA/TMA registered masterplan layout.
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs space-y-1.5 shadow-xs">
          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-amber-700" />
            <span>2. Auto-Calculated Rates</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            Base price and price per marla auto-balance based on area units (Marla, Kanal, Sq. Ft).
          </p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs space-y-1.5 shadow-xs">
          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-700" />
            <span>3. Instant Masterplan Link</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            The new property will immediately reflect on the society's interactive plot matrix.
          </p>
        </div>
      </div>

      {/* Embedded Form Modal as full view */}
      <AddEditPropertyModal
        isOpen={true}
        onClose={() => {
          if (currentUser.role === 'dealer') onNavigate('/dealer/listings');
          else if (currentUser.role === 'society_admin') onNavigate('/society/inventory');
          else if (currentUser.role === 'super_admin') onNavigate('/admin/moderation');
          else onNavigate('/marketplace');
        }}
        currentUser={currentUser}
        societies={societies}
        plots={plots}
        existingProperty={existingProperty}
        onSave={(prop, plotData) => {
          onSaveProperty(prop, plotData);
          if (currentUser.role === 'dealer') onNavigate('/dealer/listings');
          else if (currentUser.role === 'society_admin') onNavigate('/society/inventory');
          else if (currentUser.role === 'super_admin') onNavigate('/admin/moderation');
          else onNavigate('/marketplace');
        }}
      />
    </div>
  );
};
