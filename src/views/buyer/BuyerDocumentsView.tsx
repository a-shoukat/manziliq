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
  FileCheck2 
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

  const documents = [
    {
      id: 'doc-1',
      title: 'Official Allotment Letter — Plot 42-A (Sector A, Al-Rehman Garden)',
      type: 'allotment_letter' as const,
      referenceNo: 'AR-2026-0841',
      issuedBy: 'Al-Rehman Garden Housing Authority',
      date: '2026-08-14',
      size: '240 KB',
      status: 'Stamped & Verified'
    },
    {
      id: 'doc-2',
      title: 'Bilingual Booking & Token Agreement Contract',
      type: 'booking_agreement' as const,
      referenceNo: 'AGR-NRL-2026-99',
      issuedBy: 'Manziliq Central Escrow & Housing Authority',
      date: '2026-08-10',
      size: '310 KB',
      status: 'Signed by Allottee & Developer'
    },
    {
      id: 'doc-3',
      title: 'Payment Receipt — 20% Advance Downpayment (PKR 520,000)',
      type: 'payment_receipt' as const,
      referenceNo: 'RCP-DP-2026-001',
      issuedBy: 'Bank of Punjab / 1Link Portal',
      date: '2026-08-12',
      size: '180 KB',
      status: 'Verified Transaction'
    },
    {
      id: 'doc-4',
      title: 'Payment Receipt — Installment #1 (PKR 57,778)',
      type: 'payment_receipt' as const,
      referenceNo: 'RCP-2026-001',
      issuedBy: '1Link Online Banking',
      date: '2026-07-05',
      size: '175 KB',
      status: 'Verified Transaction'
    },
    {
      id: 'doc-5',
      title: 'Development Authority Verified Society NOC Certificate',
      type: 'noc_certificate' as const,
      referenceNo: 'NOC-TMA-NRL-2024-88',
      issuedBy: 'Tehsil Municipal Administration',
      date: '2024-03-12',
      size: '420 KB',
      status: 'Public Legal Record'
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
      buyerName: currentUser.name,
      buyerPhone: currentUser.phone || '+92 300 8472910',
      buyerCNIC: currentUser.cnic,
      plotNumber: 'Plot 42-A',
      sector: 'Sector A (Executive Block)',
      societyName: 'Al-Rehman Garden Housing Society',
      totalPricePKR: 2600000,
      downPaymentPKR: 520000,
      paidAmountPKR: 57778,
      installmentNo: 1,
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
            <span>Customer Personal Document Locker</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tamper-evident legal repository containing allotment certificates, bilingual sale deeds, and stamped receipts.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents by reference..."
            className="w-full text-xs pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600"
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
              Government Compliant Digital Stamp Repository
            </div>
            <div className="text-xs text-purple-800">
              All PDF downloads generated from this vault include verified QR codes and cryptographic hashes.
            </div>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold bg-white text-purple-900 px-3 py-1.5 rounded-xl border border-purple-200 shrink-0">
          Vault ID: VLT-34501-8472
        </span>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                  {doc.referenceNo}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {doc.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {doc.title}
              </h3>

              <div className="text-xs text-slate-500 space-y-1 pt-1">
                <div>Issued By: <strong className="text-slate-700">{doc.issuedBy}</strong></div>
                <div className="flex items-center gap-4 text-[11px]">
                  <span>Date: {doc.date}</span>
                  <span>Format: PDF ({doc.size})</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">Ready for immediate export</span>
              <button
                onClick={() => handleDownload(doc)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Stamped PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
