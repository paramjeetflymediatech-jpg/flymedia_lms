import { Course, Testimonial, FaqItem, Mentor, Enrollment } from '../types';

export const API_BASE_URL = 'https://course.flymediatech.com/api/v1';

export interface HomeApiResponse {
  courses: Course[];
  categories: string[];
  testimonials: Testimonial[];
  faqs: FaqItem[];
  mentors: Mentor[];
}

export const ApiService = {
  /**
   * Fetches real live data from the backend APIs (No dummy fallback)
   */
  async getHomeData(): Promise<HomeApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/home`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          return {
            courses: json.data.courses || [],
            categories: json.data.categories || ['All'],
            testimonials: json.data.testimonials || [],
            faqs: json.data.faqs || [],
            mentors: json.data.mentors || [],
          };
        }
      }
    } catch (error) {
      console.warn('API fetch error for getHomeData:', error);
    }

    return {
      courses: [],
      categories: ['All'],
      testimonials: [],
      faqs: [],
      mentors: [],
    };
  },

  /**
   * Submits inquiry directly to database
   */
  async submitInquiry(data: { name: string; phone: string; course?: string; email?: string }): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/inquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await response.json();
      return json.success === true;
    } catch (err) {
      console.warn('Inquiry submit error:', err);
      return false;
    }
  },

  /**
   * Performs dynamic login against API
   */
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await response.json();
      return json;
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  },

  /**
   * Performs dynamic registration against API
   */
  async register(name: string, email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const json = await response.json();
      return json;
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  },

  /**
   * Fetches authenticated user's real enrollments from database
   */
  async getEnrollments(token: string): Promise<Enrollment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/enrollments`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.enrollments) {
          return json.enrollments;
        }
      }
    } catch (e) {
      console.warn('Error fetching enrollments from API:', e);
    }
    return [];
  },

  /**
   * Enrolls in a course on the server
   */
  async enrollCourse(courseId: string, token: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slug: courseId, packageId: courseId }),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to enroll' };
    }
  },

  /**
   * Verifies current session from API
   */
  async getMe(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e) {
      return { success: false };
    }
  },

  /**
   * Fetches single course detail from API
   */
  async getCourse(slugOrId: string): Promise<Course | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/packages/${slugOrId}`);
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch (e) {
      console.warn('Error fetching course from API:', e);
    }
    return null;
  },
};
