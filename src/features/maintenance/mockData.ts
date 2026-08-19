import type { MaintenanceRequest } from './types';
export const mockMaintenance: MaintenanceRequest[] = [
  { id: 'MT-000125', assetName: 'MacBook Pro M2', assetId: 'AST-2026-005', employee: 'أحمد محمد', issue: 'مشكلة شاشة - خطوط رأسية', requestedAt: '19/08/2026', technician: 'محمد علي', status: 'in_progress', priority: 'urgent', cost: '450 ر.س' },
  { id: 'MT-000124', assetName: 'Dell Latitude 7420', assetId: 'AST-2026-012', employee: 'سارة خالد', issue: 'تحديث نظام التشغيل', requestedAt: '18/08/2026', technician: 'علي محمود', status: 'open', priority: 'normal', cost: '—' },
  { id: 'MT-000123', assetName: 'Herman Miller Chair', assetId: 'AST-2025-104', employee: 'فهد ناصر', issue: 'كسر في العجلة', requestedAt: '15/08/2026', technician: 'شركة الصيانة', status: 'completed', priority: 'normal', cost: '180 ر.س' },
  { id: 'MT-000122', assetName: 'Logitech Mouse', assetId: 'AST-2026-088', employee: 'نورة سعد', issue: 'لا يعمل', requestedAt: '10/08/2026', technician: 'محمد علي', status: 'cancelled', priority: 'normal', cost: '—' },
];
