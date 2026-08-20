import { AlertTriangle, Armchair, Car, Laptop } from 'lucide-react';
import { StatCard } from './StatCard';
import type { Asset } from '../../features/assets';
import type { CustodyRecord } from '../../features/custody';

export function AssetSummary({
  assets = [],
  custodyRecords = [],
}: {
  assets?: Asset[];
  custodyRecords?: CustodyRecord[];
}) {
  const itCount = assets.filter((a) => a.category.includes('حاسب') || a.category.includes('تقنية') || a.category.toLowerCase().includes('it')).length;
  const vehicleCount = assets.filter((a) => a.category.includes('مركبات') || a.category.includes('سيار')).length;
  const furnitureCount = assets.filter((a) => a.category.includes('أثاث') || a.category.includes('مكتب')).length;
  const overdueCount = custodyRecords.filter((c) => c.status === 'overdue').length;

  const activeCustody = custodyRecords.filter((c) => c.status === 'active').length;
  const availableAssets = assets.filter((a) => a.status === 'available').length;
  const maintenanceAssets = assets.filter((a) => a.status === 'maintenance').length;
  const otherAssets = Math.max(0, assets.length - (activeCustody + availableAssets + maintenanceAssets));

  const total = assets.length || 1;
  const activePct = Math.round((activeCustody / total) * 100);
  const availPct = Math.round((availableAssets / total) * 100);
  const maintPct = Math.round((maintenanceAssets / total) * 100);

  const categories = [
    { label: 'أجهزة تكنولوجيا المعلومات', value: String(itCount || assets.length), trend: 'نشط', icon: Laptop, tone: 'primary' as const, direction: 'up' as const },
    { label: 'المركبات والآليات', value: String(vehicleCount), trend: 'متابع', icon: Car, tone: 'tertiary' as const, direction: 'flat' as const },
    { label: 'أثاث ومكتبيات', value: String(furnitureCount), trend: 'مسجل', icon: Armchair, tone: 'success' as const, direction: 'up' as const },
    { label: 'عهد متأخرة أو تنبيهات', value: String(overdueCount), trend: overdueCount > 0 ? 'مهم' : 'منتظم', icon: AlertTriangle, tone: overdueCount > 0 ? ('danger' as const) : ('tertiary' as const), direction: 'up' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            trend={item.trend}
            trendDirection={item.direction}
            icon={item.icon}
            tone={item.tone}
          />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#D4AF37] bg-white p-6 shadow-soft lg:col-span-2">
          <h2 className="mb-6 text-lg font-bold text-[#071426]">حالة العهد والأصول الحالية</h2>
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            <div
              className="relative flex h-44 w-44 shrink-0 items-center justify-center rounded-full shadow-inner"
              style={{
                background: `conic-gradient(#071426 0% ${activePct}%, #059669 ${activePct}% ${activePct + availPct}%, #F59E0B ${activePct + availPct}% ${activePct + availPct + maintPct}%, #DC2626 ${activePct + availPct + maintPct}% 100%)`,
              }}
            >
              <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white shadow-sm">
                <span className="text-3xl font-extrabold text-[#071426]">{assets.length}</span>
                <span className="text-xs font-bold text-[#64748B]">الإجمالي</span>
              </div>
            </div>
            <div className="w-full space-y-3 text-sm">
              <Legend color="bg-[#071426]" label="عهد نشطة" value={String(activeCustody)} />
              <Legend color="bg-[#059669]" label="أصول متاحة" value={String(availableAssets)} />
              <Legend color="bg-[#F59E0B]" label="في الصيانة" value={String(maintenanceAssets)} />
              <Legend color="bg-[#DC2626]" label="أخرى / متأخرة" value={String(otherAssets + overdueCount)} />
            </div>
          </div>
        </section>

        <section className="flex min-h-80 flex-col rounded-2xl border border-[#D9E2EC] border-t-4 border-t-[#D4AF37] bg-white p-6 shadow-soft lg:col-span-3">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-[#071426]">حركة الأصول والعهد</h2>
            <p className="mt-1 text-sm text-[#64748B]">سجل نشاط وحركة الأصول خلال الفترات السابقة</p>
          </div>
          <div className="relative flex flex-1 items-end overflow-hidden rounded-xl bg-[#F8FAFC] border border-[#D9E2EC] px-4 pb-5 pt-8">
            <div className="relative z-10 flex h-40 w-full items-end gap-2 sm:gap-4">
              {[35, 45, 60, 50, 70, 85, 65, 80, 75, 90, 85, 95].map((height, index) => (
                <div className="flex flex-1 flex-col items-center gap-2" key={index}>
                  <div className="w-full rounded-t-md bg-[#062B78] transition-all hover:bg-[#D4AF37]" style={{ height: `${height}%` }} />
                  <span className="text-[10px] font-medium text-[#64748B]">{['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس'][index]}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className={`h-3 w-3 rounded-full ${color}`} />
        <span className="font-semibold text-[#071426]">{label}</span>
      </div>
      <span className="font-medium text-[#64748B]">{value}</span>
    </div>
  );
}
