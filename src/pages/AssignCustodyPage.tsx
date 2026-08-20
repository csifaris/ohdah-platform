import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustodyForm } from '../features/custody';
import { getApiErrorMessage } from '../services/api';
import { assignCustody } from '../services/custody.service';
import { listAssets } from '../services/assets.service';
import { listEmployees } from '../services/employees.service';
import type { Asset } from '../features/assets';
import type { Employee } from '../features/employees';

export function AssignCustodyPage() {
  const navigate = useNavigate();
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      listAssets({ status: 'AVAILABLE' }),
      listEmployees()
    ])
      .then(([assetsData, empsData]) => {
        if (active) {
          setAvailableAssets(assetsData);
          setEmployees(empsData);
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(getApiErrorMessage(reason, 'تعذر تحميل الأصول المتاحة أو قائمة الموظفين.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const save = (record: { assetId?: string; employeeId?: string; handoverNotes?: string }) => {
    setSaving(true);
    assignCustody({
      assetId: record.assetId,
      employeeId: record.employeeId,
      handoverNotes: record.handoverNotes
    })
      .then(() => navigate('/admin/custody'))
      .catch((reason: unknown) => setError(getApiErrorMessage(reason, 'تعذر تسجيل تسليم العهدة.')))
      .finally(() => setSaving(false));
  };

  return (
    <div className="space-y-4">
      {error && <p className="rounded-lg bg-red-50 p-4 text-sm text-danger" role="alert">{error}</p>}
      {saving && <p className="rounded-lg bg-surface p-4 text-sm text-muted">جاري تسجيل التسليم...</p>}
      {loading ? (
        <p className="rounded-lg bg-surface p-4 text-sm text-muted">جاري تحميل الأصول المتاحة والموظفين...</p>
      ) : (
        <CustodyForm
          availableAssets={availableAssets}
          employees={employees}
          onCancel={() => navigate('/admin/custody')}
          onSaved={save}
        />
      )}
    </div>
  );
}
