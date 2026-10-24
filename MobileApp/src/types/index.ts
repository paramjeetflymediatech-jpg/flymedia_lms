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
  mode?: string;
}

export interface EducationDetails {
  highestQualification?: string;
  collegeOrSchool?: string;
  passingYear?: string;
  percentageOrCgpa?: string;
  currentlyStudying?: boolean;
  currentCourse?: string;
  currentInstitution?: string;
}

export interface AddressDetails {
  addressLine?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface FamilyDetails {
  fatherName?: string;
  motherName?: string;
  guardianPhone?: string;
  familyOccupation?: string;
  annualIncome?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
  token?: string;
  bio?: string;
  avatar?: string;
  educationDetails?: EducationDetails | null;
  addressDetails?: AddressDetails | null;
  familyDetails?: FamilyDetails | null;
  studentCategory?: string | null;
  referralCode?: string;
  referredBy?: string;
  freeDemoCredits?: number;
  referralsCount?: number;
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
  // Enhanced package purchase fields
  packageId?: string;
  title?: string;
  slug?: string;
  duration?: string;
  level?: string;
  mode?: string;
  price?: number;
  amountPaid?: number;
  paymentStatus?: string;
  transactionId?: string | null;
  paymentMethod?: string;
  purchasedAt?: string;
  totalClasses?: number;
  liveClasses?: any[];
  nextLiveClassTime?: string | null;
  nextLiveClassMeetLink?: string | null;
  isPurchased?: boolean;
}

export type PurchasedPackage = Enrollment;

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

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  mediaType: 'IMAGE' | 'VIDEO';
  mediaUrl: string;
  thumbnailUrl?: string;
  studentName?: string;
  courseName?: string;
  companyPlaced?: string;
  salaryPackage?: string;
  rating?: number;
  category?: string;
}

