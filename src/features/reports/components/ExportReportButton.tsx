import { Download, FileSpreadsheet, FileText } from 'lucide-react';

export function ExportReportButton({
  onExportExcel,
  onExportPdf,
  onExportAll,
}: {
  onExportExcel?: () => void;
  onExportPdf?: () => void;
  onExportAll?: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        className="flex items-center gap-2 rounded-xl bg-[#062B78] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#071426]"
        onClick={onExportAll || onExportExcel}
        type="button"
      >
        <Download size={16} />
        تصدير التقرير
      </button>
      <button
        className="flex items-center gap-2 rounded-xl border border-[#D9E2EC] bg-white px-3.5 py-2 text-xs font-semibold text-[#071426] hover:bg-[#F8FAFC]"
        onClick={onExportExcel}
        type="button"
      >
        <FileSpreadsheet size={15} className="text-[#059669]" />
        Excel
      </button>
      <button
        className="flex items-center gap-2 rounded-xl border border-[#D9E2EC] bg-white px-3.5 py-2 text-xs font-semibold text-[#071426] hover:bg-[#F8FAFC]"
        onClick={onExportPdf}
        type="button"
      >
        <FileText size={15} className="text-[#DC2626]" />
        PDF
      </button>
    </div>
  );
}
