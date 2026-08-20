import type { MaintenanceRequest } from '../features/maintenance';
import { api, getOrganizationId } from './api';

type ApiMaintenance = Partial<MaintenanceRequest> & { id: string; issue: string; status: string; requestedById?: string; assetType?: string; asset?: { id: string; name: string }; requestedBy?: { name?: string }; createdAt?: string };
function mapMaintenance(item: ApiMaintenance): MaintenanceRequest { return { id: item.id, assetId: item.assetId || item.asset?.id, assetType: item.assetType, assetName: item.assetType || item.assetName || item.asset?.name || '—', employee: item.employee || item.requestedBy?.name || '—', requestedById: item.requestedById, issue: item.issue, requestedAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString('ar-SA') : item.requestedAt || '—', technician: item.technician || '—', status: item.status.toLowerCase() as MaintenanceRequest['status'], priority: (item.priority || 'normal').toLowerCase() as MaintenanceRequest['priority'], cost: item.cost == null ? '—' : String(item.cost) }; }
export async function listMaintenance(status?: string) { const { data } = await api.get<ApiMaintenance[]>('/maintenance', { params: { organizationId: getOrganizationId(), status: status?.toUpperCase() } }); return data.map(mapMaintenance); }
export async function createMaintenance(payload: Record<string, unknown>) { const { data } = await api.post<ApiMaintenance>('/maintenance', { organizationId: getOrganizationId(), ...payload }); return mapMaintenance(data); }
export async function updateMaintenance(id: string, payload: Record<string, unknown>) {
  const normalized = {
    ...payload,
    ...(payload.status ? { status: String(payload.status).toUpperCase() } : {}),
  };
  const { data } = await api.patch<ApiMaintenance>(`/maintenance/${id}`, normalized);
  return mapMaintenance(data);
}
export async function deleteMaintenance(id: string) { await api.delete(`/maintenance/${id}`); }
