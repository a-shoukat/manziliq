import React, { useState } from 'react';
import { Plot } from '../../types';
import { 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Download, 
  Lock, 
  Unlock 
} from 'lucide-react';
import { generatePDFDocument } from '../../utils/pdfGenerator';

interface AdminDisputeManagementViewProps {
  plots: Plot[];
  onToggleDispute: (plotId: string, isDisputed: boolean, disputeReason?: string) => void;
}

export const AdminDisputeManagementView: React.FC<AdminDisputeManagementViewProps> = ({
  plots,
  onToggleDispute
}) => {
  const [selectedDisputePlotId, setSelectedDisputePlotId] = useState<string>('plot-dispute-1');
  const [arbitrationNotes, setArbitrationNotes] = useState('Boundary resurvey completed by TMA Tehsildar. Plot 12-A boundary verified with coordinates (X:20, Y:80). Allottee ownership confirmed.');

  const disputedPlots = plots.filter(p => p.isDisputed);
  const activePlot = plots.find(p => p.id === selectedDisputePlotId) || disputedPlots[0] || plots[0];

  const handleDownloadArbitrationDeed = () => {
    generatePDFDocument({
      docType: 'noc_certificate',
      buyerName: 'Dispute Arbitration Board',
      buyerPhone: '+92 300 0000000',
      plotNumber: activePlot?.plotNumber || 'Plot 12-A',
      societyName: activePlot?.societyName || 'Al-Rehman Garden',
      totalPricePKR: 0,
      nocNumber: 'ARB-NRL-2026-001',
      date: '2026-08-19'
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Scale className="w-7 h-7 text-rose-600" />
            <span>Title Dispute & Overlapping Demarcation Mediation Desk</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Super Admin dispute freeze engine preventing unauthorized transactions on contested plots.
          </p>
        </div>

        <div className="text-xs font-bold text-slate-600 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          Contested Plots Frozen: <strong className="text-rose-600">{disputedPlots.length} Case Active</strong>
        </div>
      </div>

      {/* Grid: Contested Cases (Left) vs Arbitration Action (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cases List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Contested Plot Records
          </div>

          {disputedPlots.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-3xl border border-slate-200 text-xs text-slate-400">
              No active title disputes currently logged across all registered housing societies.
            </div>
          ) : (
            disputedPlots.map((p) => {
              const isSelected = activePlot?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedDisputePlotId(p.id)}
                  className={`p-5 rounded-3xl border transition cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-rose-50/60 border-rose-300 ring-2 ring-rose-400 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-sm">{p.plotNumber}</span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-600 text-white uppercase flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Frozen
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 font-semibold">{p.societyName} ({p.sector})</div>
                  
                  <div className="p-3 bg-white border border-rose-100 rounded-xl text-xs text-rose-900">
                    <strong>Contestation Reason:</strong> {p.disputeReason}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Dispute Arbitration Workspace (Right) */}
        {activePlot && (
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">
                  Tribunal Arbitration Proceeding
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                  {activePlot.plotNumber} ({activePlot.societyName})
                </h2>
                <p className="text-xs text-slate-500">
                  Size: {activePlot.sizeMarla} Marla • Valuation: PKR {activePlot.pricePKR.toLocaleString('en-PK')}
                </p>
              </div>

              <button
                onClick={handleDownloadArbitrationDeed}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-rose-600" />
                <span>Export Arbitration Order (PDF)</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-900">Current Legal Hold:</div>
              <p className="text-slate-600 leading-relaxed">
                {activePlot.isDisputed 
                  ? activePlot.disputeReason 
                  : 'This plot is clear of legal liens and available for normal marketplace trading.'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Super Admin Arbitration Findings & Resolution
              </label>
              <textarea
                rows={3}
                value={arbitrationNotes}
                onChange={(e) => setArbitrationNotes(e.target.value)}
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600 leading-relaxed font-medium"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Action requires biometric Super Admin clearance
              </span>

              {activePlot.isDisputed ? (
                <button
                  onClick={() => onToggleDispute(activePlot.id, false)}
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Release Dispute Freeze & Restore Plot</span>
                </button>
              ) : (
                <button
                  onClick={() => onToggleDispute(activePlot.id, true, 'Flagged by Super Admin for boundary reassessment')}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Freeze Plot Under Title Dispute</span>
                </button>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
