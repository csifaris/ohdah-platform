import { Download, Plus, QrCode } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AssetCard, AssetFilters, AssetTable, type Asset } from '../features/assets';
import { getApiErrorMessage } from '../services/api';
import { listAssets, deleteAsset } from '../services/assets.service';
import { exportToCSV, printReport } from '../utils/cn';

export function AssetsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.successMessage || '');

  useEffect(() => {
    let active = true;
    listAssets()
      .then((data) => {
        if (active) setAssets(data);
      })
      .catch((reason: unknown) => {
        if (active) setError(getApiErrorMessage(reason));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(
    () =>
      assets.filter(
        (asset) =>
          `${asset.id} ${asset.assetCode} ${asset.name} ${asset.serialNumber} ${asset.assignee}`.toLowerCase().includes(search.toLowerCase()) &&
          (!category || asset.category === category) &&
          (!status || asset.status === status)
      ),
    [assets, search, category, status]
  );

  const open = (asset: Asset) => navigate(`/admin/assets/${asset.id}`);
  const edit = (asset: Asset) => navigate(`/admin/assets/${asset.id}/edit`);

  const handleDelete = (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الأصل؟')) return;
    setError('');
    deleteAsset(id)
      .then(() => {
        setAssets((prev) => prev.filter((a) => a.id !== id));
        setSuccess('تم حذف الأصل بنجاح.');
      })
      .catch((reason: unknown) => setError(getApiErrorMessage(reason, 'تعذر حذف الأصل.')));
  };

  const categoryList = useMemo(() => {
    const set = new Set<string>();
    assets.forEach((a) => {
      if (a.category && a.category !== 'غير مصنف') set.add(a.category);
    });
    return Array.from(set);
  }, [assets]);

  const handleExport = () => {
    const headers = ['كود الأصل', 'اسم الأصل', 'الرقم التسلسلي', 'التصنيف', 'الحالة', 'المستلم الحالي', 'القسم', 'الموقع'];
    const rows = filtered.map((a) => [a.assetCode, a.name, a.serialNumber, a.category, a.status, a.assignee, a.department, a.location]);
    exportToCSV('قائمة_الأصول', headers, rows);
  };

  const handlePrint = () => {
    printReport();
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">عُهدة</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]">إدارة الأصول</h1>
          <p className="mt-1.5 text-sm text-[#64748B]">إدارة ومتابعة جميع أصول المؤسسة وحالتها الحالية.</p>
        </div>
        <button
          className="flex items-center justify-center gap-2 rounded-xl bg-[#062B78] px-5 py-3 font-bold text-white shadow-sm transition hover:bg-[#071426]"
          onClick={() => navigate('/admin/assets/new')}
          type="button"
        >
          <Plus size={18} />
          إضافة أصل جديد
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MiniStat label="إجمالي الأصول" value={String(assets.length)} />
        <MiniStat label="نشطة" value={String(assets.filter((a) => a.status === 'active').length)} color="text-[#059669]" />
        <MiniStat label="متاحة" value={String(assets.filter((a) => a.status === 'available').length)} color="text-[#062B78]" />
        <MiniStat label="في الصيانة" value={String(assets.filter((a) => a.status === 'maintenance').length)} color="text-[#F59E0B]" />
      </div>
      <div className="rounded-2xl border border-[#D9E2EC] bg-white p-4 shadow-soft sm:p-6">
        <AssetFilters
          search={search}
          category={category}
          status={status}
          view={view}
          categories={categoryList}
          onSearch={setSearch}
          onCategory={setCategory}
          onStatus={setStatus}
          onView={setView}
          onReset={() => {
            setSearch('');
            setCategory('');
            setStatus('');
          }}
        />
        {loading && <p className="mt-5 rounded-xl bg-[#F8FAFC] p-4 text-sm text-[#64748B]">جاري تحميل الأصول...</p>}
        {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-[#DC2626]" role="alert">{error}</p>}
        {success && <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-semibold text-[#059669]" role="status">{success}</p>}
        {!loading && !error &&
          (view === 'table' ? (
            <AssetTable assets={filtered} onOpen={open} onEdit={edit} onDelete={handleDelete} />
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {filtered.map((asset) => (
                <AssetCard asset={asset} key={asset.id} onOpen={open} />
              ))}
            </div>
          ))}
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            className="flex items-center gap-2 rounded-xl border border-[#D9E2EC] bg-white px-3.5 py-2 text-sm font-semibold text-[#071426] hover:bg-[#F8FAFC]"
            onClick={handleExport}
            type="button"
          >
            <Download size={16} className="text-[#062B78]" />
            تصدير القائمة
          </button>
          <button
            className="flex items-center gap-2 rounded-xl border border-[#D9E2EC] bg-white px-3.5 py-2 text-sm font-semibold text-[#071426] hover:bg-[#F8FAFC]"
            onClick={handlePrint}
            type="button"
          >
            <QrCode size={16} className="text-[#062B78]" />
            طباعة الباركود
          </button>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value, color = 'text-[#071426]' }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-5 shadow-soft">
      <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold tracking-tight ${color}`}>{value}</p>
    </div>
  );
}
