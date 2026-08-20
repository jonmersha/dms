import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { ArchiveRestore, Download, Plus, Upload, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

interface Backup {
  id: number;
  name: string;
  backup_type_display: string;
  status: string;
  status_display: string;
  file_size: number;
  total_documents: number;
  backed_up_documents: number;
  started_at: string;
  completed_at: string;
  created_by_details: {
    full_name: string;
    username: string;
  };
}

export function BackupRestore() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/backups/');
      const data = response.data;
      if (Array.isArray(data)) {
        setBackups(data);
      } else if (data && Array.isArray(data.results)) {
        setBackups(data.results);
      } else {
        setBackups([]);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
      showMessage('error', 'Failed to fetch backup history.');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateBackup = async () => {
    try {
      setActionLoading(true);
      await axios.post('/api/backups/', { backup_type: 'FULL' });
      showMessage('success', 'Backup triggered successfully. It will process in the background.');
      fetchBackups(); // Refresh list immediately, though it might still be running
    } catch (error: any) {
      showMessage('error', error.response?.data?.error || 'Failed to trigger backup.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreFile) return;

    const formData = new FormData();
    formData.append('file', restoreFile);

    try {
      setActionLoading(true);
      const response = await axios.post('/api/backups/restore/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      showMessage('success', `Restore completed! Restored: ${response.data.restored}, Skipped: ${response.data.skipped}`);
      setRestoreFile(null);
    } catch (error: any) {
      showMessage('error', error.response?.data?.error || 'Failed to restore backup.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownload = async (backup: Backup) => {
    try {
      const response = await axios.get(`/api/backups/${backup.id}/download/`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${backup.name}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      showMessage('error', 'Failed to download backup file.');
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link to="/system/dms" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2">
            <ArrowLeft size={16} /> Back to DMS Administration
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ArchiveRestore className="h-6 w-6 text-blue-600" />
            Backup & Restore
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage document backups and restore from zip archives.
          </p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 md:col-span-1">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Create Backup</h2>
          <p className="text-sm text-gray-600 mb-4">
            Generate a zip archive of all documents in your scope.
          </p>
          <button
            onClick={handleCreateBackup}
            disabled={actionLoading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            Trigger Backup
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Restore Backup</h2>
          <form onSubmit={handleRestore} className="flex flex-col gap-4">
            <p className="text-sm text-gray-600">
              Upload a previously downloaded `.zip` backup file to restore records and documents. Note: unauthorized documents in the zip will be skipped.
            </p>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".zip"
                onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              <button
                type="submit"
                disabled={!restoreFile || actionLoading}
                className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700 disabled:opacity-50 whitespace-nowrap"
              >
                {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                Restore
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Backup History</h2>
          <button onClick={fetchBackups} className="text-sm text-blue-600 hover:text-blue-800">
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500 flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading backups...
            </div>
          ) : backups.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No backups found.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(backup.started_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{backup.name}</div>
                      <div className="text-xs text-gray-500">by {backup.created_by_details?.full_name || backup.created_by_details?.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatSize(backup.file_size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${backup.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                          backup.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {backup.status_display}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {backup.status === 'COMPLETED' && (
                        <button
                          onClick={() => handleDownload(backup)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 justify-end ml-auto"
                        >
                          <Download size={16} /> Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
