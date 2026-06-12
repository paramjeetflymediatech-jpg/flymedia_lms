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
    <div className="w-full">
      {/* Full Width Banner mimicking user's requested HTML */}
      <div className="bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500 text-white py-6 md:py-8 px-4 md:px-12">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <div className="mb-6">
            <Link href="/dashboard/tutors" className="inline-flex items-center text-white/80 hover:text-white font-semibold transition-colors text-sm">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Tutors
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
            <div className="relative flex-shrink-0">
              {tutor.avatar ? (
                <img alt={tutor.name} className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white/20" src={tutor.avatar} />
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white/20 bg-white/20 flex items-center justify-center text-3xl md:text-4xl font-bold text-white shadow-sm">
                  {tutor.name ? tutor.name.charAt(0).toUpperCase() : 'T'}
                </div>
              )}
            </div>
            <div className="text-center sm:text-left flex-1 self-center">
              <h1 className="text-2xl md:text-3xl font-bold">{tutor.name || 'Anonymous Tutor'}</h1>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center sm:justify-start gap-3 md:gap-4 mb-6">
            <div className="bg-white text-indigo-700 rounded-2xl px-4 py-2 md:px-6 md:py-3 text-center text-sm shadow-lg min-w-[120px] md:min-w-[130px]">
              <div className="text-xl md:text-2xl font-bold">{new Date(tutor.createdAt).getFullYear()}</div>
              <div className="opacity-70 text-xs md:text-sm">Tutor since</div>
            </div>
            <div className="bg-white text-indigo-700 rounded-2xl px-4 py-2 md:px-6 md:py-3 text-center text-sm shadow-lg min-w-[120px] md:min-w-[130px]">
              <div className="text-xl md:text-2xl font-bold">{sessionsTaken}</div>
              <div className="opacity-70 text-xs md:text-sm">Session taken</div>
            </div>
            <div className="bg-white text-indigo-700 rounded-2xl px-4 py-2 md:px-6 md:py-3 text-center text-sm shadow-lg min-w-[120px] md:min-w-[130px]">
              <div className="text-xl md:text-2xl font-bold flex justify-center items-center gap-1">
                <svg className="w-5 h-5 fill-current text-amber-500" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                {averageRating}
              </div>
              <div className="opacity-70 text-xs md:text-sm">Rating</div>
            </div>
          </div>
          
          <div className="flex border-b border-white/20 text-sm overflow-x-auto">
            <button 
              onClick={() => setActiveTab('about')}
              className={`px-4 md:px-6 pb-2 transition whitespace-nowrap font-semibold border-b-2 ${
                activeTab === 'about' ? 'border-white text-white' : 'border-transparent text-white/80 hover:text-white'
              }`}
            >
              About
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`px-4 md:px-6 pb-2 transition whitespace-nowrap font-semibold border-b-2 ${
                activeTab === 'reviews' ? 'border-white text-white' : 'border-transparent text-white/80 hover:text-white'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Tab Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tab Content: About */}
            {activeTab === 'about' && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold text-slate-900 mb-6">About {tutor.name || 'the Tutor'}</h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 whitespace-pre-wrap break-words break-all leading-relaxed">
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
