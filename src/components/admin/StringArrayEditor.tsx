'use client';

import { useState } from 'react';

export default function StringArrayEditor({ initialData = [], name, label, onChange }: { initialData: string[], name: string, label: string, onChange?: (items: string[]) => void }) {
  const [items, setItems] = useState<string[]>(initialData);

  const addItem = () => {
    const newItems = [...items, 'New Item'];
    setItems(newItems);
    onChange?.(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onChange?.(newItems);
  };

  const updateItem = (index: number, value: string) => {
    const updated = [...items];
    updated[index] = value;
    setItems(updated);
    onChange?.(updated);
  };

  return (
    <div className="space-y-3">
      {/* Hidden input to pass data to server action */}
      <input type="hidden" name={name} value={JSON.stringify(items)} />

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-400">
              {idx + 1}
            </div>
            <input
              type="text"
              value={item}
              onChange={(e) => updateItem(idx, e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/25 text-sm"
            />
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="text-xs font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 mt-2"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add {label}
      </button>
    </div>
  );
}
