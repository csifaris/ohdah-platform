import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) { const { user, loading } = useAuth(); const location = useLocation(); if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-muted">جاري استعادة الجلسة...</div>; if (!user) return <Navigate replace state={{ from: location.pathname }} to="/login" />; const roles = user.roles.map((role) => role.toUpperCase()); if (allowedRoles && !allowedRoles.some((role) => roles.includes(role))) return <Navigate replace to={roles.includes('EMPLOYEE') ? '/portal' : '/login'} />; return <Outlet />; }
