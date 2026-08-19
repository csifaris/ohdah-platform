import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getApiErrorMessage } from '../services/api';
import { login as loginRequest, logout as logoutRequest, restoreSession, type AuthUser } from '../services/auth.service';

type AuthContextValue = { user: AuthUser | null; loading: boolean; error: string; login: (email: string, password: string) => Promise<AuthUser>; logout: () => void };
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) { const [user, setUser] = useState<AuthUser | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(''); useEffect(() => { restoreSession().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false)); }, []); const value = useMemo<AuthContextValue>(() => ({ user, loading, error, login: async (email, password) => { setLoading(true); setError(''); try { const result = await loginRequest(email, password); setUser(result.user); return result.user; } catch (reason: unknown) { const message = getApiErrorMessage(reason, 'تعذر تسجيل الدخول.'); setError(message); throw reason; } finally { setLoading(false); } }, logout: () => { logoutRequest(); setUser(null); } }), [error, loading, user]); return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>; }
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used inside AuthProvider'); return context; }
