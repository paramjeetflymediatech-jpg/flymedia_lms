"use client";

import { useState } from 'react';
import TutorReviewForm from './TutorReviewForm';
import Link from 'next/link';

interface TutorProfileContentProps {
  tutor: any;
  reviews: any[];
  currentUserRole: string;
  sessionsTaken: number;
  averageRating: string | number;
  children?: React.ReactNode; // Right column classes
}

export default function TutorProfileContent({ tutor, reviews, currentUserRole, sessionsTaken, averageRating, children }: TutorProfileContentProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');

  return (
    <div className="w-full bg-slate-50 min-h-screen pb-12">
      {/* Full Width Banner */}
      <div className="relative overflow-hidden bg-slate-50 text-slate-900 pt-8 pb-12 px-4 md:px-12 mb-8 border-b border-slate-200 shadow-sm">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-50 via-red-50 to-orange-50 opacity-100 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100/50 blur-[80px] rounded-full z-0 mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-100/50 blur-[80px] rounded-full z-0"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Back button */}
          <div className="mb-6">
            <Link href="/dashboard/tutors" className="inline-flex items-center text-slate-500 hover:text-orange-600 font-semibold transition-colors text-sm">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Tutors
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8 mt-4">
            <div className="relative flex-shrink-0 group">
              <div className="absolute inset-0 bg-orange-200/50 rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
              {tutor.avatar ? (
                <img alt={tutor.name} className="relative w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-xl transform group-hover:scale-105 transition-transform duration-300" src={tutor.avatar} />
              ) : (
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white bg-white/60 backdrop-blur-md flex items-center justify-center text-4xl md:text-5xl font-extrabold text-orange-400 shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                  {tutor.name ? tutor.name.charAt(0).toUpperCase() : 'T'}
                </div>
              )}
            </div>
            <div className="text-center sm:text-left flex-1 pb-2">
              <div className="inline-flex items-center gap-2 mb-1 px-3 py-1 bg-white/60 backdrop-blur-sm rounded-full text-xs font-bold uppercase tracking-wider text-slate-600 border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Verified Tutor
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 drop-shadow-sm">{tutor.name || 'Anonymous Tutor'}</h1>
            </div>
            
            {/* Stats Cards in Banner */}
            <div className="flex gap-3 md:gap-4 pb-2">
              <div className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-lg transform hover:-translate-y-1 transition-transform">
                <div className="text-2xl md:text-3xl font-extrabold text-slate-900">{new Date(tutor.createdAt).getFullYear()}</div>
                <div className="opacity-80 text-[10px] md:text-xs font-bold uppercase tracking-wider mt-1 text-slate-600">Joined</div>
              </div>
              <div className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-lg transform hover:-translate-y-1 transition-transform">
                <div className="text-2xl md:text-3xl font-extrabold text-slate-900">{sessionsTaken}</div>
                <div className="opacity-80 text-[10px] md:text-xs font-bold uppercase tracking-wider mt-1 text-slate-600">Sessions</div>
              </div>
              <div className="bg-white/60 backdrop-blur-md border border-slate-200 rounded-2xl px-5 py-3 text-center shadow-lg transform hover:-translate-y-1 transition-transform">
                <div className="text-2xl md:text-3xl font-extrabold flex justify-center items-center gap-1 text-slate-900">
                  <svg className="w-6 h-6 text-amber-500 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  {averageRating}
                </div>
                <div className="opacity-80 text-[10px] md:text-xs font-bold uppercase tracking-wider mt-1 text-slate-600">Rating</div>
              </div>
            </div>
          </div>
          
          <div className="flex border-b border-slate-200 text-sm overflow-x-auto gap-4 px-2">
            <button 
              onClick={() => setActiveTab('about')}
              className={`px-4 py-3 transition-all whitespace-nowrap font-bold text-sm tracking-wide border-b-4 ${
                activeTab === 'about' ? 'border-orange-500 text-orange-600 translate-y-px' : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              About & Credentials
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-3 transition-all whitespace-nowrap font-bold text-sm tracking-wide border-b-4 ${
                activeTab === 'reviews' ? 'border-orange-500 text-orange-600 translate-y-px' : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              Student Reviews <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${activeTab === 'reviews' ? 'bg-orange-100' : 'bg-slate-100'}`}>{reviews.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 md:px-12 max-w-6xl mx-auto space-y-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Tab Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tab Content: About */}
            {activeTab === 'about' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500 hover:shadow-md transition-shadow">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">👋</span>
                  About {tutor.name?.split(' ')[0] || 'the Tutor'}
                </h2>
                <div className="prose prose-slate max-w-none prose-p:leading-loose">
                  <p className="text-slate-700 whitespace-pre-wrap break-words break-all text-lg font-medium">
                    {tutor.bio ? tutor.bio : "This tutor hasn't added a detailed bio yet, but they are a verified expert ready to help you succeed in your learning journey!"}
                  </p>
                </div>
              </div>
            )}

            {/* Tab Content: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {currentUserRole === 'STUDENT' && (
                  <TutorReviewForm tutorId={tutor.id} />
                )}

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900 mb-8">Student Reviews</h2>

                  {reviews.length > 0 ? (
                    <div className="space-y-6">
                      {reviews.map((review: any) => (
                        <div key={review.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              {review.student?.avatar ? (
                                <img src={review.student.avatar} alt={review.student.name} className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-200" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 shadow-sm border border-slate-200">
                                  {review.student?.name ? review.student.name.charAt(0) : 'S'}
                                </div>
                              )}
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{review.student?.name || 'Anonymous Student'}</div>
                                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className={`w-4 h-4 ${review.rating >= star ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current'}`} viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-100">
                            "{review.comment}"
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="text-4xl mb-3 opacity-50">⭐</div>
                      <h3 className="font-bold text-slate-700 mb-1">No reviews yet</h3>
                      <p className="text-sm text-slate-500">Be the first to review this tutor!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column: Classes (passed as children) */}
          <div className="space-y-6">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
}
