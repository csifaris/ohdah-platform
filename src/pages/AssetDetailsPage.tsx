import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AssetDetails, type Asset } from '../features/assets';
import { getApiErrorMessage } from '../services/api';
import { getAsset } from '../services/assets.service';

export function AssetDetailsPage() {
  const navigate = useNavigate(); const { assetId } = useParams(); const [asset, setAsset] = useState<Asset | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  useEffect(() => { if (!assetId) return; getAsset(assetId).then(setAsset).catch((reason: unknown) => setError(getApiErrorMessage(reason))).finally(() => setLoading(false)); }, [assetId]);
  return <section className="space-y-6"><button className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline" onClick={() => navigate('/admin/assets')} type="button"><ArrowRight size={17} />العودة إلى الأصول</button>{loading && <p className="rounded-lg bg-surface p-4 text-sm text-muted">جاري تحميل تفاصيل الأصل...</p>}{error && <p className="rounded-lg bg-red-50 p-4 text-sm text-danger">{error}</p>}{asset && <AssetDetails asset={asset} onEdit={() => navigate(`/admin/assets/${asset.id}/edit`)} />}</section>;
}
