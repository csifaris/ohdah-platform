import { AlertTriangle, ClipboardCheck, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CustodyRequest } from '../../features/custody';
import type { MaintenanceRequest } from '../../features/maintenance';

export function PendingRequests({
  pendingCustody = [],
  maintenanceRequests = [],
}: {
  pendingCustody?: CustodyRequest[];
  maintenanceRequests?: MaintenanceRequest[];
}) {
  const navigate = useNavigate();

  const openMaintenance = maintenanceRequests.filter((m) => m.status === 'open');

  type ActionTone = 'primary' | 'warning' | 'danger';

  const actionItems: Array<{
    id: string;
    title: string;
    description: string;
    action: string;
    route: string;
    icon: typeof ClipboardCheck;
    tone: ActionTone;
  }> = [
    ...pendingCustody.map((req) => ({
      id: req.id,
      title: `طلب عهدة جديد: ${req.assetName || req.category || 'أصل'}`,
      description: `الموظف: ${req.requester} · ${req.department}`,
      action: 'مراجعة واعتماد',
      route: `/admin/custody/requests/${req.id}`,
      icon: ClipboardCheck,
      tone: 'primary' as ActionTone,
    })),
    ...openMaintenance.map((m) => ({
      id: m.id,
      title: `طلب صيانة: ${m.assetName || 'أصل'}`,
      description: `المشكلة: ${m.issue} · ${m.employee}`,
      action: 'بدء الصيانة',
      route: `/admin/maintenance`,
      icon: Wrench,
      tone: 'warning' as ActionTone,
    })),
  ];

  return (
    <section className="rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-[#F59E0B]" size={21} />
          <h2 className="text-lg font-bold text-[#071426]">مركز الإجراءات</h2>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-sm ${actionItems.length > 0 ? 'bg-[#DC2626]' : 'bg-[#059669]'}`}>
          {actionItems.length} مهام
        </span>
      </div>
      <div className="space-y-3">
        {actionItems.slice(0, 4).map(({ id, title, description, action, route, icon: Icon, tone }) => (
          <article
            className={`rounded-xl border p-4 transition-colors cursor-pointer ${
              tone === 'danger'
                ? 'border-red-200 bg-red-50/70 hover:bg-red-100/70'
                : tone === 'warning'
                ? 'border-amber-200 bg-amber-50/70 hover:bg-amber-100/70'
                : 'border-[#D9E2EC] bg-[#F8FAFC] hover:bg-[#FFF7E6]'
            }`}
            key={id}
            onClick={() => navigate(route)}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  tone === 'danger'
                    ? 'bg-red-100 text-[#DC2626]'
                    : tone === 'warning'
                    ? 'bg-amber-100 text-[#F59E0B]'
                    : 'bg-[#062B78] text-[#D4AF37]'
                }`}
              >
                <Icon size={17} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#071426]">{title}</h3>
                <p className="mb-2 mt-1 text-xs text-[#64748B]">{description}</p>
                <button
                  className={`text-xs font-bold hover:underline ${
                    tone === 'danger' ? 'text-[#DC2626]' : tone === 'warning' ? 'text-[#B7791F]' : 'text-[#062B78]'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(route);
                  }}
                >
                  {action}
                </button>
              </div>
            </div>
          </article>
        ))}
        {actionItems.length === 0 && (
          <div className="rounded-xl border border-dashed border-[#D9E2EC] p-6 text-center text-xs text-[#64748B]">
            لا توجد مهام أو طلبات معلقة بانتظار المراجعة.
          </div>
        )}
      </div>
      <button
        onClick={() => navigate('/admin/custody/requests')}
        className="mt-4 w-full rounded-xl border border-[#D9E2EC] py-2.5 text-sm font-bold text-[#64748B] hover:bg-[#F8FAFC]"
      >
        عرض طلبات العهد المعلقة
      </button>
    </section>
  );
}
