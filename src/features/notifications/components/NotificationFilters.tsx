import { Search } from 'lucide-react';

export type NotificationFilter = 'all' | 'unread' | 'custody' | 'maintenance' | 'system';

export function NotificationFilters({
  search,
  filter,
  onSearch,
  onFilter,
}: {
  search: string;
  filter: NotificationFilter;
  onSearch: (value: string) => void;
  onFilter: (value: NotificationFilter) => void;
}) {
  const filters: Array<[NotificationFilter, string]> = [
    ['all', 'الكل'],
    ['custody', 'العهد'],
    ['maintenance', 'الصيانة'],
    ['system', 'النظام'],
    ['unread', 'غير مقروء'],
  ];

  return (
    <div className="space-y-4">
      <label className="relative block">
        <span className="sr-only">بحث في الإشعارات</span>
        <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={17} />
        <input
          className="w-full rounded-xl border border-[#D9E2EC] bg-[#F8FAFC] py-2.5 pl-3 pr-10 text-sm text-[#071426] placeholder-[#64748B] outline-none focus:border-[#062B78] focus:ring-1 focus:ring-[#062B78]"
          dir="rtl"
          onChange={(event) => onSearch(event.target.value)}
          placeholder="بحث في الإشعارات..."
          value={search}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {filters.map(([value, label]) => (
          <button
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
              filter === value
                ? 'bg-[#062B78] text-white shadow-sm'
                : 'border border-[#D9E2EC] bg-white text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
            key={value}
            onClick={() => onFilter(value)}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
