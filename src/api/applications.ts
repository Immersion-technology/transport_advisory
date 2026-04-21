import api from './client';
import { Application, ApiResponse } from '../types';

export const getApplications = () =>
  api.get<ApiResponse<Application[]>>('/applications');

export const getApplication = (id: string) =>
  api.get<ApiResponse<Application>>(`/applications/${id}`);

export const createApplication = (data: Record<string, unknown>) =>
  api.post<ApiResponse<Application>>('/applications', data);

export const uploadApplicationDocs = (applicationId: string, files: File[]) => {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  return api.post<ApiResponse>(`/applications/${applicationId}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const initPayment = (applicationId: string) =>
  api.post<ApiResponse<{ authorizationUrl: string; reference: string }>>(`/applications/${applicationId}/pay`);

export const verifyPayment = (reference: string) =>
  api.get<ApiResponse>(`/applications/verify/${reference}`);
