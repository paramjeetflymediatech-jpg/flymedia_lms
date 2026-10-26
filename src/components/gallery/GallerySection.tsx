'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export interface GalleryItemData {
  id: string;
  title: string;
  description?: string | null;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  thumbnailUrl?: string | null;
  studentName?: string | null;
  courseName?: string | null;
  companyPlaced?: string | null;
  salaryPackage?: string | null;
  rating?: number;
  category: string;
}

interface GallerySectionProps {
  items: GalleryItemData[];
  title?: string;
  subtitle?: string;
  showViewAll?: boolean;
}

export default function GallerySection({
  items,
  title = 'Success Gallery & Video Reviews',
  subtitle = 'Real stories, verified placements, project demonstrations, and video testimonials from Flymedia graduates.',
  showViewAll = true,
}: GallerySectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<GalleryItemData | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Video playback controls state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const seekRelative = (seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(videoRef.current.duration || Infinity, videoRef.current.currentTime + seconds));
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        videoRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Close modals on Escape key and prevent background scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveVideoUrl(null);
        setActiveImageUrl(null);
        setActiveItem(null);
      }
    };

    if (activeVideoUrl || activeImageUrl) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeVideoUrl, activeImageUrl]);

  const categories = [
    { label: 'All Media', value: 'ALL' },
    { label: '🎥 Video Reviews', value: 'VIDEO' },
    { label: '🏆 Placements & Offers', value: 'PLACEMENT' },
    { label: '💻 Project Demos', value: 'PROJECT_DEMO' },
  ];

  const filteredItems = items.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'VIDEO') return item.mediaType === 'VIDEO';
    if (selectedCategory === 'PLACEMENT') return item.category === 'PLACEMENT' || item.companyPlaced;
    if (selectedCategory === 'PROJECT_DEMO') return item.category === 'PROJECT_DEMO';
    return item.category === selectedCategory;
  });

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    let videoId = '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    if (match) {
      videoId = match[1];
      return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=1&rel=0&playsinline=1`;
    }
    if (url.includes('embed/')) {
      const sep = url.includes('?') ? '&' : '?';
      return url.includes('controls=') ? url : `${url}${sep}controls=1&autoplay=1&rel=0&playsinline=1`;
    }
    return url;
  };

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[40rem] h-[40rem] bg-orange-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-10 w-[30rem] h-[30rem] bg-rose-500/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-orange-400 font-extrabold text-xs uppercase tracking-wider backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              PROVEN RESULTS & REVIEWS
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {title}
            </h2>
            <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-medium">
              {subtitle}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.value
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/25 scale-105'
                    : 'bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredItems.length === 0 ? (
          <div className="bg-white/5 rounded-3xl p-12 text-center border border-white/10 space-y-4">
            <p className="text-slate-400 font-medium">No items found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {filteredItems.map((item) => {
              const isExpanded = expandedIds.has(item.id);
              const isLong = Boolean(item.description && item.description.length > 120);

              return (
                <div
                  key={item.id}
                  className="group relative bg-slate-950/70 border border-white/10 rounded-3xl overflow-hidden hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col h-full justify-between"
                >
                  {/* Media Container */}
                  <div
                    className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
                    onClick={() => {
                      setActiveItem(item);
                      if (item.mediaType === 'VIDEO') {
                        setActiveVideoUrl(item.mediaUrl);
                      } else {
                        setActiveImageUrl(item.mediaUrl);
                      }
                    }}
                  >
                    {item.mediaType === 'VIDEO' ? (
                      item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <video
                          src={item.mediaUrl}
                          preload="metadata"
                          muted
                          playsInline
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                        />
                      )
                    ) : (
                      <img
                        src={item.thumbnailUrl || item.mediaUrl}
                        alt={item.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    )}

                    {/* Media Type Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20 flex items-center gap-1.5 shadow-sm">
                        {item.mediaType === 'VIDEO' ? '🎥 Video' : '📷 Photo'}
                      </span>
                    </div>

                    {/* Salary / Placement Tag if any */}
                    {item.salaryPackage && (
                      <div className="absolute top-4 right-4 z-10">
                        <span className="px-3 py-1 rounded-full text-[11px] font-black bg-emerald-500/90 backdrop-blur-md text-white shadow-sm">
                          {item.salaryPackage}
                        </span>
                      </div>
                    )}

                    {/* Play Button Overlay for Videos */}
                    {item.mediaType === 'VIDEO' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-colors">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/40 text-white transform group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Hover expansion indicator */}
                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg">
                      {item.mediaType === 'VIDEO' ? 'Watch Video' : 'View Full Image'}
                    </div>
                  </div>

                  {/* Content Box */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
                          {item.courseName || 'Professional Track'}
                        </span>
                        <div className="flex items-center text-amber-400 text-xs">
                          {'★'.repeat(item.rating || 5)}
                        </div>
                      </div>

                      <h3 className="text-lg font-black text-white group-hover:text-orange-400 transition-colors leading-snug">
                        {item.title}
                      </h3>

                      {item.description && (
                        <div className="space-y-2">
                          <div
                            className={`text-slate-300 text-xs sm:text-sm leading-relaxed transition-all break-words [overflow-wrap:anywhere] hyphens-auto ${
                              isExpanded
                                ? 'bg-white/5 border border-white/10 rounded-2xl p-3.5 max-h-48 overflow-y-auto space-y-1'
                                : isLong
                                ? 'line-clamp-3'
                                : ''
                            }`}
                          >
                            <p className="italic">“{item.description}”</p>
                          </div>
                          {isLong && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(item.id);
                              }}
                              className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer select-none"
                            >
                              <span>{isExpanded ? 'Show less' : 'Read full review'}</span>
                              <svg
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180' : ''
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Student & Placement Info Footer */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs mt-auto">
                      <div>
                        {item.studentName ? (
                          <p className="font-bold text-white">{item.studentName}</p>
                        ) : (
                          <p className="font-bold text-slate-400">Flymedia Graduate</p>
                        )}
                        {item.companyPlaced && (
                          <p className="text-slate-400">
                            Placed at <span className="text-orange-400 font-semibold">{item.companyPlaced}</span>
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveItem(item);
                          if (item.mediaType === 'VIDEO') {
                            setActiveVideoUrl(item.mediaUrl);
                          } else {
                            setActiveImageUrl(item.mediaUrl);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-orange-500 hover:text-white text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                      >
                        {item.mediaType === 'VIDEO' ? 'Play ▶' : 'View 👁️'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* View All Button CTA */}
        {showViewAll && items.length > 0 && (
          <div className="text-center pt-6">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black text-sm uppercase tracking-wider hover:opacity-90 hover:scale-105 shadow-xl shadow-orange-500/25 transition-all duration-300"
            >
              <span>Explore Complete Success Gallery</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* VIDEO LIGHTBOX MODAL */}
      {activeVideoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-6 overflow-y-auto"
          onClick={() => {
            setActiveVideoUrl(null);
            setActiveItem(null);
          }}
        >
          {/* Always-visible top-right close button */}
          <button
            onClick={() => {
              setActiveVideoUrl(null);
              setActiveItem(null);
            }}
            className="fixed top-4 right-4 z-[60] w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-lg font-bold backdrop-blur-lg border border-white/20 transition-all hover:scale-105 cursor-pointer shadow-lg"
            title="Close (Esc)"
            aria-label="Close modal"
          >
            ✕
          </button>

          <div
            className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/20 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-900 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 min-w-0 pr-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-200 truncate">
                  {activeItem?.title || 'Flymedia Student Video Experience'}
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveVideoUrl(null);
                  setActiveItem(null);
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm sm:text-base font-bold transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Video Player Box - Responsive & Never overflowing */}
            <div className="relative w-full flex-1 min-h-[220px] max-h-[50vh] sm:max-h-[56vh] bg-black flex items-center justify-center overflow-hidden group/video select-none">
              {activeVideoUrl.includes('youtube.com') || activeVideoUrl.includes('youtu.be') ? (
                <div className="w-full h-full aspect-video max-h-[50vh] sm:max-h-[56vh] flex items-center justify-center">
                  <iframe
                    src={getYouTubeEmbedUrl(activeVideoUrl)}
                    title="Success Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    className="w-full h-full border-0"
                  />
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    key={activeVideoUrl}
                    controls
                    autoPlay
                    playsInline
                    preload="auto"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onTimeUpdate={() => {
                      if (videoRef.current) {
                        setCurrentTime(videoRef.current.currentTime);
                      }
                    }}
                    onLoadedMetadata={() => {
                      if (videoRef.current) {
                        setDuration(videoRef.current.duration || 0);
                        setIsPlaying(!videoRef.current.paused);
                      }
                    }}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full h-full max-h-[50vh] sm:max-h-[56vh] object-contain"
                  >
                    <source src={activeVideoUrl} type="video/mp4" />
                    <source src={activeVideoUrl} />
                    Your browser does not support the video tag.
                  </video>

                  {/* Big Play Button Overlay when paused */}
                  {!isPlaying && (
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-500/90 hover:bg-orange-500 text-white flex items-center justify-center shadow-2xl backdrop-blur-sm transition-transform hover:scale-110 active:scale-95 z-10 cursor-pointer"
                      title="Play Video"
                      aria-label="Play Video"
                    >
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 fill-current translate-x-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Video Playback Interactive Controls Toolbar - Always Pinned Below Video */}
            <div className="px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-900 border-t border-white/10 flex flex-col gap-2.5 text-xs shrink-0 z-20">
              {/* Top Row: Interactive Scrubber / Timeline Bar */}
              {!activeVideoUrl.includes('youtube.com') && !activeVideoUrl.includes('youtu.be') && (
                <div className="w-full flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-400 shrink-0 min-w-[36px]">
                    {formatTime(currentTime)}
                  </span>
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step="0.1"
                      value={currentTime}
                      onChange={handleSeekChange}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:bg-white/30 transition-all"
                      aria-label="Seek video progress"
                    />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0 min-w-[36px] text-right">
                    {formatTime(duration)}
                  </span>
                </div>
              )}

              {/* Bottom Row: Controls Buttons (Play, Skip, Volume, Speed, Fullscreen) */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* Left Controls */}
                {!activeVideoUrl.includes('youtube.com') && !activeVideoUrl.includes('youtu.be') ? (
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-orange-500/25"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      <span>{isPlaying ? '⏸ Pause' : '▶ Play'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => seekRelative(-10)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
                      title="Rewind 10 seconds"
                    >
                      ⏪ -10s
                    </button>

                    <button
                      type="button"
                      onClick={() => seekRelative(10)}
                      className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 font-semibold text-xs transition-all cursor-pointer"
                      title="Forward 10 seconds"
                    >
                      ⏩ +10s
                    </button>

                    {/* Volume Controls */}
                    <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1">
                      <button
                        type="button"
                        onClick={toggleMute}
                        className="text-slate-300 hover:text-white text-xs cursor-pointer"
                        title={isMuted ? 'Unmute' : 'Mute'}
                      >
                        {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-14 sm:w-16 h-1.5 bg-white/20 rounded appearance-none cursor-pointer accent-orange-500"
                        aria-label="Volume slider"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      YouTube Controls Active
                    </span>
                    <a
                      href={activeVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <span>Watch on YouTube ↗</span>
                    </a>
                  </div>
                )}

                {/* Right Controls: Playback Speeds, Fullscreen, Open Link */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {!activeVideoUrl.includes('youtube.com') && !activeVideoUrl.includes('youtu.be') && (
                    <>
                      <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-0.5">
                        {[1, 1.25, 1.5, 2].map((speed) => (
                          <button
                            key={speed}
                            type="button"
                            onClick={() => changeSpeed(speed)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                              playbackSpeed === speed
                                ? 'bg-orange-500 text-white shadow-sm'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-200 font-semibold text-xs transition-all cursor-pointer flex items-center gap-1"
                        title="Fullscreen"
                      >
                        <span>⛶</span>
                        <span className="hidden sm:inline">Fullscreen</span>
                      </button>
                    </>
                  )}

                  <a
                    href={activeVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 font-semibold text-xs transition-colors"
                    title="Open video in new tab"
                  >
                    ↗ Direct Link
                  </a>
                </div>
              </div>
            </div>

            {/* Video Modal Review Quote & Placement Bar */}
            {activeItem && (activeItem.description || activeItem.studentName) && (
              <div className="p-3 sm:p-4 bg-slate-950 border-t border-white/10 max-h-32 overflow-y-auto space-y-1.5 shrink-0 text-xs">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-bold text-white text-sm">
                      {activeItem.studentName || 'Flymedia Graduate'}
                    </span>
                    {activeItem.courseName && (
                      <span className="text-slate-400">({activeItem.courseName})</span>
                    )}
                    {activeItem.companyPlaced && (
                      <span className="text-orange-400 font-semibold">
                        • Placed at {activeItem.companyPlaced}
                      </span>
                    )}
                    {activeItem.salaryPackage && (
                      <span className="text-emerald-400 font-semibold">
                        [{activeItem.salaryPackage}]
                      </span>
                    )}
                  </div>
                  {activeItem.rating && (
                    <div className="text-amber-400 text-xs shrink-0">
                      {'★'.repeat(activeItem.rating)}
                    </div>
                  )}
                </div>
                {activeItem.description && (
                  <p className="text-slate-300 text-xs sm:text-sm italic leading-relaxed break-words [overflow-wrap:anywhere]">
                    “{activeItem.description}”
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* IMAGE LIGHTBOX MODAL */}
      {activeImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => {
            setActiveImageUrl(null);
            setActiveItem(null);
          }}
        >
          <button
            onClick={() => {
              setActiveImageUrl(null);
              setActiveItem(null);
            }}
            className="fixed top-4 right-4 z-[60] w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-lg font-bold backdrop-blur-lg border border-white/20 transition-all hover:scale-105 cursor-pointer shadow-lg"
            title="Close (Esc)"
            aria-label="Close modal"
          >
            ✕
          </button>
          <div
            className="relative max-w-4xl max-h-[92vh] flex flex-col bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/20 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2 sm:p-4 overflow-hidden flex items-center justify-center bg-black/50">
              <img
                src={activeImageUrl}
                alt={activeItem?.title || 'Success View'}
                className="max-h-[62vh] w-auto max-w-full object-contain rounded-xl"
              />
            </div>

            {/* Photo Modal Review Quote & Placement Bar */}
            {activeItem && (activeItem.description || activeItem.studentName || activeItem.title) && (
              <div className="p-4 sm:p-5 bg-slate-900 border-t border-white/10 max-h-48 overflow-y-auto space-y-2 shrink-0">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div>
                    <h4 className="text-white font-bold text-sm sm:text-base">{activeItem.title}</h4>
                    <p className="text-slate-400 mt-0.5">
                      {activeItem.studentName || 'Flymedia Graduate'}
                      {activeItem.courseName && <span> • {activeItem.courseName}</span>}
                      {activeItem.companyPlaced && (
                        <span className="text-orange-400 font-semibold ml-2">
                          • Placed at {activeItem.companyPlaced}
                        </span>
                      )}
                      {activeItem.salaryPackage && (
                        <span className="text-emerald-400 font-semibold ml-2">
                          [{activeItem.salaryPackage}]
                        </span>
                      )}
                    </p>
                  </div>
                  {activeItem.rating && (
                    <div className="text-amber-400 text-xs shrink-0">
                      {'★'.repeat(activeItem.rating)}
                    </div>
                  )}
                </div>
                {activeItem.description && (
                  <p className="text-slate-300 text-xs sm:text-sm italic leading-relaxed break-words [overflow-wrap:anywhere]">
                    “{activeItem.description}”
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
