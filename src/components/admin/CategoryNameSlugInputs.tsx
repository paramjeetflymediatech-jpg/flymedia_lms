'use client';

import { useState } from 'react';

interface CategoryNameSlugInputsProps {
  initialName?: string;
  initialSlug?: string;
  layout?: 'stacked' | 'grid';
  nameLabel?: string;
  nameField?: string;
}

export default function CategoryNameSlugInputs({ initialName = '', initialSlug = '', layout = 'stacked', nameLabel = 'Name', nameField = 'name' }: CategoryNameSlugInputsProps) {
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  const slugify = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isSlugManuallyEdited) {
      setSlug(slugify(newName));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugManuallyEdited(true);
  };

  const containerClass = layout === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4";
  const inputClass = layout === 'grid' 
    ? "w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-sm text-slate-900"
    : "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 focus:border-orange-500 text-xs text-slate-900";
  const labelClass = layout === 'grid'
    ? "block text-sm font-semibold text-slate-700 mb-2"
    : "block text-xs font-semibold text-slate-700 mb-1.5";

  return (
    <div className={containerClass}>
      <div>
        <label className={labelClass}>{nameLabel}</label>
        <input
          name={nameField}
          type="text"
          required
          value={name}
          onChange={handleNameChange}
          className={inputClass}
          placeholder="e.g. Graphic Design"
        />
      </div>
      <div>
        <label className={labelClass}>Custom Slug (Optional)</label>
        <input
          name="slug"
          type="text"
          value={slug}
          onChange={handleSlugChange}
          className={inputClass}
          placeholder="e.g. graphic-design"
        />
      </div>
    </div>
  );
}
