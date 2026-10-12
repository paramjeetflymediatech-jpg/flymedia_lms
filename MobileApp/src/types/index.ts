export interface CourseHighlight {
  title: string;
  description: string;
}

export interface CourseModule {
  title: string;
  topics: string[];
}

export interface CourseFaq {
  question: string;
  answer: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  price: number;
  duration: string;
  level: string;
  rating: number;
  studentsCount: number;
  highlights: CourseHighlight[];
  skills: string[];
  techStack: string[];
  modules: CourseModule[];
  faqs: CourseFaq[];
  badge?: string;
  thumbnail?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
  token?: string;
}

export interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  category: string;
  thumbnail?: string;
  enrolledAt: string;
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  nextLiveClass?: string;
  certificateReady: boolean;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  experience: string;
  company: string;
  rating: number;
  studentsTrained: number;
  bio: string;
  skills: string[];
}

export interface Testimonial {
  id: string;
  studentName: string;
  course: string;
  review: string;
  rating: number;
  placedAt?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}
