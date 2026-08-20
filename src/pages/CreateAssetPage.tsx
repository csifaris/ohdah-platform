import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AssetForm, type Asset } from '../features/assets';
import { getApiErrorMessage } from '../services/api';
import { createAsset, updateAsset, getAsset, listAssetCategories, type AssetCategory } from '../services/assets.service';

export function CreateAssetPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = location.pathname.startsWith('/asset-manager') ? '/asset-manager' : '/admin';
  const { id, assetId } = useParams<{ id?: string; assetId?: string }>();
  const effectiveId = id || assetId;
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [initialAsset, setInitialAsset] = useState<Asset | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      listAssetCategories(),
      effectiveId ? getAsset(effectiveId) : Promise.resolve(undefined)
    ])
      .then(([cats, assetData]) => {
        if (active) {
          setCategories(cats);
          if (assetData) setInitialAsset(assetData);
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(getApiErrorMessage(reason, 'تعذر تحميل بيانات الأصل والتصنيفات.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [effectiveId]);

  const save = (asset: Asset) => {
    const category = categories.find((item) => item.name === asset.category) || categories[0];
    setSaving(true);
    setError('');

    const payload: Record<string, unknown> = {
      categoryId: category?.id,
      category: asset.category,
      assetNumber: asset.assetCode || asset.id,
      name: asset.name,
      serialNumber: asset.serialNumber,
      manufacturer: asset.manufacturer || undefined,
      department: asset.department || undefined,
      purchaseDate: asset.purchaseDate && asset.purchaseDate.includes('-') ? asset.purchaseDate : undefined,
      condition: asset.condition || undefined,
      location: asset.location || undefined,
      status: asset.status.toUpperCase(),
      description: asset.notes || undefined,
      notes: asset.notes || undefined,
      image: asset.image || undefined
    };

    const requestPromise = effectiveId
      ? updateAsset(effectiveId, payload)
      : createAsset(payload);

    requestPromise
      .then(() =>
        navigate(`${basePath}/assets`, {
          state: { successMessage: effectiveId ? 'تم تعديل الأصل بنجاح.' : 'تمت إضافة الأصل بنجاح.' }
        })
      )
      .catch((reason: unknown) => setError(getApiErrorMessage(reason, effectiveId ? 'تعذر تعديل الأصل.' : 'تعذر إضافة الأصل.')))
      .finally(() => setSaving(false));
  };

  return (
    <div className="space-y-4">
      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-[#DC2626]" role="alert">{error}</p>}
      {saving && <p className="rounded-xl bg-white border border-[#D9E2EC] p-4 text-sm text-[#64748B]">جاري حفظ بيانات الأصل...</p>}
      {loading ? (
        <p className="rounded-xl bg-[#F8FAFC] border border-[#D9E2EC] p-6 text-sm text-[#64748B]">جاري تحميل البيانات...</p>
      ) : (
        <AssetForm
          initialAsset={initialAsset}
          categories={categories.map((c) => c.name)}
          onCancel={() => navigate(`${basePath}/assets`)}
          onSaved={save}
        />
      )}
    </div>
  );
}
