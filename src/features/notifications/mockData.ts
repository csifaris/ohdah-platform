import type { Notification } from './types';
export const mockNotifications: Notification[] = [
  { id: 'N-001', title: 'تذكير بعهدة متأخرة', message: 'العهدة الخاصة بجهاز Dell XPS 15 متأخرة عن موعد التسليم بيومين.', type: 'custody', createdAt: 'منذ 15 دقيقة', read: false, important: true },
  { id: 'N-002', title: 'تحديث حالة الصيانة', message: 'تم بدء صيانة جهاز MacBook Pro M2 بواسطة محمد علي.', type: 'maintenance', createdAt: 'منذ ساعة', read: false, important: false },
  { id: 'N-003', title: 'طلب عهدة جديد', message: 'لديك طلب عهدة جديد من سارة أحمد بانتظار المراجعة.', type: 'approval', createdAt: 'أمس، 02:30 م', read: true, important: true },
  { id: 'N-004', title: 'تحديث النظام', message: 'تم تحديث سياسة الصلاحيات المؤسسية بنجاح.', type: 'system', createdAt: 'أمس، 10:15 ص', read: true, important: false },
];
