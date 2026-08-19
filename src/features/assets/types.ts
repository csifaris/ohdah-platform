export type AssetStatus = 'active' | 'available' | 'maintenance' | 'overdue' | 'retired';

export type Asset = {
  id: string;
  name: string;
  serialNumber: string;
  category: string;
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
};
