import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  UserPlus, 
  LogIn, 
  ShieldCheck, 
  Fingerprint, 
  AlertCircle,
  Building2,
  BadgeAlert,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import type { User, UserRole } from '../../../types/audit_flow';
import { auditApiService as apiService } from '../../../services/auditApiService';

interface LoginViewProps {
  onSuccess: (user: User) => void;
}

export default function LoginView({ onSuccess }: LoginViewProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Login Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('Auditor');
  const [regDepartment, setRegDepartment] = useState('General Audit Division');

  // UI Feedback States
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoProfilesOpen, setDemoProfilesOpen] = useState(false);

  // Clear errors when toggling tabs
  useEffect(() => {
    setError(null);
  }, [activeTab]);

  // Setup event listener for Google OAuth/Simulation popup messaging
  useEffect(() => {
    const handleSsoMessage = (event: MessageEvent) => {
      // Validate communication origin or handle safely
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data.user) {
        setLoading(false);
        onSuccess(event.data.user);
      }
    };

    window.addEventListener('message', handleSsoMessage);
    return () => {
      window.removeEventListener('message', handleSsoMessage);
    };
  }, [onSuccess]);

  // Handle local credentials login
  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please populate both email & password credentials to proceed.');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const user = await apiService.login(email, password);
      if (user) {
        onSuccess(user);
      } else {
        setError('Connection failed. Database returned null response.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification rejected. Incorrect username or password.');
    } finally {
      setLoading(false);
    }
  };

  // Handle local registration
  const handleLocalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regRole || !regDepartment) {
      setError('Please fill in checkmarks for all credentials to register.');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const user = await apiService.register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        department: regDepartment
      });
      if (user) {
        onSuccess(user);
      } else {
        setError('Failed to instantiate new directory profile.');
      }
    } catch (err: any) {
      setError(err.message || 'Registration rejected.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Google Sign-In or Active Directory popup
  const handleGoogleSso = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await apiService.getGoogleAuthUrl();
      if (!data || !data.url) {
        throw new Error('OAuth authentication gateway returned an empty target URL.');
      }

      // Calculate center coordinates
      const width = 520;
      const height = 650;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      // Open OAuth authentication window popup
      window.open(
        data.url,
        'GoogleSignOnGateway',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
      );
    } catch (err: any) {
      setError(err.message || 'Failed to establish connection to identity provider.');
      setLoading(false);
    }
  };

  // Quick fill sandbox utility for rapid testing
  const quickFillProductDemo = (emailValue: string) => {
    setEmail(emailValue);
    setPassword('Password123');
    setActiveTab('login');
    setDemoProfilesOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 select-none" id="auth_portal_root">
      
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-150 p-6 md:p-8 space-y-8 relative" id="auth_portal_card">
        
        {/* Header Decorator */}
        <div className="space-y-3 text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-indigo-100" id="portal_logo_indicator">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight block">VERIFY PORTAL</h1>
            <p className="text-xs text-slate-500 tracking-wide mt-1 uppercase font-semibold">National Bank of Ethiopia Integrity Workspace</p>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="flex bg-slate-100 p-1 rounded-xl" id="portal_tab_switcher">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'login' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Security Sign-In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'register' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Self Service Sign-Up
          </button>
        </div>

        {/* Auth Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-fade-in" id="portal_error_banner">
            <AlertCircle className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
            <div>
              <span className="font-bold block">Authorization Denied</span>
              <p className="mt-0.5 leading-normal text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Login Scope rendering */}
        {activeTab === 'login' && (
          <form onSubmit={handleLocalLogin} className="space-y-4" id="login_form">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">Enterprise Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="akebede@bank.et"
                  disabled={loading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white text-slate-800 disabled:opacity-60 transition-all font-medium"
                />
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">Security Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={loading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-xs outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white text-slate-800 disabled:opacity-60 transition-all font-medium"
                />
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md mt-6 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Validating Sign-On...' : 'Establish Secure Connection'}
            </button>
          </form>
        )}

        {/* Register Scope rendering */}
        {activeTab === 'register' && (
          <form onSubmit={handleLocalRegister} className="space-y-4 animate-fade-in" id="register_form">
            <div className="grid grid-cols-2 gap-3.5">
              <div className="space-y-1.5 col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">Full Corporate Name</label>
                <input
                  type="text"
                  value={regName}
                  onChange={e => setRegName(e.target.value)}
                  placeholder="E.g. Abel Tesfaye"
                  disabled={loading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white text-slate-800 disabled:opacity-60 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">Workplace Email (Key)</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  placeholder="atesfaye@bank.et"
                  disabled={loading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white text-slate-800 disabled:opacity-60 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">Access Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  disabled={loading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white text-slate-800 disabled:opacity-60 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">Desired Role Title</label>
                <select
                  value={regRole}
                  onChange={e => setRegRole(e.target.value as UserRole)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs focus:ring-1 focus:ring-indigo-600 outline-none text-slate-700 font-medium cursor-pointer"
                >
                  <option value="Admin">Chief Auditor (Admin)</option>
                  <option value="Manager">Audit Manager</option>
                  <option value="Team Leader">AIC / Lead Auditor</option>
                  <option value="Auditor">Field Staff Auditor</option>
                  <option value="Auditee">Company Auditee Manager</option>
                  <option value="Executive">Executive Board Executive</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 tracking-wider uppercase">Assign Department</label>
                <input
                  type="text"
                  value={regDepartment}
                  onChange={e => setRegDepartment(e.target.value)}
                  placeholder="IT Systems Audit"
                  disabled={loading}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs outline-none focus:ring-1 focus:ring-indigo-600 focus:bg-white text-slate-800 disabled:opacity-60 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md mt-6 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              Create Account & Log In
            </button>
          </form>
        )}

        {/* Divider separator */}
        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-slate-150"></div>
          <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">or integrate</span>
          <div className="flex-grow border-t border-slate-150"></div>
        </div>

        {/* Google SSO / ADFS Trigger */}
        <button
          onClick={handleGoogleSso}
          disabled={loading}
          type="button"
          className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-250 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
          id="google_sso_btn"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.58h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.83 21.56,11.4 21.35,11.1z" fill="#4285F4" />
              <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.58c-0.91,0.61 -2.09,0.98 -3.1,0.98 -2.39,0 -4.41,-1.61 -5.13,-3.78H2.94v2.67C4.42,18.66 7.97,20.6 12,20.6z" fill="#34A853" />
              <path d="M6.87,13.04a5.21,5.21 0 0 1 0,-3.3V7.07H2.94a8.88,8.88 0 0 0 0,8.64l3.93,-2.67z" fill="#FBBC05" />
              <path d="M12,6.49c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,3.8 14.43,3.02 12,3.02 7.97,3.02 4.42,4.96 2.94,7.07l3.93,2.67c0.72,-2.17 2.74,-3.78 5.13,-3.78z" fill="#EA4335" />
            </g>
          </svg>
          {loading ? 'Opening Security Popup...' : 'Sign-In with Google SSO'}
        </button>

        {/* Sandbox Directory Guidelines */}
        <div className="text-center pt-2">
          <button
            onClick={() => setDemoProfilesOpen(!demoProfilesOpen)}
            type="button"
            className="text-[10px] text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 cursor-pointer hover:underline"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Show Standard Corporate Credentials
          </button>

          {demoProfilesOpen && (
            <div className="mt-3.5 p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-left space-y-2.5 max-h-48 overflow-y-auto animate-fade-in" id="demo_accounts_box">
              <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Pre-Registered Corporate Accounts (Password: Password123)</span>
              
              <div className="grid grid-cols-1 gap-2 text-[10px]">
                <button
                  onClick={() => quickFillProductDemo('akebede@bank.et')}
                  type="button"
                  className="flex justify-between items-center bg-white p-2 border border-slate-200 hover:border-indigo-400 rounded-lg text-left"
                >
                  <div>
                    <strong className="block text-slate-800">Abebe Kebede (Admin)</strong>
                    <span className="text-slate-500 font-mono text-[9px]">akebede@bank.et</span>
                  </div>
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                </button>

                <button
                  onClick={() => quickFillProductDemo('tassefa@bank.et')}
                  type="button"
                  className="flex justify-between items-center bg-white p-2 border border-slate-200 hover:border-indigo-400 rounded-lg text-left"
                >
                  <div>
                    <strong className="block text-slate-800">Tigist Assefa (Manager)</strong>
                    <span className="text-slate-500 font-mono text-[9px]">tassefa@bank.et</span>
                  </div>
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                </button>

                <button
                  onClick={() => quickFillProductDemo('yhailu@bank.et')}
                  type="button"
                  className="flex justify-between items-center bg-white p-2 border border-slate-200 hover:border-indigo-400 rounded-lg text-left"
                >
                  <div>
                    <strong className="block text-slate-800">Yohannes Hailu (Team Leader)</strong>
                    <span className="text-slate-500 font-mono text-[9px]">yhailu@bank.et</span>
                  </div>
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                </button>

                <button
                  onClick={() => quickFillProductDemo('sdemeke@bank.et')}
                  type="button"
                  className="flex justify-between items-center bg-white p-2 border border-slate-200 hover:border-indigo-400 rounded-lg text-left"
                >
                  <div>
                    <strong className="block text-slate-800">Selamawit Demeke (Auditor)</strong>
                    <span className="text-slate-500 font-mono text-[9px]">sdemeke@bank.et</span>
                  </div>
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                </button>

                <button
                  onClick={() => quickFillProductDemo('mtadesse@bank.et')}
                  type="button"
                  className="flex justify-between items-center bg-white p-2 border border-slate-200 hover:border-indigo-400 rounded-lg text-left"
                >
                  <div>
                    <strong className="block text-slate-800">Mekonnen Tadesse (Auditee)</strong>
                    <span className="text-slate-500 font-mono text-[9px]">mtadesse@bank.et</span>
                  </div>
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
