import { api, getOrganizationId } from './api';

export type AuditLogEntry = {
  id: string;
  actorId?: string;
  actor?: { name?: string; email?: string };
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export async function listAuditLogs(resource?: string): Promise<AuditLogEntry[]> {
  try {
    const { data } = await api.get<AuditLogEntry[]>('/audit-logs', {
      params: { organizationId: getOrganizationId(), resource },
    });
    return data;
  } catch {
    // Fallback if no backend records yet
    return [];
  }
}
