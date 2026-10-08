'use client';
import { useState } from 'react';

export default function CertificateToggle({ data }: { data: any }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!data || !data.providers || data.providers.length === 0) return null;

  return (
    <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Tabs */}
      <div className="flex justify-center mb-10 relative z-10">
        <div className="inline-flex bg-slate-800/50 p-1 rounded-full border border-slate-700/50 backdrop-blur-sm">
          {data.providers.map((provider: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${
                activeIndex === idx
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {provider.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-center relative z-10">
        {/* Left side text */}
        <div className="w-full lg:w-1/2 space-y-8">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {data.providers[activeIndex].name} · Completion
            </span>
            <h3 className="text-3xl font-black text-white leading-tight">
              {data.title}
            </h3>
          </div>

          <ul className="space-y-6">
            {data.features.map((feature: any, idx: number) => (
              <li key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-orange-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-white mb-1">{feature.title}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right side image */}
        <div className="w-full lg:w-1/2">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-slate-800 ring-1 ring-slate-700/50 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center p-2">
              <img 
                src={data.providers[activeIndex].image} 
                alt={`${data.providers[activeIndex].name} Preview`}
                className="w-full h-full object-cover rounded-xl shadow-2xl transition-all duration-500 group-hover:scale-[1.02]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
