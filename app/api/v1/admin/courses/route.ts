import { NextResponse } from 'next/server';
import { Package } from '../../../../../src/db/models';
import { getAuthUserFromRequest } from '../../auth/jwt';

export const dynamic = 'force-dynamic';

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
      category: category || 'General',
      description,
      price: price ? Number(price) : 0,
      duration: duration || '12 Weeks',
      level: level || 'Beginner to Advanced',
      status: 'PUBLISHED',
      mode: 'BOTH',
      skills: Array.isArray(skills) ? (skills as string[]) : ['Hands-on Projects', 'Industry Mentorship'],
      techStack: Array.isArray(techStack) ? (techStack as string[]) : ['Industry Tools', 'Git'],
      highlights: [
        { title: 'Live Mentorship', description: 'Instructor-led training sessions.' },
        { title: 'Practical Portfolio', description: 'Real-world project deliverables.' },
      ],
      courseModules: [
        { title: 'Stage 1: Core Fundamentals', topics: ['Orientation & Fundamentals', 'Practical assignments'] },
        { title: 'Stage 2: Advanced Concepts & Capstone', topics: ['Architecture & Deep Dive', 'Portfolio Project'] },
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

export async function PUT(request: Request) {
  return handleUpdateCourse(request);
}

export async function PATCH(request: Request) {
  return handleUpdateCourse(request);
}

async function handleUpdateCourse(request: Request) {
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
      id,
      title,
      category,
      price,
      duration,
      level,
      description,
      skills,
      techStack,
      status,
      thumbnail,
    } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Course ID is required' },
        { status: 400 }
      );
    }

    const pkg = await Package.findByPk(id);
    if (!pkg) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    if (title !== undefined) pkg.title = title;
    if (category !== undefined) pkg.category = category;
    if (description !== undefined) pkg.description = description;
    if (price !== undefined) pkg.price = Number(price);
    if (duration !== undefined) pkg.duration = duration;
    if (level !== undefined) pkg.level = level;
    if (status !== undefined) pkg.status = status;
    if (thumbnail !== undefined) pkg.thumbnail = thumbnail;

    if (skills !== undefined) {
      pkg.skills = Array.isArray(skills) ? (skills as string[]) : String(skills).split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (techStack !== undefined) {
      pkg.techStack = Array.isArray(techStack) ? (techStack as string[]) : String(techStack).split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    await pkg.save();

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
      package: pkg,
    });
  } catch (error: any) {
    console.error('Admin update course error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update course' },
      { status: 500 }
    );
  }
}

