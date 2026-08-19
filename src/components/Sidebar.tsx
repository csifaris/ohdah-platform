import { BarChart3, Bell, Boxes, ClipboardList, LayoutDashboard, LogOut, Settings, Users, Wrench, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { NavigationItem } from '../types/navigation';
import { cn } from '../utils/cn';
import { useAuth } from '../context/AuthContext';

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
  return <>
    {open && <button aria-label="إغلاق القائمة" className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={onClose} />}
    <aside className={cn('fixed inset-y-0 right-0 z-40 flex w-72 flex-col border-l border-border bg-white transition-transform lg:static lg:translate-x-0', open ? 'translate-x-0' : 'translate-x-full')}>
      <div className="flex h-20 items-center justify-between border-b border-border px-6">
        <div><p className="text-2xl font-bold tracking-tight text-primary">عُهدة</p><p className="text-xs text-muted">إدارة الأصول المؤسسية</p></div>
        <button aria-label="إغلاق القائمة" className="rounded-lg p-2 text-muted hover:bg-surface lg:hidden" onClick={onClose}><X size={20} /></button>
      </div>
      <nav aria-label="التنقل الرئيسي" className="flex-1 space-y-1 overflow-y-auto p-4">
        <p className="mb-3 px-3 text-xs font-semibold text-muted">القائمة الرئيسية</p>
        {items.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => cn('flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors', isActive ? 'bg-primary text-white shadow-soft' : 'text-muted hover:bg-primary-light hover:text-primary')}><Icon size={19} aria-hidden="true" /><span>{label}</span></NavLink>)}
      </nav>
      <div className="border-t border-border p-4"><button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted hover:bg-red-50 hover:text-danger" onClick={logout} type="button"><LogOut size={19} /><span>تسجيل الخروج</span></button></div>
    </aside>
  </>;
}
