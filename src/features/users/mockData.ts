import type { PermissionRow, Role, User } from './types';
export const mockUsers: User[] = [
  { id: 'USR-0001', name: 'أحمد محمد عبدالله', email: 'ahmed.m@ohdah.sa', role: 'مسؤول النظام', department: 'تقنية المعلومات', branch: 'الرياض الرئيسي', status: 'active', lastActivity: 'منذ 5 دقائق', createdAt: '12 يناير 2023' },
  { id: 'USR-0002', name: 'سارة خالد', email: 'sara.k@ohdah.sa', role: 'مسؤول العهد', department: 'الموارد البشرية', branch: 'فرع جدة', status: 'active', lastActivity: 'أمس 14:30', createdAt: '05 مارس 2023' },
  { id: 'USR-0003', name: 'فهد العتيبي', email: 'fahad.o@ohdah.sa', role: 'مستخدم عادي', department: 'المبيعات', branch: 'الدمام', status: 'inactive', lastActivity: 'منذ شهرين', createdAt: '20 يوليو 2022' },
];
export const mockRoles: Role[] = [
  { id: 'ROLE-1', name: 'مسؤول النظام', description: 'وصول كامل لجميع وحدات النظام وإعدادات المؤسسة.', users: 2, permissions: 24 },
  { id: 'ROLE-2', name: 'مدير الأصول', description: 'إدارة الأصول والعهد والصيانة والتقارير التشغيلية.', users: 8, permissions: 18 },
  { id: 'ROLE-3', name: 'مستخدم قياسي', description: 'الوصول إلى العهد الشخصية وإنشاء الطلبات.', users: 610, permissions: 7 },
];
export const mockPermissions: PermissionRow[] = [
  { group: 'إدارة الأصول', feature: 'سجل الأصول', actions: { view: true, create: true, edit: true, delete: false } },
  { group: 'إدارة الأصول', feature: 'عمليات الجرد', actions: { view: true, create: true, edit: true, delete: false } },
  { group: 'إدارة العهد', feature: 'طلبات العهد', actions: { view: true, create: false, edit: true, delete: false } },
  { group: 'إدارة الموظفين', feature: 'دليل الموظفين', actions: { view: true, create: true, edit: true, delete: false } },
  { group: 'التقارير', feature: 'التقارير التحليلية', actions: { view: true, create: true, edit: false, delete: false } },
];
