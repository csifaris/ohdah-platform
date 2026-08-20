import { Building2, LayoutDashboard, LogOut, Settings, ShieldCheck, Users, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { NavigationItem } from '../types/navigation';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import ohdahLogo from '../assets/ohdah-logo.png';

const items: NavigationItem[] = [
  { label: 'لوحة التحكم', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'إدارة المستخدمين', to: '/admin/users', icon: Users },
  { label: 'الأدوار والصلاحيات', to: '/admin/users-permissions', icon: ShieldCheck },
  { label: 'الهيكل التنظيمي والموظفون', to: '/admin/employees', icon: Building2 },
  { label: 'إعدادات النظام', to: '/admin/settings', icon: Settings },
];

type AdminSidebarProps = { open: boolean; onClose: () => void };

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const { logout, user } = useAuth();
  return (
    <>
      {open && <div aria-hidden="true" className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-40 flex h-screen w-[260px] min-w-[260px] max-w-[260px] flex-col bg-[#071426] text-white transition-transform lg:sticky lg:top-0 lg:translate-x-0',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Logo Header */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm">
              <img src={ohdahLogo} alt="Ohdah" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-xl font-bold leading-tight tracking-tight text-white" style={{ fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" }}>عُهدة</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">لوحة مدير النظام</p>
            </div>
          </div>
          <button
            aria-label="إغلاق القائمة"
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 lg:hidden"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav Menu */}
        <nav aria-label="إدارة النظام" className="flex-1 space-y-1 overflow-y-auto p-3 pt-4">
          <p className="mb-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-white/50">إدارة النظام والمنصة</p>
          {items.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#062B78] text-white font-bold border-r-4 border-[#D4AF37]'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                )
              }
            >
              <Icon size={19} className="shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer User Info */}
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl bg-white/5 p-3">
            <p className="truncate text-xs font-bold text-white">{user?.name || 'مدير النظام'}</p>
            <p className="truncate text-[10px] text-white/50">{user?.email || 'admin@ohdah.local'}</p>
          </div>
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors"
            onClick={logout}
          >
            <LogOut size={16} />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}
