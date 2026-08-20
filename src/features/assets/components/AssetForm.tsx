import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { CheckSquare, FileText, ImagePlus, LucideIcon, MapPin, Package, Save, Trash2, X } from 'lucide-react';
import type { Asset } from '../types';

type AssetFormProps = {
  initialAsset?: Asset;
  categories?: string[];
  onCancel: () => void;
  onSaved: (asset: Asset) => void;
};

export function AssetForm({ initialAsset, categories, onCancel, onSaved }: AssetFormProps) {
  const defaultCategories = ['أجهزة حاسب', 'أجهزة مكتبية', 'أثاث مكتبي', 'المركبات والآليات', 'أخرى'];
  const categoryOptions = categories && categories.length > 0 ? categories : defaultCategories;

  const [form, setForm] = useState({
    name: initialAsset?.name ?? '',
    assetCode: initialAsset?.assetCode ?? initialAsset?.id ?? '',
    category: initialAsset?.category ?? categoryOptions[0],
    serialNumber: initialAsset?.serialNumber ?? '',
    manufacturer: initialAsset?.manufacturer ?? '',
    model: initialAsset?.model ?? '',
    department: initialAsset?.department ?? '',
    purchaseDate: initialAsset?.purchaseDate ?? '',
    status: initialAsset?.status ?? 'available',
    location: initialAsset?.location ?? '',
    notes: initialAsset?.notes ?? '',
    image: initialAsset?.image ?? '',
  });
  const [error, setError] = useState('');

  const update = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الصورة يجب ألا يتجاوز 5 ميجابايت.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, image: '' }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setError('يرجى إدخال اسم الأصل.');
      return;
    }
    if (!form.assetCode.trim()) {
      setError('يرجى إدخال كود الأصل.');
      return;
    }
    if (!form.serialNumber.trim()) {
      setError('يرجى إدخال الرقم التسلسلي.');
      return;
    }
    if (!form.category.trim()) {
      setError('يرجى اختيار تصنيف الأصل.');
      return;
    }

    setError('');
    const asset: Asset = {
      ...(initialAsset ?? {
        id: `AST-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`,
        assignee: 'غير مخصص',
        warranty: 'غير محدد',
        lastMaintenance: '—',
        condition: 'جديدة',
      }),
      ...form,
    };
    onSaved(asset);
  };

  return (
    <form className="space-y-6" onSubmit={submit} noValidate>
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">إدارة الأصول</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]">{initialAsset ? 'تعديل الأصل' : 'إضافة أصل جديد'}</h1>
          <p className="mt-1.5 text-sm text-[#64748B]">إنشاء وتحديث سجل الأصل في المؤسسة</p>
        </div>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 rounded-xl border border-[#D9E2EC] bg-white px-5 py-2.5 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC]"
            onClick={onCancel}
            type="button"
          >
            <X size={16} />
            إلغاء
          </button>
          <button
            className="flex items-center gap-2 rounded-xl bg-[#062B78] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#071426]"
            type="submit"
          >
            <Save size={16} />
            حفظ الأصل
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-[#DC2626]" role="alert">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <FormSection icon={Package} title="بيانات الأصل الأساسية">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="اسم الأصل" name="name" onChange={update} placeholder="أدخل اسم الأصل" value={form.name} required />
              <Field label="كود الأصل (رقم الأصل)" name="assetCode" onChange={update} placeholder="مثال: AST-001" value={form.assetCode} required />
              <Field label="الرقم التسلسلي" name="serialNumber" onChange={update} placeholder="أدخل الرقم التسلسلي" value={form.serialNumber} required />
              <SelectField
                label="التصنيف"
                name="category"
                onChange={update}
                value={form.category}
                options={categoryOptions.map((cat) => ({ value: cat, label: cat }))}
                required
              />
              <Field label="الشركة المصنعة" name="manufacturer" onChange={update} placeholder="مثال: Apple, Dell, HP" value={form.manufacturer} />
              <Field label="القسم" name="department" onChange={update} placeholder="مثال: تقنية المعلومات" value={form.department} />
              <Field label="تاريخ الشراء" name="purchaseDate" type="date" onChange={update} placeholder="" value={form.purchaseDate} />
              <SelectField
                label="الحالة"
                name="status"
                onChange={update}
                value={form.status}
                options={[
                  { value: 'available', label: 'متاحة' },
                  { value: 'active', label: 'نشطة' },
                  { value: 'maintenance', label: 'في الصيانة' },
                  { value: 'retired', label: 'مستبعدة' },
                ]}
                required
              />
            </div>
          </FormSection>

          <FormSection icon={MapPin} title="الموقع وصورة الأصل">
            <Field label="الموقع" name="location" onChange={update} placeholder="المبنى الرئيسي، الطابق الثاني" value={form.location} />
            <div className="mt-4">
              <span className="mb-2 block text-sm font-semibold text-[#071426]">صورة الأصل (JPG, PNG, WEBP)</span>
              {form.image ? (
                <div className="relative inline-block overflow-hidden rounded-xl border border-[#D9E2EC]">
                  <img src={form.image} alt="معاينة الأصل" className="h-48 w-full max-w-sm object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 left-2 flex items-center gap-1 rounded-lg bg-[#DC2626] px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-red-700"
                  >
                    <Trash2 size={14} />
                    حذف الصورة
                  </button>
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#D9E2EC] bg-[#F8FAFC] px-6 py-8 text-center transition hover:border-[#D4AF37]">
                  <ImagePlus className="mx-auto text-[#64748B]" size={32} />
                  <p className="mt-2 text-sm font-bold text-[#062B78]">اضغط لاختيار صورة الأصل</p>
                  <p className="mt-1 text-xs text-[#64748B]">صيغ JPG, PNG, WEBP حتى 5MB</p>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </FormSection>

          <FormSection icon={FileText} title="ملاحظات الأصل (اختياري)">
            <textarea
              className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] p-3.5 text-sm text-[#071426] placeholder-[#64748B] outline-none focus:border-[#062B78] focus:ring-1 focus:ring-[#062B78]"
              name="notes"
              onChange={update}
              placeholder="اكتب أي ملاحظات أو تفاصيل إضافية عن الأصل..."
              rows={4}
              value={form.notes}
            />
          </FormSection>
        </div>

        <aside className="h-fit rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft lg:sticky lg:top-6">
          <h2 className="mb-5 border-b border-[#D9E2EC] pb-4 text-lg font-bold text-[#071426]">ملخص الأصل</h2>
          <div className="space-y-4 text-sm">
            <Summary label="الاسم" value={form.name || 'لم يحدد بعد'} />
            <Summary label="كود الأصل" value={form.assetCode || 'لم يحدد بعد'} />
            <Summary label="الرقم التسلسلي" value={form.serialNumber || 'لم يحدد بعد'} />
            <Summary label="التصنيف" value={form.category} />
            <Summary label="الشركة المصنعة" value={form.manufacturer || '—'} />
            <Summary label="القسم" value={form.department || '—'} />
            <Summary label="الموقع" value={form.location || '—'} />
            <Summary
              label="الحالة"
              value={
                form.status === 'available'
                  ? 'متاحة'
                  : form.status === 'active'
                  ? 'نشطة'
                  : form.status === 'maintenance'
                  ? 'في الصيانة'
                  : 'مستبعدة'
              }
            />
          </div>
          <div className="mt-6 flex items-start gap-2 rounded-xl bg-[#F8FAFC] border border-[#D9E2EC] p-3.5 text-xs leading-5 text-[#64748B]">
            <CheckSquare className="mt-0.5 shrink-0 text-[#062B78]" size={15} />
            الحقول الإلزامية: الاسم، كود الأصل، الرقم التسلسلي، التصنيف، الحالة.
          </div>
        </aside>
      </div>
    </form>
  );
}

function FormSection({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft">
      <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-[#071426]">
        <Icon className="text-[#062B78]" size={20} />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  name,
  value,
  placeholder,
  onChange,
  required = false,
  type = 'text',
}: {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#071426]">
        {label}
        {required && <span className="text-[#DC2626]"> *</span>}
      </span>
      <input
        type={type}
        className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#071426] placeholder-[#64748B] outline-none focus:border-[#062B78] focus:ring-1 focus:ring-[#062B78]"
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        value={value}
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  options,
  onChange,
  required = false,
}: {
  label: string;
  name: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#071426]">
        {label}
        {required && <span className="text-[#DC2626]"> *</span>}
      </span>
      <select
        className="w-full rounded-xl border border-[#D9E2EC] bg-white px-3.5 py-2.5 text-sm text-[#071426] outline-none focus:border-[#062B78] focus:ring-1 focus:ring-[#062B78]"
        name={name}
        onChange={onChange}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#D9E2EC] pb-3">
      <span className="text-[#64748B]">{label}</span>
      <span className="text-left font-bold text-[#071426]">{value}</span>
    </div>
  );
}
