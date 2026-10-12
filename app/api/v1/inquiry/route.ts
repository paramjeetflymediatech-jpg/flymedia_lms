import { NextResponse } from 'next/server';
import { Inquiry } from '../../../../src/db/models';

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
