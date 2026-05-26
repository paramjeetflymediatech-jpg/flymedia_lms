'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { User, Course, Module, Lesson, Enrollment, Progress, Certificate } from '../src/db/models';
import { loginUser, logoutUser, getCurrentUser, requireAuth, requireAdmin } from '../src/lib/auth';

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
  } catch (error: any) {
    console.error('Login error:', error);
    return { error: 'Something went wrong. Please try again.' };
  }

  redirect('/dashboard');
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
  const thumbnail = formData.get('thumbnail') as string || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';

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
      thumbnail,
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
  const thumbnail = formData.get('thumbnail') as string || undefined;

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
    if (thumbnail !== undefined) course.thumbnail = thumbnail;

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
