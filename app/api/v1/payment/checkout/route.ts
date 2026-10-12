import { NextResponse } from 'next/server';
import { Package, Enrollment, Payment, Coupon } from '../../../../../src/db/models';
import { getAuthUserFromRequest } from '../../auth/jwt';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: please sign in to complete payment' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { packageId, slug, courseTitle, paymentMethod = 'UPI', couponCode, paymentDetails } = body;

    let targetPackage = null;
    const packageAttributes = ['id', 'title', 'slug', 'price', 'category', 'status'] as any;
    if (packageId) {
      targetPackage = await Package.findByPk(packageId, { attributes: packageAttributes }).catch(() => null);
      if (!targetPackage) {
        targetPackage = await Package.findOne({ where: { slug: packageId }, attributes: packageAttributes });
      }
    }
    if (!targetPackage && slug) {
      targetPackage = await Package.findOne({ where: { slug }, attributes: packageAttributes });
    }
    if (!targetPackage && courseTitle) {
      targetPackage = await Package.findOne({
        where: { title: { [Op.like]: `%${String(courseTitle).trim()}%` } },
        attributes: packageAttributes,
      });
    }
    if (!targetPackage && (packageId || slug)) {
      const term = String(packageId || slug).trim();
      targetPackage = await Package.findOne({
        where: { title: { [Op.like]: `%${term}%` } },
        attributes: packageAttributes,
      });
    }

    if (!targetPackage) {
      return NextResponse.json(
        { success: false, error: 'Course package not found' },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: { userId: authUser.userId, packageId: targetPackage.id },
    });

    if (existingEnrollment) {
      return NextResponse.json({
        success: true,
        alreadyEnrolled: true,
        message: 'You are already enrolled in this course!',
        enrollmentId: existingEnrollment.id,
      });
    }

    // Calculate course amount
    const originalPrice = Number(targetPackage.price) || 0;
    let finalAmount = originalPrice;
    let appliedCoupon: any = null;

    if (couponCode && typeof couponCode === 'string') {
      const cleanCode = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ where: { code: cleanCode } });
      if (coupon && (!coupon.expiresAt || new Date(coupon.expiresAt) >= new Date())) {
        const discountAmt = Math.round((originalPrice * (coupon.discountPercentage || 0)) / 100);
        finalAmount = Math.max(0, originalPrice - discountAmt);
        appliedCoupon = {
          code: coupon.code,
          discountPercentage: coupon.discountPercentage,
          discountAmount: discountAmt,
        };
      }
    }

    // Generate unique transaction ID
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const transactionId = `TXN_${Date.now()}_${randomSuffix}`;

    // Record Payment
    const payment = await Payment.create({
      userId: authUser.userId,
      packageId: targetPackage.id,
      amount: finalAmount,
      transactionId,
      status: 'SUCCESS',
      provider: paymentMethod.toUpperCase(),
    });

    // Create Enrollment
    const enrollment = await Enrollment.create({
      userId: authUser.userId,
      packageId: targetPackage.id,
      enrolledAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully! Course enrolled.',
      transactionId,
      paymentId: payment.id,
      enrollmentId: enrollment.id,
      course: {
        id: targetPackage.id,
        title: targetPackage.title,
        slug: targetPackage.slug,
      },
      payment: {
        amount: finalAmount,
        originalPrice,
        method: paymentMethod,
        provider: paymentMethod.toUpperCase(),
        appliedCoupon,
        date: new Date().toISOString(),
        details: paymentDetails || {},
      },
    });
  } catch (error: any) {
    console.error('Error during course checkout:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Payment processing failed. Please try again.' },
      { status: 500 }
    );
  }
}
