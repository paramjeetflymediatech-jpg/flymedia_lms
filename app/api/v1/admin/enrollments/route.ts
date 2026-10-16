import { NextResponse } from 'next/server';
import { Enrollment, Package, User } from '../../../../../src/db/models';
import { getAuthUserFromRequest } from '../../auth/jwt';

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
    const authPayload = await getAuthUserFromRequest(request);
    if (!authPayload || authPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const enrollments = await Enrollment.findAll({
      include: [
        {
          model: Package,
          attributes: ['id', 'title', 'slug', 'price', 'category', 'thumbnail', 'duration', 'mode'],
          required: false,
        },
        {
          model: User,
          attributes: ['id', 'name', 'email', 'avatar', 'role'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 150,
    });

    const formattedEnrollments = enrollments.map((enr: any) => {
      const e = enr.toJSON ? enr.toJSON() : enr;
      const pkg = e.Package || e.package || null;
      const user = e.User || e.user || null;

      const totalClasses = Number(e.totalClasses) || 12;
      const conductedClasses = Number(e.conductedClasses) || 0;
      const attendedClasses = Number(e.attendedClasses) || 0;
      const missedClasses = Math.max(0, conductedClasses - attendedClasses);
      const remainingClasses = Math.max(0, totalClasses - conductedClasses);
      const progressPercentage = Math.round((conductedClasses / totalClasses) * 100);

      if (pkg && pkg.thumbnail) {
        pkg.thumbnail = resolveFullImageUrl(pkg.thumbnail);
      }
      if (user && user.avatar) {
        user.avatar = resolveFullImageUrl(user.avatar);
      }

      return {
        ...e,
        package: pkg,
        user,
        progress: {
          totalClasses,
          conductedClasses,
          attendedClasses,
          missedClasses,
          remainingClasses,
          progressPercentage,
          isExpired: e.status === 'EXPIRED' || conductedClasses >= totalClasses,
          status: e.status || (conductedClasses >= totalClasses ? 'EXPIRED' : 'ACTIVE'),
        },
      };
    });

    return NextResponse.json({
      success: true,
      enrollments: formattedEnrollments,
    });
  } catch (error: any) {
    console.error('Admin enrollments GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}
