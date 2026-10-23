'use server';

import { requireAdmin } from '../../../src/lib/auth';
import { GalleryItem } from '../../../src/db/models';
import { revalidatePath } from 'next/cache';
import fs from 'fs';
import path from 'path';

async function handleFileUpload(file: File | null, subDir: string): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
  const fileName = `${Date.now()}-${cleanName}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subDir);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${subDir}/${fileName}`;
}

export async function createGalleryItem(formData: FormData) {
  await requireAdmin();
  await GalleryItem.sync({ alter: true });

  const mediaFile = formData.get('mediaFile') as File | null;
  const thumbFile = formData.get('thumbFile') as File | null;

  let mediaUrl = formData.get('mediaUrl') as string || '';
  if (mediaFile && mediaFile.size > 0) {
    const uploadedMedia = await handleFileUpload(mediaFile, 'gallery');
    if (uploadedMedia) mediaUrl = uploadedMedia;
  }

  let thumbnailUrl = formData.get('thumbnailUrl') as string || null;
  if (thumbFile && thumbFile.size > 0) {
    const uploadedThumb = await handleFileUpload(thumbFile, 'gallery');
    if (uploadedThumb) thumbnailUrl = uploadedThumb;
  }

  const mediaType = (formData.get('mediaType') as string) === 'VIDEO' ? 'VIDEO' : 'IMAGE';
  const title = (formData.get('title') as string || '').trim();
  const description = (formData.get('description') as string || '').trim();
  const studentName = (formData.get('studentName') as string || '').trim();
  const courseName = (formData.get('courseName') as string || '').trim();
  const companyPlaced = (formData.get('companyPlaced') as string || '').trim();
  const salaryPackage = (formData.get('salaryPackage') as string || '').trim();
  const category = (formData.get('category') as string || 'SUCCESS_STORY').trim();
  const rating = parseInt(formData.get('rating') as string || '5', 10);
  const order = parseInt(formData.get('order') as string || '0', 10);
  const isActive = formData.get('isActive') === 'on' || formData.get('isActive') === 'true';

  if (!title || !mediaUrl) {
    throw new Error('Title and media file/URL are required.');
  }

  const item = await GalleryItem.create({
    title,
    description: description || null,
    mediaType,
    mediaUrl,
    thumbnailUrl,
    studentName: studentName || null,
    courseName: courseName || null,
    companyPlaced: companyPlaced || null,
    salaryPackage: salaryPackage || null,
    rating: isNaN(rating) ? 5 : rating,
    category,
    order: isNaN(order) ? 0 : order,
    isActive,
  });

  revalidatePath('/');
  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');

  return item.toJSON();
}

export async function updateGalleryItem(id: string, formData: FormData) {
  await requireAdmin();
  await GalleryItem.sync({ alter: true });

  const mediaFile = formData.get('mediaFile') as File | null;
  const thumbFile = formData.get('thumbFile') as File | null;

  const updateData: any = {
    title: (formData.get('title') as string || '').trim(),
    description: (formData.get('description') as string || '').trim() || null,
    mediaType: (formData.get('mediaType') as string) === 'VIDEO' ? 'VIDEO' : 'IMAGE',
    studentName: (formData.get('studentName') as string || '').trim() || null,
    courseName: (formData.get('courseName') as string || '').trim() || null,
    companyPlaced: (formData.get('companyPlaced') as string || '').trim() || null,
    salaryPackage: (formData.get('salaryPackage') as string || '').trim() || null,
    category: (formData.get('category') as string || 'SUCCESS_STORY').trim(),
    rating: parseInt(formData.get('rating') as string || '5', 10),
    order: parseInt(formData.get('order') as string || '0', 10),
    isActive: formData.get('isActive') === 'on' || formData.get('isActive') === 'true',
  };

  const manualMediaUrl = formData.get('mediaUrl') as string;
  if (manualMediaUrl) {
    updateData.mediaUrl = manualMediaUrl.trim();
  }
  if (mediaFile && mediaFile.size > 0) {
    const uploadedMedia = await handleFileUpload(mediaFile, 'gallery');
    if (uploadedMedia) updateData.mediaUrl = uploadedMedia;
  }

  const manualThumbUrl = formData.get('thumbnailUrl') as string;
  if (manualThumbUrl !== undefined) {
    updateData.thumbnailUrl = manualThumbUrl.trim() || null;
  }
  if (thumbFile && thumbFile.size > 0) {
    const uploadedThumb = await handleFileUpload(thumbFile, 'gallery');
    if (uploadedThumb) updateData.thumbnailUrl = uploadedThumb;
  }

  await GalleryItem.update(updateData, { where: { id } });

  revalidatePath('/');
  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');
}

export async function deleteGalleryItem(id: string) {
  await requireAdmin();
  await GalleryItem.destroy({ where: { id } });
  revalidatePath('/');
  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');
}

export async function toggleGalleryItemActive(id: string, isActive: boolean) {
  await requireAdmin();
  await GalleryItem.update({ isActive }, { where: { id } });
  revalidatePath('/');
  revalidatePath('/gallery');
  revalidatePath('/admin/gallery');
}
