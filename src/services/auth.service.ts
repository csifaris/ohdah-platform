import { api, getAuthPayload, getOrganizationId } from './api';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  organizationId?: string;
  roles: string[];
  permissions?: string[];
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  department: string;
  jobTitle: string;
};

const TOKEN_KEY = 'ohdah_access_token';
const REFRESH_KEY = 'ohdah_refresh_token';

function userFromToken(): AuthUser | null {
  const payload = getAuthPayload();
  if (!payload) return null;
  return {
    id: payload.userId || payload.sub,
    name: payload.name || 'المستخدم الحالي',
    email: payload.email,
    organizationId: payload.organizationId,
    roles: payload.roles || [],
    permissions: payload.permissions || [],
  };
}

export async function login(email: string, password: string) {
  logout();
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
  localStorage.setItem(TOKEN_KEY, data.accessToken);
  if (data.refreshToken) {
    localStorage.setItem(REFRESH_KEY, data.refreshToken);
  }
  const current = userFromToken();
  if (!current) throw new Error('تعذر قراءة جلسة المستخدم.');
  return { ...data, user: current };
}

export async function register(payload: RegisterPayload) {
  const { data } = await api.post('/auth/register', {
    ...payload,
    organizationId: getOrganizationId(),
  });
  return data;
}

export async function restoreSession() {
  return userFromToken();
}

export function logout() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (refreshToken) {
    api.post('/auth/logout', { refreshToken }).catch(() => {});
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

export async function logoutAllDevices() {
  try {
    await api.post('/auth/logout-all');
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
}

export function isAuthenticated() {
  return Boolean(userFromToken());
}

export function getCurrentUser() {
  return userFromToken();
}
