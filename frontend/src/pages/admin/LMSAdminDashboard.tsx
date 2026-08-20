import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ListVideo, UserCog, Award, X } from 'lucide-react';
import api from '../../api/axios';
import { AlertModal } from '../../components/ui/AlertModal';

export function LMSAdminDashboard() {
  const [isCertSettingsModalOpen, setIsCertSettingsModalOpen] = useState(false);
  const [certSettings, setCertSettings] = useState<{ chief_auditor_name: string, organization_name: string, motto: string, tagline: string }>({ chief_auditor_name: 'Chief Internal Auditor', organization_name: 'Coop Bank Internal Audit Excellence Center', motto: '', tagline: '' });
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [sigFile, setSigFile] = useState<File | null>(null);
  const [alertModal, setAlertModal] = useState<{isOpen: boolean, title: string, message: string, type: 'success'|'error'|'info'}>({ isOpen: false, title: '', message: '', type: 'info' });

  useEffect(() => {
    fetchCertSettings();
  }, []);

  const fetchCertSettings = async () => {
    try {
      const response = await api.get('/api/lms/certificate-settings/');
      if (response.data && response.data.length > 0) {
        setCertSettings({
          chief_auditor_name: response.data[0].chief_auditor_name || 'Chief Internal Auditor',
          organization_name: response.data[0].organization_name || 'Coop Bank Internal Audit Excellence Center',
          motto: response.data[0].motto || '',
          tagline: response.data[0].tagline || ''
        });
      }
    } catch (err) {
      console.error('Failed to fetch certificate settings');
    }
  };

  const handleSaveCertSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('chief_auditor_name', certSettings.chief_auditor_name);
      formData.append('organization_name', certSettings.organization_name);
      formData.append('motto', certSettings.motto);
      formData.append('tagline', certSettings.tagline);
      if (bgFile) formData.append('background_image', bgFile);
      if (sigFile) formData.append('signature_image', sigFile);

      await api.put('/api/lms/certificate-settings/1/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setAlertModal({ isOpen: true, title: 'Success', message: 'Certificate settings saved successfully!', type: 'success' });
      setIsCertSettingsModalOpen(false);
      fetchCertSettings();
    } catch (err) {
      setAlertModal({ isOpen: true, title: 'Error', message: 'Failed to save certificate settings', type: 'error' });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">LMS Administration</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage roles, access permissions, course administration, and certificates for the Learning Management System.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        
        {/* Roles Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
              <Shield size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">LMS Roles & Permissions</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Configure system-wide roles for the LMS Subsystem. Manage permissions for standard roles.
          </p>
          <Link 
            to="/system/roles" 
            className="inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors w-full"
          >
            Manage Roles Definitions
          </Link>
        </div>

        {/* User Management Card */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <UserCog size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">LMS Users Access</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Grant users Course Creation access. Control who can author courses in the LMS Subsystem.
          </p>
          <Link 
            to="/admin/lms/users" 
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors w-full"
          >
            Manage User Access
          </Link>
        </div>

        {/* Course Administration */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-green-100 rounded-lg text-green-600">
              <ListVideo size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Course Administration</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Access the Learning Management System to manage and review course materials.
          </p>
          <Link 
            to="/system/learning" 
            className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors w-full"
          >
            View LMS Center
          </Link>
        </div>

        {/* Certificates Config */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
              <Award size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Certificates Configuration</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6 flex-grow">
            Manage the visual appearance, text, and signatures used when generating course completion certificates.
          </p>
          <button 
            onClick={() => setIsCertSettingsModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors w-full"
          >
            Configure Certificates
          </button>
        </div>

      </div>

      {/* Certificate Settings Modal */}
      {isCertSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Certificate Settings</h2>
              <button onClick={() => setIsCertSettingsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSaveCertSettings} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                <input
                  type="text"
                  required
                  value={certSettings.organization_name}
                  onChange={e => setCertSettings({...certSettings, organization_name: e.target.value})}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Motto</label>
                <input
                  type="text"
                  value={certSettings.motto}
                  placeholder="e.g. Excellence in Auditing"
                  onChange={e => setCertSettings({...certSettings, motto: e.target.value})}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={certSettings.tagline}
                  placeholder="e.g. Empowering Trust"
                  onChange={e => setCertSettings({...certSettings, tagline: e.target.value})}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chief Internal Auditor Name</label>
                <input
                  type="text"
                  required
                  value={certSettings.chief_auditor_name}
                  onChange={e => setCertSettings({...certSettings, chief_auditor_name: e.target.value})}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Artistic Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => { if (e.target.files) setBgFile(e.target.files[0]) }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">A4 Landscape format recommended.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Signature Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => { if (e.target.files) setSigFile(e.target.files[0]) }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-gray-500">Transparent PNG recommended.</p>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCertSettingsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
}
