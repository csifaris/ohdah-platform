import type { CustodyRecord, CustodyRequest } from '../features/custody';
import { api, getOrganizationId } from './api';

type ApiRecord = Partial<CustodyRecord> & { id: string; status: string; asset?: { name?: string; category?: { name?: string } | string; assetNumber?: string }; employee?: { name?: string; department?: { name?: string } | string } };
type ApiRequest = Partial<CustodyRequest> & { id: string; status: string; requesterName?: string; requester?: { name?: string; department?: { name?: string } | string } };

const text = (value: unknown, fallback = '—') => typeof value === 'string' && value ? value : fallback;
const status = (value: string) => value.toLowerCase() as CustodyRecord['status'];

function mapRecord(record: ApiRecord): CustodyRecord {
  const department = record.employee?.department;
  const category = record.asset?.category;
  return { id: record.id, assetId: record.assetId || '', assetName: text(record.assetName || record.asset?.name), category: text(record.category || (typeof category === 'string' ? category : category?.name)), employee: text(record.employee), department: text(record.department || (typeof department === 'string' ? department : department?.name)), assignedAt: text(record.assignedAt), status: status(record.status), dueDate: text(record.dueDate), notes: record.notes || '' };
}

function mapRequest(request: ApiRequest): CustodyRequest {
  const department = request.requester?.department;
  return { id: request.id, requester: text(request.requesterName || request.requester?.name), department: text(request.department || (typeof department === 'string' ? department : department?.name)), category: text(request.category), reason: text(request.reason), requestedAt: text(request.requestedAt), status: request.status.toLowerCase() as CustodyRequest['status'], assetName: text(request.assetName), priority: request.priority || 'normal' };
}

export async function listCustody(statusFilter?: string) { const { data } = await api.get<ApiRecord[]>('/custody/records', { params: { organizationId: getOrganizationId(), status: statusFilter?.toUpperCase() } }); return data.map(mapRecord); }
export async function listCustodyRequests(statusFilter?: string) { const { data } = await api.get<ApiRequest[]>('/custody/requests', { params: { organizationId: getOrganizationId(), status: statusFilter?.toUpperCase() } }); return data.map(mapRequest); }
export async function approveCustodyRequest(id: string) { const { data } = await api.patch<ApiRequest>(`/custody/requests/${id}/approve`); return mapRequest(data); }
export async function rejectCustodyRequest(id: string) { const { data } = await api.patch<ApiRequest>(`/custody/requests/${id}/reject`); return mapRequest(data); }
export async function assignCustody(payload: Record<string, unknown>) { const { data } = await api.post<ApiRecord>('/custody/records', { organizationId: getOrganizationId(), ...payload }); return mapRecord(data); }
export async function returnCustody(id: string, returnNotes?: string) { const { data } = await api.patch<ApiRecord>(`/custody/records/${id}/return`, { returnNotes }); return mapRecord(data); }
