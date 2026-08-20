import { useEffect, useState } from 'react';
import { ExportReportButton, mockReports, ReportCard, ReportFilters } from '../features/reports';
import { getApiErrorMessage } from '../services/api';
import { listAssets } from '../services/assets.service';
import { listCustody } from '../services/custody.service';
import { listEmployees } from '../services/employees.service';
import { listMaintenance } from '../services/maintenance.service';
import type { Asset } from '../features/assets';
import type { CustodyRecord } from '../features/custody';
import type { Employee } from '../features/employees';
import type { MaintenanceRequest } from '../features/maintenance';
import { exportToCSV, printReport } from '../utils/cn';

type ReportTab = 'summary' | 'assets' | 'custody' | 'employees' | 'maintenance';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('summary');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [custodyRecords, setCustodyRecords] = useState<CustodyRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      listAssets(),
      listCustody(),
      listEmployees(),
      listMaintenance(),
    ])
      .then(([asts, custs, emps, maints]) => {
        if (mounted) {
          setAssets(asts);
          setCustodyRecords(custs);
          setEmployees(emps);
          setMaintenanceRequests(maints);
        }
      })
      .catch((reason: unknown) => {
        if (mounted) setError(getApiErrorMessage(reason, 'تعذر تحميل بيانات التقارير.'));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const assetCount = assets.length;
  const maintenanceCount = maintenanceRequests.length;
  const activeCustodyCount = custodyRecords.filter((c) => c.status === 'active').length;
  const activeEmployeesCount = employees.length;

  const handleExportExcel = () => {
    if (activeTab === 'assets' || activeTab === 'summary') {
      const headers = ['كود الأصل', 'اسم الأصل', 'الرقم التسلسلي', 'التصنيف', 'الحالة', 'المستلم الحالي', 'القسم', 'الموقع'];
      const rows = assets.map((a) => [a.assetCode, a.name, a.serialNumber, a.category, a.status, a.assignee, a.department, a.location]);
      exportToCSV('تقرير_الأصول_الشامل', headers, rows);
    } else if (activeTab === 'custody') {
      const headers = ['رقم العهدة', 'اسم الأصل', 'الموظف', 'القسم', 'تاريخ التسليم', 'تاريخ الاستحقاق', 'الحالة'];
      const rows = custodyRecords.map((c) => [c.id, c.assetName, c.employee, c.department, c.assignedAt, c.dueDate, c.status]);
      exportToCSV('تقرير_حركة_العهد', headers, rows);
    } else if (activeTab === 'employees') {
      const headers = ['الرقم الوظيفي', 'اسم الموظف', 'القسم', 'المسمى الوظيفي', 'البريد الإلكتروني', 'العهد النشطة', 'الحالة'];
      const rows = employees.map((e) => [e.id, e.name, e.department, e.jobTitle, e.email, e.activeAssets, e.status]);
      exportToCSV('تقرير_الموظفين_والعهد', headers, rows);
    } else if (activeTab === 'maintenance') {
      const headers = ['رقم الطلب', 'الأصل', 'الموظف', 'المشكلة', 'الفني', 'تاريخ الطلب', 'التكلفة', 'الحالة'];
      const rows = maintenanceRequests.map((m) => [m.id, m.assetName, m.employee, m.issue, m.technician, m.requestedAt, m.cost, m.status]);
      exportToCSV('تقرير_عمليات_الصيانة', headers, rows);
    }
  };

  const handleExportPdf = () => {
    printReport();
  };

  const handleOpenCategory = (reportId: string) => {
    if (reportId === 'assets') setActiveTab('assets');
    else if (reportId === 'custody') setActiveTab('custody');
    else if (reportId === 'employees') setActiveTab('employees');
    else if (reportId === 'maintenance') setActiveTab('maintenance');
    setSuccess(`تم عرض ${mockReports.find((r) => r.id === reportId)?.title || 'التقرير'}.`);
  };

  const handleGenerateCustom = (type: string) => {
    if (type.includes('أصول')) setActiveTab('assets');
    else if (type.includes('عهد')) setActiveTab('custody');
    else if (type.includes('موظف')) setActiveTab('employees');
    else if (type.includes('صيان')) setActiveTab('maintenance');
    else setActiveTab('assets');
    setSuccess(`تم إنشاء ${type} بنجاح.`);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">عُهدة</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]">مركز التقارير والتحليلات</h1>
          <p className="mt-1.5 text-sm text-[#64748B]">تحليل شامل وحقيقي لأداء الأصول والعهد والصيانة والموظفين</p>
        </div>
        <ExportReportButton onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} onExportAll={handleExportExcel} />
      </div>

      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-[#DC2626]" role="alert">{error}</p>}
      {success && <p className="rounded-xl bg-green-50 p-4 text-sm font-semibold text-[#059669]" role="status">{success}</p>}

      <div className="grid gap-4 sm:grid-cols-4">
        <Metric label="إجمالي الأصول" value={loading ? '—' : String(assetCount)} />
        <Metric label="العهد النشطة" value={loading ? '—' : String(activeCustodyCount)} color="text-[#062B78]" />
        <Metric label="إجمالي الموظفين" value={loading ? '—' : String(activeEmployeesCount)} color="text-[#059669]" />
        <Metric label="طلبات الصيانة" value={loading ? '—' : String(maintenanceCount)} color="text-[#F59E0B]" />
      </div>

      <section>
        <h2 className="mb-4 text-lg font-bold text-[#071426]">فئات التقارير</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {mockReports.map((report) => (
            <ReportCard key={report.id} report={report} onOpen={() => handleOpenCategory(report.id)} />
          ))}
        </div>
      </section>

      {/* Active Detailed Report Table */}
      {activeTab !== 'summary' && (
        <section className="rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#D9E2EC] pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#071426]">
                {activeTab === 'assets' && 'تقرير الأصول المسجلة في النظام'}
                {activeTab === 'custody' && 'تقرير حركة العهد والتسليم'}
                {activeTab === 'employees' && 'تقرير الموظفين والعهد المسندة'}
                {activeTab === 'maintenance' && 'تقرير طلبات وتكاليف الصيانة'}
              </h2>
              <p className="text-xs text-[#64748B] mt-1">بيانات حية ومباشرة من قاعدة البيانات</p>
            </div>
            <button
              onClick={() => setActiveTab('summary')}
              className="text-xs font-semibold text-[#062B78] hover:underline"
              type="button"
            >
              إغلاق جدول التفاصيل
            </button>
          </div>

          {activeTab === 'assets' && (
            <div className="overflow-x-auto rounded-xl border border-[#D9E2EC]">
              <table className="w-full min-w-[750px] text-right text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#D9E2EC] font-bold text-[#071426] text-xs">
                  <tr>
                    <th className="p-3.5">كود الأصل</th>
                    <th className="p-3.5">اسم الأصل</th>
                    <th className="p-3.5">التصنيف</th>
                    <th className="p-3.5">الحالة</th>
                    <th className="p-3.5">المستلم الحالي</th>
                    <th className="p-3.5">القسم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2EC]">
                  {assets.slice(0, 15).map((a) => (
                    <tr key={a.id} className="hover:bg-[#FFF7E6]">
                      <td className="p-3.5 font-mono text-xs font-bold text-[#062B78]">{a.assetCode}</td>
                      <td className="p-3.5 font-semibold text-[#071426]">{a.name}</td>
                      <td className="p-3.5 text-[#64748B]">{a.category}</td>
                      <td className="p-3.5"><span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-[#071426] uppercase">{a.status}</span></td>
                      <td className="p-3.5 text-[#071426]">{a.assignee}</td>
                      <td className="p-3.5 text-[#64748B]">{a.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'custody' && (
            <div className="overflow-x-auto rounded-xl border border-[#D9E2EC]">
              <table className="w-full min-w-[750px] text-right text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#D9E2EC] font-bold text-[#071426] text-xs">
                  <tr>
                    <th className="p-3.5">رقم العهدة</th>
                    <th className="p-3.5">اسم الأصل</th>
                    <th className="p-3.5">الموظف</th>
                    <th className="p-3.5">القسم</th>
                    <th className="p-3.5">تاريخ التسليم</th>
                    <th className="p-3.5">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2EC]">
                  {custodyRecords.slice(0, 15).map((c) => (
                    <tr key={c.id} className="hover:bg-[#FFF7E6]">
                      <td className="p-3.5 font-mono text-xs font-bold text-[#062B78]">{c.id}</td>
                      <td className="p-3.5 font-semibold text-[#071426]">{c.assetName}</td>
                      <td className="p-3.5 text-[#071426]">{c.employee}</td>
                      <td className="p-3.5 text-[#64748B]">{c.department}</td>
                      <td className="p-3.5 text-[#64748B]">{c.assignedAt}</td>
                      <td className="p-3.5"><span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-[#071426] uppercase">{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'employees' && (
            <div className="overflow-x-auto rounded-xl border border-[#D9E2EC]">
              <table className="w-full min-w-[750px] text-right text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#D9E2EC] font-bold text-[#071426] text-xs">
                  <tr>
                    <th className="p-3.5">اسم الموظف</th>
                    <th className="p-3.5">الرقم الوظيفي</th>
                    <th className="p-3.5">القسم</th>
                    <th className="p-3.5">المسمى الوظيفي</th>
                    <th className="p-3.5">العهد النشطة</th>
                    <th className="p-3.5">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2EC]">
                  {employees.slice(0, 15).map((e) => (
                    <tr key={e.id} className="hover:bg-[#FFF7E6]">
                      <td className="p-3.5 font-semibold text-[#071426]">{e.name}</td>
                      <td className="p-3.5 font-mono text-xs text-[#64748B]">{e.id.slice(0, 8).toUpperCase()}</td>
                      <td className="p-3.5 text-[#64748B]">{e.department}</td>
                      <td className="p-3.5 text-[#64748B]">{e.jobTitle}</td>
                      <td className="p-3.5 font-bold text-[#062B78]">{e.activeAssets}</td>
                      <td className="p-3.5"><span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-[#071426] uppercase">{e.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="overflow-x-auto rounded-xl border border-[#D9E2EC]">
              <table className="w-full min-w-[750px] text-right text-sm">
                <thead className="bg-[#F8FAFC] border-b border-[#D9E2EC] font-bold text-[#071426] text-xs">
                  <tr>
                    <th className="p-3.5">رقم الطلب</th>
                    <th className="p-3.5">الأصل</th>
                    <th className="p-3.5">الموظف</th>
                    <th className="p-3.5">المشكلة</th>
                    <th className="p-3.5">الفني</th>
                    <th className="p-3.5">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9E2EC]">
                  {maintenanceRequests.slice(0, 15).map((m) => (
                    <tr key={m.id} className="hover:bg-[#FFF7E6]">
                      <td className="p-3.5 font-mono text-xs font-bold text-[#062B78]">{m.id}</td>
                      <td className="p-3.5 font-semibold text-[#071426]">{m.assetName}</td>
                      <td className="p-3.5 text-[#071426]">{m.employee}</td>
                      <td className="p-3.5 text-[#64748B]">{m.issue}</td>
                      <td className="p-3.5 text-[#64748B]">{m.technician}</td>
                      <td className="p-3.5"><span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-[#071426] uppercase">{m.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <ReportFilters onGenerate={handleGenerateCustom} />
    </section>
  );
}

function Metric({ label, value, color = 'text-[#071426]' }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-5 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold tracking-tight ${color}`}>{value}</p>
    </div>
  );
}
