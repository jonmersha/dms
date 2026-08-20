import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, Shield, Settings, FileText, Trash2, Building2, Users, Activity, Calendar, User, Newspaper, ChevronDown } from 'lucide-react';

function isSuperAdmin(user: any) {
  return user?.is_superuser || user?.role === 'ADMIN';
}

export function PublicNavbar() {
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
            <Link to="/" className="flex items-center gap-3 font-bold text-xl">
              <img 
                src="https://coopbankoromia.com.et/wp-content/uploads/2020/11/Coopbank-Logo-Ethiopia.svg" 
                alt="Coopbank Logo" 
                className="h-10 w-auto bg-white rounded p-1"
              />
            </Link>

            <div className="hidden lg:flex space-x-6 items-center ml-8 text-sm font-medium">
              <Link to="/" className="hover:text-blue-200 transition-colors">Home</Link>
              <Link to="/learning" className="hover:text-blue-200 transition-colors">Learning</Link>
              
              <Link to="/publications" className="hover:text-blue-200 transition-colors">Publications</Link>
              <Link to="/quality" className="hover:text-blue-200 transition-colors">Quality Management</Link>
              
              <div className="relative group">
                <button className="flex items-center gap-1 hover:text-blue-200 transition-colors py-2">
                  Performance & Plans <ChevronDown size={14} />
                </button>
                <div className="absolute left-0 top-full mt-1 w-56 rounded-md bg-white text-gray-800 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 py-1">
                  <Link to="/performance#performance" className="block px-4 py-2 hover:bg-gray-100 text-sm">Performance</Link>
                  <Link to="/performance#year-plans" className="block px-4 py-2 hover:bg-gray-100 text-sm">Yearly Plans</Link>
                </div>
              </div>
              
              <Link to="/about" className="hover:text-blue-200 transition-colors">About Us</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {user ? (
              <>
                  <Link 
                    to={isSuperAdmin(user) ? "/system/dashboard" : "/dashboard"}
                    className="flex items-center gap-2 rounded-md bg-blue-800 px-4 py-2 text-sm font-medium hover:bg-blue-900 transition-colors mr-2 border border-blue-600"
                  >
                    {isSuperAdmin(user) ? <Settings size={16} /> : <Activity size={16} />} 
                    {isSuperAdmin(user) ? "Admin Dashboard" : "Dashboard"}
                  </Link>
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
                      <Link to={isSuperAdmin(user) ? "/system/dashboard" : "/dashboard"} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm w-full transition-colors">
                        {isSuperAdmin(user) ? <Settings size={16} className="text-gray-500" /> : <Activity size={16} className="text-gray-500" />} 
                        {isSuperAdmin(user) ? "Admin Dashboard" : "Dashboard"}
                      </Link>
                      <Link to="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm w-full transition-colors">
                        <User size={16} className="text-gray-500" /> My Profile
                      </Link>
                      <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-red-600 w-full text-left transition-colors">
                        <LogOut size={16} /> Logout
                      </button>
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
