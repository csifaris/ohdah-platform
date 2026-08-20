import { CalendarDays, CheckCircle2, MapPin, Pencil, QrCode, UserRound, Wrench, X, History } from 'lucide-react';
import type { Asset } from '../types';
import { AssetStatusBadge } from './AssetStatusBadge';

type AssetDetailsProps = { asset: Asset; onClose?: () => void; onEdit?: () => void };

export function AssetDetails({ asset, onClose, onEdit }: AssetDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-gold bg-primary-light px-3 py-1.5 text-xs font-semibold text-primary">
              {asset.assetCode || asset.id.slice(0, 8).toUpperCase()}
            </span>
            <AssetStatusBadge status={asset.status} />
          </div>
          <h1 className="text-3xl font-bold text-ink">{asset.name}</h1>
          <p className="mt-2 flex items-center gap-2 text-muted">
            <span>{asset.category}</span>
            <span>·</span>
            <span className="font-mono">{asset.serialNumber}</span>
          </p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-surface" onClick={onEdit} type="button">
              <Pencil size={16} />
              تعديل
            </button>
          )}
          {onClose && (
            <button aria-label="إغلاق التفاصيل" className="rounded-lg border border-border bg-white p-2 text-muted hover:bg-surface" onClick={onClose} type="button">
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-border bg-surface p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Info label="المستلم الحالي" value={asset.assignee} icon={UserRound} />
        <Info label="القسم" value={asset.department} icon={UserRound} />
        <Info label="تاريخ الشراء" value={asset.purchaseDate} icon={CalendarDays} />
        <Info label="الموقع" value={asset.location} icon={MapPin} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {asset.image && (
          <div className="rounded-xl border border-border bg-white p-4 shadow-soft">
            <h2 className="mb-3 text-sm font-semibold text-muted">صورة الأصل</h2>
            <div className="overflow-hidden rounded-lg border border-border">
              <img src={asset.image} alt={asset.name} className="h-64 w-full object-cover" />
            </div>
          </div>
        )}
        <section className={`rounded-xl border border-border bg-white p-6 shadow-soft ${asset.image ? 'lg:col-span-1' : 'lg:col-span-1'}`}>
          <SectionTitle icon={CheckCircle2} title="حالة الأصل الحالية" />
          <div className="space-y-3 text-sm">
            <Row label="حالة الفحص" value={asset.condition} valueClass="text-success" />
            <Row label="تاريخ آخر فحص" value={asset.lastMaintenance} />
            <Row label="المستلم الحالي" value={asset.assignee} />
            <Row label="الموقع" value={asset.location} />
            {asset.notes && (
              <div>
                <span className="mb-1 block text-muted">ملاحظات الأصل</span>
                <p className="rounded-lg bg-surface p-3 font-medium">{asset.notes}</p>
              </div>
            )}
          </div>
        </section>

        <section className={`rounded-xl border border-border bg-white p-6 shadow-soft ${asset.image ? 'lg:col-span-1' : 'lg:col-span-1'}`}>
          <SectionTitle icon={QrCode} title="البيانات التقنية" />
          <div className="space-y-3 text-sm">
            <Row label="كود الأصل (رقم الأصل)" value={asset.assetCode || asset.id} />
            <Row label="التصنيف" value={asset.category} />
            <Row label="الشركة المصنعة" value={asset.manufacturer} />
            <Row label="الموديل" value={asset.model} />
            <Row label="الرقم التسلسلي" value={asset.serialNumber} valueClass="font-mono" />
            <Row label="الضمان" value={asset.warranty} valueClass="text-success" />
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Custody History Section */}
        <section className="rounded-xl border border-border bg-white p-6 shadow-soft space-y-4">
          <SectionTitle icon={History} title="سجل العهد" />
          {asset.custodyHistory && asset.custodyHistory.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-right text-xs">
                <thead className="border-b border-border bg-surface text-muted font-semibold">
                  <tr>
                    <th className="p-3">الموظف</th>
                    <th className="p-3">تاريخ التسليم</th>
                    <th className="p-3">تاريخ الإرجاع</th>
                    <th className="p-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {asset.custodyHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-surface">
                      <td className="p-3 font-semibold text-primary">{item.employeeName}</td>
                      <td className="p-3 text-muted">{item.assignedAt}</td>
                      <td className="p-3 text-muted">{item.returnedAt || '—'}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${item.status === 'ACTIVE' ? 'bg-green-100 text-success' : 'bg-surface text-muted'}`}>
                          {item.status === 'ACTIVE' ? 'نشط' : 'تم الإرجاع'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted bg-surface p-4 rounded-lg text-center">لا يوجد سجل تسليم عهد لهذا الأصل حتى الآن.</p>
          )}
        </section>

        {/* Maintenance History Section */}
        <section className="rounded-xl border border-border bg-white p-6 shadow-soft space-y-4">
          <SectionTitle icon={Wrench} title="سجل الصيانة" />
          {asset.maintenanceHistory && asset.maintenanceHistory.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-right text-xs">
                <thead className="border-b border-border bg-surface text-muted font-semibold">
                  <tr>
                    <th className="p-3">المشكلة</th>
                    <th className="p-3">تاريخ الطلب</th>
                    <th className="p-3">الفني</th>
                    <th className="p-3">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {asset.maintenanceHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-surface">
                      <td className="p-3 font-medium">{item.issue}</td>
                      <td className="p-3 text-muted">{item.requestedAt}</td>
                      <td className="p-3 text-muted">{item.technician || '—'}</td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded-full font-medium bg-amber-100 text-warning uppercase">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted bg-surface p-4 rounded-lg text-center">لا يوجد سجل صيانة لهذا الأصل حتى الآن.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function Info({ label, value, icon: Icon }: { label: string; value: string; icon: typeof UserRound }) { return <div><p className="mb-1 text-xs text-muted">{label}</p><p className="flex items-center gap-2 font-semibold"><Icon size={16} className="text-muted" />{value}</p></div>; }
function SectionTitle({ icon: Icon, title }: { icon: typeof CheckCircle2; title: string }) { return <h2 className="mb-4 flex items-center gap-2 border-b border-border pb-3 text-lg font-semibold"><Icon className="text-primary" size={20} />{title}</h2>; }
function Row({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) { return <div className="flex items-center justify-between gap-4 border-b border-border py-2"><span className="text-muted">{label}</span><span className={`text-left font-semibold ${valueClass}`}>{value}</span></div>; }
