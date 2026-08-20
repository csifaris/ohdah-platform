import { Eye, MoreVertical, Trash2 } from 'lucide-react';
import type { MaintenanceRequest } from '../types';
import { MaintenanceStatusBadge } from './MaintenanceStatusBadge';

export function MaintenanceTable({ requests, onOpen, isEmployee, onDelete }: { requests: MaintenanceRequest[]; onOpen: (request: MaintenanceRequest) => void; isEmployee?: boolean; onDelete?: (id: string) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#D9E2EC]">
      <table className="w-full min-w-[1000px] text-right">
        <thead className="border-b border-[#D9E2EC] bg-[#F8FAFC] text-xs font-bold uppercase tracking-wider text-[#071426]">
          <tr>
            {['رقم الطلب', 'الأصل', 'رقم الأصل', 'الموظف', 'المشكلة', 'تاريخ الطلب', ...(isEmployee ? [] : ['الفني']), 'الحالة', 'الإجراءات'].map((heading) => (
              <th className="px-4 py-4" key={heading}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D9E2EC] bg-white text-sm">
          {requests.map((request) => (
            <tr
              className="cursor-pointer transition-colors hover:bg-[#FFF7E6]"
              key={request.id}
              onClick={() => onOpen(request)}
            >
              <td className="px-4 py-3 font-mono text-xs font-bold text-[#062B78]">{request.id}</td>
              <td className="px-4 py-3 font-semibold text-[#071426]">{request.assetName || request.assetType}</td>
              <td className="px-4 py-3 text-xs text-[#64748B]">{request.assetId ? request.assetId.slice(0, 8).toUpperCase() : '—'}</td>
              <td className="px-4 py-3 text-[#071426]">{request.employee}</td>
              <td className="max-w-40 truncate px-4 py-3 text-[#64748B]">{request.issue}</td>
              <td className="px-4 py-3 text-[#64748B]">{request.requestedAt}</td>
              {!isEmployee && <td className="px-4 py-3 text-[#071426]">{request.technician}</td>}
              <td className="px-4 py-3"><MaintenanceStatusBadge status={request.status} /></td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <button
                    aria-label="عرض تفاصيل الطلب"
                    className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#062B78]/10 hover:text-[#062B78]"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpen(request);
                    }}
                    type="button"
                  >
                    <Eye size={16} />
                  </button>
                  {isEmployee && request.status === 'open' && onDelete && (
                    <button
                      aria-label="حذف الطلب"
                      className="rounded-lg p-1.5 text-[#DC2626] hover:bg-red-50"
                      onClick={(event) => {
                        event.stopPropagation();
                        onDelete(request.id);
                      }}
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  {!isEmployee && (
                    <button
                      aria-label="خيارات الطلب"
                      className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F8FAFC]"
                      onClick={(event) => event.stopPropagation()}
                      type="button"
                    >
                      <MoreVertical size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {requests.length === 0 && <div className="bg-white px-6 py-14 text-center text-sm text-[#64748B]">لا توجد طلبات مطابقة.</div>}
    </div>
  );
}
