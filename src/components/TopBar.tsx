import { useEffect, useState } from 'react';
import { Bell, Menu, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMyEmployeeProfile } from '../services/employees.service';
import { listNotifications } from '../services/notifications.service';
import { Link } from 'react-router-dom';
import logoUrl from '../assets/ohdah-logo.png';

type TopBarProps = { onMenuClick: () => void };

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user } = useAuth();
  const [employeeJobTitle, setEmployeeJobTitle] = useState<string>('');
  const [unreadCount, setUnreadCount] = useState(0);

  const isAdmin = Boolean(user?.roles?.includes('ADMIN'));
  const isAssetManager = Boolean(user?.roles?.includes('ASSET_MANAGER') && !isAdmin);
  const isEmployee = Boolean(user?.roles?.includes('EMPLOYEE') && !isAdmin && !isAssetManager);

  useEffect(() => {
    if (!user) return;

    if (isEmployee) {
      getMyEmployeeProfile()
        .then((employee) => {
          if (employee?.jobTitle) {
            setEmployeeJobTitle(employee.jobTitle);
          }
        })
        .catch(console.error);
    }

    listNotifications(user.id, true)
      .then((notifications) => {
        setUnreadCount(notifications.length);
      })
      .catch(console.error);
  }, [user, isEmployee]);

  const displayJobTitle = isAdmin
    ? 'مسؤول النظام'
    : isAssetManager
    ? 'مسؤول العهد والأصول'
    : employeeJobTitle || 'موظف';

  const homeLink = isAdmin
    ? '/admin/dashboard'
    : isAssetManager
    ? '/asset-manager/dashboard'
    : '/portal';

  const notificationsLink = isAssetManager
    ? '/asset-manager/notifications'
    : isEmployee
    ? '/portal/notifications'
    : '/admin/notifications';

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-4 border-b border-[#D9E2EC] bg-[#FFFFFF] px-4 shadow-sm sm:px-8">
      {/* Right side: hamburger + main Ohdah logo */}
      <div className="flex items-center gap-3">
        <button
          aria-label="فتح القائمة"
          className="rounded-lg p-2 text-[#64748B] hover:bg-[#F8FAFC] lg:hidden"
          onClick={onMenuClick}
        >
          <Menu size={22} />
        </button>
        <Link to={homeLink} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071426] p-2 shadow-sm border border-[#D9E2EC]/30">
            <img src={logoUrl} alt="Ohdah" className="h-full w-full object-contain" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xl font-bold leading-tight text-[#071426]" style={{ fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" }}>عُهدة</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] leading-none">OHDAH PLATFORM</p>
          </div>
        </Link>
      </div>

      {/* Center: search box */}
      <div className="hidden flex-1 max-w-md lg:flex">
        <label className="relative w-full">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
          <input
            className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] py-2.5 pl-4 pr-11 text-sm text-[#071426] placeholder-[#64748B] outline-none transition focus:border-[#062B78] focus:ring-1 focus:ring-[#062B78]"
            placeholder="البحث في الأصول، العهد، الموظفين..."
          />
        </label>
      </div>

      {/* Left side: notifications + profile details */}
      <div className="flex items-center gap-3">
        <Link
          to={notificationsLink}
          aria-label="الإشعارات"
          className="relative rounded-xl p-2.5 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#062B78] transition-colors"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[9px] font-bold text-white shadow-sm">
              {unreadCount > 9 ? '+9' : unreadCount}
            </span>
          )}
        </Link>

        <div className="flex items-center gap-3 border-r border-[#D9E2EC] pr-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-bold text-[#071426]">{user?.name || 'مستخدم النظام'}</p>
            <p className="text-xs text-[#64748B]">{displayJobTitle}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
