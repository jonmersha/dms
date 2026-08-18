/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuditContext } from "../context/AuditContext";
import { 
  FileLock2, 
  Search, 
  Filter, 
  Terminal, 
  UserCheck, 
  ShieldAlert, 
  Activity, 
  RefreshCcw,
  ClipboardList
} from 'lucide-react';
import { SystemLog, UserRole } from '../types';

export default function ImmutableLogView() {
  const { systemLogs: logs, activeRole } = useAuditContext();

  
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  // Filter lists matching user requirements
  const filteredLogs = logs.filter(l => {
    const matchesSearch = 
      l.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'ALL' || l.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  // Extract unique action types for filtering criteria
  const actionTypes = Array.from(new Set(logs.map(l => l.action)));

  const handleImmutabilityBypassTest = () => {
    alert("CRITICAL ERROR: ACCESS DENIED. Internal Audit trails are written to write-once read-many (WORM) storage media. Log records are permanent and fully immutable to comply with Federal Bank guidelines.");
  };

  return (
    <div className="space-y-6 animate-fade-in text-zinc-800" id="immutable_logs_main">
      
      {/* Top Description banner */}
      <div className="bg-zinc-50 border border-zinc-200 p-5 rounded-xl flex items-start gap-4 shadow-3xs" id="worm_banner">
        <div className="p-3 bg-zinc-900 rounded-lg text-white font-bold inline-block shrink-0">
          <Terminal className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-zinc-909">Immutable Regulatory Audit Trail (WORM Storage)</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            The Federal Bank guidelines require security events to be locked and written immediately to read-only media. In accordance with zero-trust mandates, user impersonation sessions, status locks, finding releases, and corrective action updates are permanently footprints-monitored.
          </p>
        </div>
      </div>

      {/* Filter and Search controllers */}
      <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4" id="log_filters_bar">
        
        {/* Search */}
        <div className="flex items-center bg-zinc-50 border rounded-lg px-2.5 py-1.5 w-full md:max-w-80" id="search_log_wrapper">
          <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search email, action, details..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs focus:outline-none w-full w-full"
          />
        </div>

        {/* Action Type filter */}
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap" id="filters_toggles_group">
          <div className="flex items-center gap-1.5 text-xs text-zinc-550 mr-2">
            <Filter className="w-4 h-4" />
            <span>Action Category File:</span>
          </div>

          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="bg-white border rounded-lg text-xs px-3 py-1.5 focus:outline-zinc-400 font-sans"
          >
            <option value="ALL">All Log Categories</option>
            {actionTypes.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>

          {/* Immutability compliance audit challenge action button */}
          <button
            onClick={handleImmutabilityBypassTest}
            className="flex items-center gap-1 text-xs border border-red-200 bg-red-10/20 text-red-700 font-bold px-3 py-1.5 rounded-lg cursor-pointer hover:bg-red-50 transition-colors"
          >
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
            Clear Logs (Bypass Test)
          </button>
        </div>

      </div>

      {/* Logs Registry Table */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden" id="logs_table_card">
        <div className="p-4 border-b flex justify-between items-center bg-zinc-50/50">
          <span className="text-xs font-semibold text-zinc-905 flex items-center gap-1.5">
            <ClipboardList className="w-4.5 h-4.5 text-zinc-650" />
            Audit Trail Ledger Enclosures ({filteredLogs.length} events logged)
          </span>
          <span className="text-[10px] bg-emerald-100 text-emerald-805 px-2 py-0.5 rounded uppercase font-mono font-bold">
            Zero-Trust Monitoring ACTIVE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="logs_table_element">
            <thead>
              <tr className="bg-zinc-50 border-b text-[10px] font-semibold text-zinc-500 uppercase tracking-widest leading-none">
                <th className="p-4">Event Timestamp UTC</th>
                <th className="p-4">Active Profile Session</th>
                <th className="p-4">System Action Type</th>
                <th className="p-4">Granular Operation Details</th>
                <th className="p-4">Tracing IP Destination</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-150 text-xs font-mono text-zinc-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-zinc-400 font-sans italic">
                    No relevant security events discoverable corresponding to query parameters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-50/40 transition-colors" id={`log_row_${item.id}`}>
                    <td className="p-4 text-zinc-450 text-[11px]">
                      {item.timestamp}
                    </td>

                    <td className="p-4">
                      <div className="space-y-0.5" id={`usr_log_${item.id}`}>
                        <span className="font-bold text-zinc-800 font-mono text-[11px] block">{item.user}</span>
                        <span className="text-[9px] bg-zinc-150 text-zinc-600 font-semibold px-2 py-0.5 rounded inline-block uppercase font-sans leading-none">{item.role}</span>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-zinc-950 font-sans">
                      {item.action}
                    </td>

                    <td className="p-4 text-zinc-650 font-sans text-[11.5px] max-w-[340px]">
                      {item.details}
                    </td>

                    <td className="p-4 text-zinc-450 font-mono text-[11px]">
                      {item.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
