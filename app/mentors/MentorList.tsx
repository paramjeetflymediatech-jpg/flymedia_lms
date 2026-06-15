"use client";

import { useState } from 'react';
import Link from 'next/link';

interface MentorListProps {
  tutors: any[];
}

export function MentorList({ tutors }: MentorListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTutors = tutors.filter((tutor) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = tutor.name?.toLowerCase().includes(query);
    const bioMatch = tutor.bio?.toLowerCase().includes(query);
    return nameMatch || bioMatch;
  });

  return (
    <div className="space-y-12">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <input 
          type="text" 
          placeholder="Search by mentor name or expertise..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 shadow-sm transition-all font-medium text-base"
        />
      </div>

      {filteredTutors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-200 shadow-sm">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">No Mentors Found</h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            We couldn't find any mentors matching your search "{searchQuery}". Try using different keywords.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTutors.map((tutor) => (
            <div key={tutor.id} className="group bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 hover:border-orange-200 transition-all duration-500 hover:-translate-y-2 flex flex-col relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out z-0"></div>
              
              <div className="relative z-10">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full mx-auto mb-6 bg-orange-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-orange-600 font-bold text-3xl">
                  {tutor.avatar ? (
                    <img src={tutor.avatar} alt={tutor.name || 'Tutor'} className="w-full h-full object-cover" />
                  ) : (
                    (tutor.name || 'T').substring(0, 2).toUpperCase()
                  )}
                </div>
                
                {/* Tutor Info */}
                <div className="text-center space-y-2 mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                    {tutor.name || 'Anonymous Mentor'}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600 tracking-wide uppercase">
                    <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    Verified Tutor
                  </div>
                </div>
                
                <p className="text-slate-600 text-sm leading-relaxed text-center line-clamp-4 mb-8 min-h-[5rem]">
                  {tutor.bio || 'This expert is currently preparing their biography. They have been verified by Flymedia Technology for their industry excellence.'}
                </p>
              </div>
              
              {/* Actions */}
              <div className="mt-auto grid grid-cols-2 gap-3 relative z-10">
                <Link href={`/mentors/${tutor.id}`} className="w-full text-center py-2.5 rounded-xl border-2 border-slate-100 bg-slate-50 text-slate-700 text-sm font-bold hover:bg-slate-100 hover:border-slate-200 transition-colors">
                  View Profile
                </Link>
                <Link href={`/mentors/${tutor.id}?book=true`} className="w-full text-center py-2.5 rounded-xl bg-orange-600 text-white text-sm font-bold shadow-sm hover:bg-orange-700 transition-colors">
                  Book Trial
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
