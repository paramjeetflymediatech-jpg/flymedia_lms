'use client';

import { useState } from 'react';
import StringArrayEditor from './StringArrayEditor';

type Provider = { name: string; logo: string };
type CertificateData = { title: string; features: string[]; providers: Provider[] };

export default function CertificateDataEditor({ initialData = null }: { initialData: CertificateData | null }) {
  const [data, setData] = useState<CertificateData>(
    initialData || { title: 'Training Completion Certificate', features: [], providers: [] }
  );

  const addProvider = () => {
    setData({
      ...data,
      providers: [...data.providers, { name: 'New Provider', logo: '' }]
    });
  };

  const removeProvider = (index: number) => {
    setData({
      ...data,
      providers: data.providers.filter((_, i) => i !== index)
    });
  };

  const updateProviderName = (index: number, name: string) => {
    const updated = [...data.providers];
    updated[index].name = name;
    setData({ ...data, providers: updated });
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name="certificateData" value={JSON.stringify(data)} />

      <div className="bg-slate-50 p-5 border border-slate-200 rounded-2xl space-y-6">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Certificate Title</label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => setData({ ...data, title: e.target.value })}
            placeholder="E.g. IBM & Google Certificate"
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Features of Certificate</label>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
             <StringArrayEditor 
               initialData={data.features} 
               name="_temp_certFeatures" 
               label="Feature" 
               onChange={(newFeatures) => setData({ ...data, features: newFeatures })}
             />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-2">Certificate Providers / Sponsors</label>
          <div className="space-y-4">
            {data.providers.map((provider, idx) => (
              <div key={idx} className="bg-white p-4 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                   <h6 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Provider {idx + 1}</h6>
                   <button
                    type="button"
                    onClick={() => removeProvider(idx)}
                    className="text-slate-400 hover:text-red-500 p-1 rounded-md transition-colors"
                   >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Provider Name</label>
                    <input
                      type="text"
                      value={provider.name}
                      onChange={(e) => updateProviderName(idx, e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Upload Logo</label>
                    <div className="flex gap-4 items-center">
                      {provider.logo && (
                        <div className="bg-slate-900 p-2 rounded-lg">
                          <img src={provider.logo} alt="Logo" className="w-12 h-6 object-contain" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        name={`cert_provider_logo_${idx}`}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 transition-all bg-slate-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addProvider}
            className="mt-3 text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Certificate Provider
          </button>
        </div>
      </div>
    </div>
  );
}
