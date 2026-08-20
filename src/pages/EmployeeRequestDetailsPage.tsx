import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, ClipboardList } from 'lucide-react';
import { CustodyStatusBadge, type CustodyRequest } from '../features/custody';
import { listCustodyRequests, replyCustodyRequest } from '../services/custody.service';
import { getApiErrorMessage } from '../services/api';
import { useEmployee } from '../hooks/useEmployee';
import { RequestTimeline } from '../components/RequestTimeline';

export function EmployeeRequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { employee } = useEmployee();
  
  const [request, setRequest] = useState<CustodyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!employee || !id) return;
    listCustodyRequests()
      .then((data) => {
        const found = data.find((r) => r.id === id && r.requesterId === employee.id);
        if (found) {
          setRequest(found);
        } else {
          setError('لم يتم العثور على الطلب.');
        }
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [employee, id]);

  const formatId = (reqId: string) => `REQ-${reqId.slice(0, 5).toUpperCase()}`;

  if (loading) {
    return <div className="p-8 text-center text-muted">جاري تحميل تفاصيل الطلب...</div>;
  }

  if (error || !request) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-red-50 p-6 text-center text-danger">{error}</div>
        <button onClick={() => navigate('/portal/requests')} className="text-primary hover:underline">العودة للطلبات</button>
      </div>
    );
  }

  return (
    <section className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/portal/requests" className="rounded-lg p-2 text-muted hover:bg-surface">
          <ArrowRight size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">تفاصيل الطلب {formatId(request.id)}</h1>
          <p className="text-sm text-muted mt-1">متابعة حالة الطلب ومساره</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
          <ClipboardList className="text-primary" size={24} />
          <h2 className="text-lg font-bold">معلومات الطلب</h2>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div>
            <p className="text-xs text-muted mb-1">نوع الأصل</p>
            <p className="font-semibold">{request.category}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">تاريخ الطلب</p>
            <p className="font-semibold">{request.requestedAt}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">الحالة</p>
            <div><CustodyStatusBadge request status={request.status} /></div>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">سبب الطلب</p>
            <p className="font-semibold">{request.reason}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h3 className="text-sm font-semibold mb-6">مسار الطلب</h3>
          <RequestTimeline request={request} />
        </div>

        {request.status === 'rejected' && request.rejectionReason && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-6">
            <h3 className="text-sm font-bold text-danger mb-2">سبب الرفض:</h3>
            <p className="text-sm text-danger mb-4">{request.rejectionReason}</p>
            
            {request.employeeReply ? (
              <div className="mt-4 border-t border-red-200 pt-4">
                <h4 className="text-xs font-bold text-danger mb-1">ردك:</h4>
                <p className="text-sm text-danger">{request.employeeReply}</p>
              </div>
            ) : (
              <form 
                className="mt-4" 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const reply = (form.elements.namedItem('reply') as HTMLTextAreaElement).value;
                  if (!reply.trim()) return;
                  try {
                    const updated = await replyCustodyRequest(request.id, reply);
                    setRequest(updated);
                  } catch {
                    alert('تعذر إرسال الرد');
                  }
                }}
              >
                <textarea 
                  name="reply"
                  required
                  rows={3} 
                  placeholder="اكتب ردك هنا..." 
                  className="w-full rounded-lg border border-red-200 bg-white p-3 text-sm focus:border-danger focus:outline-none"
                />
                <div className="mt-2 flex justify-end">
                  <button type="submit" className="rounded-lg bg-danger px-4 py-2 text-sm font-semibold text-white hover:bg-danger/90">إرسال الرد</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
