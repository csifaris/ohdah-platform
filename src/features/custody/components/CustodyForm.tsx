import { useState, type ChangeEvent, type FormEvent } from 'react';
import { CalendarDays, CheckCircle2, PackageSearch, Save, UserRound } from 'lucide-react';
import type { CustodyRecord } from '../types';
import { HandoverChecklist } from './HandoverChecklist';

type AvailableAssetOption = { id: string; name: string; serialNumber?: string; category?: string; status?: string };
type EmployeeOption = { id: string; name: string; department?: string; employeeNumber?: string };

type CustodyFormProps = {
  availableAssets?: AvailableAssetOption[];
  employees?: EmployeeOption[];
  onSaved: (record: Partial<CustodyRecord> & { assetId?: string; employeeId?: string; handoverNotes?: string }) => void;
  onCancel: () => void;
};

export function CustodyForm({ availableAssets = [], employees = [], onSaved, onCancel }: CustodyFormProps) {
  const [selectedAssetId, setSelectedAssetId] = useState(availableAssets[0]?.id || '');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0]?.id || '');
  const [form, setForm] = useState({
    assetText: '',
    employeeText: '',
    condition: 'ممتازة',
    notes: ''
  });
  const [checked, setChecked] = useState(['الجهاز الرئيسي', 'الشاحن']);
  const [error, setError] = useState('');

  const selectedAsset = availableAssets.find((a) => a.id === selectedAssetId) || availableAssets[0];
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId) || employees[0];

  const update = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (checked.length < 2) {
      setError('يرجى استكمال عناصر قائمة التحقق الأساسية');
      return;
    }

    const assetId = selectedAsset?.id || selectedAssetId;
    const employeeId = selectedEmployee?.id || selectedEmployeeId;

    if (!assetId && availableAssets.length > 0) {
      setError('يرجى اختيار أصل متاح للتسليم');
      return;
    }

    onSaved({
      id: `OH-${Date.now().toString().slice(-6)}`,
      assetId: assetId || 'AST-2026-005',
      assetName: selectedAsset?.name || form.assetText || 'MacBook Pro M2',
      category: selectedAsset?.category || 'أجهزة تقنية',
      employeeId: employeeId,
      employee: selectedEmployee?.name || form.employeeText || 'أحمد محمد',
      department: selectedEmployee?.department || 'تقنية المعلومات',
      assignedAt: new Date().toLocaleDateString('ar-SA'),
      status: 'active',
      dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('ar-SA'),
      notes: form.notes,
      handoverNotes: form.notes
    });
  };

  return (
    <form className="space-y-6" onSubmit={submit} noValidate>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-primary">التسليم والاستلام</p>
          <h1 className="text-3xl font-bold">تسليم عهدة</h1>
          <p className="mt-2 text-sm text-muted">إنشاء عملية تسليم أصل متاح وتوثيق استلام الموظف</p>
        </div>
        <div className="flex gap-3">
          <button className="rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary-light" onClick={onCancel} type="button">
            إلغاء
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90" type="submit">
            <Save size={17} />
            تأكيد التسليم
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-danger" role="alert">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-white p-6 shadow-soft">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
            <PackageSearch className="text-primary" size={20} />
            بيانات الأصل (الأصول المتاحة فقط)
          </h2>
          {availableAssets.length > 0 ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium">اختيار الأصل المتاح</span>
              <select
                className="w-full rounded-lg border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
              >
                {availableAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.serialNumber || asset.id})
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="block">
              <span className="mb-2 block text-sm font-medium">اسم الأصل</span>
              <input
                className="w-full rounded-lg border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                name="assetText"
                onChange={update}
                value={form.assetText}
                placeholder="أدخل اسم الأصل..."
              />
            </label>
          )}

          {selectedAsset && (
            <div className="mt-4 rounded-lg border border-border bg-surface p-4">
              <p className="font-semibold">{selectedAsset.name}</p>
              <p className="mt-1 text-xs text-muted">
                {selectedAsset.id} {selectedAsset.serialNumber ? `· ${selectedAsset.serialNumber}` : ''}
              </p>
              <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-success">
                متاح للتسليم (AVAILABLE)
              </span>
            </div>
          )}
        </section>

        <section className="rounded-xl border border-border bg-white p-6 shadow-soft">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
            <UserRound className="text-primary" size={20} />
            بيانات الموظف المستلم
          </h2>
          {employees.length > 0 ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium">اختيار الموظف</span>
              <select
                className="w-full rounded-lg border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} {emp.department ? `(${emp.department})` : ''}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="block">
              <span className="mb-2 block text-sm font-medium">اسم الموظف</span>
              <input
                className="w-full rounded-lg border border-border bg-surface px-3 py-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                name="employeeText"
                onChange={update}
                value={form.employeeText}
                placeholder="أدخل اسم الموظف..."
              />
            </label>
          )}

          {selectedEmployee && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-primary">
                {selectedEmployee.name.slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold">{selectedEmployee.name}</p>
                <p className="text-xs text-muted">{selectedEmployee.department || '—'}</p>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-border bg-white p-6 shadow-soft">
        <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
          <CheckCircle2 className="text-primary" size={20} />
          حالة الأصل عند التسليم
        </h2>
        <div className="flex flex-wrap gap-5">
          {['ممتازة', 'جيدة', 'تحتاج صيانة'].map((condition) => (
            <label className="flex items-center gap-2 text-sm" key={condition}>
              <input
                checked={form.condition === condition}
                className="h-4 w-4 text-primary focus:ring-primary"
                name="condition"
                onChange={() => setForm((current) => ({ ...current, condition }))}
                type="radio"
              />
              {condition}
            </label>
          ))}
        </div>
        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-medium">ملاحظات التسليم</span>
          <textarea
            className="w-full rounded-lg border border-border bg-surface p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            name="notes"
            onChange={update}
            placeholder="أضف أي ملاحظات تخص عملية التسليم هنا..."
            rows={3}
            value={form.notes}
          />
        </label>
      </section>

      <HandoverChecklist checked={checked} onChange={setChecked} />

      <div className="flex items-center gap-2 rounded-lg bg-surface p-4 text-sm text-muted">
        <CalendarDays size={17} />
        تاريخ التسليم: {new Date().toLocaleDateString('ar-SA')} · سيتم إرسال إشعار للموظف بعد التأكيد.
      </div>
    </form>
  );
}
