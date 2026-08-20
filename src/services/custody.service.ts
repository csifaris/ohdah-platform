import type { CustodyRecord, CustodyRequest } from '../features/custody';
import { api, getOrganizationId } from './api';

type ApiRecord = Partial<CustodyRecord> & {
  id: string;
  status: string;
  dueAt?: string;
  assignedAt?: string;
  asset?: { name?: string; category?: { name?: string } | string; assetNumber?: string };
  employeeId?: string;
  employee?: string | { name?: string; department?: { name?: string } | string };
  handoverNotes?: string;
};

type ApiRequest = Partial<CustodyRequest> & {
  id: string;
  status: string;
  requesterId?: string;
  requesterName?: string;
  requester?: { name?: string; employeeNumber?: string; email?: string; phone?: string; department?: { name?: string } | string };
  createdAt?: string;
};

const text = (value: unknown, fallback = '—') => (typeof value === 'string' && value ? value : fallback);
const status = (value: string) => value.toLowerCase() as CustodyRecord['status'];

function mapRecord(record: ApiRecord): CustodyRecord {
  const emp = record.employee as unknown as Record<string, unknown>;
  const department = emp?.department;
  const category = record.asset?.category;

  const rawDue = record.dueAt || record.dueDate;
  const rawAssigned = record.assignedAt;

  const assignedAtFormatted = rawAssigned
    ? new Date(rawAssigned).toISOString().split('T')[0]
    : '—';

  const dueDateFormatted = rawDue
    ? new Date(rawDue).toISOString().split('T')[0]
    : '—';

  let currentStatus = status(record.status);
  if (currentStatus === 'active' && rawDue && new Date(rawDue).getTime() < new Date().setHours(0, 0, 0, 0)) {
    currentStatus = 'overdue';
  }

  return {
    id: record.id,
    assetId: record.assetId || '',
    assetName: text(record.assetName || record.asset?.name),
    category: text(record.category || (typeof category === 'string' ? category : category?.name)),
    employeeId: record.employeeId,
    employee: text(typeof emp === 'string' ? emp : (emp?.name as string)),
    department: text(record.department || (typeof department === 'string' ? department : ((department as Record<string, unknown>)?.name as string))),
    assignedAt: assignedAtFormatted,
    status: currentStatus,
    dueDate: dueDateFormatted,
    notes: record.notes || record.handoverNotes || '',
  };
}

function mapRequest(request: ApiRequest): CustodyRequest {
  const department = request.requester?.department;
  const requester = request.requester;
  return {
    id: request.id,
    requesterId: request.requesterId,
    requester: text(request.requesterName || requester?.name),
    department: text(request.department || (typeof department === 'string' ? department : department?.name)),
    category: text(request.category),
    reason: text(request.reason),
    requestedAt: request.createdAt ? new Date(request.createdAt).toLocaleDateString('ar-SA') : text(request.requestedAt),
    status: request.status.toLowerCase() as CustodyRequest['status'],
    assetName: text(request.assetName),
    priority: request.priority || 'normal',
    rejectionReason: request.rejectionReason,
    employeeReply: request.employeeReply,
    repliedAt: request.repliedAt,
    requesterData: requester
      ? {
          employeeNumber: requester.employeeNumber,
          email: requester.email,
          phone: requester.phone,
        }
      : undefined,
  };
}

export async function listCustody(statusFilter?: string) {
  const { data } = await api.get<ApiRecord[]>('/custody/records', {
    params: { organizationId: getOrganizationId(), status: statusFilter?.toUpperCase() },
  });
  return data.map(mapRecord);
}

export async function listCustodyRequests(statusFilter?: string) {
  const { data } = await api.get<ApiRequest[]>('/custody/requests', {
    params: { organizationId: getOrganizationId(), status: statusFilter?.toUpperCase() },
  });
  return data.map(mapRequest);
}

export async function approveCustodyRequest(id: string) {
  const { data } = await api.patch<ApiRequest>(`/custody/requests/${id}/approve`);
  return mapRequest(data);
}

export async function rejectCustodyRequest(id: string, rejectionReason?: string) {
  const { data } = await api.patch<ApiRequest>(`/custody/requests/${id}/reject`, { rejectionReason });
  return mapRequest(data);
}

export async function replyCustodyRequest(id: string, employeeReply: string) {
  const { data } = await api.patch<ApiRequest>(`/custody/requests/${id}/reply`, { employeeReply });
  return mapRequest(data);
}

export async function assignCustody(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiRecord>('/custody/records', {
    organizationId: getOrganizationId(),
    ...payload,
  });
  return mapRecord(data);
}

export async function returnCustody(id: string, returnNotes?: string) {
  const { data } = await api.patch<ApiRecord>(`/custody/records/${id}/return`, { returnNotes });
  return mapRecord(data);
}

export async function createCustodyRequest(payload: Record<string, unknown>) {
  const { data } = await api.post<ApiRequest>('/custody/requests', {
    organizationId: getOrganizationId(),
    ...payload,
  });
  return mapRequest(data);
}

export async function deleteCustodyRequest(id: string) {
  const { data } = await api.delete(`/custody/requests/${id}`);
  return data;
}

export async function listAdminCustodyRequests(statusFilter?: string) {
  const { data } = await api.get<ApiRequest[]>('/custody/admin/requests', {
    params: { organizationId: getOrganizationId(), status: statusFilter?.toUpperCase() },
  });
  return data.map(mapRequest);
}

export async function getAdminCustodyRequest(id: string) {
  const { data } = await api.get<ApiRequest>(`/custody/admin/requests/${id}`);
  return mapRequest(data);
}

export async function adminApproveCustodyRequest(id: string) {
  const { data } = await api.patch<ApiRequest>(`/custody/admin/requests/${id}/approve`);
  return mapRequest(data);
}

export async function adminRejectCustodyRequest(id: string, rejectionReason: string) {
  const { data } = await api.patch<ApiRequest>(`/custody/admin/requests/${id}/reject`, { rejectionReason });
  return mapRequest(data);
}

export async function adminAssignCustodyRequest(id: string, assetId: string, dueAt?: string) {
  const { data } = await api.patch<ApiRequest>(`/custody/admin/requests/${id}/assign`, { assetId, dueAt });
  return mapRequest(data);
}
