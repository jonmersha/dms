import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, Shield, Settings, FileText, Trash2, Building2, Users, Activity, Calendar, User, Newspaper, ChevronDown, ListVideo, Briefcase, PieChart, AlertCircle } from 'lucide-react';

function isSuperAdmin(user: { is_superuser: boolean; role: string }) {
  return user.is_superuser || user.role === 'ADMIN';
}

export function SystemNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <nav className="bg-blue-700 text-white shadow-md relative z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <Link to="/dashboard" className="flex items-center gap-3 font-bold text-xl">
                <img 
                  src="https://coopbankoromia.com.et/wp-content/uploads/2020/11/Coopbank-Logo-Ethiopia.svg" 
                  alt="Coopbank Logo" 
                  className="h-10 w-auto bg-white rounded p-1"
                />
              </Link>
              
              {user && (
                <div className="hidden md:flex space-x-2 lg:space-x-4 items-center">
                  {/* Dashboard / System Admin */}
                  {user.role !== 'VISITOR' && (
                    <Link to={isSuperAdmin(user) ? "/system/dashboard" : "/dashboard"} title={isSuperAdmin(user) ? "System Administration" : "Dashboard"} className={`flex items-center justify-center rounded-md p-2 transition-colors ${isActive(isSuperAdmin(user) ? "/system/dashboard" : "/dashboard") ? "bg-blue-800" : "hover:bg-blue-600"}`}>
                      {isSuperAdmin(user) ? <Settings size={20} /> : <Activity size={20} />}
                    </Link>
                  )}

                  {(isSuperAdmin(user) || user.has_dms_access) && (
                    <Link to={isSuperAdmin(user) ? "/system/dms" : "/documents"} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive(isSuperAdmin(user) ? "/system/dms" : "/documents") ? "bg-blue-800" : "hover:bg-blue-600"}`}>
                      <FileText size={18} /> Document
                    </Link>
                  )}
                  
                  {/* Branch Irregularities */}
                  {(isSuperAdmin(user) || user.has_irregularity_access) && (
                    <Link to={isSuperAdmin(user) ? "/system/branch-audit-admin" : "/branch-audit"} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive(isSuperAdmin(user) ? "/system/branch-audit-admin" : "/branch-audit") ? "bg-blue-800" : "hover:bg-blue-600"}`}>
                      <AlertCircle size={18} /> Branch Audit
                    </Link>
                  )}

                  {/* 3. Audit Workflow */}
                  {(isSuperAdmin(user) || user.has_audit_access) && (
                    <Link to={isSuperAdmin(user) ? "/system/audit" : "/auditflow"} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive(isSuperAdmin(user) ? "/system/audit" : "/auditflow") ? "bg-blue-800" : "hover:bg-blue-600"}`}>
                      <Shield size={18} /> Audit
                    </Link>
                  )}

                  {/* 4. Analytics */}
                  {(isSuperAdmin(user) || user.has_analytics_access) && (
                    <Link to={isSuperAdmin(user) ? "/system/analytics-admin" : "/analytics/overview"} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive(isSuperAdmin(user) ? "/system/analytics-admin" : "/analytics") ? "bg-blue-800" : "hover:bg-blue-600"}`}>
                      <PieChart size={18} /> Analytics
                    </Link>
                  )}

                  {(isSuperAdmin(user) || user.can_create_lms_course || (user.system_roles ? user.system_roles.some((r: string) => ['CHIEF', 'DIRECTOR', 'TEAM_MANAGER', 'ADMIN'].includes(r)) : ['CHIEF', 'DIRECTOR', 'TEAM_MANAGER', 'ADMIN'].includes(user.role))) && (
                    <Link to={isSuperAdmin(user) ? "/system/lms-admin" : "/system/learning"} className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive(isSuperAdmin(user) ? "/system/lms-admin" : "/system/learning") ? "bg-blue-800" : "hover:bg-blue-600"}`}>
                      <ListVideo size={18} /> LMS
                    </Link>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-6">
              {user ? (
                <>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Link 
                      to="/"
                      title="Public Web"
                      className="flex items-center gap-2 rounded-md bg-blue-800 px-3 py-2 text-sm font-medium hover:bg-blue-900 transition-colors sm:mr-2 border border-blue-600"
                    >
                      <Home size={16} /> <span className="hidden sm:inline">Public Web</span>
                    </Link>

                    {(!isSuperAdmin(user) && user.role !== 'AUDITEE' && user.role !== 'VISITOR') && (
                      <Link 
                        to="/recycle-bin"
                        title="Recycle Bin"
                        className="hidden sm:flex items-center justify-center rounded-md p-2 hover:bg-blue-600 transition-colors"
                      >
                        <Trash2 size={20} />
                      </Link>
                    )}

                    <div className="relative" ref={profileRef}>
                      <button 
                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                        className="flex items-center gap-2 rounded-md p-2 hover:bg-blue-800 transition-colors"
                      >
                        <div className="bg-blue-600 p-1.5 rounded-full">
                          <User size={18} />
                        </div>
                        <div className="hidden lg:block text-left ml-1">
                          <div className="text-sm font-bold leading-tight">{user.full_name || user.username}</div>
                          <div className="text-xs text-blue-200 leading-tight">{user.role_display}</div>
                        </div>
                        <ChevronDown size={16} className={`ml-1 opacity-80 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <div className={`absolute right-0 top-full mt-1 w-56 rounded-md bg-white text-gray-800 shadow-lg transition-all z-50 py-1 border border-gray-100 ${isProfileOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                        <div className="px-4 py-3 border-b border-gray-100 mb-1 lg:hidden">
                          <p className="text-sm font-bold text-gray-900 truncate">{user.full_name || user.username}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link onClick={() => setIsProfileOpen(false)} to="/" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm w-full transition-colors">
                          <Home size={16} className="text-gray-500" /> Public Home
                        </Link>
                        <Link onClick={() => setIsProfileOpen(false)} to="/dashboard" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm w-full transition-colors">
                          <Activity size={16} className="text-gray-500" /> Dashboard
                        </Link>
                        <Link onClick={() => setIsProfileOpen(false)} to="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm w-full transition-colors">
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

      {/* Mobile Bottom Navigation Bar */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 px-1 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] text-gray-500 pb-safe">
          
          {user.role !== 'VISITOR' && (
            <Link 
              to={isSuperAdmin(user) ? "/system/dashboard" : "/dashboard"} 
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive(isSuperAdmin(user) ? "/system/dashboard" : "/dashboard") ? "text-blue-700 font-medium" : "hover:text-blue-600"}`}
            >
              {isSuperAdmin(user) ? <Settings size={20} /> : <Activity size={20} />}
              <span className="text-[10px] mt-1 truncate w-full text-center">{isSuperAdmin(user) ? "Admin" : "Dashboard"}</span>
            </Link>
          )}

          {(isSuperAdmin(user) || user.has_dms_access) && (
            <Link 
              to={isSuperAdmin(user) ? "/system/dms" : "/documents"} 
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive(isSuperAdmin(user) ? "/system/dms" : "/documents") ? "text-blue-700 font-medium" : "hover:text-blue-600"}`}
            >
              <FileText size={20} />
              <span className="text-[10px] mt-1 truncate w-full text-center">DMS</span>
            </Link>
          )}

          {(isSuperAdmin(user) || user.has_irregularity_access) && (
            <Link 
              to={isSuperAdmin(user) ? "/system/branch-audit-admin" : "/branch-audit"} 
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive(isSuperAdmin(user) ? "/system/branch-audit-admin" : "/branch-audit") ? "text-blue-700 font-medium" : "hover:text-blue-600"}`}
            >
              <AlertCircle size={20} />
              <span className="text-[10px] mt-1 truncate w-full text-center">Branch</span>
            </Link>
          )}

          {(isSuperAdmin(user) || user.has_audit_access) && (
            <Link 
              to={isSuperAdmin(user) ? "/system/audit" : "/auditflow"} 
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive(isSuperAdmin(user) ? "/system/audit" : "/auditflow") ? "text-blue-700 font-medium" : "hover:text-blue-600"}`}
            >
              <Shield size={20} />
              <span className="text-[10px] mt-1 truncate w-full text-center">Audit</span>
            </Link>
          )}

          {(isSuperAdmin(user) || user.has_analytics_access) && (
            <Link 
              to={isSuperAdmin(user) ? "/system/analytics-admin" : "/analytics/overview"} 
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive(isSuperAdmin(user) ? "/system/analytics-admin" : "/analytics") ? "text-blue-700 font-medium" : "hover:text-blue-600"}`}
            >
              <PieChart size={20} />
              <span className="text-[10px] mt-1 truncate w-full text-center">Analytics</span>
            </Link>
          )}

          {(isSuperAdmin(user) || user.can_create_lms_course || (user.system_roles ? user.system_roles.some((r: string) => ['CHIEF', 'DIRECTOR', 'TEAM_MANAGER', 'ADMIN'].includes(r)) : ['CHIEF', 'DIRECTOR', 'TEAM_MANAGER', 'ADMIN'].includes(user.role))) && (
            <Link 
              to={isSuperAdmin(user) ? "/system/lms-admin" : "/system/learning"} 
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${isActive(isSuperAdmin(user) ? "/system/lms-admin" : "/system/learning") ? "text-blue-700 font-medium" : "hover:text-blue-600"}`}
            >
              <ListVideo size={20} />
              <span className="text-[10px] mt-1 truncate w-full text-center">LMS</span>
            </Link>
          )}

        </div>
      )}
    </>
  );
}
