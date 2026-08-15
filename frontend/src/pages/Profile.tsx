import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../config';
import { User, Key, CheckCircle, Eye, EyeOff } from 'lucide-react';

export function Profile() {
  const { user, refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [profileStatus, setProfileStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  React.useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileStatus('loading');
    try {
      const token = localStorage.getItem('access') || localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/auth/users/me/`,
        { first_name: firstName, last_name: lastName },
        {
          headers: { Authorization: `JWT ${token}` },
        }
      );
      await refreshUser();
      setProfileStatus('success');
      setIsEditingProfile(false);
      setTimeout(() => setProfileStatus('idle'), 3000);
    } catch (error) {
      setProfileStatus('error');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setStatus('error');
      setErrorMessage("New passwords do not match.");
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/auth/users/set_password/`,
        {
          new_password: newPassword,
          current_password: currentPassword,
        },
        {
          headers: {
            Authorization: `JWT ${token}`,
          },
        }
      );
      
      setStatus('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setStatus('error');
      const errData = error.response?.data;
      if (errData?.current_password) {
        setErrorMessage(`Current Password: ${errData.current_password.join(' ')}`);
      } else if (errData?.new_password) {
        setErrorMessage(`New Password: ${errData.new_password.join(' ')}`);
      } else {
        setErrorMessage('Failed to change password. Please check your inputs and try again.');
      }
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <User className="h-8 w-8 text-blue-600" />
          My Profile
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Account Details Card */}
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2">Account Details</h2>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-500">Name</label>
                {!isEditingProfile && (
                  <button onClick={() => setIsEditingProfile(true)} className="text-sm text-blue-600 hover:text-blue-800">
                    Edit
                  </button>
                )}
              </div>
              
              {isEditingProfile ? (
                <form onSubmit={handleProfileUpdate} className="mt-2 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">First Name</label>
                      <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Last Name</label>
                      <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
                    <button type="submit" disabled={profileStatus === 'loading'} className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50">
                      {profileStatus === 'loading' ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                  {profileStatus === 'error' && <p className="text-xs text-red-600">Failed to update profile.</p>}
                </form>
              ) : (
                <div className="mt-1 text-base text-gray-900 font-semibold">{user?.full_name || 'N/A'}</div>
              )}
              {profileStatus === 'success' && !isEditingProfile && <p className="mt-1 text-xs text-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Profile updated</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Email</label>
              <div className="mt-1 text-base text-gray-900">{user?.email || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Username</label>
              <div className="mt-1 text-base text-gray-900">{user?.username || 'N/A'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Role</label>
              <div className="mt-1 text-base text-gray-900">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user?.role_display || user?.role || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white shadow rounded-lg p-6 border border-gray-200 h-fit">
          <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-2 flex items-center gap-2">
            <Key className="h-5 w-5 text-gray-500" />
            Change Password
          </h2>

          {status === 'success' && (
            <div className="mb-6 bg-green-50 p-4 rounded-md flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-800">Password Updated</h3>
                <p className="mt-1 text-sm text-green-700">
                  Your password has been changed successfully. A confirmation email has been sent to you.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 pr-10 text-sm"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
              />
            </div>

            {status === 'error' && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                {errorMessage}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
              >
                {status === 'loading' ? 'Changing...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
