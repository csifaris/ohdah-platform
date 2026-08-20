import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { FileText, Package, Save, User } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Asset } from '../features/assets';
import type { Employee } from '../features/employees';
import { getApiErrorMessage } from '../services/api';
import { listAssets } from '../services/assets.service';
import { assignCustody, adminAssignCustodyRequest } from '../services/custody.service';
import { listEmployees } from '../services/employees.service';

function getDefaultDates() {
  const today = new Date();
  const due = new Date();
  due.setDate(due.getDate() + 30);
  return {
    today: today.toISOString().split('T')[0],
    due: due.toISOString().split('T')[0],
  };
}

export function AssetManagerAssignCustodyPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAssetId = searchParams.get('assetId') || '';
  const preselectedRequestId = searchParams.get('requestId') || '';
  const preselectedCategory = searchParams.get('category') || '';

  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assetId, setAssetId] = useState(preselectedAssetId);
  const [employeeId, setEmployeeId] = useState('');
  const [assignedAt, setAssignedAt] = useState(() => getDefaultDates().today);
  const [dueDate, setDueDate] = useState(() => getDefaultDates().due);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      listAssets({ status: 'AVAILABLE' }).catch(() => []),
      listEmployees().catch(() => []),
    ])
      .then(([asts, emps]) => {
        setAvailableAssets(asts);
        setEmployees(emps);
        if (preselectedAssetId) {
          setAssetId(preselectedAssetId);
        } else if (asts.length > 0) {
          if (preselectedCategory) {
            const match = asts.find((a) => a.category === preselectedCategory);
            setAssetId(match ? match.id : asts[0].id);
          } else {
            setAssetId(asts[0].id);
          }
        }
        if (emps.length > 0) {
          setEmployeeId(emps[0].id);
        }
      })
      .catch((err: unknown) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [preselectedAssetId, preselectedCategory]);

  const selectedAsset = useMemo(() => {
    return availableAssets.find((a) => a.id === assetId);
  }, [assetId, availableAssets]);

  const selectedEmployee = useMemo(() => {
    return employees.find((e) => e.id === employeeId);
  }, [employeeId, employees]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!assetId) {
      setError('يرجى اختيار أصل متاح للتسليم.');
      return;
    }
    if (!employeeId && !preselectedRequestId) {
      setError('يرجى اختيار الموظف المستلم.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      if (preselectedRequestId) {
        // Link to specific employee custody request
        await adminAssignCustodyRequest(preselectedRequestId, assetId, dueDate);
      } else {
        // Direct operational assignment
        await assignCustody({
          assetId,
          employeeId,
          assignedAt,
          dueAt: dueDate,
          dueDate: dueDate,
          notes: notes.trim() || undefined,
        });
      }
      navigate('/asset-manager/custody', { replace: true });
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'تعذر تسليم العهدة. تأكد من أن الأصل متاح.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">تسليم وإسناد العهد</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]" style={{ fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" }}>
            صرف وتسليم عهدة جديدة
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">
            إسناد أصل متاح بالمخزن إلى موظف وتحديد تاريخ الاستحقاق لتحديث حالته إلى نشطة.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-[#DC2626]" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-[#D9E2EC] bg-white p-12 text-center text-sm text-[#64748B]">
          جاري تحميل بيانات الأصول المتاحة والموظفين...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Step 1: Select Asset */}
            <section className="rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft space-y-4">
              <div className="flex items-center gap-2 border-b border-[#D9E2EC] pb-3">
                <Package className="text-[#062B78]" size={20} />
                <h2 className="text-base font-bold text-[#071426]">1. اختيار الأصل المتاح</h2>
              </div>

              {availableAssets.length === 0 ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-[#B7791F]">
                  لا توجد أصول بحالة "متاح" (AVAILABLE) بالمستودع حالياً. يرجى إضافة أصل جديد أو استرجاع عهدة سابقة.
                </div>
              ) : (
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-[#071426]">
                    الأصل المطلوب صرفه <span className="text-[#DC2626]">*</span>
                  </span>
                  <select
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] p-3 text-sm text-[#071426] outline-none focus:border-[#062B78]"
                    required
                  >
                    {availableAssets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} ({asset.assetCode}) — {asset.category}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {selectedAsset && (
                <div className="rounded-xl bg-[#F8FAFC] border border-[#D9E2EC] p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">كود الأصل:</span>
                    <span className="font-mono font-bold text-[#062B78]">{selectedAsset.assetCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">الرقم التسلسلي:</span>
                    <span className="font-mono text-[#071426]">{selectedAsset.serialNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">الموقع الحالي:</span>
                    <span className="text-[#071426]">{selectedAsset.location || 'المستودع الرئيسي'}</span>
                  </div>
                </div>
              )}
            </section>

            {/* Step 2: Select Employee & Dates */}
            <section className="rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft space-y-4">
              <div className="flex items-center gap-2 border-b border-[#D9E2EC] pb-3">
                <User className="text-[#062B78]" size={20} />
                <h2 className="text-base font-bold text-[#071426]">2. بيانات المستلم وتاريخ الاستحقاق</h2>
              </div>

              {preselectedRequestId ? (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-xs space-y-1">
                  <p className="font-bold text-[#062B78]">إسناد للطلب رقم: REQ-{preselectedRequestId.slice(0, 5).toUpperCase()}</p>
                  <p className="text-[#64748B]">سيتم ربط الأصل بالطلب واعتماده وتغيير حالته إلى "تم الصرف".</p>
                </div>
              ) : (
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-[#071426]">
                    الموظف المستلم <span className="text-[#DC2626]">*</span>
                  </span>
                  <select
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] p-3 text-sm text-[#071426] outline-none focus:border-[#062B78]"
                    required
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} — {emp.department} ({emp.jobTitle})
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {selectedEmployee && !preselectedRequestId && (
                <div className="rounded-xl bg-[#F8FAFC] border border-[#D9E2EC] p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">القسم:</span>
                    <span className="font-bold text-[#071426]">{selectedEmployee.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">المسمى الوظيفي:</span>
                    <span className="font-bold text-[#071426]">{selectedEmployee.jobTitle}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-[#071426]">تاريخ التسليم</span>
                  <input
                    type="date"
                    value={assignedAt}
                    onChange={(e) => setAssignedAt(e.target.value)}
                    className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] p-2.5 text-xs text-[#071426] outline-none focus:border-[#062B78]"
                    required
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-bold text-[#071426]">تاريخ الاستحقاق (افتراضي 30 يوم)</span>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] p-2.5 text-xs text-[#071426] outline-none focus:border-[#062B78]"
                    required
                  />
                </label>
              </div>
            </section>
          </div>

          {/* Notes */}
          <section className="rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="text-[#062B78]" size={18} />
              <h3 className="text-sm font-bold text-[#071426]">ملاحظات التسليم والتسليم الفعلي</h3>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب أي ملاحظات تتعلق بحالة الأصل عند التسليم أو الرقم الإداري..."
              className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] p-3 text-sm text-[#071426] outline-none focus:border-[#062B78]"
            />
          </section>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/asset-manager/custody')}
              className="rounded-xl border border-[#D9E2EC] bg-white px-5 py-3 text-sm font-bold text-[#64748B] hover:bg-[#F8FAFC]"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving || availableAssets.length === 0}
              className="flex items-center gap-2 rounded-xl bg-[#062B78] px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#071426] disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'جاري إتمام التسليم...' : 'تأكيد وصرف العهدة'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
