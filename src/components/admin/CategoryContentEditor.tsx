"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('react-simple-wysiwyg').then((mod) => mod.DefaultEditor), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-slate-50 animate-pulse rounded-xl border border-slate-200"></div>,
});

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
  layout?: 'centered' | 'image-left' | 'image-right';
  bgColor?: 'white' | 'gray';
  bgImage?: string;
  image?: string;
}

interface CategoryContent {
  features: Feature[];
  faqs: FAQ[];
  sections: Section[];
  htmlContent?: string;
  themeColor?: string;
  heroLayout?: 'centered' | 'image-left' | 'image-right';
  heroBgImage?: string;
  heroImage?: string;
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
          htmlContent: parsed.htmlContent || '',
          themeColor: parsed.themeColor || 'indigo',
          heroLayout: parsed.heroLayout || 'centered',
          heroBgImage: parsed.heroBgImage || '',
          heroImage: parsed.heroImage || '',
        };
      } catch (e) {
        // If it was previously HTML from the old RichTextEditor, we gracefully fallback
        return { features: [], faqs: [], sections: [], htmlContent: defaultValue, themeColor: 'indigo', heroLayout: 'centered' };
      }
    }
    return { features: [], faqs: [], sections: [], htmlContent: '', themeColor: 'indigo', heroLayout: 'centered' };
  });

  const [activeTab, setActiveTab] = useState<'htmlContent' | 'features' | 'sections' | 'faqs'>('htmlContent');

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

  const updateSection = (index: number, field: keyof Section, value: any) => {
    const updated = [...content.sections];
    updated[index] = { ...updated[index], [field]: value };
    setContent(prev => ({ ...prev, sections: updated }));
  };

  const removeFeature = (index: number) => setContent(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));
  const removeFAQ = (index: number) => setContent(prev => ({ ...prev, faqs: prev.faqs.filter((_, i) => i !== index) }));
  const removeSection = (index: number) => setContent(prev => ({ ...prev, sections: prev.sections.filter((_, i) => i !== index) }));

  return (
    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
      <input type="hidden" name="content" value={JSON.stringify(content)} />
      
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Category Theme Color</label>
          <p className="text-[10px] text-slate-400">This controls the glowing background colors of the hero section on the category page.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={content.themeColor || 'indigo'}
            onChange={(e) => setContent(prev => ({ ...prev, themeColor: e.target.value }))}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:outline-none focus:border-orange-500"
          >
            <option value="indigo">Indigo & Orange (Default)</option>
            <option value="emerald">Emerald & Teal</option>
            <option value="rose">Rose & Pink</option>
            <option value="blue">Blue & Cyan</option>
            <option value="amber">Amber & Yellow</option>
            <option value="purple">Purple & Fuchsia</option>
          </select>
          <div className={`w-8 h-8 rounded-full shadow-sm border border-slate-200 ${
            content.themeColor === 'emerald' ? 'bg-gradient-to-br from-emerald-500 to-teal-500' :
            content.themeColor === 'rose' ? 'bg-gradient-to-br from-rose-500 to-pink-500' :
            content.themeColor === 'blue' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
            content.themeColor === 'amber' ? 'bg-gradient-to-br from-amber-500 to-yellow-500' :
            content.themeColor === 'purple' ? 'bg-gradient-to-br from-purple-500 to-fuchsia-500' :
            'bg-gradient-to-br from-indigo-500 to-orange-500'
          }`} />
        </div>
      </div>

      <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">Hero Layout</label>
          <div className="flex gap-4">
            {(['centered', 'image-left', 'image-right'] as const).map(layout => (
              <label key={layout} className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="heroLayout" 
                  value={layout} 
                  checked={(content.heroLayout || 'centered') === layout}
                  onChange={() => setContent(prev => ({ ...prev, heroLayout: layout }))}
                  className="w-4 h-4 text-orange-500 focus:ring-orange-500 border-slate-300"
                />
                <span className="text-sm font-semibold text-slate-700 capitalize">{layout.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Background Image (Optional)</label>
            <p className="text-[10px] text-slate-400 mb-2">Overrides theme glowing orbs.</p>
            <div className="flex flex-col gap-2">
              {content.heroBgImage && (
                <div className="relative w-full h-24 rounded-lg overflow-hidden border border-slate-200">
                  <img src={content.heroBgImage} alt="Hero BG" className="object-cover w-full h-full" />
                  <button type="button" onClick={() => setContent(prev => ({ ...prev, heroBgImage: '' }))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs">✕</button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                name="heroBgImageFile"
                className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {(content.heroLayout === 'image-left' || content.heroLayout === 'image-right') && (
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">Hero Side Image</label>
              <p className="text-[10px] text-slate-400 mb-2">Shown next to text in split layouts.</p>
              <div className="flex flex-col gap-2">
                {content.heroImage && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200">
                    <img src={content.heroImage} alt="Hero Side" className="object-cover w-full h-full" />
                    <button type="button" onClick={() => setContent(prev => ({ ...prev, heroImage: '' }))} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs">✕</button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  name="heroImageFile"
                  className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 pb-3">
        {(['htmlContent', 'features', 'sections', 'faqs'] as const).map(tab => (
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
            {tab === 'faqs' ? 'Dropdowns' : tab === 'htmlContent' ? 'Rich Text' : tab}
          </button>
        ))}
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {activeTab === 'htmlContent' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-sm font-bold text-slate-700">Rich Text HTML</h5>
            </div>
            <div className="bg-white rounded-xl overflow-hidden [&_.rsw-editor]:!border-slate-200 [&_.rsw-editor]:!shadow-none [&_.rsw-editor]:!min-h-[300px] [&_.rsw-toolbar]:!bg-slate-50 [&_.rsw-toolbar]:!border-b [&_.rsw-toolbar]:!border-slate-200 [&_.rsw-btn]:text-slate-600 hover:[&_.rsw-btn]:text-slate-900 mt-2">
              <Editor
                value={content.htmlContent || ''}
                onChange={e => setContent(prev => ({ ...prev, htmlContent: e.target.value }))}
              />
            </div>
            <p className="text-xs text-slate-500 mt-3">Use the editor above to format your content visually.</p>
          </div>
        )}

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
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase">Section Layout</label>
                      <div className="flex gap-4">
                        {(['centered', 'image-left', 'image-right'] as const).map(layout => (
                          <label key={layout} className="flex items-center gap-1 cursor-pointer">
                            <input 
                              type="radio" 
                              name={`section_layout_${index}`} 
                              value={layout} 
                              checked={(item.layout || 'centered') === layout}
                              onChange={() => updateSection(index, 'layout', layout)}
                              className="w-3 h-3 text-orange-500"
                            />
                            <span className="text-xs font-semibold text-slate-700 capitalize">{layout.replace('-', ' ')}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-200 pt-3">
                      <label className="text-xs font-bold text-slate-500 uppercase">Background Color</label>
                      <div className="flex gap-4">
                        {(['white', 'gray'] as const).map(color => (
                          <label key={color} className="flex items-center gap-1 cursor-pointer">
                            <input 
                              type="radio" 
                              name={`section_bgcolor_${index}`} 
                              value={color} 
                              checked={(item.bgColor || 'gray') === color}
                              onChange={() => updateSection(index, 'bgColor', color)}
                              className="w-3 h-3 text-orange-500"
                            />
                            <span className="text-xs font-semibold text-slate-700 capitalize">{color}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Background Image (Optional)</label>
                        <div className="flex flex-col gap-1">
                          {item.bgImage && (
                            <div className="relative w-full h-16 rounded border border-slate-200 overflow-hidden">
                              <img src={item.bgImage} className="w-full h-full object-cover" />
                              <button type="button" onClick={() => updateSection(index, 'bgImage', '')} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">✕</button>
                            </div>
                          )}
                          <input type="file" accept="image/*" name={`section_bgImageFile_${index}`} className="text-[10px] w-full" />
                        </div>
                      </div>
                      {(item.layout === 'image-left' || item.layout === 'image-right') && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Side Image</label>
                          <div className="flex flex-col gap-1">
                            {item.image && (
                              <div className="relative w-16 h-16 rounded border border-slate-200 overflow-hidden">
                                <img src={item.image} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => updateSection(index, 'image', '')} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">✕</button>
                              </div>
                            )}
                            <input type="file" accept="image/*" name={`section_imageFile_${index}`} className="text-[10px] w-full" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <Editor
                    value={item.body}
                    onChange={(e: any) => updateSection(index, 'body', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg overflow-hidden prose-sm max-w-none"
                    containerProps={{ style: { minHeight: '150px' } }}
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
