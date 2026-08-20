import { Check, Eye, Plus, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustodyStatusBadge, type CustodyRequest } from '../features/custody';
import { getApiErrorMessage } from '../services/api';
import { adminApproveCustodyRequest, listAdminCustodyRequests, adminRejectCustodyRequest } from '../services/custody.service';

export function CustodyRequestsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [requests, setRequests] = useState<CustodyRequest[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    listAdminCustodyRequests().then(setRequests).catch((reason: unknown) => setError(getApiErrorMessage(reason)));
  }, []);

  const filtered = useMemo(
    () => requests.filter((r) => `${r.id} ${r.requester} ${r.assetName}`.toLowerCase().includes(search.toLowerCase())),
    [requests, search]
  );

  const update = (id: string, action: 'approve' | 'reject') => {
    if (action === 'reject') {
      const reason = prompt('سبب الرفض:');
      if (!reason) return Promise.resolve();
      return adminRejectCustodyRequest(id, reason)
        .then((updated) => setRequests((items) => items.map((item) => (item.id === id ? updated : item))))
        .catch((reason: unknown) => setError(getApiErrorMessage(reason)));
    }
    return adminApproveCustodyRequest(id)
      .then((updated) => setRequests((items) => items.map((item) => (item.id === id ? updated : item))))
      .catch((reason: unknown) => setError(getApiErrorMessage(reason)));
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">العهد</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]">طلبات العهدة</h1>
          <p className="mt-1.5 text-sm text-[#64748B]">مراجعة واعتماد طلبات الموظفين للحصول على الأصول</p>
        </div>
        <button
          className="flex items-center gap-2 rounded-xl bg-[#062B78] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#071426]"
          onClick={() => navigate('/admin/custody/requests/new')}
          type="button"
        >
          <Plus size={17} />
          طلب جديد
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-4 text-sm text-[#DC2626]" role="alert">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="إجمالي الطلبات" value={String(requests.length)} />
        <Metric label="بانتظار الموافقة" value={String(requests.filter((r) => r.status === 'pending').length)} color="text-[#F59E0B]" />
        <Metric label="تم التسليم" value={String(requests.filter((r) => r.status === 'assigned').length)} color="text-[#059669]" />
      </div>

      <div className="rounded-2xl border border-[#D9E2EC] bg-white p-4 shadow-soft sm:p-6">
        <label className="relative mb-5 block max-w-xl">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
          <input
            className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] py-2.5 pl-3 pr-10 text-sm text-[#071426] placeholder-[#64748B] outline-none focus:border-[#062B78] focus:ring-1 focus:ring-[#062B78]"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث عن طلب..."
            value={search}
          />
        </label>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-right">
            <thead className="border-b border-[#D9E2EC] bg-[#F8FAFC] text-xs font-bold uppercase tracking-wider text-[#071426]">
              <tr>
                {['رقم الطلب', 'الموظف', 'نوع الأصل', 'سبب الطلب', 'تاريخ الطلب', 'الحالة', 'الإجراءات'].map((h) => (
                  <th className="px-4 py-4" key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2EC] text-sm">
              {filtered.map((request) => (
                <tr
                  className="cursor-pointer transition-colors hover:bg-[#FFF7E6]"
                  key={request.id}
                  onClick={() => navigate(`/admin/custody/requests/${request.id}`)}
                >
                  <td className="px-4 py-4 font-mono text-xs font-bold text-[#062B78]">REQ-{request.id.slice(0, 5).toUpperCase()}</td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-[#071426]">{request.requester}</p>
                    <p className="text-xs text-[#64748B]">{request.department}</p>
                  </td>
                  <td className="px-4 py-4 text-[#071426]">
                    {request.category}
                    <p className="text-xs text-[#64748B]">{request.assetName}</p>
                  </td>
                  <td className="px-4 py-4 text-[#071426]">
                    {request.reason}
                    {request.employeeReply && (
                      <div className="mt-1 p-2 bg-red-50 text-[#DC2626] rounded text-xs border border-red-200">
                        <strong>رد الموظف:</strong> {request.employeeReply}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-[#64748B]">{request.requestedAt}</td>
                  <td className="px-4 py-4"><CustodyStatusBadge request status={request.status} /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {request.status === 'pending' && (
                        <>
                          <button
                            aria-label="اعتماد الطلب"
                            className="rounded-lg p-1.5 text-[#059669] hover:bg-emerald-50"
                            onClick={() => update(request.id, 'approve')}
                            type="button"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            aria-label="رفض الطلب"
                            className="rounded-lg p-1.5 text-[#DC2626] hover:bg-red-50"
                            onClick={() => update(request.id, 'reject')}
                            type="button"
                          >
                            <X size={16} />
                          </button>
                        </>
                      )}
                      <button
                        aria-label="عرض الطلب"
                        className="rounded-lg p-1.5 text-[#062B78] hover:bg-[#062B78]/10"
                        onClick={() => navigate(`/admin/custody/requests/${request.id}`)}
                        type="button"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value, color = 'text-[#071426]' }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-5 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold tracking-tight ${color}`}>{value}</p>
    </div>
  );
}
