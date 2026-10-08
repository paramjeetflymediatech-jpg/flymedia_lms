'use server';

import { requireAdmin } from '../../../src/lib/auth';
import { Testimonial } from '../../../src/db/models';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

async function handleAvatarUpload(formData: FormData): Promise<string | null> {
  let finalAvatarUrl = null;
  const file = formData.get('avatarFile') as File | null;
  
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'testimonials');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    finalAvatarUrl = `/uploads/testimonials/${fileName}`;
  } else {
    const urlInput = formData.get('avatarUrl') as string;
    if (urlInput) {
      finalAvatarUrl = urlInput;
    }
  }
  return finalAvatarUrl;
}

function parseTestimonialFormData(formData: FormData, avatarUrl: string | null) {
  return {
    name: formData.get('name') as string,
    role: formData.get('role') as string,
    content: formData.get('content') as string,
    rating: parseInt(formData.get('rating') as string, 10),
    isActive: formData.get('isActive') === 'on',
    ...(avatarUrl !== null ? { avatar: avatarUrl } : {})
  };
}

export async function createTestimonial(formData: FormData) {
  await requireAdmin();
  const avatarUrl = await handleAvatarUpload(formData);
  const data = parseTestimonialFormData(formData, avatarUrl);
  const testimonial = await Testimonial.create(data);
  revalidatePath('/');
  revalidatePath('/admin/testimonials');
  return testimonial.toJSON();
}

export async function updateTestimonial(id: string, formData: FormData) {
  await requireAdmin();
  const avatarUrl = await handleAvatarUpload(formData);
  const data = parseTestimonialFormData(formData, avatarUrl);
  await Testimonial.update(data, { where: { id } });
  revalidatePath('/');
  revalidatePath('/admin/testimonials');
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();
  await Testimonial.destroy({ where: { id } });
  revalidatePath('/');
  revalidatePath('/admin/testimonials');
}
