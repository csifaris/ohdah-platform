import { useEffect, useMemo, useState } from 'react';
import { ArrowLeftRight, Download, Eye, Pencil, Plus, RefreshCw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Asset } from '../features/assets';
import { getApiErrorMessage } from '../services/api';
import { listAssets, updateAssetStatus } from '../services/assets.service';
import { exportToCSV } from '../utils/cn';

export function AssetManagerAssetsPage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Status Modal
  const [statusModalAsset, setStatusModalAsset] = useState<Asset | null>(null);
  const [newStatus, setNewStatus] = useState<string>('available');
  const [updating, setUpdating] = useState(false);

  const fetchAssets = () => {
    listAssets()
      .then((data) => setAssets(data))
      .catch((err: unknown) => setError(getApiErrorMessage(err, 'تعذر تحميل قائمة الأصول.')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    assets.forEach((a) => {
      if (a.category && a.category !== 'غير مصنف') set.add(a.category);
    });
    return Array.from(set);
  }, [assets]);

  const filtered = useMemo(() => {
    return assets.filter((asset) => {
      const matchSearch =
        search === '' ||
        [asset.name, asset.assetCode, asset.serialNumber, asset.assignee, asset.location]
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchCategory = !category || asset.category === category;
      const matchStatus = !status || asset.status === status;
      return matchSearch && matchCategory && matchStatus;
    });
  }, [assets, category, search, status]);

  const handleUpdateStatus = async () => {
    if (!statusModalAsset) return;
    setUpdating(true);
    try {
      await updateAssetStatus(statusModalAsset.id, newStatus);
      setSuccess(`تم تحديث حالة الأصل ${statusModalAsset.name} بنجاح.`);
      setStatusModalAsset(null);
      fetchAssets();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'تعذر تحديث حالة الأصل.'));
    } finally {
      setUpdating(false);
    }
  };

  const handleExport = () => {
    const headers = ['كود الأصل', 'اسم الأصل', 'التصنيف', 'الرقم التسلسلي', 'الحالة', 'الموقع', 'المستخدم الحالي'];
    const rows = filtered.map((a) => [a.assetCode, a.name, a.category, a.serialNumber, a.status, a.location, a.assignee]);
    exportToCSV('إدارة_الأصول_التشغيلية', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">إدارة دورة حياة الأصول</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]" style={{ fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" }}>
            سجل الأصول والمعدات التشغيلية
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">
            إضافة الأصول، تعديل البيانات، تحديث الحالات التشغيلية، ومتابعة سجلات الاستخدام.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => navigate('/asset-manager/assets/new')}
            className="flex items-center gap-2 rounded-xl bg-[#062B78] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#071426]"
          >
            <Plus size={18} />
            إضافة أصل جديد
          </button>
          <button
            onClick={() => navigate('/asset-manager/custody/assign')}
            className="flex items-center gap-2 rounded-xl border border-[#062B78] bg-[#062B78]/5 px-4 py-2.5 text-sm font-bold text-[#062B78] shadow-sm transition hover:bg-[#062B78]/10"
          >
            <ArrowLeftRight size={17} />
            صرف عهدة
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

      {/* KPI Counters */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">إجمالي الأصول</p>
          <p className="mt-2 text-3xl font-extrabold text-[#071426]">{assets.length}</p>
        </div>
        <div className="rounded-xl border border-[#D9E2EC] border-t-4 border-t-[#059669] bg-white p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">أصول متاحة للتسليم</p>
          <p className="mt-2 text-3xl font-extrabold text-[#059669]">
            {assets.filter((a) => a.status === 'available').length}
          </p>
        </div>
        <div className="rounded-xl border border-[#D9E2EC] border-t-4 border-t-[#062B78] bg-white p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">أصول نشطة كعهدة</p>
          <p className="mt-2 text-3xl font-extrabold text-[#062B78]">
            {assets.filter((a) => a.status === 'active').length}
          </p>
        </div>
        <div className="rounded-xl border border-[#D9E2EC] border-t-4 border-t-[#F59E0B] bg-white p-5 shadow-soft">
          <p className="text-xs font-bold uppercase tracking-wide text-[#64748B]">أصول بالصيانة</p>
          <p className="mt-2 text-3xl font-extrabold text-[#F59E0B]">
            {assets.filter((a) => a.status === 'maintenance').length}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
            <input
              type="text"
              placeholder="بحث بالاسم، الكود، الرقم التسلسلي، الموقع..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] py-2.5 pr-10 pl-4 text-sm text-[#071426] placeholder-[#64748B] outline-none focus:border-[#062B78]"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-[#D9E2EC] bg-white px-3.5 py-2.5 text-sm text-[#071426] outline-none focus:border-[#062B78]"
          >
            <option value="">جميع التصنيفات</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-[#D9E2EC] bg-white px-3.5 py-2.5 text-sm text-[#071426] outline-none focus:border-[#062B78]"
          >
            <option value="">جميع الحالات</option>
            <option value="available">متاحة (AVAILABLE)</option>
            <option value="active">نشطة (ACTIVE)</option>
            <option value="maintenance">في الصيانة (MAINTENANCE)</option>
            <option value="retired">مستبعدة (RETIRED)</option>
          </select>
        </div>

        {/* Assets Table */}
        <div className="overflow-x-auto rounded-xl border border-[#D9E2EC]">
          <table className="w-full min-w-[850px] text-right text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-xs font-bold text-[#071426]">
              <tr>
                <th className="p-4">كود الأصل</th>
                <th className="p-4">اسم الأصل</th>
                <th className="p-4">التصنيف</th>
                <th className="p-4">الرقم التسلسلي</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">الموقع</th>
                <th className="p-4">المستخدم الحالي</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2EC]">
              {filtered.map((asset) => (
                <tr key={asset.id} className="hover:bg-[#FFF7E6] transition-colors">
                  <td className="p-4 font-mono text-xs font-bold text-[#062B78]">{asset.assetCode}</td>
                  <td className="p-4 font-bold text-[#071426]">{asset.name}</td>
                  <td className="p-4 text-xs text-[#64748B]">{asset.category}</td>
                  <td className="p-4 font-mono text-xs text-[#64748B]">{asset.serialNumber}</td>
                  <td className="p-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      asset.status === 'available'
                        ? 'bg-emerald-100 text-[#059669]'
                        : asset.status === 'active'
                        ? 'bg-blue-100 text-[#062B78]'
                        : asset.status === 'maintenance'
                        ? 'bg-amber-100 text-[#F59E0B]'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {asset.status === 'available' ? 'متاحة' : asset.status === 'active' ? 'نشطة' : asset.status === 'maintenance' ? 'في الصيانة' : 'مستبعدة'}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-[#64748B]">{asset.location}</td>
                  <td className="p-4 text-xs font-semibold text-[#071426]">{asset.assignee}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => navigate(`/asset-manager/assets/${asset.id}`)}
                        className="rounded-lg p-1.5 text-[#062B78] hover:bg-[#062B78]/10"
                        title="عرض تفاصيل وسجل الأصل"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/asset-manager/assets/${asset.id}/edit`)}
                        className="rounded-lg p-1.5 text-[#64748B] hover:bg-slate-100 hover:text-[#071426]"
                        title="تعديل بيانات الأصل"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setStatusModalAsset(asset);
                          setNewStatus(asset.status);
                        }}
                        className="flex items-center gap-1 rounded-lg bg-[#F8FAFC] border border-[#D9E2EC] px-2 py-1 text-xs font-bold text-[#071426] hover:bg-[#D9E2EC]"
                        title="تغيير الحالة التشغيلية"
                      >
                        <RefreshCw size={12} />
                        الحالة
                      </button>
                      {asset.status === 'available' && (
                        <button
                          onClick={() => navigate(`/asset-manager/custody/assign?assetId=${asset.id}`)}
                          className="flex items-center gap-1 rounded-lg bg-[#062B78] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#071426]"
                          title="تسليم كعهدة"
                        >
                          <ArrowLeftRight size={12} />
                          تسليم
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-[#64748B]">
                    لم يتم العثور على أصول مطابقة لمعايير البحث.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {statusModalAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-[#071426]">تحديث حالة الأصل التشغيلية</h3>
            <p className="text-xs text-[#64748B]">
              الأصل: <span className="font-bold text-[#071426]">{statusModalAsset.name}</span> ({statusModalAsset.assetCode})
            </p>

            <label className="block space-y-1.5">
              <span className="text-xs font-bold text-[#071426]">الحالة الجديدة:</span>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-xl border border-[#D9E2EC] bg-white p-3 text-sm text-[#071426] outline-none focus:border-[#062B78]"
              >
                <option value="available">متاحة للتسليم (AVAILABLE)</option>
                <option value="active">نشطة كعهدة (ACTIVE)</option>
                <option value="maintenance">تحت الصيانة (MAINTENANCE)</option>
                <option value="retired">مستبعدة / تالفة (RETIRED)</option>
              </select>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStatusModalAsset(null)}
                className="rounded-xl border border-[#D9E2EC] px-4 py-2 text-xs font-bold text-[#64748B] hover:bg-[#F8FAFC]"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={handleUpdateStatus}
                className="rounded-xl bg-[#062B78] px-5 py-2 text-xs font-bold text-white hover:bg-[#071426]"
              >
                {updating ? 'جاري الحفظ...' : 'تأكيد التحديث'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
