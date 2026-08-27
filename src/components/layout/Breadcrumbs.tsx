import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  currentRoute?: string;
  onNavigate: (route: string) => void;
}

const ROUTE_LABELS: Record<string, { label: string; parent?: { label: string; href: string } }> = {
  '/marketplace': { label: 'Property Marketplace' },
  '/societies': { label: 'Housing Societies' },
  '/compare': { label: 'Property Comparison' },
  '/price-estimator': { label: 'AI Price Estimator' },
  '/login': { label: 'Portal Authentication' },
  '/signup': { label: 'Buyer Registration' },
  '/buyer/overview': { label: 'Buyer Dashboard' },
  '/buyer/bookings': { label: 'My Bookings & Milestones', parent: { label: 'Buyer Portal', href: '/buyer/overview' } },
  '/buyer/installments': { label: 'Installment Ledger & Pay', parent: { label: 'Buyer Portal', href: '/buyer/overview' } },
  '/buyer/wishlist': { label: 'Saved Wishlist', parent: { label: 'Buyer Portal', href: '/buyer/overview' } },
  '/buyer/documents': { label: 'Document Locker', parent: { label: 'Buyer Portal', href: '/buyer/overview' } },
  '/buyer/inquiries': { label: 'Direct Messages & Inquiries', parent: { label: 'Buyer Portal', href: '/buyer/overview' } },
  '/buyer/notifications': { label: 'Notifications Center', parent: { label: 'Buyer Portal', href: '/buyer/overview' } },
  '/dealer/overview': { label: 'Agent Dashboard' },
  '/dealer/assigned-lots': { label: 'Exclusive Assigned Lots', parent: { label: 'Dealer Portal', href: '/dealer/overview' } },
  '/dealer/pipeline': { label: 'Lead CRM Pipeline', parent: { label: 'Dealer Portal', href: '/dealer/overview' } },
  '/dealer/crm': { label: 'Lead CRM Pipeline', parent: { label: 'Dealer Portal', href: '/dealer/overview' } },
  '/dealer/commission': { label: 'Commission & Payouts', parent: { label: 'Dealer Portal', href: '/dealer/overview' } },
  '/dealer/listings': { label: 'Marketplace Listings Manager', parent: { label: 'Dealer Portal', href: '/dealer/overview' } },
  '/society/overview': { label: 'Society Admin Dashboard' },
  '/society/inventory': { label: 'Sector Plot Inventory', parent: { label: 'Society Admin', href: '/society/overview' } },
  '/society/dealers': { label: 'Dealer Lot Allocation', parent: { label: 'Society Admin', href: '/society/overview' } },
  '/society/approvals': { label: 'Booking Approvals Queue', parent: { label: 'Society Admin', href: '/society/overview' } },
  '/society/financials': { label: 'Financial Ledger & Cashflow', parent: { label: 'Society Admin', href: '/society/overview' } },
  '/admin/overview': { label: 'Super Admin Overview' },
  '/admin/verification-queue': { label: 'KYC & License Verification', parent: { label: 'Super Admin', href: '/admin/overview' } },
  '/admin/moderation': { label: 'Duplicate Listing Moderation', parent: { label: 'Super Admin', href: '/admin/overview' } },
  '/admin/disputes': { label: 'Title Disputes & Plot Freeze', parent: { label: 'Super Admin', href: '/admin/overview' } },
  '/admin/audit-logs': { label: 'Immutable Audit Logs', parent: { label: 'Super Admin', href: '/admin/overview' } }
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, currentRoute = '', onNavigate }) => {
  let displayItems: BreadcrumbItem[] = [];

  if (items && items.length > 0) {
    displayItems = items;
  } else if (currentRoute) {
    const routeConfig = ROUTE_LABELS[currentRoute];
    if (routeConfig) {
      if (routeConfig.parent) {
        displayItems.push(routeConfig.parent);
      }
      displayItems.push({ label: routeConfig.label, href: currentRoute, active: true });
    } else if (currentRoute.startsWith('/property/')) {
      displayItems = [
        { label: 'Marketplace', href: '/marketplace' },
        { label: 'Property Details', active: true }
      ];
    } else if (currentRoute.startsWith('/society/')) {
      displayItems = [
        { label: 'Societies', href: '/societies' },
        { label: 'Masterplan Map', active: true }
      ];
    } else {
      const parts = currentRoute.split('/').filter(Boolean);
      displayItems = parts.map((part, index) => {
        const path = '/' + parts.slice(0, index + 1).join('/');
        return {
          label: part.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          href: index === parts.length - 1 ? undefined : path,
          active: index === parts.length - 1
        };
      });
    }
  }

  if (displayItems.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-slate-500 py-2.5 px-4 bg-slate-50 border-b border-slate-200">
      <button 
        onClick={() => onNavigate('/')}
        className="flex items-center gap-1 hover:text-emerald-700 transition font-medium cursor-pointer"
        title="Go to Home"
      >
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span>Home</span>
      </button>

      {(displayItems || []).map((item, idx) => {
        const isLast = idx === displayItems.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            {isLast || !item.href ? (
              <span className={`font-semibold truncate max-w-[200px] sm:max-w-xs ${isLast ? 'text-slate-800' : 'text-slate-500'}`}>
                {item.label}
              </span>
            ) : (
              <button
                onClick={() => item.href && onNavigate(item.href)}
                className="hover:text-emerald-700 font-medium transition truncate max-w-[160px] cursor-pointer"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
