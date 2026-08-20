import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, CheckCircle2, Eye, Search, X, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CustodyRequest } from '../features/custody';
import { getApiErrorMessage } from '../services/api';
import { listAdminCustodyRequests, adminApproveCustodyRequest, adminRejectCustodyRequest } from '../services/custody.service';

export function AssetManagerCustodyRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<CustodyRequest[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'assigned'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Rejection Modal
  const [rejectingReq, setRejectingReq] = useState<CustodyRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submittingReject, setSubmittingReject] = useState(false);

  const fetchRequests = () => {
    listAdminCustodyRequests()
      .then((data) => setRequests(data))
      .catch((err: unknown) => setError(getApiErrorMessage(err, 'تعذر تحميل طلبات العهد.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filtered = useMemo(() => {
    return requests.filter((req) => {
      const matchSearch =
        search === '' ||
        [req.requester, req.department, req.category, req.reason, req.id, req.rejectionReason]
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchFilter = filter === 'all' || req.status === filter;
      return matchSearch && matchFilter;
    });
  }, [filter, requests, search]);

  const handleApprove = async (id: string) => {
    try {
      await adminApproveCustodyRequest(id);
      setSuccess('تم اعتماد طلب العهدة بنجاح، يمكنك الآن صرف وتخصيص الأصل للموظف.');
      fetchRequests();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'تعذر اعتماد الطلب.'));
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingReq) return;
    if (!rejectionReason.trim()) {
      setError('يرجى كتابة سبب الرفض.');
      return;
    }

    setSubmittingReject(true);
    setError('');
    try {
      await adminRejectCustodyRequest(rejectingReq.id, rejectionReason.trim());
      setSuccess(`تم رفض طلب العهدة رقم REQ-${rejectingReq.id.slice(0, 5).toUpperCase()} وإشعار الموظف بالسبب.`);
      setRejectingReq(null);
      setRejectionReason('');
      fetchRequests();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'تعذر رفض الطلب.'));
    } finally {
      setSubmittingReject(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">طلبات الموظفين</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]" style={{ fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" }}>
            إدارة ومراجعة طلبات العهد
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">
            مراجعة طلبات العهد الجديدة، دراسة المبررات، الاعتماد، وإسناد الأصول.
          </p>
        </div>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-[#DC2626]" role="alert">{error}</div>}
      {success && <div className="rounded-xl bg-green-50 p-4 text-sm font-semibold text-[#059669]" role="status">{success}</div>}

      {/* Filter Tabs & Search */}
      <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                filter === 'all' ? 'bg-[#062B78] text-white' : 'border border-[#D9E2EC] bg-white text-[#64748B]'
              }`}
            >
              كافة الطلبات ({requests.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                filter === 'pending' ? 'bg-[#062B78] text-white' : 'border border-[#D9E2EC] bg-white text-[#64748B]'
              }`}
            >
              بانتظار الموافقة ({requests.filter((r) => r.status === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                filter === 'approved' ? 'bg-[#062B78] text-white' : 'border border-[#D9E2EC] bg-white text-[#64748B]'
              }`}
            >
              معتمدة بانتظار الصرف ({requests.filter((r) => r.status === 'approved').length})
            </button>
            <button
              onClick={() => setFilter('assigned')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                filter === 'assigned' ? 'bg-[#062B78] text-white' : 'border border-[#D9E2EC] bg-white text-[#64748B]'
              }`}
            >
              تم الصرف ({requests.filter((r) => r.status === 'assigned').length})
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                filter === 'rejected' ? 'bg-[#062B78] text-white' : 'border border-[#D9E2EC] bg-white text-[#64748B]'
              }`}
            >
              مرفوضة ({requests.filter((r) => r.status === 'rejected').length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={17} />
            <input
              type="text"
              placeholder="بحث بالموظف، الأصل، السبب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] py-2 pr-9 pl-3 text-xs text-[#071426] outline-none focus:border-[#062B78]"
            />
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto rounded-xl border border-[#D9E2EC]">
          <table className="w-full min-w-[780px] text-right text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-xs font-bold text-[#071426]">
              <tr>
                <th className="p-4">رقم الطلب</th>
                <th className="p-4">الموظف</th>
                <th className="p-4">نوع الأصل</th>
                <th className="p-4">سبب الطلب</th>
                <th className="p-4">تاريخ الطلب</th>
                <th className="p-4">الحالة وملاحظات القرار</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2EC]">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-[#FFF7E6] transition-colors">
                  <td className="p-4 font-mono text-xs font-bold text-[#062B78]">
                    REQ-{req.id.slice(0, 5).toUpperCase()}
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-[#071426]">{req.requester}</p>
                    <p className="text-xs text-[#64748B]">{req.department}</p>
                  </td>
                  <td className="p-4 font-semibold text-[#062B78]">{req.category || req.assetName}</td>
                  <td className="p-4 text-xs text-[#64748B] max-w-[220px] truncate">{req.reason}</td>
                  <td className="p-4 text-xs text-[#64748B]">{req.requestedAt}</td>
                  <td className="p-4">
                    <div>
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        req.status === 'pending'
                          ? 'bg-amber-100 text-[#F59E0B]'
                          : req.status === 'approved'
                          ? 'bg-blue-100 text-[#062B78]'
                          : req.status === 'assigned'
                          ? 'bg-emerald-100 text-[#059669]'
                          : 'bg-red-100 text-[#DC2626]'
                      }`}>
                        {req.status === 'pending'
                          ? 'بانتظار الموافقة'
                          : req.status === 'approved'
                          ? 'تمت الموافقة (جاهز للصرف)'
                          : req.status === 'assigned'
                          ? 'تم الصرف'
                          : 'مرفوض'}
                      </span>
                      {req.status === 'rejected' && req.rejectionReason && (
                        <p className="text-[11px] text-[#DC2626] font-semibold mt-1">
                          السبب: {req.rejectionReason}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => navigate(`/admin/custody/requests/${req.id}`)}
                        className="rounded-lg p-1.5 text-[#062B78] hover:bg-[#062B78]/10"
                        title="عرض كامل التفاصيل"
                      >
                        <Eye size={16} />
                      </button>

                      {req.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-bold text-[#059669] hover:bg-emerald-100"
                            title="اعتماد"
                          >
                            <CheckCircle2 size={13} />
                            اعتماد
                          </button>
                          <button
                            onClick={() => {
                              setRejectingReq(req);
                              setRejectionReason('');
                            }}
                            className="flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-2 py-1 text-xs font-bold text-[#DC2626] hover:bg-red-100"
                            title="رفض"
                          >
                            <XCircle size={13} />
                          </button>
                        </>
                      )}

                      {(req.status === 'pending' || req.status === 'approved') && (
                        <button
                          onClick={() => navigate(`/asset-manager/custody/assign?requestId=${req.id}&employeeId=${req.requesterId || ''}&category=${encodeURIComponent(req.category || '')}`)}
                          className="flex items-center gap-1 rounded-lg bg-[#062B78] px-3 py-1 text-xs font-bold text-white hover:bg-[#071426]"
                          title="صرف الأصل للموظف"
                        >
                          <ArrowLeftRight size={13} />
                          صرف
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#64748B]">
                    لا توجد طلبات عهد مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
              <p className="text-[11px] text-[#64748B]">
                سيتم إرسال هذا السبب إلى الموظف كإشعار فوري رسمي.
              </p>
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
