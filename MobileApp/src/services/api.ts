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
   * Fetches authenticated student's purchased packages
   */
  async getStudentPurchasedPackages(token: string): Promise<Enrollment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/student/packages`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const json = await response.json();
        if (json.success && (json.packages || json.enrollments)) {
          return json.packages || json.enrollments;
        }
      }
    } catch (e) {
      console.warn('Error fetching purchased packages from API:', e);
    }
    return this.getEnrollments(token);
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
        if (json.success && (json.packages || json.enrollments)) {
          return json.packages || json.enrollments;
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
  async enrollCourse(courseId: string, token: string, courseTitle?: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/enrollments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slug: courseId, packageId: courseId, courseTitle }),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to enroll' };
    }
  },

  /**
   * Validates promo coupon code and calculates discount
   */
  async validateCoupon(code: string, amount: number): Promise<{ success: boolean; valid?: boolean; discountAmount?: number; finalAmount?: number; coupon?: any; error?: string; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, amount }),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to validate coupon' };
    }
  },

  /**
   * Processes course purchase with selected payment method
   */
  async checkoutCourse(payload: {
    packageId: string;
    slug?: string;
    courseTitle?: string;
    paymentMethod: string;
    amount: number;
    couponCode?: string;
    paymentDetails?: any;
  }, token: string): Promise<{ success: boolean; transactionId?: string; message?: string; error?: string; alreadyEnrolled?: boolean; course?: any; payment?: any; redirectUrl?: string; requiresRedirect?: boolean }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Payment network failure' };
    }
  },

  /**
   * Initiates direct PhonePe gateway checkout via website payment API (/api/payment/initiate)
   */
  async initiatePhonePePayment(payload: {
    packageId: string;
    slug?: string;
    amount: number;
    couponCode?: string;
    batchMode?: string;
  }, token: string): Promise<{ success: boolean; redirectUrl?: string; error?: string; transactionId?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/v1', '')}/payment/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to initiate PhonePe payment' };
    }
  },

  /**
   * Checks live PhonePe payment status from backend
   */
  async checkPaymentStatus(transactionId: string, token: string): Promise<{ success: boolean; status?: string; message?: string; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transactionId }),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to check payment status' };
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
   * Permanently deletes user account and personal data (Google Play Policy compliance)
   */
  async deleteAccount(token: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/delete-account`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to delete account' };
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

  /**
   * Admin: Get stats and overview
   */
  async getAdminStats(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to load admin stats' };
    }
  },

  /**
   * Admin: Get all student inquiries / leads
   */
  async getAdminLeads(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/leads`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, leads: [] };
    }
  },

  /**
   * Admin: Update lead status
   */
  async updateLeadStatus(id: string, status: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/leads`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, status }),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update lead' };
    }
  },

  /**
   * Admin: Create new course package
   */
  async createCourse(courseData: any, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/packages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(courseData),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to create course' };
    }
  },

  /**
   * Admin: Get all course packages
   */
  async getAdminPackages(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/packages`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, packages: [] };
    }
  },

  /**
   * Admin: Delete package
   */
  async deleteAdminPackage(id: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/packages?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to delete package' };
    }
  },

  /**
   * Admin: Update course package
   */
  async updateAdminPackage(id: string, data: any, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/packages`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, ...data }),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update package' };
    }
  },

  /**
   * Admin: Get all student enrollments
   */
  async getAdminEnrollments(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/enrollments`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, enrollments: [] };
    }
  },

  /**
   * Admin: Get all users
   */
  async getAdminUsers(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, users: [] };
    }
  },

  /**
   * Admin: Create new user
   */
  async createAdminUser(
    userData: { name: string; email: string; password: string; role: 'STUDENT' | 'TUTOR' | 'ADMIN' },
    token: string
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to create user' };
    }
  },

  /**
   * Admin: Update existing user
   */
  async updateAdminUser(
    userData: { id: string; name: string; email: string; role: 'STUDENT' | 'TUTOR' | 'ADMIN'; password?: string },
    token: string
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update user' };
    }
  },

  /**
   * Admin: Delete user
   */
  async deleteAdminUser(id: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to delete user' };
    }
  },

  /**
   * Admin: Get categories
   */
  async getAdminCategories(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, categories: [] };
    }
  },

  /**
   * Admin: Create category
   */
  async createAdminCategory(data: { name: string; description?: string }, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to create category' };
    }
  },

  /**
   * Admin: Get coupons
   */
  async getAdminCoupons(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/coupons`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, coupons: [] };
    }
  },

  /**
   * Admin: Create coupon
   */
  async createAdminCoupon(data: { code: string; discountPercent?: number; discountAmount?: number }, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/coupons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to create coupon' };
    }
  },

  /**
   * Admin: Update category
   */
  async updateAdminCategory(id: string, data: { name: string; description?: string }, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, ...data }),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update category' };
    }
  },

  /**
   * Admin: Delete category
   */
  async deleteAdminCategory(id: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/categories?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to delete category' };
    }
  },

  /**
   * Admin: Update coupon
   */
  async updateAdminCoupon(id: string, data: { code: string; discountPercent?: number }, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/coupons`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, ...data }),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to update coupon' };
    }
  },

  /**
   * Admin: Delete coupon
   */
  async deleteAdminCoupon(id: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/coupons?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to delete coupon' };
    }
  },

  /**
   * Admin: Get all tutors with assigned courses and students
   */
  async getAdminTutors(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tutors`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, tutors: [] };
    }
  },

  /**
   * Admin: Assign packages to a tutor
   */
  async assignTutorPackages(tutorId: string, packageIds: string[], token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tutors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tutorId, packageIds }),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to assign tutor packages' };
    }
  },

  /**
   * Admin: Create a new tutor account and optionally assign packages
   */
  async createAdminTutor(
    tutorData: {
      name: string;
      email: string;
      password: string;
      professionTitle?: string;
      bio?: string;
      packageIds?: string[];
    },
    token: string
  ) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tutors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(tutorData),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to create tutor' };
    }
  },

  /**
   * Admin: Delete tutor
   */
  async deleteAdminTutor(tutorId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tutors?id=${tutorId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to delete tutor' };
    }
  },

  /**
   * Admin: Get all schedules and live classes
   */
  async getAdminSchedules(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/schedules`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, schedules: [], liveClasses: [] };
    }
  },

  /**
   * Admin: Create and generate recurring class schedule
   */
  async createAdminSchedule(scheduleData: any, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/schedules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(scheduleData),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to generate schedule' };
    }
  },

  /**
   * Admin: Delete recurring schedule
   */
  async deleteAdminSchedule(scheduleId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/schedules?scheduleId=${scheduleId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to delete schedule' };
    }
  },

  /**
   * Admin: Delete individual live class
   */
  async deleteAdminLiveClass(classId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/schedules?classId=${classId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to delete class' };
    }
  },


  // ==========================================
  // STUDENT PANEL APIs
  // ==========================================
  async getStudentDashboard(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/student/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  },

  async getStudentTutors() {
    try {
      const response = await fetch(`${API_BASE_URL}/student/tutors`, {
        headers: { 'Content-Type': 'application/json' },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, tutors: [] };
    }
  },

  async getStudentSlots(tutorId: string, date: string, token?: string) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/student/availability?tutorId=${encodeURIComponent(tutorId)}&date=${encodeURIComponent(date)}`, {
        headers,
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, slots: [] };
    }
  },

  async bookStudentSlot(slotId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/student/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ slotId }),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  },

  // ==========================================
  // TUTOR PANEL APIs
  // ==========================================
  async getTutorDashboard(token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor/dashboard`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  },

  async getTutorSlots(date: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor/availability?date=${encodeURIComponent(date)}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, slots: [] };
    }
  },

  async addTutorSlot(data: { date: string; startTime: string; endTime: string; clientDate?: string; clientCurrentMinutes?: number }, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  },

  async deleteTutorSlot(slotId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor/availability?slotId=${encodeURIComponent(slotId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  },

  async updateTutorClass(data: { sessionId: string; isOneOnOne: boolean; meetLink?: string; status?: string }, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/tutor/classes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  },

  /**
   * Student: Join live class and register attendance
   */
  async joinClass(classId: string, token: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/classes/${encodeURIComponent(classId)}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      return await response.json();
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
    }
  },
};
