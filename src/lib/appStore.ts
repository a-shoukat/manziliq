import { 
  User, 
  Society, 
  Plot, 
  Property, 
  Booking, 
  Installment, 
  Payment,
  DealerLead, 
  NotificationItem, 
  Inquiry, 
  DocumentItem, 
  VerificationRequest,
  Dispute,
  LotAssignment,
  DealerSocietyRelation,
  DealerLotRequest,
  LotAuditTrailEntry,
  AuditLogEntry,
  SvgZone,
  SavedComparison
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_SOCIETIES, 
  INITIAL_PLOTS, 
  INITIAL_PROPERTIES, 
  INITIAL_BOOKINGS, 
  INITIAL_INSTALLMENTS, 
  INITIAL_PAYMENTS,
  INITIAL_NOTIFICATIONS, 
  INITIAL_DOCUMENTS,
  INITIAL_LEADS,
  INITIAL_INQUIRIES,
  INITIAL_VERIFICATION_REQUESTS,
  INITIAL_DISPUTES,
  INITIAL_DEALER_RELATIONS,
  INITIAL_LOT_ASSIGNMENTS,
  INITIAL_DEALER_LOT_REQUESTS,
  INITIAL_LOT_AUDIT_TRAIL,
  INITIAL_AUDIT_LOGS,
  INITIAL_SVG_ZONES,
  INITIAL_SAVED_COMPARISONS
} from '../data/mockData';

export const STORAGE_KEY = 'manziliq_saas_v2_store';

export interface AppStoreData {
  users: User[];
  currentUser: User;
  societies: Society[];
  plots: Plot[];
  properties: Property[];
  bookings: Booking[];
  installments: Installment[];
  payments: Payment[];
  notifications: NotificationItem[];
  documents: DocumentItem[];
  dealerLeads: DealerLead[];
  inquiries: Inquiry[];
  verificationRequests: VerificationRequest[];
  disputes: Dispute[];
  dealerRelations: DealerSocietyRelation[];
  lotAssignments: LotAssignment[];
  dealerLotRequests: DealerLotRequest[];
  lotAuditTrail: LotAuditTrailEntry[];
  auditLogs: AuditLogEntry[];
  wishlist: Property[];
  compareList: Property[];
  svgZones: SvgZone[];
  savedComparisons: SavedComparison[];
}

export function getDefaultStoreData(): AppStoreData {
  return {
    users: INITIAL_USERS,
    currentUser: INITIAL_USERS[1], // Muhammad Farooq (Buyer) as initial active user
    societies: INITIAL_SOCIETIES,
    plots: INITIAL_PLOTS,
    properties: INITIAL_PROPERTIES,
    bookings: INITIAL_BOOKINGS,
    installments: INITIAL_INSTALLMENTS,
    payments: INITIAL_PAYMENTS || [],
    notifications: INITIAL_NOTIFICATIONS,
    documents: INITIAL_DOCUMENTS,
    dealerLeads: INITIAL_LEADS || [],
    inquiries: INITIAL_INQUIRIES || [],
    verificationRequests: INITIAL_VERIFICATION_REQUESTS || [],
    disputes: INITIAL_DISPUTES || [],
    dealerRelations: INITIAL_DEALER_RELATIONS || [],
    lotAssignments: INITIAL_LOT_ASSIGNMENTS || [],
    dealerLotRequests: INITIAL_DEALER_LOT_REQUESTS || [],
    lotAuditTrail: INITIAL_LOT_AUDIT_TRAIL || [],
    auditLogs: INITIAL_AUDIT_LOGS || [],
    wishlist: [INITIAL_PROPERTIES[0]],
    compareList: [INITIAL_PROPERTIES[0], INITIAL_PROPERTIES[1]],
    svgZones: INITIAL_SVG_ZONES || [],
    savedComparisons: INITIAL_SAVED_COMPARISONS || []
  };
}

export function loadStoredData(): AppStoreData {
  if (typeof window === 'undefined') return getDefaultStoreData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultStoreData();
    const parsed = JSON.parse(raw);
    return {
      ...getDefaultStoreData(),
      ...parsed
    };
  } catch (err) {
    console.error('Error loading stored state:', err);
    return getDefaultStoreData();
  }
}

export function saveStoredData(data: Partial<AppStoreData>) {
  if (typeof window === 'undefined') return;
  try {
    const current = loadStoredData();
    const merged = { ...current, ...data };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (err) {
    console.error('Error saving state:', err);
  }
}

export function resetStoredData(): AppStoreData {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
  return getDefaultStoreData();
}

export const appStore = {
  load: loadStoredData,
  save: saveStoredData,
  reset: resetStoredData,
  getAuditLogs: (): AuditLogEntry[] => {
    return loadStoredData().auditLogs;
  },
  addAuditLog: (entry: AuditLogEntry) => {
    const data = loadStoredData();
    const updated = [entry, ...(data.auditLogs || [])];
    saveStoredData({ auditLogs: updated });
  },
  getSavedComparisons: (userId?: string): SavedComparison[] => {
    const comps = loadStoredData().savedComparisons || [];
    if (!userId) return comps;
    return comps.filter(c => c.userId === userId);
  },
  saveComparison: (comp: SavedComparison) => {
    const data = loadStoredData();
    const existing = data.savedComparisons || [];
    const updated = [comp, ...existing.filter(c => c.id !== comp.id)];
    saveStoredData({ savedComparisons: updated });
    return updated;
  },
  deleteComparison: (id: string) => {
    const data = loadStoredData();
    const updated = (data.savedComparisons || []).filter(c => c.id !== id);
    saveStoredData({ savedComparisons: updated });
    return updated;
  }
};


