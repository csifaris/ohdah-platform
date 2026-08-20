import { useState } from 'react';
import { Building, Save, Shield } from 'lucide-react';

export function AdminSettingsPage() {
  const [orgName, setOrgName] = useState('منصة عُهدة لإدارة الأصول');
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [requireMFA, setRequireMFA] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">التهيئة العامة</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]" style={{ fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" }}>
            إعدادات النظام وسياسات الأمان
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">
            تكوين سياسات المؤسسة، ضوابط الجلسات، ومعايير الأمان المتقدمة.
          </p>
        </div>
      </div>

      {saved && (
        <div className="rounded-xl bg-green-50 p-4 text-sm font-semibold text-[#059669]">
          تم حفظ إعدادات النظام بنجاح.
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organization Profile */}
        <section className="rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D9E2EC] pb-3">
            <Building className="text-[#062B78]" size={20} />
            <h2 className="text-base font-bold text-[#071426]">بيانات المنشأة والمؤسسة</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 block">
              <span className="text-xs font-bold text-[#071426]">اسم المؤسسة:</span>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] p-3 text-sm text-[#071426] outline-none focus:border-[#062B78]"
              />
            </label>
            <label className="space-y-1.5 block">
              <span className="text-xs font-bold text-[#071426]">المنطقة الزمنية:</span>
              <select className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] p-3 text-sm text-[#071426] outline-none focus:border-[#062B78]">
                <option value="Asia/Riyadh">توقيت الرياض (GMT+3)</option>
              </select>
            </label>
          </div>
        </section>

        {/* Security & Sessions */}
        <section className="rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D9E2EC] pb-3">
            <Shield className="text-[#062B78]" size={20} />
            <h2 className="text-base font-bold text-[#071426]">سياسات الأمان والجلسات</h2>
          </div>
          <div className="space-y-4">
            <label className="space-y-1.5 block max-w-sm">
              <span className="text-xs font-bold text-[#071426]">مدة انتهاء الجلسة التلقائية (بالدقائق):</span>
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] p-3 text-sm text-[#071426] outline-none focus:border-[#062B78]"
              />
            </label>

            <div className="pt-2 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requireMFA}
                  onChange={(e) => setRequireMFA(e.target.checked)}
                  className="h-4 w-4 rounded border-[#D9E2EC] text-[#062B78] focus:ring-[#062B78]"
                />
                <span className="text-xs font-bold text-[#071426]">
                  فرض التحقق الثنائي (MFA) لكافة الحسابات الإدارية
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowRegistration}
                  onChange={(e) => setAllowRegistration(e.target.checked)}
                  className="h-4 w-4 rounded border-[#D9E2EC] text-[#062B78] focus:ring-[#062B78]"
                />
                <span className="text-xs font-bold text-[#071426]">
                  السماح بالتسجيل الذاتي للموظفين الجدد عبر البوابة
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-[#062B78] px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#071426]"
          >
            <Save size={17} />
            حفظ التغييرات
          </button>
        </div>
      </form>
    </div>
  );
}
