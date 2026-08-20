import { Filter, Plus, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustodyDetails, CustodyTable, type CustodyRecord } from '../features/custody';
import { getApiErrorMessage } from '../services/api';
import { listCustody } from '../services/custody.service';

export function CustodyPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<CustodyRecord | null>(null);
  const [records, setRecords] = useState<CustodyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listCustody()
      .then(setRecords)
      .catch((reason: unknown) => setError(getApiErrorMessage(reason)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () =>
      records.filter(
        (record) =>
          `${record.id} ${record.assetName} ${record.employee}`.toLowerCase().includes(search.toLowerCase()) &&
          (!filter || record.status === filter)
      ),
    [records, search, filter]
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">عُهدة</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]">إدارة العهد</h1>
          <p className="mt-1.5 text-sm text-[#64748B]">إدارة ومتابعة جميع العهد المسلمة للموظفين</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-[#D9E2EC] px-4 py-2.5 text-sm font-semibold text-[#062B78] hover:bg-[#F8FAFC]" type="button">
            <Filter size={17} />
            تصفية
          </button>
          <button
            className="flex items-center gap-2 rounded-xl bg-[#062B78] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#071426]"
            onClick={() => navigate('/admin/custody/assign')}
            type="button"
          >
            <Plus size={17} />
            تسليم عهدة
          </button>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-[#DC2626]" role="alert">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-4">
        <Metric label="إجمالي العهد" value={String(records.length)} />
        <Metric label="العهد النشطة" value={String(records.filter((r) => r.status === 'active').length)} color="text-[#059669]" />
        <Metric label="المتأخرة" value={String(records.filter((r) => r.status === 'overdue').length)} color="text-[#DC2626]" />
        <Metric label="في الصيانة" value={String(records.filter((r) => r.status === 'maintenance').length)} color="text-[#F59E0B]" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#D9E2EC] bg-white p-4 shadow-soft sm:p-6 xl:col-span-2">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">بحث عن عهدة</span>
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={17} />
              <input
                className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] py-2.5 pl-3 pr-10 text-sm text-[#071426] placeholder-[#64748B] outline-none focus:border-[#062B78] focus:ring-1 focus:ring-[#062B78]"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="بحث عن عهدة..."
                value={search}
              />
            </label>
            <select
              aria-label="حالة العهدة"
              className="rounded-xl border border-[#D9E2EC] bg-white px-3.5 py-2.5 text-sm text-[#071426] outline-none"
              onChange={(event) => setFilter(event.target.value)}
              value={filter}
            >
              <option value="">الكل</option>
              <option value="active">نشطة</option>
              <option value="overdue">متأخرة</option>
              <option value="returned">مرتجعة</option>
              <option value="maintenance">صيانة</option>
            </select>
          </div>
          {loading ? <p className="rounded-xl bg-[#F8FAFC] p-4 text-sm text-[#64748B]">جاري تحميل العهد...</p> : <CustodyTable records={filtered} onOpen={setSelected} />}
        </div>
        {selected ? (
          <CustodyDetails record={selected} onClose={() => setSelected(null)} onReturn={() => navigate(`/admin/custody/${selected.id}/return`)} />
        ) : (
          <div className="hidden rounded-2xl border border-dashed border-[#D9E2EC] bg-white p-10 text-center text-sm text-[#64748B] xl:block">
            اختر عهدة من القائمة لعرض تفاصيلها وإجراءاتها.
          </div>
        )}
      </div>
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
