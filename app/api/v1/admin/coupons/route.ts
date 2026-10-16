import { NextResponse } from 'next/server';
import { Coupon } from '../../../../../src/db/models';
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

    const coupons = await Coupon.findAll({
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (error: any) {
    console.error('Admin coupons GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch coupons' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authPayload = await getAuthUserFromRequest(request);
    if (!authPayload || authPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { code, discountPercent, discountAmount, maxUses } = await request.json();
    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase().trim(),
      discountPercentage: discountPercent ? Number(discountPercent) : 10,
    });

    return NextResponse.json({
      success: true,
      coupon,
    });
  } catch (error: any) {
    console.error('Admin coupon create error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create coupon' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  return handleUpdateCoupon(request);
}

export async function PATCH(request: Request) {
  return handleUpdateCoupon(request);
}

async function handleUpdateCoupon(request: Request) {
  try {
    const authPayload = await getAuthUserFromRequest(request);
    if (!authPayload || authPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { id, code, discountPercent, discountPercentage } = await request.json();
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    if (code) {
      coupon.code = code.toUpperCase().trim();
    }
    const finalDiscount = discountPercent !== undefined ? discountPercent : discountPercentage;
    if (finalDiscount !== undefined) {
      coupon.discountPercentage = Number(finalDiscount);
    }

    await coupon.save();

    return NextResponse.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon,
    });
  } catch (error: any) {
    console.error('Admin coupon update error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update coupon' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const authPayload = await getAuthUserFromRequest(request);
    if (!authPayload || authPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Coupon ID is required' },
        { status: 400 }
      );
    }

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    await coupon.destroy();

    return NextResponse.json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error: any) {
    console.error('Admin coupon delete error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete coupon' },
      { status: 500 }
    );
  }
}

