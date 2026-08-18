import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, Shield, Settings, FileText, Trash2, Building2, Users, Activity, Calendar, User, Newspaper, ChevronDown, ListVideo, Briefcase, PieChart, AlertCircle } from 'lucide-react';

function isSuperAdmin(user: { is_superuser: boolean; role: string }) {
  return user.is_superuser || user.role === 'ADMIN';
}

export function SystemNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <nav className="bg-blue-700 text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-3 font-bold text-xl">
              <img 
                src="https://coopbankoromia.com.et/wp-content/uploads/2020/11/Coopbank-Logo-Ethiopia.svg" 
                alt="Coopbank Logo" 
                className="h-10 w-auto bg-white rounded p-1"
              />
            </Link>
            
            {user && (
              <div className="hidden md:flex space-x-4 items-center">
                {/* Dashboard */}
                {user.role !== 'VISITOR' && (
                  <Link to="/dashboard" title="Dashboard" className="flex items-center justify-center rounded-md p-2 hover:bg-blue-600 transition-colors">
                    <Activity size={20} />
                  </Link>
                )}

                {/* 1. Public Web */}
                {!isSuperAdmin(user) && (
                  <Link to="/" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                  <Home size={18} /> Public Web
                  </Link>
                )}
                

                
                {/* 2. CAP */}
                {user.role !== 'VISITOR' && !isSuperAdmin(user) && (
                  <Link to="/documents" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                    <FileText size={18} /> CAP
                  </Link>
                )}

                
                {/* Branch Irregularities */}
                {user.role !== 'VISITOR' && !isSuperAdmin(user) && (
                  <Link to="/incident-log" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                    <AlertCircle size={18} /> Incident Log
                  </Link>
                )}

                {/* 3. Audit Workflow */}
                {['CHIEF', 'DIRECTOR', 'TEAM_MANAGER'].includes(user.role) && (
                  <Link to="/auditflow/universe" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                    <Shield size={18} /> Audit
                  </Link>
                )}

                {/* 4. Analytics */}
                {['CHIEF', 'DIRECTOR', 'TEAM_MANAGER'].includes(user.role) && (
                  <Link to="/analytics/overview" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                    <PieChart size={18} /> Analytics
                  </Link>
                )}

                {/* 5. LMS */}
                {user.role !== 'VISITOR' && !isSuperAdmin(user) && (
                  <Link to="/system/learning" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                    <ListVideo size={18} /> LMS
                  </Link>
                )}

                {/* System Administration Dropdown */}
                {isSuperAdmin(user) && (
                  <div className="relative group flex items-center ml-4">
                    <button className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                      <Settings size={18} /> Administration <ChevronDown size={14} />
                    </button>
                    <div className="absolute left-0 top-full mt-1 w-48 rounded-md bg-white text-gray-800 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-1 border border-gray-100">
                      <Link to="/system/dashboard" className="block px-4 py-2 hover:bg-gray-100 text-sm">Dashboard</Link>
                      <Link to="/system/departments" className="block px-4 py-2 hover:bg-gray-100 text-sm">Departments</Link>
                      <Link to="/system/users" className="block px-4 py-2 hover:bg-gray-100 text-sm">Users</Link>
                      <Link to="/system/periods" className="block px-4 py-2 hover:bg-gray-100 text-sm">Periods</Link>
                      <Link to="/system/logs" className="block px-4 py-2 hover:bg-gray-100 text-sm">Audit Logs</Link>
                      <Link to="/system/content" className="block px-4 py-2 hover:bg-gray-100 text-sm">Content</Link>
                      <Link to="/system/backups" className="block px-4 py-2 hover:bg-gray-100 text-sm">Backups</Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  {(!isSuperAdmin(user) && user.role !== 'AUDITEE' && user.role !== 'VISITOR') && (
                    <Link 
                      to="/recycle-bin"
                      title="Recycle Bin"
                      className="flex items-center justify-center rounded-md p-2 hover:bg-blue-600 transition-colors"
                    >
                      <Trash2 size={20} />
                    </Link>
                  )}

                  <div className="relative group">
                    <button className="flex items-center gap-2 rounded-md p-2 hover:bg-blue-800 transition-colors">
                      <div className="bg-blue-600 p-1.5 rounded-full">
                        <User size={18} />
                      </div>
                      <div className="hidden md:block text-left ml-1">
                        <div className="text-sm font-bold leading-tight">{user.full_name || user.username}</div>
                        <div className="text-xs text-blue-200 leading-tight">{user.role_display}</div>
                      </div>
                      <ChevronDown size={16} className="ml-1 opacity-80" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-56 rounded-md bg-white text-gray-800 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-1 border border-gray-100">
                      <div className="px-4 py-3 border-b border-gray-100 mb-1">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.full_name || user.username}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      <Link to="/" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm w-full transition-colors">
                        <Home size={16} className="text-gray-500" /> Public Home
                      </Link>
                      <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm w-full transition-colors">
                        <Activity size={16} className="text-gray-500" /> Dashboard
                      </Link>
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm w-full transition-colors">
                        <User size={16} className="text-gray-500" /> My Profile
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-red-600 w-full text-left transition-colors">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login"
                  className="flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium hover:bg-blue-500 transition-colors"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
