import React, { useState, useMemo } from 'react';
import { FileText, Download, Eye, Shield, LayoutGrid, List, Filter } from 'lucide-react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertModal } from './ui/AlertModal';
import { DocumentThumbnail } from './DocumentThumbnail';

interface DocumentListProps {
  documents: any[];
}

export function DocumentList({ documents }: DocumentListProps) {
  const { user } = useAuth();

  const [alertConfig, setAlertConfig] = useState<{isOpen: boolean, message: string, type: 'error' | 'success'}>({
    isOpen: false,
    message: '',
    type: 'error'
  });
  
  // Default to grid (card) view
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Tabs
  const [activeTab, setActiveTab] = useState<'REPORTS' | 'NON_REPORTS'>('REPORTS');

  // Filters
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [selectedAuditType, setSelectedAuditType] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');

  const handleDownload = async (docId: number, filename: string) => {
    try {
      const response = await api.get(`/api/documents/${docId}/download/`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setAlertConfig({
        isOpen: true,
        message: "Download failed or unauthorized.",
        type: 'error'
      });
    }
  };

  // Derive filter options
  const departments = useMemo(() => Array.from(new Set(documents.map(d => d.department_name).filter(Boolean))), [documents]);
  const auditTypes = useMemo(() => Array.from(new Set(documents.map(d => d.audit_type_display || d.audit_type).filter(Boolean))), [documents]);
  const years = useMemo(() => Array.from(new Set(documents.map(d => d.audit_period_name).filter(Boolean))), [documents]);
  const quarters = useMemo(() => Array.from(new Set(documents.map(d => d.quarter_display || d.quarter).filter(Boolean))), [documents]);

  // Apply tabs, filters and group
  const groupedDocuments = useMemo<any[]>(() => {
    // 1. Filter by Tab
    let filtered = documents.filter(d => 
      activeTab === 'REPORTS' ? d.category === 'AUDIT_REPORTS' : d.category !== 'AUDIT_REPORTS'
    );
    
    // 2. Apply explicit filters
    if (selectedDept) {
      filtered = filtered.filter(d => d.department_name === selectedDept);
    }
    
    if (selectedAuditType) {
      filtered = filtered.filter(d => (d.audit_type_display || d.audit_type) === selectedAuditType);
    }

    if (selectedYear) {
      filtered = filtered.filter(d => d.audit_period_name === selectedYear);
    }

    if (selectedQuarter) {
      filtered = filtered.filter(d => (d.quarter_display || d.quarter) === selectedQuarter);
    }

    // Grouping structure
    type SubGroup = { subtitle: string; docs: any[] };
    type MainGroup = { title: string; docs?: any[]; subgroups?: SubGroup[] };
    
    if (activeTab === 'REPORTS') {
      // Nested grouping: Year -> Quarter
      const yearGroups: Record<string, Record<string, any[]>> = {};
      
      filtered.forEach(doc => {
        const year = doc.audit_period_name || "General Reports";
        const quarter = doc.quarter_display || doc.quarter || "Full Year";
        
        if (!yearGroups[year]) yearGroups[year] = {};
        if (!yearGroups[year][quarter]) yearGroups[year][quarter] = [];
        
        yearGroups[year][quarter].push(doc);
      });

      return Object.entries(yearGroups)
        .sort(([yearA], [yearB]) => {
          if (yearA === "General Reports") return 1;
          if (yearB === "General Reports") return -1;
          return yearB.localeCompare(yearA);
        })
        .map(([year, quartersObj]) => {
          const subgroups = Object.entries(quartersObj)
            .sort(([qA], [qB]) => qA.localeCompare(qB))
            .map(([quarter, docs]) => ({ subtitle: quarter, docs }));
          return { title: year, subgroups };
        });
    } else {
      // Flat grouping: Category
      const catGroups: Record<string, any[]> = {};
      
      filtered.forEach(doc => {
        const cat = doc.category ? doc.category.replace('_', ' ') : "General";
        if (!catGroups[cat]) catGroups[cat] = [];
        catGroups[cat].push(doc);
      });

      return Object.entries(catGroups)
        .sort(([catA], [catB]) => catA.localeCompare(catB))
        .map(([cat, docs]) => ({ title: cat, docs }));
    }
  }, [documents, activeTab, selectedDept, selectedAuditType, selectedYear, selectedQuarter]);

  if (documents.length === 0) {
    return (
      <div className="rounded-lg bg-white p-12 text-center text-gray-500 shadow-sm border border-dashed border-gray-300">
        <FileText className="mx-auto mb-4 h-12 w-12 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
        <p className="mt-1">Try adjusting your filters or upload a new document.</p>
      </div>
    );
  }

  const renderGrid = (docs: any[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
      {docs.map((doc) => (
        <div key={doc.id} className="group flex flex-col gap-3">
          <div className="relative overflow-hidden rounded-xl shadow-sm border-2 border-blue-500 hover:shadow-[0_4px_20px_rgba(59,130,246,0.25)] transition-all hover:-translate-y-1 bg-white aspect-[2/3]">
            <div className="absolute inset-0 z-0">
              <DocumentThumbnail documentId={doc.id} />
            </div>
            
            <div className="absolute bottom-0 inset-x-0 z-10 bg-gradient-to-t from-blue-600/80 via-blue-600/40 to-transparent p-3 pt-12 flex items-center justify-end gap-2 transition-opacity">
              <Link 
                to={`/documents/${doc.id}`} 
                className="flex items-center justify-center p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-blue-600 rounded-md transition-colors shadow-sm" 
                title="View Details"
              >
                <Eye size={18} />
              </Link>
              {doc.can_request_access && (
                <Link 
                  to={`/documents/${doc.id}/access`} 
                  className="flex items-center justify-center p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-blue-600 rounded-md transition-colors shadow-sm" 
                  title="Manage Access"
                >
                  <Shield size={18} />
                </Link>
              )}
              {doc.can_download && (
                <button 
                  onClick={() => handleDownload(doc.id, `${doc.title}.pdf`)}
                  className="flex items-center justify-center p-2 bg-white/20 backdrop-blur-sm text-white hover:bg-blue-600 rounded-md transition-colors shadow-sm" 
                  title="Download PDF"
                >
                  <Download size={18} />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col px-1">
            <h4 className="text-base font-extrabold text-gray-900 mb-1 line-clamp-2 leading-tight" title={doc.title}>
              {doc.title}
            </h4>
            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
              {doc.description}
            </p>
            {doc.category === 'AUDIT_REPORTS' && (
              <div className="mb-1 space-y-1">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 font-semibold text-blue-700 shadow-sm">
                    {doc.audit_period_name} - {doc.quarter_display || doc.quarter}
                  </span>
                  <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 font-semibold text-purple-700 shadow-sm">
                    {doc.audit_type_display || (doc.audit_type ? doc.audit_type.replace('_', ' ') : 'General')}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderTable = (docs: any[]) => (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Document</th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Department</th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Owner</th>
            <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {docs.map((doc) => (
            <tr key={doc.id} className="hover:bg-gray-50">
              <td className="px-4 py-2.5">
                <div className="flex items-center">
                  <FileText className="mr-3 h-5 w-5 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{doc.description}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2.5 whitespace-nowrap">
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                  doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  doc.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-800' :
                  doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {doc.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">
                {doc.department_name}
              </td>
              <td className="px-4 py-2.5 whitespace-nowrap text-sm text-gray-500">
                {doc.uploaded_by_details?.full_name}
              </td>
              <td className="px-4 py-2.5 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  <Link to={`/documents/${doc.id}`} className="text-blue-600 hover:text-blue-900" title="View Details">
                    <Eye size={18} />
                  </Link>
                  {doc.can_request_access && (
                    <Link to={`/documents/${doc.id}/access`} className="text-purple-600 hover:text-purple-900" title="Manage Access">
                      <Shield size={18} />
                    </Link>
                  )}
                  {doc.can_download && (
                    <button 
                      onClick={() => handleDownload(doc.id, `${doc.title}.pdf`)}
                      className="text-gray-500 hover:text-gray-900" 
                      title="Download PDF"
                    >
                      <Download size={18} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-6 animate-fade-in">
      
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('REPORTS'); setSelectedAuditType(''); setSelectedYear(''); setSelectedQuarter(''); }}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'REPORTS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Audit Reports
        </button>
        <button
          onClick={() => { setActiveTab('NON_REPORTS'); setSelectedAuditType(''); setSelectedYear(''); setSelectedQuarter(''); }}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${
            activeTab === 'NON_REPORTS'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Non-Reports (Guidelines, Policies, etc.)
        </button>
      </div>

      {/* Filters and View Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-gray-600 font-medium">
            <Filter size={16} /> Filters:
          </div>
          <select 
            className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept as string} value={dept as string}>{dept as string}</option>
            ))}
          </select>
          
          {activeTab === 'REPORTS' && (
            <>
              <select 
                className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5"
                value={selectedAuditType}
                onChange={(e) => setSelectedAuditType(e.target.value)}
              >
                <option value="">All Audit Types</option>
                {auditTypes.map(type => (
                  <option key={type as string} value={type as string}>{type as string}</option>
                ))}
              </select>
              <select 
                className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">All Years</option>
                {years.map(year => (
                  <option key={year as string} value={year as string}>{year as string}</option>
                ))}
              </select>
              <select 
                className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5"
                value={selectedQuarter}
                onChange={(e) => setSelectedQuarter(e.target.value)}
              >
                <option value="">All Quarters</option>
                {quarters.map(q => (
                  <option key={q as string} value={q as string}>{q as string}</option>
                ))}
              </select>
            </>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-1 inline-flex shadow-sm shrink-0">
          <button 
            onClick={() => setViewMode('grid')} 
            className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}
            title="Cards View"
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('table')} 
            className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}
            title="Tabular View"
          >
            <List size={18} />
          </button>
        </div>
      </div>
      
      {/* Grouped Documents Display */}
      {groupedDocuments.length === 0 ? (
        <div className="py-8 text-center text-gray-500">No documents match the selected filters.</div>
      ) : (
        <div className="space-y-12 animate-fade-in">
          {groupedDocuments.map((group, idx) => (
            <div key={idx} className="flex flex-col gap-4">
              <h3 className="text-xl font-extrabold text-gray-800 flex items-center gap-2 border-b-2 border-gray-200 pb-2">
                {group.title}
                {!group.subgroups && (
                  <span className="bg-gray-100 text-gray-600 text-xs py-0.5 px-2 rounded-full font-medium">{group.docs?.length || 0}</span>
                )}
              </h3>
              
              {group.subgroups ? (
                <div className="space-y-8 pl-2">
                  {group.subgroups.map((sub: any, sIdx: number) => (
                    <div key={sIdx} className="flex flex-col gap-3 border-l-2 border-blue-200 pl-4">
                      <h4 className="text-md font-bold text-gray-700 flex items-center gap-2">
                        {sub.subtitle} 
                        <span className="bg-blue-50 text-blue-600 text-xs py-0.5 px-2 rounded-full font-medium">{sub.docs.length}</span>
                      </h4>
                      {viewMode === 'grid' ? renderGrid(sub.docs) : renderTable(sub.docs)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="pt-2">
                  {viewMode === 'grid' ? renderGrid(group.docs || []) : renderTable(group.docs || [])}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <AlertModal
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
        title="Download Error"
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
}
