import { NextResponse } from 'next/server';
import { PartnerApplication } from '../../../../src/db/models';
import {
  sendPartnerApplicationAdminNotification,
  sendPartnerApplicationApplicantConfirmation,
} from '../../../../src/lib/mailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type,
      organizationName,
      category,
      contactPerson,
      designation,
      email,
      phone,
      alternatePhone,
      website,
      city,
      state,
      studentCount,
      interestAreas,
      registrationNumber,
      message,
    } = body;

    if (!organizationName || !contactPerson || !designation || !email || !phone || !city || !state || !studentCount) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields marked with *.' },
        { status: 400 }
      );
    }

    const application = await PartnerApplication.create({
      type: type === 'CHARITY' ? 'CHARITY' : 'COLLEGE',
      organizationName: organizationName.trim(),
      category: category?.trim() || null,
      contactPerson: contactPerson.trim(),
      designation: designation.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      alternatePhone: alternatePhone?.trim() || null,
      website: website?.trim() || null,
      city: city.trim(),
      state: state.trim(),
      studentCount: studentCount.trim(),
      interestAreas: Array.isArray(interestAreas) ? interestAreas.join(', ') : (interestAreas?.trim() || null),
      registrationNumber: registrationNumber?.trim() || null,
      message: message?.trim() || null,
      status: 'PENDING',
    });

    // Notify configured admins & superadmins
    sendPartnerApplicationAdminNotification({
      id: application.id,
      type: application.type,
      organizationName: application.organizationName,
      category: application.category,
      contactPerson: application.contactPerson,
      designation: application.designation,
      email: application.email,
      phone: application.phone,
      alternatePhone: application.alternatePhone,
      city: application.city,
      state: application.state,
      studentCount: application.studentCount,
      interestAreas: application.interestAreas,
      registrationNumber: application.registrationNumber,
      message: application.message,
    }).catch((err) => console.error('Failed to send admin notification for partnership:', err));

    // Send confirmation to applicant
    sendPartnerApplicationApplicantConfirmation({
      type: application.type,
      organizationName: application.organizationName,
      contactPerson: application.contactPerson,
      email: application.email,
    }).catch((err) => console.error('Failed to send confirmation to partner applicant:', err));

    const successMessage =
      application.type === 'COLLEGE'
        ? `Proposal received! Our Academic Partnership Dean will connect with ${application.organizationName} shortly to activate student benefits.`
        : `Proposal received! We are honored to partner with ${application.organizationName} to provide 100% free education to your students.`;

    return NextResponse.json({
      success: true,
      message: successMessage,
      data: { id: application.id },
    });
  } catch (error: any) {
    console.error('API Error in /api/v1/partnerships:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to submit partnership application' },
      { status: 500 }
    );
  }
}
