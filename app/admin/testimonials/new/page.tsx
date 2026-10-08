import { requireAdmin } from '../../../../src/lib/auth';
import TestimonialForm from '../TestimonialForm';

export default async function NewTestimonialPage() {
  await requireAdmin();
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-red-500 to-orange-500">Add Testimonial</h1>
        <p className="text-slate-500 mt-2">Create a new student testimonial</p>
      </div>
      <TestimonialForm />
    </div>
  );
}
