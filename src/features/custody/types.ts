export type CustodyStatus = 'active' | 'overdue' | 'returned' | 'lost' | 'maintenance';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'assigned';

export type CustodyRecord = { id: string; assetId: string; assetName: string; category: string; employee: string; department: string; assignedAt: string; status: CustodyStatus; dueDate: string; notes: string };
export type CustodyRequest = { id: string; requester: string; department: string; category: string; reason: string; requestedAt: string; status: RequestStatus; assetName: string; priority: 'normal' | 'high' };
