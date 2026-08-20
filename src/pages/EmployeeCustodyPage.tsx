import { useEffect, useState } from 'react';
import { CustodyDetails, CustodyTable, type CustodyRecord } from '../features/custody';
import { getApiErrorMessage } from '../services/api';
import { listCustody } from '../services/custody.service';
import { useEmployee } from '../hooks/useEmployee';

export function EmployeeCustodyPage() {
  const { employee } = useEmployee();
  const [selected, setSelected] = useState<CustodyRecord | null>(null);
  const [records, setRecords] = useState<CustodyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!employee) return;
    listCustody()
      .then((data) => setRecords(data.filter((r) => r.employeeId === employee.id)))
      .catch((reason: unknown) => setError(getApiErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, [employee]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-primary">عهدي</p>
          <h1 className="text-3xl font-bold">العهد الحالية</h1>
          <p className="mt-2 text-sm text-muted">عرض جميع العهد المسلمة لك وحالتها</p>
        </div>
      </div>
      
      {error && <p className="rounded-lg bg-red-50 p-4 text-sm text-danger">{error}</p>}
      
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-border bg-white p-4 shadow-soft sm:p-6 xl:col-span-2">
          {loading ? (
            <p className="rounded-lg bg-surface p-4 text-center text-sm text-muted">جاري تحميل العهد...</p>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center text-muted">
               <p className="text-lg font-semibold text-ink">لا توجد عهد</p>
               <p className="text-sm mt-2">لا يوجد لديك عهد مسندة حالياً.</p>
            </div>
          ) : (
            <CustodyTable onOpen={setSelected} records={records} />
          )}
        </div>
        
        {selected ? (
          <CustodyDetails record={selected} onClose={() => setSelected(null)} />
        ) : (
          <div className="hidden rounded-2xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted xl:block">
            اختر عهدة من القائمة لعرض تفاصيلها.
          </div>
        )}
      </div>
    </section>
  );
}
