import { useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw, Search } from 'lucide-react';
import type { AuditLogEntry } from '../services/audit.service';
import { listAuditLogs } from '../services/audit.service';
import { exportToCSV } from '../utils/cn';

export function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    listAuditLogs()
      .then((data) => setLogs(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        search === '' ||
        [log.action, log.resource, log.actorId, log.actor?.name || '']
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchResource = !resourceFilter || log.resource === resourceFilter;
      return matchSearch && matchResource;
    });
  }, [logs, resourceFilter, search]);

  const handleExport = () => {
    const headers = ['المعرف', 'الإجراء', 'المورد', 'معرف الكيان', 'تاريخ وساعة الإجراء'];
    const rows = filtered.map((l) => [
      l.id,
      l.action,
      l.resource,
      l.resourceId || '—',
      new Date(l.createdAt).toLocaleString('ar-SA'),
    ]);
    exportToCSV('سجل_تدقيق_النظام_والأمان', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">الامتثال وسجلات الأمان</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]" style={{ fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" }}>
            سجلات التدقيق الأمني (Audit Logs)
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">
            توثيق كامل لكافة الإجراءات الإدارية، تعديل الصلاحيات، وحركات تسجيل الدخول على مستوى النظام.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 rounded-xl border border-[#D9E2EC] bg-white px-4 py-2.5 text-sm font-bold text-[#071426] hover:bg-[#F8FAFC]"
          >
            <RefreshCw size={16} />
            تحديث
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl bg-[#062B78] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#071426]"
          >
            <Download size={16} />
            تصدير السجل
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">إجمالي العمليات المسجلة</p>
          <p className="mt-2 text-3xl font-extrabold text-[#071426]">{logs.length}</p>
        </div>
        <div className="rounded-xl border border-[#D9E2EC] border-t-4 border-t-[#059669] bg-white p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">حالة المراقبة والامتثال</p>
          <p className="mt-2 text-xl font-extrabold text-[#059669]">نشطة ومحمية</p>
        </div>
        <div className="rounded-xl border border-[#D9E2EC] border-t-4 border-t-[#D4AF37] bg-white p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">مستوى الأمان</p>
          <p className="mt-2 text-xl font-extrabold text-[#071426]">Enterprise Tier</p>
        </div>
      </div>

      {/* Table & Filters */}
      <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="relative">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={17} />
            <input
              type="text"
              placeholder="بحث في السجلات بالإجراء، المورد، المستخدم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] py-2.5 pr-10 pl-4 text-sm text-[#071426] outline-none focus:border-[#062B78]"
            />
          </div>
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="rounded-xl border border-[#D9E2EC] bg-white px-3.5 py-2.5 text-sm text-[#071426] outline-none focus:border-[#062B78]"
          >
            <option value="">كافة الموارد</option>
            <option value="USER">المستخدمين (USER)</option>
            <option value="ROLE">الأدوار والصلاحيات (ROLE)</option>
            <option value="AUTH">تسجيل الدخول والأمان (AUTH)</option>
            <option value="ORGANIZATION">الهيكل والمؤسسة (ORGANIZATION)</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#D9E2EC]">
          <table className="w-full min-w-[700px] text-right text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-xs font-bold text-[#071426]">
              <tr>
                <th className="p-4">معرف العملية</th>
                <th className="p-4">الإجراء (Action)</th>
                <th className="p-4">المورد (Resource)</th>
                <th className="p-4">معرف الكيان</th>
                <th className="p-4">تاريخ وساعة التنفيذ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2EC]">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-[#FFF7E6] transition-colors">
                  <td className="p-4 font-mono text-xs font-bold text-[#062B78]">{log.id.slice(0, 8).toUpperCase()}</td>
                  <td className="p-4 font-bold text-[#071426]">{log.action}</td>
                  <td className="p-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-[#071426]">
                      {log.resource}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-xs text-[#64748B]">{log.resourceId || '—'}</td>
                  <td className="p-4 text-xs text-[#64748B]">
                    {new Date(log.createdAt).toLocaleString('ar-SA')}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-[#64748B]">
                    لا توجد سجلات تدقيق مسجلة حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
