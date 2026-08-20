import type { LucideIcon } from 'lucide-react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';

type StatCardProps = {
  label: string;
  value: string;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'flat';
  trendLabel?: string;
  icon: LucideIcon;
  tone?: 'primary' | 'tertiary' | 'success' | 'danger';
};

const toneConfig = {
  primary: {
    iconCircle: 'bg-[#071426] text-[#D4AF37]',
    valueText: 'text-[#071426]',
    borderAccent: 'border-t-[#062B78]',
  },
  tertiary: {
    iconCircle: 'bg-[#FFF7E6] text-[#D4AF37] border border-[#D4AF37]/40',
    valueText: 'text-[#071426]',
    borderAccent: 'border-t-[#D4AF37]',
  },
  success: {
    iconCircle: 'bg-emerald-50 text-[#059669] border border-emerald-200',
    valueText: 'text-[#071426]',
    borderAccent: 'border-t-[#059669]',
  },
  danger: {
    iconCircle: 'bg-red-50 text-[#DC2626] border border-red-200',
    valueText: 'text-[#DC2626]',
    borderAccent: 'border-t-[#DC2626]',
  },
};

export function StatCard({
  label,
  value,
  trend,
  trendDirection,
  trendLabel,
  icon: Icon,
  tone = 'primary',
}: StatCardProps) {
  const TrendIcon = trendDirection === 'up' ? ArrowUp : trendDirection === 'down' ? ArrowDown : Minus;
  const cfg = toneConfig[tone];

  return (
    <article
      className={cn(
        'relative flex h-[140px] min-h-[140px] flex-col justify-between overflow-hidden rounded-2xl border border-[#D9E2EC] border-t-4 bg-white p-5 shadow-soft transition-all hover:shadow-md',
        cfg.borderAccent,
        tone === 'danger' && 'bg-red-50/20'
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-full shadow-sm', cfg.iconCircle)}>
          <Icon size={22} />
        </div>
        {trend && (
          <span
            className={cn(
              'flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold',
              tone === 'danger'
                ? 'bg-red-100 text-[#DC2626]'
                : trendDirection === 'flat'
                ? 'bg-slate-100 text-[#64748B]'
                : 'bg-emerald-100 text-[#059669]'
            )}
          >
            <TrendIcon size={12} />
            {trend}
          </span>
        )}
      </div>

      <div data-font="data">
        <p className={cn('mb-1 text-xs font-bold uppercase tracking-wider', tone === 'danger' ? 'text-[#DC2626]' : 'text-[#64748B]')}>
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <p className={cn('text-4xl font-extrabold tracking-tight', cfg.valueText)}>{value}</p>
          {trendLabel && <span className="text-xs font-medium text-[#64748B]">{trendLabel}</span>}
        </div>
      </div>
    </article>
  );
}
