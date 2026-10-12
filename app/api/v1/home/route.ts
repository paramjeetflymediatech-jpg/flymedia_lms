import { NextResponse } from 'next/server';
import { Package, Category, Testimonial, Faq, User } from '../../../../src/db/models';

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

export async function GET() {
  try {
    const [packages, categoriesData, testimonialsData, faqsData, mentorsData] = await Promise.all([
      Package.findAll({
        where: { status: 'PUBLISHED' },
        order: [['createdAt', 'DESC']],
      }),
      Category.findAll({
        order: [['name', 'ASC']],
      }),
      Testimonial.findAll({
        where: { isActive: true },
        order: [['createdAt', 'DESC']],
        limit: 10,
      }),
      Faq.findAll({
        where: { isActive: true },
        order: [['order', 'ASC'], ['createdAt', 'ASC']],
      }),
      User.findAll({
        where: { role: 'TUTOR' },
        attributes: ['id', 'name', 'bio', 'avatar', 'professionTitle', 'rating', 'reviewsCount', 'studentsMentored', 'skills'],
      }),
    ]);

    const formattedCourses = packages.map(pkg => ({
      id: pkg.slug || pkg.id,
      databaseId: pkg.id,
      slug: pkg.slug,
      title: pkg.title,
      thumbnail: resolveFullImageUrl(pkg.thumbnail),
      category: pkg.category || 'General',
      description: pkg.description ? pkg.description.replace(/<[^>]*>?/gm, '') : '',
      price: pkg.price ? Number(pkg.price) : 0,
      duration: pkg.duration || '12 Weeks',
      level: pkg.level || 'Beginner to Advanced',
      rating: pkg.rating ? Number(pkg.rating) : 4.9,
      studentsCount: 1000 + Math.floor(Math.random() * 500),
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
    }));

    const formattedCategories = ['All', ...categoriesData.map(c => c.name)];

    const formattedTestimonials = testimonialsData.map(t => ({
      id: t.id,
      studentName: t.name,
      course: t.role,
      review: t.content,
      rating: t.rating || 5,
      placedAt: 'Alumni Network',
    }));

    const formattedFaqs = faqsData.map(f => ({
      id: f.id,
      question: f.question,
      answer: f.answer,
    }));

    const formattedMentors = mentorsData.map(m => ({
      id: m.id,
      name: m.name || 'Senior Instructor',
      role: m.professionTitle || 'Lead Tech Mentor',
      experience: '7+ Years Exp',
      company: 'Flymedia Technology',
      rating: m.rating ? Number(m.rating) : 4.9,
      studentsTrained: m.studentsMentored || 1200,
      bio: m.bio || 'Expert software trainer at Flymedia.',
      skills: (m.skills as string[]) || ['Full Stack', 'Mentorship'],
    }));

    return NextResponse.json({
      success: true,
      data: {
        courses: formattedCourses,
        categories: formattedCategories,
        testimonials: formattedTestimonials,
        faqs: formattedFaqs,
        mentors: formattedMentors,
      },
    });
  } catch (error: any) {
    console.error('API Error in /api/v1/home:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load home data' },
      { status: 500 }
    );
  }
}
