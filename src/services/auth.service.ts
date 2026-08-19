import { api, getAuthPayload, getOrganizationId } from './api';

export type AuthUser = { id: string; name: string; email: string; roles: string[]; permissions?: string[] };
export type LoginResponse = { accessToken: string; user: AuthUser };
export type RegisterPayload = { fullName: string; email: string; phone: string; password: string; department: string; jobTitle: string };
const TOKEN_KEY = 'ohdah_access_token';

function userFromToken(): AuthUser | null { const payload = getAuthPayload(); if (!payload) return null; return { id: payload.userId || payload.sub, name: payload.name || 'المستخدم الحالي', email: payload.email, roles: payload.roles || [], permissions: payload.permissions || [] }; }
export async function login(email: string, password: string) { logout(); const { data } = await api.post<LoginResponse>('/auth/login', { email, password }); localStorage.setItem(TOKEN_KEY, data.accessToken); const current = userFromToken(); if (!current) throw new Error('تعذر قراءة جلسة المستخدم.'); return { ...data, user: current }; }
export async function register(payload: RegisterPayload) { const { data } = await api.post('/auth/register', { ...payload, organizationId: getOrganizationId() }); return data; }
export async function restoreSession() { return userFromToken(); }
export function logout() { localStorage.removeItem(TOKEN_KEY); }
export function isAuthenticated() { return Boolean(userFromToken()); }
export function getCurrentUser() { return userFromToken(); }
