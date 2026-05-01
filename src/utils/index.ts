import { differenceInDays, format, parseISO } from 'date-fns';
import type { DocumentType } from '../types';

export const formatDate = (date: string) => format(parseISO(date), 'dd MMM yyyy');

export const daysUntilExpiry = (expiryDate: string): number =>
  differenceInDays(parseISO(expiryDate), new Date());

export const getDocumentStatus = (expiryDate: string): 'valid' | 'expiring_soon' | 'critical' | 'expired' => {
  const days = daysUntilExpiry(expiryDate);
  if (days < 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 30) return 'expiring_soon';
  return 'valid';
};

export const getStatusColor = (status: ReturnType<typeof getDocumentStatus>) => {
  const map = {
    valid: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    expiring_soon: 'text-amber-700 bg-amber-50 border-amber-200',
    critical: 'text-orange-700 bg-orange-50 border-orange-200',
    expired: 'text-red-700 bg-red-50 border-red-200',
  };
  return map[status];
};

export const getStatusLabel = (status: ReturnType<typeof getDocumentStatus>) => {
  const map = {
    valid: 'Valid',
    expiring_soon: 'Expiring Soon',
    critical: 'Critical',
    expired: 'Expired',
  };
  return map[status];
};

export const docTypeLabel = (type: DocumentType): string => {
  const map: Record<DocumentType, string> = {
    MOTOR_INSURANCE: 'Motor Insurance',
    VEHICLE_LICENSE: 'Vehicle License',
    ROADWORTHINESS: 'Roadworthiness Certificate',
    HACKNEY_PERMIT: 'Hackney Permit',
    CHANGE_OF_OWNERSHIP: 'Change of Ownership',
  };
  return map[type];
};

export const applicationStatusColor = (status: string) => {
  const map: Record<string, string> = {
    PENDING: 'text-gray-700 bg-gray-100',
    PROCESSING: 'text-blue-700 bg-blue-50',
    SUBMITTED: 'text-purple-700 bg-purple-50',
    READY: 'text-emerald-700 bg-emerald-50',
    DELIVERED: 'text-teal-700 bg-teal-50',
    CANCELLED: 'text-red-700 bg-red-50',
  };
  return map[status] || 'text-gray-700 bg-gray-100';
};

export const formatNaira = (amount: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];
