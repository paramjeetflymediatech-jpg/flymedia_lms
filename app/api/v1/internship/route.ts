import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { InternshipApplication } from '../../../../src/db/models';
import {
  sendInternshipApplicationAdminNotification,
  sendInternshipStudentConfirmationEmail,
} from '../../../../src/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let fullName = '';
    let email = '';
    let phone = '';
    let college = '';
    let qualification = '';
    let yearOfStudy = '';
    let domain = '';
    let duration = '';
    let mode: 'CAMPUS' | 'ONLINE' | 'HYBRID' = 'HYBRID';
    let startDate: string | null = null;
    let resumeUrl: string | null = null;
    let portfolioUrl: string | null = null;
    let city: string | null = null;
    let state: string | null = null;
    let message: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();

      fullName = (formData.get('fullName') as string)?.trim() || '';
      email = (formData.get('email') as string)?.trim()?.toLowerCase() || '';
      phone = (formData.get('phone') as string)?.trim() || '';
      college = (formData.get('college') as string)?.trim() || '';
      qualification = (formData.get('qualification') as string)?.trim() || '';
      yearOfStudy = (formData.get('yearOfStudy') as string)?.trim() || '';
      domain = (formData.get('domain') as string)?.trim() || '';
      duration = (formData.get('duration') as string)?.trim() || '';
      const rawMode = (formData.get('mode') as string)?.trim()?.toUpperCase() || 'HYBRID';
      mode = ['CAMPUS', 'ONLINE', 'HYBRID'].includes(rawMode)
        ? (rawMode as 'CAMPUS' | 'ONLINE' | 'HYBRID')
        : 'HYBRID';
      startDate = (formData.get('startDate') as string)?.trim() || null;
      portfolioUrl = (formData.get('portfolioUrl') as string)?.trim() || null;
      city = (formData.get('city') as string)?.trim() || null;
      state = (formData.get('state') as string)?.trim() || null;
      message = (formData.get('message') as string)?.trim() || null;
      resumeUrl = (formData.get('resumeUrl') as string)?.trim() || null;

      // Handle PDF file upload
      const file = formData.get('resumeFile') as File | null;
      if (file && typeof file.size === 'number' && file.size > 0) {
        // Check format (must be PDF)
        const isPdf =
          file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
        if (!isPdf) {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid file format. Resume must be in PDF format (.pdf).',
            },
            { status: 400 }
          );
        }

        // Check file size (100 KB to 200 KB)
        const minBytes = 100 * 1024; // 102,400 bytes
        const maxBytes = 200 * 1024; // 204,800 bytes
        if (file.size < minBytes || file.size > maxBytes) {
          const sizeKb = (file.size / 1024).toFixed(1);
          return NextResponse.json(
            {
              success: false,
              error: `Resume PDF size must be between 100 KB and 200 KB. Your uploaded file is ${sizeKb} KB.`,
            },
            { status: 400 }
          );
        }

        // Save PDF to public/uploads/resumes
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = path.join(uploadDir, safeName);
        const arrayBuffer = await file.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
        resumeUrl = `/uploads/resumes/${safeName}`;
      }
    } else {
      const body = await req.json();

      fullName = body.fullName?.trim() || '';
      email = body.email?.trim()?.toLowerCase() || '';
      phone = body.phone?.trim() || '';
      college = body.college?.trim() || '';
      qualification = body.qualification?.trim() || '';
      yearOfStudy = body.yearOfStudy?.trim() || '';
      domain = body.domain?.trim() || '';
      duration = body.duration?.trim() || '';
      const rawMode = body.mode?.trim()?.toUpperCase() || 'HYBRID';
      mode = ['CAMPUS', 'ONLINE', 'HYBRID'].includes(rawMode)
        ? (rawMode as 'CAMPUS' | 'ONLINE' | 'HYBRID')
        : 'HYBRID';
      startDate = body.startDate?.trim() || null;
      resumeUrl = body.resumeUrl?.trim() || null;
      portfolioUrl = body.portfolioUrl?.trim() || null;
      city = body.city?.trim() || null;
      state = body.state?.trim() || null;
      message = body.message?.trim() || null;
    }

    if (!fullName || !email || !phone || !college || !qualification || !yearOfStudy || !domain || !duration) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields marked with *.' },
        { status: 400 }
      );
    }

    if (!email.includes('@') || !email.includes('.')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    try {
      await InternshipApplication.sync({ alter: true });
    } catch (sErr) {
      console.warn('InternshipApplication sync warning:', sErr);
    }

    const application = await InternshipApplication.create({
      fullName,
      email,
      phone,
      college,
      qualification,
      yearOfStudy,
      domain,
      duration,
      mode,
      startDate,
      resumeUrl,
      portfolioUrl,
      city,
      state,
      message,
      status: 'PENDING',
    });

    // Notify admins
    sendInternshipApplicationAdminNotification({
      id: application.id,
      fullName,
      email,
      phone,
      college,
      qualification,
      yearOfStudy,
      domain,
      duration,
      mode,
      startDate,
      resumeUrl,
      portfolioUrl,
      city,
      state,
      message,
    }).catch((err) => console.error('Failed to send admin notification for internship:', err));

    // Notify student
    sendInternshipStudentConfirmationEmail({
      fullName,
      email,
      domain,
      duration,
      mode,
    }).catch((err) => console.error('Failed to send student confirmation email for internship:', err));

    return NextResponse.json({
      success: true,
      message: 'Your internship application has been submitted successfully! Our admissions counselor will contact you shortly.',
      id: application.id,
      resumeUrl,
    });
  } catch (error: any) {
    console.error('API Error submitting internship application:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error processing application.' },
      { status: 500 }
    );
  }
}
