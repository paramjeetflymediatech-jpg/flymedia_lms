'use server';
import { requireAdmin } from '../../../src/lib/auth';
import { Faq } from '../../../src/db/models';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

function normalizePage(raw: unknown): string {
  if (typeof raw !== 'string' || !raw.trim()) return 'HOME';
  return raw.trim().toUpperCase().replace(/\s+/g, '_');
}

function revalidateAllFaqPages(page: string) {
  revalidatePath('/admin/faqs');
  revalidatePath('/');
  revalidatePath('/about');
  revalidatePath('/partner-with-us');
  revalidatePath('/faq');
  revalidatePath('/contact');
  revalidatePath('/packages');
  revalidatePath('/gallery');
  revalidatePath('/become-tutor');
  if (page) {
    const slug = page.toLowerCase().replace(/_/g, '-');
    revalidatePath(`/${slug}`);
  }
}

export async function deleteFaq(id: string) {
  await requireAdmin();
  const existing = await Faq.findByPk(id);
  const page = existing?.page || 'HOME';
  await Faq.destroy({ where: { id } });
  revalidateAllFaqPages(page);
}

export async function createFaq(formData: FormData) {
  await requireAdmin();
  const page = normalizePage(formData.get('page'));
  const question = formData.get('question') as string;
  const answer = formData.get('answer') as string;
  const order = parseInt(formData.get('order') as string) || 0;
  const isActive = formData.get('isActive') === 'on';

  await Faq.create({ page, question, answer, order, isActive });
  revalidateAllFaqPages(page);
  redirect('/admin/faqs');
}

export async function updateFaq(id: string, formData: FormData) {
  await requireAdmin();
  const page = normalizePage(formData.get('page'));
  const question = formData.get('question') as string;
  const answer = formData.get('answer') as string;
  const order = parseInt(formData.get('order') as string) || 0;
  const isActive = formData.get('isActive') === 'on';

  await Faq.update({ page, question, answer, order, isActive }, { where: { id } });
  revalidateAllFaqPages(page);
  redirect('/admin/faqs');
}

