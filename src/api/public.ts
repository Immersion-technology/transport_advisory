import api from './client';
import { ApiResponse, VehicleCategory, DocumentPricing, DocumentType } from '../types';

export interface PricingMatrix {
  categories: Array<VehicleCategory & { pricing: DocumentPricing[] }>;
  serviceFeeRate: number;
}

export interface PricingQuoteResult {
  basePrice: number;
  serviceFee: number;
  total: number;
  notes?: string;
}

export const getPublicPricing = () =>
  api.get<ApiResponse<PricingMatrix>>('/public/pricing');

/** Compute a quote client-side from a fetched pricing matrix. */
export function computeQuote(
  matrix: PricingMatrix,
  categoryId: string,
  documentType: DocumentType,
): PricingQuoteResult | null {
  const cat = matrix.categories.find((c) => c.id === categoryId);
  if (!cat) return null;
  const row = cat.pricing.find((p) => p.documentType === documentType && p.isActive);
  if (!row) return null;
  const basePrice = row.basePrice;
  const serviceFee = Math.round(basePrice * matrix.serviceFeeRate);
  return { basePrice, serviceFee, total: basePrice + serviceFee, notes: row.notes };
}

export type UploadKind = 'chassis' | 'license';

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadPhoto = async (file: File, kind: UploadKind): Promise<UploadResult> => {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<ApiResponse<UploadResult>>(`/public/upload?kind=${kind}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.data!;
};
