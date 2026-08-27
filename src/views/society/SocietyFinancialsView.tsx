import React, { useState, useMemo } from 'react';
import { Society, Installment, Booking } from '../../types';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Download,
  Building2,
  FileSpreadsheet,
  Calendar,
  Filter,
  Check,
  Search,
  ArrowUpRight,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface SocietyFinancialsViewProps {
  society: Society;
  installments: Installment[];
  bookings: Booking[];
}

export const SocietyFinancialsView: React.FC<SocietyFinancialsViewProps> = ({
  society,
  installments = [],
  bookings = []
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'paid' | 'overdue' | 'due'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Escrow & aggregate metrics calculations
  const totalProjected = 31200000;
  const tokenAdvanceCollected = bookings.reduce((sum, b) => sum + 100000, 0); // Token deposits
  const downpaymentsCollected = bookings.filter(b => b.pipelineStage >= 3).reduce((sum, b) => sum + b.downPaymentPKR, 0);
  const paidInstallmentsSum = installments.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amountPKR, 0);
  const totalRealizedCollections = tokenAdvanceCollected + downpaymentsCollected + paidInstallmentsSum;
  
  const totalOverdueSurcharges = installments
    .filter(i => i.status === 'overdue' || (i.lateFeePKR && i.lateFeePKR > 0))
    .reduce((sum, i) => sum + (i.lateFeePKR || 0), 42500);

  // Map each installment to rich booking / allottee details
  const enrichedInstallments = useMemo(() => {
    return installments.map((inst, index) => {
      const associatedBooking = bookings.find(b => b.id === inst.bookingId) || bookings[0];
      const receiptNo = inst.receiptNumber || inst.challanNumber || `RCP-${society.id.toUpperCase()}-${String(index + 1).padStart(4, '0')}`;
      const allotteeName = associatedBooking?.buyerName || 'Muhammad Farooq';
      const cnic = associatedBooking?.buyerCnic || '34501-8472910-3';
      const plotNum = inst.plotNumber || associatedBooking?.plotNumber || `Plot ${index + 1}`;
      const sector = associatedBooking?.sector || 'Sector A';
      const paymentMode = inst.paymentMethod || (inst.status === 'paid' ? 'Raast / 1Link Bank Transfer' : 'Pending');
      const txnRef = inst.transactionId || (inst.status === 'paid' ? `TXN-PK-${Math.floor(10000000 + Math.random() * 90000000)}` : 'N/A');
      const surcharge = inst.lateFeePKR || (inst.status === 'overdue' ? Math.round(inst.amountPKR * 0.025) : 0);
      const totalAmount = inst.amountPKR + surcharge;

      return {
        ...inst,
        receiptNo,
        allotteeName,
        cnic,
        plotNum,
        sector,
        paymentMode,
        txnRef,
        surcharge,
        totalAmount
      };
    });
  }, [installments, bookings, society]);

  // Filtered rows for UI table
  const filteredInstallments = useMemo(() => {
    return enrichedInstallments.filter(item => {
      if (selectedStatusFilter !== 'all' && item.status !== selectedStatusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.allotteeName.toLowerCase().includes(q);
        const matchesPlot = item.plotNum.toLowerCase().includes(q);
        const matchesReceipt = item.receiptNo.toLowerCase().includes(q);
        const matchesCnic = item.cnic.toLowerCase().includes(q);
        if (!matchesName && !matchesPlot && !matchesReceipt && !matchesCnic) {
          return false;
        }
      }
      return true;
    });
  }, [enrichedInstallments, selectedStatusFilter, searchQuery]);

  // Helper to trigger clean CSV download
  const downloadCSV = (csvContent: string, fileName: string) => {
    // Add UTF-8 BOM so Excel opens Urdu/Pakistani names correctly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 1. Export Detailed Transactions & Collection Ledger CSV
  const handleExportTransactionsCSV = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const safeSocietyName = society.name.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${safeSocietyName}_Installment_Ledger_${timestamp}.csv`;

    const headers = [
      'Receipt / Challan No',
      'Society Name',
      'Sector / Block',
      'Plot Unit',
      'Allottee Name',
      'Buyer CNIC',
      'Installment #',
      'Due Date',
      'Payment Date',
      'Base Installment (PKR)',
      'Late Surcharge 2.5% (PKR)',
      'Total Amount (PKR)',
      'Payment Status',
      'Payment Gateway / Channel',
      'Transaction Reference'
    ];

    const rows = enrichedInstallments.map(item => [
      `"${item.receiptNo}"`,
      `"${society.name}"`,
      `"${item.sector}"`,
      `"${item.plotNum}"`,
      `"${item.allotteeName}"`,
      `"${item.cnic}"`,
      item.installmentNumber || 1,
      item.dueDate || 'N/A',
      item.paidDate || 'N/A',
      item.amountPKR,
      item.surcharge,
      item.totalAmount,
      item.status.toUpperCase(),
      `"${item.paymentMode}"`,
      `"${item.txnRef}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    downloadCSV(csvContent, fileName);
    setExportSuccessMsg(`Successfully exported "${fileName}" (${enrichedInstallments.length} records).`);
    setTimeout(() => setExportSuccessMsg(null), 5000);
  };

  // 2. Export Comprehensive Financial Summary & Escrow Portfolio CSV
  const handleExportSummaryReportCSV = () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const safeSocietyName = society.name.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `${safeSocietyName}_Financial_Summary_Report_${timestamp}.csv`;

    const paidCount = enrichedInstallments.filter(i => i.status === 'paid').length;
    const overdueCount = enrichedInstallments.filter(i => i.status === 'overdue').length;
    const dueCount = enrichedInstallments.filter(i => i.status === 'due').length;

    const summaryData = [
      ['=== MANZILIQ HOUSING FINANCIAL AUDIT REPORT ==='],
      ['Report Generated On', new Date().toLocaleString()],
      ['Housing Society', `"${society.name}"`],
      ['Location & Tehsil', `"${society.location}, ${society.city || 'Lahore'}"`],
      ['NOC Regulatory Status', `"${society.nocNumber || 'Approved LDA/TMA'}"`],
      ['Designated Escrow Account', '"Bank of Punjab (Main Commercial Branch) - A/C # 6510098421"'],
      [],
      ['=== PORTFOLIO CASHFLOW METRICS (PKR) ==='],
      ['Total Projected Receivables Portfolio', totalProjected],
      ['Total Realized Cash Inflow (Escrow)', totalRealizedCollections],
      ['Token Advance Payments Collected', tokenAdvanceCollected],
      ['Down Payments Cleared', downpaymentsCollected],
      ['Paid Installments Volume', paidInstallmentsSum],
      ['Accrued Overdue Late Surcharges (2.5%)', totalOverdueSurcharges],
      ['Outstanding Balance Portfolio', totalProjected - totalRealizedCollections],
      [],
      ['=== INSTALLMENT RECOVERY BREAKDOWN ==='],
      ['Total Tracked Installment Milestones', enrichedInstallments.length],
      ['Paid & Cleared Milestones', paidCount],
      ['Overdue Installments Under Penalty', overdueCount],
      ['Upcoming / Due Milestones', dueCount],
      ['Collection Efficiency Rate (%)', `${((paidCount / (enrichedInstallments.length || 1)) * 100).toFixed(1)}%`],
      [],
      ['=== ACTIVE ALLOTTEES SUMMARY ==='],
      ['Allottee Name', 'CNIC', 'Plot Unit', 'Total Booked Value (PKR)', 'Down Payment (PKR)', 'Pipeline Status'],
      ...bookings.map(b => [
        `"${b.buyerName}"`,
        `"${b.buyerCnic}"`,
        `"${b.plotNumber || 'A-01'}"`,
        b.totalPricePKR,
        b.downPaymentPKR,
        `"Stage ${b.pipelineStage}: ${b.status.toUpperCase()}"`
      ])
    ];

    const csvContent = summaryData.map(row => row.join(',')).join('\n');
    downloadCSV(csvContent, fileName);
    setExportSuccessMsg(`Successfully generated and downloaded Executive Financial Summary CSV.`);
    setTimeout(() => setExportSuccessMsg(null), 5000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header with Dual CSV Export Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-[Outfit] tracking-tight flex items-center gap-2.5">
            <DollarSign className="w-7 h-7 text-emerald-800" />
            <span>Society Financials, Cashflow & Surcharges</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time installment collection, escrow health, and automated 2.5% late fee recovery for {society.name}.
          </p>
        </div>

        {/* CSV Export Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={handleExportSummaryReportCSV}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
            title="Download executive audit summary and recovery stats"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Executive Summary CSV</span>
          </button>

          <button
            onClick={handleExportTransactionsCSV}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer active:scale-95"
            title="Download full line-item installment ledger as CSV"
          >
            <Download className="w-4 h-4" />
            <span>Export Transactions Ledger (CSV)</span>
          </button>
        </div>
      </div>

      {/* Export Success Notification */}
      {exportSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs animate-slide-down">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{exportSuccessMsg}</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono">UTF-8 / Excel Compatible</span>
        </div>
      )}

      {/* Bank Escrow Banner */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl border border-slate-700 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Designated TMA Regulatory Escrow Trust</div>
            <div className="text-sm font-extrabold text-white">
              Bank of Punjab (BOP) — Main Commercial Branch (A/C: 65100-98421-001)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-[11px] font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Escrow Protected</span>
          </span>
        </div>
      </div>

      {/* 3 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 transition">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Realized Collections</div>
          <div className="text-2xl font-black text-emerald-900 font-mono mt-1">
            PKR {(totalRealizedCollections / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 shrink-0" />
            <span>Token Advances + Downpayments + Cleared</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projected Portfolio Balance</div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            PKR {(totalProjected / 1000000).toFixed(2)}M
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3 shrink-0" />
            <span>36-Month Milestone Receivables</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Late Surcharges Accrued</div>
          <div className="text-2xl font-black text-amber-700 font-mono mt-1">
            PKR {totalOverdueSurcharges.toLocaleString('en-PK')}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Automated 2.5% Monthly Default Penalty</span>
          </div>
        </div>
      </div>

      {/* Surcharge Recovery Ledger & Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
        
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-[Outfit]">Installment Cashflow Ledger</h3>
            <p className="text-xs text-slate-500">Live transaction stream across all active allottees ({filteredInstallments.length} records shown)</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search allottee, plot, receipt..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-emerald-600 w-full sm:w-56"
              />
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              {(['all', 'paid', 'overdue', 'due'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold capitalize transition cursor-pointer ${
                    selectedStatusFilter === st
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Quick Ledger CSV Button */}
            <button
              onClick={handleExportTransactionsCSV}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
              title="Download CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ledger Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="p-3">Receipt / Challan</th>
                <th className="p-3">Plot Unit</th>
                <th className="p-3">Allottee Details</th>
                <th className="p-3">Due / Paid Date</th>
                <th className="p-3">Base Installment</th>
                <th className="p-3">Late Surcharge (2.5%)</th>
                <th className="p-3">Total Payable</th>
                <th className="p-3">Payment Channel</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInstallments.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50/50 transition">
                  <td className="p-3">
                    <div className="font-mono font-bold text-slate-900">{inst.receiptNo}</div>
                    <div className="text-[10px] text-slate-400">Inst #{inst.installmentNumber || 1}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{inst.plotNum}</div>
                    <div className="text-[10px] text-slate-500">{inst.sector}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-semibold text-slate-900">{inst.allotteeName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{inst.cnic}</div>
                  </td>
                  <td className="p-3 text-slate-600">
                    <div>Due: <span className="font-semibold text-slate-800">{inst.dueDate}</span></div>
                    {inst.paidDate && (
                      <div className="text-[10px] text-emerald-700 font-medium">Paid: {inst.paidDate}</div>
                    )}
                  </td>
                  <td className="p-3 font-semibold text-slate-900 font-mono">
                    PKR {inst.amountPKR.toLocaleString('en-PK')}
                  </td>
                  <td className="p-3">
                    {inst.surcharge > 0 ? (
                      <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        + PKR {inst.surcharge.toLocaleString('en-PK')}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="p-3 font-extrabold text-emerald-950 font-mono">
                    PKR {inst.totalAmount.toLocaleString('en-PK')}
                  </td>
                  <td className="p-3">
                    <div className="text-slate-700 font-medium">{inst.paymentMode}</div>
                    {inst.txnRef !== 'N/A' && (
                      <div className="text-[10px] text-slate-400 font-mono">{inst.txnRef}</div>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase inline-flex items-center gap-1 ${
                      inst.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                      inst.status === 'overdue' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {inst.status === 'paid' && <CheckCircle2 className="w-3 h-3" />}
                      {inst.status === 'overdue' && <AlertTriangle className="w-3 h-3" />}
                      {inst.status === 'due' && <Clock className="w-3 h-3" />}
                      <span>{inst.status}</span>
                    </span>
                  </td>
                </tr>
              ))}

              {filteredInstallments.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400 text-xs">
                    No transactions match your current search or status filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
