import { NextResponse } from 'next/server';
import { Enrollment, Package, LiveClass, Payment } from '../../../../src/db/models';
import { getAuthUserFromRequest } from '../auth/jwt';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

function resolveFullImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
  }
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `https://course.flymediatech.com${cleanPath}`;
}

export async function GET(request: Request) {
  try {
    const authUser = await getAuthUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: please log in to view enrollments' },
        { status: 401 }
      );
    }

    const userId = authUser.userId;

    // Fetch user payments to link purchase transaction details
    const payments = await Payment.findAll({
      where: { userId, status: 'SUCCESS' },
      order: [['createdAt', 'DESC']],
    });

    const paymentMap = new Map<string, any>();
    payments.forEach(p => {
      if (!paymentMap.has(p.packageId)) {
        paymentMap.set(p.packageId, p);
      }
    });

    const enrollmentsData = await Enrollment.findAll({
      where: { userId },
      include: [
        {
          model: Package,
          attributes: ['id', 'title', 'slug', 'category', 'thumbnail', 'duration', 'price', 'level', 'mode', 'courseModules'],
          include: [
            {
              model: LiveClass,
              as: 'liveClasses',
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    const enrolledPackageIds = new Set(enrollmentsData.map(e => e.packageId));
    const missingPaidPackageIds = Array.from(paymentMap.keys()).filter(pkgId => !enrolledPackageIds.has(pkgId));
    let additionalPackages: any[] = [];
    if (missingPaidPackageIds.length > 0) {
      additionalPackages = await Package.findAll({
        where: { id: { [Op.in]: missingPaidPackageIds } },
        include: [{ model: LiveClass, as: 'liveClasses' }],
      });
    }

    const now = new Date();

    const formatted = enrollmentsData.map(enr => {
      const pkg = (enr as any).Package;
      const payment = paymentMap.get(enr.packageId);

      const totalLessons = pkg?.courseModules
        ? pkg.courseModules.reduce((acc: number, m: any) => acc + (m.topics?.length || 0), 0)
        : 20;

      const liveClasses = pkg?.liveClasses || [];
      const upcomingClasses = liveClasses
        .filter((lc: any) => new Date(lc.startTime) >= now && lc.status !== 'CANCELLED')
        .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

      const nextClass = upcomingClasses[0] || null;
      const originalPrice = pkg?.price ? Number(pkg.price) : 0;
      const amountPaid = payment ? Number(payment.amount) : originalPrice;

      return {
        id: enr.id,
        packageId: pkg?.id || enr.packageId,
        courseId: pkg?.slug || pkg?.id || enr.packageId,
        courseTitle: pkg?.title || 'Enrolled Course',
        title: pkg?.title || 'Enrolled Course',
        slug: pkg?.slug || '',
        thumbnail: resolveFullImageUrl(pkg?.thumbnail),
        category: pkg?.category || 'Web Development',
        duration: pkg?.duration || '6 Months',
        level: pkg?.level || 'Beginner to Advanced',
        mode: pkg?.mode || 'ONLINE',
        price: originalPrice,
        amountPaid,
        paymentStatus: payment?.status || 'SUCCESS',
        transactionId: payment?.transactionId || `TXN_${enr.id.substring(0, 8).toUpperCase()}`,
        paymentMethod: payment?.provider || 'ONLINE',
        enrolledAt: enr.enrolledAt ? new Date(enr.enrolledAt).toISOString().split('T')[0] : 'Recent',
        purchasedAt: payment?.createdAt ? new Date(payment.createdAt).toISOString() : (enr.enrolledAt ? new Date(enr.enrolledAt).toISOString() : new Date().toISOString()),
        progressPercent: enr.completedAt ? 100 : 35,
        completedLessons: enr.completedAt ? totalLessons : Math.min(7, totalLessons),
        totalLessons: totalLessons || 20,
        totalClasses: liveClasses.length,
        liveClasses: liveClasses.map((lc: any) => ({
          id: lc.id,
          title: lc.title,
          meetLink: lc.meetLink || null,
          startTime: lc.startTime,
          duration: lc.duration || 60,
          status: lc.status || 'SCHEDULED',
        })),
        nextLiveClass: nextClass ? nextClass.title : 'Scheduled with senior mentor',
        nextLiveClassTime: nextClass ? nextClass.startTime : null,
        nextLiveClassMeetLink: nextClass ? nextClass.meetLink : null,
        certificateReady: !!enr.completedAt,
        isPurchased: true,
      };
    });

    additionalPackages.forEach(pkg => {
      const payment = paymentMap.get(pkg.id);
      const totalLessons = pkg?.courseModules
        ? pkg.courseModules.reduce((acc: number, m: any) => acc + (m.topics?.length || 0), 0)
        : 20;

      const liveClasses = pkg?.liveClasses || [];
      const nextClass = liveClasses
        .filter((lc: any) => new Date(lc.startTime) >= now && lc.status !== 'CANCELLED')
        .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0] || null;

      formatted.push({
        id: `pay_${payment?.id || pkg.id}`,
        packageId: pkg.id,
        courseId: pkg.slug || pkg.id,
        courseTitle: pkg.title,
        title: pkg.title,
        slug: pkg.slug || '',
        thumbnail: resolveFullImageUrl(pkg.thumbnail),
        category: pkg.category || 'Web Development',
        duration: pkg.duration || '6 Months',
        level: pkg.level || 'Beginner to Advanced',
        mode: pkg.mode || 'ONLINE',
        price: pkg.price ? Number(pkg.price) : 0,
        amountPaid: payment ? Number(payment.amount) : (pkg.price ? Number(pkg.price) : 0),
        paymentStatus: 'SUCCESS',
        transactionId: payment?.transactionId || `TXN_${pkg.id.substring(0, 8).toUpperCase()}`,
        paymentMethod: payment?.provider || 'ONLINE',
        enrolledAt: payment?.createdAt ? new Date(payment.createdAt).toISOString().split('T')[0] : 'Recent',
        purchasedAt: payment?.createdAt ? new Date(payment.createdAt).toISOString() : new Date().toISOString(),
        progressPercent: 35,
        completedLessons: Math.min(7, totalLessons),
        totalLessons: totalLessons || 20,
        totalClasses: liveClasses.length,
        liveClasses: liveClasses.map((lc: any) => ({
          id: lc.id,
          title: lc.title,
          meetLink: lc.meetLink || null,
          startTime: lc.startTime,
          duration: lc.duration || 60,
          status: lc.status || 'SCHEDULED',
        })),
        nextLiveClass: nextClass ? nextClass.title : 'Scheduled with senior mentor',
        nextLiveClassTime: nextClass ? nextClass.startTime : null,
        nextLiveClassMeetLink: nextClass ? nextClass.meetLink : null,
        certificateReady: false,
        isPurchased: true,
      });
    });

    return NextResponse.json({
      success: true,
      enrollments: formatted,
      packages: formatted,
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

    if (authUser.role === 'TUTOR') {
      return NextResponse.json(
        { success: false, error: 'Tutors cannot enroll in courses. Please use a student account.' },
        { status: 403 }
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
