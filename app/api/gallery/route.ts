import { NextResponse } from 'next/server';
import { GalleryItem } from '../../../src/db/models';

export async function GET(request: Request) {
  try {
    await GalleryItem.sync({ alter: true });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const mediaType = searchParams.get('type');
    const includeInactive = searchParams.get('all') === 'true';

    const whereClause: any = {};
    if (!includeInactive) {
      whereClause.isActive = true;
    }
    if (category && category !== 'ALL') {
      whereClause.category = category;
    }
    if (mediaType && (mediaType === 'IMAGE' || mediaType === 'VIDEO')) {
      whereClause.mediaType = mediaType;
    }

    const items = await GalleryItem.findAll({
      where: whereClause,
      order: [
        ['order', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    console.error('Gallery API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gallery items', details: error.message },
      { status: 500 }
    );
  }
}
