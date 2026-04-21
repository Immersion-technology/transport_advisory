import api from './client';
import { User, ApiResponse } from '../types';

export const login = (data: { email: string; password: string }) =>
  api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data);

export const register = (data: {
  email: string; phone: string; password: string; firstName: string; lastName: string;
}) => api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data);

export const getProfile = () =>
  api.get<ApiResponse<User>>('/auth/profile');

export const updateProfile = (data: { firstName: string; lastName: string; phone: string }) =>
  api.put<ApiResponse<User>>('/auth/profile', data);

export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  api.put<ApiResponse>('/auth/change-password', data);
