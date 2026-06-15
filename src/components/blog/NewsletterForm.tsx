'use client';

import { useState } from 'react';
import { subscribeNewsletterAction } from '../../../app/actions';

export default function NewsletterForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(formData: FormData) {
    setStatus('loading');
    const res = await subscribeNewsletterAction(formData);

    if (res?.error) {
      setStatus('error');
      setMessage(res.error);
    } else if (res?.success) {
      setStatus('success');
      setMessage(res.message || 'Successfully subscribed!');
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(new FormData(e.currentTarget));
        }} 
        className="flex flex-col sm:flex-row gap-3"
      >
        <input 
          type="email" 
          name="email"
          placeholder="Enter your email address" 
          className="flex-1 px-5 py-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:bg-slate-800 transition-all"
          required
          disabled={status === 'loading' || status === 'success'}
        />
        <button 
          type="submit" 
          disabled={status === 'loading' || status === 'success'}
          className="px-8 py-4 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/25 whitespace-nowrap"
        >
          {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
        </button>
      </form>
      
      {message && (
        <p className={`mt-4 text-sm font-semibold ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
