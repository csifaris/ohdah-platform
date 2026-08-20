import { Eye, MoreVertical } from 'lucide-react';
import type { Employee } from '../types';

export function EmployeeTable({ employees, onOpen }: { employees: Employee[]; onOpen: (employee: Employee) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#D9E2EC]">
      <table className="w-full min-w-[1050px] text-right">
        <thead className="border-b border-[#D9E2EC] bg-[#F8FAFC] text-xs font-bold uppercase tracking-wider text-[#071426]">
          <tr>
            {['الموظف', 'الرقم الوظيفي', 'القسم', 'الفرع', 'المسمى الوظيفي', 'البريد الإلكتروني', 'العهد النشطة', 'آخر تسليم', 'الحالة', ''].map((heading) => (
              <th className="px-4 py-3.5" key={heading}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D9E2EC] bg-white text-sm">
          {employees.map((employee) => (
            <tr
              className="group cursor-pointer transition-colors hover:bg-[#FFF7E6]"
              key={employee.id}
              onClick={() => onOpen(employee)}
            >
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#062B78] font-bold text-white text-sm">
                    {employee.name.charAt(0)}
                  </div>
                  <span className="font-semibold text-[#071426]">{employee.name}</span>
                </div>
              </td>
              <td className="px-4 py-3.5 font-mono text-xs font-medium text-[#64748B]">{employee.id}</td>
              <td className="px-4 py-3.5 text-[#071426]">{employee.department}</td>
              <td className="px-4 py-3.5 text-[#64748B]">{employee.branch}</td>
              <td className="px-4 py-3.5 text-[#64748B]">{employee.jobTitle}</td>
              <td className="px-4 py-3.5 text-xs text-[#64748B]" dir="ltr">{employee.email}</td>
              <td className="px-4 py-3.5 text-center">
                <span className="rounded-full bg-[#062B78]/10 px-2.5 py-1 text-xs font-bold text-[#062B78]">
                  {employee.activeAssets}
                </span>
              </td>
              <td className="px-4 py-3.5 text-xs text-[#64748B]">{employee.lastHandover}</td>
              <td className="px-4 py-3.5">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${employee.status === 'active' ? 'bg-emerald-100 text-[#059669]' : 'bg-amber-100 text-[#F59E0B]'}`}>
                  {employee.status === 'active' ? 'نشط' : 'في إجازة'}
                </span>
              </td>
              <td className="px-4 py-3.5 text-center">
                <button
                  aria-label={`عرض ملف ${employee.name}`}
                  className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#062B78]/10 hover:text-[#062B78]"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpen(employee);
                  }}
                  type="button"
                >
                  <Eye size={16} />
                </button>
                <button
                  aria-label="خيارات الموظف"
                  className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F8FAFC]"
                  onClick={(event) => event.stopPropagation()}
                  type="button"
                >
                  <MoreVertical size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {employees.length === 0 && <div className="bg-white px-6 py-14 text-center text-sm text-[#64748B]">لا توجد نتائج مطابقة.</div>}
    </div>
  );
}
