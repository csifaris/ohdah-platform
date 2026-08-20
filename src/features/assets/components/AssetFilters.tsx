import { Filter, Grid2X2, List, Search, SlidersHorizontal, X } from 'lucide-react';

type AssetFiltersProps = {
  search: string;
  category: string;
  status: string;
  view: 'table' | 'grid';
  categories?: string[];
  onSearch: (value: string) => void;
  onCategory: (value: string) => void;
  onStatus: (value: string) => void;
  onView: (view: 'table' | 'grid') => void;
  onReset: () => void;
};

export function AssetFilters({ search, category, status, view, categories, onSearch, onCategory, onStatus, onView, onReset }: AssetFiltersProps) {
  const hasFilters = Boolean(search || category || status);
  const defaultCategories = ['أجهزة حاسب', 'أجهزة مكتبية', 'أثاث مكتبي', 'المركبات والآليات'];
  const categoryOptions = categories && categories.length > 0 ? categories : defaultCategories;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">البحث عن أصل</span>
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            className="w-full rounded-lg border border-border bg-white py-2.5 pl-3 pr-10 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
            onChange={(event) => onSearch(event.target.value)}
            placeholder="البحث برقم الأصل، الاسم، أو الموظف..."
            type="search"
            value={search}
          />
        </label>
        <select
          aria-label="التصنيف"
          className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
          onChange={(event) => onCategory(event.target.value)}
          value={category}
        >
          <option value="">التصنيف (الكل)</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          aria-label="الحالة"
          className="rounded-lg border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary"
          onChange={(event) => onStatus(event.target.value)}
          value={status}
        >
          <option value="">الحالة (الكل)</option>
          <option value="active">نشطة</option>
          <option value="available">متاحة</option>
          <option value="maintenance">في الصيانة</option>
          <option value="overdue">متأخرة</option>
          <option value="retired">مستبعدة</option>
        </select>
        <div className="flex items-center gap-2">
          <button
            className={`rounded-lg border p-2.5 ${view === 'table' ? 'border-primary bg-primary-light text-primary' : 'border-border text-muted'}`}
            onClick={() => onView('table')}
            aria-label="عرض القائمة"
            type="button"
          >
            <List size={18} />
          </button>
          <button
            className={`rounded-lg border p-2.5 ${view === 'grid' ? 'border-primary bg-primary-light text-primary' : 'border-border text-muted'}`}
            onClick={() => onView('grid')}
            aria-label="عرض الشبكة"
            type="button"
          >
            <Grid2X2 size={18} />
          </button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button className="flex items-center gap-1 text-primary hover:underline" type="button">
          <SlidersHorizontal size={16} />
          مزيد من الفلاتر
        </button>
        {hasFilters && (
          <button className="flex items-center gap-1 text-muted hover:text-danger" onClick={onReset} type="button">
            <X size={15} />
            مسح الفلاتر
          </button>
        )}
        <span className="text-xs text-muted">
          <Filter size={13} className="mx-1 inline" />
          الفلاتر قابلة للتوسعة
        </span>
      </div>
    </div>
  );
}
