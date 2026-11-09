import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { NotificationFilters, NotificationList, type Notification, type NotificationFilter } from '../features/notifications';
import { getApiErrorMessage } from '../services/api';
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '../services/notifications.service';
import { useAuth } from '../context/AuthContext';

export function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchNotifications = useCallback(() => {
    if (!user?.id) return;
    listNotifications(user.id)
      .then((data) => {
        setNotifications(data);
      })
      .catch((reason: unknown) => {
        setError(getApiErrorMessage(reason, 'تعذر تحميل الإشعارات.'));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered = useMemo(() => {
    return notifications.filter((notification) => {
      const matchSearch = `${notification.title} ${notification.message}`.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;
      if (filter === 'all') return true;
      if (filter === 'unread') return !notification.read;
      if (filter === 'custody') return notification.type === 'custody' || notification.type === 'approval';
      if (filter === 'maintenance') return notification.type === 'maintenance';
      if (filter === 'system') return notification.type === 'system';
      return true;
    });
  }, [filter, notifications, search]);

  const markRead = (id: string) => {
    markNotificationRead(id)
      .then((updated) => {
        setNotifications((items) => items.map((item) => (item.id === id ? updated : item)));
        setSuccess('تم تحديد الإشعار كمقروء.');
      })
      .catch((reason: unknown) => setError(getApiErrorMessage(reason)));
  };

  const markAll = () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
    markAllNotificationsRead(user?.id)
      .then(() => setSuccess('تم تحديد جميع الإشعارات كمقروءة بنجاح.'))
      .catch((reason: unknown) => setError(getApiErrorMessage(reason, 'تعذر تحديث الإشعارات.')));
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">منظومة التنبيهات</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]" style={{ fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" }}>
            مركز الإشعارات والتنبيهات
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">
            متابعة كافة التنبيهات، اعتمادات العهد، قرارات الرفض، وبلاغات الصيانة.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 rounded-xl bg-[#062B78] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#071426]"
            onClick={markAll}
            type="button"
          >
            <CheckCheck size={17} />
            تحديد الكل كمقروء
          </button>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-[#DC2626]" role="alert">{error}</p>}
      {success && <p className="rounded-xl bg-green-50 p-4 text-sm font-semibold text-[#059669]" role="status">{success}</p>}

      {/* KPI Counters */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#D9E2EC] bg-white p-5 shadow-soft border-t-4 border-t-[#062B78]">
          <p className="text-xs font-bold uppercase text-[#64748B]">إجمالي الإشعارات</p>
          <p className="mt-2 text-2xl font-bold text-[#071426]">{notifications.length}</p>
        </div>
        <div className="rounded-2xl border border-[#D9E2EC] bg-white p-5 shadow-soft border-t-4 border-t-[#062B78]">
          <p className="text-xs font-bold uppercase text-[#64748B]">إشعارات غير مقروءة</p>
          <p className="mt-2 text-2xl font-bold text-[#062B78]">
            {notifications.filter((item) => !item.read).length}
          </p>
        </div>
        <div className="rounded-2xl border border-[#D9E2EC] bg-white p-5 shadow-soft border-t-4 border-t-[#DC2626]">
          <p className="text-xs font-bold uppercase text-[#64748B]">تنبيهات مهمة</p>
          <p className="mt-2 text-2xl font-bold text-[#DC2626]">
            {notifications.filter((item) => item.important).length}
          </p>
        </div>
      </div>

      {/* Notifications List Card */}
      <div className="rounded-2xl border border-[#D9E2EC] bg-white p-4 shadow-soft sm:p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-[#D9E2EC] pb-3">
          <Bell className="text-[#062B78]" size={20} />
          <h2 className="text-lg font-bold text-[#071426]">سجل الإشعارات</h2>
        </div>

        <NotificationFilters filter={filter} onFilter={setFilter} onSearch={setSearch} search={search} />

        {loading ? (
          <p className="mt-5 rounded-xl bg-[#F8FAFC] p-8 text-center text-sm text-[#64748B]">
            جاري تحميل الإشعارات...
          </p>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#D9E2EC] bg-[#F8FAFC] p-12 text-center">
            <Inbox className="mx-auto text-[#64748B] mb-2" size={32} />
            <p className="text-sm font-bold text-[#071426]">لا توجد إشعارات مطابقة</p>
            <p className="text-xs text-[#64748B] mt-1">ستظهر التنبيهات والتحديثات الجديدة هنا فور حدوثها.</p>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-[#D9E2EC] overflow-hidden divide-y divide-[#D9E2EC]">
            <NotificationList notifications={filtered} onRead={markRead} />
          </div>
        )}
      </div>
    </section>
  );
}
