import api from './client';
import { User, ApiResponse, Gender } from '../types';

export const login = (data: { email: string; password: string }) =>
  api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data);

export const getProfile = () =>
  api.get<ApiResponse<User>>('/auth/profile');

export const updateProfile = (data: { firstName: string; lastName: string; phone: string }) =>
  api.put<ApiResponse<User>>('/auth/profile', data);

export const changePassword = (data: { currentPassword?: string; newPassword: string }) =>
  api.put<ApiResponse>('/auth/change-password', data);

// --- Auto-account-at-checkout flow ---

export type CheckoutPayload = {
  firstName: string;
  lastName: string;
  othernames?: string;
  email: string;
  phone: string;
  gender?: Gender;
  address?: string;
  vehicle: {
    plateNumber: string;
    // RENEWAL only needs plateNumber; FRESH requires all fields below
    make?: string;
    model?: string;
    year?: number | string;
    stateOfRegistration?: string;
    colour?: string;
    chassisNumber?: string;
    engineNumber?: string;
    categoryId?: string;
    chassisPhotoUrl?: string;
    chassisPhotoPublicId?: string;
    licensePhotoUrl?: string;
    licensePhotoPublicId?: string;
  };
  service: {
    documentType:
      | 'MOTOR_INSURANCE'
      | 'VEHICLE_LICENSE'
      | 'ROADWORTHINESS'
      | 'HACKNEY_PERMIT'
      | 'CHANGE_OF_OWNERSHIP';
    kind: 'RENEWAL' | 'FRESH';
    delivery?: {
      tier: 'STANDARD' | 'EXPRESS' | 'SAME_DAY';
      address: string;
      city: string;
      state: string;
      recipientName?: string;
      recipientPhone?: string;
    };
  };
};

export const checkout = (data: CheckoutPayload) =>
  api.post<ApiResponse<{ applicationId: string; isNewUser: boolean; emailSentTo: string }>>(
    '/auth/checkout',
    data,
  );

export const requestMagicLink = (data: { email: string }) =>
  api.post<ApiResponse>('/auth/magic-link/request', data);

export const consumeMagicLink = (data: { token: string }) =>
  api.post<ApiResponse<{ user: User; token: string; isFirstLogin: boolean }>>(
    '/auth/magic-link/consume',
    data,
  );
