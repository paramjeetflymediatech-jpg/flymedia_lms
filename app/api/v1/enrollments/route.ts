import { NextResponse } from 'next/server';
import { Enrollment, Package, LiveClass, Payment } from '../../../../src/db/models';
import { getAuthUserFromRequest } from '../auth/jwt';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: please log in to view enrollments' },
        { status: 401 }
      );
    }

    const enrollmentsData = await Enrollment.findAll({
      where: { userId: authUser.userId },
      include: [
        {
          model: Package,
          attributes: ['id', 'title', 'slug', 'category', 'thumbnail', 'duration', 'courseModules'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const formatted = enrollmentsData.map(enr => {
      const pkg = (enr as any).Package;
      const totalLessons = pkg?.courseModules
        ? pkg.courseModules.reduce((acc: number, m: any) => acc + (m.topics?.length || 0), 0)
        : 20;

      return {
        id: enr.id,
        courseId: pkg?.slug || pkg?.id || enr.packageId,
        courseTitle: pkg?.title || 'Enrolled Course',
        thumbnail: pkg?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
        category: pkg?.category || 'Web Development',
        enrolledAt: enr.enrolledAt ? new Date(enr.enrolledAt).toISOString().split('T')[0] : 'Recent',
        progressPercent: enr.completedAt ? 100 : 25,
        completedLessons: enr.completedAt ? totalLessons : 5,
        totalLessons: totalLessons || 20,
        nextLiveClass: 'Scheduled with senior mentor',
        certificateReady: !!enr.completedAt,
      };
    });

    return NextResponse.json({
      success: true,
      enrollments: formatted,
    });
  } catch (error: any) {
    console.error('Error in /api/v1/enrollments:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: please sign in to enroll' },
        { status: 401 }
      );
    }

    const { packageId, slug, courseTitle } = await request.json();
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
    const existing = await Enrollment.findOne({
      where: { userId: authUser.userId, packageId: targetPackage.id },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Already enrolled in this course',
        enrollmentId: existing.id,
      });
    }

    // For paid courses, enforce that user must purchase via the payment API
    const isPaid = targetPackage.price && Number(targetPackage.price) > 0;
    if (isPaid) {
      const verifiedPayment = await Payment.findOne({
        where: {
          userId: authUser.userId,
          packageId: targetPackage.id,
          status: 'SUCCESS',
        },
      });

      if (!verifiedPayment) {
        return NextResponse.json(
          {
            success: false,
            requirePayment: true,
            error: `This course requires payment of ₹${Number(targetPackage.price).toLocaleString('en-IN')}. Please purchase this course via the payment API.`,
          },
          { status: 402 }
        );
      }
    }

    const newEnrollment = await Enrollment.create({
      userId: authUser.userId,
      packageId: targetPackage.id,
      enrolledAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Enrollment successful',
      enrollmentId: newEnrollment.id,
    });
  } catch (error: any) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to enroll' },
      { status: 500 }
    );
  }
}
