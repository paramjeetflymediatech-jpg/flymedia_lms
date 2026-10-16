import { NextResponse } from 'next/server';
import { Package, Enrollment } from '../../../../../src/db/models';
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

    const packages = await Package.findAll({
      order: [['createdAt', 'DESC']],
    });

    const formatted = packages.map(p => {
      const json = p.toJSON();
      json.thumbnail = resolveFullImageUrl(json.thumbnail);
      return json;
    });

    return NextResponse.json({
      success: true,
      packages: formatted,
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
      thumbnail,
      mode,
      rating,
      reviewsCount,
      totalClasses,
      videoUrl,
      benefits,
      whatYoullLearn,
      highlights,
      faqs,
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

    const parsedBenefits = Array.isArray(benefits)
      ? benefits
      : typeof benefits === 'string'
      ? benefits.split('\n').map((s: string) => s.trim()).filter(Boolean)
      : [
          '100% Practical Training with Live Projects',
          'Advanced Skills & Industry Mentorship',
          'Internship Opportunity Basis Learning Progress',
          'Certification after Completion',
        ];

    const parsedWhatYoullLearn = Array.isArray(whatYoullLearn)
      ? whatYoullLearn
      : typeof whatYoullLearn === 'string'
      ? whatYoullLearn.split('\n').map((s: string) => s.trim()).filter(Boolean)
      : [];

    const createdPackage = await Package.create({
      title,
      slug: finalSlug,
      category: category || 'Web Development',
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      description,
      price: price != null ? Number(price) : 25000,
      duration: duration || '12 Weeks',
      level: level || 'Beginner to Advanced',
      status: status || 'PUBLISHED',
      mode: mode || 'ONLINE',
      rating: rating != null ? Number(rating) : 4.9,
      reviewsCount: reviewsCount || '1.2k+',
      totalClasses: totalClasses != null ? Number(totalClasses) : 12,
      videoUrl: videoUrl || null,
      skills: Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
        ? skills.split(',').map((s: string) => s.trim()).filter(Boolean)
        : ['Core Concepts', 'Practical Projects'],
      techStack: Array.isArray(techStack)
        ? techStack
        : typeof techStack === 'string'
        ? techStack.split(',').map((t: string) => t.trim()).filter(Boolean)
        : ['Industry Tools', 'Git'],
      benefits: parsedBenefits,
      whatYoullLearn: parsedWhatYoullLearn,
      highlights: Array.isArray(highlights) && highlights.length > 0
        ? highlights
        : [
            { title: 'Live Mentorship', description: 'Real-time practical training from industry experts.' },
            { title: 'Placement Assistance', description: 'Resume preparation and direct interviews.' },
          ],
      faqs: Array.isArray(faqs) ? faqs : [],
      courseModules: [
        { title: 'Stage 1: Core Fundamentals', topics: ['Foundation & Concepts', 'Hands-on practice'] },
        { title: 'Stage 2: Advanced Real-world Projects', topics: ['Project Architecture', 'Deployment'] },
      ],
    } as any);

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

export async function PUT(request: Request) {
  return handleUpdatePackage(request);
}

export async function PATCH(request: Request) {
  return handleUpdatePackage(request);
}

async function handleUpdatePackage(request: Request) {
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
      mode,
      totalClasses,
      rating,
      reviewsCount,
      videoUrl,
      benefits,
      whatYoullLearn,
      highlights,
      faqs,
    } = body;

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

    if (title !== undefined) pkg.title = title;
    if (category !== undefined) pkg.category = category;
    if (description !== undefined) pkg.description = description;
    if (price !== undefined) pkg.price = price != null ? Number(price) : null;
    if (duration !== undefined) pkg.duration = duration;
    if (level !== undefined) pkg.level = level;
    if (status !== undefined) pkg.status = status;
    if (thumbnail !== undefined) pkg.thumbnail = thumbnail;
    if (mode !== undefined) pkg.mode = mode;
    if (totalClasses !== undefined) (pkg as any).totalClasses = Number(totalClasses);
    if (rating !== undefined) (pkg as any).rating = Number(rating);
    if (reviewsCount !== undefined) (pkg as any).reviewsCount = reviewsCount;
    if (videoUrl !== undefined) (pkg as any).videoUrl = videoUrl;

    if (skills !== undefined) {
      pkg.skills = Array.isArray(skills)
        ? (skills as string[])
        : String(skills).split(',').map((s: string) => s.trim()).filter(Boolean);
    }
    if (techStack !== undefined) {
      pkg.techStack = Array.isArray(techStack)
        ? (techStack as string[])
        : String(techStack).split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    if (benefits !== undefined) {
      (pkg as any).benefits = Array.isArray(benefits)
        ? benefits
        : typeof benefits === 'string'
        ? benefits.split('\n').map((s: string) => s.trim()).filter(Boolean)
        : null;
    }
    if (whatYoullLearn !== undefined) {
      (pkg as any).whatYoullLearn = Array.isArray(whatYoullLearn)
        ? whatYoullLearn
        : typeof whatYoullLearn === 'string'
        ? whatYoullLearn.split('\n').map((s: string) => s.trim()).filter(Boolean)
        : null;
    }
    if (highlights !== undefined) {
      (pkg as any).highlights = Array.isArray(highlights) ? highlights : null;
    }
    if (faqs !== undefined) {
      (pkg as any).faqs = Array.isArray(faqs) ? faqs : null;
    }

    await pkg.save();

    const formatted = pkg.toJSON();
    formatted.thumbnail = resolveFullImageUrl(formatted.thumbnail);

    return NextResponse.json({
      success: true,
      message: 'Course updated successfully',
      package: formatted,
    });
  } catch (error: any) {
    console.error('Admin update package error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update course' },
      { status: 500 }
    );
  }
}

