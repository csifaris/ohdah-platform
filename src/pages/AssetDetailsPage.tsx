import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AssetDetails, type Asset } from '../features/assets';
import { getApiErrorMessage } from '../services/api';
import { getAsset } from '../services/assets.service';

export function AssetDetailsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/asset-manager') ? '/asset-manager' : '/admin';
  const { id, assetId } = useParams<{ id?: string; assetId?: string }>();
  const effectiveId = id || assetId;
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!effectiveId) return;
    getAsset(effectiveId)
      .then(setAsset)
      .catch((reason: unknown) => setError(getApiErrorMessage(reason, 'تعذر تحميل تفاصيل الأصل.')))
      .finally(() => setLoading(false));
  }, [effectiveId]);

  return (
    <section className="space-y-6">
      <button
        className="flex items-center gap-2 text-sm font-semibold text-[#062B78] hover:underline"
        onClick={() => navigate(`${basePath}/assets`)}
        type="button"
      >
        <ArrowRight size={17} />
        العودة إلى الأصول
      </button>
      {loading && <p className="rounded-xl bg-white border border-[#D9E2EC] p-6 text-sm text-[#64748B]">جاري تحميل تفاصيل الأصل وسجل العمليات...</p>}
      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-[#DC2626]">{error}</p>}
      {asset && <AssetDetails asset={asset} onEdit={() => navigate(`${basePath}/assets/${asset.id}/edit`)} />}
    </section>
  );
}
