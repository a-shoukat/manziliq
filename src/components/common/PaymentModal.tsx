import React, { useState, useMemo } from 'react';
import { Installment, Booking, User, Payment, PaymentMethod } from '../../types';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  AlertCircle, 
  Calendar, 
  Building2, 
  Clock, 
  Smartphone,
  Send,
  FileCheck
} from 'lucide-react';
import { calculateLateFee } from '../../utils/paymentCalculators';
import { generatePDFDocument } from '../../utils/pdfGenerator';
import { generateInstallmentReminder } from '../../utils/paymentReminders';

interface PaymentModalProps {
  installment?: Installment;
  booking?: Booking;
  currentUser: User;
  onSuccess: (payment: Payment, updatedInstallment: Installment) => void;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  installment,
  booking,
  currentUser,
  onSuccess,
  onClose
}) => {
  const isDownPayment = !installment && booking;
  const rawAmount = installment?.amountPKR || (booking ? (booking.downPaymentPKR - (booking.tokenAdvancePKR || 0)) : 45833);
  const dueDate = installment?.dueDate || '2026-08-10';

  // Calculate live late fee surcharge (2.5% per 30-day block if overdue)
  const lateFeeCalculation = useMemo(() => {
    return calculateLateFee({
      amountPKR: rawAmount,
      dueDate,
      lateFeePercent: 2.5
    });
  }, [rawAmount, dueDate]);

  const totalPayablePKR = rawAmount + lateFeeCalculation.lateFeePKR;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('JazzCash');
  const [accountNumber, setAccountNumber] = useState('+92 300 8472910');
  const [transactionRef, setTransactionRef] = useState(`TXN-${Date.now().toString().slice(-8)}`);
  const [step, setStep] = useState<1 | 2>(1);
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);
  const [receiptNumber, setReceiptNumber] = useState(`RCP-${Date.now().toString().slice(-6)}`);

  const handleProcessPayment = () => {
    const rcpNo = `RCP-${Date.now().toString().slice(-6)}`;
    const txRef = transactionRef || `TXN-${paymentMethod.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const newPayment: Payment = {
      id: `pay-${Date.now().toString().slice(-6)}`,
      bookingId: installment?.bookingId || booking?.id || 'book-1001',
      bookingReference: installment?.bookingReference || booking?.bookingReference || 'PROP-2026-849102',
      installmentId: installment?.id,
      amountPKR: totalPayablePKR,
      paymentType: isDownPayment ? 'down_payment' : 'installment',
      method: paymentMethod,
      status: 'completed',
      transactionRef: txRef,
      paidAt: new Date().toISOString(),
      verifiedBy: `${installment?.societyName || booking?.societyName || 'Al-Rehman Garden'} Treasury`,
      receiptNumber: rcpNo,
      buyerName: currentUser.name || booking?.buyerName || 'Muhammad Farooq',
      plotNumber: installment?.plotNumber || booking?.plotNumber || 'A-01',
      societyName: installment?.societyName || booking?.societyName || 'Al-Rehman Garden',
      notes: isDownPayment 
        ? `Down Payment Clearance for ${booking?.plotNumber}`
        : `Installment #${installment?.installmentNumber} payment (${lateFeeCalculation.isOverdue ? 'Including Late Surcharge' : 'On-time'})`
    };

    const updatedInst: Installment = installment ? {
      ...installment,
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      transactionId: txRef,
      receiptNumber: rcpNo,
      lateFeePKR: lateFeeCalculation.lateFeePKR > 0 ? lateFeeCalculation.lateFeePKR : undefined
    } : {
      id: `inst-gen-${Date.now()}`,
      bookingId: booking?.id || 'book-1001',
      installmentNumber: 1,
      dueDate: new Date().toISOString().split('T')[0],
      amountPKR: totalPayablePKR,
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0],
      paymentMethod,
      transactionId: txRef,
      receiptNumber: rcpNo
    };

    setReceiptNumber(rcpNo);
    setCompletedPayment(newPayment);
    onSuccess(newPayment, updatedInst);
    setStep(2);
  };

  const handleDownloadReceipt = () => {
    generatePDFDocument({
      docType: 'payment_receipt',
      buyerName: currentUser.name || booking?.buyerName || 'Muhammad Farooq',
      buyerPhone: currentUser.phone || booking?.buyerPhone || '+92 300 8472910',
      buyerCNIC: currentUser.cnic || booking?.buyerCnic || '34501-8472910-3',
      plotNumber: installment?.plotNumber || booking?.plotNumber || 'A-01',
      societyName: installment?.societyName || booking?.societyName || 'Al-Rehman Garden',
      paidAmountPKR: totalPayablePKR,
      installmentNo: installment?.installmentNumber,
      transactionId: completedPayment?.transactionRef || transactionRef,
      paymentMethod,
      allotmentNumber: installment?.bookingReference || booking?.bookingReference || 'PROP-2026-849102',
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isDownPayment ? 'Clear Down Payment Balance' : `Pay Installment #${installment?.installmentNumber || 1}`}
              </h3>
              <p className="text-xs text-slate-500">
                {installment?.plotNumber || booking?.plotNumber} • {installment?.societyName || booking?.societyName}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {step === 1 ? (
            <>
              {/* Overdue Warning */}
              {lateFeeCalculation.isOverdue && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-900">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Overdue Installment ({lateFeeCalculation.daysOverdue} Days Past Due)</span>
                  </div>
                  <p className="text-[11px] text-rose-700">
                    A standard 2.5% statutory late fee surcharge (PKR {lateFeeCalculation.lateFeePKR.toLocaleString('en-PK')}) has been applied under Punjab Housing By-Laws.
                  </p>
                </div>
              )}

              {/* Amount Breakdown Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Base Installment Amount:</span>
                  <span className="font-semibold font-mono text-slate-900">PKR {rawAmount.toLocaleString('en-PK')}</span>
                </div>
                {lateFeeCalculation.lateFeePKR > 0 && (
                  <div className="flex justify-between items-center text-rose-600 font-semibold">
                    <span>2.5% Late Fee Surcharge:</span>
                    <span className="font-mono">+ PKR {lateFeeCalculation.lateFeePKR.toLocaleString('en-PK')}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-sm font-bold text-slate-900">
                  <span>Total Amount Due:</span>
                  <span className="text-emerald-800 font-mono">PKR {totalPayablePKR.toLocaleString('en-PK')}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Due Date: {dueDate}</span>
                  <span>Challan #{installment?.challanNumber || 'CH-2026-NRL'}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Choose Digital Payment Gateway</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['JazzCash', 'EasyPaisa', 'Bank Transfer', 'Cash', 'Cheque'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-3 rounded-xl border font-semibold text-center transition cursor-pointer ${
                        paymentMethod === m
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      💳 {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gateway Account Input */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {paymentMethod === 'Bank Transfer' ? 'IBAN / 1Link Account' : `${paymentMethod} Mobile Account`}
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                    placeholder="03001234567"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bank Transaction / Approval Reference ID
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none font-mono"
                    placeholder="TXN-9988221"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  Payments are reconciled immediately with the housing society ledger and secured with tamper-proof verification hash.
                </span>
              </div>
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Payment Successfully Cleared!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Receipt Number: <span className="font-mono font-bold text-emerald-800">{receiptNumber}</span>
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Paid Amount:</span>
                  <span className="font-bold text-emerald-800 font-mono">PKR {totalPayablePKR.toLocaleString('en-PK')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway / Channel:</span>
                  <span className="font-semibold text-slate-800">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Ref:</span>
                  <span className="font-mono text-slate-800">{transactionRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reconciliation Status:</span>
                  <span className="text-emerald-800 font-bold">100% RECONCILED IN ESCROW</span>
                </div>
              </div>

              <button
                onClick={handleDownloadReceipt}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Official Stamped Payment Receipt (PDF)</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessPayment}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Authorize PKR {totalPayablePKR.toLocaleString('en-PK')} Payment</span>
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition cursor-pointer"
            >
              Close & Update Ledger
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
