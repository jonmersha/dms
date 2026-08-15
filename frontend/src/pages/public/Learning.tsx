import React, { useState, useEffect } from 'react';
import { PlayCircle, X, BookOpen, Clock, Video, ListVideo, FileText, CheckCircle, HelpCircle, Download } from 'lucide-react';
import { usePublicContent } from '../../hooks/usePublicContent';
import { useAuth } from '../../contexts/AuthContext';
import YouTube from 'react-youtube';
import api from '../../api/axios';

interface QuizAnswer {
  id: number;
  text: string;
}

interface QuizQuestion {
  id: number;
  text: string;
  order: number;
  answers: QuizAnswer[];
}

interface Quiz {
  id: number;
  title: string;
  description?: string;
  passing_score: number;
  questions: QuizQuestion[];
}

interface Episode {
  id: number;
  title: string;
  content_type: 'video' | 'text' | 'mixed' | 'quiz';
  video_url: string;
  content_text: string;
  order: number;
  is_completed: boolean;
  quiz?: Quiz;
}

interface Playlist {
  id: number;
  title: string;
  description: string;
  main_url: string;
  playlist_id: string;
  order: number;
  episodes: Episode[];
  is_enrolled: boolean;
  progress_percentage: number;
}

export function Learning() {
  const { content } = usePublicContent('learning');
  const heroTitle = content.hero_title || "Learning & Development";
  const heroSubtitle = content.hero_subtitle || "Enhance your knowledge with our comprehensive educational resources and training materials on internal auditing.";
  
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [autoPlayNext, setAutoPlayNext] = useState(true);

  useEffect(() => {
    fetchPlaylists();
  }, [user]); // Refetch when auth state changes to get enrollment status

  const fetchPlaylists = async () => {
    try {
      // Fetch playlists from API. The backend returns is_enrolled and progress_percentage if authenticated.
      const response = await api.get('/api/public-pages/learning-playlists/');
      const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
      setPlaylists(data as Playlist[]);
    } catch (error) {
      console.error("Failed to fetch learning materials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    // Select first episode by default
    if (playlist.episodes && playlist.episodes.length > 0) {
      setCurrentEpisode(playlist.episodes[0]);
    } else {
      setCurrentEpisode(null);
    }
    // Prevent scrolling on body
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedPlaylist(null);
    setCurrentEpisode(null);
    // Restore scrolling
    document.body.style.overflow = 'auto';
    // Refetch to get updated progress in the grid
    fetchPlaylists();
  };

  const handleEnroll = async (e: React.MouseEvent, playlistId: number) => {
    e.stopPropagation(); // Prevent opening modal
    if (!user) {
      alert("Please log in to subscribe to this course.");
      return;
    }
    try {
      await api.post(`/api/public-pages/learning-playlists/${playlistId}/enroll/`);
      
      // Update the playlists list
      const updatedPlaylists = playlists.map(p => 
        p.id === playlistId ? { ...p, is_enrolled: true } : p
      );
      setPlaylists(updatedPlaylists);
      
      // Update the modal if it's currently open
      if (selectedPlaylist && selectedPlaylist.id === playlistId) {
        setSelectedPlaylist({ ...selectedPlaylist, is_enrolled: true });
      }
    } catch (error) {
      console.error("Enrollment failed:", error);
    }
  };

  const [certificatePreview, setCertificatePreview] = useState<{url: string, playlistId: number} | null>(null);

  const handlePreviewCertificate = async (playlistId: number) => {
    try {
      const response = await api.get(`/api/public-pages/learning-playlists/${playlistId}/certificate/`, {
        responseType: 'blob', // Important for downloading files
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      setCertificatePreview({ url, playlistId });
    } catch (error) {
      console.error("Failed to load certificate preview:", error);
      alert("Failed to load certificate. Make sure you have completed the course.");
    }
  };

  const handleDownloadCertificate = () => {
    if (!certificatePreview) return;
    const link = document.createElement('a');
    link.href = certificatePreview.url;
    link.setAttribute('download', `certificate_${certificatePreview.playlistId}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeCertificatePreview = () => {
    if (certificatePreview) {
      window.URL.revokeObjectURL(certificatePreview.url);
      setCertificatePreview(null);
    }
  };

  const handleMarkComplete = async (episodeId: number) => {
    if (!user) {
      alert("Please log in to track your progress.");
      return;
    }
    try {
      await api.post(`/api/public-pages/learning-episodes/${episodeId}/complete/`);
      
      // Update local state for immediate feedback
      if (selectedPlaylist) {
        const updatedEpisodes = selectedPlaylist.episodes.map(ep => 
          ep.id === episodeId ? { ...ep, is_completed: true } : ep
        );
        setSelectedPlaylist({ ...selectedPlaylist, episodes: updatedEpisodes });
        
        // Also update the current episode
        if (currentEpisode && currentEpisode.id === episodeId) {
          setCurrentEpisode({ ...currentEpisode, is_completed: true });
        }
      }
    } catch (error) {
      console.error("Failed to mark complete:", error);
    }
  };

  const getVideoId = (url: string) => {
    try {
      if (url.includes('/embed/')) {
        const parts = url.split('/embed/');
        const afterEmbed = parts[1].split('?')[0];
        if (afterEmbed && afterEmbed !== 'videoseries') {
          return afterEmbed;
        }
      }
      const urlObj = new URL(url);
      return urlObj.searchParams.get('v') || '';
    } catch (err) {
      return '';
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

  const [videoProgress, setVideoProgress] = useState(0);
  const videoIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Quiz State
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{[questionId: number]: number}>({});
  const [quizResult, setQuizResult] = useState<{score: number, passed: boolean} | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Reset progress and quiz when episode changes
  useEffect(() => {
    setVideoProgress(0);
    setIsTakingQuiz(false);
    setQuizAnswers({});
    setQuizResult(null);
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
    }
  }, [currentEpisode]);

  const handleSubmitQuiz = async () => {
    if (!currentEpisode?.quiz) return;
    setSubmittingQuiz(true);
    try {
      const res = await api.post(`/api/public-pages/quiz-answers/${currentEpisode.quiz.id}/submit/`, {
        answers: quizAnswers
      });
      setQuizResult({ score: res.data.score, passed: res.data.passed });
      
      // If passed, the backend automatically marks the episode complete.
      // We should refresh the playlist to reflect this and update current episode
      if (res.data.passed) {
        // Find playlist details again to refresh completion state
        const updatedRes = await api.get(`/api/public-pages/learning-playlists/${selectedPlaylist?.id}/`);
        setSelectedPlaylist(updatedRes.data);
        const updatedEp = updatedRes.data.episodes.find((ep: any) => ep.id === currentEpisode.id);
        if (updatedEp) setCurrentEpisode(updatedEp);
      }
    } catch (e) {
      alert("Failed to submit quiz.");
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const startVideoTracking = (player: any) => {
    if (videoIntervalRef.current) clearInterval(videoIntervalRef.current);
    videoIntervalRef.current = setInterval(async () => {
      try {
        const currentTime = await player.getCurrentTime();
        const duration = await player.getDuration();
        if (duration > 0) {
          setVideoProgress((currentTime / duration) * 100);
        }
      } catch (e) {
        // ignore
      }
    }, 1000);
  };

  const stopVideoTracking = () => {
    if (videoIntervalRef.current) {
      clearInterval(videoIntervalRef.current);
      videoIntervalRef.current = null;
    }
  };

  const onPlayerStateChange = (event: any) => {
    // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
    if (event.data === 1) {
      startVideoTracking(event.target);
    } else {
      stopVideoTracking();
    }
  };

  const onPlayerEnd = async (event: any) => {
    stopVideoTracking();
    if (currentEpisode && selectedPlaylist?.is_enrolled && !currentEpisode.is_completed) {
      await handleMarkComplete(currentEpisode.id);
    }
    
    // Auto-play next functionality
    if (autoPlayNext && selectedPlaylist && currentEpisode) {
      const currentIndex = selectedPlaylist.episodes.findIndex(ep => ep.id === currentEpisode.id);
      if (currentIndex !== -1 && currentIndex < selectedPlaylist.episodes.length - 1) {
        setTimeout(() => {
          setCurrentEpisode(selectedPlaylist.episodes[currentIndex + 1]);
        }, 1500); // short delay before next video starts
      }
    }
  };

  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
    },
  };

  const renderEpisodeIcon = (type: string) => {
    switch(type) {
      case 'video': return <PlayCircle size={16} />;
      case 'text': return <FileText size={16} />;
      case 'mixed': return <PlayCircle size={16} />;
      case 'quiz': return <HelpCircle size={16} />;
      default: return <PlayCircle size={16} />;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 font-sans pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 py-20 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500 blur-3xl"></div>
          <div className="absolute top-1/2 right-[-10%] w-[40rem] h-[40rem] rounded-full bg-indigo-500 blur-3xl"></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center z-10">
          <BookOpen className="mx-auto h-16 w-16 mb-6 text-blue-300 opacity-90" />
          <h1 className="text-4xl font-extrabold sm:text-5xl lg:text-6xl tracking-tight mb-6 whitespace-pre-line text-white shadow-sm">
            {heroTitle}
          </h1>
          <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto whitespace-pre-line leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </div>

      <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
              <div className="h-4 w-48 bg-slate-200 rounded"></div>
            </div>
          </div>
        ) : (
          <>
            {user && playlists.some(p => p.is_enrolled) && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <CheckCircle className="text-blue-600" /> My Courses
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {playlists.filter(p => p.is_enrolled).map(playlist => (
                    <div 
                      key={`enrolled-${playlist.id}`}
                      onClick={() => openModal(playlist)}
                      className="bg-white rounded-xl shadow-sm hover:shadow-md border border-slate-200 p-4 flex gap-4 cursor-pointer transition-shadow"
                    >
                      <div className="w-24 h-24 bg-slate-800 rounded-lg shrink-0 overflow-hidden relative">
                        {getYoutubeThumbnail(playlist.main_url) ? (
                          <img src={getYoutubeThumbnail(playlist.main_url)!} className="w-full h-full object-cover opacity-80" alt="" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center">
                            <Video size={24} className="text-white/40" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="font-bold text-slate-900 truncate mb-1">{playlist.title}</h3>
                        <div className="flex justify-between text-xs text-slate-500 mb-2">
                          <span>{playlist.progress_percentage}% Completed</span>
                          <span>{playlist.episodes.length} Lessons</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${playlist.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <h2 className="text-2xl font-bold text-slate-900 mb-6">Course Catalog</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {playlists.map(playlist => {
                const thumbnail = getYoutubeThumbnail(playlist.main_url);
                return (
                  <div 
                    key={playlist.id} 
                    onClick={() => openModal(playlist)}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-200 flex flex-col h-full transform hover:-translate-y-1"
                  >
                    {/* Card Image / Gradient */}
                    <div className="h-48 relative overflow-hidden bg-slate-800">
                      {thumbnail ? (
                        <img 
                          src={thumbnail} 
                          alt={playlist.title} 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-700 to-indigo-900 flex items-center justify-center group-hover:scale-105 transition-all duration-500">
                          <Video size={48} className="text-white/30" />
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <PlayCircle size={64} className="text-white drop-shadow-lg" />
                      </div>
                      
                      <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1.5">
                        <ListVideo size={14} />
                        {playlist.episodes?.length || 0} Lessons
                      </div>
                    </div>
                    
                    {/* Card Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {playlist.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-1">
                        {playlist.description}
                      </p>
                      
                      <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between">
                        {playlist.is_enrolled ? (
                          <div className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                            <CheckCircle size={16} /> Enrolled
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleEnroll(e, playlist.id)}
                            className="text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-md transition-colors"
                          >
                            Subscribe
                          </button>
                        )}
                        <span className="text-sm text-blue-600 font-medium group-hover:translate-x-1 transition-transform">
                          View Course →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Details Modal / Player */}
      {selectedPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-0 md:p-6 backdrop-blur-sm">
          <div className="relative w-full h-full md:max-w-6xl bg-slate-900 md:rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900 z-10 shrink-0">
              <div className="flex flex-col">
                <h2 className="text-lg font-bold text-white pr-8 line-clamp-1">{selectedPlaylist.title}</h2>
                {selectedPlaylist.is_enrolled && (
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-32 bg-slate-700 rounded-full h-1.5">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${selectedPlaylist.progress_percentage}%` }}></div>
                    </div>
                    <span className="text-xs text-slate-400">{selectedPlaylist.progress_percentage}%</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                {selectedPlaylist.progress_percentage === 100 && (
                  <button
                    onClick={() => handlePreviewCertificate(selectedPlaylist.id)}
                    className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-md transition-colors"
                    title="Download Certificate of Completion"
                  >
                    <Download size={16} />
                    <span>Certificate</span>
                  </button>
                )}
                {!selectedPlaylist.is_enrolled && user && (
                  <button
                    onClick={(e) => handleEnroll(e, selectedPlaylist.id)}
                    className="hidden sm:block px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Subscribe
                  </button>
                )}
                <button 
                  onClick={closeModal}
                  className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
              {/* Left side: Content Player */}
              <div className="w-full md:w-2/3 bg-slate-950 flex flex-col overflow-y-auto custom-scrollbar relative">
                {!currentEpisode ? (
                  <div className="p-8 text-center text-slate-400 mt-20">
                    <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Select a lesson from the menu to begin.</p>
                  </div>
                ) : (
                  <>
                    {/* VIDEO Section */}
                    {['video', 'mixed'].includes(currentEpisode.content_type) && currentEpisode.video_url && (
                      <div className="aspect-video w-full bg-black shrink-0 relative">
                        <YouTube 
                          videoId={getVideoId(currentEpisode.video_url)} 
                          opts={opts} 
                          onEnd={onPlayerEnd}
                          onStateChange={onPlayerStateChange}
                          className="absolute inset-0 w-full h-full" 
                          iframeClassName="w-full h-full"
                        />
                      </div>
                    )}
                    
                    {/* TEXT/MIXED Section */}
                    {['text', 'mixed'].includes(currentEpisode.content_type) && currentEpisode.content_text && (
                      <div className="p-6 md:p-8 bg-white text-slate-800 flex-1 min-h-0 prose max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: currentEpisode.content_text.replace(/\n/g, '<br/>') }} />
                      </div>
                    )}
                    
                    {/* QUIZ Section */}
                    {currentEpisode.content_type === 'quiz' && (
                      <div className="p-8 flex-1 flex flex-col min-h-0 bg-slate-900 overflow-y-auto">
                        <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-3xl mx-auto border border-slate-700">
                          {currentEpisode.is_completed ? (
                            <div className="text-center">
                              <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
                              <h3 className="text-2xl font-bold text-white mb-2">Quiz Completed</h3>
                              <p className="text-slate-400">You have successfully passed this assessment.</p>
                            </div>
                          ) : isTakingQuiz && currentEpisode.quiz ? (
                            <div>
                              <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
                                <h3 className="text-xl font-bold text-white">{currentEpisode.quiz.title}</h3>
                                <div className="text-sm text-slate-400">Pass mark: {currentEpisode.quiz.passing_score}%</div>
                              </div>
                              
                              {quizResult && (
                                <div className={`p-4 rounded-lg mb-6 text-center ${quizResult.passed ? 'bg-emerald-900/50 border border-emerald-500 text-emerald-200' : 'bg-red-900/50 border border-red-500 text-red-200'}`}>
                                  <h4 className="font-bold text-lg mb-1">{quizResult.passed ? 'Passed!' : 'Failed'}</h4>
                                  <p>Your score: {quizResult.score.toFixed(0)}%</p>
                                  {!quizResult.passed && (
                                    <button 
                                      onClick={() => {
                                        setQuizResult(null);
                                        setQuizAnswers({});
                                      }}
                                      className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm transition-colors"
                                    >
                                      Retake Quiz
                                    </button>
                                  )}
                                </div>
                              )}

                              {!quizResult?.passed && (
                                <div className="space-y-8">
                                  {currentEpisode.quiz.questions?.map((q, idx) => (
                                    <div key={q.id} className="bg-slate-900/50 p-6 rounded-xl border border-slate-700">
                                      <p className="font-medium text-white mb-4"><span className="text-blue-400 mr-2">{idx + 1}.</span> {q.text}</p>
                                      <div className="space-y-3">
                                        {q.answers?.map(a => (
                                          <label key={a.id} className={`flex items-start p-3 rounded-lg cursor-pointer border transition-colors ${quizAnswers[q.id] === a.id ? 'bg-blue-900/30 border-blue-500' : 'bg-slate-800 border-slate-600 hover:border-slate-500'}`}>
                                            <input 
                                              type="radio" 
                                              name={`question-${q.id}`} 
                                              className="mt-1 mr-3 w-4 h-4 text-blue-600 bg-slate-700 border-slate-500 focus:ring-blue-500 focus:ring-offset-slate-800"
                                              checked={quizAnswers[q.id] === a.id}
                                              onChange={() => setQuizAnswers(prev => ({...prev, [q.id]: a.id}))}
                                              disabled={submittingQuiz || quizResult?.passed}
                                            />
                                            <span className="text-slate-300 text-sm">{a.text}</span>
                                          </label>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                  
                                  <div className="flex justify-end pt-4 border-t border-slate-700">
                                    <button
                                      onClick={handleSubmitQuiz}
                                      disabled={submittingQuiz || Object.keys(quizAnswers).length < (currentEpisode.quiz.questions?.length || 0) || quizResult !== null}
                                      className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                      {submittingQuiz ? 'Submitting...' : 'Submit Answers'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center">
                              <HelpCircle size={48} className="mx-auto text-blue-400 mb-4" />
                              <h3 className="text-xl font-bold text-white mb-2">{currentEpisode.title}</h3>
                              <p className="text-slate-400 mb-6 text-sm">{currentEpisode.content_text || "Interactive Quiz"}</p>
                              {currentEpisode.quiz ? (
                                <button 
                                  onClick={() => setIsTakingQuiz(true)}
                                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                                >
                                  Start Quiz
                                </button>
                              ) : (
                                <div className="text-slate-500 italic">Quiz content unavailable</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Completion Action */}
                    <div className="p-6 bg-slate-900 border-t border-slate-800 shrink-0 flex justify-between items-center">
                      <div className="text-slate-300 font-medium">
                        {currentEpisode.title}
                      </div>
                      
                      {selectedPlaylist.is_enrolled && currentEpisode.content_type !== 'quiz' && (
                        <button
                          onClick={() => handleMarkComplete(currentEpisode.id)}
                          disabled={currentEpisode.is_completed || (['video', 'mixed'].includes(currentEpisode.content_type) && videoProgress < 75)}
                          title={['video', 'mixed'].includes(currentEpisode.content_type) && videoProgress < 75 ? "Watch at least 75% of the video to complete" : ""}
                          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-colors ${
                            currentEpisode.is_completed 
                              ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800 cursor-default' 
                              : (['video', 'mixed'].includes(currentEpisode.content_type) && videoProgress < 75)
                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20'
                          }`}
                        >
                          {currentEpisode.is_completed ? (
                            <>
                              <CheckCircle size={18} />
                              Completed
                            </>
                          ) : (
                            <>
                              Mark as Complete {['video', 'mixed'].includes(currentEpisode.content_type) && videoProgress < 75 && `(${Math.floor(videoProgress)}%)`}
                            </>
                          )}
                        </button>
                      )}
                      {!selectedPlaylist.is_enrolled && (
                        <div className="text-sm text-slate-500 italic">
                          Subscribe to track progress
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              {/* Right side: Course Content List */}
              <div className="w-full md:w-1/3 bg-slate-800 flex flex-col border-l border-slate-700 h-full">
                <div className="p-4 border-b border-slate-700 bg-slate-800/95 sticky top-0 shrink-0 flex justify-between items-center">
                  <h3 className="font-semibold text-white">Course Content</h3>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={autoPlayNext} 
                      onChange={(e) => setAutoPlayNext(e.target.checked)}
                      className="rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-800"
                    />
                    Autoplay Next
                  </label>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  {selectedPlaylist.episodes && selectedPlaylist.episodes.length > 0 ? (
                    <div className="space-y-1">
                      {selectedPlaylist.episodes.map(ep => (
                        <button 
                          key={ep.id} 
                          onClick={() => setCurrentEpisode(ep)}
                          className={`flex items-start gap-3 p-3 rounded-xl transition-all w-full text-left group ${
                            currentEpisode?.id === ep.id 
                              ? 'bg-blue-900/50 border border-blue-800' 
                              : 'hover:bg-slate-700 border border-transparent'
                          }`}
                        >
                          <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                            currentEpisode?.id === ep.id ? 'text-blue-400 bg-blue-900/50' : 'text-slate-500 bg-slate-900/50 group-hover:text-slate-300'
                          }`}>
                            {renderEpisodeIcon(ep.content_type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm line-clamp-2 ${currentEpisode?.id === ep.id ? 'text-white font-medium' : 'text-slate-300'}`}>
                              <span className="text-slate-500 mr-2 font-mono text-xs">{ep.order}.</span>
                              {ep.title}
                            </div>
                          </div>

                          {ep.is_completed && (
                            <div className="shrink-0 mt-0.5 text-emerald-500">
                              <CheckCircle size={16} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-slate-500 text-sm">
                      No episodes available.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Certificate Preview Modal */}
      {certificatePreview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-5xl h-[90vh] bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="text-emerald-500" /> Certificate Preview
              </h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleDownloadCertificate}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg"
                >
                  <Download size={18} />
                  <span>Download PDF</span>
                </button>
                <button 
                  onClick={closeCertificatePreview}
                  className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            {/* PDF Viewer */}
            <div className="flex-1 w-full bg-slate-800 relative">
              <iframe 
                src={`${certificatePreview.url}#view=FitH`} 
                title="Certificate PDF Preview"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
