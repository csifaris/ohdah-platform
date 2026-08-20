import { Eye, MoreVertical } from 'lucide-react';
import type { CustodyRecord } from '../types';
import { CustodyStatusBadge } from './CustodyStatusBadge';

export function CustodyTable({ records, onOpen }: { records: CustodyRecord[]; onOpen: (record: CustodyRecord) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#D9E2EC]">
      <table className="w-full min-w-[900px] text-right">
        <thead className="border-b border-[#D9E2EC] bg-[#F8FAFC] text-xs font-bold uppercase tracking-wider text-[#071426]">
          <tr>
            {['رقم العهدة', 'اسم الأصل', 'التصنيف', 'الموظف', 'القسم', 'تاريخ التسليم', 'الحالة', 'الإجراءات'].map((heading) => (
              <th className="px-4 py-4" key={heading}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D9E2EC] bg-white text-sm">
          {records.map((record) => (
            <tr
              className="cursor-pointer transition-colors hover:bg-[#FFF7E6]"
              key={record.id}
              onClick={() => onOpen(record)}
            >
              <td className="px-4 py-4 font-mono text-xs font-bold text-[#062B78]">{record.id}</td>
              <td className="px-4 py-4 font-semibold text-[#071426]">{record.assetName}</td>
              <td className="px-4 py-4 text-[#64748B]">{record.category}</td>
              <td className="px-4 py-4 text-[#071426]">{record.employee}</td>
              <td className="px-4 py-4 text-[#64748B]">{record.department}</td>
              <td className="px-4 py-4 text-[#64748B]">{record.assignedAt}</td>
              <td className="px-4 py-4"><CustodyStatusBadge status={record.status} /></td>
              <td className="px-4 py-4 text-center">
                <button
                  aria-label={`عرض ${record.id}`}
                  className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#062B78]/10 hover:text-[#062B78]"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpen(record);
                  }}
                  type="button"
                >
                  <Eye size={16} />
                </button>
                <button
                  aria-label={`خيارات ${record.id}`}
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
      {records.length === 0 && <div className="bg-white px-6 py-14 text-center text-sm text-[#64748B]">لا توجد عهد مطابقة للفلاتر الحالية.</div>}
    </div>
  );
}
