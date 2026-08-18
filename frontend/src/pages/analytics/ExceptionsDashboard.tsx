import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { AlertTriangle, Filter, Eye } from 'lucide-react';

export function ExceptionsDashboard() {
  const { data: exceptions = [], isLoading } = useQuery({
    queryKey: ['analytics-exceptions'],
    queryFn: () => api.get('/api/analytics/exceptions/').then(res => res.data.results || res.data)
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-red-100 text-red-800';
      case 'REVIEWING': return 'bg-yellow-100 text-yellow-800';
      case 'DISMISSED': return 'bg-gray-100 text-gray-800';
      case 'ESCALATED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-red-600" /> Anomalies & Exceptions
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Review and triage data anomalies detected by automated audit scripts.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button className="flex items-center gap-2 rounded-md bg-white border border-gray-300 px-3 py-2 text-center text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-black ring-opacity-5">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">ID</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Script Name</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Exception Data</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Detected At</th>
              <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading exceptions...</td></tr>
            ) : exceptions.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-500">No anomalies detected. Great!</td></tr>
            ) : (
              exceptions.map((exc: any) => (
                <tr key={exc.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    EXC-{exc.id}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {exc.script_name}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate font-mono text-xs">
                    {JSON.stringify(exc.exception_data)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(exc.status)}`}>
                      {exc.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(exc.created_at).toLocaleString()}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 flex justify-end gap-3">
                    <button className="text-blue-600 hover:text-blue-900" title="Review">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
