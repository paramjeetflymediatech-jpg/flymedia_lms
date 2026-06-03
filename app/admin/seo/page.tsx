"use client";

import React, { useState, Suspense } from 'react';
import Swal from 'sweetalert2';
import { useSearchParams } from 'next/navigation';
import Pagination from '../../../src/components/admin/Pagination';

interface SeoEntry {
  id: string;
  pagePath: string;
  title: string;
  description: string;
  keywords: string;
  author: string;
  ogImage: string;
}

function SeoManagementContent() {
  const searchParams = useSearchParams();
  const page = parseInt(searchParams.get('page') || '1', 10) || 1;
  const limit = 10;

  const [view, setView] = useState<'list' | 'form'>('list');
  const [isSaving, setIsSaving] = useState(false);
  const [seoList, setSeoList] = useState<SeoEntry[]>([
    {
      id: '1',
      pagePath: '/',
      title: 'Flymedia Technology LMS',
      description: 'Elevate your future with premium industry-led training in digital marketing and software development from top agency experts.',
      keywords: 'LMS, digital marketing, software development, summer training, courses',
      author: 'Flymedia Technology',
      ogImage: '/og-image.jpg'
    }
  ]);
  
  const totalItems = seoList.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const offset = (page - 1) * limit;
  const paginatedList = seoList.slice(offset, offset + limit);
  
  const [formData, setFormData] = useState<Omit<SeoEntry, 'id'>>({
    pagePath: '',
    title: '',
    description: '',
    keywords: '',
    author: 'Flymedia Technology',
    ogImage: '/og-image.jpg'
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateNew = () => {
    setFormData({
      pagePath: '',
      title: '',
      description: '',
      keywords: '',
      author: 'Flymedia Technology',
      ogImage: '/og-image.jpg'
    });
    setEditingId(null);
    setView('form');
  };

  const handleEdit = (entry: SeoEntry) => {
    setFormData({
      pagePath: entry.pagePath,
      title: entry.title,
      description: entry.description,
      keywords: entry.keywords,
      author: entry.author,
      ogImage: entry.ogImage
    });
    setEditingId(entry.id);
    setView('form');
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Delete SEO Entry?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setSeoList(prev => prev.filter(item => item.id !== id));
        Swal.fire({
          title: 'Deleted!',
          text: 'The SEO entry has been deleted.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call to save SEO data
    setTimeout(() => {
      if (editingId) {
        setSeoList(prev => prev.map(item => item.id === editingId ? { ...formData, id: editingId } : item));
      } else {
        const newEntry = { ...formData, id: Date.now().toString() };
        setSeoList(prev => [...prev, newEntry]);
      }
      setIsSaving(false);
      setView('list');
    }, 600);
  };

  return (
    <div className="p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {view === 'list' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">SEO Management</h1>
                <p className="text-sm text-slate-500 mt-1">Manage search engine optimization tags for different pages.</p>
              </div>
              <button
                onClick={handleCreateNew}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Create New SEO
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {seoList.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-500 font-medium">No SEO entries found. Click "Create New SEO" to add one.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Page Path</th>
                        <th className="px-6 py-4 font-semibold">Meta Title</th>
                        <th className="px-6 py-4 font-semibold hidden md:table-cell">Description</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedList.map((entry) => (
                        <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{entry.pagePath}</td>
                          <td className="px-6 py-4 text-slate-700 font-medium truncate max-w-[200px]">{entry.title}</td>
                          <td className="px-6 py-4 text-slate-500 truncate max-w-[300px] hidden md:table-cell">{entry.description}</td>
                          <td className="px-6 py-4 text-right space-x-3">
                            <button onClick={() => handleEdit(entry)} className="text-blue-600 hover:text-blue-800 font-semibold transition-colors p-1" title="Edit">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                            <button onClick={() => handleDelete(entry.id)} className="text-red-500 hover:text-red-700 font-semibold transition-colors p-1" title="Delete">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {seoList.length > 0 && (
                <Pagination 
                  page={page} 
                  totalPages={totalPages} 
                  totalItems={totalItems} 
                  limit={limit} 
                  baseUrl="/admin/seo" 
                />
              )}
            </div>
          </>
        )}

        {view === 'form' && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">{editingId ? 'Edit SEO Entry' : 'Create New SEO'}</h1>
                <p className="text-sm text-slate-500 mt-1">Configure search engine optimization parameters for a specific route.</p>
              </div>
              <button
                onClick={() => setView('list')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all"
              >
                Back to List
              </button>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <form onSubmit={handleSave} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Page Path (Route)</label>
                  <input
                    type="text"
                    name="pagePath"
                    value={formData.pagePath}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                    placeholder="e.g. / (for home), /courses, /about"
                    required
                  />
                  <p className="text-xs text-slate-500">The exact URL path where these SEO tags should be applied.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Meta Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                    placeholder="e.g. Flymedia Technology LMS"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Meta Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium resize-none"
                    placeholder="A brief description of your platform..."
                    required
                  />
                  <p className="text-xs text-slate-500">Keep this between 150-160 characters for optimal search engine visibility.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Meta Keywords</label>
                  <input
                    type="text"
                    name="keywords"
                    value={formData.keywords}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                    placeholder="Comma separated keywords"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Author</label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">OG Image URL</label>
                    <input
                      type="text"
                      name="ogImage"
                      value={formData.ogImage}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium"
                      placeholder="/og-image.jpg"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setView('list')}
                    className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save SEO Settings</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default function SeoManagementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading...</div>}>
      <SeoManagementContent />
    </Suspense>
  );
}
