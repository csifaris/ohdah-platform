import { ArrowLeft, ClipboardCheck, Eye, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CustodyRecord } from '../../features/custody';
import type { MaintenanceRequest } from '../../features/maintenance';

export function RecentActivity({
  custodyRecords = [],
  maintenanceRequests = [],
}: {
  custodyRecords?: CustodyRecord[];
  maintenanceRequests?: MaintenanceRequest[];
}) {
  const navigate = useNavigate();

  // Combine real custody handovers and maintenance requests
  const recentItems = [
    ...custodyRecords.slice(0, 4).map((c) => ({
      id: c.id,
      type: 'تسليم عهدة',
      asset: c.assetName,
      serial: c.category,
      person: c.employee,
      date: c.assignedAt,
      status: c.status === 'active' ? 'نشطة' : 'تم الإرجاع',
      icon: ClipboardCheck,
      tone: 'primary' as const,
      route: '/admin/custody',
    })),
    ...maintenanceRequests.slice(0, 3).map((m) => ({
      id: m.id,
      type: 'طلب صيانة',
      asset: m.assetName,
      serial: m.issue,
      person: m.employee,
      date: m.requestedAt,
      status: m.status === 'open' ? 'جديد' : m.status === 'in_progress' ? 'قيد المعالجة' : 'مكتمل',
      icon: Wrench,
      tone: 'warning' as const,
      route: '/admin/maintenance',
    })),
  ].slice(0, 5);

  return (
    <section className="overflow-hidden rounded-2xl border border-[#D9E2EC] bg-white shadow-soft">
      <div className="flex flex-col gap-4 border-b border-[#D9E2EC] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#071426]">أحدث المعاملات</h2>
          <p className="mt-1 text-sm text-[#64748B]">سجل العمليات الحديثة على الأصول والعهد</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin/custody')}
            className="rounded-xl bg-[#F1F5F9] px-4 py-2 text-sm font-bold text-[#062B78] hover:bg-[#062B78] hover:text-white transition-colors"
          >
            عرض سجل العهد
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-right">
          <thead className="border-b border-[#D9E2EC] bg-[#F8FAFC] text-xs font-bold uppercase tracking-wider text-[#071426]">
            <tr>
              {['رقم العملية', 'نوع العملية', 'الأصل', 'الموظف / المستلم', 'التاريخ', 'الحالة', 'إجراء'].map((heading) => (
                <th className="px-6 py-4" key={heading}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9E2EC] text-sm">
            {recentItems.map(({ id, type, asset, serial, person, date, status, icon: Icon, tone, route }) => (
              <tr
                className={`transition-colors hover:bg-[#FFF7E6] cursor-pointer ${tone === 'warning' ? 'bg-amber-50/20' : ''}`}
                key={id}
                onClick={() => navigate(route)}
              >
                <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-bold text-[#062B78]">{id}</td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="flex items-center gap-2 font-semibold text-[#071426]">
                    <Icon className={tone === 'warning' ? 'text-[#F59E0B]' : 'text-[#062B78]'} size={18} />
                    {type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="whitespace-nowrap font-semibold text-[#071426]">{asset}</p>
                  <p className="text-xs text-[#64748B]">{serial}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#062B78] text-white text-xs font-bold">{person.charAt(0)}</span>
                    <span className="text-[#071426] font-medium">{person}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-[#64748B]">{date}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${status === 'نشطة' || status === 'مكتمل' ? 'bg-emerald-100 text-[#059669]' : 'bg-amber-100 text-[#F59E0B]'}`}>
                    {status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    aria-label={`عرض ${id}`}
                    className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#062B78]/10 hover:text-[#062B78]"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(route);
                    }}
                  >
                    <Eye size={17} />
                  </button>
                </td>
              </tr>
            ))}
            {recentItems.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-sm text-[#64748B]">
                  لا توجد عمليات مسجلة حالياً.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <button
        onClick={() => navigate('/admin/reports')}
        className="flex w-full items-center justify-center gap-2 border-t border-[#D9E2EC] py-3.5 text-sm font-bold text-[#062B78] hover:bg-[#F8FAFC]"
      >
        عرض مركز التقارير الشامل <ArrowLeft size={16} />
      </button>
    </section>
  );
}
