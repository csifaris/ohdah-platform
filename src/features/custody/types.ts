export type CustodyStatus = 'active' | 'overdue' | 'returned' | 'lost' | 'maintenance';
export type RequestStatus = 'pending' | 'approved' | 'rejected' | 'assigned';

export interface CustodyRecord {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  employeeId?: string;
  employee: string;
  department: string;
  assignedAt: string;
  dueDate: string;
  status: CustodyStatus;
  notes: string;
};
export interface CustodyRequest { 
  id: string; 
  requesterId?: string;
  requester: string; 
  department: string; 
  category: string; 
  reason: string; 
  requestedAt: string; 
  status: RequestStatus; 
  assetName: string; 
  priority: 'normal' | 'high';
  rejectionReason?: string;
  employeeReply?: string;
  repliedAt?: string;
  requesterData?: { employeeNumber?: string; email?: string; phone?: string };
}
