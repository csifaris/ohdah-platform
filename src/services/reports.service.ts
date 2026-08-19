import { api, getOrganizationId } from './api';
export type ReportsSummary = { assets: Array<{ status: string; _count: number }>; employees: number; custody: Array<{ status: string; _count: number }>; maintenance: Array<{ status: string; _count: number; _sum: { cost: number | null } }>; generatedAt: string };
export async function getReportsSummary() { const { data } = await api.get<ReportsSummary>('/reports/summary', { params: { organizationId: getOrganizationId() } }); return data; }
export async function getMaintenanceReport() { const { data } = await api.get('/reports/maintenance', { params: { organizationId: getOrganizationId() } }); return data; }
