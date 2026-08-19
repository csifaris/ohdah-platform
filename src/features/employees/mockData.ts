import type { Employee } from './types';
export const mockEmployees: Employee[] = [
  { id: 'EMP-1025', name: 'أحمد محمد عبدالله', email: 'ahmed.m@ohdah.sa', department: 'تقنية المعلومات', branch: 'المركز الرئيسي - الرياض', jobTitle: 'مهندس نظم أول', activeAssets: 5, lastHandover: '12/08/2023', status: 'active', phone: '+966 50 123 4567' },
  { id: 'EMP-1042', name: 'سارة خالد', email: 'sara.k@ohdah.sa', department: 'الموارد البشرية', branch: 'فرع جدة', jobTitle: 'أخصائي توظيف', activeAssets: 2, lastHandover: '05/01/2024', status: 'active', phone: '+966 55 321 7788' },
  { id: 'EMP-1108', name: 'فهد العتيبي', email: 'fahad.o@ohdah.sa', department: 'المبيعات', branch: 'فرع الدمام', jobTitle: 'مدير مبيعات إقليمي', activeAssets: 0, lastHandover: '22/11/2022', status: 'on_leave', phone: '+966 54 876 1108' },
  { id: 'EMP-1150', name: 'نورة محمد', email: 'noura.m@ohdah.sa', department: 'المالية', branch: 'المركز الرئيسي - الرياض', jobTitle: 'محاسب أول', activeAssets: 3, lastHandover: '14/03/2024', status: 'active', phone: '+966 56 777 9012' },
];
