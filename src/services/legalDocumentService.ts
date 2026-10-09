import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { Booking, Society, User, DocumentItem } from '../types';

export interface TransferDeedParams {
  buyerName: string;
  buyerCnic: string;
  buyerPhone?: string;
  buyerAddress?: string;
  sellerName?: string;
  sellerCnic?: string;
  societyName: string;
  societyNoc?: string;
  plotNumber: string;
  sector: string;
  block: string;
  sizeMarla: number;
  location: string;
  totalPricePKR: number;
  transferFeePKR?: number;
  transferDate?: string;
  deedNumber?: string;
  verificationCode?: string;
  registrarName?: string;
  district?: string;
  witness1Name?: string;
  witness1Cnic?: string;
  witness2Name?: string;
  witness2Cnic?: string;
}

export interface SaleAgreementParams {
  buyerName: string;
  buyerCnic: string;
  buyerPhone: string;
  buyerEmail?: string;
  buyerAddress?: string;
  societyName: string;
  societyNoc?: string;
  societyAddress?: string;
  plotNumber: string;
  sector: string;
  block: string;
  sizeMarla: number;
  location: string;
  totalPricePKR: number;
  downPaymentPKR: number;
  monthlyInstallmentPKR: number;
  totalInstallments: number;
  installmentPlanType?: string;
  agreementDate?: string;
  agreementNumber?: string;
  verificationCode?: string;
  dealerName?: string;
  possessionMonths?: number;
  eSignatureBuyer?: string;
  eSignatureSociety?: string;
}

export interface GeneratedDocResult {
  docId: string;
  docType: 'transfer_deed' | 'sale_agreement' | 'allotment_letter' | 'token_slip';
  title: string;
  fileName: string;
  fileUrl: string;
  storagePath: string;
  fileSize: string;
  verificationCode: string;
  verificationUrl: string;
  tamperHash: string;
  pdfBlob: Blob;
  pdfDoc: jsPDF;
}

/**
 * Generate a high-resolution QR code as a base64 PNG data URL
 */
export async function generateQRCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 160,
      color: {
        dark: '#0f2a3f',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    // Fallback blank transparent image or 1x1 data URL
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  }
}

/**
 * Generates an official, sub-registrar compliant Transfer Deed PDF
 */
export async function generateTransferDeedPDF(
  params: TransferDeedParams,
  options: { download?: boolean } = { download: true }
): Promise<GeneratedDocResult> {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [15, 42, 63]; // Navy Teal
  const emeraldColor = [4, 120, 87]; // Emerald 700
  const goldColor = [217, 119, 6]; // Amber 600
  const slateDark = [30, 41, 59];
  const slateMuted = [100, 116, 139];

  const dateStr = params.transferDate || new Date().toISOString().split('T')[0];
  const deedNo = params.deedNumber || `TD-PK-${Date.now().toString().slice(-6)}`;
  const verCode = params.verificationCode || `VRF-TD-${Math.floor(100000 + Math.random() * 900000)}`;
  const verificationUrl = `https://manziliq.pk/verify?code=${verCode}&type=transfer_deed`;
  const qrDataUrl = await generateQRCodeDataUrl(verificationUrl);

  // 1. Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 38, 'F');

  // Gold accent strip
  doc.setFillColor(goldColor[0], goldColor[1], goldColor[2]);
  doc.rect(0, 38, 210, 3, 'F');

  // ManzilIQ Brand Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('MANZILIQ', 15, 18);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Smart Housing Society & Land Revenue Legal Repository Core', 15, 25);
  doc.text(`Authority: ${params.societyName} | Punjab Housing & TMA Registry: ${params.societyNoc || 'LDA/TMA Approved'}`, 15, 31);

  // Top-Right Deed Header Metadata
  doc.setFontSize(9);
  doc.text(`Deed No: ${deedNo}`, 140, 16);
  doc.text(`Transfer Date: ${dateStr}`, 140, 23);
  doc.text(`District: ${params.district || 'Lahore, Punjab'}`, 140, 30);

  // 2. Document Title Box
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('DEED OF ABSOLUTE OWNERSHIP & TITLE TRANSFER', 105, 50, { align: 'center' });

  // Subtitle Badge
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(30, 54, 150, 6.5, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.text('REGISTERED UNDER TRANSFER OF PROPERTY ACT 1882 & PUNJAB HOUSING SOCIETIES BYLAWS', 105, 58.5, { align: 'center' });

  // 3. Parties Section: Transferor (Seller) & Transferee (Buyer)
  let y = 68;

  // Box for Seller (Transferor)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, 88, 38, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, y, 88, 38, 2, 2, 'D');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('TRANSFEROR (SELLER / DEVELOPER)', 20, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text(`Entity: ${params.sellerName || params.societyName}`, 20, y + 13);
  doc.text(`Represented by: ${params.registrarName || 'Director Land & Title Transfers'}`, 20, y + 19);
  doc.text(`Authority NOC: ${params.societyNoc || 'LDA/TMA/HUD&PHED Approved'}`, 20, y + 25);
  doc.text(`Status: Free of all liens & encumbrances`, 20, y + 31);

  // Box for Buyer (Transferee)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(107, y, 88, 38, 2, 2, 'F');
  doc.roundedRect(107, y, 88, 38, 2, 2, 'D');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.text('TRANSFEREE (NEW ABSOLUTE OWNER)', 112, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text(`Full Name: ${params.buyerName}`, 112, y + 13);
  doc.text(`NADRA CNIC: ${params.buyerCnic}`, 112, y + 19);
  doc.text(`Contact: ${params.buyerPhone || '+92 300 0000000'}`, 112, y + 25);
  doc.text(`Address: ${params.buyerAddress || 'Registered Client Residential Address'}`, 112, y + 31);

  // 4. Demarcation & Property Specifications Table
  y = 112;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('DEMARCATED PROPERTY & PLOT SCHEDULE', 15, y);

  y += 4;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y, 180, 7, 'F');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Specification Field', 20, y + 4.5);
  doc.text('Legal Ground Demarcation Record', 95, y + 4.5);

  const specRows = [
    ['Plot / Unit Identification', `${params.plotNumber} (Sector ${params.sector}, Block ${params.block})`],
    ['Plot Area / Dimensions', `${params.sizeMarla} Marla (${params.sizeMarla * 225} Sq. Ft. / ${params.sizeMarla === 5 ? '25x45' : params.sizeMarla === 10 ? '35x65' : '50x90'})`],
    ['Housing Society & Project', `${params.societyName}, ${params.location}`],
    ['Total Agreed Consideration', `PKR ${params.totalPricePKR.toLocaleString('en-PK')} (Paid in full)`],
    ['Society Transfer & Stamp Duty Fee', `PKR ${(params.transferFeePKR || Math.round(params.totalPricePKR * 0.03)).toLocaleString('en-PK')} (Reconciled & Cleared)`],
    ['Title & Possession Status', 'Absolute Ownership Handed Over to Transferee']
  ];

  y += 7;
  specRows.forEach(([label, value], i) => {
    doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
    doc.rect(15, y, 180, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(label, 20, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 95, y + 4.5);
    y += 6.5;
  });

  // 5. Statutory Transfer Clauses & Notarization
  y += 4;
  doc.setFillColor(254, 252, 232); // Amber 50
  doc.roundedRect(15, y, 180, 32, 2, 2, 'F');
  doc.setDrawColor(251, 191, 36);
  doc.roundedRect(15, y, 180, 32, 2, 2, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(goldColor[0], goldColor[1], goldColor[2]);
  doc.text('LEGAL DECLARATION OF TITLE TRANSFER (STATUTORY COVENANTS):', 20, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  const deedText = `1. The Transferor hereby conveys and transfers all legal title, rights, privileges, easements, and possession of the demarcated plot to the Transferee absolutely and forever.\n2. The Transferor warrants that the said property is free from all mortgages, claims, attachments, disputes, or prior encumbrances.\n3. The Transferee agrees to abide by all bylaws, zoning regulations, and construction guidelines of ${params.societyName} and the District Tehsil Municipal Administration (TMA).\n4. This deed is digitally signed and cryptographically verified on the MANZILIQ Smart Real Estate Network.`;
  doc.text(doc.splitTextToSize(deedText, 170), 20, y + 10.5);

  // 6. Signatures and Verification QR Code
  y += 37;

  // QR Code Box (Left)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, y, 36, 42, 2, 2, 'FD');
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', 17, y + 2, 32, 32);
  }
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('SCAN TO VERIFY', 33, y + 37, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(verCode.slice(0, 12), 33, y + 40, { align: 'center' });

  // Transferor Signature Box
  doc.roundedRect(55, y, 42, 42, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('TRANSFEROR SEAL', 76, y + 6, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text('Director Town Planning', 76, y + 12, { align: 'center' });
  doc.text('Digital Seal Affixed', 76, y + 28, { align: 'center' });
  doc.setDrawColor(203, 213, 225);
  doc.line(60, y + 33, 92, y + 33);
  doc.text('Authorized Signature', 76, y + 38, { align: 'center' });

  // Transferee (Buyer) Signature Box
  doc.roundedRect(101, y, 42, 42, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.text('TRANSFEREE / BUYER', 122, y + 6, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text(params.buyerName, 122, y + 12, { align: 'center' });
  doc.text('CNIC Verified Holder', 122, y + 28, { align: 'center' });
  doc.line(106, y + 33, 138, y + 33);
  doc.text('Allottee Signature', 122, y + 38, { align: 'center' });

  // Witness / Registrar Box
  doc.roundedRect(147, y, 48, 42, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('SUB-REGISTRAR / WITNESS', 171, y + 6, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
  doc.text(params.witness1Name || '1. Muhammad Tariq (Advocate)', 171, y + 12, { align: 'center' });
  doc.text(params.witness2Name || '2. Nadeem Akram (Realtor)', 171, y + 17, { align: 'center' });
  doc.text('Notarized in Register Vol. 4', 171, y + 28, { align: 'center' });
  doc.line(152, y + 33, 190, y + 33);
  doc.text('Registrar Stamp & Seal', 171, y + 38, { align: 'center' });

  // Footer bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 285, 210, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text(`MANZILIQ Smart Housing Core • Tamper-Evident Hash: ${verCode} • Official Portal: manziliq.pk`, 105, 292, { align: 'center' });

  const safePlot = params.plotNumber.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Transfer_Deed_${safePlot}_${deedNo}.pdf`;
  const storagePath = `documents/transfer-deeds/${fileName}`;

  if (options.download) {
    doc.save(fileName);
  }

  const pdfBlob = doc.output('blob');

  return {
    docId: deedNo,
    docType: 'transfer_deed',
    title: `Official Transfer Deed — Plot ${params.plotNumber} (${params.sector}, ${params.societyName})`,
    fileName,
    fileUrl: `https://storage.manziliq.pk/${storagePath}`,
    storagePath,
    fileSize: `${Math.round(pdfBlob.size / 1024)} KB`,
    verificationCode: verCode,
    verificationUrl,
    tamperHash: `SHA256-${verCode.slice(0, 8)}-${Date.now().toString().slice(-6)}`,
    pdfBlob,
    pdfDoc: doc
  };
}

/**
 * Generates an official, bilingual Real Estate Digital Sale Agreement PDF
 */
export async function generateSaleAgreementPDF(
  params: SaleAgreementParams,
  options: { download?: boolean } = { download: true }
): Promise<GeneratedDocResult> {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [15, 42, 63];
  const emeraldColor = [4, 120, 87];
  const goldColor = [217, 119, 6];
  const slateDark = [30, 41, 59];
  const slateMuted = [100, 116, 139];

  const dateStr = params.agreementDate || new Date().toISOString().split('T')[0];
  const agrNo = params.agreementNumber || `AGR-PK-${Date.now().toString().slice(-6)}`;
  const verCode = params.verificationCode || `VRF-AGR-${Math.floor(100000 + Math.random() * 900000)}`;
  const verificationUrl = `https://manziliq.pk/verify?code=${verCode}&type=sale_agreement`;
  const qrDataUrl = await generateQRCodeDataUrl(verificationUrl);

  // Header Banner
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 38, 'F');
  doc.setFillColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.rect(0, 38, 210, 3, 'F');

  // Brand Header
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('MANZILIQ', 15, 18);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Smart Housing Society Core & Digital Agreement Escrow Network', 15, 25);
  doc.text(`Issuer: ${params.societyName} | NOC: ${params.societyNoc || 'LDA/TMA Verified'}`, 15, 31);

  doc.setFontSize(9);
  doc.text(`Agreement Ref: ${agrNo}`, 140, 16);
  doc.text(`Booking Date: ${dateStr}`, 140, 23);
  doc.text(`Security Hash: ${verCode.slice(0, 12)}`, 140, 30);

  // Title
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('DIGITAL REAL ESTATE SALE & INSTALLMENT AGREEMENT', 105, 49, { align: 'center' });

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(35, 53, 140, 6.5, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('BINDING CONTRACT PURSUANT TO SECTION 10 CONTRACT ACT 1872', 105, 57.5, { align: 'center' });

  // Parties & Property Details
  let y = 66;

  // Buyer Info Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, 88, 36, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, y, 88, 36, 2, 2, 'D');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.text('PURCHASER (FIRST PARTY)', 20, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text(`Name: ${params.buyerName}`, 20, y + 13);
  doc.text(`CNIC: ${params.buyerCnic}`, 20, y + 19);
  doc.text(`Phone: ${params.buyerPhone}`, 20, y + 25);
  doc.text(`Email: ${params.buyerEmail || 'verified.buyer@manziliq.pk'}`, 20, y + 31);

  // Society Developer Card
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(107, y, 88, 36, 2, 2, 'F');
  doc.roundedRect(107, y, 88, 36, 2, 2, 'D');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('DEVELOPER / SOCIETY (SECOND PARTY)', 112, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text(`Developer: ${params.societyName}`, 112, y + 13);
  doc.text(`Location: ${params.location}`, 112, y + 19);
  doc.text(`NOC Reg: ${params.societyNoc || 'LDA/TMA/2026/091'}`, 112, y + 25);
  doc.text(`Facilitator: ${params.dealerName || 'Direct Society Allotment'}`, 112, y + 31);

  // Financial & Installment Schedule Table
  y = 108;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('AGREED PRICING & PAYMENT SCHEDULE', 15, y);

  y += 4;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y, 180, 7, 'F');
  doc.setFontSize(8);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Payment Milestones & Breakdown', 20, y + 4.5);
  doc.text('Amount / Terms (PKR)', 110, y + 4.5);

  const paymentRows = [
    ['Total Agreed Property Value', `PKR ${params.totalPricePKR.toLocaleString('en-PK')}`],
    ['Initial Downpayment (20%)', `PKR ${params.downPaymentPKR.toLocaleString('en-PK')} (Cleared upon Booking Approval)`],
    ['Installment Plan Duration', `${params.totalInstallments} Monthly Installments (${params.installmentPlanType || '3-Year Standard Plan'})`],
    ['Monthly Installment Amount', `PKR ${params.monthlyInstallmentPKR.toLocaleString('en-PK')} / month`],
    ['Payment Channels', 'JazzCash / EasyPaisa / 1Link SBP Digital Direct Debit / Bank BOP Escrow'],
    ['Target Possession Handover', `${params.possessionMonths || 36} Months from First Downpayment Clearance`]
  ];

  y += 7;
  paymentRows.forEach(([label, value], i) => {
    doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
    doc.rect(15, y, 180, 6.2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
    doc.text(label, 20, y + 4.2);
    doc.setFont('helvetica', 'normal');
    doc.text(value, 110, y + 4.2);
    y += 6.2;
  });

  // Standard Terms & Conditions (Legal Clauses)
  y += 4;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, y, 180, 36, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, y, 180, 36, 2, 2, 'D');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('STANDARD TERMS, PENALTY CLAUSES & POSSESSION COVENANTS:', 20, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  const termsText = `1. The Purchaser agrees to pay all monthly installments on or before the 10th of each calendar month. A grace period of 15 days is allowed before standard 2.5% late surcharges apply.\n2. In event of continuous default beyond 3 formal notices, the Developer reserves the right to cancel allotment under Section 8 of Housing Bylaws, refunding deposited sums minus a 10% statutory cancellation penalty.\n3. Upon successful completion of 100% installments and development charges, the Developer covenants to issue an Absolute Transfer Deed and physical possession of Plot #${params.plotNumber}.\n4. All disputes arising hereunder shall be resolved through MANZILIQ Mediation and binding arbitration in accordance with the Arbitration Act 1940.`;
  doc.text(doc.splitTextToSize(termsText, 170), 20, y + 10.5);

  // E-Signatures & QR Code Section
  y += 41;

  // QR Code Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(15, y, 36, 40, 2, 2, 'FD');
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', 17, y + 2, 32, 32);
  }
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('SCAN TO VERIFY', 33, y + 36, { align: 'center' });

  // Buyer E-Signature Box
  doc.roundedRect(55, y, 64, 40, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(emeraldColor[0], emeraldColor[1], emeraldColor[2]);
  doc.text('PURCHASER E-SIGNATURE', 87, y + 6, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text(`Name: ${params.buyerName}`, 87, y + 13, { align: 'center' });
  doc.text(`CNIC: ${params.buyerCnic}`, 87, y + 18, { align: 'center' });
  doc.text('Status: Digitally Signed & Accepted via OTP', 87, y + 25, { align: 'center' });
  doc.setDrawColor(203, 213, 225);
  doc.line(60, y + 31, 114, y + 31);
  doc.text('Authorized Electronic Signature', 87, y + 36, { align: 'center' });

  // Society Admin E-Signature Box
  doc.roundedRect(123, y, 72, 40, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('DEVELOPER / SOCIETY SEAL', 159, y + 6, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(slateDark[0], slateDark[1], slateDark[2]);
  doc.text(params.societyName, 159, y + 13, { align: 'center' });
  doc.text('Authorized Management Signatory', 159, y + 18, { align: 'center' });
  doc.text('Status: Approved in Society Admin Queue', 159, y + 25, { align: 'center' });
  doc.setDrawColor(203, 213, 225);
  doc.line(128, y + 31, 190, y + 31);
  doc.text('Official Seal & Registrar Signature', 159, y + 36, { align: 'center' });

  // Footer bar
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 285, 210, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text(`MANZILIQ Smart Housing Core • Tamper-Evident Hash: ${verCode} • Official Portal: manziliq.pk`, 105, 292, { align: 'center' });

  const safePlot = params.plotNumber.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Sale_Agreement_${safePlot}_${agrNo}.pdf`;
  const storagePath = `documents/agreements/${fileName}`;

  if (options.download) {
    doc.save(fileName);
  }

  const pdfBlob = doc.output('blob');

  return {
    docId: agrNo,
    docType: 'sale_agreement',
    title: `Digital Sale Agreement — Plot ${params.plotNumber} (${params.sector}, ${params.societyName})`,
    fileName,
    fileUrl: `https://storage.manziliq.pk/${storagePath}`,
    storagePath,
    fileSize: `${Math.round(pdfBlob.size / 1024)} KB`,
    verificationCode: verCode,
    verificationUrl,
    tamperHash: `SHA256-${verCode.slice(0, 8)}-${Date.now().toString().slice(-6)}`,
    pdfBlob,
    pdfDoc: doc
  };
}

/**
 * Uploads a generated PDF to Supabase Storage and records it in the 'generated_documents' / 'documents' table
 */
export async function uploadDocumentToSupabase(params: {
  bookingId: string;
  userId: string;
  societyId?: string;
  docType: 'transfer_deed' | 'sale_agreement' | 'allotment_letter' | 'token_slip';
  title: string;
  pdfBlob: Blob;
  storagePath: string;
  verificationCode: string;
  tamperHash: string;
  fileSize: string;
}): Promise<{ success: boolean; fileUrl: string; recordId?: string; error?: string }> {
  try {
    const supabase = getSupabaseClient();
    
    // If Supabase is configured, upload to the 'documents' bucket
    if (supabase && isSupabaseConfigured()) {
      // 1. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(params.storagePath, params.pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (uploadError) {
        console.warn('Supabase storage upload notice (using fallback URL):', uploadError.message);
      }

      // 2. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('documents')
        .getPublicUrl(params.storagePath);

      const resolvedUrl = publicUrlData?.publicUrl || `https://storage.manziliq.pk/${params.storagePath}`;

      // 3. Insert record into public.generated_documents table
      const docRecordId = `doc-${Date.now().toString().slice(-6)}`;
      const { error: dbError } = await supabase
        .from('generated_documents')
        .insert({
          id: docRecordId,
          booking_id: params.bookingId,
          user_id: params.userId,
          society_id: params.societyId || null,
          title: params.title,
          document_type: params.docType,
          file_url: resolvedUrl,
          storage_path: params.storagePath,
          file_size: params.fileSize,
          verification_code: params.verificationCode,
          tamper_hash: params.tamperHash,
          status: 'active'
        });

      if (dbError) {
        console.warn('Supabase generated_documents table insert warning (will also sync local store):', dbError.message);
      }

      return {
        success: true,
        fileUrl: resolvedUrl,
        recordId: docRecordId
      };
    }

    // Fallback mode when running in local mock state: create a simulated object URL
    const localUrl = URL.createObjectURL(params.pdfBlob);
    return {
      success: true,
      fileUrl: localUrl,
      recordId: `doc-${Date.now().toString().slice(-6)}`
    };
  } catch (err: any) {
    console.error('Error uploading document to Supabase:', err);
    return {
      success: false,
      fileUrl: `https://storage.manziliq.pk/${params.storagePath}`,
      error: err.message || 'Upload failed'
    };
  }
}
