import { NextResponse } from 'next/server';
import { Package, Enrollment } from '../../../../../src/db/models';
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

    const packages = await Package.findAll({
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json({
      success: true,
      packages,
    });
  } catch (error: any) {
    console.error('Admin packages GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch packages' },
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

    const body = await request.json();
    const {
      title,
      slug,
      category,
      price,
      duration,
      level,
      description,
      skills,
      techStack,
      status,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const finalSlug = slug
      ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await Package.findOne({ where: { slug: finalSlug } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `A course with slug '${finalSlug}' already exists.` },
        { status: 400 }
      );
    }

    const createdPackage = await Package.create({
      title,
      slug: finalSlug,
      category: category || 'Web Development',
      description,
      price: price ? Number(price) : 25000,
      duration: duration || '12 Weeks',
      level: level || 'Beginner to Advanced',
      status: status || 'PUBLISHED',
      mode: 'BOTH',
      skills: Array.isArray(skills) ? skills : ['Core Concepts', 'Practical Projects'],
      techStack: Array.isArray(techStack) ? techStack : ['Industry Tools', 'Git'],
      highlights: [
        { title: 'Live Mentorship', description: 'Real-time practical training from industry experts.' },
        { title: 'Placement Assistance', description: 'Resume preparation and direct interviews.' },
      ],
      courseModules: [
        { title: 'Stage 1: Core Fundamentals', topics: ['Foundation & Concepts', 'Hands-on practice'] },
        { title: 'Stage 2: Advanced Real-world Projects', topics: ['Project Architecture', 'Deployment'] },
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'Course created successfully',
      package: createdPackage,
    });
  } catch (error: any) {
    console.error('Admin create course error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create course' },
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
        { success: false, error: 'Package ID is required' },
        { status: 400 }
      );
    }

    const pkg = await Package.findByPk(id);
    if (!pkg) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      );
    }

    await pkg.destroy();

    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully',
    });
  } catch (error: any) {
    console.error('Admin delete course error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete course' },
      { status: 500 }
    );
  }
}
