// SPEC-T-003: API Service

import axios from 'axios';
import type { ApiResponse, PaginatedResponse, Person, PersonDetail } from '../types';

const DEFAULT_API_URL = 'http://localhost:3000/api';

const normalizeApiUrl = (value?: string) => {
  const source = (value || DEFAULT_API_URL).trim().replace(/\/+$/, '');
  return source.endsWith('/api') ? source : `${source}/api`;
};

export const API_URL = normalizeApiUrl(
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_ORIGIN
);
export const API_ORIGIN = API_URL.replace(/\/api$/, '');

const withLeadingSlash = (path: string) => (path.startsWith('/') ? path : `/${path}`);

export const buildApiUrl = (path: string) => `${API_URL}${withLeadingSlash(path)}`;

export const buildMediaUrl = (path?: string | null) => {
  if (!path) {
    return undefined;
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${API_ORIGIN}${withLeadingSlash(path)}`;
};

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status = 500, payload?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem('token');
};

const createHeaders = (headers: HeadersInit | undefined, body: BodyInit | null | undefined) => {
  const nextHeaders = new Headers(headers);

  if (!(body instanceof FormData) && body !== undefined && body !== null && !nextHeaders.has('Content-Type')) {
    nextHeaders.set('Content-Type', 'application/json');
  }

  const token = getStoredToken();
  if (token && !nextHeaders.has('Authorization')) {
    nextHeaders.set('Authorization', `Bearer ${token}`);
  }

  return nextHeaders;
};

const extractApiMessage = (payload: any, fallback: string) => {
  return payload?.error?.message || payload?.error || payload?.message || fallback;
};

export async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: createHeaders(init.headers, init.body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || (payload && payload.success === false)) {
    throw new ApiError(
      extractApiMessage(payload, `La requête a échoué (${response.status})`),
      response.status,
      payload
    );
  }

  return payload as ApiResponse<T>;
}

export async function apiGetData<T>(path: string) {
  const payload = await apiRequest<T>(path);
  return payload.data;
}

export async function apiRequestData<T>(path: string, init: RequestInit = {}) {
  const payload = await apiRequest<T>(path, init);
  return payload.data;
}

export async function apiRequestVoid(path: string, init: RequestInit = {}) {
  await apiRequest<unknown>(path, init);
}

export const jsonBody = (value: unknown) => JSON.stringify(value);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
}

const splitName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || name.trim() || 'Utilisateur',
    lastName: parts.slice(1).join(' '),
  };
};

export const authService = {
  getCurrentUser: async () => apiGetData<AuthUser>('/auth/me'),

  login: async (email: string, password: string) =>
    apiRequestData<AuthSession>('/auth/login', {
      method: 'POST',
      body: jsonBody({ email, password }),
    }),

  register: async (email: string, password: string, name: string) => {
    const { firstName, lastName } = splitName(name);
    return apiRequestData<AuthSession>('/auth/register', {
      method: 'POST',
      body: jsonBody({ email, password, firstName, lastName }),
    });
  },
};

export const personService = {
  getAll: async (page = 1, limit = 50, search?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) {
      params.append('search', search);
    }

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
