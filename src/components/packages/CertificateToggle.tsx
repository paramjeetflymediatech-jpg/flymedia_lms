'use client';
import { useState } from 'react';

export default function CertificateToggle({ data }: { data: any }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!data || !data.providers || data.providers.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 relative overflow-hidden">
      {/* Background elements */}
      <div className={`absolute top-0 right-0 w-96 h-96 blur-3xl rounded-full pointer-events-none transition-colors duration-700 ${
        data.providers[activeIndex].name.toLowerCase().includes('ibm') ? 'bg-blue-500/10' : 'bg-orange-500/10'
      }`} />
      <div className={`absolute bottom-0 left-0 w-96 h-96 blur-3xl rounded-full pointer-events-none transition-colors duration-700 ${
        data.providers[activeIndex].name.toLowerCase().includes('ibm') ? 'bg-indigo-500/10' : 'bg-rose-500/10'
      }`} />

      {/* Tabs */}
      <div className="flex justify-center mb-10 relative z-10">
        <div className="inline-flex bg-slate-100 p-1 rounded-full border border-slate-200">
          {data.providers.map((provider: any, idx: number) => {
            const isIbm = provider.name.toLowerCase().includes('ibm');
            const isActive = activeIndex === idx;
            
            return (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                  isActive
                    ? (isIbm ? 'bg-blue-600 text-white shadow-sm' : 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm')
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {provider.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-center relative z-10">
        {/* Left side text */}
        <div className="w-full lg:w-1/2 space-y-8">
          <div>
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider mb-4 ${
              data.providers[activeIndex].name.toLowerCase().includes('ibm')
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-orange-50 border-orange-200 text-orange-800'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                data.providers[activeIndex].name.toLowerCase().includes('ibm') ? 'bg-blue-500' : 'bg-orange-500'
              }`} />
              {data.providers[activeIndex].name} · {data.providers[activeIndex].name.toLowerCase().includes('ibm') ? 'INDUSTRY RECOGNISED' : 'COMPLETION'}
            </span>
            <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
              {data.title}
            </h3>
          </div>

          <ul className="space-y-6">
            {data.features.map((feature: any, idx: number) => {
              const isIbm = data.providers[activeIndex].name.toLowerCase().includes('ibm');
              return (
                <li key={idx} className="flex gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center ${
                    isIbm ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-orange-50 border-orange-100 text-orange-600'
                  }`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex items-center">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm sm:text-base">{typeof feature === 'string' ? feature : feature.title}</p>
                      {typeof feature !== 'string' && feature.body && (
                        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-0.5">{feature.body}</p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right side image */}
        <div className="w-full lg:w-1/2">
          <div className="relative group">
            <div className={`absolute -inset-1 rounded-xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200 ${
              data.providers[activeIndex].name.toLowerCase().includes('ibm') ? 'bg-blue-500' : 'bg-orange-500'
            }`} />
            <div className="relative bg-white ring-1 ring-slate-100 rounded-lg overflow-hidden  flex items-center justify-center p-3 sm:p-4 shadow-sm transform group-hover:scale-[1.01] transition-transform">
              <img 
                src={data.providers[activeIndex].logo || data.providers[activeIndex].image} 
                alt={`${data.providers[activeIndex].name} Preview`}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
