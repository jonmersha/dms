import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  Shield, Calendar, Briefcase, CheckSquare, FileText, 
  BarChart, Settings, Activity, Building, Target, 
  Users, Lock, ShieldAlert, AlertCircle 
} from 'lucide-react';
import { SystemNavbar } from '../components/SystemNavbar';

export function AuditFlowLayout() {
  const navGroups = [
    {
      items: [
        { to: '/auditflow/dashboard', icon: Activity, label: 'Dashboard & KPIs' },
        { to: '/auditflow/universe', icon: Building, label: 'Audit Universe Registry' },
        { to: '/auditflow/risk-assessment', icon: Target, label: 'Risk Assessment' },
        { to: '/auditflow/annual-plan', icon: Calendar, label: 'Annual Audit Plan' },
      ]
    },
    {
      title: 'Audit Operations',
      items: [
        { to: '/auditflow/engagements', icon: Briefcase, label: 'Engagements & Programs' },
        { to: '/auditflow/fieldwork', icon: CheckSquare, label: 'Fieldwork & Findings' },
        { to: '/auditflow/remediation', icon: FileText, label: 'Remediation (Follow-up)' },
      ]
    },
    {
      title: 'Analytics & Structure',
      items: [
        { to: '/auditflow/org-structure', icon: Users, label: 'Org Structure Management' },
        { to: '/auditflow/caat-analytics', icon: BarChart, label: 'CAAT & Anomaly Analytics' },
      ]
    },
    {
      title: 'System & Governance',
      items: [
        { to: '/auditflow/immutable-logs', icon: Lock, label: 'SSO Security Logs' },
        { to: '/auditflow/admin', icon: Settings, label: 'Administration Console' },
      ]
    }
  ];

  return (
    <div className="flex h-screen flex-col bg-gray-50 overflow-hidden">
      <SystemNavbar />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800">AuditFlow</h2>
          </div>
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-6 px-3">
              {navGroups.map((group, idx) => (
                <div key={idx}>
                  {group.title && (
                    <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {group.title}
                    </h3>
                  )}
                  <div className="space-y-1">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            isActive
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          }`
                        }
                      >
                        <item.icon size={18} className="flex-shrink-0" />
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
