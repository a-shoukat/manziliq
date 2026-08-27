import React, { useState } from 'react';
import { Property } from '../../types';
import {
  X,
  Share2,
  Copy,
  Check,
  Building2,
  MapPin,
  MessageCircle,
  Mail,
  Send,
  ExternalLink,
  ShieldCheck,
  QrCode,
  Sparkles,
  Smartphone
} from 'lucide-react';
import {
  getPropertyShareUrl,
  getPropertyShareText,
  formatPKRNumber,
  copyToClipboard,
  getWhatsAppShareUrl,
  getFacebookShareUrl,
  getTwitterShareUrl,
  getLinkedInShareUrl,
  getTelegramShareUrl,
  getEmailShareUrl,
  canUseNativeShare,
  triggerNativeShare
} from '../../utils/shareUtils';

interface SharePropertyModalProps {
  isOpen: boolean;
  property: Property | null;
  onClose: () => void;
  onToast?: (message: string) => void;
}

export const SharePropertyModal: React.FC<SharePropertyModalProps> = ({
  isOpen,
  property,
  onClose,
  onToast
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen || !property) return null;

  const shareUrl = getPropertyShareUrl(property.id);
  const formattedText = getPropertyShareText(property);
  const imageSrc = (property.images && property.images.length > 0)
    ? property.images[0]
    : 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000';

  const handleCopyLink = async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopiedLink(true);
      if (onToast) onToast('Link Copied! Shareable URL is ready to paste.');
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopySummary = async () => {
    const success = await copyToClipboard(formattedText);
    if (success) {
      setCopiedSummary(true);
      if (onToast) onToast('Property summary copied! Ready to paste in WhatsApp.');
      setTimeout(() => setCopiedSummary(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    const success = await triggerNativeShare(property);
    if (success) {
      onClose();
    }
  };

  const handleSocialClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 font-[Outfit] leading-tight">
                Share Verified Property
              </h2>
              <p className="text-xs text-slate-500">
                Share directly to WhatsApp, social platforms, or copy link
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Property Card Snapshot */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
            <img
              src={imageSrc}
              alt={property.title}
              className="w-18 h-18 rounded-xl object-cover shrink-0 border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-900 text-white uppercase">
                  {property.type}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 font-mono">
                  {property.sizeMarla} Marla
                </span>
                {property.verificationStatus === 'verified' && (
                  <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate font-[Outfit]">
                {property.title}
              </h3>
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{property.societyName || property.location}</span>
                </p>
                <div className="text-xs font-black font-mono text-emerald-900 shrink-0">
                  PKR {formatPKRNumber(property.pricePKR)}
                </div>
              </div>
            </div>
          </div>

          {/* Direct Copy Link Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Direct Shareable Link
              </label>
              {copiedLink && (
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 animate-in fade-in">
                  <Check className="w-3.5 h-3.5" />
                  <span>Link Copied!</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 font-mono truncate select-all">
                {shareUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95 ${
                  copiedLink
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* WhatsApp Primary Feature Section */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-emerald-950">WhatsApp Sharing</div>
                  <div className="text-[10px] text-emerald-800">Pre-formatted with Pakistani real estate specs</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleSocialClick(getWhatsAppShareUrl(property))}
                className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
              >
                <span>Open WhatsApp</span>
                <ExternalLink className="w-3 h-3 text-emerald-300" />
              </button>
            </div>

            <div className="bg-white/90 rounded-xl p-2.5 border border-emerald-200/60 text-[11px] text-slate-700 font-mono space-y-1 relative">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Message Preview</div>
              <p className="line-clamp-3 text-slate-600 whitespace-pre-line leading-relaxed">
                {formattedText}
              </p>
              <button
                type="button"
                onClick={handleCopySummary}
                className="mt-1.5 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
              >
                {copiedSummary ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Summary Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Full Formatted Text</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Platforms Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              Share to Social Platforms & Apps
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Facebook */}
              <button
                type="button"
                onClick={() => handleSocialClick(getFacebookShareUrl(property))}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-300 text-slate-700 hover:text-blue-700 transition cursor-pointer text-xs font-bold"
              >
                <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-[11px] font-black">
                  f
                </div>
                <span>Facebook</span>
              </button>

              {/* Twitter / X */}
              <button
                type="button"
                onClick={() => handleSocialClick(getTwitterShareUrl(property))}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 hover:border-slate-400 text-slate-700 hover:text-slate-950 transition cursor-pointer text-xs font-bold"
              >
                <div className="w-5 h-5 rounded-md bg-black text-white flex items-center justify-center text-[10px] font-black">
                  𝕏
                </div>
                <span>Twitter / X</span>
              </button>

              {/* LinkedIn */}
              <button
                type="button"
                onClick={() => handleSocialClick(getLinkedInShareUrl(property))}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-blue-50/50 hover:border-blue-300 text-slate-700 hover:text-blue-800 transition cursor-pointer text-xs font-bold"
              >
                <div className="w-5 h-5 rounded-md bg-blue-700 text-white flex items-center justify-center text-[10px] font-black">
                  in
                </div>
                <span>LinkedIn</span>
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={() => handleSocialClick(getTelegramShareUrl(property))}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-sky-50/50 hover:border-sky-300 text-slate-700 hover:text-sky-700 transition cursor-pointer text-xs font-bold"
              >
                <Send className="w-4 h-4 text-sky-500" />
                <span>Telegram</span>
              </button>

              {/* Email */}
              <button
                type="button"
                onClick={() => handleSocialClick(getEmailShareUrl(property))}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-amber-50/50 hover:border-amber-300 text-slate-700 hover:text-amber-800 transition cursor-pointer text-xs font-bold"
              >
                <Mail className="w-4 h-4 text-amber-600" />
                <span>Email</span>
              </button>

              {/* QR Code Toggle */}
              <button
                type="button"
                onClick={() => setShowQR(!showQR)}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border transition cursor-pointer text-xs font-bold ${
                  showQR 
                    ? 'bg-purple-50 border-purple-300 text-purple-900' 
                    : 'border-slate-200 bg-white hover:bg-purple-50/40 text-slate-700'
                }`}
              >
                <QrCode className="w-4 h-4 text-purple-600" />
                <span>{showQR ? 'Hide QR' : 'QR Code'}</span>
              </button>

              {/* Native Mobile Share if supported */}
              {canUseNativeShare() && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 transition cursor-pointer text-xs font-bold"
                >
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  <span>More Device Apps...</span>
                </button>
              )}
            </div>
          </div>

          {/* Optional QR Code View */}
          {showQR && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 animate-in fade-in duration-150">
              <div className="text-xs font-bold text-slate-800">Scan with Phone Camera</div>
              <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center">
                {/* SVG Visual QR Mockup */}
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900" fill="currentColor">
                  {/* Outer corner squares */}
                  <rect x="5" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="13" y="13" width="12" height="12" rx="2" />
                  <rect x="67" y="5" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="75" y="13" width="12" height="12" rx="2" />
                  <rect x="5" y="67" width="28" height="28" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
                  <rect x="13" y="75" width="12" height="12" rx="2" />
                  {/* Center & Grid modules */}
                  <rect x="42" y="10" width="6" height="12" />
                  <rect x="52" y="15" width="8" height="6" />
                  <rect x="10" y="42" width="12" height="6" />
                  <rect x="15" y="52" width="6" height="8" />
                  <rect x="42" y="42" width="16" height="16" rx="2" fill="#047857" />
                  <rect x="45" y="45" width="10" height="10" fill="#ffffff" />
                  <rect x="47" y="47" width="6" height="6" fill="#047857" />
                  <rect x="68" y="42" width="8" height="6" />
                  <rect x="80" y="45" width="10" height="8" />
                  <rect x="42" y="68" width="6" height="10" />
                  <rect x="45" y="82" width="12" height="6" />
                  <rect x="68" y="68" width="10" height="8" />
                  <rect x="82" y="78" width="8" height="12" />
                </svg>
              </div>
              <div className="text-[11px] text-slate-500 font-mono truncate max-w-xs mx-auto">
                {shareUrl}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Includes NADRA/LDA verification tag</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
