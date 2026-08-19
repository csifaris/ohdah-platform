import type { Asset } from '../features/assets';
import { api, getOrganizationId } from './api';

type ApiAsset = { id: string; name: string; status: string; category?: unknown; serialNumber?: string; assignee?: string; department?: string; warranty?: string; lastMaintenance?: string; location?: string; manufacturer?: string; model?: string; purchaseDate?: string; condition?: string; notes?: string };
export type AssetQuery = { search?: string; status?: string; categoryId?: string };
export type AssetCategory = { id: string; name: string };

function mapAsset(asset: ApiAsset): Asset {
  return {
    id: asset.id,
    name: asset.name,
    serialNumber: asset.serialNumber || '—',
    category: typeof asset.category === 'string' ? asset.category : (asset.category as { name?: string } | null)?.name || 'غير مصنف',
    status: asset.status.toLowerCase() as Asset['status'],
    assignee: asset.assignee || 'غير مخصص',
    department: asset.department || '—',
    warranty: asset.warranty || 'غير محدد',
    lastMaintenance: asset.lastMaintenance || '—',
    location: asset.location || '—',
    manufacturer: asset.manufacturer || '—',
    model: asset.model || '—',
    purchaseDate: asset.purchaseDate || '—',
    condition: asset.condition || 'غير محددة',
    notes: asset.notes || '',
  };
}

export async function listAssets(query: AssetQuery = {}) {
  const { data } = await api.get<ApiAsset[]>('/assets', { params: { organizationId: getOrganizationId(), ...query } });
  return data.map(mapAsset);
}
export async function listAssetCategories() { const { data } = await api.get<AssetCategory[]>('/assets/categories', { params: { organizationId: getOrganizationId() } }); return data; }

export async function getAsset(id: string) {
  const { data } = await api.get<ApiAsset>(`/assets/${id}`);
  return mapAsset(data);
}

export async function createAsset(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiAsset>('/assets', { organizationId: getOrganizationId(), ...payload });
  return mapAsset(data);
}

export async function updateAsset(id: string, payload: Record<string, unknown>) {
  const { data } = await api.patch<ApiAsset>(`/assets/${id}`, payload);
  return mapAsset(data);
}

export async function updateAssetStatus(id: string, status: string) {
  const { data } = await api.patch<ApiAsset>(`/assets/${id}/status`, { status: status.toUpperCase() });
  return mapAsset(data);
}
