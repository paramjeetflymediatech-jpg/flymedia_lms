"use client";

import { useState } from 'react';
import { PRESET_PAGES, PageOption } from '../../constants/faqPages';
export { PRESET_PAGES };
export type { PageOption };

interface FaqPageSelectorProps {
  initialPage?: string;
  existingPages?: string[];
}

export default function FaqPageSelector({
  initialPage = 'HOME',
  existingPages = [],
}: FaqPageSelectorProps) {
  // Combine presets with any unique pages stored in the DB
  const allKnownKeys = new Set(PRESET_PAGES.map(p => p.key));
  const customExisting = existingPages.filter(p => p && !allKnownKeys.has(p.toUpperCase()));

  const isCustomInitially = initialPage && !allKnownKeys.has(initialPage.toUpperCase()) && !customExisting.includes(initialPage);

  const [mode, setMode] = useState<'preset' | 'custom'>(isCustomInitially ? 'custom' : 'preset');
  const [selectedKey, setSelectedKey] = useState<string>(initialPage.toUpperCase());
  const [customPageInput, setCustomPageInput] = useState<string>(isCustomInitially ? initialPage : '');

  const effectivePage = mode === 'custom' 
    ? customPageInput.trim().toUpperCase().replace(/\s+/g, '_')
    : selectedKey;

  return (
    <div className="space-y-3">
      {/* Hidden input submitted with the form */}
      <input type="hidden" name="page" value={effectivePage || 'HOME'} />

      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-slate-700">
          Target Page *
        </label>
        <button
          type="button"
          onClick={() => {
            if (mode === 'preset') {
              setMode('custom');
              if (!customPageInput) setCustomPageInput('');
            } else {
              setMode('preset');
            }
          }}
          className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
        >
          {mode === 'preset' ? (
            <>
              <span>➕ Add Custom / New Page</span>
            </>
          ) : (
            <>
              <span>← Select from Existing Pages</span>
            </>
          )}
        </button>
      </div>

      {mode === 'preset' ? (
        <div>
          <select
            value={selectedKey}
            onChange={(e) => {
              if (e.target.value === '__CUSTOM__') {
                setMode('custom');
              } else {
                setSelectedKey(e.target.value);
              }
            }}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-medium text-slate-900 text-sm shadow-sm"
          >
            <optgroup label="Standard Pages">
              {PRESET_PAGES.map((page) => (
                <option key={page.key} value={page.key}>
                  {page.icon} {page.label} ({page.path})
                </option>
              ))}
            </optgroup>

            {customExisting.length > 0 && (
              <optgroup label="Dynamic Pages Created by Admin">
                {customExisting.map((p) => (
                  <option key={p} value={p.toUpperCase()}>
                    📄 {p.toUpperCase()}
                  </option>
                ))}
              </optgroup>
            )}

            <option value="__CUSTOM__">➕ Enter a new custom page name...</option>
          </select>
          <p className="text-xs text-slate-500 mt-1.5">
            Select an existing page where this FAQ will be displayed.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
              📄
            </span>
            <input
              type="text"
              autoFocus
              value={customPageInput}
              onChange={(e) => setCustomPageInput(e.target.value)}
              placeholder="e.g., CONTACT, CAREERS, SERVICES, PLACEMENTS, SCHOLARSHIP"
              className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-500/10 font-bold text-slate-900 text-sm placeholder:font-normal placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Identifier saved in DB: <span className="font-mono font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">{effectivePage || '(type page name)'}</span>
            </span>
            <button
              type="button"
              onClick={() => setMode('preset')}
              className="text-slate-400 hover:text-slate-600 underline"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-slate-500">
            You can type any dynamic page identifier. It will immediately show up in the Admin filter and on the frontend FAQ component for that page.
          </p>
        </div>
      )}
    </div>
  );
}
