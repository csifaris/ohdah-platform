import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Image as ImageIcon, Save, X } from 'lucide-react';
import { useEmployee } from '../hooks/useEmployee';
import { createMaintenance } from '../services/maintenance.service';
import { getApiErrorMessage } from '../services/api';

export function EmployeeNewMaintenancePage() {
  const navigate = useNavigate();
  const { employee } = useEmployee();
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    assetType: '',
    otherAssetType: '',
    issue: '',
    image: '',
  });

  const assetTypes = ['كمبيوتر', 'هاتف', 'جوال', 'شاشة عرض', 'أخرى'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('صيغة الملف غير مدعومة.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.assetType) {
      setError('يرجى اختيار نوع الأصل');
      return;
    }
    
    const finalAssetType = form.assetType === 'أخرى' ? form.otherAssetType.trim() : form.assetType;
    if (form.assetType === 'أخرى' && !finalAssetType) {
      setError('يرجى كتابة نوع الأصل');
      return;
    }

    if (!form.issue.trim()) {
      setError('يرجى وصف المشكلة');
      return;
    }

    setSaving(true);
    setError('');
    
    try {
      await createMaintenance({
        assetType: finalAssetType,
        issue: form.issue,
        requestedById: employee?.id,
        ...(form.image ? { image: form.image } : {})
      });
      navigate('/portal/maintenance');
    } catch (err) {
      setError(getApiErrorMessage(err, 'تعذر إنشاء طلب الصيانة.'));
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6 max-w-3xl mx-auto">
      <div>
        <p className="mb-2 text-sm font-semibold text-primary">طلبات الصيانة</p>
        <h1 className="text-3xl font-bold">طلب صيانة جديد</h1>
        <p className="mt-2 text-sm text-muted">قم برفع طلب صيانة للأصول التي بعهدتك</p>
      </div>
      
      {error && <p className="rounded-lg bg-red-50 p-4 text-sm text-danger">{error}</p>}
      
      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-white p-6 shadow-soft space-y-6">
        <div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">نوع الأصل المعطل</span>
            <select
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
              value={form.assetType}
              onChange={(e) => setForm({ ...form, assetType: e.target.value })}
            >
              <option value="">اختر نوع الأصل...</option>
              {assetTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
        </div>

        {form.assetType === 'أخرى' && (
          <div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium">اكتب نوع الأصل</span>
              <input
                type="text"
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                placeholder="نوع الأصل..."
                value={form.otherAssetType}
                onChange={(e) => setForm({ ...form, otherAssetType: e.target.value })}
              />
            </label>
          </div>
        )}

        <div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">وصف المشكلة</span>
            <textarea
              className="w-full rounded-lg border border-border bg-surface p-3 text-sm focus:border-primary focus:outline-none"
              rows={4}
              placeholder="صف المشكلة بدقة..."
              value={form.issue}
              onChange={(e) => setForm({ ...form, issue: e.target.value })}
            />
          </label>
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium">صورة توضيحية (اختياري)</span>
          {form.image ? (
            <div className="relative inline-block">
              <img src={form.image} alt="Preview" className="h-32 rounded-lg object-cover border border-border" />
              <button
                type="button"
                onClick={() => setForm({ ...form, image: '' })}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-32 w-full rounded-lg border-2 border-dashed border-border bg-surface hover:bg-surface/80 cursor-pointer transition-colors">
              <ImageIcon className="text-muted mb-2" size={24} />
              <span className="text-sm font-semibold text-primary">إرفاق صورة</span>
              <span className="text-xs text-muted mt-1">JPG, PNG أو WEBP</span>
              <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleImageChange} />
            </label>
          )}
        </div>

        <div className="flex gap-2 border-t border-border pt-6">
          <button
            type="button"
            onClick={() => navigate('/portal/maintenance')}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted hover:bg-surface"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'جاري الحفظ...' : 'إرسال الطلب'}
          </button>
        </div>
      </form>
    </section>
  );
}
