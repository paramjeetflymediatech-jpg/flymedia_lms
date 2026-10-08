import { requireAdmin } from '../../../../src/lib/auth';
import TestimonialForm from '../TestimonialForm';
import { Testimonial } from '../../../../src/db/models';
import { notFound } from 'next/navigation';

export default async function EditTestimonialPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  
  // Note: params in nextjs 15 must be awaited if it's dynamic
  const { id } = await params;
  
  const testimonial = await Testimonial.findByPk(id);
  
  if (!testimonial) {
    notFound();
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 via-red-500 to-orange-500">Edit Testimonial</h1>
        <p className="text-slate-500 mt-2">Update student testimonial</p>
      </div>
      <TestimonialForm initialData={testimonial.toJSON()} />
    </div>
  );
}
