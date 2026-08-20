import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './index.css';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { AdminLayout } from './layouts/AdminLayout';
import { AppShell } from './layouts/AppShell';
import { PortalLayout } from './layouts/PortalLayout';
import { AssetManagerLayout } from './layouts/AssetManagerLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EmployeeDashboardPage } from './pages/EmployeeDashboardPage';
import { EmployeeCustodyPage } from './pages/EmployeeCustodyPage';
import { EmployeeNewCustodyRequestPage } from './pages/EmployeeNewCustodyRequestPage';
import { EmployeeMaintenancePage } from './pages/EmployeeMaintenancePage';
import { EmployeeNewMaintenancePage } from './pages/EmployeeNewMaintenancePage';
import { EmployeeMaintenanceDetailsPage } from './pages/EmployeeMaintenanceDetailsPage';
import { EmployeeRequestDetailsPage } from './pages/EmployeeRequestDetailsPage';
import { EmployeeProfilePage } from './pages/EmployeeProfilePage';
import { EmployeeRequestsPage } from './pages/EmployeeRequestsPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssetDetailsPage } from './pages/AssetDetailsPage';
import { CreateAssetPage } from './pages/CreateAssetPage';
import { AdminCustodyRequestDetailsPage } from './pages/AdminCustodyRequestDetailsPage';
import { ReturnCustodyPage } from './pages/ReturnCustodyPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { UsersPermissionsPage } from './pages/UsersPermissionsPage';
import { UsersManagementPage } from './pages/UsersManagementPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdminAuditLogsPage } from './pages/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';
import { AssetManagerDashboardPage } from './pages/AssetManagerDashboardPage';
import { AssetManagerAssetsPage } from './pages/AssetManagerAssetsPage';
import { AssetManagerInventoryPage } from './pages/AssetManagerInventoryPage';
import { AssetManagerCustodyPage } from './pages/AssetManagerCustodyPage';
import { AssetManagerCustodyRequestsPage } from './pages/AssetManagerCustodyRequestsPage';
import { AssetManagerAssignCustodyPage } from './pages/AssetManagerAssignCustodyPage';
import { AssetManagerMaintenancePage } from './pages/AssetManagerMaintenancePage';
import { AssetManagerReportsPage } from './pages/AssetManagerReportsPage';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Admin Portal (System Administration only) */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<DashboardPage />} />
                <Route path="/admin/users" element={<UsersManagementPage />} />
                <Route path="/admin/users-permissions" element={<UsersPermissionsPage />} />
                <Route path="/admin/roles-permissions" element={<UsersPermissionsPage />} />
                <Route path="/admin/employees" element={<EmployeesPage />} />
                <Route path="/admin/organization" element={<EmployeesPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
                <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
                <Route path="/admin/notifications" element={<NotificationsPage />} />
              </Route>
            </Route>

            {/* Asset Manager Portal */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ASSET_MANAGER']} />}>
              <Route element={<AssetManagerLayout />}>
                <Route path="/asset-manager/dashboard" element={<AssetManagerDashboardPage />} />
                <Route path="/asset-manager/assets" element={<AssetManagerAssetsPage />} />
                <Route path="/asset-manager/assets/new" element={<CreateAssetPage />} />
                <Route path="/asset-manager/assets/:assetId" element={<AssetDetailsPage />} />
                <Route path="/asset-manager/assets/:assetId/edit" element={<CreateAssetPage />} />
                <Route path="/asset-manager/inventory" element={<AssetManagerInventoryPage />} />
                <Route path="/asset-manager/custody" element={<AssetManagerCustodyPage />} />
                <Route path="/asset-manager/custody/assign" element={<AssetManagerAssignCustodyPage />} />
                <Route path="/asset-manager/custody/requests" element={<AssetManagerCustodyRequestsPage />} />
                <Route path="/asset-manager/custody/requests/:id" element={<AdminCustodyRequestDetailsPage />} />
                <Route path="/asset-manager/custody/:custodyId/return" element={<ReturnCustodyPage />} />
                <Route path="/asset-manager/maintenance" element={<AssetManagerMaintenancePage />} />
                <Route path="/asset-manager/reports" element={<AssetManagerReportsPage />} />
                <Route path="/asset-manager/notifications" element={<NotificationsPage />} />
              </Route>
            </Route>

            {/* Employee Portal */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'EMPLOYEE']} />}>
              <Route element={<PortalLayout />}>
                <Route path="/portal" element={<EmployeeDashboardPage />} />
                <Route path="/portal/custody" element={<EmployeeCustodyPage />} />
                <Route path="/portal/requests" element={<EmployeeRequestsPage />} />
                <Route path="/portal/requests/new" element={<EmployeeNewCustodyRequestPage />} />
                <Route path="/portal/requests/:id" element={<EmployeeRequestDetailsPage />} />
                <Route path="/portal/maintenance" element={<EmployeeMaintenancePage />} />
                <Route path="/portal/maintenance/new" element={<EmployeeNewMaintenancePage />} />
                <Route path="/portal/maintenance/:id" element={<EmployeeMaintenanceDetailsPage />} />
                <Route path="/portal/notifications" element={<NotificationsPage />} />
                <Route path="/employee/notifications" element={<NotificationsPage />} />
                <Route path="/portal/profile" element={<EmployeeProfilePage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
