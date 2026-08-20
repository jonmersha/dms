import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { PieChart, Database, Code, AlertTriangle } from 'lucide-react';
import { SystemNavbar } from '../components/SystemNavbar';

export function AnalyticsLayout() {
  const navItems = [
    { to: '/analytics/overview', icon: PieChart, label: 'Overview' },
    { to: '/analytics/sources', icon: Database, label: 'Data Sources' },
    { to: '/analytics/scripts', icon: Code, label: 'Audit Scripts' },
    { to: '/analytics/exceptions', icon: AlertTriangle, label: 'Exceptions' },
  ];

  return (
    <div className="flex h-screen flex-col bg-gray-50 overflow-hidden pb-16 md:pb-0">
      <SystemNavbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">Analytics</h2>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
