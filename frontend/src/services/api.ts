// SPEC-T-003: API Service

import axios from 'axios';
import { Person, PersonDetail, ApiResponse, PaginatedResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const personService = {
  getAll: async (page = 1, limit = 50, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    
    const { data } = await api.get<ApiResponse<PaginatedResponse<Person>>>(`/persons?${params}`);
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<ApiResponse<PersonDetail>>(`/persons/${id}`);
    return data.data;
  },

  create: async (person: Partial<Person>) => {
    const { data } = await api.post<ApiResponse<Person>>('/persons', person);
    return data.data;
  },

  update: async (id: string, person: Partial<Person>) => {
    const { data } = await api.put<ApiResponse<Person>>(`/persons/${id}`, person);
    return data.data;
  },

  delete: async (id: string) => {
    const { data } = await api.delete<ApiResponse<void>>(`/persons/${id}`);
    return data;
  },
};

export default api;
