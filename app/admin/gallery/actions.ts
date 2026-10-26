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

  const getString = (key: string): string => {
    const val = formData.get(key);
    return typeof val === 'string' ? val.trim() : '';
  };

  const mediaFile = formData.get('mediaFile') as File | null;
  const thumbFile = formData.get('thumbFile') as File | null;

  let mediaUrl = getString('mediaUrl');
  if (mediaFile && mediaFile.size > 0) {
    const uploadedMedia = await handleFileUpload(mediaFile, 'gallery');
    if (uploadedMedia) mediaUrl = uploadedMedia;
  }

  let thumbnailUrl = getString('thumbnailUrl') || null;
  if (thumbFile && thumbFile.size > 0) {
    const uploadedThumb = await handleFileUpload(thumbFile, 'gallery');
    if (uploadedThumb) thumbnailUrl = uploadedThumb;
  }

  const mediaType = getString('mediaType') === 'VIDEO' ? 'VIDEO' : 'IMAGE';
  const title = getString('title');
  const description = getString('description');
  const studentName = getString('studentName');
  const courseName = getString('courseName');
  const companyPlaced = getString('companyPlaced');
  const salaryPackage = getString('salaryPackage');
  const category = getString('category') || 'SUCCESS_STORY';
  const rating = parseInt(getString('rating') || '5', 10);
  const order = parseInt(getString('order') || '0', 10);
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

  const getString = (key: string): string => {
    const val = formData.get(key);
    return typeof val === 'string' ? val.trim() : '';
  };

  const mediaFile = formData.get('mediaFile') as File | null;
  const thumbFile = formData.get('thumbFile') as File | null;

  const updateData: any = {
    title: getString('title'),
    description: getString('description') || null,
    mediaType: getString('mediaType') === 'VIDEO' ? 'VIDEO' : 'IMAGE',
    studentName: getString('studentName') || null,
    courseName: getString('courseName') || null,
    companyPlaced: getString('companyPlaced') || null,
    salaryPackage: getString('salaryPackage') || null,
    category: getString('category') || 'SUCCESS_STORY',
    rating: parseInt(getString('rating') || '5', 10),
    order: parseInt(getString('order') || '0', 10),
    isActive: formData.get('isActive') === 'on' || formData.get('isActive') === 'true',
  };

  const manualMediaUrl = getString('mediaUrl');
  if (manualMediaUrl) {
    updateData.mediaUrl = manualMediaUrl;
  }
  if (mediaFile && mediaFile.size > 0) {
    const uploadedMedia = await handleFileUpload(mediaFile, 'gallery');
    if (uploadedMedia) updateData.mediaUrl = uploadedMedia;
  }

  const manualThumbUrl = formData.get('thumbnailUrl');
  if (typeof manualThumbUrl === 'string') {
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
