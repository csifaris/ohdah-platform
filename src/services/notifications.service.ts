import type { Notification } from '../features/notifications';
import { api, getCurrentUserId } from './api';

type ApiNotification = Notification & { isRead?: boolean; isImportant?: boolean };
function mapNotification(item: ApiNotification): Notification { return { ...item, read: item.isRead ?? item.read, important: item.isImportant ?? item.important }; }
export async function listNotifications(recipientId = getCurrentUserId(), unreadOnly = false) { const { data } = await api.get<ApiNotification[]>('/notifications', { params: { recipientId, unreadOnly } }); return data.map(mapNotification); }
export async function markNotificationRead(id: string) { const { data } = await api.patch<ApiNotification>(`/notifications/${id}/read`); return mapNotification(data); }
export async function markAllNotificationsRead(recipientId = getCurrentUserId()) { return api.patch(`/notifications/read-all/${recipientId}`); }
