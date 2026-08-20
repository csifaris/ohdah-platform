export type AssetStatus = 'active' | 'available' | 'maintenance' | 'overdue' | 'retired';

export type CustodyHistoryItem = {
  id: string;
  employeeName: string;
  assignedAt: string;
  returnedAt?: string;
  status: string;
};

export type MaintenanceHistoryItem = {
  id: string;
  issue: string;
  requestedAt: string;
  status: string;
  technician?: string;
};

export type Asset = {
  id: string;
  assetCode?: string;
  name: string;
  serialNumber: string;
  category: string;
  categoryId?: string;
  status: AssetStatus;
  assignee: string;
  department: string;
  warranty: string;
  lastMaintenance: string;
  location: string;
  manufacturer: string;
  model: string;
  purchaseDate: string;
  condition: string;
  notes: string;
  image?: string;
  custodyHistory?: CustodyHistoryItem[];
  maintenanceHistory?: MaintenanceHistoryItem[];
};
