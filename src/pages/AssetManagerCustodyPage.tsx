import { useEffect, useMemo, useState } from 'react';
import { Download, Plus, Search, Undo2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CustodyRecord } from '../features/custody';
import { getApiErrorMessage } from '../services/api';
import { listCustody, returnCustody } from '../services/custody.service';
import { exportToCSV } from '../utils/cn';

function getRemainingDaysInfo(dueDateStr: string, currentStatus: string) {
  if (!dueDateStr || dueDateStr === '—' || currentStatus === 'returned') return null;
  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    return { text: `متأخرة بـ ${Math.abs(diffDays)} يوم`, isOverdue: true };
  } else if (diffDays === 0) {
    return { text: 'تستحق اليوم', isOverdue: false, isWarning: true };
  } else {
    return { text: `متبقي ${diffDays} يوم`, isOverdue: false };
  }
}

export function AssetManagerCustodyPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<CustodyRecord[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'returned' | 'overdue'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [returningId, setReturningId] = useState<string | null>(null);

  const fetchCustody = () => {
    listCustody()
      .then((data) => setRecords(data))
      .catch((err: unknown) => setError(getApiErrorMessage(err, 'تعذر تحميل سجلات العهد.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustody();
  }, []);

  const filtered = useMemo(() => {
    return records.filter((item) => {
      const matchSearch =
        search === '' ||
        [item.assetName, item.employee, item.department, item.category, item.id]
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchFilter =
        filter === 'all' ||
        (filter === 'active' && item.status === 'active') ||
        (filter === 'returned' && item.status === 'returned') ||
        (filter === 'overdue' && item.status === 'overdue');
      return matchSearch && matchFilter;
    });
  }, [filter, records, search]);

  const handleReturn = async (id: string) => {
    const notes = window.prompt('ملاحظات الاسترجاع وحالة الأصل عند الاستلام: (اختياري)');
    if (notes === null) return;
    setReturningId(id);
    try {
      await returnCustody(id, notes.trim() || undefined);
      setSuccess('تم استرجاع الأصل وإعادته إلى قائمة الأصول المتاحة بنجاح.');
      fetchCustody();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'تعذر استرجاع العهدة.'));
    } finally {
      setReturningId(null);
    }
  };

  const handleExport = () => {
    const headers = ['رقم العهدة', 'اسم الأصل', 'الموظف', 'القسم', 'التصنيف', 'تاريخ التسليم', 'تاريخ الاستحقاق', 'الحالة'];
    const rows = filtered.map((c) => [c.id, c.assetName, c.employee, c.department, c.category, c.assignedAt, c.dueDate, c.status]);
    exportToCSV('سجل_تسليم_واستلام_العهد', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">العمليات الميدانية</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]" style={{ fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" }}>
            التسليم والاستلام وحركة العهد
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">
            متابعة العهد المسندة للموظفين، تواريخ الاستحقاق، تنفيذ عمليات الصرف، وإثبات استرجاع الأصول.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => navigate('/asset-manager/custody/assign')}
            className="flex items-center gap-2 rounded-xl bg-[#062B78] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#071426]"
          >
            <Plus size={17} />
            تسليم عهدة جديدة
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-[#D9E2EC] bg-white px-4 py-2.5 text-sm font-bold text-[#071426] hover:bg-[#F8FAFC]"
          >
            <Download size={16} className="text-[#062B78]" />
            تصدير
          </button>
        </div>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-[#DC2626]" role="alert">{error}</div>}
      {success && <div className="rounded-xl bg-green-50 p-4 text-sm font-semibold text-[#059669]" role="status">{success}</div>}

      {/* Main Container */}
      <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                filter === 'all' ? 'bg-[#062B78] text-white' : 'border border-[#D9E2EC] bg-white text-[#64748B]'
              }`}
            >
              الكل ({records.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                filter === 'active' ? 'bg-[#062B78] text-white' : 'border border-[#D9E2EC] bg-white text-[#64748B]'
              }`}
            >
              نشطة ({records.filter((r) => r.status === 'active').length})
            </button>
            <button
              onClick={() => setFilter('overdue')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                filter === 'overdue' ? 'bg-[#DC2626] text-white' : 'border border-[#D9E2EC] bg-white text-[#DC2626]'
              }`}
            >
              متأخرة ({records.filter((r) => r.status === 'overdue').length})
            </button>
            <button
              onClick={() => setFilter('returned')}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                filter === 'returned' ? 'bg-[#062B78] text-white' : 'border border-[#D9E2EC] bg-white text-[#64748B]'
              }`}
            >
              مسترجعة ({records.filter((r) => r.status === 'returned').length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={17} />
            <input
              type="text"
              placeholder="بحث بالموظف، الأصل، القسم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] py-2 pr-9 pl-3 text-xs text-[#071426] outline-none focus:border-[#062B78]"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#D9E2EC]">
          <table className="w-full min-w-[850px] text-right text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-xs font-bold text-[#071426]">
              <tr>
                <th className="p-4">رقم العهدة</th>
                <th className="p-4">اسم الأصل</th>
                <th className="p-4">الموظف المستلم</th>
                <th className="p-4">القسم</th>
                <th className="p-4">تاريخ التسليم</th>
                <th className="p-4">تاريخ الاستحقاق</th>
                <th className="p-4">الحالة والمهلة</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2EC]">
              {filtered.map((record) => {
                const remainingInfo = getRemainingDaysInfo(record.dueDate, record.status);
                const isOverdue = record.status === 'overdue' || (remainingInfo && remainingInfo.isOverdue);

                return (
                  <tr key={record.id} className="hover:bg-[#FFF7E6] transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-[#062B78]">{record.id.slice(0, 8).toUpperCase()}</td>
                    <td className="p-4">
                      <p className="font-bold text-[#071426]">{record.assetName}</p>
                      <p className="text-xs text-[#64748B]">{record.category}</p>
                    </td>
                    <td className="p-4 font-semibold text-[#071426]">{record.employee}</td>
                    <td className="p-4 text-xs text-[#64748B]">{record.department}</td>
                    <td className="p-4 text-xs text-[#64748B]">{record.assignedAt}</td>
                    <td className="p-4 text-xs">
                      <p className="font-bold text-[#071426]">{record.dueDate || '—'}</p>
                      {remainingInfo && (
                        <p className={`text-[10px] font-semibold mt-0.5 ${
                          remainingInfo.isOverdue
                            ? 'text-[#DC2626]'
                            : remainingInfo.isWarning
                            ? 'text-[#F59E0B]'
                            : 'text-[#059669]'
                        }`}>
                          {remainingInfo.text}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        isOverdue
                          ? 'bg-red-100 text-[#DC2626]'
                          : record.status === 'active'
                          ? 'bg-emerald-100 text-[#059669]'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isOverdue ? 'متأخرة' : record.status === 'active' ? 'نشطة' : 'تم الإرجاع'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {record.status === 'active' || isOverdue ? (
                        <button
                          onClick={() => handleReturn(record.id)}
                          disabled={returningId === record.id}
                          className="flex items-center gap-1 mx-auto rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-[#B7791F] hover:bg-amber-100"
                          title="إثبات استرجاع الأصل للمخزن"
                        >
                          <Undo2 size={13} />
                          {returningId === record.id ? 'جاري...' : 'استرجاع'}
                        </button>
                      ) : (
                        <span className="text-xs text-[#64748B]">مغلقة</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-[#64748B]">
                    لا توجد سجلات عهد مطابقة.
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
