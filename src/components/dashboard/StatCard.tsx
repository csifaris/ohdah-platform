import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';

type StatCardProps = { label: string; value: string; trend?: string; trendDirection?: 'up' | 'down' | 'flat'; trendLabel?: string; icon: LucideIcon; tone?: 'primary' | 'tertiary' | 'success' | 'danger' };

const tones = { primary: 'bg-indigo-100 text-primary', tertiary: 'bg-slate-200 text-slate-700', success: 'bg-emerald-100 text-success', danger: 'bg-red-100 text-danger' };

export function StatCard({ label, value, trend, trendDirection, trendLabel, icon: Icon, tone = 'primary' }: StatCardProps) {
  const TrendIcon = trendDirection === 'up' ? ArrowUp : trendDirection === 'down' ? ArrowDown : Minus;
  return <article className={cn('relative flex min-h-40 flex-col justify-between overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-soft transition-shadow hover:shadow-md', tone === 'danger' && 'bg-red-50/30')}><div className="flex items-start justify-between gap-4"><div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', tones[tone])}><Icon size={27} /></div>{trend && <span className={cn('flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold', tone === 'danger' ? 'bg-danger text-white' : trendDirection === 'flat' ? 'bg-slate-100 text-muted' : 'bg-emerald-100 text-success')}><TrendIcon size={14} />{trend}</span>}</div><div><p className={cn('mb-1 text-sm font-medium', tone === 'danger' ? 'text-danger' : 'text-muted')}>{label}</p><div className="flex items-baseline gap-2"><p className={cn('text-3xl font-bold', tone === 'danger' ? 'text-danger' : 'text-ink')}>{value}</p>{trendLabel && <span className="text-xs text-muted">{trendLabel}</span>}</div></div></article>;
}
