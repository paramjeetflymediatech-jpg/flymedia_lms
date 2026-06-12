"use client";

import { useState } from "react";
import Link from "next/link";

interface CoursesTabsProps {
  upcomingClasses: any[];
  completedClasses: any[];
  cancelledClasses: any[];
  missedClasses: any[];
}

export default function CoursesTabs({
  upcomingClasses,
  completedClasses,
  cancelledClasses,
  missedClasses,
}: CoursesTabsProps) {
  const [tab, setTab] = useState('upcoming');

  let displayClasses: any[] = [];
  if (tab === 'upcoming') displayClasses = upcomingClasses;
  if (tab === 'completed') displayClasses = completedClasses;
  if (tab === 'cancelled') displayClasses = cancelledClasses;
  if (tab === 'missed') displayClasses = missedClasses;

  return (
    <>
      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto whitespace-nowrap hide-scrollbar">
        {['upcoming', 'completed', 'cancelled', 'missed'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 font-semibold text-sm transition-colors border-b-2 capitalize ${
              tab === t
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">My Sessions</h2>
          <div className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Showing {tab.charAt(0).toUpperCase() + tab.slice(1)} sessions • {displayClasses.length} sessions
          </div>
        </div>

        {displayClasses.length > 0 ? (
          <div className="space-y-4">
            {displayClasses.map((cls, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row gap-6 p-6 border border-slate-100 rounded-2xl hover:border-purple-100 hover:shadow-md transition-all">
                {cls.packageThumbnail ? (
                  <div className="w-full sm:w-48 h-32 rounded-xl shrink-0 bg-slate-100 overflow-hidden border border-slate-200 relative">
                    <img src={cls.packageThumbnail} alt={cls.title} className="w-full h-full object-cover" />
                    {tab === 'upcoming' && <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 bg-purple-600 text-white rounded-md shadow-sm">UPCOMING</span>}
                    {tab === 'completed' && <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 bg-emerald-600 text-white rounded-md shadow-sm">COMPLETED</span>}
                  </div>
                ) : (
                  <div className="w-full sm:w-48 h-32 rounded-xl shrink-0 bg-slate-100 flex flex-col items-center justify-center text-purple-600 border border-purple-100">
                    <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{cls.title}</h3>
                    <p className="text-sm text-slate-500 font-medium">{cls.packageTitle}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm font-semibold text-slate-700">
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {new Date(cls.startTime).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({cls.duration} min)
                    </div>
                  </div>
                  {tab === 'upcoming' && (
                    <div className="pt-2">
                      {cls.meetLink ? (
                        <a href={cls.meetLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                          Join Session
                        </a>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Link will be available soon</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No {tab} sessions found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              {tab === 'upcoming' && "You don't have any upcoming live classes scheduled at the moment."}
              {tab === 'completed' && "You haven't completed any live classes yet."}
              {tab === 'cancelled' && "You don't have any cancelled sessions."}
              {tab === 'missed' && "You haven't missed any sessions."}
            </p>
            {tab === 'upcoming' && (
              <Link href="/packages" className="inline-block mt-6 px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors">
                Browse Packages
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
