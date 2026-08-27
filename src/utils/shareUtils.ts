import { Property } from '../types';

export const formatPKRNumber = (amount: number): string => {
  if (amount >= 10000000) {
    const crore = amount / 10000000;
    return `${crore % 1 === 0 ? crore.toFixed(0) : crore.toFixed(2)} Crore`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `${lakh % 1 === 0 ? lakh.toFixed(0) : lakh.toFixed(1)} Lacs`;
  }
  return amount.toLocaleString('en-PK');
};

/**
 * Returns the fully qualified shareable URL for a given property.
 */
export const getPropertyShareUrl = (propertyId: string): string => {
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    return `${origin}/property/${propertyId}`;
  }
  return `https://manziliq.pk/property/${propertyId}`;
};

/**
 * Pre-formatted text optimized for WhatsApp, SMS, and Real Estate groups in Pakistan.
 */
export const getPropertyShareText = (property: Property): string => {
  const url = getPropertyShareUrl(property.id);
  const size = `${property.sizeMarla} Marla (${property.sizeMarla * 225} Sq Ft)`;
  const society = property.societyName ? `\n📍 Society: ${property.societyName}` : '';
  const location = `📍 Location: ${property.location}`;
  const price = `💰 Price: PKR ${property.pricePKR.toLocaleString('en-PK')} (${formatPKRNumber(property.pricePKR)})`;
  const plotInfo = (property.sector || property.block || property.plotNumber) 
    ? `\n📌 Details: ${[property.sector, property.block, property.plotNumber ? `Plot #${property.plotNumber}` : ''].filter(Boolean).join(' • ')}`
    : '';
  const verification = property.verificationStatus === 'verified' 
    ? '\n🛡️ Verification: Official LDA/TMA Verified Listing' 
    : '';

  return `🏡 *${property.title}*${society}
${location}
📐 Size: ${size}
${price}${plotInfo}${verification}

🔗 View Complete Verified Dossier & Photos:
${url}

_Powered by MANZILIQ - Pakistan's Verified Real Estate Platform_`;
};

/**
 * Robust copy to clipboard utility with fallback for non-secure or iframe contexts.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback if clipboard API is blocked in iframe
    }
  }

  // Fallback using textarea execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
};

/**
 * Social Sharing Links
 */
export const getWhatsAppShareUrl = (property: Property): string => {
  const text = getPropertyShareText(property);
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
};

export const getFacebookShareUrl = (property: Property): string => {
  const url = getPropertyShareUrl(property.id);
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
};

export const getTwitterShareUrl = (property: Property): string => {
  const url = getPropertyShareUrl(property.id);
  const text = `Check out this verified property listing on MANZILIQ: ${property.title} (PKR ${formatPKRNumber(property.pricePKR)})`;
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=RealEstate,Pakistan,MANZILIQ`;
};

export const getLinkedInShareUrl = (property: Property): string => {
  const url = getPropertyShareUrl(property.id);
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
};

export const getTelegramShareUrl = (property: Property): string => {
  const url = getPropertyShareUrl(property.id);
  const text = `🏡 ${property.title}\nPKR ${formatPKRNumber(property.pricePKR)}\n📍 ${property.location}`;
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
};

export const getEmailShareUrl = (property: Property): string => {
  const subject = `Verified Property: ${property.title} on MANZILIQ`;
  const body = `Hi,\n\nI wanted to share this verified property listing with you:\n\n${property.title}\nPrice: PKR ${property.pricePKR.toLocaleString('en-PK')} (${formatPKRNumber(property.pricePKR)})\nLocation: ${property.location} ${property.societyName ? `(${property.societyName})` : ''}\nSize: ${property.sizeMarla} Marla\n\nView details & documents:\n${getPropertyShareUrl(property.id)}\n\nBest regards`;
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

/**
 * Check if Web Share API is available
 */
export const canUseNativeShare = (): boolean => {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
};

/**
 * Trigger native OS share sheet if available
 */
export const triggerNativeShare = async (property: Property): Promise<boolean> => {
  if (!canUseNativeShare()) return false;
  try {
    await navigator.share({
      title: property.title,
      text: `${property.title} - PKR ${formatPKRNumber(property.pricePKR)} on MANZILIQ`,
      url: getPropertyShareUrl(property.id),
    });
    return true;
  } catch (err) {
    // User cancelled or share failed
    if ((err as Error)?.name !== 'AbortError') {
      console.warn('Native share error:', err);
    }
    return false;
  }
};
