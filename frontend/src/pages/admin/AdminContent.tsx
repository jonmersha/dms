import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import { OrgChartEditor, type OrgNode } from './components/OrgChartEditor';

interface ContentBlock {
  page: string;
  section_key: string;
  content: string;
}

// Define the structure of pages and their editable sections
const PAGE_STRUCTURE: Record<string, { label: string, sections: { key: string, label: string, type: 'text' | 'textarea' | 'html' | 'org_chart' }[] }> = {
  'about_us': {
    label: 'About Us',
    sections: [
      { key: 'hero_title', label: 'Hero Title', type: 'text' },
      { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
      { key: 'mission', label: 'Mission Text', type: 'textarea' },
      { key: 'vision', label: 'Vision Text', type: 'textarea' },
      { key: 'values', label: 'Core Values Text', type: 'textarea' },
      { key: 'org_chart_json', label: 'Organizational Structure', type: 'org_chart' },
    ]
  },
  'landing_page': {
    label: 'Landing Page (Home)',
    sections: [
      { key: 'hero_title', label: 'Hero Title', type: 'text' },
      { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
      { key: 'hero_description', label: 'Hero Description', type: 'textarea' },
    ]
  },
  'learning': {
    label: 'Learning',
    sections: [
      { key: 'hero_title', label: 'Hero Title', type: 'text' },
      { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
    ]
  },
  'publications': {
    label: 'Publications',
    sections: [
      { key: 'hero_title', label: 'Hero Title', type: 'text' },
      { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
    ]
  },
  'quality': {
    label: 'Quality Management',
    sections: [
      { key: 'hero_title', label: 'Hero Title', type: 'text' },
      { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
      { key: 'intro_title', label: 'Intro Title', type: 'text' },
      { key: 'intro_text_1', label: 'Intro Text Paragraph 1', type: 'textarea' },
      { key: 'intro_text_2', label: 'Intro Text Paragraph 2', type: 'textarea' },
    ]
  },
  'performance': {
    label: 'Performance & Plans',
    sections: [
      { key: 'hero_title', label: 'Hero Title', type: 'text' },
      { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
    ]
  }
};

export function AdminContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('about_us');
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (!user || (!user.is_superuser && !user.can_manage_public_content)) {
      navigate('/dashboard');
      return;
    }

    const fetchBlocks = async () => {
      try {
        const response = await api.get('/api/public-pages/content-blocks/');
        setBlocks(response.data);
      } catch (err) {
        console.error("Failed to load content blocks", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlocks();
  }, [user, navigate]);

  const handleContentChange = (page: string, section_key: string, newContent: string) => {
    setBlocks(prev => {
      const existing = prev.find(b => b.page === page && b.section_key === section_key);
      if (existing) {
        return prev.map(b => b.page === page && b.section_key === section_key ? { ...b, content: newContent } : b);
      } else {
        return [...prev, { page, section_key, content: newContent }];
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await api.post(
        '/api/public-pages/content-blocks/bulk_update/',
        { blocks }
      );
      setMessage({ type: 'success', text: 'Content saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to save content.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Public Page Content Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Edit the text that appears on the public-facing pages.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
        >
          <Save size={16} />
          {isSaving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-md flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.type === 'success' ? <CheckCircle2 size={20} className="text-green-600" /> : <AlertCircle size={20} className="text-red-600" />}
          {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-64 flex-shrink-0">
          <nav className="flex flex-col space-y-1">
            {Object.entries(PAGE_STRUCTURE).map(([key, page]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  activeTab === key
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-900 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {page.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1">
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6">
                {PAGE_STRUCTURE[activeTab].label} Content
              </h3>
              
              <div className="space-y-6">
                {PAGE_STRUCTURE[activeTab].sections.map(section => {
                  const block = blocks.find(b => b.page === activeTab && b.section_key === section.key);
                  const content = block ? block.content : '';

                  return (
                    <div key={section.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {section.label}
                      </label>
                      {section.type === 'org_chart' ? (
                        <div className="border border-gray-200 rounded p-4 bg-gray-50">
                          <OrgChartEditor 
                            data={(function() {
                              try {
                                return content ? JSON.parse(content) : { id: 'root', title: 'Chief Internal Auditor', subtitle: '', children: [] };
                              } catch(e) {
                                return { id: 'root', title: 'Chief Internal Auditor', subtitle: '', children: [] };
                              }
                            })()} 
                            onChange={(newData) => handleContentChange(activeTab, section.key, JSON.stringify(newData))} 
                          />
                        </div>
                      ) : section.type === 'textarea' ? (
                        <textarea
                          rows={4}
                          value={content}
                          onChange={(e) => handleContentChange(activeTab, section.key, e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                          placeholder={`Enter ${section.label.toLowerCase()}...`}
                        />
                      ) : (
                        <input
                          type="text"
                          value={content}
                          onChange={(e) => handleContentChange(activeTab, section.key, e.target.value)}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                          placeholder={`Enter ${section.label.toLowerCase()}...`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
