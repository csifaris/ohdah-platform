import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute({ allowedRoles }: { allowedRoles?: string[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-sm text-[#64748B]">
        جاري التحقق من الصلاحيات...
      </div>
    );
  }

  if (!user) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />;
  }

  const roles = user.roles.map((role) => role.toUpperCase());
  if (allowedRoles && !allowedRoles.some((role) => roles.includes(role))) {
    if (roles.includes('ADMIN')) return <Navigate replace to="/admin/dashboard" />;
    if (roles.includes('ASSET_MANAGER')) return <Navigate replace to="/asset-manager/dashboard" />;
    if (roles.includes('EMPLOYEE')) return <Navigate replace to="/portal" />;
    return <Navigate replace to="/login" />;
  }

  return <Outlet />;
}
