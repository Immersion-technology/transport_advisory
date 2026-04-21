import api from './client';
import { Vehicle, Document, ApiResponse } from '../types';

export const getVehicles = () =>
  api.get<ApiResponse<Vehicle[]>>('/vehicles');

export const getVehicle = (id: string) =>
  api.get<ApiResponse<Vehicle>>(`/vehicles/${id}`);

export const addVehicle = (data: {
  plateNumber: string; make: string; model: string;
  year: number; stateOfRegistration: string;
}) => api.post<ApiResponse<Vehicle>>('/vehicles', data);

export const updateVehicle = (id: string, data: {
  make: string; model: string; year: number; stateOfRegistration: string;
}) => api.put<ApiResponse<Vehicle>>(`/vehicles/${id}`, data);

export const deleteVehicle = (id: string) =>
  api.delete<ApiResponse>(`/vehicles/${id}`);

export const lookupPlate = (plateNumber: string) =>
  api.get<ApiResponse>(`/vehicles/lookup/${plateNumber}`);

export const upsertDocument = (data: {
  vehicleId: string; type: string; expiryDate: string;
}) => api.post<ApiResponse<Document>>('/vehicles/documents', data);
