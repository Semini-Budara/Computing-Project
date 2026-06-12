import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, NavItem } from './Sidebar';
import { Topbar } from './Topbar';
interface DashboardLayoutProps {
  navItems: NavItem[];
}
export function DashboardLayout({ navItems }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-concrete flex">
      <Sidebar
        items={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)} />
      

      <div className="flex-1 flex flex-col md:pl-64 min-w-0 transition-all duration-300">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>);

}