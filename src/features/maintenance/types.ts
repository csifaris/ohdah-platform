export type MaintenanceStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type MaintenanceRequest = { id: string; assetName: string; assetId: string; employee: string; issue: string; requestedAt: string; technician: string; status: MaintenanceStatus; priority: 'normal' | 'urgent'; cost: string };
