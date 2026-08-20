/* eslint-disable react-hooks/set-state-in-effect */
import { Filter, Plus, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { MaintenanceStatusBadge, MaintenanceTable, MaintenanceTimeline, type MaintenanceRequest } from '../features/maintenance';
import { type Asset } from '../features/assets';
import { getApiErrorMessage } from '../services/api';
import { listAssets } from '../services/assets.service';
import { createMaintenance, listMaintenance, updateMaintenance } from '../services/maintenance.service';

export function MaintenancePage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<MaintenanceRequest | null>(null);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    Promise.all([listMaintenance(), listAssets()])
      .then(([maintenance, assetItems]) => {
        setRequests(maintenance);
        setAssets(assetItems);
      })
      .catch((reason: unknown) => setError(getApiErrorMessage(reason)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    load();
  }, []);

  const filtered = useMemo(
    () =>
      requests.filter(
        (request) =>
          `${request.id} ${request.assetName} ${request.issue}`.toLowerCase().includes(search.toLowerCase()) &&
          (!status || request.status === status)
      ),
    [requests, search, status]
  );

  const update = (id: string, nextStatus: MaintenanceRequest['status']) =>
    updateMaintenance(id, { status: nextStatus.toUpperCase() })
      .then((item) => {
        setRequests((items) => items.map((current) => (current.id === id ? item : current)));
        setSelected(item);
      })
      .catch((reason: unknown) => setError(getApiErrorMessage(reason)));

  const save = async (payload: Record<string, unknown>) => {
    setSaving(true);
    try {
      await createMaintenance(payload);
      setShowForm(false);
      load();
    } catch (reason: unknown) {
      setError(getApiErrorMessage(reason, 'تعذر إنشاء طلب الصيانة.'));
      throw reason;
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">عُهدة</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]">إدارة الصيانة</h1>
          <p className="mt-1.5 text-sm text-[#64748B]">متابعة صيانة الأصول وإدارة طلبات الإصلاح</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-[#D9E2EC] px-4 py-2.5 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC]" type="button">
            <Filter size={17} />
            فلترة
          </button>
          <button
            className="flex items-center gap-2 rounded-xl bg-[#062B78] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#071426]"
            onClick={() => setShowForm(true)}
            type="button"
          >
            <Plus size={17} />
            طلب صيانة جديد
          </button>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-[#DC2626]" role="alert">{error}</p>}
      {saving && <p className="rounded-xl bg-[#F8FAFC] p-4 text-sm text-[#64748B]">جاري حفظ طلب الصيانة...</p>}
      {showForm && <MaintenanceCreateForm assets={assets} onCancel={() => setShowForm(false)} onSaved={save} />}

      <div className="grid gap-4 sm:grid-cols-4">
        <Metric label="إجمالي الطلبات" value={String(requests.length)} />
        <Metric label="تحت الصيانة" value={String(requests.filter((r) => r.status === 'in_progress').length)} color="text-[#F59E0B]" />
        <Metric label="مكتملة" value={String(requests.filter((r) => r.status === 'completed').length)} color="text-[#059669]" />
        <Metric label="عاجلة" value={String(requests.filter((r) => r.priority === 'urgent').length)} color="text-[#DC2626]" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-[#D9E2EC] bg-white p-4 shadow-soft sm:p-6 xl:col-span-2">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={17} />
              <input
                className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] py-2.5 pl-3 pr-10 text-sm text-[#071426] placeholder-[#64748B] outline-none focus:border-[#062B78] focus:ring-1 focus:ring-[#062B78]"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="البحث عن أصل أو طلب..."
                value={search}
              />
            </label>
            <select
              aria-label="حالة الصيانة"
              className="rounded-xl border border-[#D9E2EC] bg-white px-3.5 py-2.5 text-sm text-[#071426] outline-none"
              onChange={(e) => setStatus(e.target.value)}
              value={status}
            >
              <option value="">الحالة (الكل)</option>
              <option value="open">طلب جديد</option>
              <option value="in_progress">تحت الصيانة</option>
              <option value="completed">مكتملة</option>
              <option value="cancelled">ملغاة</option>
            </select>
          </div>
          {loading ? (
            <p className="rounded-xl bg-[#F8FAFC] p-4 text-sm text-[#64748B]">جاري تحميل طلبات الصيانة...</p>
          ) : (
            <MaintenanceTable onOpen={setSelected} requests={filtered} />
          )}
        </div>
        {selected ? (
          <aside className="rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-[#062B78]">تفاصيل الصيانة</p>
                <h2 className="mt-1 text-xl font-bold text-[#071426]">طلب #{selected.id}</h2>
                <p className="mt-1 text-sm text-[#64748B]">
                  {selected.assetName} · {selected.employee}
                </p>
              </div>
              <button aria-label="إغلاق التفاصيل" onClick={() => setSelected(null)} type="button" className="text-[#64748B] hover:text-[#071426]">
                <X size={18} />
              </button>
            </div>
            <MaintenanceStatusBadge status={selected.status} />
            <div className="my-5 space-y-2 rounded-xl bg-[#F8FAFC] border border-[#D9E2EC] p-4 text-sm">
              <p>
                <span className="text-[#64748B]">المشكلة: </span>
                <span className="text-[#071426]">{selected.issue}</span>
              </p>
              <p>
                <span className="text-[#64748B]">الفني: </span>
                <span className="text-[#071426]">{selected.technician}</span>
              </p>
              <p>
                <span className="text-[#64748B]">التكلفة: </span>
                <span className="text-[#071426]">{selected.cost}</span>
              </p>
            </div>
            <MaintenanceTimeline />
            <div className="mt-5 flex gap-2">
              {selected.status === 'open' && (
                <button className="rounded-xl bg-[#062B78] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#071426]" onClick={() => update(selected.id, 'in_progress')} type="button">
                  بدء الصيانة
                </button>
              )}
              {selected.status === 'in_progress' && (
                <button className="rounded-xl bg-[#059669] px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700" onClick={() => update(selected.id, 'completed')} type="button">
                  إكمال الصيانة
                </button>
              )}
            </div>
          </aside>
        ) : (
          <div className="hidden rounded-2xl border border-dashed border-[#D9E2EC] bg-white p-10 text-center text-sm text-[#64748B] xl:block">
            اختر طلباً لعرض التفاصيل.
          </div>
        )}
      </div>
    </section>
  );
}

function MaintenanceCreateForm({
  assets,
  onCancel,
  onSaved,
}: {
  assets: Asset[];
  onCancel: () => void;
  onSaved: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const [assetId, setAssetId] = useState(assets[0]?.id || '');
  const [issue, setIssue] = useState('');
  const [technician, setTechnician] = useState('');
  const [cost, setCost] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!assetId || !issue.trim()) {
      setError('يرجى اختيار الأصل وكتابة وصف المشكلة.');
      return;
    }
    try {
      await onSaved({ assetId, issue, technician: technician || undefined, priority, cost: cost ? Number(cost) : undefined });
    } catch {
      setError('تعذر حفظ الطلب. راجع رسالة الخطأ الظاهرة.');
    }
  };

  return (
    <form className="space-y-4 rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft" onSubmit={submit}>
      <h2 className="text-lg font-bold text-[#071426]">طلب صيانة جديد</h2>
      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-[#DC2626]">{error}</p>}
      <select
        className="w-full rounded-xl border border-[#D9E2EC] bg-white p-3 text-sm text-[#071426] outline-none focus:border-[#062B78]"
        onChange={(e) => setAssetId(e.target.value)}
        value={assetId}
      >
        <option value="">اختر الأصل</option>
        {assets.map((asset) => (
          <option key={asset.id} value={asset.id}>
            {asset.name} — {asset.serialNumber}
          </option>
        ))}
      </select>
      <textarea
        className="w-full rounded-xl border border-[#D9E2EC] bg-white p-3 text-sm text-[#071426] outline-none focus:border-[#062B78]"
        onChange={(e) => setIssue(e.target.value)}
        placeholder="وصف المشكلة"
        rows={3}
        value={issue}
      />
      <div className="grid gap-3 md:grid-cols-3">
        <input
          className="rounded-xl border border-[#D9E2EC] bg-white p-3 text-sm text-[#071426] outline-none focus:border-[#062B78]"
          onChange={(e) => setTechnician(e.target.value)}
          placeholder="الفني"
          value={technician}
        />
        <input
          className="rounded-xl border border-[#D9E2EC] bg-white p-3 text-sm text-[#071426] outline-none focus:border-[#062B78]"
          min="0"
          onChange={(e) => setCost(e.target.value)}
          placeholder="التكلفة"
          type="number"
          value={cost}
        />
        <select
          className="rounded-xl border border-[#D9E2EC] bg-white p-3 text-sm text-[#071426] outline-none focus:border-[#062B78]"
          onChange={(e) => setPriority(e.target.value)}
          value={priority}
        >
          <option value="NORMAL">عادية</option>
          <option value="URGENT">عاجلة</option>
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button className="rounded-xl border border-[#D9E2EC] px-4 py-2 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC]" onClick={onCancel} type="button">
          إلغاء
        </button>
        <button className="rounded-xl bg-[#062B78] px-5 py-2 text-sm font-bold text-white transition hover:bg-[#071426]" type="submit">
          حفظ الطلب
        </button>
      </div>
    </form>
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
