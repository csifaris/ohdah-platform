import { Download, Grid2X2, List, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EmployeeDrawer, EmployeeForm, EmployeeTable, type Employee } from '../features/employees';
import { getApiErrorMessage } from '../services/api';
import { createEmployee, getEmployee, listEmployees } from '../services/employees.service';
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

export function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    listEmployees(search || undefined, undefined)
      .then(setEmployees)
      .catch((reason: unknown) => setError(getApiErrorMessage(reason)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      employees.filter(
        (employee) =>
          `${employee.name} ${employee.id} ${employee.email}`.toLowerCase().includes(search.toLowerCase()) &&
          (!department || employee.department === department)
      ),
    [employees, search, department]
  );

  const save = async (payload: Record<string, unknown>) => {
    setSaving(true);
    setError('');
    try {
      await createEmployee(payload);
      setShowForm(false);
      load();
    } catch (reason: unknown) {
      const message = getApiErrorMessage(reason, 'تعذر إضافة الموظف.');
      setError(message);
      throw reason;
    } finally {
      setSaving(false);
    }
  };

  const openEmployee = (employee: Employee) => {
    setSelected(employee);
    getEmployee(employee.id).then(setSelected).catch((reason: unknown) => setError(getApiErrorMessage(reason)));
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">عُهدة</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]">إدارة الموظفين</h1>
          <p className="mt-1.5 text-sm text-[#64748B]">إدارة بيانات الموظفين والعهد المسلمة لهم عبر كافة الفروع</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-[#D9E2EC] px-4 py-2.5 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC]" type="button">
            <Download size={17} />
            تصدير
          </button>
          <button
            className="flex items-center gap-2 rounded-xl bg-[#062B78] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#071426]"
            onClick={() => setShowForm(true)}
            type="button"
          >
            <Plus size={17} />
            إضافة موظف
          </button>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-[#DC2626]" role="alert">{error}</p>}
      {saving && <p className="rounded-xl bg-[#F8FAFC] p-4 text-sm text-[#64748B]">جاري حفظ الموظف...</p>}
      {showForm && <EmployeeForm onCancel={() => setShowForm(false)} onSaved={save} />}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="إجمالي الموظفين" value={String(employees.length)} />
        <Metric label="لديهم عهد" value={String(employees.filter((e) => e.activeAssets > 0).length)} color="text-[#059669]" />
        <Metric label="بدون عهد" value={String(employees.filter((e) => e.activeAssets === 0).length)} color="text-[#F59E0B]" />
        <Metric label="عهد متأخرة" value="—" color="text-[#DC2626]" />
      </div>

      <div className="rounded-2xl border border-[#D9E2EC] bg-white p-4 shadow-soft sm:p-6">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row">
          <label className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={17} />
            <input
              className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] py-2.5 pl-3 pr-10 text-sm text-[#071426] placeholder-[#64748B] outline-none focus:border-[#062B78] focus:ring-1 focus:ring-[#062B78]"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="البحث بالاسم، الرقم الوظيفي، الإيميل..."
              value={search}
            />
          </label>
          <select
            aria-label="القسم"
            className="rounded-xl border border-[#D9E2EC] bg-white px-3.5 py-2.5 text-sm text-[#071426] outline-none"
            onChange={(event) => setDepartment(event.target.value)}
            value={department}
          >
            <option value="">كل الأقسام</option>
            <option>تقنية المعلومات</option>
            <option>الموارد البشرية</option>
          </select>
          <div className="flex gap-2">
            <button
              aria-label="عرض القائمة"
              className={`rounded-xl border p-2.5 ${view === 'list' ? 'border-[#062B78] bg-[#F1F5F9] text-[#062B78]' : 'border-[#D9E2EC] text-[#64748B]'}`}
              onClick={() => setView('list')}
              type="button"
            >
              <List size={18} />
            </button>
            <button
              aria-label="عرض الشبكة"
              className={`rounded-xl border p-2.5 ${view === 'grid' ? 'border-[#062B78] bg-[#F1F5F9] text-[#062B78]' : 'border-[#D9E2EC] text-[#64748B]'}`}
              onClick={() => setView('grid')}
              type="button"
            >
              <Grid2X2 size={18} />
            </button>
          </div>
        </div>
        {loading ? (
          <p className="rounded-xl bg-[#F8FAFC] p-4 text-sm text-[#64748B]">جاري تحميل الموظفين...</p>
        ) : view === 'list' ? (
          <EmployeeTable employees={filtered} onOpen={openEmployee} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((employee) => (
              <button
                className="rounded-2xl border border-[#D9E2EC] bg-white p-5 text-right shadow-soft transition hover:bg-[#FFF7E6]"
                key={employee.id}
                onClick={() => openEmployee(employee)}
                type="button"
              >
                <p className="font-bold text-[#071426]">{employee.name}</p>
                <p className="text-xs text-[#64748B]">{employee.jobTitle}</p>
                <p className="mt-4 text-sm text-[#071426]">
                  العهد النشطة: <strong className="text-[#062B78]">{employee.activeAssets}</strong>
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
      {selected && <EmployeeDrawer employee={selected} onClose={() => setSelected(null)} />}
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
