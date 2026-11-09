/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';
import { FileWarning, Wrench } from 'lucide-react';
import { MaintenanceTable, type MaintenanceRequest } from '../features/maintenance';
import { listMaintenance, deleteMaintenance } from '../services/maintenance.service';
import { getApiErrorMessage } from '../services/api';
import { useEmployee } from '../hooks/useEmployee';
import { Link, useNavigate } from 'react-router-dom';

export function EmployeeMaintenancePage() {
  const { employee } = useEmployee();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = useCallback(() => {
    if (!employee) return;
    setLoading(true);
    listMaintenance()
      .then((data) => {
        setRequests(data.filter((r) => r.requestedById === employee.id || r.employee === employee.name));
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [employee]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف طلب الصيانة هذا؟')) return;
    try {
      await deleteMaintenance(id);
      setRequests(requests.filter((r) => r.id !== id));
    } catch (err) {
      alert(getApiErrorMessage(err, 'تعذر حذف الطلب. قد يكون قيد المعالجة.'));
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-primary">طلباتي</p>
          <h1 className="text-3xl font-bold">طلبات الصيانة</h1>
          <p className="mt-2 text-sm text-muted">متابعة حالة طلبات الصيانة للأصول الخاصة بك</p>
        </div>
        <Link
          to="/portal/maintenance/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
        >
          <Wrench size={17} />
          طلب صيانة جديد
        </Link>
      </div>
      
      {error && <p className="rounded-lg bg-red-50 p-4 text-sm text-danger">{error}</p>}
      
      <div className="rounded-2xl border border-border bg-white p-4 shadow-soft sm:p-6">
        <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
          <Wrench className="text-primary" size={24} />
          <h2 className="text-lg font-bold">قائمة الطلبات</h2>
        </div>
        
        {loading ? (
          <p className="rounded-lg bg-surface p-4 text-center text-sm text-muted">
            جاري تحميل طلبات الصيانة...
          </p>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center text-muted">
             <FileWarning size={48} className="mb-4 text-slate-300" />
             <p className="text-lg font-semibold text-ink">لا توجد طلبات صيانة</p>
             <p className="text-sm">لم تقم برفع أي طلبات صيانة للعهد الخاصة بك.</p>
          </div>
        ) : (
          <MaintenanceTable 
            requests={requests} 
            isEmployee={true}
            onOpen={(req) => navigate(`/portal/maintenance/${req.id}`)} 
            onDelete={handleDelete}
          />
        )}
      </div>
    </section>
  );
}
