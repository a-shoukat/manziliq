import React, { useState } from 'react';
import { Installment, Booking } from '../../types';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Building, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { generatePDFDocument } from '../../utils/pdfGenerator';

interface PaymentSimModalProps {
  installment: Installment;
  booking?: Booking;
  onSuccess: (updatedInstallment: Installment) => void;
  onClose: () => void;
}

export const PaymentSimModal: React.FC<PaymentSimModalProps> = ({
  installment,
  booking,
  onSuccess,
  onClose
}) => {
  const [method, setMethod] = useState<'JazzCash' | 'EasyPaisa' | '1Link Bank Transfer' | 'Pay Order / Challan'>('JazzCash');
  const [accountNumber, setAccountNumber] = useState('+92 300 8472910');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [txnId, setTxnId] = useState('');

  const lateFee = installment.lateFeePKR || (installment.status === 'overdue' ? Math.round(installment.amountPKR * 0.025) : 0);
  const totalPayable = installment.amountPKR + lateFee;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const generatedTxn = `TXN-${method.substring(0, 2).toUpperCase()}-${Date.now().toString().slice(-8)}`;
      setTxnId(generatedTxn);
      setIsProcessing(false);
      setIsCompleted(true);

      const updated: Installment = {
        ...installment,
        status: 'paid',
        paidDate: new Date().toISOString().split('T')[0],
        paymentMethod: method,
        transactionId: generatedTxn,
        lateFeePKR: lateFee > 0 ? lateFee : undefined
      };

      onSuccess(updated);
    }, 1200);
  };

  const handleDownloadReceipt = () => {
    generatePDFDocument({
      docType: 'receipt',
      buyerName: booking?.buyerName || 'Muhammad Farooq',
      buyerPhone: booking?.buyerPhone || '+92 300 8472910',
      buyerCNIC: booking?.buyerCnic || '34501-8472910-3',
      plotNumber: booking?.plotNumber || 'Plot A-01',
      sector: booking?.sector || 'Sector A',
      societyName: booking?.societyName || 'Al-Rehman Garden',
      totalPricePKR: booking?.totalPricePKR || 2750000,
      paidAmountPKR: totalPayable,
      installmentNo: installment.installmentNumber,
      transactionId: txnId || installment.transactionId || 'TXN-SIMULATED-991',
      paymentMethod: method,
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isCompleted ? 'Payment Successful' : `Pay Installment #${installment.installmentNumber}`}
              </h3>
              <p className="text-xs text-slate-500">Challan Ref: {installment.challanNumber || `CH-2026-${installment.installmentNumber}`}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {!isCompleted ? (
            <>
              {/* Payment Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Base Installment Amount:</span>
                  <span className="font-semibold text-slate-900">PKR {installment.amountPKR.toLocaleString('en-PK')}</span>
                </div>

                {lateFee > 0 && (
                  <div className="flex justify-between text-xs text-amber-700 font-medium">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Late Surcharge (2.5%):
                    </span>
                    <span>+ PKR {lateFee.toLocaleString('en-PK')}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                  <span>Total Amount Payable:</span>
                  <span className="text-emerald-700">PKR {totalPayable.toLocaleString('en-PK')}</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Select Instant Payment Gateway</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('JazzCash')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      method === 'JazzCash'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-rose-600" />
                    <span>JazzCash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('EasyPaisa')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      method === 'EasyPaisa'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>EasyPaisa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('1Link Bank Transfer')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      method === '1Link Bank Transfer'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-4 h-4 text-blue-600" />
                    <span>1Link 1Bill Bank</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('Pay Order / Challan')}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                      method === 'Pay Order / Challan'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Receipt className="w-4 h-4 text-purple-600" />
                    <span>Bank Challan</span>
                  </button>
                </div>
              </div>

              {/* Mobile/Account Field */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {method.includes('Bank') ? 'IBAN / 1Link Customer ID' : 'Wallet Mobile Number / CNIC'}
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none"
                  placeholder="+92 300 1234567"
                />
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Secured by 256-bit bank-grade encryption with instant society ledger sync.</span>
              </div>
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">PKR {totalPayable.toLocaleString('en-PK')} Paid Successfully!</h4>
                <p className="text-xs text-slate-500 mt-1">Transaction Ref: <span className="font-mono font-bold text-slate-800">{txnId}</span></p>
                <p className="text-xs text-slate-500">Method: {method} • {new Date().toLocaleTimeString()}</p>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium">
                Your payment has cleared and the society allotment register has been updated. Notification dispatched via In-App, SMS, and Email.
              </div>

              <button
                onClick={handleDownloadReceipt}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Official Stamped PDF Receipt</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {!isCompleted ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handlePay}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? 'Processing Transaction...' : `Confirm Payment PKR ${totalPayable.toLocaleString('en-PK')}`}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition cursor-pointer"
            >
              Done & Return to Schedule
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
