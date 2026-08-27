/**
 * Payment, Installment & Surcharge Financial Engine
 * Housing Societies (Punjab Housing By-Laws & SBP Guidelines compliant)
 */

import { InstallmentPlanType, Installment } from '../types';

export interface InstallmentPlanParams {
  totalPricePKR: number;
  downPaymentPercent?: number; // default 20%
  tenureMonths?: number; // default 36 (or 12 for 1-yr, 60 for 5-yr, 0 for lump sum)
  planType?: InstallmentPlanType;
  tokenAdvancePKR?: number;
  startDate?: string;
  bookingId?: string;
  bookingReference?: string;
  plotNumber?: string;
  societyName?: string;
  lateFeePercent?: number; // default 2.5% per month
}

export interface GeneratedInstallmentPlan {
  planType: InstallmentPlanType;
  totalPricePKR: number;
  tokenAdvancePKR: number;
  downPaymentPercent: number;
  downPaymentPKR: number;
  netDownPaymentPKR: number; // Down payment minus token already paid
  remainingPayablePKR: number;
  tenureMonths: number;
  monthlyInstallmentPKR: number;
  installments: Installment[];
}

/**
 * Generate full installment schedule from price, down payment, plan type and tenure
 */
export function generateInstallmentPlan(params: InstallmentPlanParams): GeneratedInstallmentPlan {
  const planType = params.planType || '3_year';
  let tenureMonths = params.tenureMonths ?? 36;
  let downPaymentPercent = params.downPaymentPercent ?? 20;

  if (planType === 'lump_sum') {
    tenureMonths = 0;
    downPaymentPercent = 100;
  } else if (planType === '1_year') {
    tenureMonths = 12;
    downPaymentPercent = params.downPaymentPercent ?? 25;
  } else if (planType === '3_year') {
    tenureMonths = 36;
    downPaymentPercent = params.downPaymentPercent ?? 20;
  } else if (planType === '5_year') {
    tenureMonths = 60;
    downPaymentPercent = params.downPaymentPercent ?? 15;
  }

  const tokenAdvancePKR = params.tokenAdvancePKR ?? 50000;
  const downPaymentPKR = Math.round((params.totalPricePKR * downPaymentPercent) / 100);
  const netDownPaymentPKR = Math.max(0, downPaymentPKR - tokenAdvancePKR);
  const remainingPayablePKR = Math.max(0, params.totalPricePKR - downPaymentPKR);
  const monthlyInstallmentPKR = tenureMonths > 0 ? Math.round(remainingPayablePKR / tenureMonths) : 0;

  const installments: Installment[] = [];
  const start = params.startDate ? new Date(params.startDate) : new Date();
  const bookingId = params.bookingId || `book-${Date.now()}`;
  const bookingRef = params.bookingReference || `PROP-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  if (tenureMonths > 0) {
    for (let i = 1; i <= tenureMonths; i++) {
      const dueDateObj = new Date(start);
      dueDateObj.setMonth(start.getMonth() + i);
      const dueDateStr = dueDateObj.toISOString().split('T')[0];

      // Schedule is initially created as due
      installments.push({
        id: `inst-${bookingId}-${i}`,
        bookingId,
        bookingReference: bookingRef,
        installmentNumber: i,
        dueDate: dueDateStr,
        amountPKR: monthlyInstallmentPKR,
        status: 'due',
        lateFeePKR: 0,
        plotNumber: params.plotNumber || 'Plot 42-A',
        societyName: params.societyName || 'Al-Rehman Garden Housing Society',
        challanNumber: `CH-${bookingRef.replace('PROP-', '')}-${String(i).padStart(2, '0')}`
      });
    }
  }

  return {
    planType,
    totalPricePKR: params.totalPricePKR,
    tokenAdvancePKR,
    downPaymentPercent,
    downPaymentPKR,
    netDownPaymentPKR,
    remainingPayablePKR,
    tenureMonths,
    monthlyInstallmentPKR,
    installments
  };
}

export interface LateFeeParamObj {
  amountPKR?: number;
  baseAmountPKR?: number;
  dueDate?: string;
  daysOverdue?: number;
  lateFeePercent?: number;
}

export interface LateFeeResult {
  isOverdue: boolean;
  daysOverdue: number;
  lateFeePKR: number;
  totalPayablePKR: number;
}

/**
 * Calculate dynamic monthly late surcharge if past 7-day grace period
 * Standard rate: 2.5% per month (or society-specific percent)
 */
export function calculateLateSurcharge(
  baseAmountPKR: number, 
  daysOverdue: number, 
  lateFeePercent: number = 2.5
): number {
  if (daysOverdue <= 7) return 0;
  const overdueMonths = Math.ceil(daysOverdue / 30);
  return Math.round(baseAmountPKR * (lateFeePercent / 100) * overdueMonths);
}

export function calculateLateFee(
  baseOrObj: number | LateFeeParamObj,
  daysOverdue?: number,
  lateFeePercent: number = 2.5
): LateFeeResult & number {
  let baseAmount = 0;
  let days = 0;
  let feePct = lateFeePercent;

  if (typeof baseOrObj === 'object') {
    baseAmount = baseOrObj.amountPKR ?? baseOrObj.baseAmountPKR ?? 0;
    feePct = baseOrObj.lateFeePercent ?? 2.5;
    if (baseOrObj.daysOverdue !== undefined) {
      days = baseOrObj.daysOverdue;
    } else if (baseOrObj.dueDate) {
      days = computeDaysOverdue(baseOrObj.dueDate);
    }
  } else {
    baseAmount = baseOrObj;
    days = daysOverdue ?? 0;
  }

  let fee = 0;
  if (days > 7) {
    const overdueMonths = Math.ceil(days / 30);
    fee = Math.round(baseAmount * (feePct / 100) * overdueMonths);
  }

  const res: LateFeeResult = {
    isOverdue: days > 0,
    daysOverdue: days,
    lateFeePKR: fee,
    totalPayablePKR: baseAmount + fee
  };

  return Object.assign(fee, res) as any;
}

export interface CancellationParamObj {
  totalPricePKR: number;
  paidAmountPKR?: number;
  paidSoFarPKR?: number;
  penaltyPercent?: number;
}

export interface CancellationResult {
  penaltyPKR: number;
  refundPKR: number;
  penaltyPercent: number;
}

export function calculateCancellationPenalty(
  totalOrObj: number | CancellationParamObj,
  paidSoFarPKR: number = 0
): CancellationResult & number {
  let total = 0;
  let paid = 0;
  let penaltyPercent = 10;

  if (typeof totalOrObj === 'object') {
    total = totalOrObj.totalPricePKR || 0;
    paid = totalOrObj.paidAmountPKR ?? totalOrObj.paidSoFarPKR ?? 0;
    penaltyPercent = totalOrObj.penaltyPercent ?? 10;
  } else {
    total = totalOrObj;
    paid = paidSoFarPKR;
  }

  const penaltyPKR = Math.round(total * (penaltyPercent / 100));
  const refundPKR = Math.max(0, paid - penaltyPKR);

  const res: CancellationResult = {
    penaltyPKR,
    refundPKR,
    penaltyPercent
  };

  return Object.assign(penaltyPKR, res) as any;
}

/**
 * Compute days overdue between due date and current date
 */
export function computeDaysOverdue(dueDateString: string): number {
  const due = new Date(dueDateString);
  const now = new Date();
  const diffTime = now.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Calculate 10% contract cancellation penalty and allottee refund breakdown
 */
export function calculateCancellationBreakdown(totalPricePKR: number, paidSoFarPKR: number): {
  penaltyPKR: number;
  refundPKR: number;
  penaltyPercent: number;
} {
  const penaltyPercent = 10;
  const penaltyPKR = Math.round(totalPricePKR * 0.10);
  const refundPKR = Math.max(0, paidSoFarPKR - penaltyPKR);
  return { penaltyPKR, refundPKR, penaltyPercent };
}

/**
 * Summary calculation of an installment ledger
 */
export function getInstallmentLedgerSummary(installments: Installment[], totalPricePKR?: number) {
  const totalCount = installments.length;
  const paidList = installments.filter(i => i.status === 'paid');
  const paidCount = paidList.length;
  const paidAmountPKR = paidList.reduce((acc, curr) => acc + curr.amountPKR + (curr.lateFeePKR || 0), 0);
  
  const overdueList = installments.filter(i => i.status === 'overdue');
  const overdueCount = overdueList.length;
  const overdueAmountPKR = overdueList.reduce((acc, curr) => acc + curr.amountPKR + (curr.lateFeePKR || 0), 0);

  const dueList = installments.filter(i => i.status === 'due');
  const dueCount = dueList.length;
  const dueAmountPKR = dueList.reduce((acc, curr) => acc + curr.amountPKR, 0);

  const nextDue = installments
    .filter(i => i.status === 'due' || i.status === 'overdue')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const totalPayable = totalPricePKR || installments.reduce((acc, curr) => acc + curr.amountPKR, 0);
  const remainingBalancePKR = Math.max(0, totalPayable - paidAmountPKR);
  const progressPercent = totalPayable > 0 ? Math.min(100, Math.round((paidAmountPKR / totalPayable) * 100)) : 0;

  return {
    totalCount,
    paidCount,
    paidAmountPKR,
    overdueCount,
    overdueAmountPKR,
    dueCount,
    dueAmountPKR,
    nextDue,
    totalPayable,
    remainingBalancePKR,
    progressPercent
  };
}
