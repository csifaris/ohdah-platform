import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { Asset } from '../types';
import { AssetStatusBadge } from './AssetStatusBadge';

export function AssetTable({ assets, onOpen, onEdit, onDelete }: { assets: Asset[]; onOpen: (asset: Asset) => void; onEdit?: (asset: Asset) => void; onDelete?: (id: string) => void }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#D9E2EC]">
      <table className="w-full min-w-[980px] text-right">
        <thead className="border-b border-[#D9E2EC] bg-[#F8FAFC] text-xs font-bold uppercase tracking-wider text-[#071426]">
          <tr>
            <th className="w-12 px-3 py-4 text-center">
              <input aria-label="تحديد كل الأصول" className="h-4 w-4 rounded border-[#D9E2EC] text-[#062B78] focus:ring-[#062B78]" type="checkbox" />
            </th>
            {['كود الأصل', 'اسم الأصل', 'الرقم التسلسلي', 'التصنيف', 'الحالة', 'المستلم الحالي', 'الإجراءات'].map((heading) => (
              <th className="px-3 py-4" key={heading}>{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D9E2EC] bg-white text-sm">
          {assets.map((asset) => (
            <tr
              className="cursor-pointer transition-colors hover:bg-[#FFF7E6]"
              key={asset.id}
              onClick={() => onOpen(asset)}
            >
              <td className="px-3 py-4 text-center" onClick={(event) => event.stopPropagation()}>
                <input aria-label={`تحديد ${asset.name}`} className="h-4 w-4 rounded border-[#D9E2EC] text-[#062B78] focus:ring-[#062B78]" type="checkbox" />
              </td>
              <td className="px-3 py-4 font-mono text-sm font-bold text-[#062B78]">{asset.assetCode || asset.id.slice(0, 8).toUpperCase()}</td>
              <td className="px-3 py-4">
                <p className="font-semibold text-[#071426]">{asset.name}</p>
                <p className="text-xs text-[#64748B]">{asset.manufacturer}</p>
              </td>
              <td className="px-3 py-4 font-mono text-xs text-[#64748B]">{asset.serialNumber}</td>
              <td className="px-3 py-4 text-[#071426]">{asset.category}</td>
              <td className="px-3 py-4"><AssetStatusBadge status={asset.status} /></td>
              <td className="px-3 py-4 text-[#071426]">{asset.assignee}</td>
              <td className="px-3 py-4 text-center" onClick={(event) => event.stopPropagation()}>
                <div className="flex items-center justify-center gap-1">
                  <button aria-label={`عرض ${asset.name}`} className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#062B78]/10 hover:text-[#062B78]" onClick={() => onOpen(asset)} type="button">
                    <Eye size={16} />
                  </button>
                  {onEdit && (
                    <button aria-label={`تعديل ${asset.name}`} className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#062B78]/10 hover:text-[#062B78]" onClick={() => onEdit(asset)} type="button">
                      <Pencil size={16} />
                    </button>
                  )}
                  {onDelete && (
                    <button aria-label={`حذف ${asset.name}`} className="rounded-lg p-1.5 text-[#DC2626] hover:bg-red-50 hover:text-red-700" onClick={() => onDelete(asset.id)} type="button">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {assets.length === 0 && <div className="bg-white px-6 py-14 text-center text-sm text-[#64748B]">لا توجد أصول مطابقة للفلاتر الحالية.</div>}
    </div>
  );
}
