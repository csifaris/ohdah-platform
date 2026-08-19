import { Bell, Menu, Search } from 'lucide-react';

type TopBarProps = { onMenuClick: () => void };

export function TopBar({ onMenuClick }: TopBarProps) {
  return <header className="flex min-h-20 items-center justify-between gap-4 border-b border-border bg-white px-4 sm:px-8">
    <div className="flex items-center gap-3"><button aria-label="فتح القائمة" className="rounded-lg p-2 text-muted hover:bg-surface lg:hidden" onClick={onMenuClick}><Menu size={22} /></button><div className="hidden items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-muted sm:flex"><Search size={17} /><input aria-label="بحث" className="w-48 bg-transparent outline-none" placeholder="بحث..." /></div></div>
    <div className="flex items-center gap-4"><button aria-label="الإشعارات" className="relative rounded-xl p-2 text-muted hover:bg-surface"><Bell size={20} /><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-danger" /></button><div className="flex items-center gap-3 border-r border-border pr-4"><div className="hidden text-left sm:block"><p className="text-sm font-semibold">أحمد محمد</p><p className="text-xs text-muted">مدير الأصول</p></div><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light font-semibold text-primary">أم</div></div></div>
  </header>;
}
