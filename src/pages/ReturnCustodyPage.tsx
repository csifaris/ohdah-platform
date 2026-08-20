import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ReturnInspectionForm } from '../features/custody';
import { getApiErrorMessage } from '../services/api';
import { returnCustody } from '../services/custody.service';

export function ReturnCustodyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/asset-manager') ? '/asset-manager' : '/admin';
  const { custodyId } = useParams();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const save = () => {
    if (!custodyId) return;
    setSaving(true);
    returnCustody(custodyId)
      .then(() => navigate(`${basePath}/custody`))
      .catch((reason: unknown) => setError(getApiErrorMessage(reason)))
      .finally(() => setSaving(false));
  };

  return (
    <section className="space-y-6">
      <button
        className="flex items-center gap-2 text-sm font-semibold text-[#062B78] hover:underline"
        onClick={() => navigate(`${basePath}/custody`)}
        type="button"
      >
        <ArrowRight size={17} />
        العودة إلى العهد
      </button>
      <div className="flex items-end justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-[#062B78]">{custodyId ?? '—'}</p>
          <h1 className="text-3xl font-bold text-[#071426]">استرجاع عهدة</h1>
          <p className="mt-2 text-sm text-[#64748B]">فحص الأصل وتوثيق استلامه من الموظف وإعادته للمخزون</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-[#062B78]">
          <CheckCircle2 size={17} />
          فحص الأصل
        </div>
      </div>
      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-[#DC2626]">{error}</p>}
      {saving && <p className="rounded-xl bg-white border border-[#D9E2EC] p-4 text-sm text-[#64748B]">جاري تسجيل الإرجاع...</p>}
      <ReturnInspectionForm onSaved={save} />
    </section>
  );
}
