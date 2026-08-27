import { NotificationType, NotificationChannel, ReferenceType } from '../types/notifications';

export interface TemplateData {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  dealerName?: string;
  dealerPhone?: string;
  societyName?: string;
  plotNumber?: string;
  sector?: string;
  block?: string;
  bookingReference?: string;
  bookingId?: string;
  amountPKR?: number;
  paidAmountPKR?: number;
  lateFeePKR?: number;
  totalOutstandingPKR?: number;
  dueDate?: string;
  installmentNumber?: number;
  paymentMethod?: string;
  receiptNumber?: string;
  transactionId?: string;
  failureReason?: string;
  stageName?: string;
  documentTitle?: string;
  documentType?: string;
  documentId?: string;
  lotNumber?: string;
  lotExpiryDate?: string;
  daysRemaining?: number;
  rejectionReason?: string;
  disputeId?: string;
  inquiryTitle?: string;
  verificationCode?: string;
  role?: string;
  customMessage?: string;
}

export interface GeneratedTemplate {
  type: NotificationType;
  title: string;
  message: string;
  smsPreview: string;
  emailSubject: string;
  emailBody: string;
  emailHtml: string;
  fcmTitle: string;
  fcmBody: string;
  fcmData: Record<string, string>;
  referenceType: ReferenceType;
  referenceId: string;
  deepLinkRoute: string;
  defaultChannels: NotificationChannel[];
}

export function formatPKR(val?: number): string {
  if (val === undefined || val === null) return 'PKR 0';
  return `PKR ${val.toLocaleString('en-PK')}`;
}

export function renderNotificationTemplate(
  templateKey: string,
  data: TemplateData
): GeneratedTemplate {
  const customer = data.customerName || 'Valued Customer';
  const society = data.societyName || 'Housing Society';
  const plot = data.plotNumber || 'Plot';
  const bookingRef = data.bookingReference || 'PROP-2026-REF';
  const amountStr = formatPKR(data.amountPKR);
  const totalStr = formatPKR(data.totalOutstandingPKR || data.amountPKR);
  const lateFeeStr = formatPKR(data.lateFeePKR || 0);

  switch (templateKey) {
    // ----------------------------------------------------
    // 1. BOOKINGS
    // ----------------------------------------------------
    case 'BOOKING_CREATED_CUSTOMER':
      return {
        type: 'booking',
        title: `Booking Application Received - ${plot}`,
        message: `Your booking request for ${plot} in ${society} has been submitted successfully (Ref: ${bookingRef}). Token amount ${formatPKR(data.paidAmountPKR)} logged.`,
        smsPreview: `[MANZILIQ] Dear ${customer}, your booking for ${plot} (${society}) is received. Ref: ${bookingRef}. Track status: https://manziliq.pk/buyer/bookings`,
        emailSubject: `Booking Application Received - ${plot} (${society})`,
        emailBody: `Dear ${customer},\n\nThank you for choosing MANZILIQ. Your booking application for ${plot} at ${society} has been recorded under reference ${bookingRef}.\n\nToken Deposited: ${formatPKR(data.paidAmountPKR)}\n\nOur society desk is verifying your application documents. You will receive an update shortly.\n\nWarm regards,\n${society} Administration`,
        emailHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;"><div style="background-color: #064e3b; color: white; padding: 24px;"><h2 style="margin: 0; font-size: 20px;">Booking Application Received</h2><p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">Ref: ${bookingRef}</p></div><div style="padding: 24px; line-height: 1.6;"><p>Dear <strong>${customer}</strong>,</p><p>Your booking request for <strong>${plot}</strong> in <strong>${society}</strong> has been logged.</p><div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 12px 16px; margin: 16px 0; border-radius: 4px;"><p style="margin: 0; font-size: 14px;"><strong>Token Deposited:</strong> ${formatPKR(data.paidAmountPKR)}</p><p style="margin: 4px 0 0; font-size: 14px;"><strong>Status:</strong> Pending Society Approval</p></div><p>You can track the verification progress in real time via the MANZILIQ Portal.</p></div></div>`,
        fcmTitle: `Booking Logged: ${plot}`,
        fcmBody: `Your booking request for ${plot} (${society}) has been submitted. Ref: ${bookingRef}`,
        fcmData: { type: 'booking', id: data.bookingId || bookingRef, route: '/buyer/bookings' },
        referenceType: 'booking',
        referenceId: data.bookingId || bookingRef,
        deepLinkRoute: '/buyer/bookings',
        defaultChannels: ['in_app', 'push', 'sms', 'email']
      };

    case 'BOOKING_APPROVED':
      return {
        type: 'booking',
        title: `Booking Approved - ${plot}`,
        message: `Congratulations! Your booking for ${plot} in ${society} (Ref: ${bookingRef}) has been approved by the society administration.`,
        smsPreview: `[MANZILIQ] Congratulations ${customer}! Booking for ${plot} (${society}) is APPROVED. Ref: ${bookingRef}. Download Allotment: https://manziliq.pk/buyer/documents`,
        emailSubject: `Official Booking Approval Notice - ${plot} (${society})`,
        emailBody: `Dear ${customer},\n\nWe are pleased to inform you that your booking for ${plot} at ${society} (Ref: ${bookingRef}) has been officially APPROVED.\n\nYour verified Allotment Letter and Token Receipt are now accessible in your Document Locker.\n\nWelcome to ${society}!\n\nBest regards,\nManaging Directorate, ${society}`,
        emailHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;"><div style="background-color: #065f46; color: white; padding: 24px;"><h2 style="margin: 0; font-size: 20px;">🎉 Booking Approved!</h2><p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">Ref: ${bookingRef}</p></div><div style="padding: 24px; line-height: 1.6;"><p>Dear <strong>${customer}</strong>,</p><p>Your booking for <strong>${plot}</strong> in <strong>${society}</strong> has been officially approved.</p><p>Official documents including the Allotment Letter and Token Receipt have been generated and securely archived in your Document Vault.</p></div></div>`,
        fcmTitle: `🎉 Booking Approved: ${plot}`,
        fcmBody: `Your booking for ${plot} in ${society} is approved. Allotment Letter is ready.`,
        fcmData: { type: 'booking', id: data.bookingId || bookingRef, route: '/buyer/bookings' },
        referenceType: 'booking',
        referenceId: data.bookingId || bookingRef,
        deepLinkRoute: '/buyer/bookings',
        defaultChannels: ['in_app', 'push', 'sms', 'email']
      };

    case 'BOOKING_REJECTED':
      return {
        type: 'booking',
        title: `Booking Update - ${plot}`,
        message: `Your booking for ${plot} (Ref: ${bookingRef}) could not be approved. Reason: ${data.rejectionReason || 'Documentation discrepancy'}. Escrow token refund initiated.`,
        smsPreview: `[MANZILIQ] Notice: Booking for ${plot} (${society}) was rejected. Reason: ${data.rejectionReason || 'Discrepancy'}. Token refund initiated. Ref: ${bookingRef}.`,
        emailSubject: `Important Notice: Booking Status Update - ${bookingRef}`,
        emailBody: `Dear ${customer},\n\nWe regret to inform you that your booking for ${plot} in ${society} (Ref: ${bookingRef}) was not approved by the verification desk.\n\nReason: ${data.rejectionReason || 'Incomplete documentation or verification failure.'}\n\nAny deposited token funds will be refunded to your source bank account within 3 business days.\n\nSincerely,\n${society} Verification Office`,
        emailHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;"><div style="background-color: #991b1b; color: white; padding: 24px;"><h2 style="margin: 0; font-size: 20px;">Booking Application Status Update</h2><p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">Ref: ${bookingRef}</p></div><div style="padding: 24px; line-height: 1.6;"><p>Dear <strong>${customer}</strong>,</p><p>Your application for <strong>${plot}</strong> could not be processed at this time.</p><p><strong>Reason:</strong> ${data.rejectionReason || 'Documentation discrepancy'}</p><p>Any escrowed funds are queued for automatic reversal.</p></div></div>`,
        fcmTitle: `Booking Update: ${plot}`,
        fcmBody: `Your booking for ${plot} could not be approved. Tap for details.`,
        fcmData: { type: 'booking', id: data.bookingId || bookingRef, route: '/buyer/bookings' },
        referenceType: 'booking',
        referenceId: data.bookingId || bookingRef,
        deepLinkRoute: '/buyer/bookings',
        defaultChannels: ['in_app', 'push', 'sms', 'email']
      };

    // ----------------------------------------------------
    // 2. DEAL PIPELINE (6 STAGES)
    // ----------------------------------------------------
    case 'DEAL_STAGE_CHANGED':
      return {
        type: 'deal_stage',
        title: `Deal Stage Advanced: ${data.stageName || 'Next Stage'}`,
        message: `Your deal for ${plot} (${society}) has transitioned to Stage: "${data.stageName || 'Pipeline Update'}". Reference: ${bookingRef}.`,
        smsPreview: `[MANZILIQ Pipeline] Update: Deal for ${plot} (${society}) has moved to "${data.stageName}". Ref: ${bookingRef}. View: https://manziliq.pk/dealer/pipeline`,
        emailSubject: `Deal Progress: ${plot} moved to ${data.stageName} - Ref ${bookingRef}`,
        emailBody: `Dear Participant,\n\nThe transaction for ${plot} in ${society} has progressed along the official deal pipeline.\n\nCurrent Stage: ${data.stageName}\nDeal Reference: ${bookingRef}\n\nPlease check the pipeline dashboard for required pending signatures or documentation.\n\nRegards,\nMANZILIQ Deal Desk`,
        emailHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;"><div style="background-color: #1e293b; color: white; padding: 24px;"><h2 style="margin: 0; font-size: 20px;">Pipeline Stage Update</h2><p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">Ref: ${bookingRef}</p></div><div style="padding: 24px; line-height: 1.6;"><p>The property transaction for <strong>${plot}</strong> has entered stage:</p><div style="background: #e0f2fe; color: #0369a1; padding: 12px; border-radius: 8px; font-weight: bold; font-size: 15px;">Stage: ${data.stageName}</div></div></div>`,
        fcmTitle: `Pipeline: ${data.stageName}`,
        fcmBody: `Deal for ${plot} advanced to ${data.stageName}.`,
        fcmData: { type: 'deal', id: data.bookingId || bookingRef, route: '/dealer/pipeline' },
        referenceType: 'booking',
        referenceId: data.bookingId || bookingRef,
        deepLinkRoute: '/dealer/pipeline',
        defaultChannels: ['in_app', 'push', 'sms', 'email']
      };

    // ----------------------------------------------------
    // 3. INSTALLMENT REMINDERS & OVERDUE
    // ----------------------------------------------------
    case 'INSTALLMENT_DUE_3_DAYS':
      return {
        type: 'installment',
        title: `Installment Due Soon - ${plot}`,
        message: `Reminder: Your installment #${data.installmentNumber || 1} of ${amountStr} for ${plot} (${society}) is due in 3 days on ${data.dueDate || 'due date'}.`,
        smsPreview: `[MANZILIQ REMINDER] Dear ${customer}, your installment #${data.installmentNumber || 1} of ${amountStr} for ${plot} is due on ${data.dueDate}. Pay online to avoid late fee: https://manziliq.pk/buyer/installments`,
        emailSubject: `Reminder: Installment #${data.installmentNumber || 1} Due in 3 Days - ${plot}, ${society}`,
        emailBody: `Dear ${customer},\n\nThis is a friendly reminder that your upcoming Installment #${data.installmentNumber || 1} for ${plot} in ${society} is due on ${data.dueDate}.\n\nAmount: ${amountStr}\nChallan / Booking Ref: ${bookingRef}\n\nPlease clear your installment via 1Link, KuickPay, JazzCash, EasyPaisa, or at any authorized bank branch.\n\nWarm regards,\nAccounts Directorate\n${society}`,
        emailHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;"><div style="background-color: #d97706; color: white; padding: 24px;"><h2 style="margin: 0; font-size: 20px;">📅 Installment Due in 3 Days</h2><p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">Due Date: ${data.dueDate}</p></div><div style="padding: 24px; line-height: 1.6;"><p>Dear <strong>${customer}</strong>,</p><p>Your monthly installment #${data.installmentNumber || 1} for <strong>${plot}</strong> is scheduled for <strong>${data.dueDate}</strong>.</p><div style="background: #fffbeb; border: 1px solid #fde68a; padding: 14px; border-radius: 8px; margin: 16px 0;"><div style="font-size: 18px; font-weight: bold; color: #92400e;">Amount Due: ${amountStr}</div><div style="font-size: 12px; color: #78350f; margin-top: 4px;">Society: ${society} • Plot: ${plot}</div></div></div></div>`,
        fcmTitle: `📅 Installment Due Soon: ${plot}`,
        fcmBody: `Installment #${data.installmentNumber || 1} of ${amountStr} is due on ${data.dueDate}.`,
        fcmData: { type: 'installment', id: data.bookingId || bookingRef, route: '/buyer/installments' },
        referenceType: 'installment',
        referenceId: data.bookingId || bookingRef,
        deepLinkRoute: '/buyer/installments',
        defaultChannels: ['in_app', 'push', 'sms', 'email']
      };

    case 'INSTALLMENT_OVERDUE':
      return {
        type: 'installment',
        title: `⚠️ Overdue Installment Notice - ${plot}`,
        message: `Installment #${data.installmentNumber || 1} for ${plot} (${society}) was due on ${data.dueDate}. Original: ${amountStr}. Surcharge: ${lateFeeStr}. Total Outstanding: ${totalStr}.`,
        smsPreview: `[MANZILIQ OVERDUE] URGENT: Dear ${customer}, Installment #${data.installmentNumber || 1} for ${plot} was due on ${data.dueDate}. Total due (inc late surcharge): ${totalStr}. Clear immediately: https://manziliq.pk/buyer/installments`,
        emailSubject: `URGENT: Overdue Installment #${data.installmentNumber || 1} Notice - ${plot}, ${society}`,
        emailBody: `Dear ${customer},\n\nThis is an official notice that Installment #${data.installmentNumber || 1} for ${plot} in ${society} (Ref: ${bookingRef}) is past its due date (${data.dueDate}).\n\nOriginal Amount: ${amountStr}\nLate Surcharge Applied: ${lateFeeStr}\nTotal Outstanding Amount: ${totalStr}\n\nKindly clear your balance immediately to avoid allocation suspension or legal notice under society bylaws.\n\nRegards,\nFinance & Recovery Directorate\n${society}`,
        emailHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;"><div style="background-color: #b91c1c; color: white; padding: 24px;"><h2 style="margin: 0; font-size: 20px;">⚠️ Overdue Payment Notice</h2><p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">Ref: ${bookingRef} • Plot: ${plot}</p></div><div style="padding: 24px; line-height: 1.6;"><p>Dear <strong>${customer}</strong>,</p><p>Your installment #${data.installmentNumber || 1} is overdue. Details are below:</p><table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;"><tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Original Due Date</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${data.dueDate}</td></tr><tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #64748b;">Original Installment</td><td style="padding: 8px 0; font-weight: bold; text-align: right;">${amountStr}</td></tr><tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px 0; color: #e11d48;">Late Surcharge (2.5%)</td><td style="padding: 8px 0; font-weight: bold; text-align: right; color: #e11d48;">+ ${lateFeeStr}</td></tr><tr style="background: #fef2f2;"><td style="padding: 10px 8px; font-weight: bold; color: #991b1b;">Total Outstanding</td><td style="padding: 10px 8px; font-weight: bold; font-size: 16px; text-align: right; color: #991b1b;">${totalStr}</td></tr></table></div></div>`,
        fcmTitle: `⚠️ Overdue Alert: ${plot}`,
        fcmBody: `Installment #${data.installmentNumber || 1} is overdue. Surcharge applied. Total: ${totalStr}`,
        fcmData: { type: 'installment', id: data.bookingId || bookingRef, route: '/buyer/installments' },
        referenceType: 'installment',
        referenceId: data.bookingId || bookingRef,
        deepLinkRoute: '/buyer/installments',
        defaultChannels: ['in_app', 'push', 'sms', 'email']
      };

    // ----------------------------------------------------
    // 4. PAYMENTS (SUBMITTED, VERIFIED, FAILED)
    // ----------------------------------------------------
    case 'PAYMENT_SUBMITTED':
      return {
        type: 'payment',
        title: `Payment Submitted for Verification - ${plot}`,
        message: `Your payment of ${formatPKR(data.paidAmountPKR)} via ${data.paymentMethod || 'Online'} has been submitted for society accounts verification. Receipt: ${data.receiptNumber || 'Pending'}.`,
        smsPreview: `[MANZILIQ] Payment of ${formatPKR(data.paidAmountPKR)} for ${plot} submitted for verification. Ref: ${bookingRef}. Status updates will follow.`,
        emailSubject: `Payment Submitted for Verification - ${bookingRef}`,
        emailBody: `Dear ${customer},\n\nWe have received your payment submission of ${formatPKR(data.paidAmountPKR)} for ${plot} (${society}) via ${data.paymentMethod || 'Banking Channel'}.\n\nOur accounts department is currently reconciling your deposit. Once verified, your official stamped receipt will be available.\n\nThank you,\n${society} Accounts`,
        emailHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;"><div style="background-color: #0284c7; color: white; padding: 24px;"><h2 style="margin: 0; font-size: 20px;">Payment Submitted for Verification</h2><p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">Ref: ${bookingRef}</p></div><div style="padding: 24px; line-height: 1.6;"><p>Dear <strong>${customer}</strong>,</p><p>Your payment of <strong>${formatPKR(data.paidAmountPKR)}</strong> has been recorded and submitted to society accounts.</p></div></div>`,
        fcmTitle: `Payment Submitted: ${formatPKR(data.paidAmountPKR)}`,
        fcmBody: `Your payment for ${plot} is undergoing verification.`,
        fcmData: { type: 'payment', id: data.receiptNumber || bookingRef, route: '/buyer/installments' },
        referenceType: 'payment',
        referenceId: data.receiptNumber || bookingRef,
        deepLinkRoute: '/buyer/installments',
        defaultChannels: ['in_app', 'push', 'sms', 'email']
      };

    case 'PAYMENT_VERIFIED':
      return {
        type: 'payment',
        title: `Payment Verified & Confirmed - ${plot}`,
        message: `Payment received successfully for Booking ${bookingRef}. Amount: ${formatPKR(data.paidAmountPKR)}. Method: ${data.paymentMethod || '1Link/JazzCash'}. Receipt #: ${data.receiptNumber || 'RCP-2026-001'}.`,
        smsPreview: `[MANZILIQ] Payment Verified! PKR ${(data.paidAmountPKR || 0).toLocaleString('en-PK')} received for ${plot} (${society}). Receipt #${data.receiptNumber || 'RCP-01'}. Download: https://manziliq.pk/buyer/documents`,
        emailSubject: `Official Payment Confirmation & Receipt - ${bookingRef}`,
        emailBody: `Dear ${customer},\n\nYour payment has been successfully VERIFIED and credited toward your booking for ${plot} in ${society}.\n\nAmount Paid: ${formatPKR(data.paidAmountPKR)}\nPayment Method: ${data.paymentMethod || 'Online Gateway'}\nReceipt Number: ${data.receiptNumber || 'RCP-2026-001'}\nTransaction ID: ${data.transactionId || 'TXN-998811'}\n\nYour digitally stamped payment receipt is now ready in your Document Locker.\n\nThank you,\n${society} Treasury`,
        emailHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;"><div style="background-color: #059669; color: white; padding: 24px;"><h2 style="margin: 0; font-size: 20px;">✅ Payment Successfully Verified</h2><p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">Receipt: ${data.receiptNumber || 'RCP-2026-001'}</p></div><div style="padding: 24px; line-height: 1.6;"><p>Dear <strong>${customer}</strong>,</p><p>Your payment for <strong>${plot}</strong> has been confirmed.</p><div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 14px; border-radius: 8px; margin: 16px 0;"><div style="font-size: 18px; font-weight: bold; color: #065f46;">Amount: ${formatPKR(data.paidAmountPKR)}</div><div style="font-size: 13px; color: #047857; margin-top: 4px;">Method: ${data.paymentMethod || 'Digital Gateway'} • Ref: ${bookingRef}</div></div></div></div>`,
        fcmTitle: `✅ Payment Confirmed: ${formatPKR(data.paidAmountPKR)}`,
        fcmBody: `Payment verified for ${plot}. Receipt #${data.receiptNumber || 'RCP-01'} generated.`,
        fcmData: { type: 'payment', id: data.receiptNumber || bookingRef, route: '/buyer/installments' },
        referenceType: 'payment',
        referenceId: data.receiptNumber || bookingRef,
        deepLinkRoute: '/buyer/installments',
        defaultChannels: ['in_app', 'push', 'sms', 'email']
      };

    case 'PAYMENT_FAILED':
      return {
        type: 'payment',
        title: `Payment Failed - ${plot}`,
        message: `Your payment attempt of ${formatPKR(data.paidAmountPKR)} for ${plot} could not be completed. Reason: ${data.failureReason || 'Transaction declined by issuer'}. Please retry.`,
        smsPreview: `[MANZILIQ ALERT] Payment of ${formatPKR(data.paidAmountPKR)} for ${plot} FAILED (${data.failureReason || 'Declined'}). Please retry at: https://manziliq.pk/buyer/installments`,
        emailSubject: `Payment Transaction Failed - ${plot}, Ref: ${bookingRef}`,
        emailBody: `Dear ${customer},\n\nWe were unable to process your online payment of ${formatPKR(data.paidAmountPKR)} for ${plot} in ${society}.\n\nReason: ${data.failureReason || 'Transaction timeout or bank decline'}\n\nPlease check your account balance or try an alternate payment channel (JazzCash, EasyPaisa, KuickPay, or Direct Bank Transfer).\n\nNeed assistance? Contact our helpline at 0800-MANZIL.\n\nRegards,\nMANZILIQ Support Team`,
        emailHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;"><div style="background-color: #dc2626; color: white; padding: 24px;"><h2 style="margin: 0; font-size: 20px;">❌ Payment Transaction Failed</h2><p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">Ref: ${bookingRef}</p></div><div style="padding: 24px; line-height: 1.6;"><p>Dear <strong>${customer}</strong>,</p><p>We were unable to process your payment of <strong>${formatPKR(data.paidAmountPKR)}</strong> for <strong>${plot}</strong>.</p><p><strong>Status:</strong> ${data.failureReason || 'Bank Declined'}</p><p>Please re-attempt your payment or select another payment gateway.</p></div></div>`,
        fcmTitle: `❌ Payment Failed: ${plot}`,
        fcmBody: `Payment of ${formatPKR(data.paidAmountPKR)} could not be processed. Tap to retry.`,
        fcmData: { type: 'payment', id: data.bookingId || bookingRef, route: '/buyer/installments' },
        referenceType: 'payment',
        referenceId: data.bookingId || bookingRef,
        deepLinkRoute: '/buyer/installments',
        defaultChannels: ['in_app', 'push', 'sms', 'email']
      };

    // ----------------------------------------------------
    // 5. DOCUMENTS & LEGAL
    // ----------------------------------------------------
    case 'DOCUMENT_AVAILABLE':
      return {
        type: 'document',
        title: `${data.documentTitle || 'Legal Document'} Available`,
        message: `Your verified ${data.documentTitle || 'document'} for ${plot} (${society}) is now ready and stamped. Access your Document Locker to view or download.`,
        smsPreview: `[MANZILIQ Vault] Your official ${data.documentTitle || 'Document'} for ${plot} is ready with digital QR verification. Download: https://manziliq.pk/buyer/documents`,
        emailSubject: `New Document Available: ${data.documentTitle || 'Legal Certificate'} - ${plot}`,
        emailBody: `Dear ${customer},\n\nAn official document has been issued and linked to your booking for ${plot} in ${society}.\n\nDocument: ${data.documentTitle || 'Official Certificate'}\nBooking Ref: ${bookingRef}\nSecurity: Stamped with SHA-256 Tamper-Proof Hash & Public QR Validator\n\nYou may view, print, or download your document anytime from your secure Document Locker.\n\nWarm regards,\nLegal & Records Directorate, ${society}`,
        emailHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;"><div style="background-color: #0f172a; color: white; padding: 24px;"><h2 style="margin: 0; font-size: 20px;">📄 New Document Ready</h2><p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">${data.documentTitle || 'Official Document'}</p></div><div style="padding: 24px; line-height: 1.6;"><p>Dear <strong>${customer}</strong>,</p><p>Your verified <strong>${data.documentTitle || 'Certificate'}</strong> for <strong>${plot}</strong> has been issued and uploaded to your secure vault.</p></div></div>`,
        fcmTitle: `📄 Document Ready: ${data.documentTitle || 'Legal Doc'}`,
        fcmBody: `Your verified ${data.documentTitle || 'document'} for ${plot} is ready for download.`,
        fcmData: { type: 'document', id: data.documentId || bookingRef, route: '/buyer/documents' },
        referenceType: 'document',
        referenceId: data.documentId || bookingRef,
        deepLinkRoute: '/buyer/documents',
        defaultChannels: ['in_app', 'push', 'sms', 'email']
      };

    // ----------------------------------------------------
    // 6. DEALER NOTIFICATIONS (LOTS, LEADS)
    // ----------------------------------------------------
    case 'DEALER_LOT_EXPIRY_WARNING':
      return {
        type: 'lot_assignment',
        title: `Lot Expiry Warning - Lot ${data.lotNumber || 'A-10'}`,
        message: `Your assigned Lot ${data.lotNumber || 'A-10'} (${society}) will expire on ${data.lotExpiryDate || 'soon'} (${data.daysRemaining || 7} days remaining). Submit an extension request or sell remaining plots.`,
        smsPreview: `[MANZILIQ Agent] Warning: Lot ${data.lotNumber} (${society}) expires on ${data.lotExpiryDate} (${data.daysRemaining} days left). Request extension: https://manziliq.pk/dealer/lots`,
        emailSubject: `Urgent: Dealer Lot ${data.lotNumber} Approaching Expiry - ${society}`,
        emailBody: `Dear ${data.dealerName || 'Authorized Dealer'},\n\nThis is an advance notice that your assigned Lot ${data.lotNumber} in ${society} is scheduled to expire on ${data.lotExpiryDate}.\n\nDays Remaining: ${data.daysRemaining || 7} days\n\nTo prevent unreserved plots from being released back to the society public pool, please submit a Lot Renewal or Extension request in the Dealer Desk.\n\nRegards,\nDealer Network Registry`,
        emailHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;"><div style="background-color: #c2410c; color: white; padding: 24px;"><h2 style="margin: 0; font-size: 20px;">⏳ Lot Expiry Approaching</h2><p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">Lot: ${data.lotNumber} • ${society}</p></div><div style="padding: 24px; line-height: 1.6;"><p>Dear <strong>${data.dealerName || 'Dealer'}</strong>,</p><p>Your inventory allocation for <strong>Lot ${data.lotNumber}</strong> will expire on <strong>${data.lotExpiryDate}</strong> (${data.daysRemaining} days remaining).</p></div></div>`,
        fcmTitle: `⏳ Lot Expiry Alert: ${data.lotNumber}`,
        fcmBody: `Lot ${data.lotNumber} expires in ${data.daysRemaining} days (${data.lotExpiryDate}).`,
        fcmData: { type: 'lot', id: data.lotNumber || 'lot-01', route: '/dealer/lots' },
        referenceType: 'lot',
        referenceId: data.lotNumber || 'lot-01',
        deepLinkRoute: '/dealer/lots',
        defaultChannels: ['in_app', 'push', 'sms', 'email']
      };

    case 'DEALER_LOT_EXPIRED':
      return {
        type: 'lot_assignment',
        title: `Lot Expired - Lot ${data.lotNumber || 'A-10'}`,
        message: `Lot ${data.lotNumber || 'A-10'} has reached its expiry date (${data.lotExpiryDate}). Unsold plots have been unassigned and returned to society master inventory.`,
        smsPreview: `[MANZILIQ Agent] Notice: Lot ${data.lotNumber} has expired. Unsold inventory has been released. View details: https://manziliq.pk/dealer/lots`,
        emailSubject: `Notice of Lot Expiry & Inventory Release - Lot ${data.lotNumber}`,
        emailBody: `Dear ${data.dealerName || 'Dealer'},\n\nLot ${data.lotNumber} assigned to your agency at ${society} has reached its contractual expiry date (${data.lotExpiryDate}).\n\nAll unsold plots have been automatically released. You may request a new lot quota anytime.\n\nRegards,\nSociety Allotments Committee`,
        emailHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;"><div style="background-color: #475569; color: white; padding: 24px;"><h2 style="margin: 0; font-size: 20px;">Lot Expiry Notice</h2><p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">Lot: ${data.lotNumber}</p></div><div style="padding: 24px; line-height: 1.6;"><p>Lot <strong>${data.lotNumber}</strong> has concluded its assignment cycle.</p></div></div>`,
        fcmTitle: `Lot Expired: ${data.lotNumber}`,
        fcmBody: `Lot ${data.lotNumber} has expired and unsold plots released.`,
        fcmData: { type: 'lot', id: data.lotNumber || 'lot-01', route: '/dealer/lots' },
        referenceType: 'lot',
        referenceId: data.lotNumber || 'lot-01',
        deepLinkRoute: '/dealer/lots',
        defaultChannels: ['in_app', 'push', 'sms', 'email']
      };

    case 'DEALER_LEAD_ASSIGNED':
      return {
        type: 'inquiry',
        title: `New Verified Lead Assigned - ${data.customerName || 'Prospective Buyer'}`,
        message: `A new verified customer lead (${data.customerName}, Phone: ${data.customerPhone || 'N/A'}) has been assigned to you for ${plot} in ${society}.`,
        smsPreview: `[MANZILIQ Lead] New Buyer Assigned: ${data.customerName} (${data.customerPhone}) is interested in ${plot}. Contact buyer now: https://manziliq.pk/dealer/leads`,
        emailSubject: `New Customer Lead Assigned - ${data.customerName} for ${plot}`,
        emailBody: `Dear ${data.dealerName || 'Dealer'},\n\nA prospective buyer has submitted an inquiry for ${plot} in ${society}.\n\nBuyer: ${data.customerName}\nPhone: ${data.customerPhone}\nEmail: ${data.customerEmail}\n\nPlease follow up promptly in the Dealer CRM.\n\nRegards,\nMANZILIQ Lead Router`,
        emailHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;"><div style="background-color: #4338ca; color: white; padding: 24px;"><h2 style="margin: 0; font-size: 20px;">🎯 New Buyer Lead Assigned</h2></div><div style="padding: 24px; line-height: 1.6;"><p>Dear <strong>${data.dealerName || 'Dealer'}</strong>,</p><p>A buyer has requested assistance for <strong>${plot}</strong>:</p><p><strong>Buyer:</strong> ${data.customerName} (${data.customerPhone})</p></div></div>`,
        fcmTitle: `🎯 New Lead: ${data.customerName}`,
        fcmBody: `New buyer lead assigned for ${plot}. Contact: ${data.customerPhone}`,
        fcmData: { type: 'lead', id: data.customerName || 'lead', route: '/dealer/leads' },
        referenceType: 'lead',
        referenceId: data.customerName || 'lead',
        deepLinkRoute: '/dealer/leads',
        defaultChannels: ['in_app', 'push', 'sms', 'email']
      };

    // ----------------------------------------------------
    // 7. SOCIETY ADMIN NOTIFICATIONS
    // ----------------------------------------------------
    case 'SOCIETY_ADMIN_NEW_BOOKING':
      return {
        type: 'booking',
        title: `New Booking Request - ${plot}`,
        message: `Buyer ${customer} submitted a booking application with token of ${formatPKR(data.paidAmountPKR)} for ${plot}. Verification required.`,
        smsPreview: `[MANZILIQ Society] Booking Request: ${customer} booked ${plot}. Token: ${formatPKR(data.paidAmountPKR)}. Review: https://manziliq.pk/society/approvals`,
        emailSubject: `Action Required: New Booking Application - ${plot} (${society})`,
        emailBody: `Dear Society Administrator,\n\nA new token booking application has been received for ${plot} at ${society}.\n\nApplicant: ${customer}\nCNIC / Phone: ${data.customerPhone}\nToken Amount: ${formatPKR(data.paidAmountPKR)}\nBooking Ref: ${bookingRef}\n\nPlease review applicant documentation and issue approval/rejection in the Society Approvals Desk.\n\nRegards,\nMANZILIQ Society Desk`,
        emailHtml: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;"><div style="background-color: #064e3b; color: white; padding: 24px;"><h2 style="margin: 0; font-size: 20px;">New Booking Awaiting Approval</h2><p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">Plot: ${plot} • Ref: ${bookingRef}</p></div><div style="padding: 24px; line-height: 1.6;"><p>Applicant <strong>${customer}</strong> has submitted a booking token for <strong>${plot}</strong>.</p></div></div>`,
        fcmTitle: `New Booking: ${plot}`,
        fcmBody: `Token of ${formatPKR(data.paidAmountPKR)} submitted for ${plot}. Review required.`,
        fcmData: { type: 'booking', id: data.bookingId || bookingRef, route: '/society/approvals' },
        referenceType: 'booking',
        referenceId: data.bookingId || bookingRef,
        deepLinkRoute: '/society/approvals',
        defaultChannels: ['in_app', 'push', 'sms', 'email']
      };

    default:
      return {
        type: 'system',
        title: data.inquiryTitle || `System Notification - ${society}`,
        message: data.customMessage || `You have a new update regarding ${plot} in ${society}.`,
        smsPreview: `[MANZILIQ] ${data.customMessage || 'You have a new notification.'} View: https://manziliq.pk`,
        emailSubject: `Notification from MANZILIQ Platform`,
        emailBody: `Hello,\n\n${data.customMessage || 'You have received a system update.'}\n\nRegards,\nMANZILIQ Team`,
        emailHtml: `<p>${data.customMessage || 'System Update'}</p>`,
        fcmTitle: `MANZILIQ Notification`,
        fcmBody: data.customMessage || 'You have a new update.',
        fcmData: { type: 'system', id: 'sys', route: '/buyer/notifications' },
        referenceType: 'user',
        referenceId: 'system',
        deepLinkRoute: '/buyer/notifications',
        defaultChannels: ['in_app', 'push', 'sms', 'email']
      };
  }
}
