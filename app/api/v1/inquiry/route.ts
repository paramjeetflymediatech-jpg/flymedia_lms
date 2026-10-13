import { NextResponse } from 'next/server';
import { Inquiry } from '../../../../src/db/models';
import { sendMail, getAdminReceivers } from '../../../../src/lib/mailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, course, message } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    const inquiry = await Inquiry.create({
      name,
      phone,
      email: email || `${phone}@mobilelead.com`,
      message: course ? `[Course: ${course}] ${message || 'Callback requested via Mobile App'}` : (message || 'Callback requested via Mobile App'),
      status: 'NEW',
    });

    // Notify configured admin receivers from env
    const adminReceivers = getAdminReceivers();
    if (adminReceivers.length > 0) {
      sendMail({
        to: adminReceivers,
        subject: `New Inquiry from Mobile App: ${name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2 style="color: #0f172a;">New Inquiry Received (Mobile App)</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Email:</strong> ${email || 'Not provided'}</p>
            ${course ? `<p><strong>Course / Interest:</strong> ${course}</p>` : ''}
            <p><strong>Message:</strong></p>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${message || 'Callback requested via Mobile App'}</div>
          </div>
        `,
      }).catch((e: any) => console.error("Failed to send mobile inquiry email:", e));
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry registered successfully',
      data: { id: inquiry.id },
    });
  } catch (error: any) {
    console.error('API Error in /api/v1/inquiry:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}
