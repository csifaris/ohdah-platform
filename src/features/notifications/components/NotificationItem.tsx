import { Bell, Clock3, ExternalLink, FileCheck2, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Notification } from '../types';
import { useAuth } from '../../../context/AuthContext';

const icons = {
  custody: Clock3,
  maintenance: Wrench,
  approval: FileCheck2,
  system: Bell,
};

const typeLabels: Record<string, string> = {
  custody: 'العهد والتسليم',
  maintenance: 'الصيانة والدعم',
  approval: 'الاعتمادات',
  system: 'تنبيه نظام',
};

export function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: () => void;
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const Icon = icons[notification.type] || Bell;

  const isAdmin = Boolean(user?.roles?.includes('ADMIN'));
  const isAssetManager = Boolean(user?.roles?.includes('ASSET_MANAGER') && !isAdmin);

  const handleClick = () => {
    if (!notification.read) {
      onRead();
    }

    // Smart navigation based on notification type & role
    if (notification.type === 'custody' || notification.type === 'approval') {
      if (isAssetManager) {
        navigate('/asset-manager/custody/requests');
      } else if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/portal/custody');
      }
    } else if (notification.type === 'maintenance') {
      if (isAssetManager) {
        navigate('/asset-manager/maintenance');
      } else if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/portal/maintenance');
      }
    }
  };

  const formattedDate = notification.createdAt
    ? new Date(notification.createdAt).toLocaleString('ar-SA', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—';

  return (
    <article
      onClick={handleClick}
      className={`group flex cursor-pointer gap-4 border-b border-[#D9E2EC] p-5 transition-all hover:bg-[#FFF7E6] ${
        !notification.read ? 'bg-blue-50/40' : 'bg-white'
      }`}
    >
      {/* Icon Circle */}
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${
          notification.type === 'maintenance'
            ? 'bg-amber-100 text-[#B7791F]'
            : notification.type === 'custody'
            ? 'bg-red-100 text-[#DC2626]'
            : notification.type === 'approval'
            ? 'bg-emerald-100 text-[#059669]'
            : 'bg-blue-100 text-[#062B78]'
        }`}
      >
        <Icon size={22} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#071426] group-hover:text-[#062B78] transition-colors">
              {notification.title}
            </h3>
            {notification.important && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-[#DC2626]">
                تنبيه هام
              </span>
            )}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-[#64748B]">
              {typeLabels[notification.type] || notification.type}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                notification.read
                  ? 'bg-slate-100 text-[#64748B]'
                  : 'bg-[#062B78] text-white'
              }`}
            >
              {notification.read ? 'مقروء' : 'جديد'}
            </span>
          </div>
        </div>

        <p className="text-xs leading-relaxed text-[#64748B]">{notification.message}</p>

        <div className="mt-2 flex items-center justify-between pt-1">
          <span className="text-[11px] font-medium text-[#64748B]" dir="ltr">
            {formattedDate}
          </span>

          <div className="flex items-center gap-3">
            {!notification.read && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRead();
                }}
                className="text-xs font-bold text-[#062B78] hover:underline"
              >
                تحديد كمقروء
              </button>
            )}
            <span className="flex items-center gap-1 text-xs font-bold text-[#062B78] opacity-0 group-hover:opacity-100 transition-opacity">
              فتح الصفحة المرتبطة <ExternalLink size={12} />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
