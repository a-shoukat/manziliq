import React, { useState } from 'react';
import { User, Booking, Installment } from '../../types';
import { 
  FolderLock, 
  Download, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Calendar, 
  Search, 
  FileCheck2,
  Stamp,
  QrCode,
  Landmark,
  Eye
} from 'lucide-react';
import { generatePDFDocument } from '../../utils/pdfGenerator';

interface BuyerDocumentsViewProps {
  currentUser: User;
  bookings: Booking[];
  installments: Installment[];
}

export const BuyerDocumentsView: React.FC<BuyerDocumentsViewProps> = ({
  currentUser,
  bookings,
  installments
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocForPreview, setSelectedDocForPreview] = useState<any | null>(null);

  const activeBooking = bookings[0] || {
    plotNumber: 'Plot 42-A',
    societyName: 'Al-Rehman Garden Phase 7',
    sector: 'Sector A (Executive Block)',
    totalPricePKR: 2600000,
    downPaymentPKR: 520000
  };

  const documents = [
    {
      id: 'doc-td-001',
      title: 'Official Deed of Absolute Ownership Transfer — Plot 42-A',
      type: 'transfer_deed' as const,
      referenceNo: 'TD-PK-2026-99182',
      issuedBy: 'Sub-Registrar Land Revenue & Housing Authority',
      date: '2026-08-19',
      size: '345 KB',
      status: 'Sub-Registrar Registered & Executed',
      badgeClass: 'bg-purple-100 text-purple-900 border-purple-200',
      icon: Stamp,
      description: 'Permanent statutory title transfer with official notarization, witness execution, and QR verification.'
    },
    {
      id: 'doc-agr-002',
      title: 'Bilingual Digital Sale & Installment Agreement — Plot 42-A',
      type: 'booking_agreement' as const,
      referenceNo: 'AGR-NRL-2026-84712',
      issuedBy: 'ManzilIQ Central Escrow & Housing Developer',
      date: '2026-08-10',
      size: '315 KB',
      status: 'Digitally Signed & Reconciled',
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-200',
      icon: FileCheck2,
      description: 'Standardized bilingual legal terms, installment milestones, and electronic signatures.'
    },
    {
      id: 'doc-alt-003',
      title: 'Official Allotment Letter — Plot 42-A (Executive Block)',
      type: 'allotment_letter' as const,
      referenceNo: 'ALT-AR-2026-0841',
      issuedBy: 'Al-Rehman Garden Housing Authority',
      date: '2026-08-14',
      size: '240 KB',
      status: 'Stamped & Verified',
      badgeClass: 'bg-teal-100 text-teal-900 border-teal-200',
      icon: FileText,
      description: 'Provisional allotment allocation certificate with official housing stamp.'
    },
    {
      id: 'doc-rcp-004',
      title: 'Payment Receipt — 20% Advance Downpayment (PKR 520,000)',
      type: 'payment_receipt' as const,
      referenceNo: 'RCP-DP-2026-001',
      issuedBy: 'Bank of Punjab / 1Link Portal',
      date: '2026-08-12',
      size: '180 KB',
      status: '1Link Verified Transaction',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
      icon: FileText,
      description: 'Reconciled banking payment voucher for advance booking downpayment.'
    },
    {
      id: 'doc-noc-005',
      title: 'Development Authority Verified Society NOC Certificate',
      type: 'noc_certificate' as const,
      referenceNo: 'NOC-TMA-NRL-2024-88',
      issuedBy: 'Tehsil Municipal Administration',
      date: '2024-03-12',
      size: '420 KB',
      status: 'Public Legal Record',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
      icon: ShieldCheck,
      description: 'Government approved layout masterplan and environmental clearance NOC.'
    }
  ];

  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.issuedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (doc: typeof documents[0]) => {
    generatePDFDocument({
      docType: doc.type,
      buyerName: currentUser.name || 'Muhammad Farooq',
      buyerPhone: currentUser.phone || '+92 300 8472910',
      buyerCNIC: currentUser.cnic || '34501-8472910-1',
      plotNumber: activeBooking.plotNumber || 'Plot 42-A',
      sector: activeBooking.sector || 'Sector A (Executive Block)',
      societyName: activeBooking.societyName || 'Al-Rehman Garden Housing Society',
      totalPricePKR: activeBooking.totalPricePKR || 2600000,
      downPaymentPKR: activeBooking.downPaymentPKR || 520000,
      paidAmountPKR: 57778,
      monthlyInstallmentPKR: 57778,
      totalInstallments: 36,
      transferFeePKR: 78000,
      transactionId: doc.referenceNo,
      allotmentNumber: doc.referenceNo,
      nocNumber: 'TMA/NRL/2024/88',
      date: doc.date
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderLock className="w-7 h-7 text-purple-700" />
            <span>Buyer's Legal Document Vault & Locker</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tamper-evident legal repository containing registered Transfer Deeds, Digital Sale Agreements, Allotment Letters, and receipts.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents by reference..."
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Security Banner */}
      <div className="bg-purple-50/70 border border-purple-200 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-purple-950">
              Government & Sub-Registrar Compliant Digital Seal Repository
            </div>
            <div className="text-xs text-purple-800">
              All PDF downloads generated from this vault include verified QR codes linking to the public validation ledger.
            </div>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold bg-white text-purple-900 px-3 py-1.5 rounded-xl border border-purple-200 shrink-0">
          Vault ID: VLT-34501-8472
        </span>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredDocs.map((doc) => {
          const IconComp = doc.icon;
          return (
            <div
              key={doc.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                    {doc.referenceNo}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1 border ${doc.badgeClass}`}>
                    <CheckCircle2 className="w-3 h-3" />
                    {doc.status}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-purple-800 shrink-0">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {doc.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {doc.description}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 space-y-1 pt-1 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>Issued By: <strong className="text-slate-700">{doc.issuedBy}</strong></div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span>Date: {doc.date}</span>
                    <span>Format: PDF ({doc.size})</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelectedDocForPreview(doc)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Inspect</span>
                </button>

                <button
                  onClick={() => handleDownload(doc)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 bg-purple-800 hover:bg-purple-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Document Inspector Modal */}
      {selectedDocForPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 border border-slate-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Official Document Record</span>
                <h3 className="text-base font-bold text-slate-900">{selectedDocForPreview.title}</h3>
              </div>
              <button onClick={() => setSelectedDocForPreview(null)} className="text-slate-400 hover:text-slate-700 p-1">
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-900">Reference: {selectedDocForPreview.referenceNo}</span>
                <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{selectedDocForPreview.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Issued By:</span>
                  <strong>{selectedDocForPreview.issuedBy}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Property Plot:</span>
                  <strong className="font-mono">{activeBooking.plotNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Date Issued:</span>
                  <span>{selectedDocForPreview.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Verification:</span>
                  <span className="text-purple-800 font-mono font-bold">QR Verified Genuine</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedDocForPreview(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(selectedDocForPreview);
                  setSelectedDocForPreview(null);
                }}
                className="px-5 py-2 bg-purple-800 hover:bg-purple-900 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Official PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
