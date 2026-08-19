export type NotificationType = 'custody' | 'maintenance' | 'system' | 'approval';
export type Notification = { id: string; title: string; message: string; type: NotificationType; createdAt: string; read: boolean; important: boolean };
