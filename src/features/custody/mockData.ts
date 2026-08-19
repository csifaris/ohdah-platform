import type { CustodyRecord, CustodyRequest } from './types';

export const mockCustody: CustodyRecord[] = [
  { id: 'OH-000125', assetId: 'AST-2026-005', assetName: 'MacBook Pro M2', category: 'أجهزة تقنية', employee: 'أحمد محمد', department: 'تقنية المعلومات', assignedAt: '19/08/2026', status: 'active', dueDate: '19/08/2027', notes: 'تم التسليم مع الشاحن الأصلي وحقيبة واقية.' },
  { id: 'OH-000126', assetId: 'AST-2026-009', assetName: 'Dell XPS 15', category: 'أجهزة تقنية', employee: 'سارة خالد', department: 'التسويق', assignedAt: '22/05/2025', status: 'overdue', dueDate: '22/05/2026', notes: 'بانتظار تأكيد الإرجاع من الموظف.' },
  { id: 'OH-000127', assetId: 'AST-2026-014', assetName: 'Samsung Galaxy S23', category: 'أجهزة اتصال', employee: 'محمد علي', department: 'المبيعات', assignedAt: '10/11/2024', status: 'returned', dueDate: '10/11/2025', notes: 'تم الاسترجاع بحالة جيدة.' },
  { id: 'OH-000128', assetId: 'AST-2026-007', assetName: 'طابعة HP LaserJet', category: 'أجهزة مكتبية', employee: 'قسم الموارد البشرية', department: 'الموارد البشرية', assignedAt: '02/01/2026', status: 'maintenance', dueDate: '02/01/2027', notes: 'الأصل لدى فريق الصيانة.' },
];

export const mockCustodyRequests: CustodyRequest[] = [
  { id: 'REQ-2026-0320', requester: 'سارة أحمد', department: 'الموارد البشرية', category: 'جهاز كمبيوتر', reason: 'موظف جديد', requestedAt: '19/08/2026', status: 'pending', assetName: 'MacBook Pro M2', priority: 'high' },
  { id: 'REQ-2026-0319', requester: 'خالد منصور', department: 'التسويق', category: 'هاتف جوال', reason: 'استبدال جهاز تالف', requestedAt: '18/08/2026', status: 'approved', assetName: 'Samsung Galaxy S23', priority: 'normal' },
  { id: 'REQ-2026-0318', requester: 'نورة محمد', department: 'المالية', category: 'شاشة عرض', reason: 'احتياج تشغيلي', requestedAt: '17/08/2026', status: 'assigned', assetName: 'Dell 27"', priority: 'normal' },
  { id: 'REQ-2026-0317', requester: 'عبدالله علي', department: 'المبيعات', category: 'حاسب محمول', reason: 'احتياج تشغيلي', requestedAt: '16/08/2026', status: 'rejected', assetName: 'Dell XPS 15', priority: 'normal' },
];
