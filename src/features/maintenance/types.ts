export type MaintenanceStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';
export type MaintenanceRequest = { id: string; assetId?: string; assetType?: string; assetName: string; employee: string; requestedById?: string; issue: string; requestedAt: string; technician: string; status: MaintenanceStatus; priority: 'normal' | 'urgent'; cost: string; };
