'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('react-simple-wysiwyg').then((mod) => mod.DefaultEditor), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-slate-50 animate-pulse rounded-xl border border-slate-200"></div>,
});

interface RichTextEditorProps {
  defaultValue: string;
  name: string;
}

export default function RichTextEditor({ defaultValue, name }: RichTextEditorProps) {
  const [value, setValue] = useState(defaultValue || '');

  return (
    <div className="bg-white rounded-xl overflow-hidden [&_.rsw-editor]:!border-slate-200 [&_.rsw-editor]:!shadow-none [&_.rsw-editor]:!min-h-[200px] [&_.rsw-toolbar]:!bg-slate-50 [&_.rsw-toolbar]:!border-b [&_.rsw-toolbar]:!border-slate-200 [&_.rsw-btn]:text-slate-600 hover:[&_.rsw-btn]:text-slate-900">
      <input type="hidden" name={name} value={value} />
      <Editor 
        value={value} 
        onChange={(e) => setValue(e.target.value)} 
      />
    </div>
  );
}
