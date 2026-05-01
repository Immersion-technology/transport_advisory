export type Gender = 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  othernames?: string;
  gender?: Gender;
  address?: string;
  role: 'USER' | 'ADMIN';
  permissions?: string[];
  isSuperAdmin?: boolean;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export interface VehicleCategory {
  id: string;
  key: string;
  label: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface DocumentPricing {
  id: string;
  categoryId: string;
  documentType: DocumentType;
  basePrice: number;
  notes?: string;
  isActive: boolean;
  category?: VehicleCategory;
}

export interface PricingQuote {
  basePrice: number;
  serviceFee: number;
  serviceFeeRate: number;
  total: number;
  notes?: string;
  categoryId: string;
  documentType: DocumentType;
}

export interface Vehicle {
  id: string;
  userId: string;
  plateNumber: string;
  make?: string;
  model?: string;
  year?: number;
  stateOfRegistration?: string;
  colour?: string;
  chassisNumber?: string;
  engineNumber?: string;
  registrationNumber?: string;
  rwcNumber?: string;
  chassisPhotoUrl?: string;
  licensePhotoUrl?: string;
  categoryId?: string;
  category?: VehicleCategory;
  isVerified: boolean;
  verifiedAt?: string;
  isActive: boolean;
  createdAt: string;
  documents: Document[];
}

export type DocumentType =
  | 'MOTOR_INSURANCE'
  | 'VEHICLE_LICENSE'
  | 'ROADWORTHINESS'
  | 'HACKNEY_PERMIT'
  | 'CHANGE_OF_OWNERSHIP';

export interface Document {
  id: string;
  vehicleId: string;
  type: DocumentType;
  expiryDate: string;
  isAutoPopulated: boolean;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 'PENDING' | 'PROCESSING' | 'SUBMITTED' | 'READY' | 'DELIVERED' | 'CANCELLED';

export type ApplicationKind = 'RENEWAL' | 'FRESH';

export interface Application {
  id: string;
  userId: string;
  vehicleId: string;
  documentType: DocumentType;
  kind: ApplicationKind;
  status: ApplicationStatus;
  governmentFee: number;
  serviceFee: number;
  totalAmount: number;
  paystackRef?: string;
  isPaid: boolean;
  paidAt?: string;
  completedFileUrl?: string;
  completedAt?: string;
  createdAt: string;
  vehicle?: { plateNumber: string; make?: string; model?: string; isVerified?: boolean };
  delivery?: Delivery;
  documents?: ApplicationDocument[];
  statusHistory?: StatusHistory[];
}

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface StatusHistory {
  id: string;
  applicationId: string;
  status: ApplicationStatus;
  notes?: string;
  changedAt: string;
}

export type DeliveryTier = 'STANDARD' | 'EXPRESS' | 'SAME_DAY';
export type DeliveryStatus = 'PENDING' | 'DISPATCHED' | 'DELIVERED';

export interface Delivery {
  id: string;
  applicationId: string;
  tier: DeliveryTier;
  status: DeliveryStatus;
  address: string;
  city: string;
  state: string;
  recipientName: string;
  recipientPhone: string;
  fee: number;
  trackingCode?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
}

export interface VehicleVerification {
  id: string;
  plateNumber: string;
  reportData: VerificationReport;
  isPaid: boolean;
  createdAt: string;
}

export interface VerificationReport {
  plateNumber: string;
  insurance?: {
    status: string;
    insurer?: string;
    policyNumber?: string;
    expiryDate?: string;
    coverType?: string;
  };
  summary?: string;
  generatedAt?: string;
}

export interface AdminStats {
  totalUsers: number;
  totalVehicles: number;
  pendingApplications: number;
  totalApplications: number;
  activeDeliveries: number;
  totalRevenue: number;
  unconfirmedReminders: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
