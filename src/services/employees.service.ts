import type { Employee } from '../features/employees';
import { api, getOrganizationId } from './api';

type ApiEmployee = Partial<Employee> & { id: string; name: string; department?: unknown; status: string; custodyRecords?: Array<{ asset?: { name?: string; assetNumber?: string }; assignedAt?: string }> };

function mapEmployee(employee: ApiEmployee): Employee {
  const status = employee.status.toLowerCase();
  return {
    id: employee.id,
    name: employee.name,
    email: employee.email || '—',
    department: typeof employee.department === 'string' ? employee.department : (employee.department as unknown as { name?: string } | null)?.name || '—',
    branch: employee.branch || '—',
    jobTitle: employee.jobTitle || '—',
    activeAssets: employee.activeAssets ?? employee.custodyRecords?.length ?? 0,
    lastHandover: employee.lastHandover || '—',
    status: status === 'active' ? 'active' : status === 'inactive' ? 'inactive' : 'on_leave',
    phone: employee.phone || '—',
  };
}

export async function listEmployees(search?: string, departmentId?: string) {
  const { data } = await api.get<ApiEmployee[]>('/employees', { params: { organizationId: getOrganizationId(), search, departmentId } });
  return data.map(mapEmployee);
}
export async function createEmployee(payload: Record<string, unknown>) { const { data } = await api.post<ApiEmployee>('/employees', { organizationId: getOrganizationId(), ...payload }); return mapEmployee(data); }

export async function getEmployee(id: string) {
  const { data } = await api.get<ApiEmployee>(`/employees/${id}`);
  return mapEmployee(data);
}
