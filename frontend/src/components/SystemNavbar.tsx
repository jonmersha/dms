import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, Shield, Settings, FileText, Trash2, Building2, Users, Activity, Calendar, User, Newspaper, ChevronDown, ListVideo } from 'lucide-react';

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
              <div className="hidden md:flex space-x-4">
                {(user.role !== 'AUDITEE' && user.role !== 'VISITOR' && user.role !== 'ADMIN' && !user.is_superuser) && (
                  <>
                    <Link to="/dashboard" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                      <Home size={18} /> Dashboard
                    </Link>
                    <Link to="/documents" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                      <FileText size={18} /> Documents
                    </Link>
                  </>
                )}
                
                {(user.is_staff || user.is_superuser) && user.role !== 'TEAM_MANAGER' && (
                  <>
                    <Link to="/system/dashboard" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                      <Settings size={18} /> Dashboard
                    </Link>
                    <Link to="/system/departments" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                      <Building2 size={18} /> Departments
                    </Link>
                    {(user.is_superuser || user.can_manage_public_content) && (
                      <>
                        <Link 
                          to="/system/content" 
                          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            location.pathname === '/system/content' ? 'bg-blue-800 text-white' : 'hover:bg-blue-600 hover:text-white text-blue-100'
                          }`}
                        >
                          <Newspaper size={18} />
                          Content
                        </Link>
                        <Link 
                          to="/system/learning" 
                          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                            location.pathname === '/system/learning' ? 'bg-blue-800 text-white' : 'hover:bg-blue-600 hover:text-white text-blue-100'
                          }`}
                        >
                          <ListVideo size={18} />
                          Learning
                        </Link>
                      </>
                    )}
                    
                    {user.is_superuser && (
                      <Link 
                        to="/system/users" 
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                          location.pathname === '/system/users' ? 'bg-blue-800 text-white' : 'hover:bg-blue-600 hover:text-white text-blue-100'
                        }`}
                      >
                        <Users size={18} />
                        Users
                      </Link>
                    )}
                    <Link to="/system/logs" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                      <Activity size={18} /> Logs
                    </Link>
                    <Link to="/system/periods" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                      <Calendar size={18} /> Periods
                    </Link>
                  </>
                )}
                
                {(user.role === 'CHIEF' || user.role === 'DIRECTOR') && (
                  <Link to="/system/announcements" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-blue-600 transition-colors">
                    <Newspaper size={18} /> Announcements
                  </Link>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            {user ? (
              <>
                <div className="flex items-center gap-2">
                  {(user.role !== 'AUDITEE' && user.role !== 'VISITOR' && user.role !== 'ADMIN' && !user.is_superuser) && (
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
