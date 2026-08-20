import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Wrench } from 'lucide-react';
import { MaintenanceStatusBadge, MaintenanceTimeline, type MaintenanceRequest } from '../features/maintenance';
import { listMaintenance } from '../services/maintenance.service';
import { getApiErrorMessage } from '../services/api';
import { useEmployee } from '../hooks/useEmployee';

export function EmployeeMaintenanceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { employee } = useEmployee();
  
  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!employee || !id) return;
    listMaintenance()
      .then((data) => {
        const found = data.find((r) => r.id === id && (r.requestedById === employee.id || r.employee === employee.name));
        if (found) {
          setRequest(found);
        } else {
          setError('لم يتم العثور على طلب الصيانة.');
        }
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [employee, id]);

  const formatId = (reqId: string) => `MNT-${reqId.slice(0, 5).toUpperCase()}`;

  if (loading) {
    return <div className="p-8 text-center text-muted">جاري تحميل تفاصيل الصيانة...</div>;
  }

  if (error || !request) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-red-50 p-6 text-center text-danger">{error}</div>
        <button onClick={() => navigate('/portal/maintenance')} className="text-primary hover:underline">العودة لطلبات الصيانة</button>
      </div>
    );
  }

  return (
    <section className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/portal/maintenance" className="rounded-lg p-2 text-muted hover:bg-surface">
          <ArrowRight size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">تفاصيل طلب الصيانة {formatId(request.id)}</h1>
          <p className="text-sm text-muted mt-1">متابعة حالة طلب الصيانة</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
          <Wrench className="text-primary" size={24} />
          <h2 className="text-lg font-bold">معلومات الطلب</h2>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div>
            <p className="text-xs text-muted mb-1">الأصل</p>
            <p className="font-semibold">{request.assetName || request.assetType}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">تاريخ الطلب</p>
            <p className="font-semibold">{request.requestedAt}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">الحالة</p>
            <div><MaintenanceStatusBadge status={request.status} /></div>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">وصف المشكلة</p>
            <p className="font-semibold">{request.issue}</p>
          </div>
        </div>

        <div className="my-5 space-y-2 rounded-lg bg-surface p-4 text-sm">
          <p><span className="text-muted">الفني المخصص: </span>{request.technician !== '—' ? request.technician : 'لم يحدد بعد'}</p>
          <p><span className="text-muted">التكلفة المتوقعة: </span>{request.cost !== '—' ? request.cost + ' SAR' : 'غير محددة'}</p>
          {request.assetId && <p><span className="text-muted">معرف الأصل: </span>{request.assetId.slice(0, 8).toUpperCase()}</p>}
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 mt-6">
          <h3 className="text-sm font-semibold mb-6">مسار الطلب</h3>
          <MaintenanceTimeline />
        </div>
      </div>
    </section>
  );
}
