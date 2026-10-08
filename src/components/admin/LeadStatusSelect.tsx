'use client';

import { useState } from 'react';
import { adminUpdateInquiryStatus } from '../../../app/actions';

export default function LeadStatusSelect({ 
  leadId, 
  initialStatus 
}: { 
  leadId: string, 
  initialStatus: 'NEW' | 'CONTACTED' | 'RESOLVED' 
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-blue-50 text-blue-600 border-blue-100 focus:border-blue-300';
      case 'CONTACTED': return 'bg-orange-50 text-orange-600 border-orange-100 focus:border-orange-300';
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100 focus:border-emerald-300';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsUpdating(true);
    try {
      await adminUpdateInquiryStatus(leadId, e.target.value as any);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative inline-block">
      <select
        defaultValue={initialStatus}
        onChange={handleChange}
        disabled={isUpdating}
        className={`appearance-none font-bold text-[10px] pl-3 pr-8 py-1.5 rounded-full border outline-none cursor-pointer transition-colors ${getStatusColor(initialStatus)} ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <option value="NEW" className="font-bold text-slate-700">NEW</option>
        <option value="CONTACTED" className="font-bold text-slate-700">CONTACTED</option>
        <option value="RESOLVED" className="font-bold text-slate-700">RESOLVED</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  );
}
