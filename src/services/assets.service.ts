import type { Asset } from '../features/assets';
import { api, getOrganizationId } from './api';

type ApiAsset = {
  id: string;
  assetNumber?: string;
  name: string;
  status: string;
  categoryId?: string;
  category?: unknown;
  serialNumber?: string;
  assignee?: string;
  department?: string;
  warranty?: string;
  lastMaintenance?: string;
  location?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string;
  condition?: string;
  notes?: string;
  description?: string;
  image?: string;
  custodyRecords?: Array<{
    id: string;
    employee?: { name?: string };
    assignedAt?: string;
    returnedAt?: string;
    status: string;
  }>;
  maintenanceRequests?: Array<{
    id: string;
    issue: string;
    createdAt?: string;
    status: string;
    technician?: string;
  }>;
};

export type AssetQuery = { search?: string; status?: string; categoryId?: string };
export type AssetCategory = { id: string; name: string };

function mapAsset(asset: ApiAsset): Asset {
  const activeCustody = asset.custodyRecords?.find((c) => !c.returnedAt);
  const currentHolder = activeCustody?.employee?.name || asset.assignee || 'غير مخصص';
  const categoryObj = asset.category as { id?: string; name?: string } | null;

  return {
    id: asset.id,
    assetCode: asset.assetNumber || asset.id.slice(0, 8).toUpperCase(),
    name: asset.name,
    serialNumber: asset.serialNumber || '—',
    category: typeof asset.category === 'string' ? asset.category : categoryObj?.name || 'غير مصنف',
    categoryId: asset.categoryId || categoryObj?.id,
    status: asset.status.toLowerCase() as Asset['status'],
    assignee: currentHolder,
    department: asset.department || '—',
    warranty: asset.warranty || 'غير محدد',
    lastMaintenance: asset.lastMaintenance || '—',
    location: asset.location || '—',
    manufacturer: asset.manufacturer || '—',
    model: asset.model || '—',
    purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('ar-SA') : '—',
    condition: asset.condition || 'غير محددة',
    notes: asset.notes || asset.description || '',
    image: asset.image,
    custodyHistory: asset.custodyRecords?.map((c) => ({
      id: c.id,
      employeeName: c.employee?.name || 'غير محدد',
      assignedAt: c.assignedAt ? new Date(c.assignedAt).toLocaleDateString('ar-SA') : '—',
      returnedAt: c.returnedAt ? new Date(c.returnedAt).toLocaleDateString('ar-SA') : undefined,
      status: c.status
    })),
    maintenanceHistory: asset.maintenanceRequests?.map((m) => ({
      id: m.id,
      issue: m.issue,
      requestedAt: m.createdAt ? new Date(m.createdAt).toLocaleDateString('ar-SA') : '—',
      status: m.status,
      technician: m.technician || 'غير محدد'
    }))
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

export async function deleteAsset(id: string) {
  const { data } = await api.delete(`/assets/${id}`);
  return data;
}
