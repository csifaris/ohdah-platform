import { useEffect, useState } from 'react';
import { FileWarning, ClipboardList, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CustodyStatusBadge, type CustodyRequest } from '../features/custody';
import { listCustodyRequests, deleteCustodyRequest } from '../services/custody.service';
import { getApiErrorMessage } from '../services/api';
import { useEmployee } from '../hooks/useEmployee';

export function EmployeeRequestsPage() {
  const navigate = useNavigate();
  const { employee } = useEmployee();
  const [requests, setRequests] = useState<CustodyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!employee) return;
    listCustodyRequests()
      .then((data) => {
        setRequests(data.filter((r) => r.requesterId === employee.id));
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [employee]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    try {
      await deleteCustodyRequest(id);
      setRequests((items) => items.filter((req) => req.id !== id));
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر حذف الطلب.'));
    }
  };

  const formatId = (id: string) => `REQ-${id.slice(0, 5).toUpperCase()}`;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-primary">طلباتي</p>
          <h1 className="text-3xl font-bold">طلبات العهدة</h1>
          <p className="mt-2 text-sm text-muted">متابعة حالة طلبات العهدة الخاصة بك</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/portal/requests/new')}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
            type="button"
          >
            <Plus size={17} /> طلب عهدة جديدة
          </button>
        </div>
      </div>
      
      {error && <p className="rounded-lg bg-red-50 p-4 text-sm text-danger">{error}</p>}
      
      <div className="rounded-2xl border border-border bg-white p-4 shadow-soft sm:p-6">
        <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
          <ClipboardList className="text-primary" size={24} />
          <h2 className="text-lg font-bold">قائمة الطلبات</h2>
        </div>
        
        {loading ? (
          <p className="rounded-lg bg-surface p-4 text-center text-sm text-muted">جاري تحميل الطلبات...</p>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center text-muted">
             <FileWarning size={48} className="mb-4 text-slate-300" />
             <p className="text-lg font-semibold text-ink">لا توجد طلبات عهدة</p>
             <p className="text-sm mt-2">لم تقم بإنشاء أي طلبات حتى الآن.</p>
             <button
               onClick={() => navigate('/portal/requests/new')}
               className="mt-4 flex items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-primary-light"
               type="button"
             >
               <Plus size={16} /> تقديم طلب جديد
             </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-right">
              <thead className="border-b border-border bg-surface text-xs text-muted">
                <tr>
                  {['رقم الطلب', 'نوع الأصل', 'سبب الطلب', 'تاريخ الطلب', 'الحالة', 'الإجراءات'].map((h) => (
                    <th className="px-4 py-4" key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {requests.map((request) => (
                  <tr className="hover:bg-surface cursor-pointer" key={request.id} onClick={() => navigate(`/portal/requests/${request.id}`)}>
                    <td className="px-4 py-4 font-medium text-primary">{formatId(request.id)}</td>
                    <td className="px-4 py-4">
                      {request.category}
                      <p className="text-xs text-muted">{request.assetName || '—'}</p>
                    </td>
                    <td className="px-4 py-4 max-w-xs truncate">{request.reason}</td>
                    <td className="px-4 py-4 text-muted">{request.requestedAt}</td>
                    <td className="px-4 py-4">
                      <CustodyStatusBadge request status={request.status} />
                    </td>
                    <td className="px-4 py-4">
                      {request.status === 'pending' && (
                        <button
                          onClick={(e) => handleDelete(e, request.id)}
                          className="rounded p-1.5 text-danger hover:bg-red-50"
                          title="حذف الطلب"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
