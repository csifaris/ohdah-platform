import { useEffect, useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Asset } from '../features/assets';
import { getApiErrorMessage } from '../services/api';
import { listAssets } from '../services/assets.service';
import { exportToCSV } from '../utils/cn';

export function AssetManagerInventoryPage() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listAssets()
      .then((data) => setAssets(data))
      .catch((err: unknown) => setError(getApiErrorMessage(err, 'تعذر تحميل بيانات المخزون.')))
      .finally(() => setLoading(false));
  }, []);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; available: number; active: number; maintenance: number; retired: number }> = {};
    assets.forEach((a) => {
      const cat = a.category || 'غير مصنف';
      if (!stats[cat]) {
        stats[cat] = { total: 0, available: 0, active: 0, maintenance: 0, retired: 0 };
      }
      stats[cat].total += 1;
      if (a.status === 'available') stats[cat].available += 1;
      else if (a.status === 'active') stats[cat].active += 1;
      else if (a.status === 'maintenance') stats[cat].maintenance += 1;
      else if (a.status === 'retired') stats[cat].retired += 1;
    });
    return stats;
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const matchCat = selectedCategory === 'all' || a.category === selectedCategory;
      const matchSearch =
        search === '' ||
        [a.name, a.assetCode, a.serialNumber, a.location].join(' ').toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [assets, search, selectedCategory]);

  const handleExport = () => {
    const headers = ['التصنيف', 'كود الأصل', 'اسم الأصل', 'الرقم التسلسلي', 'الحالة', 'الموقع'];
    const rows = filteredAssets.map((a) => [a.category, a.assetCode, a.name, a.serialNumber, a.status, a.location]);
    exportToCSV('تقرير_المخزون_التشغيلي', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#D4AF37] bg-white p-6 shadow-soft sm:p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">المستودع والمخازن</p>
          <h1 className="text-3xl font-bold tracking-tight text-[#071426]" style={{ fontFamily: "'Noto Kufi Arabic', Cairo, sans-serif" }}>
            إدارة المخزون والتوريد
          </h1>
          <p className="mt-1.5 text-sm text-[#64748B]">
            متابعة الطاقة الاستيعابية، الأصول الجاهزة للصرف، وتوزيع الفئات في المخازن.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-xl bg-[#062B78] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#071426]"
        >
          <Download size={16} />
          تصدير جرد المخزون
        </button>
      </div>

      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-[#DC2626]" role="alert">{error}</div>}

      {/* Category Breakdown Cards */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-[#071426]">حالة الفئات والتصنيفات في المخزون</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            onClick={() => setSelectedCategory('all')}
            className={`cursor-pointer rounded-2xl border p-5 transition shadow-soft ${
              selectedCategory === 'all'
                ? 'border-[#062B78] bg-[#062B78] text-white'
                : 'border-[#D9E2EC] bg-white text-[#071426] hover:bg-[#F8FAFC]'
            }`}
          >
            <p className={`text-xs font-bold uppercase ${selectedCategory === 'all' ? 'text-[#D4AF37]' : 'text-[#64748B]'}`}>
              كافة الفئات
            </p>
            <p className="mt-2 text-3xl font-extrabold">{assets.length}</p>
            <p className={`mt-1 text-xs ${selectedCategory === 'all' ? 'text-white/80' : 'text-[#059669]'}`}>
              {assets.filter((a) => a.status === 'available').length} أصل متاح للصرف
            </p>
          </div>

          {Object.entries(categoryStats).map(([catName, stats]) => {
            const isSelected = selectedCategory === catName;
            return (
              <div
                key={catName}
                onClick={() => setSelectedCategory(catName)}
                className={`cursor-pointer rounded-2xl border p-5 transition shadow-soft ${
                  isSelected
                    ? 'border-[#062B78] bg-[#062B78] text-white'
                    : 'border-[#D9E2EC] bg-white text-[#071426] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-bold uppercase ${isSelected ? 'text-[#D4AF37]' : 'text-[#64748B]'}`}>
                    {catName}
                  </p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    stats.available > 0
                      ? isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-[#059669]'
                      : isSelected ? 'bg-red-500/30 text-white' : 'bg-red-100 text-[#DC2626]'
                  }`}>
                    {stats.available} متاح
                  </span>
                </div>
                <p className="mt-2 text-3xl font-extrabold">{stats.total}</p>
                <div className="mt-2 text-xs flex justify-between gap-1 opacity-80">
                  <span>نشط: {stats.active}</span>
                  <span>صيانة: {stats.maintenance}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory Search & Table */}
      <div className="rounded-2xl border border-[#D9E2EC] bg-white p-6 shadow-soft space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-bold text-[#071426]">
            قائمة أصول المخزون ({selectedCategory === 'all' ? 'جميع التصنيفات' : selectedCategory})
          </h3>
          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={17} />
            <input
              type="text"
              placeholder="بحث في المخزون..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] py-2 pr-9 pl-3 text-xs text-[#071426] outline-none focus:border-[#062B78]"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#D9E2EC]">
          <table className="w-full min-w-[700px] text-right text-sm">
            <thead className="bg-[#F8FAFC] border-b border-[#D9E2EC] text-xs font-bold text-[#071426]">
              <tr>
                <th className="p-3.5">كود الأصل</th>
                <th className="p-3.5">اسم الأصل</th>
                <th className="p-3.5">التصنيف</th>
                <th className="p-3.5">الرقم التسلسلي</th>
                <th className="p-3.5">الموقع في المخزن</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9E2EC]">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-[#FFF7E6] transition-colors">
                  <td className="p-3.5 font-mono text-xs font-bold text-[#062B78]">{asset.assetCode}</td>
                  <td className="p-3.5 font-bold text-[#071426]">{asset.name}</td>
                  <td className="p-3.5 text-xs text-[#64748B]">{asset.category}</td>
                  <td className="p-3.5 font-mono text-xs text-[#64748B]">{asset.serialNumber}</td>
                  <td className="p-3.5 text-xs text-[#64748B]">{asset.location || 'المستودع الرئيسي'}</td>
                  <td className="p-3.5">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      asset.status === 'available'
                        ? 'bg-emerald-100 text-[#059669]'
                        : asset.status === 'active'
                        ? 'bg-blue-100 text-[#062B78]'
                        : asset.status === 'maintenance'
                        ? 'bg-amber-100 text-[#F59E0B]'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {asset.status === 'available' ? 'متاح بالمخزن' : asset.status === 'active' ? 'مسلّم كعهدة' : asset.status === 'maintenance' ? 'في الصيانة' : 'مستبعد'}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    {asset.status === 'available' ? (
                      <button
                        onClick={() => navigate(`/asset-manager/custody/assign?assetId=${asset.id}`)}
                        className="rounded-lg bg-[#062B78] px-3 py-1 text-xs font-bold text-white hover:bg-[#071426]"
                      >
                        صرف الأصل
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/admin/assets/${asset.id}`)}
                        className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-bold text-[#071426] hover:bg-slate-200"
                      >
                        معاينة
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredAssets.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#64748B]">
                    لا توجد أصول مطابقة في هذا التصنيف.
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
