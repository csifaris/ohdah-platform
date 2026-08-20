import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export type AuthPayload = { sub: string; userId?: string; email: string; name?: string; organizationId: string; roles: string[]; permissions?: string[] };
export function getAuthPayload(): AuthPayload | null {
  const token = localStorage.getItem('ohdah_access_token');
  if (!token) return null;
  try {
    const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(encoded.padEnd(encoded.length + ((4 - (encoded.length % 4)) % 4), '='));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoded = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(decoded) as AuthPayload;
  } catch {
    return null;
  }
}
export const getOrganizationId = () => getAuthPayload()?.organizationId || import.meta.env.VITE_ORGANIZATION_ID || '';
export const getCurrentUserId = () => getAuthPayload()?.sub || '';

export const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ohdah_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) localStorage.removeItem('ohdah_access_token');
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error: unknown, fallback = 'تعذر تنفيذ الطلب. حاول مرة أخرى.') {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    return Array.isArray(message) ? message.join('، ') : message || fallback;
  }
  return fallback;
}
