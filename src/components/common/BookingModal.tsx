import React, { useState, useMemo } from 'react';
import { Plot, Property, User, Booking, Installment, Payment, InstallmentPlanType, PaymentMethod } from '../../types';
import { 
  X, 
  Building2, 
  FileCheck2, 
  CreditCard, 
  Upload, 
  CheckCircle2, 
  ShieldCheck, 
  Download,
  AlertCircle,
  Lock,
  Calendar,
  Layers,
  Sparkles,
  DollarSign
} from 'lucide-react';
import { generateInstallmentPlan } from '../../utils/paymentCalculators';
import { generatePDFDocument } from '../../utils/pdfGenerator';

interface BookingModalProps {
  item: {
    plot?: Plot;
    property?: Property;
  };
  currentUser: User;
  onSuccess: (newBooking: Booking, generatedInstallments: Installment[], paymentRecord: Payment) => void;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  item,
  currentUser,
  onSuccess,
  onClose
}) => {
  const plot = item.plot;
  const property = item.property;

  const title = plot 
    ? `Plot ${plot.plotNumber} (${plot.sector || 'Sector A'}, ${plot.block || 'Executive'})` 
    : (property?.title || 'Property Booking');

  const price = plot?.pricePKR || property?.pricePKR || 2500000;
  const societyName = plot?.societyName || property?.societyName || 'Al-Rehman Garden';
  const societyId = plot?.societyId || property?.societyId || 'soc-1';
  const plotNumber = plot?.plotNumber || property?.plotNumber || 'Plot A-01';
  const sector = plot?.sector || property?.sector || 'Sector A';
  const sizeMarla = plot?.sizeMarla || property?.sizeMarla || 5;

  // Concurrency auto-lock check
  const isAlreadyReservedOrSold = plot?.status === 'reserved' || plot?.status === 'sold' || plot?.isLocked;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [purchaseType, setPurchaseType] = useState<'direct_society' | 'dealer_assisted'>(
    plot?.dealerId || property?.dealerId ? 'dealer_assisted' : 'direct_society'
  );
  const [selectedDealerName, setSelectedDealerName] = useState(
    plot?.dealerName || property?.dealerName || 'Chaudhry Tariq Real Estate'
  );
  const [selectedDealerId, setSelectedDealerId] = useState(
    plot?.dealerId || property?.dealerId || 'u-dealer-1'
  );

  // Applicant details
  const [buyerName, setBuyerName] = useState(currentUser.name || 'Muhammad Farooq');
  const [buyerPhone, setBuyerPhone] = useState(currentUser.phone || '+92 300 8472910');
  const [buyerCnic, setBuyerCnic] = useState(currentUser.cnic || '34501-8472910-3');
  const [buyerAddress, setBuyerAddress] = useState('House 14, Street 3, Main City');
  const [cnicFileName, setCnicFileName] = useState<string | null>('cnic_front_back_scanned.pdf');

  // Plan configuration
  const [planType, setPlanType] = useState<InstallmentPlanType>('3_year');
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [tokenAmountPKR, setTokenAmountPKR] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('JazzCash');
  const [transactionNote, setTransactionNote] = useState<string>('Online Token Advance Deposit');

  // Result state
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);

  // Live calculated plan preview
  const calculatedPlan = useMemo(() => {
    return generateInstallmentPlan({
      totalPricePKR: price,
      downPaymentPercent,
      planType,
      tokenAdvancePKR: tokenAmountPKR,
      plotNumber,
      societyName
    });
  }, [price, downPaymentPercent, planType, tokenAmountPKR, plotNumber, societyName]);

  const handleCreateBooking = () => {
    const bookingId = `book-${Date.now().toString().slice(-6)}`;
    const bookingReference = `PROP-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const plan = generateInstallmentPlan({
      totalPricePKR: price,
      downPaymentPercent,
      planType,
      tokenAdvancePKR: tokenAmountPKR,
      bookingId,
      bookingReference,
      plotNumber,
      societyName
    });

    const newBooking: Booking = {
      id: bookingId,
      bookingReference,
      buyerId: currentUser.id,
      buyerName,
      buyerEmail: currentUser.email,
      buyerPhone,
      buyerCnic,
      plotId: plot?.id || property?.id || `plot-${Date.now()}`,
      plotNumber,
      sector,
      societyId,
      societyName,
      totalPricePKR: price,
      downPaymentPKR: plan.downPaymentPKR,
      tokenAdvancePKR: tokenAmountPKR,
      monthlyInstallmentPKR: plan.monthlyInstallmentPKR,
      totalInstallments: plan.tenureMonths,
      installmentPlanType: planType,
      status: 'pending',
      pipelineStage: 3, // Stage 3: Token Received & Plot Locked
      timeline: [
        { 
          stage: 1, 
          label: 'Inquiry Received & Logged', 
          timestamp: new Date().toISOString().split('T')[0], 
          completed: true, 
          note: `Client registered inquiry for ${title}` 
        },
        { 
          stage: 2, 
          label: 'Site Visit / Online Selection', 
          timestamp: new Date().toISOString().split('T')[0], 
          completed: true, 
          note: purchaseType === 'dealer_assisted' ? `Coordinated with ${selectedDealerName}` : 'Direct society online reservation'
        },
        { 
          stage: 3, 
          label: `Token Amount Received (PKR ${tokenAmountPKR.toLocaleString('en-PK')})`, 
          timestamp: new Date().toISOString().split('T')[0], 
          completed: true, 
          note: `Token verified in society escrow via ${paymentMethod}. Auto-lock triggered.` 
        },
        { 
          stage: 4, 
          label: 'Sale & Purchase Agreement Signed', 
          timestamp: 'Under Review', 
          completed: false, 
          note: 'Society admin and legal team verifying submitted CNIC' 
        },
        { 
          stage: 5, 
          label: 'Full Downpayment / Installments Active', 
          timestamp: 'Pending', 
          completed: false 
        },
        { 
          stage: 6, 
          label: 'Transfer Request & Absolute Deed', 
          timestamp: 'Pending', 
          completed: false 
        }
      ],
      bookingDate: new Date().toISOString().split('T')[0],
      dealerId: purchaseType === 'dealer_assisted' ? selectedDealerId : undefined,
      dealerName: purchaseType === 'dealer_assisted' ? selectedDealerName : undefined,
      isAutoLocked: true,
      lockedAt: new Date().toISOString(),
      lockedByUserId: currentUser.id,
      notes: `Purchase Channel: ${purchaseType === 'dealer_assisted' ? `Dealer Assisted (${selectedDealerName})` : 'Direct Society Purchase'}`
    };

    const paymentRecord: Payment = {
      id: `pay-${Date.now().toString().slice(-6)}`,
      bookingId,
      bookingReference,
      amountPKR: tokenAmountPKR,
      paymentType: 'token',
      method: paymentMethod,
      status: 'completed',
      transactionRef: `TXN-TOK-${Date.now().toString().slice(-8)}`,
      paidAt: new Date().toISOString(),
      verifiedBy: `${societyName} Finance Dept`,
      receiptNumber: `RCP-TOK-${bookingReference.replace('PROP-', '')}`,
      buyerName,
      plotNumber,
      societyName,
      notes: `Token reservation payment for ${plotNumber}`
    };

    setCreatedBooking(newBooking);
    onSuccess(newBooking, plan.installments, paymentRecord);
    setStep(3);
  };

  const handleDownloadTokenReceipt = () => {
    if (!createdBooking) return;
    generatePDFDocument({
      docType: 'token_receipt',
      buyerName,
      buyerPhone,
      buyerCNIC: buyerCnic,
      buyerAddress,
      plotNumber: createdBooking.plotNumber,
      sector: createdBooking.sector,
      sizeMarla,
      societyName: createdBooking.societyName,
      totalPricePKR: price,
      downPaymentPKR: calculatedPlan.downPaymentPKR,
      paidAmountPKR: tokenAmountPKR,
      transactionId: `TXN-TOK-${Date.now().toString().slice(-6)}`,
      paymentMethod,
      bookingReference: createdBooking.bookingReference,
      dealerName: createdBooking.dealerName,
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Official Booking & Auto-Lock Reservation
              </h3>
              <p className="text-xs text-slate-500">{title} • {societyName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning if already reserved */}
        {isAlreadyReservedOrSold && step === 1 && (
          <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-xs text-amber-900 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Concurrency Lock Alert:</strong> This plot currently has an active reservation or lock in the database. Proceeding will trigger dual-verification review.
            </span>
          </div>
        )}

        {/* Multi-step progress bar */}
        <div className="grid grid-cols-3 border-b border-slate-200 text-xs font-semibold text-center bg-white">
          <div className={`py-2.5 border-b-2 ${step >= 1 ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40' : 'border-transparent text-slate-400'}`}>
            1. Applicant & Channel
          </div>
          <div className={`py-2.5 border-b-2 ${step >= 2 ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40' : 'border-transparent text-slate-400'}`}>
            2. Plan & Token Payment
          </div>
          <div className={`py-2.5 border-b-2 ${step === 3 ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40' : 'border-transparent text-slate-400'}`}>
            3. Auto-Lock & Receipt
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              {/* Purchase Channel Switcher */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Purchase Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPurchaseType('direct_society')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      purchaseType === 'direct_society'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Building2 className="w-4 h-4 text-emerald-700" />
                      <span>Direct Society Purchase</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Direct booking from {societyName} head office inventory pool.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPurchaseType('dealer_assisted')}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                      purchaseType === 'dealer_assisted'
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <Layers className="w-4 h-4 text-emerald-700" />
                      <span>Authorized Dealer Assisted</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Facilitated by certified agency with single-broker quota.
                    </p>
                  </button>
                </div>
              </div>

              {purchaseType === 'dealer_assisted' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                  <label className="font-bold text-slate-700">Facilitating Certified Dealer</label>
                  <select
                    value={selectedDealerName}
                    onChange={(e) => {
                      setSelectedDealerName(e.target.value);
                      if (e.target.value.includes('Tariq')) setSelectedDealerId('u-dealer-1');
                      else setSelectedDealerId('u-dealer-2');
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Chaudhry Tariq Real Estate">Chaudhry Tariq Real Estate (Reg # REA-NRL-2024-88)</option>
                    <option value="Bismillah Estate Lahore">Bismillah Estate (Reg # REA-PK-2026-42)</option>
                  </select>
                </div>
              )}

              {/* Applicant Fields */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Applicant Full Name (As per NADRA CNIC)</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="Muhammad Farooq"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">NADRA CNIC Number</label>
                    <input
                      type="text"
                      value={buyerCnic}
                      onChange={(e) => setBuyerCnic(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none"
                      placeholder="34501-1234567-1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp / Contact Phone</label>
                    <input
                      type="text"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none"
                      placeholder="+92 300 1234567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Postal / Residential Address</label>
                  <input
                    type="text"
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 outline-none"
                    placeholder="House number, Street, City"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Upload Scanned CNIC (Front & Back Copy)</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center hover:border-emerald-500 transition cursor-pointer bg-slate-50/50">
                    <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-700">
                      {cnicFileName || 'Click or drag & drop NADRA CNIC copy (PDF / JPG)'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Mandatory for Punjab Housing By-Laws registry allotment</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Installment Plan Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Select Installment Schedule Option</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { type: 'lump_sum', label: '100% Lump Sum', sub: 'Instant Transfer' },
                    { type: '1_year', label: '1-Year Plan', sub: '12 Installments' },
                    { type: '3_year', label: '3-Year Plan', sub: '36 Installments' },
                    { type: '5_year', label: '5-Year Plan', sub: '60 Installments' },
                  ].map(p => (
                    <button
                      key={p.type}
                      type="button"
                      onClick={() => setPlanType(p.type as InstallmentPlanType)}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        planType === p.type
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-xs">{p.label}</p>
                      <p className="text-[10px] opacity-75">{p.sub}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Financial Calculation Breakdown Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Total Property Price:</span>
                  <span className="text-sm font-bold text-slate-900">PKR {price.toLocaleString('en-PK')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Selected Down Payment ({calculatedPlan.downPaymentPercent}%):</span>
                  <span className="font-bold text-emerald-800">PKR {calculatedPlan.downPaymentPKR.toLocaleString('en-PK')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Initial Token Advance (Due Now):</span>
                  <span className="font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">
                    PKR {tokenAmountPKR.toLocaleString('en-PK')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Net Balance Down Payment (Due upon agreement):</span>
                  <span className="font-semibold text-slate-700">PKR {calculatedPlan.netDownPaymentPKR.toLocaleString('en-PK')}</span>
                </div>
                {calculatedPlan.tenureMonths > 0 && (
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-slate-600 font-bold">Monthly Installment ({calculatedPlan.tenureMonths} Months):</span>
                    <span className="text-sm font-bold text-emerald-800">
                      PKR {calculatedPlan.monthlyInstallmentPKR.toLocaleString('en-PK')}/mo
                    </span>
                  </div>
                )}
              </div>

              {/* Token Payment Method Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Select Instant Escrow Token Payment Channel</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['JazzCash', 'EasyPaisa', 'Bank Transfer', 'Cash', 'Cheque'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2.5 rounded-xl border font-semibold text-center transition cursor-pointer ${
                        paymentMethod === m
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      💳 {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
                <Lock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <span>
                  <strong>Database-Level Auto-Lock:</strong> Upon submitting this token deposit, Plot <strong>{plotNumber}</strong> will be instantly locked in the society master database, preventing duplicate reservations.
                </span>
              </div>
            </div>
          )}

          {step === 3 && createdBooking && (
            <div className="text-center py-3 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Plot Reservation & Auto-Lock Successfully Executed!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Official Booking Reference: <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">{createdBooking.bookingReference}</span>
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-bold text-slate-900">
                  <span>6-Stage Deal Pipeline Stage:</span>
                  <span className="text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
                    Stage 3: Token Received & Plot Locked
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div><strong>Plot:</strong> {createdBooking.plotNumber} ({createdBooking.sector})</div>
                  <div><strong>Society:</strong> {createdBooking.societyName}</div>
                  <div><strong>Token Paid:</strong> PKR {tokenAmountPKR.toLocaleString('en-PK')} ({paymentMethod})</div>
                  <div><strong>Plan Tenure:</strong> {calculatedPlan.tenureMonths} Months ({planType.replace('_', ' ')})</div>
                </div>
                <p className="text-[11px] text-slate-500 pt-1">
                  A digital token receipt has been signed and placed in your <strong>Document Locker</strong>.
                </p>
              </div>

              <button
                onClick={handleDownloadTokenReceipt}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Stamped Token Money Receipt (PDF)</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          {step === 1 && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition shadow-xs cursor-pointer"
              >
                Configure Plan & Payment &rarr;
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition cursor-pointer"
              >
                &larr; Back
              </button>
              <button
                onClick={handleCreateBooking}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Confirm Token Deposit & Auto-Lock Plot</span>
              </button>
            </>
          )}

          {step === 3 && (
            <button
              onClick={onClose}
              className="w-full py-2.5 text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition cursor-pointer"
            >
              Close & View in Buyer Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
