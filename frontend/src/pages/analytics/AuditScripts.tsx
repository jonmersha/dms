import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../api/axios';
import { Code, Play, Plus, Search, FileJson } from 'lucide-react';

export function AuditScripts() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: scripts = [], isLoading, refetch } = useQuery({
    queryKey: ['analytics-scripts'],
    queryFn: () => api.get('/api/analytics/scripts/').then(res => res.data.results || res.data)
  });

  const executeMutation = useMutation({
    mutationFn: (id: number) => api.post(`/api/analytics/scripts/${id}/execute/`),
    onSuccess: (res) => {
      alert(`Script Executed. Found ${res.data.exceptions_found} anomalies.`);
      refetch();
    },
    onError: (err) => {
      alert('Failed to execute script');
    }
  });

  const filteredScripts = scripts.filter((s: any) => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Code className="text-purple-600" /> Audit Scripts
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Write and manage analytical queries to automatically detect anomalies across systems.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button className="flex items-center gap-2 rounded-md bg-purple-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-purple-500">
            <Plus size={16} /> New Script
          </button>
        </div>
      </div>

      <div className="mb-4 relative max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search scripts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-purple-600 sm:text-sm sm:leading-6"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-gray-500">Loading scripts...</div>
        ) : filteredScripts.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
            No audit scripts found.
          </div>
        ) : (
          filteredScripts.map((script: any) => (
            <div key={script.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <FileJson size={18} className="text-gray-400" /> {script.name}
                </h3>
              </div>
              <p className="text-sm text-gray-500 mb-4 h-10 overflow-hidden">{script.description}</p>
              
              <div className="mb-4 bg-gray-50 p-2 rounded text-xs font-mono text-gray-600 h-20 overflow-hidden border border-gray-100">
                {script.code_content || "SELECT * FROM ..."}
              </div>

              <div className="flex justify-between text-sm text-gray-500 border-t border-gray-100 pt-4 items-center">
                <span>Target: {script.target_data_source_name || 'DB'}</span>
                <button 
                  onClick={() => executeMutation.mutate(script.id)}
                  disabled={executeMutation.isPending}
                  className="flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium"
                >
                  <Play size={16} /> Run Now
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
