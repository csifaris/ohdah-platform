import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, ArrowLeft, ArrowLeftRight, Boxes, CheckCircle2, ClipboardList, Package, Wrench, X, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/dashboard/StatCard';
import { listAssets } from '../services/assets.service';
import { listCustody, listAdminCustodyRequests, adminApproveCustodyRequest, adminRejectCustodyRequest } from '../services/custody.service';
import { listMaintenance } from '../services/maintenance.service';
import type { Asset } from '../features/assets';
import type { CustodyRecord, CustodyRequest } from '../features/custody';
import type { MaintenanceRequest } from '../features/maintenance';
import { getApiErrorMessage } from '../services/api';

export function AssetManagerDashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [custodyRecords, setCustodyRecords] = useState<CustodyRecord[]>([]);
  const [pendingRequests, setPendingRequests] = useState<CustodyRequest[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Rejection modal
  const [rejectingReq, setRejectingReq] = useState<CustodyRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  const loadData = () => {
    Promise.all([
      listAssets().catch(() => []),
      listCustody().catch(() => []),
      listAdminCustodyRequests('PENDING').catch(() => []),
      listMaintenance().catch(() => []),
    ])
      .then(([asts, custs, reqs, maints]) => {
        setAssets(asts);
        setCustodyRecords(custs);
        setPendingRequests(reqs);
        setMaintenanceRequests(maints);
      })
      .catch((err: unknown) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalAssets = assets.length;
  const availableAssets = assets.filter((a) => a.status === 'available').length;
  const assignedAssets = custodyRecords.filter((c) => c.status === 'active').length;
  const maintenanceAssets = assets.filter((a) => a.status === 'maintenance').length;
  const newRequestsCount = pendingRequests.length;

  const handleApprove = async (id: string) => {
    try {
      await adminApproveCustodyRequest(id);
      setSuccess('تمت الموافقة على طلب العهدة بنجاح.');
      loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر اعتماد الطلب.'));
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReq || !rejectionReason.trim()) return;
    setSubmittingReject(true);
    setError('');
    try {
      await adminRejectCustodyRequest(rejectingReq.id, rejectionReason.trim());
      setSuccess(`تم رفض طلب العهدة رقم REQ-${rejectingReq.id.slice(0, 5).toUpperCase()} وإشعار الموظف.`);
      setRejectingReq(null);
      setRejectionReason('');
      loadData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر رفض الطلب.'));
    } finally {
      setSubmittingReject(false);
    }
  };

  // Inventory breakdown per category
  const categoriesStock = assets.reduce<Record<string, { total: number; available: number }>>((acc, a) => {
    const cat = a.category || 'غير مصنف';
    if (!acc[cat]) acc[cat] = { total: 0, available: 0 };
    acc[cat].total += 1;
    if (a.status === 'available') acc[cat].available += 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* SaaS Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#D4AF37] bg-white p-6 shadow-soft sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">بوابة العمليات والتشغيل</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]" style={{ fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" }}>
            لوحة تحكم مدير الأصول
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">إدارة ومتابعة حركة الأصول اليومية، طلبات العهد، وعمليات الصيانة.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            className="flex items-center justify-center gap-2 rounded-xl bg-[#062B78] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#071426]"
            onClick={() => navigate('/asset-manager/custody/assign')}
          >
            <ArrowLeftRight size={18} />
            تسليم عهدة جديدة
          </button>
          <button
            className="flex items-center justify-center gap-2 rounded-xl border border-[#D9E2EC] bg-white px-4 py-3 font-bold text-[#071426] shadow-sm transition hover:bg-[#F8FAFC]"
            onClick={() => navigate('/asset-manager/inventory')}
          >
            <Package size={18} className="text-[#062B78]" />
            فحص المخزون
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-[#DC2626]" role="alert">{error}</div>}
      {success && <div className="rounded-xl bg-green-50 p-4 text-sm font-semibold text-[#059669]" role="status">{success}</div>}

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="إجمالي الأصول"
          value={loading ? '—' : String(totalAssets)}
          icon={Boxes}
          tone="primary"
        />
        <StatCard
          label="الأصول المتاحة"
          value={loading ? '—' : String(availableAssets)}
          icon={Package}
          tone="success"
        />
        <StatCard
          label="الأصول المسلمة"
          value={loading ? '—' : String(assignedAssets)}
          icon={Activity}
          tone="tertiary"
        />
        <StatCard
          label="أصول تحت الصيانة"
          value={loading ? '—' : String(maintenanceAssets)}
          icon={Wrench}
          tone={maintenanceAssets > 0 ? 'danger' : 'tertiary'}
        />
        <StatCard
          label="طلبات عهد جديدة"
          value={loading ? '—' : String(newRequestsCount)}
          icon={ClipboardList}
          tone={newRequestsCount > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Main Grid: Pending Requests & Inventory Alerts */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Latest Custody Requests (2 cols) */}
        <section className="rounded-2xl border border-[#D9E2EC] bg-white shadow-soft xl:col-span-2 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex flex-col gap-2 border-b border-[#D9E2EC] p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#071426]">آخر طلبات العهد</h2>
                <p className="mt-0.5 text-xs text-[#64748B]">طلبات واردة من الموظفين بحاجة إلى مراجعة وصرف</p>
              </div>
              <button
                onClick={() => navigate('/asset-manager/custody/requests')}
                className="text-xs font-bold text-[#062B78] hover:underline"
              >
                عرض كل الطلبات ({pendingRequests.length})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-right text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-xs font-bold text-[#071426]">
                  <tr className="h-12">
                    <th className="p-4">الموظف</th>
                    <th className="p-4">نوع الأصل المطلوب</th>
                    <th className="p-4">سبب الطلب</th>
                    <th className="p-4">تاريخ الطلب</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2EC]">
                  {pendingRequests.slice(0, 5).map((req) => (
                    <tr key={req.id} className="h-14 hover:bg-[#FFF7E6] transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-[#071426]">{req.requester}</p>
                        <p className="text-xs text-[#64748B]">{req.department}</p>
                      </td>
                      <td className="p-4 font-semibold text-[#062B78]">{req.category || req.assetName}</td>
                      <td className="p-4 text-xs text-[#64748B] max-w-[200px] truncate">{req.reason}</td>
                      <td className="p-4 text-xs text-[#64748B]">{req.requestedAt}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#059669] hover:bg-emerald-100"
                            title="موافقة"
                          >
                            <CheckCircle2 size={14} />
                            موافقة
                          </button>
                          <button
                            onClick={() => navigate(`/asset-manager/custody/assign?requestId=${req.id}&category=${encodeURIComponent(req.category || '')}`)}
                            className="flex items-center gap-1 rounded-lg bg-[#062B78]/10 px-2.5 py-1 text-xs font-bold text-[#062B78] hover:bg-[#062B78]/20"
                            title="صرف أصل"
                          >
                            <ArrowLeftRight size={14} />
                            صرف
                          </button>
                          <button
                            onClick={() => {
                              setRejectingReq(req);
                              setRejectionReason('');
                            }}
                            className="flex items-center gap-1 rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-[#DC2626] hover:bg-red-100"
                            title="رفض"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {pendingRequests.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-[#64748B]">
                        لا توجد طلبات عهد جديدة معلقة بانتظار الاعتماد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={() => navigate('/asset-manager/custody/requests')}
            className="flex w-full items-center justify-center gap-2 border-t border-[#D9E2EC] py-3 text-sm font-bold text-[#062B78] hover:bg-[#F8FAFC]"
          >
            إدارة كافة طلبات العهد <ArrowLeft size={16} />
          </button>
        </section>

        {/* Inventory Capacity & Alerts (1 col) */}
        <section className="rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-[#D9E2EC] pb-4 mb-4">
              <AlertTriangle className="text-[#D4AF37]" size={20} />
              <h2 className="text-lg font-bold text-[#071426]">تنبيهات المخزون</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(categoriesStock).map(([catName, stats]) => {
                const isLow = stats.available === 0;
                return (
                  <div key={catName} className="rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] p-3.5">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="text-[#071426]">{catName}</span>
                      <span className={isLow ? 'text-[#DC2626]' : 'text-[#059669]'}>
                        {stats.available} متاح / {stats.total} إجمالي
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isLow ? 'bg-[#DC2626]' : 'bg-[#062B78]'}`}
                        style={{ width: `${Math.round((stats.available / (stats.total || 1)) * 100)}%` }}
                      />
                    </div>
                    {isLow && (
                      <p className="text-[11px] font-semibold text-[#DC2626] mt-1.5">
                        تحذير: لا توجد أجهزة متاحة للتسليم في هذا التصنيف
                      </p>
                    )}
                  </div>
                );
              })}
              {Object.keys(categoriesStock).length === 0 && (
                <p className="text-xs text-[#64748B] text-center py-6">لا توجد أصول مسجلة بالمخزون حالياً.</p>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/asset-manager/inventory')}
            className="mt-4 w-full rounded-xl border border-[#D9E2EC] py-2.5 text-xs font-bold text-[#062B78] hover:bg-[#F8FAFC]"
          >
            استعراض سجل المخزون الكامل
          </button>
        </section>
      </div>

      {/* Latest Maintenance Requests */}
      <section className="rounded-2xl border border-[#D9E2EC] bg-white shadow-soft overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-[#D9E2EC] p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#071426]">آخر بلاغات الصيانة</h2>
            <p className="mt-0.5 text-xs text-[#64748B]">متابعة الأجهزة المتعطلة وتحديث مسار معالجتها</p>
          </div>
          <button
            onClick={() => navigate('/asset-manager/maintenance')}
            className="text-xs font-bold text-[#062B78] hover:underline"
          >
            عرض جميع طلبات الصيانة ({maintenanceRequests.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-right text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-xs font-bold text-[#071426]">
              <tr className="h-12">
                <th className="p-4">رقم البلاغ</th>
                <th className="p-4">الأصل</th>
                <th className="p-4">الموظف المبلغ</th>
                <th className="p-4">المشكلة</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2EC]">
              {maintenanceRequests.slice(0, 5).map((m) => (
                <tr key={m.id} className="h-14 hover:bg-[#FFF7E6] transition-colors">
                  <td className="p-4 font-mono text-xs font-bold text-[#062B78]">{m.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-4 font-semibold text-[#071426]">{m.assetName}</td>
                  <td className="p-4 text-xs text-[#071426]">{m.employee}</td>
                  <td className="p-4 text-xs text-[#64748B] max-w-[250px] truncate">{m.issue}</td>
                  <td className="p-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      m.status === 'open'
                        ? 'bg-amber-100 text-[#F59E0B]'
                        : m.status === 'in_progress'
                        ? 'bg-blue-100 text-[#062B78]'
                        : 'bg-emerald-100 text-[#059669]'
                    }`}>
                      {m.status === 'open' ? 'جديد' : m.status === 'in_progress' ? 'قيد المعالجة' : 'مكتمل'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => navigate('/asset-manager/maintenance')}
                      className="rounded-lg bg-[#062B78] px-3 py-1 text-xs font-bold text-white hover:bg-[#071426]"
                    >
                      معالجة
                    </button>
                  </td>
                </tr>
              ))}
              {maintenanceRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-[#64748B]">
                    لا توجد بلاغات صيانة مفتوحة حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reject Request Modal */}
      {rejectingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleRejectSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-3">
              <h3 className="text-base font-bold text-[#DC2626]">رفض طلب العهدة</h3>
              <button
                type="button"
                onClick={() => setRejectingReq(null)}
                className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#64748B]">
              الموظف: <span className="font-bold text-[#071426]">{rejectingReq.requester}</span> — الأصل: <span className="font-bold text-[#071426]">{rejectingReq.category}</span>
            </p>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#071426]">
                رفض الطلب - سبب الرفض <span className="text-[#DC2626]">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="مثال: الأصل غير متوفر حالياً أو لا توجد صلاحية للتسليم"
                className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] p-3 text-sm text-[#071426] outline-none focus:border-[#DC2626]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingReq(null)}
                className="rounded-xl border border-[#D9E2EC] px-4 py-2 text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC]"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={submittingReject || !rejectionReason.trim()}
                className="flex items-center gap-2 rounded-xl bg-[#DC2626] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
              >
                {submittingReject ? 'جاري الرفض...' : 'تأكيد رفض الطلب'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
