import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { EmployeeSidebar } from '../components/EmployeeSidebar';
import { TopBar } from '../components/TopBar';

export function PortalLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-surface">
      <EmployeeSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-w-0 flex-1">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="mx-auto w-full max-w-[1440px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
