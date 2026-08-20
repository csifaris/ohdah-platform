import { useEffect, useMemo, useState } from 'react';
import { FileSpreadsheet, Printer } from 'lucide-react';
import type { Asset } from '../features/assets';
import type { CustodyRecord } from '../features/custody';
import type { MaintenanceRequest } from '../features/maintenance';
import { getApiErrorMessage } from '../services/api';
import { listAssets } from '../services/assets.service';
import { listCustody } from '../services/custody.service';
import { listMaintenance } from '../services/maintenance.service';
import { exportToCSV, printReport } from '../utils/cn';

type ReportTab = 'assets' | 'custody' | 'inventory' | 'maintenance' | 'usage';

export function AssetManagerReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('assets');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [custodies, setCustodies] = useState<CustodyRecord[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      listAssets().catch(() => []),
      listCustody().catch(() => []),
      listMaintenance().catch(() => []),
    ])
      .then(([asts, custs, maints]) => {
        setAssets(asts);
        setCustodies(custs);
        setMaintenance(maints);
      })
      .catch((err: unknown) => setError(getApiErrorMessage(err, 'تعذر تحميل بيانات التقارير.')))
      .finally(() => setLoading(false));
  }, []);

  // Usage Aggregation (Department & Employee)
  const usageByDepartment = useMemo(() => {
    const deptMap: Record<string, { totalAssets: number; employees: Set<string>; categories: Record<string, number> }> = {};
    custodies
      .filter((c) => c.status === 'active')
      .forEach((c) => {
        const dept = c.department || 'غير محدد';
        if (!deptMap[dept]) {
          deptMap[dept] = { totalAssets: 0, employees: new Set(), categories: {} };
        }
        deptMap[dept].totalAssets += 1;
        deptMap[dept].employees.add(c.employee);
        const cat = c.category || 'أخرى';
        deptMap[dept].categories[cat] = (deptMap[dept].categories[cat] || 0) + 1;
      });
    return Object.entries(deptMap).map(([dept, data]) => ({
      department: dept,
      totalAssets: data.totalAssets,
      employeeCount: data.employees.size,
      topCategories: Object.entries(data.categories)
        .map(([name, count]) => `${name} (${count})`)
        .join('، '),
    }));
  }, [custodies]);

  // Inventory Distribution
  const inventoryCategoryStats = useMemo(() => {
    const catMap: Record<string, { total: number; available: number; active: number; maintenance: number }> = {};
    assets.forEach((a) => {
      const cat = a.category || 'غير مصنف';
      if (!catMap[cat]) catMap[cat] = { total: 0, available: 0, active: 0, maintenance: 0 };
      catMap[cat].total += 1;
      if (a.status === 'available') catMap[cat].available += 1;
      else if (a.status === 'active') catMap[cat].active += 1;
      else if (a.status === 'maintenance') catMap[cat].maintenance += 1;
    });
    return Object.entries(catMap).map(([cat, stats]) => ({
      category: cat,
      ...stats,
      utilizationRate: `${Math.round((stats.active / (stats.total || 1)) * 100)}%`,
    }));
  }, [assets]);

  const handleExportExcel = () => {
    if (activeTab === 'assets') {
      const headers = ['كود الأصل', 'اسم الأصل', 'التصنيف', 'الرقم التسلسلي', 'الموقع', 'المستلم الحالي', 'الحالة'];
      const rows = assets.map((a) => [a.assetCode, a.name, a.category, a.serialNumber, a.location, a.assignee, a.status]);
      exportToCSV('تقرير_سجل_الأصول_الشامل', headers, rows);
    } else if (activeTab === 'custody') {
      const headers = ['رقم العهدة', 'اسم الأصل', 'الموظف المستلم', 'القسم', 'تاريخ التسليم', 'تاريخ الاستحقاق', 'الحالة'];
      const rows = custodies.map((c) => [c.id, c.assetName, c.employee, c.department, c.assignedAt, c.dueDate, c.status]);
      exportToCSV('تقرير_حركة_العهد_الشامل', headers, rows);
    } else if (activeTab === 'inventory') {
      const headers = ['التصنيف', 'إجمالي الأصول', 'المتاح في المستودع', 'المسلّم كعهدة', 'تحت الصيانة', 'نسبة الاستخدام'];
      const rows = inventoryCategoryStats.map((i) => [i.category, i.total, i.available, i.active, i.maintenance, i.utilizationRate]);
      exportToCSV('تقرير_المخزون_والطاقة_الاستيعابية', headers, rows);
    } else if (activeTab === 'maintenance') {
      const headers = ['رقم البلاغ', 'الأصل', 'الموظف', 'المشكلة', 'الفني', 'الحالة', 'تاريخ الطلب'];
      const rows = maintenance.map((m) => [m.id, m.assetName, m.employee, m.issue, m.technician, m.status, m.requestedAt]);
      exportToCSV('تقرير_أعمال_وبلاغات_الصيانة', headers, rows);
    } else if (activeTab === 'usage') {
      const headers = ['القسم / الإدارة', 'إجمالي العهد المصروفة', 'عدد الموظفين المستلمين', 'أبرز الفئات المستخدمة'];
      const rows = usageByDepartment.map((u) => [u.department, u.totalAssets, u.employeeCount, u.topCategories]);
      exportToCSV('تقرير_معدلات_الاستخدام_حسب_الأقسام', headers, rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">التحليلات والتقارير التشغيلية</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]" style={{ fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" }}>
            تقارير الأصول والعهد والمخزون
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">
            تقارير تفصيلية شاملة عن دورة حياة الأصول، نسب التوزيع، كفاءة المخزون، والصيانة.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 rounded-xl bg-[#062B78] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#071426]"
          >
            <FileSpreadsheet size={16} />
            تصدير Excel (CSV)
          </button>
          <button
            onClick={printReport}
            className="flex items-center gap-2 rounded-xl border border-[#D9E2EC] bg-white px-4 py-2.5 text-sm font-bold text-[#071426] hover:bg-[#F8FAFC]"
          >
            <Printer size={16} className="text-[#DC2626]" />
            طباعة / PDF
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-[#DC2626]" role="alert">{error}</div>}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#D9E2EC] pb-2">
        <TabButton
          active={activeTab === 'assets'}
          onClick={() => setActiveTab('assets')}
          label="1. تقرير الأصول (Assets)"
          count={assets.length}
        />
        <TabButton
          active={activeTab === 'custody'}
          onClick={() => setActiveTab('custody')}
          label="2. تقرير العهد (Custody)"
          count={custodies.length}
        />
        <TabButton
          active={activeTab === 'inventory'}
          onClick={() => setActiveTab('inventory')}
          label="3. تقرير المخزون (Inventory)"
          count={inventoryCategoryStats.length}
        />
        <TabButton
          active={activeTab === 'maintenance'}
          onClick={() => setActiveTab('maintenance')}
          label="4. تقرير الصيانة (Maintenance)"
          count={maintenance.length}
        />
        <TabButton
          active={activeTab === 'usage'}
          onClick={() => setActiveTab('usage')}
          label="5. تقارير الاستخدام (Usage)"
          count={usageByDepartment.length}
        />
      </div>

      {/* Report Table Content */}
      <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft space-y-4">
        {loading ? (
          <p className="p-8 text-center text-sm text-[#64748B]">جاري تجهيز بيانات التقرير...</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#D9E2EC]">
            {/* 1. Asset Report */}
            {activeTab === 'assets' && (
              <table className="w-full min-w-[750px] text-right text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-xs font-bold text-[#071426]">
                  <tr>
                    <th className="p-4">كود الأصل</th>
                    <th className="p-4">اسم الأصل</th>
                    <th className="p-4">التصنيف</th>
                    <th className="p-4">الرقم التسلسلي</th>
                    <th className="p-4">الموقع</th>
                    <th className="p-4">المستلم الحالي</th>
                    <th className="p-4">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2EC]">
                  {assets.map((a) => (
                    <tr key={a.id} className="hover:bg-[#FFF7E6]">
                      <td className="p-4 font-mono text-xs font-bold text-[#062B78]">{a.assetCode}</td>
                      <td className="p-4 font-bold text-[#071426]">{a.name}</td>
                      <td className="p-4 text-xs text-[#64748B]">{a.category}</td>
                      <td className="p-4 font-mono text-xs text-[#64748B]">{a.serialNumber}</td>
                      <td className="p-4 text-xs text-[#64748B]">{a.location}</td>
                      <td className="p-4 text-xs font-semibold text-[#071426]">{a.assignee}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          a.status === 'available'
                            ? 'bg-emerald-100 text-[#059669]'
                            : a.status === 'active'
                            ? 'bg-blue-100 text-[#062B78]'
                            : a.status === 'maintenance'
                            ? 'bg-amber-100 text-[#F59E0B]'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {a.status === 'available' ? 'متاحة' : a.status === 'active' ? 'مسلّمة' : a.status === 'maintenance' ? 'صيانة' : 'مستبعدة'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 2. Custody Report */}
            {activeTab === 'custody' && (
              <table className="w-full min-w-[750px] text-right text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-xs font-bold text-[#071426]">
                  <tr>
                    <th className="p-4">رقم العهدة</th>
                    <th className="p-4">اسم الأصل</th>
                    <th className="p-4">الموظف المستلم</th>
                    <th className="p-4">القسم</th>
                    <th className="p-4">تاريخ التسليم</th>
                    <th className="p-4">تاريخ الاستحقاق</th>
                    <th className="p-4">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2EC]">
                  {custodies.map((c) => (
                    <tr key={c.id} className="hover:bg-[#FFF7E6]">
                      <td className="p-4 font-mono text-xs font-bold text-[#062B78]">{c.id}</td>
                      <td className="p-4 font-bold text-[#071426]">{c.assetName}</td>
                      <td className="p-4 font-semibold text-[#071426]">{c.employee}</td>
                      <td className="p-4 text-xs text-[#64748B]">{c.department}</td>
                      <td className="p-4 text-xs text-[#64748B]">{c.assignedAt}</td>
                      <td className="p-4 text-xs text-[#64748B]">{c.dueDate || '—'}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          c.status === 'active'
                            ? 'bg-emerald-100 text-[#059669]'
                            : c.status === 'returned'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-red-100 text-[#DC2626]'
                        }`}>
                          {c.status === 'active' ? 'نشطة' : c.status === 'returned' ? 'مسترجعة' : 'متأخرة'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 3. Inventory Report */}
            {activeTab === 'inventory' && (
              <table className="w-full min-w-[750px] text-right text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-xs font-bold text-[#071426]">
                  <tr>
                    <th className="p-4">التصنيف</th>
                    <th className="p-4">إجمالي الأصول</th>
                    <th className="p-4">المتاح في المخزن</th>
                    <th className="p-4">المسلّم كعهدة</th>
                    <th className="p-4">تحت الصيانة</th>
                    <th className="p-4">نسبة الاستخدام التشغيلي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2EC]">
                  {inventoryCategoryStats.map((item) => (
                    <tr key={item.category} className="hover:bg-[#FFF7E6]">
                      <td className="p-4 font-bold text-[#071426]">{item.category}</td>
                      <td className="p-4 font-extrabold text-[#071426]">{item.total}</td>
                      <td className="p-4 font-bold text-[#059669]">{item.available}</td>
                      <td className="p-4 font-bold text-[#062B78]">{item.active}</td>
                      <td className="p-4 font-bold text-[#F59E0B]">{item.maintenance}</td>
                      <td className="p-4 font-semibold text-[#071426]">{item.utilizationRate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 4. Maintenance Report */}
            {activeTab === 'maintenance' && (
              <table className="w-full min-w-[750px] text-right text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-xs font-bold text-[#071426]">
                  <tr>
                    <th className="p-4">رقم البلاغ</th>
                    <th className="p-4">الأصل</th>
                    <th className="p-4">الموظف المبلغ</th>
                    <th className="p-4">المشكلة</th>
                    <th className="p-4">الفني المكلف</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">تاريخ البلاغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2EC]">
                  {maintenance.map((m) => (
                    <tr key={m.id} className="hover:bg-[#FFF7E6]">
                      <td className="p-4 font-mono text-xs font-bold text-[#062B78]">{m.id}</td>
                      <td className="p-4 font-bold text-[#071426]">{m.assetName}</td>
                      <td className="p-4 text-xs text-[#071426]">{m.employee}</td>
                      <td className="p-4 text-xs text-[#64748B]">{m.issue}</td>
                      <td className="p-4 text-xs text-[#64748B]">{m.technician || '—'}</td>
                      <td className="p-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          m.status === 'open'
                            ? 'bg-amber-100 text-[#F59E0B]'
                            : m.status === 'in_progress'
                            ? 'bg-blue-100 text-[#062B78]'
                            : 'bg-emerald-100 text-[#059669]'
                        }`}>
                          {m.status === 'open' ? 'جديد' : m.status === 'in_progress' ? 'قيد الإصلاح' : 'مكتمل'}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-[#64748B]">{m.requestedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* 5. Usage Reports */}
            {activeTab === 'usage' && (
              <table className="w-full min-w-[750px] text-right text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-xs font-bold text-[#071426]">
                  <tr>
                    <th className="p-4">القسم / الإدارة</th>
                    <th className="p-4">إجمالي العهد النشطة المصروفة</th>
                    <th className="p-4">عدد الموظفين المستلمين</th>
                    <th className="p-4">أبرز الفئات المصروفة للقسم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2EC]">
                  {usageByDepartment.map((u) => (
                    <tr key={u.department} className="hover:bg-[#FFF7E6]">
                      <td className="p-4 font-bold text-[#071426]">{u.department}</td>
                      <td className="p-4 font-extrabold text-[#062B78]">{u.totalAssets}</td>
                      <td className="p-4 font-semibold text-[#071426]">{u.employeeCount} موظف</td>
                      <td className="p-4 text-xs text-[#64748B]">{u.topCategories}</td>
                    </tr>
                  ))}
                  {usageByDepartment.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-xs text-[#64748B]">
                        لا توجد عهد نشطة موزعة على الأقسام حالياً.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
  danger = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
        active
          ? 'bg-[#062B78] text-white shadow-sm'
          : 'bg-white border border-[#D9E2EC] text-[#071426] hover:bg-[#F8FAFC]'
      }`}
    >
      <span>{label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-[10px] ${
          active
            ? 'bg-white/20 text-white'
            : danger
            ? 'bg-red-100 text-[#DC2626]'
            : 'bg-slate-100 text-[#64748B]'
        }`}
      >
        {count}
      </span>
    </button>
  );
}
