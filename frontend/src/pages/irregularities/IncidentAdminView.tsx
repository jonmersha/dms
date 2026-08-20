import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { irregularityApiService } from '../../services/irregularityApiService';
import type { IncidentCategory, IncidentSystem, ResponsibleOrgan } from '../../types/irregularity';
import { Settings, Plus, Trash2, Edit2, AlertCircle, RefreshCw, Save, X, Building2, Tag, Cpu, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

type TabType = 'categories' | 'systems' | 'organs' | 'org-units';

interface OrgUnit {
  id: number;
  name: string;
  code: string | null;
  unit_type: string;
  unit_type_display: string;
  parent: number | null;
  parent_name: string | null;
  is_active: boolean;
}

const UNIT_TYPES = [
  { value: 'BRANCH', label: 'Branch' },
  { value: 'DISTRICT_OFFICE', label: 'District Office' },
  { value: 'REGIONAL_OFFICE', label: 'Regional Office' },
  { value: 'HEAD_OFFICE', label: 'Head Office' },
  { value: 'DEPARTMENT', label: 'Department' },
  { value: 'OTHER', label: 'Other' },
];

const UNIT_TYPE_COLORS: Record<string, string> = {
  BRANCH: 'bg-blue-100 text-blue-700',
  DISTRICT_OFFICE: 'bg-purple-100 text-purple-700',
  REGIONAL_OFFICE: 'bg-orange-100 text-orange-700',
  HEAD_OFFICE: 'bg-red-100 text-red-700',
  DEPARTMENT: 'bg-green-100 text-green-700',
  OTHER: 'bg-gray-100 text-gray-700',
};

export default function IncidentAdminView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<TabType>('categories');
  const [categories, setCategories] = useState<IncidentCategory[]>([]);
  const [systems, setSystems] = useState<IncidentSystem[]>([]);
  const [organs, setOrgans] = useState<ResponsibleOrgan[]>([]);
  const [orgUnits, setOrgUnits] = useState<OrgUnit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State — generic
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  // Org Unit form state
  const [orgUnitForm, setOrgUnitForm] = useState({
    name: '', code: '', unit_type: 'BRANCH', parent: '' as string | number, is_active: true
  });
  const [editingOrgUnitId, setEditingOrgUnitId] = useState<number | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cats, sys, org, units] = await Promise.all([
        irregularityApiService.getCategories(),
        irregularityApiService.getSystems(),
        irregularityApiService.getOrgans(),
        api.get('/api/irregularities/organizational-units/').then(r => r.data?.results ?? r.data),
      ]);
      setCategories(cats);
      setSystems(sys);
      setOrgans(org);
      setOrgUnits(Array.isArray(units) ? units : []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Generic CRUD for categories / systems / organs ---
  const handleSave = async () => {
    if (!formData.name) return;
    try {
      if (activeTab === 'categories') {
        if (editingId) {
          const res = await irregularityApiService.updateCategory(editingId, { name: formData.name, description: formData.description });
          setCategories(categories.map(c => c.id === editingId ? res : c));
        } else {
          const res = await irregularityApiService.createCategory({ name: formData.name, description: formData.description });
          setCategories([...categories, res]);
        }
      } else if (activeTab === 'systems') {
        if (editingId) {
          const res = await irregularityApiService.updateSystem(editingId, { name: formData.name });
          setSystems(systems.map(s => s.id === editingId ? res : s));
        } else {
          const res = await irregularityApiService.createSystem({ name: formData.name });
          setSystems([...systems, res]);
        }
      } else {
        if (editingId) {
          const res = await irregularityApiService.updateOrgan(editingId, { name: formData.name });
          setOrgans(organs.map(o => o.id === editingId ? res : o));
        } else {
          const res = await irregularityApiService.createOrgan({ name: formData.name });
          setOrgans([...organs, res]);
        }
      }
      setFormData({ name: '', description: '' });
      setEditingId(null);
    } catch (e) {
      alert('Failed to save.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      if (activeTab === 'categories') {
        await irregularityApiService.deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
      } else if (activeTab === 'systems') {
        await irregularityApiService.deleteSystem(id);
        setSystems(systems.filter(s => s.id !== id));
      } else {
        await irregularityApiService.deleteOrgan(id);
        setOrgans(organs.filter(o => o.id !== id));
      }
    } catch (e) {
      alert('Failed to delete. It might be in use.');
    }
  };

  // --- Org Unit CRUD ---
  const handleOrgUnitSave = async () => {
    if (!orgUnitForm.name) return;
    const payload = {
      name: orgUnitForm.name,
      code: orgUnitForm.code || null,
      unit_type: orgUnitForm.unit_type,
      parent: orgUnitForm.parent !== '' ? Number(orgUnitForm.parent) : null,
      is_active: orgUnitForm.is_active,
    };
    try {
      if (editingOrgUnitId) {
        const res = await api.patch(`/api/irregularities/organizational-units/${editingOrgUnitId}/`, payload);
        setOrgUnits(orgUnits.map(u => u.id === editingOrgUnitId ? res.data : u));
      } else {
        const res = await api.post('/api/irregularities/organizational-units/', payload);
        setOrgUnits([...orgUnits, res.data]);
      }
      setOrgUnitForm({ name: '', code: '', unit_type: 'BRANCH', parent: '', is_active: true });
      setEditingOrgUnitId(null);
    } catch (e) {
      alert('Failed to save organizational unit.');
    }
  };

  const handleOrgUnitDelete = async (id: number) => {
    if (!window.confirm('Delete this organizational unit?')) return;
    try {
      await api.delete(`/api/irregularities/organizational-units/${id}/`);
      setOrgUnits(orgUnits.filter(u => u.id !== id));
    } catch (e) {
      alert('Failed to delete. It may have sub-units attached.');
    }
  };

  const startEditOrgUnit = (unit: OrgUnit) => {
    setEditingOrgUnitId(unit.id);
    setOrgUnitForm({
      name: unit.name,
      code: unit.code || '',
      unit_type: unit.unit_type,
      parent: unit.parent ?? '',
      is_active: unit.is_active,
    });
  };

  const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
    { key: 'categories', label: 'Audit Categories', icon: <Tag size={16} /> },
    { key: 'systems', label: 'Systems Involved', icon: <Cpu size={16} /> },
    { key: 'organs', label: 'Responsible Organs', icon: <Users size={16} /> },
    { key: 'org-units', label: 'Organizational Units', icon: <Building2 size={16} /> },
  ];

  const currentData = activeTab === 'categories' ? categories : activeTab === 'systems' ? systems : organs;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-indigo-600" />
            Branch Audit Administration
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage dynamic lookup values for branch audit registrations.</p>
        </div>
        <button 
          onClick={() => navigate('/branch-audit')}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm hover:shadow"
        >
          Back to Branch Audit Registry
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4 shrink-0">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Settings</h2>
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setEditingId(null); setEditingOrgUnitId(null); setFormData({ name: '', description: '' }); setOrgUnitForm({ name: '', code: '', unit_type: 'BRANCH', parent: '', is_active: true }); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === tab.key ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-200'}`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              {tabs.find(t => t.key === activeTab)?.label}
            </h2>
            <button onClick={fetchData} className="text-gray-400 hover:text-gray-600"><RefreshCw size={18} /></button>
          </div>

          {/* Org Units Tab */}
          {activeTab === 'org-units' ? (
            <div className="flex flex-col gap-4">
              {/* Org Unit Form */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                <h3 className="text-sm font-bold text-gray-700">{editingOrgUnitId ? 'Edit Unit' : 'Add New Organizational Unit'}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Name *</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                      placeholder="e.g. Addis Ababa Branch"
                      value={orgUnitForm.name}
                      onChange={e => setOrgUnitForm({ ...orgUnitForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Code</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                      placeholder="e.g. AAB-001"
                      value={orgUnitForm.code}
                      onChange={e => setOrgUnitForm({ ...orgUnitForm, code: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Unit Type *</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                      value={orgUnitForm.unit_type}
                      onChange={e => setOrgUnitForm({ ...orgUnitForm, unit_type: e.target.value })}
                    >
                      {UNIT_TYPES.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Parent Unit (Optional)</label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                      value={orgUnitForm.parent}
                      onChange={e => setOrgUnitForm({ ...orgUnitForm, parent: e.target.value })}
                    >
                      <option value="">— None —</option>
                      {orgUnits.filter(u => u.id !== editingOrgUnitId).map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.unit_type_display})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={orgUnitForm.is_active}
                      onChange={e => setOrgUnitForm({ ...orgUnitForm, is_active: e.target.checked })}
                      className="rounded"
                    />
                    Active
                  </label>
                  <div className="ml-auto flex gap-2">
                    {editingOrgUnitId && (
                      <button
                        onClick={() => { setEditingOrgUnitId(null); setOrgUnitForm({ name: '', code: '', unit_type: 'BRANCH', parent: '', is_active: true }); }}
                        className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-gray-300 flex items-center gap-1"
                      >
                        <X size={14} /> Cancel
                      </button>
                    )}
                    <button
                      onClick={handleOrgUnitSave}
                      className="bg-indigo-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-indigo-700 flex items-center gap-1"
                    >
                      {editingOrgUnitId ? <Save size={14} /> : <Plus size={14} />}
                      {editingOrgUnitId ? 'Update' : 'Add Unit'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Org Unit List */}
              {isLoading ? (
                <p className="text-sm text-gray-500 text-center py-8">Loading...</p>
              ) : orgUnits.length === 0 ? (
                <div className="text-center py-10">
                  <Building2 className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No organizational units configured yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden">
                  {orgUnits.map(unit => (
                    <li key={unit.id} className="p-4 hover:bg-gray-50 flex items-center justify-between group transition-colors">
                      <div className="flex items-center gap-3">
                        <Building2 size={18} className="text-gray-400 shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 text-sm">{unit.name}</p>
                            {unit.code && <span className="text-xs text-gray-400 font-mono">[{unit.code}]</span>}
                            {!unit.is_active && <span className="text-xs text-red-500">(Inactive)</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${UNIT_TYPE_COLORS[unit.unit_type] || 'bg-gray-100 text-gray-600'}`}>
                              {unit.unit_type_display}
                            </span>
                            {unit.parent_name && (
                              <span className="text-xs text-gray-400">↳ {unit.parent_name}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditOrgUnit(unit)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleOrgUnitDelete(unit.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <>
              {/* Generic form for categories / systems / organs */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                {activeTab === 'categories' && (
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700 flex items-center gap-1"
                  >
                    {editingId ? <Save size={16} /> : <Plus size={16} />}
                    {editingId ? 'Update' : 'Add'}
                  </button>
                  {editingId && (
                    <button
                      onClick={() => { setEditingId(null); setFormData({ name: '', description: '' }); }}
                      className="bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-semibold hover:bg-gray-300 flex items-center gap-1"
                    >
                      <X size={16} /> Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <p className="text-sm text-gray-500 text-center py-10">Loading...</p>
                ) : currentData.length === 0 ? (
                  <div className="text-center py-10">
                    <AlertCircle className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">No data configured yet.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
                    {currentData.map((item: any) => (
                      <li key={item.id} className="p-4 hover:bg-gray-50 flex items-center justify-between group transition-colors">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                          {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditingId(item.id); setFormData({ name: item.name, description: item.description || '' }); }}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
