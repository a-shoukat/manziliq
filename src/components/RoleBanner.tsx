import React from 'react';
import { UserRole } from '../types';
import { ShieldCheck, Building2, User, Users, RefreshCw, Database } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

interface RoleBannerProps {
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onResetData?: () => void;
  onOpenSupabase?: () => void;
}

export const RoleBanner: React.FC<RoleBannerProps> = ({ activeRole, onRoleChange, onResetData, onOpenSupabase }) => {
  const supabaseActive = isSupabaseConfigured();

  return (
    <div className="bg-slate-100 text-slate-800 text-xs py-2 px-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider border border-amber-300">
          Demo Persona Switcher
        </span>
        <span className="text-slate-600 hidden sm:inline font-medium">
          Switch roles to experience all 4 dashboards & workflows:
        </span>
      </div>

      <div className="flex items-center flex-wrap gap-1.5">
        <button
          onClick={() => onRoleChange('buyer')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
            activeRole === 'buyer'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
              : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Buyer</span>
        </button>

        <button
          onClick={() => onRoleChange('dealer')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
            activeRole === 'dealer'
              ? 'bg-teal-600 text-white font-bold shadow-xs'
              : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Dealer / Agent</span>
        </button>

        <button
          onClick={() => onRoleChange('society_admin')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
            activeRole === 'society_admin'
              ? 'bg-emerald-600 text-white font-bold shadow-xs'
              : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Society Admin</span>
        </button>

        <button
          onClick={() => onRoleChange('super_admin')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all ${
            activeRole === 'super_admin'
              ? 'bg-indigo-600 text-white font-bold shadow-xs'
              : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Super Admin</span>
        </button>

        {/* Supabase Integration Button */}
        {onOpenSupabase && (
          <button
            onClick={onOpenSupabase}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-extrabold transition-all ml-1 ${
              supabaseActive
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-900 text-amber-400 border border-slate-800 hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-300" />
            <span>Supabase DB & Auth</span>
            <span className={`w-2 h-2 rounded-full ${supabaseActive ? 'bg-emerald-300 animate-pulse' : 'bg-amber-400'}`} />
          </button>
        )}

        {onResetData && (
          <button
            onClick={onResetData}
            title="Reset Demo Data"
            className="ml-1 bg-white hover:bg-slate-200 text-slate-600 p-1.5 rounded-md border border-slate-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

