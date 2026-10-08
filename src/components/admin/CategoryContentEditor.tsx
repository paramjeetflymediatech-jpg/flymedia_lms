"use client";

import { useState } from 'react';

interface Feature {
  title: string;
  description: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface Section {
  heading: string;
  body: string;
}

interface CategoryContent {
  features: Feature[];
  faqs: FAQ[];
  sections: Section[];
}

export default function CategoryContentEditor({ defaultValue }: { defaultValue?: string }) {
  const [content, setContent] = useState<CategoryContent>(() => {
    if (defaultValue) {
      try {
        const parsed = JSON.parse(defaultValue);
        // Ensure properties exist if upgrading from a different format or missing fields
        return {
          features: Array.isArray(parsed.features) ? parsed.features : [],
          faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
          sections: Array.isArray(parsed.sections) ? parsed.sections : [],
        };
      } catch (e) {
        // If it was previously HTML from the old RichTextEditor, we gracefully fallback
      }
    }
    return { features: [], faqs: [], sections: [] };
  });

  const [activeTab, setActiveTab] = useState<'features' | 'faqs' | 'sections'>('features');

  const addFeature = () => setContent(prev => ({ ...prev, features: [...prev.features, { title: '', description: '' }] }));
  const addFAQ = () => setContent(prev => ({ ...prev, faqs: [...prev.faqs, { question: '', answer: '' }] }));
  const addSection = () => setContent(prev => ({ ...prev, sections: [...prev.sections, { heading: '', body: '' }] }));

  const updateFeature = (index: number, field: keyof Feature, value: string) => {
    const updated = [...content.features];
    updated[index][field] = value;
    setContent(prev => ({ ...prev, features: updated }));
  };

  const updateFAQ = (index: number, field: keyof FAQ, value: string) => {
    const updated = [...content.faqs];
    updated[index][field] = value;
    setContent(prev => ({ ...prev, faqs: updated }));
  };

  const updateSection = (index: number, field: keyof Section, value: string) => {
    const updated = [...content.sections];
    updated[index][field] = value;
    setContent(prev => ({ ...prev, sections: updated }));
  };

  const removeFeature = (index: number) => setContent(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  const removeFAQ = (index: number) => setContent(prev => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) }));
  const removeSection = (index: number) => setContent(prev => ({ ...prev, sections: prev.sections.filter((_, i) => i !== index) }));

  return (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
      <input type="hidden" name="content" value={JSON.stringify(content)} />
      
      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        {(['features', 'sections', 'faqs'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === tab 
                ? 'bg-orange-500 text-white shadow-md' 
                : 'bg-white text-slate-500 hover:bg-slate-100'
            }`}
          >
            {tab === 'faqs' ? 'Dropdowns' : tab}
          </button>
        ))}
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {activeTab === 'features' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-sm font-bold text-slate-700">Category Features</h5>
              <button type="button" onClick={addFeature} className="px-3 py-1.5 bg-orange-100 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-200">
                + Add Feature
              </button>
            </div>
            {content.features.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 mb-3 relative group">
                <button type="button" onClick={() => removeFeature(index)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="space-y-3 pt-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={e => updateFeature(index, 'title', e.target.value)}
                    placeholder="Feature Title"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                  />
                  <textarea
                    value={item.description}
                    onChange={e => updateFeature(index, 'description', e.target.value)}
                    placeholder="Feature Description"
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            ))}
            {content.features.length === 0 && <div className="text-xs text-slate-400 text-center py-4 bg-white rounded-xl border border-dashed border-slate-200">No features added yet.</div>}
          </div>
        )}

        {activeTab === 'sections' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-sm font-bold text-slate-700">Content Sections</h5>
              <button type="button" onClick={addSection} className="px-3 py-1.5 bg-orange-100 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-200">
                + Add Section
              </button>
            </div>
            {content.sections.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 mb-3 relative group">
                <button type="button" onClick={() => removeSection(index)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="space-y-3 pt-2">
                  <input
                    type="text"
                    value={item.heading}
                    onChange={e => updateSection(index, 'heading', e.target.value)}
                    placeholder="Section Heading"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:border-orange-500"
                  />
                  <textarea
                    value={item.body}
                    onChange={e => updateSection(index, 'body', e.target.value)}
                    placeholder="Section Body Content"
                    rows={4}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            ))}
            {content.sections.length === 0 && <div className="text-xs text-slate-400 text-center py-4 bg-white rounded-xl border border-dashed border-slate-200">No sections added yet.</div>}
          </div>
        )}

        {activeTab === 'faqs' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-sm font-bold text-slate-700">Dropdowns (FAQs)</h5>
              <button type="button" onClick={addFAQ} className="px-3 py-1.5 bg-orange-100 text-orange-600 rounded-lg text-xs font-bold hover:bg-orange-200">
                + Add Dropdown
              </button>
            </div>
            {content.faqs.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-xl border border-slate-200 mb-3 relative group">
                <button type="button" onClick={() => removeFAQ(index)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="space-y-3 pt-2">
                  <input
                    type="text"
                    value={item.question}
                    onChange={e => updateFAQ(index, 'question', e.target.value)}
                    placeholder="Dropdown Title / Question"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold focus:outline-none focus:border-orange-500"
                  />
                  <textarea
                    value={item.answer}
                    onChange={e => updateFAQ(index, 'answer', e.target.value)}
                    placeholder="Dropdown Content / Answer"
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            ))}
            {content.faqs.length === 0 && <div className="text-xs text-slate-400 text-center py-4 bg-white rounded-xl border border-dashed border-slate-200">No dropdowns added yet.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
