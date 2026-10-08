'use client';
import { useState } from 'react';

export default function FaqAccordion({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => (
        <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-orange-200">
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full text-left p-5 flex items-center justify-between focus:outline-none"
          >
            <span className="font-bold text-slate-900">{faq.question}</span>
            <span className={`text-orange-500 transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </button>
          <div
            className={`transition-all duration-300 ease-in-out ${
              openIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-5 pt-0 text-slate-600 text-sm leading-relaxed border-t border-slate-100 mt-2">
              {faq.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
