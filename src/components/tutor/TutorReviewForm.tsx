"use client";

import { useState } from 'react';
import { submitTutorReview } from '../../../app/actions';

interface TutorReviewFormProps {
  tutorId: string;
}

export default function TutorReviewForm({ tutorId }: TutorReviewFormProps) {
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
      <h3 className="text-xl font-bold text-slate-900 mb-6">Write a Review</h3>
      
      {success ? (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-100 font-medium">
          Thank you for your review! It has been successfully posted.
        </div>
      ) : (
        <form 
          className="space-y-6"
          action={async (formData) => {
            setIsSubmitting(true);
            const res = await submitTutorReview(formData);
            if (res?.success) {
              setSuccess(true);
            } else {
              alert(res?.error || 'Failed to submit review');
            }
            setIsSubmitting(false);
          }}
        >
          <input type="hidden" name="tutorId" value={tutorId} />
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <svg 
                    className={`w-8 h-8 ${rating >= star ? 'text-amber-400 fill-current' : 'text-slate-200 fill-current'}`} 
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              ))}
            </div>
            <input type="hidden" name="rating" value={rating} />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Your Experience</label>
            <textarea
              name="comment"
              required
              rows={4}
              placeholder="Tell us about your learning experience with this tutor..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm resize-none text-slate-900"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Post Review'}
          </button>
        </form>
      )}
    </div>
  );
}
