'use client';

import React from 'react';

interface TutorActivityChartProps {
  data: { label: string; value: number }[];
}

export default function TutorActivityChart({ data }: TutorActivityChartProps) {
  // Find the maximum value to scale the bars
  const max = Math.max(...data.map((d) => d.value), 1); // Avoid division by 0

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
      <div className="mb-8">
        <h3 className="text-xl font-extrabold text-slate-900">Activity Overview</h3>
        <p className="text-sm text-slate-500 font-medium">Your classes distributed across the week</p>
      </div>
      
      <div className="flex-1 flex items-end gap-2 sm:gap-4 mt-auto pt-10 pb-2 border-b border-slate-100 relative">
        {/* Background Grid Lines (Optional) */}
        <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-between z-0 pointer-events-none">
          <div className="w-full h-px bg-slate-50"></div>
          <div className="w-full h-px bg-slate-50"></div>
          <div className="w-full h-px bg-slate-50"></div>
          <div className="w-full h-px bg-slate-100"></div>
        </div>

        {/* Bars */}
        {data.map((item, index) => {
          const heightPercentage = (item.value / max) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-3 relative z-10 group cursor-default">
              {/* Tooltip */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs font-bold py-1.5 px-3 rounded-lg pointer-events-none whitespace-nowrap shadow-lg z-20">
                {item.value} Classes
                {/* Tooltip caret */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
              </div>
              
              {/* Bar */}
              <div className="w-full max-w-[40px] h-40 flex items-end justify-center relative">
                <div 
                  className={`w-full rounded-t-xl transition-all duration-500 shadow-sm ${item.value > 0 ? 'bg-gradient-to-t from-orange-600 to-orange-400 group-hover:from-orange-700 group-hover:to-orange-500' : 'bg-slate-100'}`}
                  style={{ height: `${item.value === 0 ? 10 : Math.max(heightPercentage, 15)}%` }} // Minimum height for 0 is 10% (empty styling), for >0 is 15%
                ></div>
              </div>
              
              {/* Label */}
              <span className={`text-[10px] sm:text-xs font-extrabold uppercase transition-colors ${item.value > 0 ? 'text-slate-700' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
