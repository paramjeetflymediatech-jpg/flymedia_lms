import { NextResponse } from 'next/server';
import { Enrollment, Package, LiveClass } from '../../../../src/db/models';
import { getAuthUserFromRequest } from '../auth/jwt';

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

    const { packageId, slug } = await request.json();
    let targetPackage = null;

    if (packageId) {
      targetPackage = await Package.findByPk(packageId);
    }
    if (!targetPackage && slug) {
      targetPackage = await Package.findOne({ where: { slug } });
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
