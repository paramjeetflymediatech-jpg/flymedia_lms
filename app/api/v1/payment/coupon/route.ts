import { NextResponse } from 'next/server';
import { Coupon } from '../../../../../src/db/models';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, amount } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, valid: false, error: 'Please enter a valid coupon code' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase();
    const originalAmount = Number(amount) || 0;

    // Look for coupon in DB
    let coupon = await Coupon.findOne({
      where: {
        code: cleanCode,
      },
    });

    // If no coupon in DB, seed common welcome coupon for testing
    if (!coupon && cleanCode === 'FLYSCHOOL20') {
      coupon = await Coupon.create({
        code: 'FLYSCHOOL20',
        discountPercentage: 20,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });
    } else if (!coupon && cleanCode === 'WELCOME50') {
      coupon = await Coupon.create({
        code: 'WELCOME50',
        discountPercentage: 50,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });
    }

    if (!coupon) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: `Coupon "${cleanCode}" is invalid or does not exist. Try "FLYSCHOOL20" or "WELCOME50".`,
      });
    }

    // Check expiration
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: `Coupon "${cleanCode}" has expired.`,
      });
    }

    const discountPercentage = coupon.discountPercentage || 0;
    const discountAmount = Math.round((originalAmount * discountPercentage) / 100);
    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return NextResponse.json({
      success: true,
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountPercentage,
      },
      originalAmount,
      discountAmount,
      finalAmount,
      message: `Coupon applied! ${discountPercentage}% discount granted.`,
    });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { success: false, valid: false, error: error.message || 'Failed to validate coupon' },
      { status: 500 }
    );
  }
}
