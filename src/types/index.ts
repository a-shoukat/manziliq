export type UserRole = 'public_buyer' | 'buyer' | 'dealer' | 'society_admin' | 'super_admin';

export type UserStatus = 'active' | 'pending' | 'pending_verification' | 'rejected' | 'suspended';

export interface User {
  id: string;
  user_id?: string; // DB compatibility alias
  name: string;
  full_name?: string; // DB compatibility alias
  email: string;
  phone: string;
  password?: string;
  role: UserRole;
  verified: boolean;
  status: UserStatus;
  cnic?: string;
  cnicDocUrl?: string;
  licenseNo?: string;
  licenseDocUrl?: string;
  nocDocUrl?: string;
  secpDocUrl?: string;
  avatar?: string;
  societyId?: string;
  societyName?: string;
  rejectionReason?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export type AuditLogCategory = 'SECURITY' | 'TRANSACTION' | 'MODERATION' | 'DISPUTE' | 'IDENTITY';

export interface AuditLogEntry {
  id: string;
  user_id?: string;
  userId?: string;
  actor: string;
  actorRole?: UserRole;
  action: string;
  category: AuditLogCategory;
  target: string;
  entityType?: 'AUTH' | 'USER' | 'PROPERTY' | 'PLOT' | 'BOOKING' | 'PAYMENT' | 'SOCIETY' | 'SECURITY' | 'DISPUTE' | 'VERIFICATION' | string;
  entityId?: string;
  ipAddress: string;
  timestamp: string;
  details: string;
  metadata?: Record<string, any>;
}

export interface Society {
  id: string;
  name: string;
  societyCode?: string; // 2-4 uppercase short code (e.g. ARG, MCH, RPC, GVE)
  societyIdCode?: string; // e.g. SOC-0001
  city: string;
  district: string;
  location: string;
  totalPlots: number;
  availablePlots: number;
  reservedPlots: number;
  soldPlots: number;
  heroImage: string;
  description: string;
  amenities: string[];
  approvalStatus: 'approved' | 'pending' | 'rejected';
  contactPhone: string;
  mapEmbedUrl?: string;
  nocNumber?: string;
  nocDocUrl?: string;
  secpDocUrl?: string;
  lateFeePercent?: number; // e.g. 2.5% per month
  downPaymentPercent?: number; // e.g. 20%
  standardDurationMonths?: number; // e.g. 36 or 48 months
}

export interface Plot {
  id: string;
  propertyId?: string; // Auto-generated unique prefix ID e.g. ARG-RPL-0001, ARG-CPL-0002
  plotCode?: string;
  societyId: string;
  societyName: string;
  societyCode?: string;
  plotNumber: string;
  sector: string;
  block: string;
  sizeMarla: number; // e.g. 3, 5, 10, 20 (1 Kanal)
  sizeUnit?: 'Marla' | 'Kanal' | 'Sq. Ft';
  sizeValue?: number;
  sizeSqFt: number;
  pricePKR: number;
  basePrice?: number;
  downPaymentPKR: number;
  monthlyInstallmentPKR: number;
  installmentMonths: number;
  status: 'available' | 'assigned' | 'reserved' | 'sold' | 'disputed';
  category: 'residential' | 'commercial' | 'plot_file';
  dimensions: string; // e.g. "25x45"
  features: string[];
  coordinates: { x: number; y: number }; // SVG grid position x,y
  geoCoordinates?: { lat: number; lng: number };
  svgZoneId?: string;
  dealerId?: string;
  dealerName?: string;
  assignedAt?: string;
  assignmentExpiry?: string;
  isLocked?: boolean;
  isDisputed?: boolean;
  disputeReason?: string;
}

export type PropertyCategory = 'Residential Plot' | 'Villa / House' | 'Commercial Plot' | 'Commercial Plaza' | string;

export interface IdCounter {
  id?: string;
  societyId: string;
  societyName?: string;
  societyCode: string;
  category: string; // 'residential_plot' | 'commercial_plot' | 'residential_property' | 'commercial_property' | 'society'
  prefix: string; // 'RPL' | 'CPL' | 'RES' | 'COM' | 'SOC'
  lastNumber: number;
  updatedAt: string;
}

export interface Property {
  id: string;
  propertyId?: string; // Auto-generated prefix ID e.g. ARG-RES-0001, RPC-RES-0002, ARG-RPL-0001
  categoryPrefix?: string; // e.g. 'RES', 'RPL', 'CPL', 'COM'
  title: string;
  type: 'plot' | 'house' | 'commercial' | 'apartment';
  pricePKR: number;
  sizeMarla: number;
  sizeSqFt?: number;
  sizeValue?: number;
  sizeUnit?: 'Marla' | 'Kanal' | 'Sq. Ft';
  pricePerMarla?: number;
  sector?: string;
  block?: string;
  plotNumber?: string;
  roadWidth?: string;
  category?: PropertyCategory;
  bedrooms?: number;
  bathrooms?: number;
  location: string;
  city: string;
  societyId: string;
  societyName: string;
  dealerId?: string;
  dealerName?: string;
  assignedDealerId?: string;
  images: string[];
  description: string;
  amenities: string[];
  featured: boolean;
  status: 'approved' | 'pending' | 'rejected';
  verificationStatus?: 'verified' | 'pending' | 'rejected';
  listingStatus?: 'available' | 'reserved' | 'sold' | 'disputed';
  geoCoordinates?: { lat: number; lng: number };
  coordinates?: { x: number; y: number } | { lat: number; lng: number };
  svgZoneId?: string;
  paymentPlan?: {
    installmentsAvailable: boolean;
    downPaymentPercent: number;
    downPaymentPKR: number;
    installmentMonths: number;
    monthlyAmountPKR: number;
  };
  createdAt: string;
  isDuplicateFlagged?: boolean;
  duplicateMatchedId?: string;
  audio_url?: string;
  voiceTranscript?: string;
}

export type BookingPipelineStage = 1 | 2 | 3 | 4 | 5 | 6;

export interface BookingTimelineItem {
  stage: BookingPipelineStage;
  label: string;
  timestamp?: string;
  note?: string;
  completed: boolean;
}

export type InstallmentPlanType = 'lump_sum' | '1_year' | '3_year' | '5_year' | 'custom';

export interface Booking {
  id: string;
  bookingReference?: string; // PROP-2026-XXXXXX format
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  buyerCnic?: string;
  plotId: string;
  plotNumber: string;
  sector: string;
  societyId: string;
  societyName: string;
  totalPricePKR: number;
  downPaymentPKR: number;
  tokenAdvancePKR?: number;
  monthlyInstallmentPKR: number;
  totalInstallments: number;
  installmentPlanType?: InstallmentPlanType;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  pipelineStage: BookingPipelineStage; // 1: Inquiry, 2: Site Visit, 3: Token, 4: Agreement, 5: Payment/Installment Active, 6: Transfer Submitted
  timeline: BookingTimelineItem[];
  bookingDate: string;
  dealerId?: string;
  dealerName?: string;
  allotmentLetterNumber?: string;
  transferDeedNumber?: string;
  possessionDate?: string;
  transferRequestDate?: string;
  transferApprovedDate?: string;
  cancellationReason?: string;
  cancellationPenaltyPKR?: number;
  isAutoLocked?: boolean;
  lockedAt?: string;
  lockedByUserId?: string;
  notes?: string;
}

export type PaymentMethod = 'JazzCash' | 'EasyPaisa' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'Card';
export type PaymentStatus = 'completed' | 'pending' | 'verified' | 'failed' | 'refunded';
export type PaymentType = 'token' | 'down_payment' | 'installment' | 'lump_sum' | 'transfer_fee';

export interface Payment {
  id: string;
  bookingId: string;
  bookingReference?: string;
  installmentId?: string;
  amountPKR: number;
  paymentType: PaymentType;
  method: PaymentMethod | string;
  status: PaymentStatus;
  transactionRef: string;
  paidAt: string;
  verifiedBy?: string;
  receiptNumber: string;
  receiptUrl?: string;
  buyerName?: string;
  plotNumber?: string;
  societyName?: string;
  notes?: string;
}

export interface Installment {
  id: string;
  bookingId: string;
  bookingReference?: string;
  installmentNumber: number;
  dueDate: string;
  amountPKR: number;
  lateFeePKR?: number;
  daysOverdue?: number;
  status: 'paid' | 'due' | 'overdue';
  paidDate?: string;
  paidAt?: string;
  paymentMethod?: PaymentMethod | string;
  transactionId?: string;
  challanNumber?: string;
  plotNumber?: string;
  societyName?: string;
  receiptNumber?: string;
  reminderSentAt?: string;
  reminderChannel?: 'sms' | 'email' | 'push' | 'all';
}

export interface LotAssignment {
  id: string;
  lotNumber: string;
  societyId: string;
  societyName: string;
  block: string;
  dealerId: string;
  dealerName: string;
  dealerLicense?: string;
  dealerCnic?: string;
  dealerPhone?: string;
  plotIds: string[];
  plotNumbers: string[];
  assignedDate: string;
  expiryDate: string;
  status: 'active' | 'expiring' | 'expired' | 'released' | 'revoked';
  commissionPercent: number;
  assignedBy: string;
  renewalTerms?: string;
  notes?: string;
}

export interface DealerSocietyRelation {
  id: string;
  dealerId: string;
  dealerName: string;
  dealerCnic: string;
  dealerLicense: string;
  dealerEmail: string;
  dealerPhone: string;
  societyId: string;
  societyName: string;
  status: 'pending' | 'approved' | 'rejected';
  commissionPercent: number;
  appliedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface DealerLotRequest {
  id: string;
  dealerId: string;
  dealerName: string;
  societyId: string;
  societyName: string;
  type: 'additional_lot' | 'release_lot';
  requestedBlock: string;
  plotCount: number;
  plotIds?: string[];
  plotNumbers?: string[];
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewNote?: string;
}

export interface LotAuditTrailEntry {
  id: string;
  assignmentId?: string;
  lotId?: string;
  lotNumber?: string;
  plotId: string;
  plotNumber: string;
  block: string;
  societyId: string;
  societyName?: string;
  dealerId: string;
  dealerName: string;
  assignedBy: string;
  assignedDate?: string;
  expiryDate?: string;
  releasedDate?: string;
  previousStatus: string;
  newStatus: string;
  action: 'ASSIGNED' | 'RESERVED' | 'SOLD' | 'RELEASED' | 'EXPIRED' | 'RENEWED' | 'REVOKED' | 'DISPUTED';
  timestamp: string;
  notes?: string;
}

export interface DealerLead {
  id: string;
  dealerId: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  propertyInterested: string;
  budgetPKR: number;
  status: 'inquiry' | 'site_visit' | 'token' | 'agreement' | 'payment' | 'transfer';
  notes: string;
  lastActivity: string;
  plotId?: string;
  tokenAmountPKR?: number;
}

export interface InquiryMessage {
  id: string;
  sender: 'buyer' | 'dealer' | 'society';
  senderName: string;
  text: string;
  time: string;
}

export interface Inquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  societyName: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  buyerId?: string;
  assignedDealerId?: string;
  assignedDealerName?: string;
  message: string;
  date: string;
  status: 'new' | 'in_discussion' | 'visit_scheduled' | 'converted' | 'closed';
  scheduledVisitDate?: string;
  responseTimeMinutes?: number;
  messages: InquiryMessage[];
}

export * from './notifications';

export interface DocumentItem {
  id: string;
  title: string;
  type?: 'allotment_letter' | 'booking_agreement' | 'transfer_deed' | 'token_receipt' | 'noc_certificate' | 'cancellation_letter' | 'payment_receipt';
  category?: 'noc' | 'allotment' | 'payment_receipt' | 'cnic' | 'title_deed' | 'agreement' | 'cancellation';
  bookingId?: string;
  bookingReference?: string;
  buyerId?: string;
  buyerName?: string;
  buyerCnic?: string;
  plotDetails?: string;
  plotNumber?: string;
  sector?: string;
  societyName?: string;
  issueDate?: string;
  expiryDate?: string;
  version?: string; // e.g. 'v1.0', 'v1.1'
  status?: 'active' | 'superseded' | 'expired';
  uploadedAt?: string;
  fileUrl?: string;
  downloadCount?: number;
  verifiedStamp?: boolean;
  verified?: boolean;
  fileSize?: string;
  verificationCode?: string;
  tamperProofHash?: string;
  dealerName?: string;
  signatories?: {
    role: string;
    name: string;
    signedAt: string;
    status: 'signed' | 'pending';
  }[];
}

export interface DocTemplate {
  id: string;
  title: string;
  type: DocumentItem['type'];
  version: string;
  lastUpdated: string;
  templateBody: string;
  availableVariables: string[];
  updatedBy: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  phone: string;
  role: UserRole;
  societyName?: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  cnicNumber?: string;
  cnicDocName?: string;
  licenseDocName?: string;
  nocDocName?: string;
  secpDocName?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}

export interface Dispute {
  id: string;
  plotId: string;
  plotNumber: string;
  societyId: string;
  societyName: string;
  complainantName: string;
  complainantRole: UserRole;
  respondentName: string;
  respondentRole: UserRole;
  type: 'double_booking' | 'title_conflict' | 'payment_fraud' | 'boundary_dispute' | 'unauthorized_dealer';
  status: 'frozen' | 'under_mediation' | 'escalated' | 'resolved' | 'blacklisted';
  createdAt: string;
  description: string;
  notes: { author: string; date: string; text: string }[];
  resolution?: string;
}

export interface DealerPerformance {
  dealerId: string;
  dealerName: string;
  totalLeads: number;
  convertedDeals: number;
  conversionRate: number; // %
  inquiryResponseRate: number; // %
  avgResponseTimeHours: number;
  avgDealDurationDays: number;
  commissionEarnedPKR: number;
  activeLotsCount: number;
}

export interface PricePredictionInput {
  propertyType: 'residential_plot' | 'commercial_plot' | 'constructed_house' | 'plot_file';
  areaMarla: number;
  bedrooms: number;
  bathrooms: number;
  societyName: string;
  locationCategory: 'prime_main_road' | 'corner_plot' | 'park_facing' | 'standard';
  amenities: string[];
}

export interface PricePredictionResult {
  estimatedPricePKR: number;
  minPricePKR: number;
  maxPricePKR: number;
  confidenceScore: number; // percentage
  avgMarlaRatePKR: number;
  influencingFactors: { factor: string; impact: 'positive' | 'negative' | 'neutral'; percentage: string }[];
  marketDemand: 'High' | 'Very High' | 'Moderate';
}

export interface SvgZone {
  id: string;
  society_id: string;
  zone_id: string;
  plot_id: string;
  svg_path: string;
  plot_number?: string;
  block?: string;
  sector?: string;
  label?: string;
  coordinates?: { x: number; y: number; width?: number; height?: number };
}

export interface SavedComparison {
  id: string;
  userId: string;
  title: string;
  savedAt: string;
  plotIds: string[];
  propertyIds?: string[];
  plotsCount: number;
  notes?: string;
}

