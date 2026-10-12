import { NextResponse } from 'next/server';
import { Package } from '../../../../../src/db/models';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug or ID is required' },
        { status: 400 }
      );
    }

    const pkg = await Package.findOne({
      where: {
        [Op.or]: [{ slug }, { id: slug }],
        status: 'PUBLISHED',
      },
    });

    if (!pkg) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    const formattedCourse = {
      id: pkg.slug || pkg.id,
      databaseId: pkg.id,
      slug: pkg.slug,
      title: pkg.title,
      category: pkg.category || 'General',
      description: pkg.description ? pkg.description.replace(/<[^>]*>?/gm, '') : '',
      price: pkg.price ? Number(pkg.price) : 0,
      duration: pkg.duration || '12 Weeks',
      level: pkg.level || 'Beginner to Advanced',
      rating: pkg.rating ? Number(pkg.rating) : 4.9,
      studentsCount: 1200,
      badge: pkg.category === 'Web Development' ? 'Best Seller' : 'Popular',
      highlights: pkg.highlights || [
        { title: 'Live Instructor-Led Classes', description: 'Learn in real-time from senior mentors.' },
        { title: '100% Practical Project Work', description: 'Real industry brief and software.' }
      ],
      skills: Array.isArray(pkg.skills) && pkg.skills.length > 0
        ? pkg.skills.map((s: any) => typeof s === 'object' && s !== null ? s.name || '' : String(s || '')).filter(Boolean)
        : ['Core Concepts', 'Practical Application', 'Live Project'],
      techStack: Array.isArray(pkg.techStack) && pkg.techStack.length > 0
        ? pkg.techStack.map((t: any) => typeof t === 'object' && t !== null ? t.name || '' : String(t || '')).filter(Boolean)
        : ['Industry Tools', 'Git'],
      modules: pkg.courseModules || [
        { title: 'Stage 1: Core Fundamentals', topics: ['Foundation concepts', 'Hands-on practice'] }
      ],
      faqs: pkg.faqs || [],
    };

    return NextResponse.json({
      success: true,
      data: formattedCourse,
    });
  } catch (error: any) {
    console.error('API Error in /api/v1/packages/[slug]:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load course' },
      { status: 500 }
    );
  }
}
