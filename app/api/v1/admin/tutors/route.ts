import { NextResponse } from 'next/server';
import { User, Package, PackageTutor, ClassSchedule, LiveClass, Enrollment } from '../../../../../src/db/models';
import { getAuthUserFromRequest } from '../../auth/jwt';

export const dynamic = 'force-dynamic';

function resolveFullImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
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

    // 1. Fetch all tutors
    const tutors = await User.findAll({
      where: { role: 'TUTOR' },
      attributes: ['id', 'name', 'email', 'avatar', 'professionTitle', 'bio', 'rating', 'reviewsCount', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    // 2. Fetch assigned packages, schedules, and enrollments for each tutor
    const formattedTutors = await Promise.all(
      tutors.map(async (tutor) => {
        const tutorId = tutor.id;

        // Packages assigned via PackageTutor
        const packageTutorLinks = await PackageTutor.findAll({
          where: { tutorId },
          include: [
            {
              model: Package,
              include: [
                {
                  model: Enrollment,
                  as: 'enrollments',
                  include: [{ model: User, attributes: ['id', 'name', 'email', 'avatar'] }],
                },
                {
                  model: ClassSchedule,
                  as: 'schedules',
                  where: { tutorId },
                  required: false,
                },
                {
                  model: LiveClass,
                  as: 'liveClasses',
                  where: { tutorId },
                  required: false,
                },
              ],
            },
          ],
        });

        const directPkgs = packageTutorLinks.map((pt: any) => pt.Package).filter(Boolean);
        const existingPkgIds = new Set(directPkgs.map((p: any) => p.id));

        // Also check if tutor has live classes in other packages
        const otherClasses = await LiveClass.findAll({
          where: { tutorId },
          attributes: ['packageId'],
        });
        const extraPkgIds = [...new Set(otherClasses.map((c: any) => c.packageId))].filter(
          (id: string) => id && !existingPkgIds.has(id)
        );

        let allPkgs = [...directPkgs];
        if (extraPkgIds.length > 0) {
          const extraPkgs = await Package.findAll({
            where: { id: extraPkgIds },
            include: [
              {
                model: Enrollment,
                as: 'enrollments',
                include: [{ model: User, attributes: ['id', 'name', 'email', 'avatar'] }],
              },
              {
                model: ClassSchedule,
                as: 'schedules',
                where: { tutorId },
                required: false,
              },
              {
                model: LiveClass,
                as: 'liveClasses',
                where: { tutorId },
                required: false,
              },
            ],
          });
          allPkgs.push(...extraPkgs);
        }

        // Aggregate unique students across all assigned packages
        const studentsMap = new Map<string, any>();
        let totalLiveClasses = 0;
        let totalSchedules = 0;

        const courses = allPkgs.map((pkg: any) => {
          const enrollments = pkg.enrollments || [];
          enrollments.forEach((enr: any) => {
            const student = enr.User || enr.user;
            if (student && student.id && !studentsMap.has(student.id)) {
              studentsMap.set(student.id, {
                id: student.id,
                name: student.name || 'Student',
                email: student.email,
                avatar: resolveFullImageUrl(student.avatar),
              });
            }
          });

          const schedules = pkg.schedules || [];
          totalSchedules += schedules.length;

          const liveClasses = pkg.liveClasses || [];
          totalLiveClasses += liveClasses.length;

          return {
            id: pkg.id,
            title: pkg.title,
            slug: pkg.slug,
            category: pkg.category || 'Professional Track',
            thumbnail: resolveFullImageUrl(pkg.thumbnail),
            price: pkg.price ? Number(pkg.price) : 0,
            enrolledStudentsCount: enrollments.length,
            schedulesCount: schedules.length,
            liveClassesCount: liveClasses.length,
          };
        });

        return {
          id: tutor.id,
          name: tutor.name || 'Instructor',
          email: tutor.email,
          avatar: resolveFullImageUrl(tutor.avatar),
          professionTitle: tutor.professionTitle || 'Certified Mentor',
          bio: tutor.bio || '',
          rating: Number(tutor.rating) || 5.0,
          reviewsCount: tutor.reviewsCount || 0,
          coursesCount: courses.length,
          studentsCount: studentsMap.size,
          schedulesCount: totalSchedules,
          liveClassesCount: totalLiveClasses,
          courses,
          students: Array.from(studentsMap.values()),
        };
      })
    );

    return NextResponse.json({
      success: true,
      tutors: formattedTutors,
    });
  } catch (error: any) {
    console.error('Admin tutors GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tutors' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return handleAssignTutorPackages(request);
}

export async function PUT(request: Request) {
  return handleAssignTutorPackages(request);
}

async function handleAssignTutorPackages(request: Request) {
  try {
    const authPayload = await getAuthUserFromRequest(request);
    if (!authPayload || authPayload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { tutorId, packageIds } = body;

    if (!tutorId) {
      return NextResponse.json(
        { success: false, error: 'Tutor ID is required' },
        { status: 400 }
      );
    }

    const tutor = await User.findOne({ where: { id: tutorId, role: 'TUTOR' } });
    if (!tutor) {
      return NextResponse.json(
        { success: false, error: 'Tutor not found' },
        { status: 404 }
      );
    }

    // Sync package assignments
    await PackageTutor.destroy({ where: { tutorId } });
    if (Array.isArray(packageIds) && packageIds.length > 0) {
      const records = (packageIds as any[]).map((packageId: any) => ({
        packageId: String(packageId),
        tutorId: String(tutorId),
      }));
      await PackageTutor.bulkCreate(records);
    }

    return NextResponse.json({
      success: true,
      message: 'Tutor course assignments updated successfully',
    });
  } catch (error: any) {
    console.error('Assign tutor packages error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update tutor package assignments' },
      { status: 500 }
    );
  }
}

