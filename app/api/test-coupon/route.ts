import { NextResponse } from 'next/server';
import { Coupon } from '../../../src/db/models';

export async function GET() {
  try {
    const coupons = await Coupon.findAll();
    return NextResponse.json({ success: true, coupons });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack });
  }
}
