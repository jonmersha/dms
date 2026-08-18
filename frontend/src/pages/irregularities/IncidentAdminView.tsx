import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { irregularityApiService } from '../../services/irregularityApiService';
import type { IncidentCategory, IncidentSystem, ResponsibleOrgan } from '../../types/irregularity';
import { Settings, Plus, Trash2, Edit2, AlertCircle, RefreshCw, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function IncidentAdminView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'categories' | 'systems' | 'organs'>('categories');
  const [categories, setCategories] = useState<IncidentCategory[]>([]);
  const [systems, setSystems] = useState<IncidentSystem[]>([]);
  const [organs, setOrgans] = useState<ResponsibleOrgan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cats, sys, org] = await Promise.all([
        irregularityApiService.getCategories(),
        irregularityApiService.getSystems(),
        irregularityApiService.getOrgans()
      ]);
      setCategories(cats);
      setSystems(sys);
      setOrgans(org);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

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
      alert("Failed to save.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure? This might affect existing records if set to null on delete.")) return;
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
      alert("Failed to delete. It might be in use.");
    }
  };

  const currentData = activeTab === 'categories' ? categories : activeTab === 'systems' ? systems : organs;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="text-indigo-600" />
            Incident Log Administration
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage dynamic lookup values for incident registrations.</p>
        </div>
        <button 
          onClick={() => navigate('/incident-log')}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          Back to Incident Log
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Settings</h2>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'categories' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              Incident Categories
            </button>
            <button
              onClick={() => setActiveTab('systems')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'systems' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              Systems Involved
            </button>
            <button
              onClick={() => setActiveTab('organs')}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'organs' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              Responsible Organs
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 capitalize">Manage {activeTab}</h2>
            <button onClick={fetchData} className="text-gray-400 hover:text-gray-600"><RefreshCw size={18} /></button>
          </div>

          {/* Form */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Name</label>
              <input 
                type="text" 
                className="w-full border-gray-300 rounded-md text-sm"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            {activeTab === 'categories' && (
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description (Optional)</label>
                <input 
                  type="text" 
                  className="w-full border-gray-300 rounded-md text-sm"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
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
                  onClick={() => { setEditingId(null); setFormData({name: '', description: ''}); }}
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
                        onClick={() => { setEditingId(item.id); setFormData({name: item.name, description: item.description || ''}); }}
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
        </div>
      </div>
    </div>
  );
}
