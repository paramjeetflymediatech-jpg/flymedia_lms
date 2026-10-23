import { NextResponse } from 'next/server';
import { Package } from '../../../../src/db/models';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const packages = await Package.findAll({
      where: { status: 'PUBLISHED' },
      attributes: ['id', 'title', 'slug', 'category'],
      order: [['title', 'ASC']],
    });

    const courses = packages.map(p => ({
      id: p.slug || p.id,
      title: p.title,
      category: p.category || 'General',
    }));

    return NextResponse.json({ success: true, courses });
  } catch (error: any) {
    console.error('Failed to load courses list:', error);
    return NextResponse.json({ success: false, courses: [], error: error.message }, { status: 500 });
  }
}
