import { useState } from 'react';
import { CalendarDays } from 'lucide-react';

export function ReportFilters({
  onGenerate,
}: {
  onGenerate: (type: string, status?: string) => void;
}) {
  const [reportType, setReportType] = useState('تقرير الأصول الشامل');
  const [status, setStatus] = useState('كل الحالات');

  return (
    <section className="rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft">
      <h2 className="mb-5 text-lg font-bold text-[#071426]">بناء تقرير مخصص</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#071426]">نوع التقرير</span>
          <select
            className="w-full rounded-xl border border-[#D9E2EC] bg-white px-3.5 py-2.5 text-sm text-[#071426] outline-none focus:border-[#062B78]"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="تقرير الأصول الشامل">تقرير الأصول الشامل</option>
            <option value="حركة العهد">حركة العهد</option>
            <option value="تقارير الموظفين">تقارير الموظفين</option>
            <option value="تكاليف الصيانة">تكاليف الصيانة</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#071426]">من تاريخ</span>
          <span className="relative block">
            <CalendarDays className="absolute right-3 top-3 text-[#64748B]" size={16} />
            <input
              className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] px-3.5 py-2.5 pr-10 text-sm text-[#071426] outline-none"
              type="date"
            />
          </span>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#071426]">إلى تاريخ</span>
          <span className="relative block">
            <CalendarDays className="absolute right-3 top-3 text-[#64748B]" size={16} />
            <input
              className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] px-3.5 py-2.5 pr-10 text-sm text-[#071426] outline-none"
              type="date"
            />
          </span>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#071426]">الحالة</span>
          <select
            className="w-full rounded-xl border border-[#D9E2EC] bg-white px-3.5 py-2.5 text-sm text-[#071426] outline-none focus:border-[#062B78]"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="كل الحالات">كل الحالات</option>
            <option value="نشطة">نشطة</option>
            <option value="تحت الصيانة">تحت الصيانة</option>
            <option value="مكتملة">مكتملة</option>
          </select>
        </label>
      </div>
      <button
        className="mt-5 w-full rounded-xl bg-[#062B78] py-3 text-sm font-bold text-white transition hover:bg-[#071426]"
        onClick={() => onGenerate(reportType, status)}
        type="button"
      >
        إنشاء التقرير
      </button>
    </section>
  );
}
