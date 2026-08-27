import React, { useState } from 'react';
import { Installment, Booking } from '../types';
import { generatePDFDocument } from '../utils/pdfGenerator';
import { X, CheckCircle2, Smartphone, CreditCard, ShieldCheck, Download, ArrowRight, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  booking: Booking;
  installment?: Installment;
  onClose: () => void;
  onPaymentSuccess: (bookingId: string, installmentId?: string, paymentMethod?: string, txnId?: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  booking,
  installment,
  onClose,
  onPaymentSuccess
}) => {
  const [method, setMethod] = useState<'JazzCash' | 'EasyPaisa' | 'Bank Transfer' | 'Card'>('JazzCash');
  const [mobileNumber, setMobileNumber] = useState('+92 300 8472910');
  const [pinCode, setPinCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [completedTxn, setCompletedTxn] = useState<{ txnId: string; amount: number; date: string } | null>(null);

  if (!isOpen) return null;

  const paymentAmount = installment ? installment.amountPKR : booking.downPaymentPKR;

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    setTimeout(() => {
      const generatedTxnId = `${method === 'JazzCash' ? 'JC' : method === 'EasyPaisa' ? 'EP' : 'TXN'}-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const nowStr = new Date().toISOString().split('T')[0];

      setProcessing(false);
      setCompletedTxn({
        txnId: generatedTxnId,
        amount: paymentAmount,
        date: nowStr
      });

      onPaymentSuccess(booking.id, installment?.id, method, generatedTxnId);
    }, 1500);
  };

  const handleDownloadReceipt = () => {
    if (!completedTxn) return;
    generatePDFDocument({
      docType: 'receipt',
      buyerName: booking.buyerName,
      buyerPhone: booking.buyerPhone,
      plotNumber: booking.plotNumber,
      sector: booking.sector,
      societyName: booking.societyName,
      totalPricePKR: booking.totalPricePKR,
      paidAmountPKR: completedTxn.amount,
      installmentNo: installment?.installmentNumber,
      transactionId: completedTxn.txnId,
      paymentMethod: method,
      date: completedTxn.date
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {!completedTxn ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-400 font-bold text-xs px-2 py-0.5 rounded border border-emerald-500/30">
                Simulated Payment Gateway
              </span>
            </div>

            <h3 className="text-xl font-bold font-[Outfit]">Online Installment Payment</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {booking.societyName} • Plot {booking.plotNumber} ({booking.sector})
            </p>

            {/* Amount Banner */}
            <div className="my-4 bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium block">
                  {installment ? `Installment #${installment.installmentNumber}` : 'Down Payment'}
                </span>
                <span className="text-2xl font-black text-amber-400 font-[Outfit]">
                  PKR {paymentAmount.toLocaleString('en-PK')}
                </span>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-400 opacity-80" />
            </div>

            {/* Payment Method Selector */}
            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('JazzCash')}
                    className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                      method === 'JazzCash'
                        ? 'border-red-500 bg-red-500/10 text-red-400'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-red-500" />
                    <span>JazzCash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('EasyPaisa')}
                    className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                      method === 'EasyPaisa'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                    <span>EasyPaisa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('Bank Transfer')}
                    className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                      method === 'Bank Transfer'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    <span>Bank Transfer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('Card')}
                    className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                      method === 'Card'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-indigo-500" />
                    <span>Debit/Credit Card</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {method === 'JazzCash' || method === 'EasyPaisa' ? 'Account Mobile Number' : 'Account Details / CNIC'}
                </label>
                <input
                  type="text"
                  required
                  value={mobileNumber}
                  onChange={e => setMobileNumber(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">MPIN / Secret Code</label>
                <input
                  type="password"
                  required
                  maxLength={5}
                  placeholder="••••"
                  value={pinCode}
                  onChange={e => setPinCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Pay PKR {paymentAmount.toLocaleString('en-PK')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* Payment Success Confirmation */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-2xl font-black font-[Outfit] text-white">Payment Successful!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your payment has been cleared and logged into MANZILIQ Smart Ledger.
              </p>
            </div>

            <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono font-bold text-amber-400">{completedTxn.txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount Paid:</span>
                <span className="font-bold text-white">PKR {completedTxn.amount.toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment Method:</span>
                <span className="font-bold text-white">{method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Society:</span>
                <span className="font-bold text-white">{booking.societyName}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleDownloadReceipt}
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Official PDF Receipt</span>
              </button>

              <button
                onClick={onClose}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl transition-colors text-xs font-semibold"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
