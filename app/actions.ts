'use server';

import fs from 'fs';
import path from 'path';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { User, Course, Module, Lesson, Enrollment, Progress, Certificate, Inquiry, PasswordResetToken, Payment, Coupon } from '../src/db/models';
import { loginUser, logoutUser, getCurrentUser, requireAuth, requireAdmin } from '../src/lib/auth';
import { sendPasswordResetEmail } from '../src/lib/mailer';

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
    
    redirectUrl = user.role === 'ADMIN' ? '/admin' : '/dashboard';
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
      // 1. Generate a secure random token
      const rawToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');

      // 2. Hash it before storing (so a DB leak can't be used directly)
      const encoder = new TextEncoder();
      const data = encoder.encode(rawToken);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashedToken = Buffer.from(hashBuffer).toString('hex');

      // 3. Store hashed token in DB (expire in 1 hour)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await PasswordResetToken.create({
        userId: user.id,
        token: hashedToken,
        expiresAt,
      });

      // 4. Build reset URL with RAW token (user needs the raw one)
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}reset-password?token=${rawToken}`;

      // 5. Send the email
      await sendPasswordResetEmail(email, user.name || 'Student', resetUrl);
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    // Still return success — don't leak info about errors
  }

  // Always return success to prevent email enumeration
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
    // Hash the incoming raw token to compare against the stored hash
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(rawToken));
    const hashedToken = Buffer.from(hashBuffer).toString('hex');

    const record = await PasswordResetToken.findOne({ where: { token: hashedToken } });

    if (!record) return { error: 'This reset link is invalid or has already been used.' };
    if (record.used) return { error: 'This reset link has already been used.' };
    if (new Date() > record.expiresAt) return { error: 'This reset link has expired. Please request a new one.' };

    // Update password
    const user = await User.findByPk(record.userId);
    if (!user) return { error: 'Account not found.' };

    user.passwordHash = await bcrypt.hash(password, 10);
    await user.save();

    // Mark token as used
    record.used = true;
    await record.save();

    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }
}

// ==========================================
// 2. STUDENT LEARNING ACTIONS
// ==========================================

export async function enrollInCourse(courseId: string) {
  const user = await requireAuth();

  try {
    const existing = await Enrollment.findOne({
      where: { userId: user.id, courseId },
    });

    if (existing) {
      return { success: true, message: 'Already enrolled' };
    }

    await Enrollment.create({
      userId: user.id,
      courseId,
    });

    revalidatePath('/dashboard');
    revalidatePath(`/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error('Enrollment error:', error);
    return { error: 'Failed to enroll in course' };
  }
}

export async function toggleLessonProgress(lessonId: string, completed: boolean) {
  const user = await requireAuth();

  try {
    const [progressRecord, created] = await Progress.findOrCreate({
      where: { userId: user.id, lessonId },
      defaults: { completed },
    });

    if (!created) {
      progressRecord.completed = completed;
      await progressRecord.save();
    }

    // Retrieve course ID to check if certificate is ready
    const lesson = await Lesson.findByPk(lessonId, {
      include: [{ model: Module, include: [Course] }],
    });

    if (lesson && (lesson as any).Module?.Course) {
      const course = (lesson as any).Module.Course;
      revalidatePath(`/dashboard/courses/${course.slug}`);
      revalidatePath(`/courses/${course.slug}`);
    }

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Progress toggle error:', error);
    return { error: 'Failed to update progress' };
  }
}

// ==========================================
// 3. ADMIN MANAGEMENT ACTIONS
// ==========================================

export async function adminCreateCourse(formData: FormData) {
  await requireAdmin();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const duration = Number(formData.get('duration') || 0);
  const level = formData.get('level') as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  const price = formData.get('price') ? Number(formData.get('price')) : null;
  
  let finalThumbnailUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
  
  const file = formData.get('thumbnailFile') as File | null;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'courses');
    
    // Ensure dir exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    finalThumbnailUrl = `/uploads/courses/${fileName}`;
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
    const existing = await Course.findOne({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    await Course.create({
      title,
      slug: finalSlug,
      description,
      duration,
      level,
      price,
      thumbnail: finalThumbnailUrl,
    });

    revalidatePath('/admin');
    revalidatePath('/courses');
    return { success: true };
  } catch (error) {
    console.error('Create course error:', error);
    return { error: 'Failed to create course' };
  }
}

export async function adminUpdateCourse(courseId: string, formData: FormData) {
  await requireAdmin();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const duration = Number(formData.get('duration') || 0);
  const level = formData.get('level') as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  const price = formData.get('price') ? Number(formData.get('price')) : null;
  
  let finalThumbnailUrl = undefined;
  
  const file = formData.get('thumbnailFile') as File | null;
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'courses');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    finalThumbnailUrl = `/uploads/courses/${fileName}`;
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
    const course = await Course.findByPk(courseId);
    if (!course) return { error: 'Course not found' };

    course.title = title;
    course.description = description;
    course.duration = duration;
    course.level = level;
    if (price !== undefined) course.price = price;
    if (finalThumbnailUrl !== undefined) course.thumbnail = finalThumbnailUrl;

    await course.save();

    revalidatePath('/admin');
    revalidatePath(`/courses/${course.slug}`);
    return { success: true };
  } catch (error) {
    console.error('Update course error:', error);
    return { error: 'Failed to update course' };
  }
}

export async function adminDeleteCourse(courseId: string) {
  await requireAdmin();

  try {
    const course = await Course.findByPk(courseId);
    if (!course) return { error: 'Course not found' };

    await course.destroy();

    revalidatePath('/admin');
    revalidatePath('/courses');
    return { success: true };
  } catch (error) {
    console.error('Delete course error:', error);
    return { error: 'Failed to delete course' };
  }
}

export async function adminCreateModule(courseId: string, title: string, order: number) {
  await requireAdmin();

  if (!title) return { error: 'Module title is required' };

  try {
    await Module.create({
      courseId,
      title,
      order,
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Create module error:', error);
    return { error: 'Failed to create module' };
  }
}

export async function adminDeleteModule(moduleId: string) {
  await requireAdmin();

  try {
    const mod = await Module.findByPk(moduleId);
    if (!mod) return { error: 'Module not found' };

    await mod.destroy();

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Delete module error:', error);
    return { error: 'Failed to delete module' };
  }
}

export async function adminCreateLesson(moduleId: string, title: string, type: 'VIDEO' | 'TEXT' | 'PDF' | 'QUIZ', content: string, order: number) {
  await requireAdmin();

  if (!title || !content) return { error: 'Lesson title and content are required' };

  try {
    await Lesson.create({
      moduleId,
      title,
      type,
      content,
      order,
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Create lesson error:', error);
    return { error: 'Failed to create lesson' };
  }
}

export async function adminDeleteLesson(lessonId: string) {
  await requireAdmin();

  try {
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) return { error: 'Lesson not found' };

    await lesson.destroy();

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Delete lesson error:', error);
    return { error: 'Failed to delete lesson' };
  }
}

// ==========================================
// 4. PUBLIC ACTIONS
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

    return { success: true, message: 'Inquiry submitted successfully!' };
  } catch (error) {
    console.error('Inquiry submission error:', error);
    return { error: 'Failed to submit inquiry. Please try again.' };
  }
}

export async function updateUserRole(userId: string, newRole: 'ADMIN' | 'STUDENT') {
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
  await User.destroy({ where: { id: userId } });
  revalidatePath('/admin/users');
}

export async function deletePaymentAction(paymentId: string) {
  await requireAdmin();
  await Payment.destroy({ where: { id: paymentId } });
  revalidatePath('/admin/payments');
}

export async function adminCreateCoupon(formData: FormData) {
  await requireAdmin();
  const code = formData.get('code') as string;
  const discountPercentage = Number(formData.get('discountPercentage') || 0);
  
  if (!code || !discountPercentage) {
    return { error: 'Code and Discount Percentage are required.' };
  }

  try {
    await Coupon.create({
      code: code.toUpperCase(),
      discountPercentage,
    });
    revalidatePath('/admin/coupons');
    return { success: true };
  } catch (error: any) {
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return { error: 'Coupon code already exists.' };
    }
    return { error: 'Failed to create coupon.' };
  }
}

export async function adminDeleteCoupon(couponId: string) {
  await requireAdmin();
  await Coupon.destroy({ where: { id: couponId } });
  revalidatePath('/admin/coupons');
}

