import { CheckCircle2, CircleAlert, CircleDot, Clock3, Wrench } from 'lucide-react';
import type { AssetStatus } from '../types';

const statuses: Record<AssetStatus, { label: string; classes: string; icon: typeof CheckCircle2 }> = {
  active: { label: 'نشطة', classes: 'bg-emerald-100 text-success', icon: CheckCircle2 },
  available: { label: 'متاحة', classes: 'bg-indigo-100 text-primary', icon: CircleDot },
  maintenance: { label: 'في الصيانة', classes: 'bg-amber-100 text-warning', icon: Wrench },
  overdue: { label: 'متأخرة', classes: 'bg-red-100 text-danger', icon: Clock3 },
  retired: { label: 'مستبعدة', classes: 'bg-slate-100 text-muted', icon: CircleAlert },
};

export function AssetStatusBadge({ status }: { status: AssetStatus }) { const item = statuses[status]; const Icon = item.icon; return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${item.classes}`}><Icon size={14} />{item.label}</span>; }
