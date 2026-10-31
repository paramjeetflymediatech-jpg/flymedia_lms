import { NextRequest, NextResponse } from 'next/server';
import { InternshipApplication } from '../../../../src/db/models';
import {
  sendInternshipApplicationAdminNotification,
  sendInternshipStudentConfirmationEmail,
} from '../../../../src/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const fullName = body.fullName?.trim();
    const email = body.email?.trim()?.toLowerCase();
    const phone = body.phone?.trim();
    const college = body.college?.trim();
    const qualification = body.qualification?.trim();
    const yearOfStudy = body.yearOfStudy?.trim();
    const domain = body.domain?.trim();
    const duration = body.duration?.trim();
    const mode = (body.mode?.trim()?.toUpperCase() || 'HYBRID') as 'CAMPUS' | 'ONLINE' | 'HYBRID';
    const startDate = body.startDate?.trim() || null;
    const resumeUrl = body.resumeUrl?.trim() || null;
    const portfolioUrl = body.portfolioUrl?.trim() || null;
    const city = body.city?.trim() || null;
    const state = body.state?.trim() || null;
    const message = body.message?.trim() || null;

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
      mode: ['CAMPUS', 'ONLINE', 'HYBRID'].includes(mode) ? mode : 'HYBRID',
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
    });
  } catch (error: any) {
    console.error('API Error submitting internship application:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error processing application.' },
      { status: 500 }
    );
  }
}

