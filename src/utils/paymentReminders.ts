/**
 * Payment Reminders & Notification Service
 * Generates automated multi-channel reminder payloads (SMS, Email, Push Notification)
 * for upcoming, due, and overdue installments in housing societies.
 */

import { Installment, Booking, NotificationItem } from '../types';
import { calculateLateSurcharge, computeDaysOverdue } from './paymentCalculators';

export interface ReminderPayload {
  installmentId: string;
  installmentNumber: number;
  bookingReference: string;
  buyerName: string;
  phone: string;
  email: string;
  plotNumber: string;
  societyName: string;
  dueDate: string;
  amountPKR: number;
  lateFeePKR: number;
  totalPayablePKR: number;
  reminderType: 'upcoming' | 'due' | 'overdue';
  smsMessage: string;
  emailSubject: string;
  emailBody: string;
  pushTitle: string;
  pushMessage: string;
}

export function generatePaymentReminder(
  installment: Installment,
  booking?: Booking,
  buyerName: string = 'Valued Customer',
  buyerPhone: string = '+92 300 1234567',
  buyerEmail: string = 'customer@example.com'
): ReminderPayload {
  const plotNo = installment.plotNumber || booking?.plotNumber || 'Plot';
  const society = installment.societyName || booking?.societyName || 'Housing Society';
  const bookingRef = installment.bookingReference || booking?.bookingReference || `PROP-2026-${installment.bookingId.replace('book-', '')}`;
  const amountFormatted = `PKR ${installment.amountPKR.toLocaleString('en-PK')}`;
  
  const daysOverdue = computeDaysOverdue(installment.dueDate);
  const lateFee = installment.lateFeePKR || calculateLateSurcharge(installment.amountPKR, daysOverdue);
  const totalPayable = installment.amountPKR + lateFee;
  const totalFormatted = `PKR ${totalPayable.toLocaleString('en-PK')}`;

  let reminderType: 'upcoming' | 'due' | 'overdue' = 'due';
  if (installment.status === 'overdue' || daysOverdue > 7) {
    reminderType = 'overdue';
  } else if (daysOverdue <= 0) {
    reminderType = 'upcoming';
  }

  let smsMessage = '';
  let emailSubject = '';
  let emailBody = '';
  let pushTitle = '';
  let pushMessage = '';

  if (reminderType === 'overdue') {
    pushTitle = `⚠️ Installment Overdue Alert - ${plotNo}`;
    pushMessage = `Installment #${installment.installmentNumber} for ${plotNo} (${society}) is overdue by ${daysOverdue} days. Surcharge applied.`;
    
    smsMessage = `[MANZILIQ OVERDUE ALERT] Dear ${buyerName}, your Installment #${installment.installmentNumber} for ${plotNo} (${society}) was due on ${installment.dueDate}. Total with late surcharge: ${totalFormatted}. Pay online via JazzCash/EasyPaisa: https://manziliq.pk/pay/${installment.id}`;
    
    emailSubject = `URGENT: Overdue Installment #${installment.installmentNumber} Notice - ${plotNo}, ${society}`;
    emailBody = `Dear ${buyerName},\n\nThis is an official notice that Installment #${installment.installmentNumber} for ${plotNo} in ${society} (Ref: ${bookingRef}) is past its due date (${installment.dueDate}).\n\nBase Installment: ${amountFormatted}\nLate Surcharge (2.5%/mo): PKR ${lateFee.toLocaleString('en-PK')}\nTotal Due: ${totalFormatted}\n\nKindly clear your outstanding balance within 7 business days to prevent allocation suspension.\n\nRegards,\nFinance & Recovery Directorate\n${society}`;
  } else if (reminderType === 'upcoming') {
    pushTitle = `📅 Upcoming Installment Reminder - ${plotNo}`;
    pushMessage = `Installment #${installment.installmentNumber} of ${amountFormatted} is due on ${installment.dueDate}.`;
    
    smsMessage = `[MANZILIQ REMINDER] Dear ${buyerName}, your monthly installment #${installment.installmentNumber} (${amountFormatted}) for ${plotNo} (${society}) is due on ${installment.dueDate}. Ref: ${bookingRef}. Pay securely: https://manziliq.pk/pay/${installment.id}`;
    
    emailSubject = `Upcoming Installment Reminder - ${plotNo}, ${society}`;
    emailBody = `Dear ${buyerName},\n\nWe would like to remind you that your upcoming Installment #${installment.installmentNumber} for ${plotNo} at ${society} is scheduled for ${installment.dueDate}.\n\nAmount Due: ${amountFormatted}\nChallan Number: ${installment.challanNumber || 'CH-2026-01'}\n\nYou can pay online via 1Link, KuickPay, JazzCash, EasyPaisa, or at any authorized bank branch.\n\nWarm regards,\nAccounts Office\n${society}`;
  } else {
    pushTitle = `🔔 Installment Due Today - ${plotNo}`;
    pushMessage = `Installment #${installment.installmentNumber} of ${amountFormatted} for ${plotNo} is due today.`;
    
    smsMessage = `[MANZILIQ NOTICE] Dear ${buyerName}, Installment #${installment.installmentNumber} (${amountFormatted}) for ${plotNo} is due today (${installment.dueDate}). Clear dues to avoid late surcharge: https://manziliq.pk/pay/${installment.id}`;
    
    emailSubject = `Installment Due Today - ${plotNo}, ${society}`;
    emailBody = `Dear ${buyerName},\n\nYour Installment #${installment.installmentNumber} of ${amountFormatted} for ${plotNo} in ${society} is due today, ${installment.dueDate}.\n\nPlease process payment via the MANZILIQ portal or your nearest banking channel.\n\nThank you,\n${society} Treasury`;
  }

  return {
    installmentId: installment.id,
    installmentNumber: installment.installmentNumber,
    bookingReference: bookingRef,
    buyerName,
    phone: buyerPhone,
    email: buyerEmail,
    plotNumber: plotNo,
    societyName: society,
    dueDate: installment.dueDate,
    amountPKR: installment.amountPKR,
    lateFeePKR: lateFee,
    totalPayablePKR: totalPayable,
    reminderType,
    smsMessage,
    emailSubject,
    emailBody,
    pushTitle,
    pushMessage
  };
}

/**
 * Converts a reminder payload into an internal NotificationItem
 */
export function createNotificationFromReminder(
  payload: ReminderPayload,
  userId: string,
  role: 'buyer' | 'dealer' | 'society_admin' = 'buyer'
): NotificationItem {
  const nowStr = `${new Date().toISOString().split('T')[0]} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return {
    id: `notif-rem-${Date.now()}-${payload.installmentNumber}`,
    userId,
    role,
    title: payload.pushTitle,
    message: payload.pushMessage,
    date: nowStr,
    createdAt: nowStr,
    type: 'payment',
    channel: 'all',
    status: 'sent',
    read: false,
    is_read: false,
    smsPreview: payload.smsMessage,
    emailPreview: {
      subject: payload.emailSubject,
      body: payload.emailBody
    }
  };
}

export const generateInstallmentReminder = generatePaymentReminder;
