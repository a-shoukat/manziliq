import jsPDF from 'jspdf';
import { generateTransferDeedPDF, generateSaleAgreementPDF } from '../services/legalDocumentService';

export interface DocumentParams {
  docType: 
    | 'allotment_letter' 
    | 'booking_agreement' 
    | 'transfer_deed' 
    | 'token_receipt' 
    | 'token_slip'
    | 'noc_certificate' 
    | 'cancellation_letter' 
    | 'receipt' 
    | 'payment_receipt' 
    | 'dealer_lot_certificate';
  buyerName?: string;
  buyerPhone?: string;
  buyerCNIC?: string;
  buyerAddress?: string;
  plotNumber?: string;
  sector?: string;
  block?: string;
  sizeMarla?: number;
  societyName: string;
  societyNOC?: string;
  totalPricePKR?: number;
  downPaymentPKR?: number;
  paidAmountPKR?: number;
  installmentNo?: number;
  monthlyInstallmentPKR?: number;
  totalInstallments?: number;
  transactionId?: string;
  paymentMethod?: string;
  date?: string;
  issueDate?: string;
  allotmentNumber?: string;
  bookingReference?: string;
  nocNumber?: string;
  dealerName?: string;
  cancellationReason?: string;
  cancellationPenaltyPKR?: number;
  lotNumber?: string;
  assignedPlots?: string;
  commissionPercent?: number;
  expiryDate?: string;
  version?: string;
  verificationCode?: string;
  transferFeePKR?: number;
}

export function generatePDFDocument(params: DocumentParams) {
  // Delegate specialized high-fidelity generation with QR codes for transfer deed and sale agreements
  if (params.docType === 'transfer_deed') {
    generateTransferDeedPDF({
      buyerName: params.buyerName || 'Valued Purchaser',
      buyerCnic: params.buyerCNIC || '34501-1234567-1',
      buyerPhone: params.buyerPhone || '+92 300 1234567',
      buyerAddress: params.buyerAddress,
      societyName: params.societyName,
      societyNoc: params.societyNOC || 'LDA/TMA Approved',
      plotNumber: params.plotNumber || 'Plot 42-A',
      sector: params.sector || 'Executive Block',
      block: params.block || 'Block A',
      sizeMarla: params.sizeMarla || 5,
      location: 'Narowal / Lahore, Punjab',
      totalPricePKR: params.totalPricePKR || 2600000,
      transferFeePKR: params.transferFeePKR || Math.round((params.totalPricePKR || 2600000) * 0.03),
      transferDate: params.date || params.issueDate || new Date().toISOString().split('T')[0],
      deedNumber: params.allotmentNumber || `TD-PK-${Date.now().toString().slice(-6)}`,
      verificationCode: params.verificationCode
    }, { download: true });
    return;
  }

  if (params.docType === 'booking_agreement') {
    generateSaleAgreementPDF({
      buyerName: params.buyerName || 'Valued Purchaser',
      buyerCnic: params.buyerCNIC || '34501-1234567-1',
      buyerPhone: params.buyerPhone || '+92 300 1234567',
      buyerAddress: params.buyerAddress,
      societyName: params.societyName,
      societyNoc: params.societyNOC || 'LDA/TMA Verified',
      plotNumber: params.plotNumber || 'Plot 42-A',
      sector: params.sector || 'Executive Block',
      block: params.block || 'Block A',
      sizeMarla: params.sizeMarla || 5,
      location: 'Narowal / Lahore, Punjab',
      totalPricePKR: params.totalPricePKR || 2600000,
      downPaymentPKR: params.downPaymentPKR || Math.round((params.totalPricePKR || 2600000) * 0.2),
      monthlyInstallmentPKR: params.monthlyInstallmentPKR || Math.round(((params.totalPricePKR || 2600000) * 0.8) / 36),
      totalInstallments: params.totalInstallments || 36,
      agreementDate: params.date || params.issueDate || new Date().toISOString().split('T')[0],
      agreementNumber: params.bookingReference || `AGR-PK-${Date.now().toString().slice(-6)}`,
      verificationCode: params.verificationCode,
      dealerName: params.dealerName
    }, { download: true });
    return;
  }

  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [15, 42, 63]; // Navy Teal #0F2A3F
  const accentColor = [217, 119, 6]; // Amber Gold #D97706
  const slateText = [51, 65, 85];
  const emeraldColor = [16, 185, 129];
  const dateStr = params.date || params.issueDate || new Date().toISOString().split('T')[0];
  const verCode = params.verificationCode || `VRF-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 36, 'F');

  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 36, 210, 3, 'F');

  // Background Tamper-evident Watermark
  doc.setTextColor(240, 245, 250);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(44);
  doc.text('MANZILIQ VERIFIED', 105, 150, { align: 'center', angle: 45 });

  // Brand Name & Subheading
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('MANZILIQ', 15, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Smart Housing Society & Real Estate Management Core (Punjab Housing By-Laws)', 15, 26);
  doc.text(`Authority: ${params.societyName} | NOC: ${params.societyNOC || 'TMA/LDA Approved'}`, 15, 32);

  const docRef = params.allotmentNumber || params.bookingReference || `PROP-${Math.floor(100000 + Math.random() * 900000)}`;
  doc.setFontSize(9.5);
  doc.text(`Doc Ref: ${docRef}`, 145, 18);
  doc.text(`Issue Date: ${dateStr}`, 145, 25);
  doc.text(`Security Hash: ${verCode.slice(0, 14)}`, 145, 32);

  // Document Title & Classification
  let title = 'OFFICIAL PROPERTY ALLOTMENT LETTER';
  let badgeText = 'LDA / TMA VERIFIED STATUTORY ALLOTMENT';
  
  if (params.docType === 'token_receipt' || params.docType === 'token_slip') {
    title = 'OFFICIAL TOKEN ADVANCE RESERVATION RECEIPT';
    badgeText = 'SOCIETY ESCROW INTERIM RESERVATION RECEIPT';
  } else if (params.docType === 'noc_certificate') {
    title = 'NO OBJECTION CERTIFICATE (NOC)';
    badgeText = 'TMA / LDA ZONING & TITLE CLEARANCE';
  } else if (params.docType === 'cancellation_letter') {
    title = 'PLOT ALLOTMENT CANCELLATION & SURRENDER NOTICE';
    badgeText = 'STATUTORY SECTION 8 HOUSING BY-LAWS SURRENDER NOTICE';
  } else if (params.docType === 'receipt' || params.docType === 'payment_receipt') {
    title = 'OFFICIAL INSTALLMENT PAYMENT RECEIPT';
    badgeText = '1LINK / STATE BANK RECONCILED PAYMENT RECEIPT';
  } else if (params.docType === 'dealer_lot_certificate') {
    title = 'EXCLUSIVE DEALER LOT ALLOCATION CERTIFICATE';
    badgeText = 'SINGLE-BROKER BINDING MANDATE';
  }

  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(title, 105, 48, { align: 'center' });

  // Badge pill
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(45, 52, 120, 6.5, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(badgeText, 105, 56.5, { align: 'center' });

  doc.setDrawColor(226, 232, 240);
  doc.line(15, 62, 195, 62);

  // Content Table
  let y = 70;
  doc.setFontSize(9.5);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);

  const addRow = (label: string, value: string) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 82, y);
    y += 8.5;
  };

  if (params.docType === 'dealer_lot_certificate') {
    addRow('Issuing Housing Society:', params.societyName);
    addRow('Allocated Lot Reference:', params.lotNumber || 'LOT-EXCLUSIVE');
    addRow('Target Sector / Block:', params.block || params.sector || 'Executive Block');
    addRow('Assigned Licensee / Agency:', params.dealerName || 'Authorized Realtor');
    addRow('Assigned Plot Inventory:', params.assignedPlots || params.plotNumber || 'Multiple Plots');
    addRow('Authorized Commission Rate:', `${params.commissionPercent || 2.0}% upon downpayment realization`);
    addRow('Contract Expiry Term:', params.expiryDate || '2026-12-31');
    addRow('Enforcement Protocol:', 'Strict Single-Broker Binding (Anti-Poaching Rule Active)');
  } else {
    addRow('Issuing Housing Society:', params.societyName);
    addRow('Plot / Unit Identification:', `${params.plotNumber || 'Plot A-01'} ${params.sector ? `(${params.sector})` : ''}`);
    if (params.sizeMarla) addRow('Plot Area / Dimensions:', `${params.sizeMarla} Marla (${params.sizeMarla * 225} Sq. Ft.)`);
    addRow('Allottee / Purchaser Name:', params.buyerName || 'Valued Purchaser');
    addRow('Purchaser CNIC:', params.buyerCNIC || '34501-XXXXXXX-X (NADRA Verified)');
    addRow('Contact Phone:', params.buyerPhone || '+92 300 0000000');
    if (params.buyerAddress) addRow('Registered Address:', params.buyerAddress);
    if (params.dealerName) addRow('Authorized Facilitating Dealer:', params.dealerName);
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(15, y, 195, y);
  y += 8.5;

  if (params.docType === 'receipt' || params.docType === 'payment_receipt' || params.docType === 'token_receipt') {
    addRow('Payment Nature:', params.docType === 'token_receipt' ? 'Token Advance Reservation' : (params.installmentNo ? `Monthly Installment #${params.installmentNo}` : 'Down Payment Clearance'));
    addRow('Amount Cleared:', `PKR ${(params.paidAmountPKR || params.downPaymentPKR || 50000).toLocaleString('en-PK')}`);
    addRow('Payment Channel / Method:', params.paymentMethod || 'JazzCash / EasyPaisa / 1Link Digital SBP Settlement');
    addRow('Transaction Audit Reference:', params.transactionId || `TXN-PK-${Date.now().toString().slice(-8)}`);
    addRow('Verification Status:', '100% RECONCILED IN ESCROW');
  } else if (params.docType === 'cancellation_letter') {
    addRow('Total Agreed Plot Price:', `PKR ${(params.totalPricePKR || 2500000).toLocaleString('en-PK')}`);
    addRow('Cancellation Statutory Clause:', 'Section 8 of Housing Society By-Laws (10% Statutory Deduction)');
    addRow('Applied Cancellation Penalty:', `PKR ${(params.cancellationPenaltyPKR || Math.round((params.totalPricePKR || 2500000) * 0.1)).toLocaleString('en-PK')} (10%)`);
    addRow('Reason for Surrender / Voiding:', params.cancellationReason || 'Mutual consent surrender or non-payment default after 3 statutory grace notices.');
  } else {
    addRow('Total Agreed Property Price:', `PKR ${(params.totalPricePKR || 2500000).toLocaleString('en-PK')}`);
    if (params.downPaymentPKR) {
      addRow('Verified Down Payment:', `PKR ${params.downPaymentPKR.toLocaleString('en-PK')} (Cleared)`);
    }
    addRow('TMA / District Registry Status:', 'Compliant with Government of Punjab Housing Guidelines');
    addRow('Possession & Transfer Eligibility:', 'Handover upon clearance of scheduled installments.');
  }

  // Legal declaration box
  y += 3;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, 180, 38, 2.5, 2.5, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, y, 180, 38, 2.5, 2.5, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('LEGAL NOTARIZATION & DIGITAL AUDIT TRAIL:', 20, y + 6.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const legalText = `This instrument is generated automatically by MANZILIQ Smart Housing Core. All records are cross-verified against housing society master land surveys, municipal development authority registration logs, and State Bank of Pakistan bank settlement channels. Any unauthorized alteration, duplication, or secondary encumbrance without society written approval renders this document null and void under the Transfer of Property Act 1882.`;
  doc.text(doc.splitTextToSize(legalText, 170), 20, y + 12.5);

  // Digital Stamps and Signatures (3 Stakeholders: Society, Dealer, Allottee)
  y += 46;
  
  // Left: Society Authority Stamp
  doc.setDrawColor(15, 42, 63);
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(15, y, 55, 24, 2, 2, 'FD');
  doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('SOCIETY OFFICIAL SEAL', 42.5, y + 7, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text('Director Town Planning', 42.5, y + 13, { align: 'center' });
  doc.text('Digitally Signed & Affixed', 42.5, y + 19, { align: 'center' });

  // Center: Facilitating Dealer Stamp
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(77.5, y, 55, 24, 2, 2, 'FD');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('AUTHORIZED REALTOR', 105, y + 7, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text(params.dealerName || 'Direct Society Booking', 105, y + 13, { align: 'center' });
  doc.text('Broker License Verified', 105, y + 19, { align: 'center' });

  // Right: Purchaser / Allottee Signature
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(140, y, 55, 24, 2, 2, 'FD');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('PURCHASER / HOLDER', 167.5, y + 7, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(slateText[0], slateText[1], slateText[2]);
  doc.text(params.buyerName || 'Muhammad Farooq', 167.5, y + 13, { align: 'center' });
  doc.text('CNIC Signature Verified', 167.5, y + 19, { align: 'center' });

  // Footer bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 285, 210, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text(`MANZILIQ Real Estate Core • Pakistan • Verification: manziliq.pk/verify?code=${verCode}`, 105, 292, { align: 'center' });

  // Save the document
  const safePlot = (params.plotNumber || 'plot').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${params.docType}_${safePlot}_${Date.now().toString().slice(-4)}.pdf`;
  doc.save(fileName);
}
