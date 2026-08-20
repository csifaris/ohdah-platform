import { BarChart3, Bell, Boxes, ClipboardList, LayoutDashboard, LogOut, Settings, Users, Wrench, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { NavigationItem } from '../types/navigation';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';
import ohdahLogo from '../assets/ohdah-logo.png';

const items: NavigationItem[] = [
  { label: 'لوحة التحكم', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'إدارة الأصول', to: '/admin/assets', icon: Boxes },
  { label: 'العهد', to: '/admin/custody', icon: ClipboardList },
  { label: 'الموظفون', to: '/admin/employees', icon: Users },
  { label: 'الصيانة', to: '/admin/maintenance', icon: Wrench },
  { label: 'التقارير', to: '/admin/reports', icon: BarChart3 },
  { label: 'الإشعارات', to: '/admin/notifications', icon: Bell },
  { label: 'الإعدادات', to: '/admin/settings', icon: Settings },
];

type SidebarProps = { open: boolean; onClose: () => void };

export function Sidebar({ open, onClose }: SidebarProps) {
  const { logout } = useAuth();
  return (
    <>
      {open && <div aria-hidden="true" className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-40 flex h-screen w-[260px] min-w-[260px] max-w-[260px] flex-col bg-[#071426] text-white transition-transform lg:sticky lg:top-0 lg:translate-x-0',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm">
              <img src={ohdahLogo} alt="Ohdah" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-xl font-bold leading-tight tracking-tight text-white" style={{ fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" }}>عُهدة</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">OHDAH</p>
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

        {/* Nav */}
        <nav aria-label="التنقل الرئيسي" className="flex-1 space-y-1 overflow-y-auto p-3 pt-4">
          <p className="mb-2.5 px-3 text-[11px] font-bold uppercase tracking-wider text-white/50">القائمة الرئيسية</p>
          {items.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#062B78] border-r-4 border-[#D4AF37] text-white shadow-sm'
                    : 'border-r-4 border-transparent text-white/75 hover:bg-white/10 hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={19} aria-hidden="true" className={isActive ? 'text-[#D4AF37]' : 'text-white/70'} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-3">
          <button
            className="flex w-full items-center gap-3 rounded-xl border-r-4 border-transparent px-3.5 py-3 text-sm font-medium text-white/75 transition-colors hover:border-red-500 hover:bg-red-500/15 hover:text-red-300"
            onClick={logout}
            type="button"
          >
            <LogOut size={19} />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </aside>
    </>
  );
}
