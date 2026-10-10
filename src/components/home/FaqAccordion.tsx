"use client";

import { useState } from 'react';

export default function FaqAccordion({ faqs }: { faqs: any[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div 
            key={faq.id || index} 
            className={`border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-orange-50/50 shadow-md shadow-orange-100/50' : 'bg-white hover:border-slate-300'}`}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 focus:outline-none"
            >
              <h3 className={`font-bold text-lg transition-colors ${isOpen ? 'text-orange-600' : 'text-slate-800'}`}>
                {faq.question}
              </h3>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'bg-orange-100 text-orange-600 rotate-180' : 'bg-slate-100 text-slate-500'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </button>
            <div 
              className={`transition-all duration-300 ease-in-out px-6 overflow-hidden ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0'}`}
            >
              <p className="text-slate-600 font-medium leading-relaxed">
                {faq.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
