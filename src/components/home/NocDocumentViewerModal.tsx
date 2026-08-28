import React from 'react';
import { Society } from '../../types';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Download, 
  ExternalLink, 
  Printer, 
  CheckCircle2, 
  Building2,
  Lock,
  QrCode
} from 'lucide-react';

interface NocDocumentViewerModalProps {
  isOpen: boolean;
  society: Society | null;
  onClose: () => void;
  onToast?: (msg: string) => void;
}

export const NocDocumentViewerModal: React.FC<NocDocumentViewerModalProps> = ({
  isOpen,
  society,
  onClose,
  onToast
}) => {
  if (!isOpen || !society) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (onToast) onToast(`Official NOC Document for ${society.name} downloaded.`);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold font-[Outfit] text-slate-900">
                Official NOC & TMA Legal Verification Certificate
              </h2>
              <p className="text-xs text-slate-500">
                Authority approval registry record for {society.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-print-noc-doc"
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="btn-close-noc-modal"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Paper Sheet */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-slate-50/50 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-emerald-800/30 shadow-md relative overflow-hidden space-y-6">
            
            {/* Watermark Seal */}
            <div className="absolute right-4 top-1/3 opacity-5 pointer-events-none">
              <ShieldCheck className="w-72 h-72 text-emerald-950" />
            </div>

            {/* Official Government Authority Header */}
            <div className="text-center pb-5 border-b-2 border-slate-900 space-y-1">
              <div className="text-[11px] uppercase tracking-widest font-black text-slate-500">
                Government of Punjab / Federal Capital Territory
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-[Outfit] text-slate-950 uppercase tracking-tight">
                Housing & Physical Planning Directorate
              </h1>
              <div className="text-xs font-bold text-emerald-800">
                Tehsil Municipal Administration & Development Authority Registry
              </div>
              <div className="inline-block bg-emerald-100 text-emerald-900 font-mono text-xs font-extrabold px-3 py-1 rounded-full mt-2 border border-emerald-300">
                NOC REGISTRATION NO: {society.nocNumber || 'LDA/PK/NOC-2023/419'}
              </div>
            </div>

            {/* Verification Key Specs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Approved Housing Society</span>
                <div className="font-extrabold text-slate-900 text-sm">{society.name}</div>
                <div className="text-slate-600 text-[11px]">{society.location}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Jurisdiction & Authority</span>
                <div className="font-extrabold text-slate-900 text-sm">LDA / TMA Approved Jurisdiction</div>
                <div className="text-slate-600 text-[11px]">Clear Land Title, Approved Masterplan & Utility Right-of-Way</div>
              </div>
            </div>

            {/* Legal Clauses Overview */}
            <div className="text-xs text-slate-700 space-y-2 leading-relaxed bg-emerald-50/50 p-4 rounded-xl border border-emerald-200">
              <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Legally Certified & Free of Encumbrance</span>
              </div>
              <p>
                This certifies that <strong>{society.name}</strong> has submitted and cleared all requisite environmental assessments, master layout plans, grid substation approvals, and road widening reservations in accordance with the Punjab Housing Societies (Control of Allotments) Regulations.
              </p>
              <p className="text-[11px] text-slate-500">
                All plot files and allotment registrations on MANZILIQ Smart ERP are synced directly with the validated survey demarcations.
              </p>
            </div>

            {/* Signatures & Stamp */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Digital Registry Signature</div>
                <div className="font-mono text-[11px] text-slate-700 font-bold">Director General of Town Planning</div>
                <div className="h-6 border-b border-dashed border-slate-400 w-36"></div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">MANZILIQ Verified</div>
                  <div className="text-[11px] font-bold text-emerald-700">Audit Status: PASS</div>
                </div>
                <div className="w-14 h-14 bg-slate-900 text-white p-1 rounded-xl flex items-center justify-center">
                  <QrCode className="w-11 h-11 text-amber-400" />
                </div>
              </div>
            </div>

          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <a
              href={society.nocDocUrl || '#'}
              target="_blank"
              rel="noreferrer"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF Copy</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 transition cursor-pointer"
            >
              Close Viewer
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
