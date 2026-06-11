'use server';

import fs from 'fs';
import path from 'path';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { User, Package, LiveClass, Enrollment, Certificate, Inquiry, PasswordResetToken, Payment, Coupon, TutorApplication } from '../src/db/models';
import { loginUser, logoutUser, getCurrentUser, requireAuth, requireAdmin } from '../src/lib/auth';
import { sendPasswordResetEmail, sendTutorApprovalEmail, sendMail } from '../src/lib/mailer';

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

// ==========================================
// 3. ADMIN MANAGEMENT ACTIONS
// ==========================================

export async function adminCreatePackage(formData: FormData) {
  await requireAdmin();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price') ? Number(formData.get('price')) : null;

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

    await Package.create({
      title,
      slug: finalSlug,
      description,
      price,
      thumbnail: finalThumbnailUrl,
      status: 'DRAFT',
    });

    revalidatePath('/admin/packages');
    return { success: true };
  } catch (error) {
    console.error('Create package error:', error);
    return { error: 'Failed to create package' };
  }
}

export async function adminUpdatePackage(packageId: string, formData: FormData) {
  await requireAdmin();

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price') ? Number(formData.get('price')) : null;
  const status = formData.get('status') as 'DRAFT' | 'PUBLISHED' || 'DRAFT';

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
    pkg.status = status;
    if (price !== null && price !== undefined) pkg.price = price;
    if (finalThumbnailUrl !== undefined) pkg.thumbnail = finalThumbnailUrl;

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

    revalidatePath(`/admin/packages/${packageId}`);
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

    revalidatePath(`/admin/packages/${packageId}`);
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

  if (!title || !startTimeStr) return { error: 'Title and Start Time are required' };

  try {
    const liveClass = await LiveClass.findByPk(classId);
    if (!liveClass) return { error: 'Live class not found' };

    liveClass.title = title;
    liveClass.meetLink = meetLink || '';
    liveClass.startTime = new Date(startTimeStr);
    liveClass.duration = duration;
    // We must pass undefined instead of null to typescript depending on strictNullChecks, but let's use the any approach or just set it:
    liveClass.tutorId = tutorId as any;

    await liveClass.save();

    revalidatePath(`/admin/packages/${packageId}`);
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
    if (!liveClass) return { error: 'Live class not found or unauthorized' };

    liveClass.meetLink = meetLink || '';
    await liveClass.save();

    revalidatePath('/tutor/classes');
    return { success: true };
  } catch (error) {
    console.error('Update meet link error:', error);
    return { error: 'Failed to update meet link' };
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
      to: 'amandeepkumar.flymediatech@gmail.com', // Using your email from .env
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
      to: 'amandeepkumar.flymediatech@gmail.com',
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

export async function approveTutorApplication(applicationId: string) {
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

export async function rejectTutorApplication(applicationId: string) {
  await requireAdmin();

  try {
    const application = await TutorApplication.findByPk(applicationId);
    if (!application) return { error: 'Application not found' };

    application.status = 'REJECTED';
    await application.save();

    revalidatePath('/admin/tutor-applications');
    return { success: true };
  } catch (error) {
    console.error('Reject tutor error:', error);
    return { error: 'Failed to reject application' };
  }
}

export async function deleteTutorApplication(applicationId: string) {
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
      name,
      email,
      role,
      passwordHash,
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Invite user error:', error);
    return { error: 'Failed to create user.' };
  }
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
