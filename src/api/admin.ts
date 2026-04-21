import api from './client';
import { AdminStats, Application, User, ApiResponse } from '../types';

export const getAdminStats = () =>
  api.get<ApiResponse<AdminStats>>('/admin/stats');

export const getAdminApplications = (params?: { status?: string; page?: number; limit?: number }) =>
  api.get<ApiResponse<Application[]>>('/admin/applications', { params });

export const updateApplicationStatus = (id: string, data: { status: string; notes?: string }) =>
  api.put<ApiResponse<Application>>(`/admin/applications/${id}/status`, data);

export const uploadCompletedDoc = (id: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post<ApiResponse>(`/admin/applications/${id}/document`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getUnconfirmedReminders = () =>
  api.get<ApiResponse>('/admin/reminders/unconfirmed');

export const getAdminUsers = (params?: { page?: number; limit?: number }) =>
  api.get<ApiResponse<User[]>>('/admin/users', { params });

export const getAdminApplication = (id: string) =>
  api.get<ApiResponse<Application>>(`/admin/applications/${id}`);

export const getAdminDeliveries = (params?: { status?: string }) =>
  api.get<ApiResponse>('/admin/deliveries', { params });

export const updateDeliveryStatus = (id: string, data: { status: string; trackingCode?: string }) =>
  api.put<ApiResponse>(`/admin/deliveries/${id}/status`, data);

// Admin staff management (super admin only)
export interface AdminStaff {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  permissions: string[];
  isSuperAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

export const getAllAdmins = () =>
  api.get<ApiResponse<AdminStaff[]>>('/admin/staff');

export const createAdmin = (data: {
  email: string; phone: string; firstName: string; lastName: string;
  password: string; permissions: string[];
}) => api.post<ApiResponse<AdminStaff>>('/admin/staff', data);

export const updateAdminPermissions = (id: string, permissions: string[]) =>
  api.put<ApiResponse<AdminStaff>>(`/admin/staff/${id}/permissions`, { permissions });

export const toggleAdminActive = (id: string) =>
  api.put<ApiResponse<AdminStaff>>(`/admin/staff/${id}/toggle`);

export const deleteAdmin = (id: string) =>
  api.delete<ApiResponse>(`/admin/staff/${id}`);

// Plate Registry
export interface PlateRegistryEntry {
  id: string;
  plateNumber: string;
  make?: string;
  model?: string;
  year?: number;
  color?: string;
  registeredState?: string;
  ownerName?: string;

  insurer?: string;
  policyNumber?: string;
  insuranceStartDate?: string;
  insuranceExpiryDate?: string;
  insuranceCoverType?: string;
  insuranceStatus?: string;

  licenseNumber?: string;
  licenseIssueDate?: string;
  licenseExpiryDate?: string;
  licenseStatus?: string;

  rwCertNumber?: string;
  rwInspectionDate?: string;
  rwExpiryDate?: string;
  rwStatus?: string;

  hackneyPermitNumber?: string;
  hackneyIssueDate?: string;
  hackneyExpiryDate?: string;
  hackneyOperator?: string;
  hackneyStatus?: string;

  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const getRegistryEntries = (params?: { search?: string; page?: number; limit?: number }) =>
  api.get<ApiResponse<PlateRegistryEntry[]>>('/admin/registry', { params });

export const upsertRegistryEntry = (data: Partial<PlateRegistryEntry>) =>
  api.post<ApiResponse<PlateRegistryEntry>>('/admin/registry', data);

export const deleteRegistryEntry = (id: string) =>
  api.delete<ApiResponse>(`/admin/registry/${id}`);

export const seedRegistryFromUser = (userId: string) =>
  api.post<ApiResponse>(`/admin/registry/seed-from-user/${userId}`);
