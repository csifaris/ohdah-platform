import type { Notification } from '../types';
import { NotificationItem } from './NotificationItem';
export function NotificationList({ notifications, onRead }: { notifications: Notification[]; onRead: (id: string) => void }) { return <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-soft">{notifications.map((notification) => <NotificationItem key={notification.id} notification={notification} onRead={() => onRead(notification.id)} />)}{notifications.length === 0 && <div className="p-12 text-center text-sm text-muted">لا توجد إشعارات مطابقة.</div>}</div>; }
