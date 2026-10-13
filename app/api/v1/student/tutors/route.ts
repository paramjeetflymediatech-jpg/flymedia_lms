import { NextResponse } from 'next/server';
import { User, TutorAvailability } from '../../../../src/db/models';
import { Op } from 'sequelize';

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

export async function GET() {
  try {
    const tutors = await User.findAll({
      where: { role: 'TUTOR' },
      attributes: ['id', 'name', 'avatar', 'professionTitle', 'bio', 'rating', 'reviewsCount', 'studentsMentored', 'skills'],
      order: [['rating', 'DESC'], ['name', 'ASC']],
    });

    const now = new Date();
    const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Get active slot count per tutor
    const formatted = await Promise.all(
      tutors.map(async (t) => {
        const plain = t.get({ plain: true });
        const availableSlotsCount = await TutorAvailability.count({
          where: {
            tutorId: plain.id,
            isBooked: false,
            date: { [Op.gte]: todayString },
          },
        });

        return {
          id: plain.id,
          name: plain.name || 'Professional Tutor',
          avatar: resolveFullImageUrl(plain.avatar),
          professionTitle: plain.professionTitle || 'Senior Technical Mentor',
          bio: plain.bio || 'Experienced educator focused on practical hands-on learning and personalized 1-on-1 coaching.',
          rating: Number(plain.rating) || 5.0,
          reviewsCount: plain.reviewsCount || 12,
          studentsMentored: plain.studentsMentored || 45,
          skills: Array.isArray(plain.skills) ? plain.skills : ['Web Development', 'React', 'Problem Solving'],
          availableSlotsCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      tutors: formatted,
    });
  } catch (error: any) {
    console.error('Student tutors API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch tutors' },
      { status: 500 }
    );
  }
}
