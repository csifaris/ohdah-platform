import { useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw, Search, X } from 'lucide-react';
import type { MaintenanceRequest } from '../features/maintenance';
import { getApiErrorMessage } from '../services/api';
import { listMaintenance, updateMaintenance } from '../services/maintenance.service';
import { exportToCSV } from '../utils/cn';

export function AssetManagerMaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'completed' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Status Modal
  const [selectedReq, setSelectedReq] = useState<MaintenanceRequest | null>(null);
  const [newStatus, setNewStatus] = useState<string>('in_progress');
  const [technician, setTechnician] = useState('');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchMaintenance = () => {
    listMaintenance()
      .then((data) => setRequests(data))
      .catch((err: unknown) => setError(getApiErrorMessage(err, 'تعذر تحميل طلبات الصيانة.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        search === '' ||
        [r.assetName, r.employee, r.issue, r.id, r.technician]
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, search, statusFilter]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;
    setUpdating(true);
    setError('');
    try {
      await updateMaintenance(selectedReq.id, {
        status: newStatus.toUpperCase(),
        technician: technician.trim() || undefined,
        notes: notes.trim() || undefined,
        repairNotes: notes.trim() || undefined,
      });
      setSuccess(`تم تحديث مسار الصيانة للبلاغ رقم ${selectedReq.id.slice(0, 8).toUpperCase()} بنجاح.`);
      setSelectedReq(null);
      fetchMaintenance();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'تعذر تحديث طلب الصيانة.'));
    } finally {
      setUpdating(false);
    }
  };

  const handleExport = () => {
    const headers = ['رقم الطلب', 'الأصل', 'الموظف', 'المشكلة', 'الفني', 'الحالة', 'تاريخ الطلب'];
    const rows = filtered.map((r) => [r.id, r.assetName, r.employee, r.issue, r.technician, r.status, r.requestedAt]);
    exportToCSV('إدارة_عمليات_الصيانة', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">الصيانة والدعم الفني</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]" style={{ fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" }}>
            إدارة طلبات وأعمال الصيانة
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">
            متابعة بلاغات الأعطال، تكليف الفنيين، وتحديث حالة المعدات حتى اكتمال الإصلاح.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-xl border border-[#D9E2EC] bg-white px-4 py-2.5 text-sm font-bold text-[#071426] hover:bg-[#F8FAFC]"
        >
          <Download size={16} className="text-[#062B78]" />
          تصدير التقرير
        </button>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-[#DC2626]" role="alert">{error}</div>}
      {success && <div className="rounded-xl bg-green-50 p-4 text-sm font-semibold text-[#059669]" role="status">{success}</div>}

      {/* KPI Counters */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">إجمالي البلاغات</p>
          <p className="mt-2 text-2xl font-bold text-[#071426]">{requests.length}</p>
        </div>
        <div className="rounded-xl border border-[#D9E2EC] border-t-4 border-t-[#F59E0B] bg-white p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">بلاغات جديدة (مفتوحة)</p>
          <p className="mt-2 text-2xl font-bold text-[#F59E0B]">
            {requests.filter((r) => r.status === 'open').length}
          </p>
        </div>
        <div className="rounded-xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">قيد المعالجة والإصلاح</p>
          <p className="mt-2 text-2xl font-bold text-[#062B78]">
            {requests.filter((r) => r.status === 'in_progress').length}
          </p>
        </div>
        <div className="rounded-xl border border-[#D9E2EC] border-t-4 border-t-[#059669] bg-white p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">تم الإصلاح بنجاح</p>
          <p className="mt-2 text-2xl font-bold text-[#059669]">
            {requests.filter((r) => r.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                statusFilter === 'all' ? 'bg-[#062B78] text-white' : 'border border-[#D9E2EC] bg-white text-[#64748B]'
              }`}
            >
              الكل ({requests.length})
            </button>
            <button
              onClick={() => setStatusFilter('open')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                statusFilter === 'open' ? 'bg-[#062B78] text-white' : 'border border-[#D9E2EC] bg-white text-[#64748B]'
              }`}
            >
              مفتوحة ({requests.filter((r) => r.status === 'open').length})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                statusFilter === 'in_progress' ? 'bg-[#062B78] text-white' : 'border border-[#D9E2EC] bg-white text-[#64748B]'
              }`}
            >
              قيد الإصلاح ({requests.filter((r) => r.status === 'in_progress').length})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                statusFilter === 'completed' ? 'bg-[#062B78] text-white' : 'border border-[#D9E2EC] bg-white text-[#64748B]'
              }`}
            >
              مكتملة ({requests.filter((r) => r.status === 'completed').length})
            </button>
            <button
              onClick={() => setStatusFilter('cancelled')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                statusFilter === 'cancelled' ? 'bg-[#062B78] text-white' : 'border border-[#D9E2EC] bg-white text-[#64748B]'
              }`}
            >
              ملغاة ({requests.filter((r) => r.status === 'cancelled').length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={17} />
            <input
              type="text"
              placeholder="بحث بالأصل، الموظف، الفني..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] py-2 pr-9 pl-3 text-xs text-[#071426] outline-none focus:border-[#062B78]"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#D9E2EC]">
          <table className="w-full min-w-[800px] text-right text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-xs font-bold text-[#071426]">
              <tr>
                <th className="p-4">رقم الطلب</th>
                <th className="p-4">الأصل</th>
                <th className="p-4">الموظف المبلغ</th>
                <th className="p-4">المشكلة</th>
                <th className="p-4">الفني المسؤول</th>
                <th className="p-4">تاريخ الطلب</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2EC]">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-[#FFF7E6] transition-colors">
                  <td className="p-4 font-mono text-xs font-bold text-[#062B78]">{req.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-4 font-bold text-[#071426]">{req.assetName}</td>
                  <td className="p-4 text-xs font-semibold text-[#071426]">{req.employee}</td>
                  <td className="p-4 text-xs text-[#64748B] max-w-[220px] truncate">{req.issue}</td>
                  <td className="p-4 text-xs text-[#64748B]">{req.technician || 'لم يحدد'}</td>
                  <td className="p-4 text-xs text-[#64748B]">{req.requestedAt}</td>
                  <td className="p-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      req.status === 'open'
                        ? 'bg-amber-100 text-[#F59E0B]'
                        : req.status === 'in_progress'
                        ? 'bg-blue-100 text-[#062B78]'
                        : req.status === 'completed'
                        ? 'bg-emerald-100 text-[#059669]'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {req.status === 'open'
                        ? 'جديد (مفتوح)'
                        : req.status === 'in_progress'
                        ? 'قيد الإصلاح'
                        : req.status === 'completed'
                        ? 'مكتمل'
                        : 'ملغي'}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => {
                        setSelectedReq(req);
                        setNewStatus(req.status === 'open' ? 'in_progress' : req.status);
                        setTechnician(req.technician === '—' ? '' : req.technician || '');
                        setNotes('');
                      }}
                      className="flex items-center gap-1 mx-auto rounded-lg bg-[#062B78] px-3 py-1 text-xs font-bold text-white hover:bg-[#071426]"
                    >
                      <RefreshCw size={12} />
                      تحديث المسار
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-[#64748B]">
                    لا توجد طلبات صيانة مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Maintenance Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleUpdate} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9E2EC] pb-3">
              <h3 className="text-lg font-bold text-[#071426]">تحديث مسار الصيانة</h3>
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="rounded-lg p-1 text-[#64748B] hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-[#64748B]">
              الأصل: <span className="font-bold text-[#071426]">{selectedReq.assetName}</span> (طلب {selectedReq.id.slice(0, 8).toUpperCase()})
            </p>

            <div className="space-y-3">
              <label className="block space-y-1">
                <span className="text-xs font-bold text-[#071426]">حالة الطلب:</span>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-xl border border-[#D9E2EC] bg-white p-2.5 text-sm text-[#071426] outline-none focus:border-[#062B78]"
                >
                  <option value="open">مفتوح / جديد (OPEN)</option>
                  <option value="in_progress">قيد الإصلاح والمعالجة (IN_PROGRESS)</option>
                  <option value="completed">مكتمل وتم الإصلاح (COMPLETED)</option>
                  <option value="cancelled">ملغي (CANCELLED)</option>
                </select>
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-bold text-[#071426]">الفني / ورشة الصيانة:</span>
                <input
                  type="text"
                  placeholder="اسم الفني أو الجهة المنفذة"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] p-2.5 text-sm text-[#071426] outline-none focus:border-[#062B78]"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-bold text-[#071426]">ملاحظات الإصلاح (repairNotes):</span>
                <textarea
                  rows={3}
                  placeholder="اكتب الإجراء الذي تم اتخاذه..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] p-2.5 text-sm text-[#071426] outline-none focus:border-[#062B78]"
                />
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="rounded-xl border border-[#D9E2EC] px-4 py-2 text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC]"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={updating}
                className="flex items-center gap-2 rounded-xl bg-[#062B78] px-5 py-2 text-xs font-bold text-white hover:bg-[#071426] disabled:opacity-50"
              >
                <RefreshCw size={13} className={updating ? 'animate-spin' : ''} />
                {updating ? 'جاري الحفظ...' : 'تأكيد التحديث'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
