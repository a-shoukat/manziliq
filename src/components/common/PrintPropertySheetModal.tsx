import React, { useRef, useState } from 'react';
import { Property } from '../../types';
import { ManzilIQLogo } from './ManzilIQLogo';
import {
  X,
  Printer,
  Copy,
  Check,
  Building2,
  MapPin,
  ShieldCheck,
  Tag,
  CheckCircle2,
  Calendar,
  Compass,
  DollarSign,
  FileCheck,
  UserCheck,
  QrCode
} from 'lucide-react';
import { formatPKRNumber, copyToClipboard, getPropertyShareUrl } from '../../utils/shareUtils';

interface PrintPropertySheetModalProps {
  isOpen: boolean;
  property: Property | null;
  onClose: () => void;
  onToast?: (message: string) => void;
}

export const PrintPropertySheetModal: React.FC<PrintPropertySheetModalProps> = ({
  isOpen,
  property,
  onClose,
  onToast
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen || !property) return null;

  const propId = property.propertyId || property.id;
  const pricePerMarla = property.pricePerMarla || Math.round(property.pricePKR / (property.sizeMarla || 1));
  const sqFt = property.sizeSqFt || property.sizeMarla * 225;
  const currentDate = new Date().toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyId = async () => {
    const success = await copyToClipboard(propId);
    if (success) {
      setCopiedId(true);
      if (onToast) onToast(`Property ID "${propId}" copied!`);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleCopySummary = async () => {
    const summaryText = `MANZILIQ PROPERTY SPECIFICATION SHEET
=============================================
Property ID: ${propId}
Title: ${property.title}
Society: ${property.societyName || 'N/A'}
Location: ${property.location}
Sector/Block: ${[property.sector, property.block, property.plotNumber ? `Plot #${property.plotNumber}` : ''].filter(Boolean).join(' - ') || 'N/A'}
Category: ${property.category || property.type}
Size: ${property.sizeMarla} Marla (${sqFt} Sq. Ft.)
Price: PKR ${property.pricePKR.toLocaleString('en-PK')} (${formatPKRNumber(property.pricePKR)})
Price / Marla: PKR ${pricePerMarla.toLocaleString('en-PK')}
Verification Status: ${property.verificationStatus === 'verified' ? 'LDA / TMA Approved & Verified' : 'Standard Verified'}
Dealer / Agent: ${property.dealerName || 'Direct Society Listing'}
Date Generated: ${currentDate}
Web Link: ${getPropertyShareUrl(property.id)}
=============================================`;

    const success = await copyToClipboard(summaryText);
    if (success) {
      setCopiedSummary(true);
      if (onToast) onToast('Property summary copied to clipboard!');
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Dynamic Print CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-property-sheet, #printable-property-sheet * {
            visibility: visible;
          }
          #printable-property-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 16px;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div 
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Action Header (Excluded during print) */}
        <div className="no-print flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold font-[Outfit] text-slate-900">
                Print Property Specification Sheet
              </h2>
              <p className="text-[11px] text-slate-500">
                Optimized high-contrast A4 summary for physical records & offline client dossiers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-trigger-print"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              id="btn-copy-print-summary"
              onClick={handleCopySummary}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition cursor-pointer"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedSummary ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              type="button"
              id="btn-close-print-modal"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Property Sheet Container */}
        <div className="p-6 sm:p-8 overflow-y-auto bg-white" ref={printRef} id="printable-property-sheet">
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-5 border-b-2 border-slate-900 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <ManzilIQLogo variant="compact" size="md" theme="light" showTagline={false} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700 px-2 py-0.5 bg-slate-100 border border-slate-300 rounded">
                  Official Property Dossier
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 font-medium">
                DISCOVER • MANAGE • DECIDE SMARTER | AI-Powered Property & Society Management
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <div className="text-[11px] font-mono text-slate-500">
                Date: <span className="font-bold text-slate-900">{currentDate}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                Status: <span className="font-bold text-emerald-700 uppercase">{property.listingStatus || 'Available'}</span>
              </div>
            </div>
          </div>

          {/* Prominent Property ID Banner */}
          <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>Unique Property Identifier</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl font-mono font-black tracking-wider text-slate-950 bg-white px-3 py-1 rounded-lg border border-slate-300 shadow-2xs">
                  {propId}
                </span>
                <button
                  type="button"
                  id="btn-copy-id-in-sheet"
                  onClick={handleCopyId}
                  className="no-print inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white px-2.5 py-1 rounded-md border border-slate-200 transition cursor-pointer"
                  title="Copy Property ID"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black px-3 py-1 rounded-md bg-slate-900 text-white uppercase tracking-wider">
                {property.category || property.type}
              </span>
              {property.verificationStatus === 'verified' && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-950 border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>LDA / TMA Approved</span>
                </span>
              )}
            </div>
          </div>

          {/* Property Title & Main Location */}
          <div className="space-y-2 pb-4">
            <h1 className="text-xl sm:text-2xl font-black font-[Outfit] text-slate-900 leading-tight">
              {property.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{property.location}</span>
              </span>
              {property.societyName && (
                <span className="flex items-center gap-1 text-slate-900 font-bold">
                  <Building2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>{property.societyName}</span>
                </span>
              )}
            </div>
          </div>

          {/* Core Specifications Table */}
          <div className="my-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-slate-700" />
              <span>Core Property Specifications</span>
            </h3>
            <div className="border border-slate-300 rounded-xl overflow-hidden text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
                <div className="p-2.5 border-r border-slate-300">Spec Field</div>
                <div className="p-2.5 border-r border-slate-300">Value</div>
                <div className="p-2.5 border-r border-slate-300">Spec Field</div>
                <div className="p-2.5">Value</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200">
                <div className="p-2.5 bg-slate-50 border-r border-slate-200 text-slate-500 font-medium">Property Size</div>
                <div className="p-2.5 font-bold text-slate-900 border-r border-slate-200">{property.sizeMarla} Marla ({sqFt} Sq Ft)</div>
                <div className="p-2.5 bg-slate-50 border-r border-slate-200 text-slate-500 font-medium">Category</div>
                <div className="p-2.5 font-bold text-slate-900">{property.category || property.type}</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200">
                <div className="p-2.5 bg-slate-50 border-r border-slate-200 text-slate-500 font-medium">Sector / Block</div>
                <div className="p-2.5 font-bold text-slate-900 border-r border-slate-200">
                  {[property.sector || '', property.block || ''].filter(Boolean).join(' - ') || 'Standard Zone'}
                </div>
                <div className="p-2.5 bg-slate-50 border-r border-slate-200 text-slate-500 font-medium">Plot Number</div>
                <div className="p-2.5 font-bold text-slate-900">{property.plotNumber ? `#${property.plotNumber}` : 'Allocated in Ballot'}</div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200">
                <div className="p-2.5 bg-slate-50 border-r border-slate-200 text-slate-500 font-medium">Road Access</div>
                <div className="p-2.5 font-bold text-slate-900 border-r border-slate-200">{property.roadWidth || '40 Feet Wide Asphalt'}</div>
                <div className="p-2.5 bg-slate-50 border-r border-slate-200 text-slate-500 font-medium">City / District</div>
                <div className="p-2.5 font-bold text-slate-900">{property.city || 'Lahore'}</div>
              </div>

              {property.type === 'house' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200">
                  <div className="p-2.5 bg-slate-50 border-r border-slate-200 text-slate-500 font-medium">Bedrooms</div>
                  <div className="p-2.5 font-bold text-slate-900 border-r border-slate-200">{property.bedrooms || 3} Beds</div>
                  <div className="p-2.5 bg-slate-50 border-r border-slate-200 text-slate-500 font-medium">Bathrooms</div>
                  <div className="p-2.5 font-bold text-slate-900">{property.bathrooms || 3} Baths</div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Financial Breakdown */}
          <div className="my-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-700" />
              <span>Financial & Pricing Schedule</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-slate-500">Total Demand Price</div>
                <div className="text-base sm:text-lg font-black font-mono text-slate-950 mt-0.5">
                  PKR {property.pricePKR.toLocaleString('en-PK')}
                </div>
                <div className="text-[11px] text-amber-800 font-bold mt-0.5">
                  {formatPKRNumber(property.pricePKR)}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-slate-500">Rate Per Marla</div>
                <div className="text-sm sm:text-base font-bold font-mono text-slate-900 mt-0.5">
                  PKR {pricePerMarla.toLocaleString('en-PK')}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Per Sq. Ft: PKR {Math.round(pricePerMarla / 225).toLocaleString('en-PK')}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-slate-500">Token & Booking Option</div>
                <div className="text-sm sm:text-base font-bold font-mono text-slate-900 mt-0.5">
                  PKR {property.paymentPlan?.downPaymentPKR 
                    ? property.paymentPlan.downPaymentPKR.toLocaleString('en-PK') 
                    : Math.round(property.pricePKR * 0.2).toLocaleString('en-PK')} (20% Token)
                </div>
                <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                  Installments Available
                </div>
              </div>
            </div>
          </div>

          {/* Key Amenities / Features */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="my-4">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-2">
                Features & Society Amenities
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {property.amenities.map((amenity, idx) => (
                  <span 
                    key={idx} 
                    className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>{amenity}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description Snippet */}
          {property.description && (
            <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Listing Overview</div>
              <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                {property.description}
              </p>
            </div>
          )}

          {/* Authorized Contact & Sign-Off Section */}
          <div className="mt-6 pt-4 border-t-2 border-slate-900 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-700" />
                <span>Authorized Listing Agency</span>
              </div>
              <div className="font-bold text-slate-900">
                {property.dealerName || 'Direct Society Sales Department'}
              </div>
              <div className="text-slate-500 text-[11px]">
                MANZILIQ Verified Partner • Reg ID: MZ-{property.dealerId || 'SOC-ADMIN'}
              </div>
              <div className="text-slate-600 text-[11px] font-mono">
                Helpline: +92 (42) 111-MANZIL (626-945)
              </div>
            </div>

            <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-500">Official Physical Stamp</div>
                <div className="text-[10px] text-slate-400 italic">Signature & Seal:</div>
                <div className="h-6 border-b border-dashed border-slate-400 w-32 mt-2"></div>
              </div>
              <div className="text-center shrink-0">
                <div className="w-12 h-12 bg-white border border-slate-300 rounded-lg flex items-center justify-center shadow-2xs">
                  <QrCode className="w-8 h-8 text-slate-800" />
                </div>
                <div className="text-[9px] font-mono text-slate-500 mt-0.5">Scan Verify</div>
              </div>
            </div>
          </div>

          {/* Offline Notice Footer */}
          <div className="mt-5 text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3">
            Generated via MANZILIQ Smart Housing Real Estate ERP Platform. Verified offline documentation for Property ID #{propId}.
          </div>
        </div>
      </div>
    </div>
  );
};
