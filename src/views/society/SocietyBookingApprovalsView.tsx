import React, { useState } from 'react';
import { Booking, Society, User } from '../../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Download, 
  FileText, 
  ShieldCheck, 
  XCircle, 
  ArrowRight,
  Calculator,
  QrCode,
  Stamp,
  FileCheck2,
  ExternalLink,
  Sparkles,
  Award,
  Landmark
} from 'lucide-react';
import { generatePDFDocument } from '../../utils/pdfGenerator';
import { 
  generateTransferDeedPDF, 
  generateSaleAgreementPDF, 
  uploadDocumentToSupabase 
} from '../../services/legalDocumentService';

interface SocietyBookingApprovalsViewProps {
  society: Society;
  bookings: Booking[];
  onAdvancePipeline: (bookingId: string) => void;
  onCancelBooking: (bookingId: string, reason: string, penaltyPKR: number) => void;
  onDocumentGenerated?: (docData: any) => void;
}

export const SocietyBookingApprovalsView: React.FC<SocietyBookingApprovalsViewProps> = ({
  society,
  bookings,
  onAdvancePipeline,
  onCancelBooking,
  onDocumentGenerated
}) => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(bookings[0] || null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Buyer requested cancellation due to personal relocation.');

  // Transfer Deed Customization Modal State
  const [transferDeedModalOpen, setTransferDeedModalOpen] = useState(false);
  const [transferFeePKR, setTransferFeePKR] = useState<number>(78000);
  const [registrarName, setRegistrarName] = useState('Director Town Planning & Land Transfers');
  const [district, setDistrict] = useState('Narowal / Lahore, Punjab');
  const [witness1, setWitness1] = useState('Muhammad Tariq (Advocate High Court)');
  const [witness2, setWitness2] = useState('Nadeem Akram (Licensed Real Estate Consultant)');
  const [generatingDeed, setGeneratingDeed] = useState(false);
  const [deedSuccessModal, setDeedSuccessModal] = useState<any>(null);

  // Digital Agreement Customization Modal State
  const [agreementModalOpen, setAgreementModalOpen] = useState(false);
  const [generatingAgreement, setGeneratingAgreement] = useState(false);

  const societyBookings = bookings.filter(b => b.societyName.includes(society.name.split(' ')[0]));

  const handleIssueAllotmentPDF = (b: Booking) => {
    generatePDFDocument({
      docType: 'allotment_letter',
      buyerName: b.buyerName,
      buyerPhone: b.buyerPhone,
      buyerCNIC: b.buyerCnic,
      plotNumber: b.plotNumber,
      sector: b.sector,
      societyName: b.societyName,
      totalPricePKR: b.totalPricePKR,
      downPaymentPKR: b.downPaymentPKR,
      allotmentNumber: b.allotmentLetterNumber || 'AR-2026-0841',
      date: '2026-08-19'
    });
  };

  const handleOpenTransferDeedModal = (b: Booking) => {
    setSelectedBooking(b);
    setTransferFeePKR(Math.round(b.totalPricePKR * 0.03));
    setTransferDeedModalOpen(true);
  };

  const handleGenerateTransferDeed = async () => {
    if (!selectedBooking) return;
    setGeneratingDeed(true);

    try {
      const result = await generateTransferDeedPDF({
        buyerName: selectedBooking.buyerName,
        buyerCnic: selectedBooking.buyerCnic || '34501-8472910-1',
        buyerPhone: selectedBooking.buyerPhone,
        societyName: selectedBooking.societyName || society.name,
        societyNoc: society.nocNumber || 'TMA/LDA Verified 2026/89',
        plotNumber: selectedBooking.plotNumber,
        sector: selectedBooking.sector || 'Executive Block',
        block: selectedBooking.sector?.split(' ')[1] || 'Block A',
        sizeMarla: 5,
        location: society.location || 'Narowal / Lahore, Punjab',
        totalPricePKR: selectedBooking.totalPricePKR,
        transferFeePKR: transferFeePKR,
        registrarName,
        district,
        witness1Name: witness1,
        witness2Name: witness2
      }, { download: true });

      // Upload to Supabase storage bucket documents/transfer-deeds/
      await uploadDocumentToSupabase({
        bookingId: selectedBooking.id,
        userId: selectedBooking.buyerId || 'usr-buyer-001',
        societyId: society.id,
        docType: 'transfer_deed',
        title: result.title,
        pdfBlob: result.pdfBlob,
        storagePath: result.storagePath,
        verificationCode: result.verificationCode,
        tamperHash: result.tamperHash,
        fileSize: result.fileSize
      });

      if (onDocumentGenerated) {
        onDocumentGenerated(result);
      }

      setDeedSuccessModal(result);
      setTransferDeedModalOpen(false);
    } catch (err) {
      console.error('Error generating deed:', err);
    } finally {
      setGeneratingDeed(false);
    }
  };

  const handleGenerateAgreement = async (b: Booking) => {
    setGeneratingAgreement(true);
    try {
      const result = await generateSaleAgreementPDF({
        buyerName: b.buyerName,
        buyerCnic: b.buyerCnic || '34501-8472910-1',
        buyerPhone: b.buyerPhone,
        buyerEmail: b.buyerEmail,
        societyName: b.societyName || society.name,
        societyNoc: society.nocNumber || 'LDA/TMA Verified',
        plotNumber: b.plotNumber,
        sector: b.sector || 'Executive Block',
        block: 'Block A',
        sizeMarla: 5,
        location: society.location || 'Narowal, Punjab',
        totalPricePKR: b.totalPricePKR,
        downPaymentPKR: b.downPaymentPKR || Math.round(b.totalPricePKR * 0.2),
        monthlyInstallmentPKR: b.monthlyInstallmentPKR || Math.round((b.totalPricePKR * 0.8) / 36),
        totalInstallments: b.totalInstallments || 36,
        dealerName: b.dealerName
      }, { download: true });

      await uploadDocumentToSupabase({
        bookingId: b.id,
        userId: b.buyerId || 'usr-buyer-001',
        societyId: society.id,
        docType: 'sale_agreement',
        title: result.title,
        pdfBlob: result.pdfBlob,
        storagePath: result.storagePath,
        verificationCode: result.verificationCode,
        tamperHash: result.tamperHash,
        fileSize: result.fileSize
      });

      if (onDocumentGenerated) {
        onDocumentGenerated(result);
      }

      setDeedSuccessModal(result);
      setAgreementModalOpen(false);
    } catch (err) {
      console.error('Error generating agreement:', err);
    } finally {
      setGeneratingAgreement(false);
    }
  };

  const handleConfirmCancel = () => {
    if (!selectedBooking) return;
    const penalty = Math.round(selectedBooking.totalPricePKR * 0.10);
    onCancelBooking(selectedBooking.id, cancelReason, penalty);
    setCancelModalOpen(false);
  };

  const isCompletedOrFullyPaid = (b: Booking) => {
    return b.pipelineStage === 6 || b.status === 'completed';
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CheckCircle2 className="w-7 h-7 text-emerald-800" />
            <span>Booking Verification, Agreements & Transfer Queue</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review token advances, issue Digital Sale Agreements, stamp Allotment Letters, or execute official Transfer Deeds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-slate-600 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-xs">
            Queue: <strong className="text-emerald-800">{societyBookings.length} Bookings</strong>
          </div>
        </div>
      </div>

      {/* Grid: List (Left) vs Deep Approval Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Booking Cards (Left) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Active Applications & Allotment Queue
          </div>

          {societyBookings.map((b) => {
            const isSelected = selectedBooking?.id === b.id;
            const isCompleted = isCompletedOrFullyPaid(b);

            return (
              <div
                key={b.id}
                onClick={() => setSelectedBooking(b)}
                className={`p-5 rounded-3xl border transition cursor-pointer space-y-2.5 ${
                  isSelected
                    ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-400 shadow-sm'
                    : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{b.plotNumber}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    isCompleted 
                      ? 'bg-purple-100 text-purple-900 border border-purple-200' 
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {isCompleted ? '✓ Stage 6: Transfer Ready' : `Stage ${b.pipelineStage} of 6`}
                  </span>
                </div>

                <div>
                  <div className="font-semibold text-slate-800 text-xs">{b.buyerName}</div>
                  <div className="text-slate-500 text-[11px]">CNIC: {b.buyerCnic} • Ref: {b.id}</div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-800 font-extrabold">PKR {b.totalPricePKR.toLocaleString('en-PK')}</span>
                  <span className="text-[11px] text-slate-400">Date: {b.bookingDate}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Deep Approval Inspector (Right) */}
        {selectedBooking && (
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Application Dossier
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                  {selectedBooking.plotNumber} ({selectedBooking.sector})
                </h2>
                <p className="text-xs text-slate-500">
                  Allottee: <strong>{selectedBooking.buyerName}</strong> • CNIC: {selectedBooking.buyerCnic || '34501-8472910-1'}
                </p>
              </div>

              {/* Quick Document Generation Tools */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Generate Allotment Letter */}
                <button
                  onClick={() => handleIssueAllotmentPDF(selectedBooking)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
                  title="Generate Allotment Letter PDF"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-700" />
                  <span>Allotment Letter</span>
                </button>

                {/* Generate Digital Sale Agreement */}
                <button
                  onClick={() => handleGenerateAgreement(selectedBooking)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition cursor-pointer"
                  title="Generate Digital Real Estate Sale Agreement with E-Signatures"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-blue-700" />
                  <span>Sale Agreement</span>
                </button>
              </div>
            </div>

            {/* Stage Progress Bar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-700">Official 6-Stage Statutory Pipeline</div>
                <span className="text-[11px] font-bold text-emerald-800">
                  {selectedBooking.pipelineStage === 6 ? 'Transfer Deed Handover Ready' : `Current Stage ${selectedBooking.pipelineStage}/6`}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {selectedBooking.timeline.map((s) => (
                  <div
                    key={s.stage}
                    className={`p-3 rounded-2xl border flex items-center justify-between ${
                      s.completed
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        s.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {s.completed ? '✓' : s.stage}
                      </span>
                      <span>{s.label}</span>
                    </div>
                    <span className="font-mono text-[11px]">{s.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Details */}
            <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div>
                <div className="text-slate-400 font-semibold">Total Price</div>
                <div className="font-bold text-slate-900 mt-0.5">PKR {selectedBooking.totalPricePKR.toLocaleString('en-PK')}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold">Downpayment (20%)</div>
                <div className="font-bold text-emerald-700 mt-0.5">PKR {selectedBooking.downPaymentPKR?.toLocaleString('en-PK')}</div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold">Monthly Installment</div>
                <div className="font-bold text-slate-900 mt-0.5">PKR {selectedBooking.monthlyInstallmentPKR?.toLocaleString('en-PK') || '57,778'}</div>
              </div>
            </div>

            {/* Special Highlight Banner for Completed Sale / Transfer Deed Eligibility */}
            {isCompletedOrFullyPaid(selectedBooking) && (
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-200 text-purple-900 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-purple-950">
                      Plot Sale Fully Completed — Transfer Deed Eligible
                    </div>
                    <div className="text-[11px] text-purple-800">
                      All installments and statutory requirements are reconciled. You can execute and issue the official Transfer Deed.
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenTransferDeedModal(selectedBooking)}
                  className="px-4 py-2.5 bg-purple-800 hover:bg-purple-900 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Stamp className="w-4 h-4" />
                  <span>Generate Transfer Deed (PDF)</span>
                </button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setCancelModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Cancel Booking & Impose 10% Penalty</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {selectedBooking.pipelineStage < 6 ? (
                  <button
                    onClick={() => onAdvancePipeline(selectedBooking.id)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Approve & Advance to Stage {selectedBooking.pipelineStage + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenTransferDeedModal(selectedBooking)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-purple-800 hover:bg-purple-900 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Stamp className="w-4 h-4" />
                    <span>Re-issue Transfer Deed</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Transfer Deed Generation Modal */}
      {transferDeedModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-purple-900 font-extrabold text-base">
                <Landmark className="w-5 h-5 text-purple-700" />
                <span>Generate Official Transfer Deed (Sub-Registrar Compliant)</span>
              </div>
              <button 
                onClick={() => setTransferDeedModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600">
              Generate an official, tamper-evident Deed of Absolute Ownership Transfer for <strong>Plot {selectedBooking.plotNumber}</strong> with QR verification and official Punjab Housing seals.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Transferee / Purchaser Name</label>
                <input
                  type="text"
                  value={selectedBooking.buyerName}
                  disabled
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">NADRA Verified CNIC</label>
                <input
                  type="text"
                  value={selectedBooking.buyerCnic || '34501-8472910-1'}
                  disabled
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Plot Identification</label>
                <input
                  type="text"
                  value={`${selectedBooking.plotNumber} (${selectedBooking.sector})`}
                  disabled
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Transfer Fee (PKR)</label>
                <input
                  type="number"
                  value={transferFeePKR}
                  onChange={(e) => setTransferFeePKR(Number(e.target.value))}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-emerald-800 outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Society Registrar / Signatory</label>
                <input
                  type="text"
                  value={registrarName}
                  onChange={(e) => setRegistrarName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">District / Jurisdiction</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>
            </div>

            <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200 space-y-1">
              <div className="flex items-center gap-2 text-purple-900 font-bold">
                <QrCode className="w-4 h-4" />
                <span>Verification QR Code & Supabase Cloud Storage</span>
              </div>
              <p className="text-[11px] text-purple-800">
                This document will be saved directly into Supabase Storage under <code>documents/transfer-deeds/</code> and recorded in the Buyer's Document Locker.
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setTransferDeedModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateTransferDeed}
                disabled={generatingDeed}
                className="px-5 py-2.5 bg-purple-800 hover:bg-purple-900 text-white rounded-xl font-bold transition shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Stamp className="w-4 h-4" />
                <span>{generatingDeed ? 'Generating & Storing PDF...' : 'Execute & Download Transfer Deed'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Modal */}
      {deedSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 text-xs text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Legal Document Generated & Stored!</h3>
              <p className="text-slate-500 mt-1">{deedSuccessModal.title}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left space-y-1.5 font-mono text-[11px]">
              <div><strong>Doc ID:</strong> {deedSuccessModal.docId}</div>
              <div><strong>Verification Hash:</strong> {deedSuccessModal.tamperHash}</div>
              <div><strong>Cloud Path:</strong> {deedSuccessModal.storagePath}</div>
              <div><strong>File Size:</strong> {deedSuccessModal.fileSize}</div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeedSuccessModal(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition shadow-sm"
              >
                Close & Return to Queue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Penalty Modal */}
      {cancelModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Booking Cancellation</span>
            </div>

            <p className="text-slate-600">
              Under Punjab Housing Authority bylaws, cancelling <strong>Plot {selectedBooking.plotNumber}</strong> will release the plot back to available inventory and apply a <strong>10% contract cancellation penalty</strong>:
            </p>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
              <div className="flex justify-between">
                <span>Total Unit Price:</span>
                <span className="font-bold">PKR {selectedBooking.totalPricePKR.toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between text-rose-800 font-bold">
                <span>10% Statutory Penalty:</span>
                <span>PKR {Math.round(selectedBooking.totalPricePKR * 0.10).toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between text-slate-700 pt-1 border-t border-rose-200">
                <span>Refund to Allottee:</span>
                <span className="font-bold">PKR {Math.max(0, (selectedBooking.downPaymentPKR || 0) - Math.round(selectedBooking.totalPricePKR * 0.10)).toLocaleString('en-PK')}</span>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Cancellation Legal Justification</label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
              >
                Confirm Cancellation & Issue Deed
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
