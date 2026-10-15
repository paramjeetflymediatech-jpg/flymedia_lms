import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Enrollment, Course } from '../types';
import { ApiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  enrollments: Enrollment[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshEnrollments: () => Promise<void>;
  enrollCourse: (course: Course) => Promise<{ success: boolean; error?: string; requireAuth?: boolean }>;
  purchaseCourse: (payload: {
    course: Course;
    paymentMethod: string;
    amount: number;
    couponCode?: string;
    paymentDetails?: any;
  }) => Promise<{ success: boolean; error?: string; requireAuth?: boolean; transactionId?: string; payment?: any; redirectUrl?: string; requiresRedirect?: boolean }>;
  submitCallback: (name: string, phone: string, course: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  enrollments: [],
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => { },
  refreshEnrollments: async () => { },
  enrollCourse: async () => ({ success: false }),
  purchaseCourse: async () => ({ success: false }),
  submitCallback: async () => false,
});

const USER_STORAGE_KEY = '@flymedia_lms_user';
const TOKEN_STORAGE_KEY = '@flymedia_lms_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);

      if (storedToken) {
        // Verify real session against backend API
        const meRes = await ApiService.getMe(storedToken);
        if (meRes && meRes.success && meRes.user) {
          const verifiedUser: User = {
            ...meRes.user,
            token: storedToken,
          };
          setUser(verifiedUser);
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(verifiedUser));

          // Fetch real live enrollments and purchased packages from API
          const userEnrollments = await ApiService.getStudentPurchasedPackages(storedToken);
          setEnrollments(userEnrollments);
        } else {
          // Token is expired, invalid, or dummy - clear session completely
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
          await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
          setUser(null);
          setEnrollments([]);
        }
      } else {
        // Strict guest state: no initially logged in user
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
        setUser(null);
        setEnrollments([]);
      }
    } catch (e) {
      console.warn('Failed to load session:', e);
      setUser(null);
      setEnrollments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshEnrollments = async () => {
    if (!user || !user.token) {
      setEnrollments([]);
      return;
    }
    const realEnrollments = await ApiService.getStudentPurchasedPackages(user.token);
    setEnrollments(realEnrollments);
  };

  const login = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }

      const res = await ApiService.login(email.trim(), password);
      if (res && res.success && res.user && res.token) {
        const authUser: User = {
          ...res.user,
          token: res.token,
        };
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, res.token);
        setUser(authUser);

        // Fetch user's real enrollments and purchased packages
        const realEnrollments = await ApiService.getStudentPurchasedPackages(res.token);
        setEnrollments(realEnrollments);
        return { success: true };
      }

      return { success: false, error: res?.error || 'Invalid credentials' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      if (!name || !email || !password) {
        return { success: false, error: 'All fields are required' };
      }

      const res = await ApiService.register(name.trim(), email.trim(), password);
      if (res && res.success && res.user && res.token) {
        const authUser: User = {
          ...res.user,
          token: res.token,
        };
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
        await AsyncStorage.setItem(TOKEN_STORAGE_KEY, res.token);
        setUser(authUser);
        setEnrollments([]);
        return { success: true };
      }

      return { success: false, error: res?.error || 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
    setEnrollments([]);
  };

  const enrollCourse = async (course: Course) => {
    if (!user || !user.token) {
      return { success: false, requireAuth: true, error: 'Please sign in to enroll in this course.' };
    }

    const res = await ApiService.enrollCourse(
      (course as any).databaseId || course.id,
      user.token,
      course.title
    );
    if (res.success) {
      await refreshEnrollments();
      return { success: true };
    }
    return { success: false, error: res.message || 'Failed to enroll in course' };
  };

  const purchaseCourse = async (payload: {
    course: Course;
    paymentMethod: string;
    amount: number;
    couponCode?: string;
    paymentDetails?: any;
  }) => {
    if (!user || !user.token) {
      return { success: false, requireAuth: true, error: 'Please sign in to complete purchase.' };
    }

    if (payload.paymentMethod === 'PHONEPE') {
      try {
        const phonePeRes = await ApiService.initiatePhonePePayment(
          {
            packageId: (payload.course as any).databaseId || payload.course.id,
            slug: payload.course.slug || payload.course.id,
            amount: payload.amount,
            couponCode: payload.couponCode,
          },
          user.token
        );
        if (phonePeRes.success && phonePeRes.redirectUrl) {
          return {
            success: true,
            redirectUrl: phonePeRes.redirectUrl,
            requiresRedirect: true,
            transactionId: `TXN_${Date.now()}`,
          };
        }
      } catch (err) {
        console.warn('Direct PhonePe initiate failed, falling back to unified checkout:', err);
      }
    }

    const res = await ApiService.checkoutCourse(
      {
        packageId: (payload.course as any).databaseId || payload.course.id,
        slug: payload.course.slug || payload.course.id,
        courseTitle: payload.course.title,
        paymentMethod: payload.paymentMethod,
        amount: payload.amount,
        couponCode: payload.couponCode,
        paymentDetails: payload.paymentDetails,
      },
      user.token
    );

    if (res.success) {
      await refreshEnrollments();
      return {
        success: true,
        transactionId: res.transactionId,
        payment: res.payment,
        redirectUrl: (res as any).redirectUrl,
        requiresRedirect: (res as any).requiresRedirect,
      };
    }
    return { success: false, error: res.error || res.message || 'Failed to process payment.' };
  };

  const submitCallback = async (name: string, phone: string, course: string) => {
    return await ApiService.submitInquiry({ name, phone, course });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        enrollments,
        login,
        register,
        logout,
        refreshEnrollments,
        enrollCourse,
        purchaseCourse,
        submitCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
