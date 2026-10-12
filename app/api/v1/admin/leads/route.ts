import { NextResponse } from 'next/server';
import { Inquiry } from '../../../../../src/db/models';
import { getAuthUserFromRequest } from '../../auth/jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authPayload = await getAuthUserFromRequest(request);
    if (!authPayload || authPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const leads = await Inquiry.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    return NextResponse.json({
      success: true,
      leads,
    });
  } catch (error: any) {
    console.error('Admin leads GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const authPayload = await getAuthUserFromRequest(request);
    if (!authPayload || authPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Lead ID and status are required' },
        { status: 400 }
      );
    }

    const lead = await Inquiry.findByPk(id);
    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    lead.status = status;
    await lead.save();

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      lead,
    });
  } catch (error: any) {
    console.error('Admin leads PATCH error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update lead' },
      { status: 500 }
    );
  }
}
