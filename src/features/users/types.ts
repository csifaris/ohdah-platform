export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete';
export type User = { id: string; name: string; email: string; role: string; roleIds?: string[]; department: string; branch: string; status: UserStatus; lastActivity: string; createdAt: string };
export type Role = { id: string; name: string; description: string; users: number; permissions: number };
export type PermissionRow = { group: string; feature: string; actions: Record<PermissionAction, boolean> };
