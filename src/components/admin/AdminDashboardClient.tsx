'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

export default function AdminDashboardClient({ 
  enrollmentData,
  enrollmentsList,
  totalEnrollments = 0
}: { 
  enrollmentData: any[];
  enrollmentsList: any[];
  totalEnrollments?: number;
}) {
  return (
    <div className="space-y-8">
      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Enrollment Trends</h3>
            <p className="text-xs text-slate-500">Student enrollments over the past few days.</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="url(#orangeGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Cumulative Growth</h3>
            <p className="text-xs text-slate-500">Overall platform growth over time.</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="cumulative" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Admin Enrollment & Progress Logs */}
      <div className="bg-white border border-slate-100 p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">Recent Enrolls</h3>
            <p className="text-xs text-slate-500">Latest students joining the platform.</p>
          </div>
          <span className="px-3 py-1 bg-orange-50 text-orange-600 font-bold text-[10px] rounded-lg border border-orange-100">Live Updates</span>
        </div>
        
        {enrollmentsList.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No students enrolled yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
            {enrollmentsList.map((enr: any) => (
              <div key={enr.id} className="p-5 bg-slate-50/50 hover:bg-white rounded-2xl border border-slate-100 hover:border-orange-200 transition-all shadow-sm hover:shadow-md space-y-3 group cursor-default">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-sm text-slate-900 group-hover:text-orange-600 transition-colors">{enr.User?.name || 'Jane Doe'}</div>
                    <div className="text-[11px] text-slate-500 font-medium">{enr.User?.email}</div>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-rose-100 to-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                    {(enr.User?.name || 'J')[0].toUpperCase()}
                  </div>
                </div>
                
                <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between">
                  <div className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded-md border border-orange-100/50 truncate max-w-[150px]">
                    {enr.Package?.title || 'Unknown Package'}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">
                    {new Date(enr.enrolledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {totalEnrollments > 15 && (
          <div className="pt-4 flex justify-center border-t border-slate-50 mt-6">
            <a href="/admin/enrollments" className="text-orange-600 hover:text-orange-700 font-bold text-sm transition-colors">
              View all {totalEnrollments} enrollments &rarr;
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
