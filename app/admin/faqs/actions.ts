'use server';
import { requireAdmin } from '../../../src/lib/auth';
import { Faq } from '../../../src/db/models';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteFaq(id: string) {
  await requireAdmin();
  await Faq.destroy({ where: { id } });
  revalidatePath('/admin/faqs');
  revalidatePath('/');
}

export async function createFaq(formData: FormData) {
  await requireAdmin();
  const question = formData.get('question') as string;
  const answer = formData.get('answer') as string;
  const order = parseInt(formData.get('order') as string) || 0;
  const isActive = formData.get('isActive') === 'on';

  await Faq.create({ question, answer, order, isActive });
  revalidatePath('/admin/faqs');
  revalidatePath('/');
  redirect('/admin/faqs');
}

export async function updateFaq(id: string, formData: FormData) {
  await requireAdmin();
  const question = formData.get('question') as string;
  const answer = formData.get('answer') as string;
  const order = parseInt(formData.get('order') as string) || 0;
  const isActive = formData.get('isActive') === 'on';

  await Faq.update({ question, answer, order, isActive }, { where: { id } });
  revalidatePath('/admin/faqs');
  revalidatePath('/');
  redirect('/admin/faqs');
}
