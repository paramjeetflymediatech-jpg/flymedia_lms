'use client';

import { useState, useEffect } from 'react';
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

  // Close modals on Escape key and prevent background scrolling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveVideoUrl(null);
        setActiveImageUrl(null);
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
    if (url.includes('embed/')) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1` : url;
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative bg-slate-950/70 border border-white/10 rounded-3xl overflow-hidden hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10 transition-all duration-300 flex flex-col"
              >
                {/* Media Container */}
                <div
                  className="relative aspect-video w-full overflow-hidden bg-slate-950 cursor-pointer"
                  onClick={() => {
                    if (item.mediaType === 'VIDEO') {
                      setActiveVideoUrl(item.mediaUrl);
                    } else {
                      setActiveImageUrl(item.mediaUrl);
                    }
                  }}
                >
                  <img
                    src={item.thumbnailUrl || item.mediaUrl}
                    alt={item.title}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />

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
                  <div className="space-y-2">
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
                      <p className="text-slate-400 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                        “{item.description}”
                      </p>
                    )}
                  </div>

                  {/* Student & Placement Info Footer */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
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
            ))}
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
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setActiveVideoUrl(null)}
        >
          {/* Always-visible top-right close button */}
          <button
            onClick={() => setActiveVideoUrl(null)}
            className="fixed top-4 right-4 z-[60] w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-lg font-bold backdrop-blur-lg border border-white/20 transition-all hover:scale-105 cursor-pointer shadow-lg"
            title="Close (Esc)"
            aria-label="Close modal"
          >
            ✕
          </button>

          <div
            className="relative w-full max-h-[90vh] flex flex-col bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/20 my-auto"
            style={{ maxWidth: 'min(56rem, calc((90vh - 56px) * 16 / 9))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 bg-slate-900 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 min-w-0 pr-3">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                <span className="text-xs sm:text-sm font-bold text-slate-200 truncate">
                  Flymedia Student Video Experience
                </span>
              </div>
              <button
                onClick={() => setActiveVideoUrl(null)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm sm:text-base font-bold transition-colors cursor-pointer shrink-0"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video w-full bg-black shrink-0">
              {activeVideoUrl.includes('youtube.com') || activeVideoUrl.includes('youtu.be') ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeVideoUrl)}
                  title="Success Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : (
                <video
                  src={activeVideoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* IMAGE LIGHTBOX MODAL */}
      {activeImageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          onClick={() => setActiveImageUrl(null)}
        >
          <button
            onClick={() => setActiveImageUrl(null)}
            className="fixed top-4 right-4 z-[60] w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center text-lg font-bold backdrop-blur-lg border border-white/20 transition-all hover:scale-105 cursor-pointer shadow-lg"
            title="Close (Esc)"
            aria-label="Close modal"
          >
            ✕
          </button>
          <div
            className="relative max-w-5xl max-h-[90vh] bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-2 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImageUrl}
              alt="Success View"
              className="max-h-[82vh] w-auto max-w-full object-contain mx-auto rounded-xl"
            />
          </div>
        </div>
      )}
    </section>
  );
}
