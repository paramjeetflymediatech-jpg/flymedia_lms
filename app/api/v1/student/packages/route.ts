import { NextResponse } from 'next/server';
import { Enrollment, Package, LiveClass, Payment } from '../../../../../src/db/models';
import { getAuthUserFromRequest } from '../../auth/jwt';
import { Op } from 'sequelize';
import { syncAndGetEnrollmentProgress } from '@/src/lib/attendance';

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
        { success: false, error: 'Unauthorized: please log in to view purchased packages' },
        { status: 401 }
      );
    }

    const userId = authUser.userId;

    // 1. Fetch user payments to link purchase transaction details
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

    // 2. Fetch Enrollments with Package & LiveClasses
    const enrollmentsData = await Enrollment.findAll({
      where: { userId },
      include: [
        {
          model: Package,
          attributes: [
            'id',
            'title',
            'slug',
            'category',
            'thumbnail',
            'duration',
            'price',
            'level',
            'mode',
            'courseModules',
          ],
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

    // 3. Check if there are any successful payments without enrollment record, and include them
    const missingPaidPackageIds = Array.from(paymentMap.keys()).filter(pkgId => !enrolledPackageIds.has(pkgId));
    let additionalPackages: any[] = [];
    if (missingPaidPackageIds.length > 0) {
      additionalPackages = await Package.findAll({
        where: { id: { [Op.in]: missingPaidPackageIds } },
        include: [{ model: LiveClass, as: 'liveClasses' }],
      });
    }

    const now = new Date();

    const formatted = await Promise.all(
      enrollmentsData.map(async enr => {
        const pkg = (enr as any).Package;
        const payment = paymentMap.get(enr.packageId);
        const progress = await syncAndGetEnrollmentProgress(enr.id);

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
          courseTitle: pkg?.title || 'Purchased Package',
          title: pkg?.title || 'Purchased Package',
          slug: pkg?.slug || '',
          thumbnail: resolveFullImageUrl(pkg?.thumbnail),
          category: pkg?.category || 'Professional Training',
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
          progressPercent: progress ? progress.progressPercentage : (enr.completedAt ? 100 : 35),
          completedLessons: enr.completedAt ? totalLessons : Math.min(7, totalLessons),
          totalLessons: totalLessons || 20,
          totalClasses: progress?.totalClasses || liveClasses.length || 12,
          progress: progress || {
            totalClasses: enr.totalClasses || 12,
            conductedClasses: 0,
            attendedClasses: 0,
            missedClasses: 0,
            remainingClasses: enr.totalClasses || 12,
            isExpired: false,
            status: enr.status || 'ACTIVE',
            progressPercentage: 0,
          },
          liveClasses: liveClasses.map((lc: any) => ({
            id: lc.id,
            title: lc.title,
            meetLink: lc.meetLink || null,
            startTime: lc.startTime,
            duration: lc.duration || 60,
            status: lc.status || 'SCHEDULED',
          })),
          nextLiveClass: nextClass ? nextClass.title : 'Live Mentor Session',
          nextLiveClassTime: nextClass ? nextClass.startTime : null,
          nextLiveClassMeetLink: nextClass ? nextClass.meetLink : null,
          certificateReady: !!enr.completedAt || progress?.isExpired,
          isPurchased: true,
        };
      })
    );

    // Add any paid packages that had missing enrollment records
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
        category: pkg.category || 'Professional Training',
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
        nextLiveClass: nextClass ? nextClass.title : 'Live Mentor Session',
        nextLiveClassTime: nextClass ? nextClass.startTime : null,
        nextLiveClassMeetLink: nextClass ? nextClass.meetLink : null,
        certificateReady: false,
        progress: {
          totalClasses: 12,
          conductedClasses: 0,
          attendedClasses: 0,
          missedClasses: 0,
          remainingClasses: 12,
          isExpired: false,
          status: 'ACTIVE',
          progressPercentage: 0,
        },
        isPurchased: true,
      });
    });

    return NextResponse.json({
      success: true,
      totalCount: formatted.length,
      packages: formatted,
      enrollments: formatted,
    });
  } catch (error: any) {
    console.error('Error in /api/v1/student/packages:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch purchased packages' },
      { status: 500 }
    );
  }
}
