import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Home } from 'lucide-react';

export function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  
  // Data for selects
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  
  useEffect(() => {
    // Fetch departments and roles for the signup form
    const fetchData = async () => {
      try {
        const [deptRes, roleRes] = await Promise.all([
          api.get('/api/admin/departments/'),
          api.get('/api/admin/roles/')
        ]);
        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : deptRes.data.results || []);
        setRoles(Array.isArray(roleRes.data) ? roleRes.data : roleRes.data.results || []);
      } catch (err) {
        console.error('Failed to fetch registration data:', err);
      }
    };
    fetchData();
  }, []);
  
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);
    try {
      const response = await api.post('/auth/jwt/create/', { username, password });
      await login(response.data.access, response.data.refresh);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid username or password, or account is inactive.');
      } else {
        setError('Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await api.post('/auth/users/', {
        username,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        department: department || undefined,
        role: role || undefined,
      });
      setSuccessMsg('Account created successfully! Please check your email to activate your account before logging in.');
      setIsLoginMode(true);
      setPassword(''); // Clear password field for safety
    } catch (err: any) {
      setError(err.response?.data?.username?.[0] || err.response?.data?.email?.[0] || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-3xl font-bold text-center text-gray-900">
          {isLoginMode ? 'DMS Login' : 'Create Account'}
        </h2>
        
        {successMsg && (
          <div className="mb-4 flex items-start gap-2 rounded-md bg-green-50 p-4 text-sm text-green-800">
            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-400" />
            <p>{successMsg}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={isLoginMode ? handleLoginSubmit : handleSignupSubmit} className="space-y-4">
          {!isLoginMode && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                <input 
                  type="text" 
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                <input 
                  type="text" 
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {!isLoginMode && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Department</label>
                <select 
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                <select 
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {!isLoginMode && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input 
                type="email" 
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input 
              type="text" 
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-700 text-sm font-bold">Password</label>
              {isLoginMode && (
                <button
                  type="button"
                  onClick={() => navigate('/password-reset')}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input 
              type="password" 
              className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full rounded bg-blue-600 py-2.5 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
          >
            {isLoading ? 'Processing...' : (isLoginMode ? 'Login' : 'Sign Up')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <button
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError('');
              setSuccessMsg('');
            }}
            className="text-blue-600 hover:text-blue-500 hover:underline focus:outline-none"
          >
            {isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors">
            <Home size={16} />
            Return to Public Home
          </Link>
        </div>
      </div>
    </div>
  );
}
