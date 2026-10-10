'use server';

import fs from 'fs';
import path from 'path';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { User, Package, LiveClass, Enrollment, Certificate, Inquiry, PasswordResetToken, Payment, Coupon, TutorApplication, SeoSetting, Review, TutorAvailability, BlogPost, NewsletterSubscriber, Category } from '../src/db/models';
import { loginUser, logoutUser, getCurrentUser, requireAuth, requireAdmin } from '../src/lib/auth';
import { sendPasswordResetEmail, sendTutorApprovalEmail, sendTutorRejectionEmail, sendMail } from '../src/lib/mailer';

// Helper to slugify string
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

// ==========================================
// 1. AUTH ACTIONS
// ==========================================

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Please enter your email and password' };
  }

  let redirectUrl = '/dashboard';

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || !user.passwordHash) {
      return { error: 'Invalid email or password' };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { error: 'Invalid email or password' };
    }

    await loginUser({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    redirectUrl = user.role === 'ADMIN' ? '/admin' : user.role === 'TUTOR' ? '/tutor/dashboard' : '/dashboard';
  } catch (error: any) {
    console.error('Login error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }

  redirect(redirectUrl);
}
export async function registerAction(prevState: any, formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    return { error: 'All fields are required' };
  }

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return { error: 'An account with this email already exists' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      name,
      passwordHash,
      role: 'STUDENT',
    });

    await loginUser({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return { error: 'Could not create account. Please try again.' };
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  await logoutUser();
  redirect('/');
}

export async function forgotPasswordAction(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string || '').trim().toLowerCase();

  if (!email) {
    return { error: 'Please enter your email address.' };
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (user) {
      const rawToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
      const encoder = new TextEncoder();
      const data = encoder.encode(rawToken);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashedToken = Buffer.from(hashBuffer).toString('hex');

      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await PasswordResetToken.create({
        userId: user.id,
        token: hashedToken,
        expiresAt,
      });

      const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
      const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

      await sendPasswordResetEmail(email, user.name || 'Student', resetUrl);
    }
  } catch (error) {
    console.error('Forgot password error:', error);
  }

  return { success: true, email };
}

export async function resetPasswordAction(prevState: any, formData: FormData) {
  const rawToken = (formData.get('token') as string || '').trim();
  const password = (formData.get('password') as string || '').trim();
  const confirm = (formData.get('confirm') as string || '').trim();

  if (!rawToken) return { error: 'Invalid or missing reset token.' };
  if (!password || password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (password !== confirm) return { error: 'Passwords do not match.' };

  try {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawToken));
    const hashedToken = Buffer.from(hashBuffer).toString('hex');

    const record = await PasswordResetToken.findOne({ where: { token: hashedToken } });

    if (!record) return { error: 'This reset link is invalid or has already been used.' };
    if (record.used) return { error: 'This reset link has already been used.' };
    if (new Date() > record.expiresAt) return { error: 'This reset link has expired. Please request a new one.' };

    const user = await User.findByPk(record.userId);
    if (!user) return { error: 'Account not found.' };

    user.passwordHash = await bcrypt.hash(password, 10);
    await user.save();

    record.used = true;
    await record.save();
  } catch (error) {
    console.error('Reset password error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }

  return { success: true };
}

// ==========================================
// 2. STUDENT LEARNING ACTIONS
// ==========================================

export async function enrollInPackage(packageId: string) {
  const user = await requireAuth();

  try {
    const existing = await Enrollment.findOne({
      where: { userId: user.id, packageId },
    });

    if (existing) {
      return { success: true, message: 'Already enrolled' };
    }

    await Enrollment.create({
      userId: user.id,
      packageId,
    });

    revalidatePath('/dashboard');
    revalidatePath(`/packages/${packageId}`);
    return { success: true };
  } catch (error) {
    console.error('Enrollment error:', error);
    return { error: 'Failed to enroll in package' };
  }
}

export async function adminDeleteEnrollment(enrollmentId: string) {
  await requireAdmin();
  try {
    const enr = await Enrollment.findByPk(enrollmentId);
    if (!enr) return { error: 'Enrollment not found' };
    await enr.destroy();
    revalidatePath('/admin/enrollments');
    return { success: true };
  } catch (error) {
    console.error('Delete enrollment error:', error);
    return { error: 'Failed to delete enrollment' };
  }
}

export async function adminCreateEnrollment(formData: FormData) {
  await requireAdmin();

  const userId = formData.get('userId') as string;
  const packageId = formData.get('packageId') as string;

  if (!userId || !packageId) {
    return { error: 'Student and Package are required' };
  }

  try {
    const existing = await Enrollment.findOne({
      where: { userId, packageId },
    });

    if (existing) {
      return { error: 'Student is already enrolled in this package' };
    }

    await Enrollment.create({
      userId,
      packageId,
    });

    revalidatePath('/admin/enrollments');
    return { success: true };
  } catch (error) {
    console.error('Create enrollment error:', error);
    return { error: 'Failed to create enrollment' };
  }
}

export async function adminUpdateEnrollment(enrollmentId: string, formData: FormData) {
  await requireAdmin();

  const status = formData.get('status') as 'ACTIVE' | 'COMPLETED';

  try {
    const enr = await Enrollment.findByPk(enrollmentId);
    if (!enr) return { error: 'Enrollment not found' };

    if (status === 'COMPLETED' && !enr.completedAt) {
      enr.completedAt = new Date();
    } else if (status === 'ACTIVE' && enr.completedAt) {
      enr.completedAt = null;
    }

    await enr.save();
    revalidatePath('/admin/enrollments');
    revalidatePath(`/admin/enrollments/${enrollmentId}`);
    return { success: true };
  } catch (error) {
    console.error('Update enrollment error:', error);
    return { error: 'Failed to update enrollment' };
  }
}

// ==========================================
// 3. ADMIN MANAGEMENT ACTIONS
// ==========================================

export async function adminCreateCategory(formData: FormData) {
  await requireAdmin();
  const name = formData.get('name') as string;
  if (!name) return { error: 'Name is required' };

  const customSlug = formData.get('slug') as string;
  const metaTitle = formData.get('metaTitle') as string;
  const metaDescription = formData.get('metaDescription') as string;
  const metaKeywords = formData.get('metaKeywords') as string;
  const content = formData.get('content') as string;

  // Handle icon upload
  let iconUrl: string | null = null;
  const iconFile = formData.get('iconFile') as File | null;
  if (iconFile && iconFile.size > 0) {
    const bytes = await iconFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${iconFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'categories');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, fileName), buffer);
    iconUrl = `/uploads/categories/${fileName}`;
  } else {
    const urlInput = formData.get('iconUrl') as string;
    if (urlInput) iconUrl = urlInput;
  }

  try {
    const slug = customSlug ? slugify(customSlug) : slugify(name);
    await Category.create({ 
      name, 
      slug, 
      icon: iconUrl,
      content: content || null,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
      metaKeywords: metaKeywords || null
    });
    revalidatePath('/admin/categories');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Create category error:', error);
    return { error: 'Failed to create category' };
  }
}

export async function adminDeleteCategory(categoryId: string) {
  await requireAdmin();
  try {
    const category = await Category.findByPk(categoryId);
    if (!category) return { error: 'Category not found' };
    await category.destroy();
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error('Delete category error:', error);
    return { error: 'Failed to delete category' };
  }
}

export async function adminUpdateCategory(categoryId: string, formData: FormData) {
  await requireAdmin();
  const name = formData.get('name') as string;
  if (!name) return { error: 'Name is required' };

  const customSlug = formData.get('slug') as string;
  const metaTitle = formData.get('metaTitle') as string;
  const metaDescription = formData.get('metaDescription') as string;
  const metaKeywords = formData.get('metaKeywords') as string;
  const content = formData.get('content') as string;

  try {
    const category = await Category.findByPk(categoryId);
    if (!category) return { error: 'Category not found' };

    let iconUrl = category.icon;
    const iconFile = formData.get('iconFile') as File | null;
    if (iconFile && iconFile.size > 0) {
      const bytes = await iconFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${iconFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'categories');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, fileName), buffer);
      iconUrl = `/uploads/categories/${fileName}`;
    } else {
      const urlInput = formData.get('iconUrl') as string;
      if (urlInput !== null && urlInput !== undefined) iconUrl = urlInput;
    }

    category.name = name;
    category.slug = customSlug ? slugify(customSlug) : slugify(name);
    category.icon = iconUrl;
    category.content = content || null;
    category.metaTitle = metaTitle || null;
    category.metaDescription = metaDescription || null;
    category.metaKeywords = metaKeywords || null;
    await category.save();

    revalidatePath('/admin/categories');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Update category error:', error);
    return { error: 'Failed to update category' };
  }
}

export async function adminCreatePackage(formData: FormData) {
  await requireAdmin();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = (formData.get('category') as string) || 'Uncategorized';
  const price = formData.get('price') ? Number(formData.get('price')) : null;
  const mode = formData.get('mode') as 'ONLINE' | 'OFFLINE' | 'BOTH' || 'ONLINE';
  const status = formData.get('status') as 'DRAFT' | 'PUBLISHED' || 'DRAFT';

  let finalThumbnailUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';

  const file = formData.get('thumbnailFile') as File | null;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'packages');

    // Ensure dir exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    finalThumbnailUrl = `/uploads/packages/${fileName}`;
  } else {
    const urlInput = formData.get('thumbnailUrl') as string;
    if (urlInput) {
      finalThumbnailUrl = urlInput;
    }
  }

  if (!title || !description) {
    return { error: 'Title and Description are required' };
  }

  try {
    const slug = slugify(title);
    const existing = await Package.findOne({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    let techStackParsed = null;
    const techStackRaw = formData.get('techStack') as string;
    if (techStackRaw !== null) {
      try {
        let parsed = techStackRaw.trim() ? JSON.parse(techStackRaw) : null;
        if (parsed && Array.isArray(parsed)) {
          for (let i = 0; i < parsed.length; i++) {
            const file = formData.get(`tech_icon_${i}`) as File | null;
            const uploadedUrl = await saveLocalFile(file, 'tech');
            if (uploadedUrl) parsed[i].iconUrl = uploadedUrl;
            if (typeof parsed[i] === 'string') {
              parsed[i] = { name: parsed[i], iconUrl: '' };
            }
          }
        }
        techStackParsed = parsed;
      } catch {}
    }

    await Package.create({
      title,
      slug: finalSlug,
      description,
      category,
      price,
      thumbnail: finalThumbnailUrl,
      videoUrl: formData.get('videoUrl') as string || null,
      rating: formData.get('rating') ? Number(formData.get('rating')) : 4.9,
      reviewsCount: formData.get('reviewsCount') as string || '1.2k+',
      level: formData.get('level') as string || 'Beginner to Advanced',
      status,
      mode,
      techStack: techStackParsed,
    });

    revalidatePath('/admin/packages');
    return { success: true };
  } catch (error) {
    console.error('Create package error:', error);
    return { error: 'Failed to create package' };
  }
}

async function saveLocalFile(file: File | null, folder: string = 'packages'): Promise<string | null> {
  if (!file || file.size === 0) return null;
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filePath = path.join(uploadDir, fileName);
  fs.writeFileSync(filePath, buffer);
  return `/uploads/${folder}/${fileName}`;
}

export async function adminUpdatePackage(packageId: string, formData: FormData) {
  await requireAdmin();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const price = formData.get('price') ? Number(formData.get('price')) : null;
  const status = formData.get('status') as 'DRAFT' | 'PUBLISHED' || 'DRAFT';
  const mode = formData.get('mode') as 'ONLINE' | 'OFFLINE' | 'BOTH';

  let finalThumbnailUrl = undefined;

  const file = formData.get('thumbnailFile') as File | null;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'packages');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    finalThumbnailUrl = `/uploads/packages/${fileName}`;
  } else {
    const urlInput = formData.get('thumbnailUrl') as string;
    if (urlInput) {
      finalThumbnailUrl = urlInput;
    }
  }

  if (!title || !description) {
    return { error: 'Title and Description are required' };
  }

  try {
    const pkg = await Package.findByPk(packageId);
    if (!pkg) return { error: 'Package not found' };

    pkg.title = title;
    pkg.description = description;
    if (category) pkg.category = category;
    pkg.status = status;
    if (mode) pkg.mode = mode;
    if (price !== null && price !== undefined) pkg.price = price;
    if (finalThumbnailUrl !== undefined) pkg.thumbnail = finalThumbnailUrl;
    
    const videoUrl = formData.get('videoUrl') as string;
    if (videoUrl !== null) pkg.videoUrl = videoUrl;
    
    const ratingRaw = formData.get('rating');
    if (ratingRaw !== null) pkg.rating = Number(ratingRaw);
    
    const reviewsCountRaw = formData.get('reviewsCount') as string;
    if (reviewsCountRaw !== null) pkg.reviewsCount = reviewsCountRaw;
    
    const levelRaw = formData.get('level') as string;
    if (levelRaw !== null) pkg.level = levelRaw;

    // What You'll Learn (JSON array)
    const whatYoullLearnRaw = formData.get('whatYoullLearn') as string;
    if (whatYoullLearnRaw !== null) {
      try { pkg.whatYoullLearn = whatYoullLearnRaw.trim() ? JSON.parse(whatYoullLearnRaw) : null; } catch {}
    }

    // Instructors (JSON array)
    const instructorsRaw = formData.get('instructors') as string;
    if (instructorsRaw !== null) {
      try {
        let parsed = instructorsRaw.trim() ? JSON.parse(instructorsRaw) : null;
        if (parsed && Array.isArray(parsed)) {
          for (let i = 0; i < parsed.length; i++) {
            const file = formData.get(`instructor_avatar_${i}`) as File | null;
            const uploadedUrl = await saveLocalFile(file, 'instructors');
            if (uploadedUrl) parsed[i].avatar = uploadedUrl;
          }
        }
        pkg.instructors = parsed;
      } catch { pkg.instructors = null; }
    }

    // Success Stories (JSON array)
    const successStoriesRaw = formData.get('successStories') as string;
    if (successStoriesRaw !== null) {
      try {
        let parsed = successStoriesRaw.trim() ? JSON.parse(successStoriesRaw) : null;
        if (parsed && Array.isArray(parsed)) {
          for (let i = 0; i < parsed.length; i++) {
            const file = formData.get(`story_avatar_${i}`) as File | null;
            const uploadedUrl = await saveLocalFile(file, 'stories');
            if (uploadedUrl) parsed[i].avatar = uploadedUrl;
          }
        }
        pkg.successStories = parsed;
      } catch { pkg.successStories = null; }
    }

    // Course Modules (JSON array)
    const courseModulesRaw = formData.get('courseModules') as string;
    if (courseModulesRaw !== null) {
      try {
        pkg.courseModules = courseModulesRaw.trim() ? JSON.parse(courseModulesRaw) : null;
      } catch { pkg.courseModules = null; }
    }

    // New Dynamic JSON Fields
    const highlightsRaw = formData.get('highlights') as string;
    if (highlightsRaw !== null) {
      try { pkg.highlights = highlightsRaw.trim() ? JSON.parse(highlightsRaw) : null; } catch {}
    }
    const skillsRaw = formData.get('skills') as string;
    if (skillsRaw !== null) {
      try { pkg.skills = skillsRaw.trim() ? JSON.parse(skillsRaw) : null; } catch {}
    }
    const techStackRaw = formData.get('techStack') as string;
    if (techStackRaw !== null) {
      try { pkg.techStack = techStackRaw.trim() ? JSON.parse(techStackRaw) : null; } catch {}
    }
    const projectDetailsRaw = formData.get('projectDetails') as string;
    if (projectDetailsRaw !== null) {
      try { pkg.projectDetails = projectDetailsRaw.trim() ? JSON.parse(projectDetailsRaw) : null; } catch {}
    }
    const targetAudienceRaw = formData.get('targetAudience') as string;
    if (targetAudienceRaw !== null) {
      try { pkg.targetAudience = targetAudienceRaw.trim() ? JSON.parse(targetAudienceRaw) : null; } catch {}
    }
    const faqsRaw = formData.get('faqs') as string;
    if (faqsRaw !== null) {
      try { pkg.faqs = faqsRaw.trim() ? JSON.parse(faqsRaw) : null; } catch {}
    }
    const certificateDataRaw = formData.get('certificateData') as string;
    if (certificateDataRaw !== null) {
      try {
        let parsed = certificateDataRaw.trim() ? JSON.parse(certificateDataRaw) : null;
        if (parsed && parsed.providers && Array.isArray(parsed.providers)) {
          for (let i = 0; i < parsed.providers.length; i++) {
            const file = formData.get(`cert_provider_logo_${i}`) as File | null;
            const uploadedUrl = await saveLocalFile(file, 'certificates');
            if (uploadedUrl) parsed.providers[i].logo = uploadedUrl;
          }
        }
        pkg.certificateData = parsed;
      } catch { pkg.certificateData = null; }
    }

    await pkg.save();

    revalidatePath('/admin/packages');
    revalidatePath(`/admin/packages/${pkg.id}`);
    revalidatePath(`/packages/${pkg.slug}`);
    return { success: true };
  } catch (error) {
    console.error('Update package error:', error);
    return { error: 'Failed to update package' };
  }
}

export async function adminDeletePackage(packageId: string) {
  await requireAdmin();

  try {
    const pkg = await Package.findByPk(packageId);
    if (!pkg) return { error: 'Package not found' };

    await pkg.destroy();

    revalidatePath('/admin/packages');
    revalidatePath('/packages');
    return { success: true };
  } catch (error) {
    console.error('Delete package error:', error);
    return { error: 'Failed to delete package' };
  }
}

export async function adminCreateLiveClass(formData: FormData) {
  await requireAdmin();

  const packageId = formData.get('packageId') as string;
  let tutorId: string | undefined = formData.get('tutorId') as string;
  if (!tutorId || tutorId === '') tutorId = undefined;

  const title = formData.get('title') as string;
  const meetLink = formData.get('meetLink') as string;
  const startTimeStr = formData.get('startTime') as string;
  const duration = parseInt(formData.get('duration') as string, 10) || 60;

  if (!packageId || !title || !startTimeStr) return { error: 'Package, Title, and Start Time are required' };

  try {
    await LiveClass.create({
      packageId,
      tutorId,
      title,
      meetLink,
      startTime: new Date(startTimeStr),
      duration,
    });

    revalidatePath(`/admin/packages/edit/${packageId}`);
    return { success: true };
  } catch (error) {
    console.error('Create live class error:', error);
    return { error: 'Failed to create live class' };
  }
}

export async function adminDeleteLiveClass(classId: string, packageId: string) {
  await requireAdmin();

  try {
    const liveClass = await LiveClass.findByPk(classId);
    if (!liveClass) return { error: 'Live Class not found' };

    await liveClass.destroy();

    revalidatePath(`/admin/packages/edit/${packageId}`);
    return { success: true };
  } catch (error) {
    console.error('Delete live class error:', error);
    return { error: 'Failed to delete live class' };
  }
}

export async function adminUpdateLiveClass(classId: string, packageId: string, formData: FormData) {
  await requireAdmin();

  let tutorId: string | undefined = formData.get('tutorId') as string;
  if (!tutorId || tutorId === '') tutorId = undefined;

  const title = formData.get('title') as string;
  const meetLink = formData.get('meetLink') as string;
  const startTimeStr = formData.get('startTime') as string;
  const duration = parseInt(formData.get('duration') as string, 10) || 60;
  const status = formData.get('status') as 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

  if (!title || !startTimeStr) return { error: 'Title and Start Time are required' };

  try {
    const liveClass = await LiveClass.findByPk(classId);
    if (!liveClass) return { error: 'Live class not found' };

    liveClass.title = title;
    liveClass.meetLink = meetLink || '';
    liveClass.startTime = new Date(startTimeStr);
    liveClass.duration = duration;
    if (status) liveClass.status = status;
    // We must pass undefined instead of null to typescript depending on strictNullChecks, but let's use the any approach or just set it:
    liveClass.tutorId = tutorId as any;

    await liveClass.save();

    revalidatePath(`/admin/packages/edit/${packageId}`);
    return { success: true };
  } catch (error) {
    console.error('Update live class error:', error);
    return { error: 'Failed to update live class' };
  }
}

export async function tutorUpdateMeetLink(classId: string, meetLink: string) {
  const user = await requireAuth();
  if (user.role !== 'TUTOR') return { error: 'Unauthorized' };

  try {
    const liveClass = await LiveClass.findOne({ where: { id: classId, tutorId: user.id } });
    if (liveClass) {
      liveClass.meetLink = meetLink || '';
      await liveClass.save();
    } else {
      const availability = await TutorAvailability.findOne({ where: { id: classId, tutorId: user.id } });
      if (availability) {
        availability.meetLink = meetLink || '';
        await availability.save();
      } else {
        return { error: 'Live class or session not found or unauthorized' };
      }
    }

    revalidatePath('/tutor/classes');
    revalidatePath('/dashboard/courses');
    return { success: true };
  } catch (error) {
    console.error('Update meet link error:', error);
    return { error: 'Failed to update meet link' };
  }
}

export async function tutorUpdateClassStatus(classId: string, status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED') {
  const user = await requireAuth();
  if (user.role !== 'TUTOR' && user.role !== 'ADMIN') return { error: 'Unauthorized' };

  try {
    const liveClass = await LiveClass.findOne({ where: { id: classId, ...(user.role === 'TUTOR' ? { tutorId: user.id } : {}) } });
    if (liveClass) {
      liveClass.status = status;
      await liveClass.save();
      revalidatePath(`/admin/packages/edit/${liveClass.packageId}`);
    } else {
      const availability = await TutorAvailability.findOne({ where: { id: classId, ...(user.role === 'TUTOR' ? { tutorId: user.id } : {}) } });
      if (availability) {
        availability.status = status;
        await availability.save();
      } else {
        return { error: 'Live class or session not found or unauthorized' };
      }
    }

    revalidatePath('/tutor/classes');
    revalidatePath('/dashboard/courses');
    return { success: true };
  } catch (error) {
    console.error('Update class status error:', error);
    return { error: 'Failed to update class status' };
  }
}

// ==========================================
// 4. PUBLIC & OTHER ACTIONS
// ==========================================

export async function submitInquiryAction(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const message = (formData.get('message') as string) || 'Requesting callback';

  if (!name || !email || !phone) {
    return { error: 'Name, email, and phone are required' };
  }

  try {
    await Inquiry.create({
      name,
      email,
      phone,
      message,
      status: 'NEW',
    });

    // Notify the admin
    sendMail({
      to: 'anujguptaflymedia@gmail.com', // Using your email from .env
      subject: `New Contact Inquiry from ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #0f172a;">New Contact Inquiry</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Message:</strong></p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${message}</div>
        </div>
      `,
    }).catch((e: any) => console.error("Failed to send inquiry email:", e));

    // Send confirmation email to the user
    sendMail({
      to: email,
      subject: `Thank you for contacting Flymedia Technology!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #f97316;">Hi ${name},</h2>
          <p>Thank you for reaching out to us! We have received your inquiry.</p>
          <p>Our admissions team will review your message and get back to you within 24 hours.</p>
          <p><strong>Your Message:</strong></p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap; margin-bottom: 20px;">${message}</div>
          <p>Best regards,<br/>The Flymedia Technology Team</p>
        </div>
      `,
    }).catch((e: any) => console.error("Failed to send confirmation email to user:", e));

    return { success: true, message: 'Inquiry submitted successfully!' };
  } catch (error) {
    console.error('Inquiry submission error:', error);
    return { error: 'Failed to submit inquiry. Please try again.' };
  }
}

export async function submitTutorApplication(formData: FormData) {
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const expertise = formData.get('expertise') as string;
  const experience = formData.get('experience') as string;

  if (!fullName || !email || !phone || !expertise || !experience) {
    return { error: 'All fields are required.' };
  }

  try {
    const existing = await TutorApplication.findOne({ where: { email } });
    if (existing) {
      return { error: 'An application with this email already exists.' };
    }

    await TutorApplication.create({
      fullName,
      email,
      phone,
      expertise,
      experience,
      status: 'PENDING',
    });

    // Notify the admin
    sendMail({
      to: 'anujguptaflymedia@gmail.com',
      subject: `New Tutor Application: ${fullName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #0f172a;">New Tutor Application</h2>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Expertise:</strong> ${expertise}</p>
          <p><strong>Experience:</strong></p>
          <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${experience}</div>
        </div>
      `,
    }).catch((e: any) => console.error("Failed to send admin email for tutor application:", e));

    // Send confirmation email to the applicant
    sendMail({
      to: email,
      subject: `Application Received - Flymedia Technology`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #f97316;">Hi ${fullName},</h2>
          <p>Thank you for applying to be a tutor at Flymedia Technology!</p>
          <p>We have successfully received your application. Our team will review your profile and experience in <strong>${expertise}</strong>, and we'll get back to you soon regarding the next steps.</p>
          <p>Best regards,<br/>The Flymedia Technology Team</p>
        </div>
      `,
    }).catch((e: any) => console.error("Failed to send confirmation email to tutor applicant:", e));

    return { success: true };
  } catch (error) {
    console.error('Tutor application submission error:', error);
    return { error: 'Failed to submit application. Please try again.' };
  }
}

export async function approveTutorApplication(applicationId: string, formData?: FormData) {
  await requireAdmin();

  try {
    const application = await TutorApplication.findByPk(applicationId);
    if (!application) return { error: 'Application not found' };
    if (application.status !== 'PENDING') return { error: 'Application already processed' };

    application.status = 'APPROVED';
    await application.save();

    let user = await User.findOne({ where: { email: application.email } });
    if (!user) {
      user = await User.create({
        email: application.email,
        name: application.fullName,
        passwordHash: '',
        role: 'TUTOR',
      });
    } else {
      user.role = 'TUTOR';
      await user.save();
    }

    const rawToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const encoder = new TextEncoder();
    const data = encoder.encode(rawToken);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashedToken = Buffer.from(hashBuffer).toString('hex');

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await PasswordResetToken.create({
      userId: user.id,
      token: hashedToken,
      expiresAt,
    });

    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const setPasswordUrl = `${baseUrl}/reset-password?token=${rawToken}`;

    await sendTutorApprovalEmail(application.email, application.fullName, setPasswordUrl);

    revalidatePath('/admin/tutor-applications');
    return { success: true };
  } catch (error) {
    console.error('Approve tutor error:', error);
    return { error: 'Failed to approve application' };
  }
}

export async function rejectTutorApplication(applicationId: string, formData?: FormData) {
  await requireAdmin();

  try {
    const application = await TutorApplication.findByPk(applicationId);
    if (!application) return { error: 'Application not found' };

    application.status = 'REJECTED';
    await application.save();

    await sendTutorRejectionEmail(application.email, application.fullName);

    revalidatePath('/admin/tutor-applications');
    return { success: true };
  } catch (error) {
    console.error('Reject tutor error:', error);
    return { error: 'Failed to reject application' };
  }
}

export async function deleteTutorApplication(applicationId: string, formData?: FormData) {
  await requireAdmin();

  try {
    const application = await TutorApplication.findByPk(applicationId);
    if (!application) return { error: 'Application not found' };

    await application.destroy();

    revalidatePath('/admin/tutor-applications');
    return { success: true };
  } catch (error) {
    console.error('Delete tutor application error:', error);
    return { error: 'Failed to delete application' };
  }
}

export async function updateTutorProfile(formData: FormData) {
  const user = await requireAuth();
  if (user.role !== 'TUTOR') return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  const bio = formData.get('bio') as string;
  const trialExpectationsStr = formData.get('trialExpectations') as string;
  const avatarFile = formData.get('avatar') as File | null;

  try {
    const dbUser = await User.findByPk(user.id);
    if (!dbUser) return { error: 'User not found' };

    if (name) dbUser.name = name;
    if (bio !== null) dbUser.bio = bio;
    if (trialExpectationsStr !== null && trialExpectationsStr !== undefined) {
      dbUser.trialExpectations = trialExpectationsStr.split('\n').map(s => s.trim()).filter(Boolean);
    }

    if (avatarFile && avatarFile.size > 0) {
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeName = avatarFile.name.replace(/[^a-zA-Z0-9.-]/g, '');
      const uniqueName = `${user.id}-${Date.now()}-${safeName}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      try {
        await fs.promises.mkdir(uploadDir, { recursive: true });
      } catch (e) { }

      const filePath = path.join(uploadDir, uniqueName);
      await fs.promises.writeFile(filePath, buffer);

      dbUser.avatar = `/uploads/${uniqueName}`;
    }

    await dbUser.save();

    revalidatePath('/tutor/profile');
    return { success: true };
  } catch (error) {
    console.error('Update tutor profile error:', error);
    return { error: 'Failed to update profile' };
  }
}

// ==========================================
// 4. COUPON ACTIONS
// ==========================================

export async function adminCreateCoupon(formData: FormData) {
  await requireAdmin();

  const code = (formData.get('code') as string || '').trim().toUpperCase();
  const discountPercentage = parseInt(formData.get('discountPercentage') as string, 10);
  const expiresAtStr = formData.get('expiresAt') as string;

  if (!code || isNaN(discountPercentage)) {
    return { error: 'Coupon code and discount percentage are required.' };
  }

  try {
    const existing = await Coupon.findOne({ where: { code } });
    if (existing) {
      return { error: 'Coupon code already exists.' };
    }

    await Coupon.create({
      code,
      discountPercentage,
      expiresAt: expiresAtStr ? new Date(expiresAtStr) : null,
    });

    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error) {
    console.error('Create coupon error:', error);
    return { error: 'Failed to create coupon' };
  }
}

export async function adminDeleteCoupon(couponId: string) {
  await requireAdmin();

  try {
    const coupon = await Coupon.findByPk(couponId);
    if (!coupon) return { error: 'Coupon not found' };

    await coupon.destroy();
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error) {
    console.error('Delete coupon error:', error);
    return { error: 'Failed to delete coupon' };
  }
}

export async function adminUpdateCoupon(couponId: string, formData: FormData) {
  await requireAdmin();

  const code = (formData.get('code') as string || '').trim().toUpperCase();
  const discountPercentage = parseInt(formData.get('discountPercentage') as string, 10);
  const expiresAtStr = formData.get('expiresAt') as string;

  if (!code || isNaN(discountPercentage)) {
    return { error: 'Coupon code and discount percentage are required.' };
  }

  try {
    const coupon = await Coupon.findByPk(couponId);
    if (!coupon) return { error: 'Coupon not found' };

    if (coupon.code !== code) {
      const existing = await Coupon.findOne({ where: { code } });
      if (existing) {
        return { error: 'Coupon code already exists.' };
      }
    }

    coupon.code = code;
    coupon.discountPercentage = discountPercentage;
    coupon.expiresAt = expiresAtStr ? new Date(expiresAtStr) : null;

    await coupon.save();
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error) {
    console.error('Update coupon error:', error);
    return { error: 'Failed to update coupon' };
  }
}

// ==========================================
// 5. SEO ACTIONS
// ==========================================

export async function adminCreateSeo(formData: FormData) {
  await requireAdmin();

  let pagePath = (formData.get('pagePath') as string || '').trim();
  const title = (formData.get('title') as string || '').trim();
  const description = (formData.get('description') as string || '').trim();
  const keywords = (formData.get('keywords') as string || '').trim();
  const ogTitle = (formData.get('ogTitle') as string || '').trim();
  const ogDescription = (formData.get('ogDescription') as string || '').trim();
  const headerScript = (formData.get('headerScript') as string || '').trim();
  const footerScript = (formData.get('footerScript') as string || '').trim();

  if (!pagePath || !title || !description) {
    return { error: 'Path, Title, and Description are required.' };
  }

  // Allow 'GLOBAL' as a valid path without prefixing with '/'
  if (pagePath !== 'GLOBAL' && !pagePath.startsWith('/')) {
    pagePath = '/' + pagePath;
  }

  try {
    const existing = await SeoSetting.findOne({ where: { pagePath } });
    if (existing) {
      return { error: 'SEO setting for this path already exists.' };
    }

    await SeoSetting.create({
      pagePath,
      title,
      description,
      keywords: keywords || null,
      ogTitle: ogTitle || null,
      ogDescription: ogDescription || null,
      headerScript: headerScript || null,
      footerScript: footerScript || null,
    });

    revalidatePath('/admin/seo');
    revalidatePath(pagePath);
    return { success: true };
  } catch (error) {
    console.error('Create SEO error:', error);
    return { error: 'Failed to create SEO setting' };
  }
}

export async function adminUpdateSeo(seoId: string, formData: FormData) {
  await requireAdmin();

  let pagePath = (formData.get('pagePath') as string || '').trim();
  const title = (formData.get('title') as string || '').trim();
  const description = (formData.get('description') as string || '').trim();
  const keywords = (formData.get('keywords') as string || '').trim();
  const ogTitle = (formData.get('ogTitle') as string || '').trim();
  const ogDescription = (formData.get('ogDescription') as string || '').trim();
  const headerScript = (formData.get('headerScript') as string || '').trim();
  const footerScript = (formData.get('footerScript') as string || '').trim();

  if (!pagePath || !title || !description) {
    return { error: 'Path, Title, and Description are required.' };
  }

  if (pagePath !== 'GLOBAL' && !pagePath.startsWith('/')) {
    pagePath = '/' + pagePath;
  }

  try {
    const seo = await SeoSetting.findByPk(seoId);
    if (!seo) return { error: 'SEO setting not found' };

    if (seo.pagePath !== pagePath) {
      const existing = await SeoSetting.findOne({ where: { pagePath } });
      if (existing) {
        return { error: 'SEO setting for this path already exists.' };
      }
    }

    const oldPath = seo.pagePath;

    seo.pagePath = pagePath;
    seo.title = title;
    seo.description = description;
    seo.keywords = keywords || null;
    seo.ogTitle = ogTitle || null;
    seo.ogDescription = ogDescription || null;
    seo.headerScript = headerScript || null;
    seo.footerScript = footerScript || null;

    await seo.save();

    revalidatePath('/admin/seo');
    revalidatePath(oldPath);
    if (oldPath !== pagePath) revalidatePath(pagePath);

    return { success: true };
  } catch (error) {
    console.error('Update SEO error:', error);
    return { error: 'Failed to update SEO setting' };
  }
}

export async function adminDeleteSeo(seoId: string) {
  await requireAdmin();

  try {
    const seo = await SeoSetting.findByPk(seoId);
    if (!seo) return { error: 'SEO setting not found' };

    const pagePath = seo.pagePath;
    await seo.destroy();

    revalidatePath('/admin/seo');
    revalidatePath(pagePath);
    return { success: true };
  } catch (error) {
    console.error('Delete SEO error:', error);
    return { error: 'Failed to delete SEO setting' };
  }
}

export async function updateStudentProfile(formData: FormData) {
  const user = await requireAuth();

  const name = formData.get('name') as string;
  const bio = formData.get('bio') as string;
  const avatarFile = formData.get('avatar') as File | null;

  try {
    const dbUser = await User.findByPk(user.id);
    if (!dbUser) return { error: 'User not found' };

    if (name) dbUser.name = name;
    if (bio !== null) dbUser.bio = bio;

    if (avatarFile && avatarFile.size > 0) {
      const bytes = await avatarFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const safeName = avatarFile.name.replace(/[^a-zA-Z0-9.-]/g, '');
      const uniqueName = `student-${user.id}-${Date.now()}-${safeName}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      try {
        await fs.promises.mkdir(uploadDir, { recursive: true });
      } catch (e) { }

      const filePath = path.join(uploadDir, uniqueName);
      await fs.promises.writeFile(filePath, buffer);

      dbUser.avatar = `/uploads/${uniqueName}`;
    }

    await dbUser.save();

    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Update student profile error:', error);
    return { error: 'Failed to update profile' };
  }
}

export async function updateUserRole(userId: string, newRole: 'ADMIN' | 'STUDENT' | 'TUTOR') {
  const admin = await requireAdmin();
  if (admin.id === userId) {
    throw new Error('You cannot change your own role.');
  }
  const targetUser = await User.findByPk(userId);
  if (!targetUser) throw new Error('User not found');
  targetUser.role = newRole;
  await targetUser.save();
  revalidatePath('/admin/users');
}

export async function deleteUserAction(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) {
    throw new Error('Cannot delete yourself.');
  }

  const targetUser = await User.findByPk(userId);
  if (targetUser) {
    // Also delete any tutor application associated with this user's email
    await TutorApplication.destroy({ where: { email: targetUser.email } });
  }

  await User.destroy({ where: { id: userId } });
  revalidatePath('/admin/users');
}

export async function adminUpdateUser(userId: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as 'STUDENT' | 'TUTOR' | 'ADMIN';
  const password = formData.get('password') as string;
  const bio = formData.get('bio') as string;

  // Tutor fields
  const professionTitle = formData.get('professionTitle') as string;
  const rating = formData.get('rating') as string;
  const reviewsCount = formData.get('reviewsCount') as string;
  const studentsMentored = formData.get('studentsMentored') as string;
  const skillsStr = formData.get('skills') as string;

  if (!email || !role || !name) {
    return { error: 'Name, Email, and Role are required.' };
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) return { error: 'User not found' };

    // Check email uniqueness if email changed
    if (user.email !== email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return { error: 'A user with this email already exists.' };
      }
    }

    user.name = name;
    user.email = email;
    user.role = role;
    if (bio !== null && bio !== undefined) user.bio = bio;

    if (role === 'TUTOR') {
      if (professionTitle !== null && professionTitle !== undefined) user.professionTitle = professionTitle;
      if (rating) user.rating = parseFloat(rating);
      if (reviewsCount) user.reviewsCount = parseInt(reviewsCount, 10);
      if (studentsMentored) user.studentsMentored = parseInt(studentsMentored, 10);
      if (skillsStr !== null && skillsStr !== undefined) {
        user.skills = skillsStr.split(',').map(s => s.trim()).filter(Boolean);
      }
    }

    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    await user.save();

    revalidatePath('/admin/users');
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch (error) {
    console.error('Update user error:', error);
    return { error: 'Failed to update user' };
  }
}

export async function adminInviteUser(formData: FormData) {
  await requireAdmin();

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as 'STUDENT' | 'TUTOR' | 'ADMIN';
  const password = formData.get('password') as string;

  if (!email || !password || !role || !name) {
    return { error: 'Name, Email, Role, and Password are required.' };
  }

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return { error: 'A user with this email already exists.' };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({
      email,
      name,
      role,
      passwordHash,
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Invite user error:', error);
    return { error: 'Failed to invite user' };
  }
}

export async function deletePaymentAction(paymentId: string) {
  await requireAdmin();
  await Payment.destroy({ where: { id: paymentId } });
  revalidatePath('/admin/payments');
}

export async function submitTutorReview(formData: FormData) {
  const user = await requireAuth();

  if (user.role !== 'STUDENT') {
    return { error: 'Only students can write reviews' };
  }

  const tutorId = formData.get('tutorId') as string;
  const rating = parseInt(formData.get('rating') as string, 10);
  const comment = formData.get('comment') as string;

  if (!tutorId || !rating || !comment) {
    return { error: 'All fields are required' };
  }

  if (rating < 1 || rating > 5) {
    return { error: 'Rating must be between 1 and 5' };
  }

  try {
    const existingReview = await Review.findOne({
      where: { studentId: user.id, tutorId }
    });

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
    } else {
      await Review.create({
        studentId: user.id,
        tutorId,
        rating,
        comment
      });
    }

    revalidatePath(`/dashboard/tutors/${tutorId}`);
    return { success: true };
  } catch (error) {
    console.error('Submit review error:', error);
    return { error: 'Failed to submit review' };
  }
}

// ==========================================
// 5. ADMIN BLOG ACTIONS
// ==========================================

export async function adminCreateBlogPost(formData: FormData) {
  const admin = await requireAdmin();

  const title = formData.get('title') as string;
  const rawSlug = formData.get('slug') as string;
  const category = formData.get('category') as string;
  const excerpt = formData.get('excerpt') as string;
  const content = formData.get('content') as string;
  const readTime = formData.get('readTime') as string;
  const status = formData.get('status') as 'DRAFT' | 'PUBLISHED' || 'DRAFT';

  // SEO Fields
  const metaTitle = formData.get('metaTitle') as string || null;
  const metaDescription = formData.get('metaDescription') as string || null;
  const keywords = formData.get('keywords') as string || null;
  const ogTitle = formData.get('ogTitle') as string || null;
  const ogDescription = formData.get('ogDescription') as string || null;
  const headerScript = formData.get('headerScript') as string || null;
  const footerScript = formData.get('footerScript') as string || null;

  let finalImageUrl = 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80';

  const file = formData.get('imageFile') as File | null;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blogs');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    finalImageUrl = `/uploads/blogs/${fileName}`;
  } else {
    const urlInput = formData.get('imageUrl') as string;
    if (urlInput) {
      finalImageUrl = urlInput;
    }
  }

  if (!title || !category || !excerpt || !content) {
    return { error: 'Title, Category, Excerpt, and Content are required.' };
  }

  try {
    const slug = rawSlug ? slugify(rawSlug) : slugify(title);
    const existing = await BlogPost.findOne({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    await BlogPost.create({
      authorId: admin.id,
      title,
      slug: finalSlug,
      category,
      excerpt,
      content,
      readTime,
      image: finalImageUrl,
      status,
      metaTitle,
      metaDescription,
      keywords,
      ogTitle,
      ogDescription,
      headerScript,
      footerScript,
    });

    revalidatePath('/admin/blogs');
    revalidatePath('/blog');
    return { success: true };
  } catch (error) {
    console.error('Create blog post error:', error);
    return { error: 'Failed to create blog post' };
  }
}

export async function adminUpdateBlogPost(postId: string, formData: FormData) {
  await requireAdmin();

  const title = formData.get('title') as string;
  const rawSlug = formData.get('slug') as string;
  const category = formData.get('category') as string;
  const excerpt = formData.get('excerpt') as string;
  const content = formData.get('content') as string;
  const readTime = formData.get('readTime') as string;
  const status = formData.get('status') as 'DRAFT' | 'PUBLISHED' || 'DRAFT';

  // SEO Fields
  const metaTitle = formData.get('metaTitle') as string || null;
  const metaDescription = formData.get('metaDescription') as string || null;
  const keywords = formData.get('keywords') as string || null;
  const ogTitle = formData.get('ogTitle') as string || null;
  const ogDescription = formData.get('ogDescription') as string || null;
  const headerScript = formData.get('headerScript') as string || null;
  const footerScript = formData.get('footerScript') as string || null;

  let finalImageUrl = undefined;

  const file = formData.get('imageFile') as File | null;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blogs');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    finalImageUrl = `/uploads/blogs/${fileName}`;
  } else {
    const urlInput = formData.get('imageUrl') as string;
    if (urlInput) {
      finalImageUrl = urlInput;
    }
  }

  if (!title || !category || !excerpt || !content) {
    return { error: 'Title, Category, Excerpt, and Content are required.' };
  }

  try {
    const post = await BlogPost.findByPk(postId);
    if (!post) return { error: 'Blog post not found' };

    post.title = title;
    if (rawSlug) {
      const newSlug = slugify(rawSlug);
      if (newSlug !== post.slug) {
        const existing = await BlogPost.findOne({ where: { slug: newSlug } });
        post.slug = existing ? `${newSlug}-${Date.now().toString().slice(-4)}` : newSlug;
      }
    } else {
      if (post.title !== title) {
        const newSlug = slugify(title);
        const existing = await BlogPost.findOne({ where: { slug: newSlug } });
        post.slug = existing && existing.id !== post.id ? `${newSlug}-${Date.now().toString().slice(-4)}` : newSlug;
      }
    }
    
    post.category = category;
    post.excerpt = excerpt;
    post.content = content;
    post.readTime = readTime;
    post.status = status;
    if (finalImageUrl !== undefined) post.image = finalImageUrl;

    post.metaTitle = metaTitle;
    post.metaDescription = metaDescription;
    post.keywords = keywords;
    post.ogTitle = ogTitle;
    post.ogDescription = ogDescription;
    post.headerScript = headerScript;
    post.footerScript = footerScript;

    await post.save();

    revalidatePath('/admin/blogs');
    revalidatePath(`/admin/blogs/${post.id}`);
    revalidatePath('/blog');
    revalidatePath(`/blog/${post.slug}`);
    return { success: true };
  } catch (error) {
    console.error('Update blog post error:', error);
    return { error: 'Failed to update blog post' };
  }
}

export async function adminDeleteBlogPost(postId: string) {
  await requireAdmin();

  try {
    const post = await BlogPost.findByPk(postId);
    if (!post) return { error: 'Blog post not found' };

    await post.destroy();

    revalidatePath('/admin/blogs');
    revalidatePath('/blog');
    return { success: true };
  } catch (error) {
    console.error('Delete blog post error:', error);
    return { error: 'Failed to delete blog post' };
  }
}

// ==========================================
// 6. NEWSLETTER ACTIONS
// ==========================================

export async function subscribeNewsletterAction(formData: FormData) {
  const email = (formData.get('email') as string || '').trim().toLowerCase();

  if (!email) {
    return { error: 'Please enter a valid email address.' };
  }

  try {
    const existing = await NewsletterSubscriber.findOne({ where: { email } });
    if (existing) {
      return { success: true, message: 'You are already subscribed!' };
    }

    await NewsletterSubscriber.create({ email });
    return { success: true, message: 'Successfully subscribed to the newsletter!' };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

// ==========================================
// 7. ADMIN INQUIRY / LEAD ACTIONS
// ==========================================

export async function adminUpdateInquiryStatus(inquiryId: string, status: 'NEW' | 'CONTACTED' | 'RESOLVED') {
  await requireAdmin();
  try {
    const inquiry = await Inquiry.findByPk(inquiryId);
    if (!inquiry) return { error: 'Inquiry not found' };
    
    inquiry.status = status;
    await inquiry.save();
    
    revalidatePath('/admin/leads');
    return { success: true };
  } catch (error) {
    console.error('Update inquiry status error:', error);
    return { error: 'Failed to update status' };
  }
}

export async function adminDeleteInquiry(inquiryId: string) {
  await requireAdmin();
  try {
    const inquiry = await Inquiry.findByPk(inquiryId);
    if (!inquiry) return { error: 'Inquiry not found' };
    
    await inquiry.destroy();
    
    revalidatePath('/admin/leads');
    return { success: true };
  } catch (error) {
    console.error('Delete inquiry error:', error);
    return { error: 'Failed to delete inquiry' };
  }
}


