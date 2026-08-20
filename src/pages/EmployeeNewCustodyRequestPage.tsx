import { useState, type FormEvent } from 'react';
import { CalendarDays, FilePlus2, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEmployee } from '../hooks/useEmployee';
import { createCustodyRequest } from '../services/custody.service';
import { getApiErrorMessage } from '../services/api';

export function EmployeeNewCustodyRequestPage() {
  const navigate = useNavigate();
  const { employee, loading: employeeLoading } = useEmployee();
  
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    category: 'جهاز كمبيوتر',
    reason: 'احتياج تشغيلي',
    priority: 'high',
    assetName: '',
    date: '',
    details: '',
    notes: '',
  });

  const update = (name: string, value: string) =>
    setForm((current) => ({ ...current, [name]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!employee) {
      setError('تعذر تحميل بيانات الموظف. يرجى تحديث الصفحة.');
      return;
    }
    if (!form.category || !form.reason) {
      setError('يرجى تعبئة الحقول المطلوبة');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      await createCustodyRequest({
        requesterId: employee.id,
        category: form.category,
        reason: form.reason,
        description: form.details,
        // The backend DTO doesn't include assetName and notes directly, but we can pass them in description if needed or as additional fields if the backend accepts them.
      });
      setSuccess('تم إنشاء الطلب بنجاح. سيتم توجيهه للموافقة.');
      setTimeout(() => navigate('/portal'), 2000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'فشل في إنشاء الطلب'));
    } finally {
      setSubmitting(false);
    }
  };

  if (employeeLoading) {
    return <div className="p-8 text-center text-muted">جاري تحميل البيانات...</div>;
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-primary">العهد</p>
          <h1 className="text-3xl font-bold">طلب عهدة جديدة</h1>
          <p className="mt-2 text-sm text-muted">
            قدم طلبك للحصول على أصل جديد وسيتم مراجعته من الإدارة
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-muted hover:bg-surface"
            onClick={() => navigate('/portal')}
            type="button"
          >
            <X size={16} className="inline ml-1" />
            إلغاء
          </button>
          <button
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
            disabled={submitting}
            type="submit"
          >
            <Send size={16} />
            {submitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
          </button>
        </div>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-sm text-success" role="status">
          {success}
        </div>
      )}
      
      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-danger" role="alert">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-white p-6 shadow-soft">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-semibold">
              <FilePlus2 className="text-primary" size={20} />
              بيانات الطلب
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="نوع العهدة"
                value={form.category}
                onChange={(value) => update('category', value)}
                options={['جهاز كمبيوتر', 'هاتف جوال', 'شاشة عرض', 'سيارة', 'أخرى']}
              />
              <Select
                label="سبب الطلب"
                value={form.reason}
                onChange={(value) => update('reason', value)}
                options={['موظف جديد', 'استبدال جهاز تالف', 'احتياج تشغيلي', 'أخرى']}
              />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-white p-6 shadow-soft">
            <h2 className="mb-5 text-lg font-semibold">تفاصيل الطلب</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="الأصل المطلوب (اختياري)"
                placeholder="مثال: MacBook Pro M2"
                value={form.assetName}
                onChange={(value) => update('assetName', value)}
              />
              <label className="block">
                <span className="mb-2 block text-sm font-medium">التاريخ المطلوب</span>
                <span className="relative block">
                  <CalendarDays className="absolute right-3 top-3 text-muted" size={17} />
                  <input
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 pr-10 text-sm"
                    onChange={(event) => update('date', event.target.value)}
                    type="date"
                    value={form.date}
                  />
                </span>
              </label>
            </div>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium">تفاصيل إضافية</span>
              <textarea
                className="w-full rounded-lg border border-border bg-surface p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                onChange={(event) => update('details', event.target.value)}
                placeholder="أحتاج جهازاً بمعالج قوي لتشغيل برامج التصميم..."
                rows={4}
                value={form.details}
              />
            </label>
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-white p-6 shadow-soft lg:sticky lg:top-6">
          <h2 className="mb-5 border-b border-border pb-4 text-lg font-semibold">ملخص الطلب</h2>
          <Summary label="الموظف" value={employee?.name || '—'} />
          <Summary label="نوع العهدة" value={form.category} />
          <Summary label="الحالة" value="مسودة" />
          <p className="mt-5 rounded-lg bg-surface p-3 text-xs leading-5 text-muted">
            سيتم إرسال الطلب إلى الإدارة للموافقة، ثم توجيهه للصرف بناءً على التوفر.
          </p>
        </aside>
      </div>
    </form>
  );
}

function Field({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <input
        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">{label}</span>
      <select
        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
