import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Save, ListVideo, Video, Settings, PlayCircle } from 'lucide-react';
import api from '../../api/axios';
import { AdminQuizManager } from './AdminQuizManager';

interface Episode {
  id: number;
  title: string;
  content_type: 'video' | 'text' | 'mixed' | 'quiz';
  video_url: string;
  content_text: string;
  order: number;
  quiz?: {
    id: number;
  };
}

interface Playlist {
  id: number;
  title: string;
  description: string;
  main_url: string;
  playlist_id: string;
  order: number;
  episodes: Episode[];
}

export function AdminLearning() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<Partial<Playlist>>({});
  
  // Details Modal (shows episodes)
  const [selectedPlaylistDetails, setSelectedPlaylistDetails] = useState<Playlist | null>(null);
  
  // Episode Modal
  const [isEpisodeModalOpen, setIsEpisodeModalOpen] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<Partial<Episode>>({});
  
  // Quiz Manager
  const [manageQuizId, setManageQuizId] = useState<number | null>(null);

  // Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Certificate Settings Modal
  const [isCertSettingsModalOpen, setIsCertSettingsModalOpen] = useState(false);
  const [certSettings, setCertSettings] = useState<{ chief_auditor_name: string, organization_name: string, motto: string, tagline: string }>({ chief_auditor_name: 'Chief Internal Auditor', organization_name: 'Coop Bank Internal Audit Excellence Center', motto: '', tagline: '' });
  const [bgFile, setBgFile] = useState<File | null>(null);
  const [sigFile, setSigFile] = useState<File | null>(null);

  useEffect(() => {
    fetchPlaylists();
    fetchCertSettings();
  }, []);

  const fetchCertSettings = async () => {
    try {
      const response = await api.get('/api/public-pages/certificate-settings/');
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

  const handleImportPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;
    setIsImporting(true);
    setError('');
    
    try {
      await api.post('/api/public-pages/learning-playlists/import_youtube_playlist/', { url: importUrl });
      setIsImportModalOpen(false);
      setImportUrl('');
      fetchPlaylists();
      alert('Playlist imported successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to import playlist');
    } finally {
      setIsImporting(false);
    }
  };

  const fetchPlaylists = async (preserveDetailsModal = true) => {
    try {
      const response = await api.get('/api/public-pages/learning-playlists/');
      const data: Playlist[] = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setPlaylists(data);
      
      // Update selected playlist details if open
      if (preserveDetailsModal && selectedPlaylistDetails) {
        const updated = data.find((p: Playlist) => p.id === selectedPlaylistDetails.id);
        if (updated) setSelectedPlaylistDetails(updated);
      }
    } catch (err) {
      setError('Failed to fetch learning playlists');
    } finally {
      setIsLoading(false);
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

      await api.put('/api/public-pages/certificate-settings/1/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert('Certificate settings saved successfully!');
      setIsCertSettingsModalOpen(false);
      fetchCertSettings();
    } catch (err) {
      alert('Failed to save certificate settings');
    }
  };

  const handleSavePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentPlaylist.id) {
        await api.put(`/api/public-pages/learning-playlists/${currentPlaylist.id}/`, currentPlaylist);
      } else {
        await api.post('/api/public-pages/learning-playlists/', currentPlaylist);
      }
      setIsPlaylistModalOpen(false);
      fetchPlaylists();
    } catch (err) {
      alert('Failed to save playlist');
    }
  };

  const handleDeletePlaylist = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this playlist? This will delete all its episodes.')) {
      try {
        await api.delete(`/api/public-pages/learning-playlists/${id}/`);
        if (selectedPlaylistDetails?.id === id) {
          setSelectedPlaylistDetails(null);
        }
        fetchPlaylists(false);
      } catch (err) {
        alert('Failed to delete playlist');
      }
    }
  };

  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlaylistDetails) return;
    
    try {
      const payload = {
        ...currentEpisode,
        playlist: selectedPlaylistDetails.id
      };
      
      if (currentEpisode.id) {
        await api.put(`/api/public-pages/learning-episodes/${currentEpisode.id}/`, payload);
      } else {
        await api.post('/api/public-pages/learning-episodes/', payload);
      }
      setIsEpisodeModalOpen(false);
      fetchPlaylists(); // Will automatically update the details modal
    } catch (err) {
      alert('Failed to save episode');
    }
  };

  const handleDeleteEpisode = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this episode?')) {
      try {
        await api.delete(`/api/public-pages/learning-episodes/${id}/`);
        fetchPlaylists(); // Will automatically update the details modal
      } catch (err) {
        alert('Failed to delete episode');
      }
    }
  };

  // Helper to extract YouTube thumbnail for the card background
  const getYoutubeThumbnail = (url: string) => {
    try {
      if (url.includes('/embed/')) {
        const parts = url.split('/embed/');
        const afterEmbed = parts[1].split('?')[0];
        if (afterEmbed && afterEmbed !== 'videoseries') {
          return `https://img.youtube.com/vi/${afterEmbed}/hqdefault.jpg`;
        }
      }
      const urlObj = new URL(url);
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    } catch (e) {
      // ignore
    }
    return null;
  };

  if (isLoading) return <div className="p-8 text-center">Loading learning materials...</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Materials Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage playlists and episodes displayed on the public Learning page.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsCertSettingsModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 shadow-sm transition-colors"
          >
            <Settings size={16} /> Certificate Settings
          </button>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm transition-colors"
          >
            <Video size={16} /> Import from YouTube
          </button>
          <button
            onClick={() => {
              setCurrentPlaylist({ order: playlists.length + 1 });
              setIsPlaylistModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus size={16} /> Create Course
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Grid of Playlists */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {playlists.map((playlist) => {
          const thumbnail = getYoutubeThumbnail(playlist.main_url);
          return (
            <div key={playlist.id} className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 overflow-hidden flex flex-col transition-all duration-200 group">
              {/* Card Image / Header */}
              <div 
                className="h-32 relative bg-gray-800 cursor-pointer overflow-hidden"
                onClick={() => setSelectedPlaylistDetails(playlist)}
              >
                {thumbnail ? (
                  <img src={thumbnail} alt={playlist.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-700 to-indigo-800 flex items-center justify-center">
                    <Video size={32} className="text-white/40" />
                  </div>
                )}
                
                {/* Overlay actions */}
                <div className="absolute top-2 right-2 flex gap-1 bg-black/50 backdrop-blur-sm p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentPlaylist(playlist); setIsPlaylistModalOpen(true); }}
                    className="p-1.5 text-white hover:text-blue-300 hover:bg-white/20 rounded-md transition-colors"
                    title="Edit Course"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeletePlaylist(playlist.id); }}
                    className="p-1.5 text-white hover:text-red-300 hover:bg-white/20 rounded-md transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded">
                  Order: {playlist.order}
                </div>
              </div>
              
              {/* Card Body */}
              <div 
                className="p-5 flex-1 flex flex-col cursor-pointer"
                onClick={() => setSelectedPlaylistDetails(playlist)}
              >
                <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">{playlist.title}</h2>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{playlist.description}</p>
                
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm font-medium text-gray-700">
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <ListVideo size={16} />
                    <span>{playlist.episodes.length} Episodes</span>
                  </div>
                  <span className="text-gray-400 group-hover:text-blue-600 flex items-center gap-1">
                    Manage <Settings size={14} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        
        {playlists.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <ListVideo className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No playlists</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new learning playlist.</p>
            <button
              onClick={() => {
                setCurrentPlaylist({ order: 1 });
                setIsPlaylistModalOpen(true);
              }}
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus size={16} /> Create First Course
            </button>
          </div>
        )}
      </div>

      {/* DETAILS MODAL (Manages Episodes) */}
      {selectedPlaylistDetails && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPlaylistDetails(null)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl shrink-0">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900 line-clamp-1">{selectedPlaylistDetails.title}</h2>
                  <button
                    onClick={() => {
                      setCurrentPlaylist(selectedPlaylistDetails);
                      setIsPlaylistModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                  >
                    <Edit2 size={12} /> Edit Info
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span>Playlist ID: {selectedPlaylistDetails.playlist_id || 'N/A'}</span>
                  <span>Total Episodes: {selectedPlaylistDetails.episodes.length}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPlaylistDetails(null)}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-hidden flex flex-col p-6">
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="text-lg font-semibold text-gray-800">Episodes List</h3>
                <button
                  onClick={() => {
                    setCurrentEpisode({ order: selectedPlaylistDetails.episodes.length + 1 });
                    setIsEpisodeModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors shadow-sm"
                >
                  <Plus size={16} /> Add Episode
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 custom-scrollbar">
                {selectedPlaylistDetails.episodes.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {selectedPlaylistDetails.episodes.map(ep => (
                      <div key={ep.id} className="flex justify-between items-center px-4 py-3 bg-white hover:bg-blue-50 transition-colors group">
                        <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-mono text-sm shrink-0">
                            {ep.order}
                          </span>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-semibold text-gray-900 truncate">{ep.title}</span>
                            <a href={ep.video_url} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate flex items-center gap-1 mt-0.5">
                              <PlayCircle size={12} /> View Source
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setCurrentEpisode(ep);
                              setIsEpisodeModalOpen(true);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                            title="Edit Episode"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteEpisode(ep.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Episode"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-gray-500">
                    <Video size={32} className="text-gray-300 mb-2" />
                    <p className="text-sm">No episodes added yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Playlist Modal */}
      {isPlaylistModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{currentPlaylist.id ? 'Edit Course' : 'Create New Course'}</h2>
              <button onClick={() => setIsPlaylistModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSavePlaylist} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={currentPlaylist.title || ''}
                  onChange={e => setCurrentPlaylist({...currentPlaylist, title: e.target.value})}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={currentPlaylist.description || ''}
                  onChange={e => setCurrentPlaylist({...currentPlaylist, description: e.target.value})}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Main Video URL (iframe src)</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/embed/..."
                  value={currentPlaylist.main_url || ''}
                  onChange={e => setCurrentPlaylist({...currentPlaylist, main_url: e.target.value})}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Playlist ID (Optional)</label>
                  <input
                    type="text"
                    value={currentPlaylist.playlist_id || ''}
                    onChange={e => setCurrentPlaylist({...currentPlaylist, playlist_id: e.target.value})}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={currentPlaylist.order || 1}
                    onChange={e => setCurrentPlaylist({...currentPlaylist, order: parseInt(e.target.value)})}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPlaylistModalOpen(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Save size={16} /> Save Playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Episode Modal */}
      {isEpisodeModalOpen && selectedPlaylistDetails && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">{currentEpisode.id ? 'Edit Episode' : 'Add New Episode'}</h2>
              <button onClick={() => setIsEpisodeModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveEpisode} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={currentEpisode.title || ''}
                  onChange={e => setCurrentEpisode({...currentEpisode, title: e.target.value})}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                <select
                  value={currentEpisode.content_type || 'video'}
                  onChange={e => setCurrentEpisode({...currentEpisode, content_type: e.target.value as Episode['content_type']})}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm bg-white"
                >
                  <option value="video">Video Only</option>
                  <option value="text">Text Only</option>
                  <option value="mixed">Video and Text</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              
              {['video', 'mixed'].includes(currentEpisode.content_type || 'video') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (Full URL)</label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={currentEpisode.video_url || ''}
                    onChange={e => setCurrentEpisode({...currentEpisode, video_url: e.target.value})}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                  />
                </div>
              )}

              {['text', 'mixed', 'quiz'].includes(currentEpisode.content_type || 'video') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {currentEpisode.content_type === 'quiz' ? 'Quiz Description / Instructions' : 'Text Content (Markdown/HTML supported)'}
                  </label>
                  <textarea
                    rows={6}
                    value={currentEpisode.content_text || ''}
                    onChange={e => setCurrentEpisode({...currentEpisode, content_text: e.target.value})}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm font-mono"
                  />
                  {currentEpisode.content_type === 'quiz' && (
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Quiz Content</h4>
                        <p className="text-xs text-gray-500">Manage questions and answers</p>
                      </div>
                      {currentEpisode.quiz ? (
                        <button
                          type="button"
                          onClick={() => {
                             setIsEpisodeModalOpen(false);
                             setManageQuizId(currentEpisode.quiz?.id || null);
                          }}
                          className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                        >
                          Manage Quiz Questions
                        </button>
                      ) : (
                        <p className="text-xs text-amber-600 font-medium bg-amber-50 p-2 rounded border border-amber-100">
                          Save the episode first to manage its questions.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Episode Order</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={currentEpisode.order || 1}
                  onChange={e => setCurrentEpisode({...currentEpisode, order: parseInt(e.target.value)})}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
                />
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEpisodeModalOpen(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Save size={16} /> Save Episode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Playlist Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Video size={18} className="text-emerald-600" /> Import from YouTube
              </h2>
              <button 
                onClick={() => !isImporting && setIsImportModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors"
                disabled={isImporting}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleImportPlaylist} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">YouTube Playlist URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://youtube.com/playlist?list=..."
                  value={importUrl}
                  onChange={e => setImportUrl(e.target.value)}
                  disabled={isImporting}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-sm"
                />
                <p className="mt-2 text-xs text-gray-500">
                  This will fetch all videos in the playlist, group them into subsections, and generate placeholder quizzes.
                </p>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  disabled={isImporting}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting || !importUrl}
                  className="flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isImporting ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Import
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Quiz Manager */}
      {manageQuizId && (
        <AdminQuizManager 
          quizId={manageQuizId} 
          onClose={() => setManageQuizId(null)} 
        />
      )}
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
    </div>
  );
}
