import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import {
  ArrowLeft,
  PlusCircle,
  Users,
  BookOpen,
  PhoneCall,
  GraduationCap,
  Sparkles,
  Phone,
  MessageCircle,
  ShieldCheck,
  X,
  Trash2,
  Tag,
  Ticket,
  Search,
  CheckCircle,
  Layers,
  Pencil,
  UserPlus,
  LogOut,
  LayoutDashboard,
  Award,
  Clock,
  Video,
  Check,
  ChevronRight,
  Eye,
  Calendar,
  AlertCircle,
  Mail,
  Star,
  UserCheck,
} from 'lucide-react-native';
import { formatImageUrl } from '../../utils/imageUrl';

type AdminTab = 'overview' | 'courses' | 'leads' | 'enrollments' | 'tutors' | 'users' | 'tools';

interface AdminDashboardScreenProps {
  navigation: any;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 16);
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 8);

  useEffect(() => {
    if (!user) {
      if (navigation.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
      } else {
        try {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } catch {
          // Navigator key remounts automatically
        }
      }
    }
  }, [user, navigation]);

  const handleLogout = () => {
    const doLogout = async () => {
      try {
        await logout();
        if (navigation.canGoBack && navigation.canGoBack()) {
          navigation.goBack();
        }
      } catch (err) {
        console.error('Admin logout error:', err);
      }
    };

    if (Platform.OS === 'web') {
      const win = (globalThis as any).window;
      const confirmLogout =
        win && win.confirm
          ? win.confirm('Are you sure you want to sign out of Admin Portal?')
          : true;
      if (confirmLogout) {
        doLogout();
      }
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to sign out of Admin Portal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: doLogout,
      },
    ]);
  };

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalLeads: 0,
    totalEnrollments: 0,
    totalUsers: 0,
    totalCategories: 0,
    totalCoupons: 0,
    totalTutors: 0,
  });

  // Data lists
  const [packages, setPackages] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);

  // Search queries & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [leadFilter, setLeadFilter] = useState<'ALL' | 'NEW' | 'CONTACTED' | 'RESOLVED'>('ALL');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'STUDENT' | 'TUTOR' | 'ADMIN'>('ALL');
  const [tutorSearchQuery, setTutorSearchQuery] = useState('');
  const [enrollmentSearch, setEnrollmentSearch] = useState('');
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED'>('ALL');

  // Modals
  const [addCourseModal, setAddCourseModal] = useState(false);
  const [addCategoryModal, setAddCategoryModal] = useState(false);
  const [addCouponModal, setAddCouponModal] = useState(false);
  const [addUserModal, setAddUserModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Lead Status Modal
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedLeadForStatus, setSelectedLeadForStatus] = useState<any | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Edit Course Modal
  const [editCourseModal, setEditCourseModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editCourseCategory, setEditCourseCategory] = useState('Web Development');
  const [editCourseMode, setEditCourseMode] = useState<'ONLINE' | 'OFFLINE' | 'BOTH'>('ONLINE');
  const [editCoursePrice, setEditCoursePrice] = useState('');
  const [editCourseDuration, setEditCourseDuration] = useState('12 Weeks');
  const [editCourseLevel, setEditCourseLevel] = useState('Beginner to Advanced');
  const [editCourseTotalClasses, setEditCourseTotalClasses] = useState('12');
  const [editCourseRating, setEditCourseRating] = useState('4.9');
  const [editCourseReviewsCount, setEditCourseReviewsCount] = useState('1.2k+');
  const [editCourseVideoUrl, setEditCourseVideoUrl] = useState('');
  const [editCourseDesc, setEditCourseDesc] = useState('');
  const [editCourseThumbnail, setEditCourseThumbnail] = useState('');
  const [editCourseSkills, setEditCourseSkills] = useState('');
  const [editCourseTech, setEditCourseTech] = useState('');
  const [editCourseBenefits, setEditCourseBenefits] = useState('');
  const [editCourseWhatYoullLearn, setEditCourseWhatYoullLearn] = useState('');
  const [editCourseTutorIds, setEditCourseTutorIds] = useState<string[]>([]);
  const [editCourseStatus, setEditCourseStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');

  // Enrollment Details Modal
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);
  const [enrollmentDetailsModal, setEnrollmentDetailsModal] = useState(false);

  // Edit Category Modal
  const [editCategoryModal, setEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatDesc, setEditCatDesc] = useState('');

  // Edit Coupon Modal
  const [editCouponModal, setEditCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  const [editCouponCode, setEditCouponCode] = useState('');
  const [editCouponPercent, setEditCouponPercent] = useState('10');

  // Tutor Details Modal
  const [selectedTutorDetails, setSelectedTutorDetails] = useState<any | null>(null);
  const [tutorModalVisible, setTutorModalVisible] = useState(false);

  // Assign Courses to Tutor Modal
  const [assignCourseModalVisible, setAssignCourseModalVisible] = useState(false);
  const [selectedTutorForCourseAssign, setSelectedTutorForCourseAssign] = useState<any | null>(null);
  const [tutorAssignedPkgIds, setTutorAssignedPkgIds] = useState<string[]>([]);
  const [assigningTutorPackages, setAssigningTutorPackages] = useState(false);

  // New Course Form
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState('Web Development');
  const [courseMode, setCourseMode] = useState<'ONLINE' | 'OFFLINE' | 'BOTH'>('ONLINE');
  const [coursePrice, setCoursePrice] = useState('');
  const [courseDuration, setCourseDuration] = useState('12 Weeks');
  const [courseLevel, setCourseLevel] = useState('Beginner to Advanced');
  const [courseTotalClasses, setCourseTotalClasses] = useState('12');
  const [courseRating, setCourseRating] = useState('4.9');
  const [courseReviewsCount, setCourseReviewsCount] = useState('1.2k+');
  const [courseVideoUrl, setCourseVideoUrl] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseThumbnail, setCourseThumbnail] = useState('');
  const [courseSkills, setCourseSkills] = useState('React, Node.js, Express, MongoDB');
  const [courseTech, setCourseTech] = useState('JavaScript, Git, Postman');
  const [courseBenefits, setCourseBenefits] = useState(
    '100% Practical Training with Live Projects\nAdvanced Skills & Industry Mentorship\nInternship Opportunity Basis Learning Progress\nCertification after Completion'
  );
  const [courseWhatYoullLearn, setCourseWhatYoullLearn] = useState('');
  const [courseTutorIds, setCourseTutorIds] = useState<string[]>([]);
  const [courseStatus, setCourseStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');

  // New Category Form
  const [newCatName, setNewCatName] = useState('');

  // New Coupon Form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponPercent, setNewCouponPercent] = useState('15');

  // New User Form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'STUDENT' | 'TUTOR' | 'ADMIN'>('STUDENT');

  // Edit User Form
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<'STUDENT' | 'TUTOR' | 'ADMIN'>('STUDENT');
  const [editUserPassword, setEditUserPassword] = useState('');

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const navigateToTab = (tab: AdminTab) => {
    setSearchQuery('');
    setLeadFilter('ALL');
    setUserRoleFilter('ALL');
    setTutorSearchQuery('');
    setEnrollmentSearch('');
    setEnrollmentStatusFilter('ALL');
    setActiveTab(tab);
  };

  const loadAllAdminData = async () => {
    if (!user || !user.token) return;
    try {
      const [statsRes, pkgsRes, leadsRes, enrollRes, usersRes, catsRes, couponsRes, tutorsRes] =
        await Promise.all([
          ApiService.getAdminStats(user.token),
          ApiService.getAdminPackages(user.token),
          ApiService.getAdminLeads(user.token),
          ApiService.getAdminEnrollments(user.token),
          ApiService.getAdminUsers(user.token),
          ApiService.getAdminCategories(user.token),
          ApiService.getAdminCoupons(user.token),
          ApiService.getAdminTutors(user.token),
        ]);

      let finalPackages = Array.isArray(pkgsRes?.packages) ? pkgsRes.packages : [];
      let finalLeads = Array.isArray(leadsRes?.leads) ? leadsRes.leads : [];
      let finalEnrollments = Array.isArray(enrollRes?.enrollments) ? enrollRes.enrollments : [];
      let finalUsers = Array.isArray(usersRes?.users) ? usersRes.users : [];
      let finalCategories = Array.isArray(catsRes?.categories) ? catsRes.categories : [];
      let finalCoupons = Array.isArray(couponsRes?.coupons) ? couponsRes.coupons : [];
      let finalTutors = Array.isArray(tutorsRes?.tutors) ? tutorsRes.tutors : [];

      // Fallback for packages and categories from public home endpoint if admin returned empty
      if (finalPackages.length === 0 || finalCategories.length === 0) {
        try {
          const homeRes = await ApiService.getHomeData();
          if (finalPackages.length === 0 && Array.isArray(homeRes.courses) && homeRes.courses.length > 0) {
            finalPackages = homeRes.courses;
          }
          if (finalCategories.length === 0 && Array.isArray(homeRes.categories) && homeRes.categories.length > 0) {
            finalCategories = homeRes.categories.map((c: any) => typeof c === 'string' ? { id: c, name: c } : c);
          }
        } catch (_) {}
      }

      // Fallback for leads from stats endpoint's recentLeads
      if (finalLeads.length === 0 && Array.isArray(statsRes?.recentLeads) && statsRes.recentLeads.length > 0) {
        finalLeads = statsRes.recentLeads;
      }

      setPackages(finalPackages);
      setLeads(finalLeads);
      setEnrollments(finalEnrollments);
      setUsersList(finalUsers);
      setCategories(finalCategories);
      setCoupons(finalCoupons);
      setTutors(finalTutors);

      // Keep stats cards aligned with the loaded data so overview cards match actual list contents
      setStats({
        totalCourses: Math.max(statsRes.stats?.totalCourses || 0, finalPackages.length),
        totalLeads: Math.max(statsRes.stats?.totalLeads || 0, finalLeads.length),
        totalEnrollments: Math.max(statsRes.stats?.totalEnrollments || 0, finalEnrollments.length),
        totalUsers: Math.max(statsRes.stats?.totalUsers || 0, finalUsers.length),
        totalCategories: Math.max(statsRes.stats?.totalCategories || 0, finalCategories.length),
        totalCoupons: Math.max(statsRes.stats?.totalCoupons || 0, finalCoupons.length),
        totalTutors: finalTutors.length || finalUsers.filter((u: any) => u.role === 'TUTOR').length,
      });
    } catch (e) {
      console.warn('Error loading admin data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAllAdminData();
  };

  // Create Course Handler
  const handleCreateCourse = async () => {
    if (!courseTitle.trim() || !courseDesc.trim()) {
      Alert.alert('Required Fields', 'Please enter course title and description.');
      return;
    }
    if (!user || !user.token) return;

    setSubmitting(true);
    const skillsArray = courseSkills.split(',').map(s => s.trim()).filter(Boolean);
    const techArray = courseTech.split(',').map(t => t.trim()).filter(Boolean);
    const benefitsArray = courseBenefits.split('\n').map(s => s.trim()).filter(Boolean);
    const whatYoullLearnArray = courseWhatYoullLearn.split('\n').map(s => s.trim()).filter(Boolean);

    const payload = {
      title: courseTitle.trim(),
      category: courseCategory,
      mode: courseMode,
      thumbnail: courseThumbnail.trim() || undefined,
      price: coursePrice ? Number(coursePrice) : 25000,
      duration: courseDuration || '12 Weeks',
      level: courseLevel || 'Beginner to Advanced',
      totalClasses: courseTotalClasses ? Number(courseTotalClasses) : 12,
      rating: courseRating ? Number(courseRating) : 4.9,
      reviewsCount: courseReviewsCount || '1.2k+',
      videoUrl: courseVideoUrl.trim() || undefined,
      description: courseDesc.trim(),
      skills: skillsArray,
      techStack: techArray,
      benefits: benefitsArray,
      whatYoullLearn: whatYoullLearnArray,
      tutorIds: courseTutorIds,
      status: courseStatus,
    };

    const res = await ApiService.createCourse(payload, user.token);
    setSubmitting(false);

    if (res.success) {
      Alert.alert('Success! 🎉', `Course "${courseTitle}" published live to LMS.`);
      setAddCourseModal(false);
      setCourseTitle('');
      setCourseDesc('');
      setCourseThumbnail('');
      setCoursePrice('');
      setCourseVideoUrl('');
      setCourseWhatYoullLearn('');
      setCourseTutorIds([]);
      loadAllAdminData();
    } else {
      Alert.alert('Error', res.error || 'Failed to create course');
    }
  };

  // Delete Course Handler
  const handleDeletePackage = (pkgId: string, title: string) => {
    Alert.alert(
      'Delete Course',
      `Are you sure you want to delete "${title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user || !user.token) return;
            const res = await ApiService.deleteAdminPackage(pkgId, user.token);
            if (res.success) {
              setPackages(prev => prev.filter(p => p.id !== pkgId));
              Alert.alert('Deleted', 'Course removed successfully.');
            } else {
              Alert.alert('Error', res.error || 'Could not delete course');
            }
          },
        },
      ]
    );
  };

  // Lead handlers
  const handleCallStudent = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`);
  };

  const handleWhatsAppStudent = (phone: string, studentName: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hello ${studentName}, greetings from Flymedia Academy! How can we assist you with your course inquiry?`);
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${message}`);
  };

  const handleOpenStatusModal = (lead: any) => {
    setSelectedLeadForStatus(lead);
    setStatusModalVisible(true);
  };

  const handleSelectLeadStatus = async (newStatus: 'NEW' | 'CONTACTED' | 'RESOLVED') => {
    if (!selectedLeadForStatus || !user || !user.token) return;
    setUpdatingStatus(true);
    const res = await ApiService.updateLeadStatus(selectedLeadForStatus.id, newStatus, user.token);
    setUpdatingStatus(false);
    if (res.success) {
      setLeads(prev =>
        prev.map(l => (l.id === selectedLeadForStatus.id ? { ...l, status: newStatus } : l))
      );
      setStatusModalVisible(false);
      setSelectedLeadForStatus(null);
    } else {
      Alert.alert('Error', res.error || 'Failed to update lead status');
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, currentStatus: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      handleOpenStatusModal(lead);
      return;
    }
    if (!user || !user.token) return;
    const nextStatus =
      currentStatus === 'NEW' ? 'CONTACTED' : currentStatus === 'CONTACTED' ? 'RESOLVED' : 'NEW';

    const res = await ApiService.updateLeadStatus(leadId, nextStatus, user.token);
    if (res.success) {
      setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, status: nextStatus } : l)));
    }
  };

  // Course Edit Handlers
  const handleOpenEditCourse = (pkg: any) => {
    setEditingCourseId(pkg.id || pkg.slug);
    setEditCourseTitle(pkg.title || '');
    setEditCourseCategory(pkg.category || 'Web Development');
    setEditCourseMode(pkg.mode === 'OFFLINE' ? 'OFFLINE' : pkg.mode === 'BOTH' ? 'BOTH' : 'ONLINE');
    setEditCoursePrice(pkg.price != null ? String(pkg.price) : '');
    setEditCourseDuration(pkg.duration || '12 Weeks');
    setEditCourseLevel(pkg.level || 'Beginner to Advanced');
    setEditCourseTotalClasses(pkg.totalClasses != null ? String(pkg.totalClasses) : '12');
    setEditCourseRating(pkg.rating != null ? String(pkg.rating) : '4.9');
    setEditCourseReviewsCount(pkg.reviewsCount || '1.2k+');
    setEditCourseVideoUrl(pkg.videoUrl || '');
    setEditCourseDesc(pkg.description || '');
    setEditCourseThumbnail(pkg.thumbnail || '');
    setEditCourseSkills(
      Array.isArray(pkg.skills)
        ? pkg.skills.join(', ')
        : typeof pkg.skills === 'string'
        ? pkg.skills
        : ''
    );
    setEditCourseTech(
      Array.isArray(pkg.techStack)
        ? pkg.techStack.join(', ')
        : typeof pkg.techStack === 'string'
        ? pkg.techStack
        : ''
    );
    setEditCourseBenefits(
      Array.isArray(pkg.benefits)
        ? pkg.benefits.join('\n')
        : typeof pkg.benefits === 'string'
        ? pkg.benefits
        : ''
    );
    setEditCourseWhatYoullLearn(
      Array.isArray(pkg.whatYoullLearn)
        ? pkg.whatYoullLearn.join('\n')
        : typeof pkg.whatYoullLearn === 'string'
        ? pkg.whatYoullLearn
        : ''
    );
    const existingTutorIds = Array.isArray(pkg.assignedTutors)
      ? pkg.assignedTutors.map((t: any) => t.id)
      : tutors.filter((t: any) => t.courses?.some((c: any) => c.id === pkg.id || c.slug === pkg.slug)).map((t: any) => t.id);
    setEditCourseTutorIds(existingTutorIds);
    setEditCourseStatus(pkg.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED');
    setEditCourseModal(true);
  };

  const handleSaveEditCourse = async () => {
    if (!editingCourseId || !user || !user.token) return;
    if (!editCourseTitle.trim() || !editCourseDesc.trim()) {
      Alert.alert('Required Fields', 'Course title and description cannot be empty.');
      return;
    }

    setSubmitting(true);
    const skillsArray = editCourseSkills.split(',').map(s => s.trim()).filter(Boolean);
    const techArray = editCourseTech.split(',').map(t => t.trim()).filter(Boolean);
    const benefitsArray = editCourseBenefits.split('\n').map(s => s.trim()).filter(Boolean);
    const whatYoullLearnArray = editCourseWhatYoullLearn.split('\n').map(s => s.trim()).filter(Boolean);

    const payload = {
      title: editCourseTitle.trim(),
      category: editCourseCategory.trim(),
      mode: editCourseMode,
      price: editCoursePrice ? Number(editCoursePrice) : 25000,
      duration: editCourseDuration.trim() || '12 Weeks',
      level: editCourseLevel.trim() || 'Beginner to Advanced',
      totalClasses: editCourseTotalClasses ? Number(editCourseTotalClasses) : 12,
      rating: editCourseRating ? Number(editCourseRating) : 4.9,
      reviewsCount: editCourseReviewsCount.trim() || '1.2k+',
      videoUrl: editCourseVideoUrl.trim() || undefined,
      description: editCourseDesc.trim(),
      thumbnail: editCourseThumbnail.trim() || undefined,
      skills: skillsArray,
      techStack: techArray,
      benefits: benefitsArray,
      whatYoullLearn: whatYoullLearnArray,
      tutorIds: editCourseTutorIds,
      status: editCourseStatus,
    };

    const res = await ApiService.updateAdminPackage(editingCourseId, payload, user.token);
    setSubmitting(false);

    if (res.success) {
      Alert.alert('Success 🎉', 'Course program updated successfully.');
      setEditCourseModal(false);
      setEditingCourseId(null);
      loadAllAdminData();
    } else {
      Alert.alert('Error', res.error || 'Failed to update course');
    }
  };

  // Category CRUD Handlers
  const handleCreateCategory = async () => {
    if (!newCatName.trim() || !user || !user.token) return;
    setSubmitting(true);
    const res = await ApiService.createAdminCategory({ name: newCatName.trim() }, user.token);
    setSubmitting(false);
    if (res.success) {
      setCategories(prev => [...prev, res.category]);
      setAddCategoryModal(false);
      setNewCatName('');
      Alert.alert('Success', 'Category added.');
    } else {
      Alert.alert('Error', res.error || 'Failed to add category');
    }
  };

  const handleOpenEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setEditCatName(cat.name || '');
    setEditCatDesc(cat.description || '');
    setEditCategoryModal(true);
  };

  const handleSaveEditCategory = async () => {
    if (!editingCategory || !user || !user.token) return;
    if (!editCatName.trim()) {
      Alert.alert('Required', 'Category name is required.');
      return;
    }
    setSubmitting(true);
    const res = await ApiService.updateAdminCategory(
      editingCategory.id,
      { name: editCatName.trim(), description: editCatDesc.trim() || undefined },
      user.token
    );
    setSubmitting(false);
    if (res.success) {
      setCategories(prev =>
        prev.map(c =>
          c.id === editingCategory.id
            ? { ...c, name: editCatName.trim(), description: editCatDesc.trim() }
            : c
        )
      );
      setEditCategoryModal(false);
      setEditingCategory(null);
      Alert.alert('Success', 'Category updated successfully.');
    } else {
      Alert.alert('Error', res.error || 'Failed to update category');
    }
  };

  const handleDeleteCategory = (cat: any) => {
    if (!user || !user.token) return;
    const token = user.token;
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete category "${cat.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await ApiService.deleteAdminCategory(cat.id, token);
            if (res.success) {
              setCategories(prev => prev.filter(c => c.id !== cat.id));
              Alert.alert('Deleted', 'Category removed successfully.');
            } else {
              Alert.alert('Error', res.error || 'Failed to delete category');
            }
          },
        },
      ]
    );
  };

  // Coupon CRUD Handlers
  const handleCreateCoupon = async () => {
    if (!newCouponCode.trim() || !user || !user.token) return;
    setSubmitting(true);
    const res = await ApiService.createAdminCoupon(
      { code: newCouponCode.trim(), discountPercent: Number(newCouponPercent) || 10 },
      user.token
    );
    setSubmitting(false);
    if (res.success) {
      setCoupons(prev => [res.coupon, ...prev]);
      setAddCouponModal(false);
      setNewCouponCode('');
      Alert.alert('Success', 'Coupon code generated.');
    } else {
      Alert.alert('Error', res.error || 'Failed to create coupon');
    }
  };

  const handleOpenEditCoupon = (cp: any) => {
    setEditingCoupon(cp);
    setEditCouponCode(cp.code || '');
    setEditCouponPercent(String(cp.discountPercentage || cp.discountPercent || 10));
    setEditCouponModal(true);
  };

  const handleSaveEditCoupon = async () => {
    if (!editingCoupon || !user || !user.token) return;
    if (!editCouponCode.trim()) {
      Alert.alert('Required', 'Coupon code is required.');
      return;
    }
    setSubmitting(true);
    const res = await ApiService.updateAdminCoupon(
      editingCoupon.id,
      {
        code: editCouponCode.trim(),
        discountPercent: Number(editCouponPercent) || 10,
      },
      user.token
    );
    setSubmitting(false);
    if (res.success) {
      const updatedDiscount = Number(editCouponPercent) || 10;
      setCoupons(prev =>
        prev.map(c =>
          c.id === editingCoupon.id
            ? {
                ...c,
                code: editCouponCode.trim(),
                discountPercentage: updatedDiscount,
                discountPercent: updatedDiscount,
              }
            : c
        )
      );
      setEditCouponModal(false);
      setEditingCoupon(null);
      Alert.alert('Success', 'Coupon updated successfully.');
    } else {
      Alert.alert('Error', res.error || 'Failed to update coupon');
    }
  };

  const handleDeleteCoupon = (cp: any) => {
    if (!user || !user.token) return;
    const token = user.token;
    Alert.alert(
      'Delete Coupon',
      `Are you sure you want to delete coupon "${cp.code}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await ApiService.deleteAdminCoupon(cp.id, token);
            if (res.success) {
              setCoupons(prev => prev.filter(c => c.id !== cp.id));
              Alert.alert('Deleted', 'Coupon removed successfully.');
            } else {
              Alert.alert('Error', res.error || 'Failed to delete coupon');
            }
          },
        },
      ]
    );
  };

  // Enrollment & Tutor details viewers
  const handleViewEnrollment = (enr: any) => {
    setSelectedEnrollment(enr);
    setEnrollmentDetailsModal(true);
  };

  const handleViewTutor = (tutor: any) => {
    setSelectedTutorDetails(tutor);
    setTutorModalVisible(true);
  };

  // Open modal to assign courses to a tutor
  const handleOpenAssignCoursesToTutor = (tutor: any) => {
    setSelectedTutorForCourseAssign(tutor);
    const directIds = Array.isArray(tutor.courses)
      ? tutor.courses.map((c: any) => c.id).filter(Boolean)
      : [];
    const fromPackages = packages
      .filter((p: any) => Array.isArray(p.assignedTutors) && p.assignedTutors.some((t: any) => t.id === tutor.id))
      .map((p: any) => p.id);
    const combined = Array.from(new Set([...directIds, ...fromPackages]));
    setTutorAssignedPkgIds(combined);
    setAssignCourseModalVisible(true);
  };

  const handleSaveTutorCourseAssignments = async () => {
    if (!selectedTutorForCourseAssign || !user || !user.token) return;
    setAssigningTutorPackages(true);
    const res = await ApiService.assignTutorPackages(
      selectedTutorForCourseAssign.id,
      tutorAssignedPkgIds,
      user.token
    );
    setAssigningTutorPackages(false);

    if (res.success) {
      Alert.alert('Success 🎉', `Course assignments updated for ${selectedTutorForCourseAssign.name || 'tutor'}.`);
      setAssignCourseModalVisible(false);
      setSelectedTutorForCourseAssign(null);
      loadAllAdminData();
    } else {
      Alert.alert('Error', res.error || 'Failed to update course assignments');
    }
  };

  // Available tutors helper (combines tutors list or tutor-role users)
  const availableTutors = tutors.length > 0
    ? tutors
    : usersList.filter((u: any) => u.role === 'TUTOR');

  // Filtered leads
  const filteredLeads = leads.filter(l => {
    const matchStatus = leadFilter === 'ALL' || l.status === leadFilter;
    const matchQuery =
      searchQuery === '' ||
      (l.name && l.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (l.phone && l.phone.includes(searchQuery)) ||
      (l.message && l.message.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchQuery;
  });

  // Filtered tutors
  const filteredTutors = tutors.filter(t => {
    const q = tutorSearchQuery.toLowerCase().trim();
    if (!q) return true;
    const nameMatch = t.name && t.name.toLowerCase().includes(q);
    const emailMatch = t.email && t.email.toLowerCase().includes(q);
    const courseMatch =
      Array.isArray(t.courses) &&
      t.courses.some((c: any) => c.title && c.title.toLowerCase().includes(q));
    return nameMatch || emailMatch || courseMatch;
  });

  // Filtered enrollments
  const filteredEnrollments = enrollments.filter(enr => {
    const studentName = enr.user?.name || enr.User?.name || '';
    const studentEmail = enr.user?.email || enr.User?.email || '';
    const courseTitle = enr.package?.title || enr.Package?.title || '';
    const status = (enr.status || 'ACTIVE').toUpperCase();
    const matchStatus =
      enrollmentStatusFilter === 'ALL' ||
      status === enrollmentStatusFilter ||
      (enrollmentStatusFilter === 'EXPIRED' && enr.isExpired);
    const q = enrollmentSearch.toLowerCase().trim();
    const matchQuery =
      q === '' ||
      studentName.toLowerCase().includes(q) ||
      studentEmail.toLowerCase().includes(q) ||
      courseTitle.toLowerCase().includes(q);
    return matchStatus && matchQuery;
  });

  // Filtered packages
  const filteredPackages = packages.filter(p => {
    return (
      searchQuery === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // User CRUD Handlers
  const handleCreateUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      Alert.alert('Required Fields', 'Please enter Name, Email, and Password.');
      return;
    }
    if (!user || !user.token) return;

    setSubmitting(true);
    const res = await ApiService.createAdminUser(
      {
        name: newUserName.trim(),
        email: newUserEmail.trim(),
        password: newUserPassword.trim(),
        role: newUserRole,
      },
      user.token
    );
    setSubmitting(false);

    if (res.success && res.user) {
      setUsersList(prev => [res.user, ...prev]);
      setStats(prev => ({ ...prev, totalUsers: (prev.totalUsers || 0) + 1 }));
      setAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('STUDENT');
      Alert.alert('Success 🎉', `User "${res.user.name}" created successfully.`);
    } else {
      Alert.alert('Error', res.error || 'Failed to create user');
    }
  };

  const handleOpenEditUser = (targetUser: any) => {
    setSelectedUserForEdit(targetUser);
    setEditUserName(targetUser.name || '');
    setEditUserEmail(targetUser.email || '');
    setEditUserRole(targetUser.role || 'STUDENT');
    setEditUserPassword('');
    setEditUserModal(true);
  };

  const handleSaveEditUser = async () => {
    if (!selectedUserForEdit || !user || !user.token) return;
    if (!editUserName.trim() || !editUserEmail.trim()) {
      Alert.alert('Required Fields', 'Name and Email cannot be empty.');
      return;
    }

    setSubmitting(true);
    const res = await ApiService.updateAdminUser(
      {
        id: selectedUserForEdit.id,
        name: editUserName.trim(),
        email: editUserEmail.trim(),
        role: editUserRole,
        password: editUserPassword.trim() || undefined,
      },
      user.token
    );
    setSubmitting(false);

    if (res.success && res.user) {
      setUsersList(prev =>
        prev.map(u => (u.id === selectedUserForEdit.id ? { ...u, ...res.user } : u))
      );
      setEditUserModal(false);
      setSelectedUserForEdit(null);
      Alert.alert('Success', 'User profile updated successfully.');
    } else {
      Alert.alert('Error', res.error || 'Failed to update user');
    }
  };

  const handleDeleteUser = (targetUser: any) => {
    if (!user || !user.token) return;
    const token = user.token;
    if (user.id === targetUser.id) {
      Alert.alert('Action Denied', 'You cannot delete your own admin account.');
      return;
    }

    Alert.alert(
      'Delete User',
      `Are you sure you want to delete "${targetUser.name || targetUser.email}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await ApiService.deleteAdminUser(targetUser.id, token);
            if (res.success) {
              setUsersList(prev => prev.filter(u => u.id !== targetUser.id));
              setStats(prev => ({ ...prev, totalUsers: Math.max(0, (prev.totalUsers || 1) - 1) }));
              Alert.alert('Deleted', 'User account deleted successfully.');
            } else {
              Alert.alert('Error', res.error || 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  // Filtered users
  const filteredUsers = usersList.filter(u => {
    const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    const matchQuery =
      searchQuery === '' ||
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchRole && matchQuery;
  });

  return (
    <View style={styles.screen}>
      {/* TOP HEADER */}
      <View style={[styles.topBar, { paddingTop: topPadding + 6 }]}>
        {navigation.canGoBack && navigation.canGoBack() && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
        )}

        <View style={[styles.topBarCenter, !(navigation.canGoBack && navigation.canGoBack()) && { marginLeft: 0 }]}>
          <Text style={styles.topBarTitle}>Flymedia Admin Suite</Text>
          <View style={styles.adminBadge}>
            <ShieldCheck size={12} color={Colors.primaryOrange} />
            <Text style={styles.adminBadgeText}>Master Admin Portal</Text>
          </View>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity
            style={styles.headerActionBtn}
            onPress={() => setAddCourseModal(true)}
            activeOpacity={0.85}
          >
            <PlusCircle size={15} color={Colors.textWhite} />
            <Text style={styles.headerActionBtnText}>+ Course</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toolsIconBtn, activeTab === 'tools' && styles.toolsIconBtnActive]}
            onPress={() => setActiveTab('tools')}
            activeOpacity={0.85}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Tag size={14} color={activeTab === 'tools' ? Colors.primaryOrange : Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <LogOut size={13} color="#dc2626" />
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAIN CONTENT AREA */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primaryOrange]}
            tintColor={Colors.primaryOrange}
          />
        }
      >
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={Colors.primaryOrange} />
            <Text style={styles.loaderText}>Connecting to Flymedia LMS Admin Gateway...</Text>
          </View>
        ) : (
          <>
            {/* ================= OVERVIEW TAB ================= */}
            {activeTab === 'overview' && (
              <View>
                {/* METRICS GRID */}
                <View style={styles.statsGrid}>
                  <TouchableOpacity
                    style={styles.statCard}
                    onPress={() => navigateToTab('courses')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.statIconWrap, { backgroundColor: '#fff7ed' }]}>
                      <BookOpen size={20} color={Colors.primaryOrange} />
                    </View>
                    <Text style={styles.statNumber}>{stats.totalCourses}</Text>
                    <Text style={styles.statLabel}>Total Courses</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.statCard}
                    onPress={() => navigateToTab('leads')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.statIconWrap, { backgroundColor: '#eff6ff' }]}>
                      <PhoneCall size={20} color={Colors.accentBlue} />
                    </View>
                    <Text style={styles.statNumber}>{stats.totalLeads}</Text>
                    <Text style={styles.statLabel}>Student Leads</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.statCard}
                    onPress={() => navigateToTab('enrollments')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.statIconWrap, { backgroundColor: '#f0fdf4' }]}>
                      <GraduationCap size={20} color={Colors.success} />
                    </View>
                    <Text style={styles.statNumber}>{stats.totalEnrollments}</Text>
                    <Text style={styles.statLabel}>Enrollments</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.statCard}
                    onPress={() => navigateToTab('tutors')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.statIconWrap, { backgroundColor: '#f5f3ff' }]}>
                      <Award size={20} color="#7c3aed" />
                    </View>
                    <Text style={styles.statNumber}>{stats.totalTutors}</Text>
                    <Text style={styles.statLabel}>Tutors / Mentors</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.statCard}
                    onPress={() => navigateToTab('users')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.statIconWrap, { backgroundColor: '#fdf2f8' }]}>
                      <Users size={20} color="#db2777" />
                    </View>
                    <Text style={styles.statNumber}>{stats.totalUsers}</Text>
                    <Text style={styles.statLabel}>Active Students</Text>
                  </TouchableOpacity>
                </View>

                {/* QUICK PUBLISH BANNER */}
                <TouchableOpacity
                  style={styles.actionBanner}
                  onPress={() => setAddCourseModal(true)}
                  activeOpacity={0.85}
                >
                  <View style={styles.actionBannerContent}>
                    <Sparkles size={20} color={Colors.primaryOrange} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.actionBannerTitle}>Launch Career Track</Text>
                      <Text style={styles.actionBannerSub}>
                        Add courses, specify fees, syllabus modules and publish instantly.
                      </Text>
                    </View>
                    <View style={styles.actionBannerPill}>
                      <Text style={styles.actionBannerPillText}>+ Create</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* RECENT LEADS PREVIEW */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Latest Student Inquiries</Text>
                  <TouchableOpacity onPress={() => navigateToTab('leads')}>
                    <Text style={styles.seeAllText}>View All ({leads.length})</Text>
                  </TouchableOpacity>
                </View>

                {leads.length === 0 ? (
                  <View style={styles.emptyStateBox}>
                    <PhoneCall size={32} color={Colors.textLight} />
                    <Text style={styles.emptyStateTitle}>No Inquiries Yet</Text>
                    <Text style={styles.emptyStateSub}>
                      Student leads from the app & website will appear here with instant call and WhatsApp actions.
                    </Text>
                  </View>
                ) : (
                  leads.slice(0, 3).map(lead => (
                    <View key={lead.id} style={styles.leadCard}>
                      <View style={styles.leadTopRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.leadName}>{lead.name || 'Student Lead'}</Text>
                          <Text style={styles.leadTime}>
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.statusPill,
                            lead.status === 'RESOLVED' && styles.statusResolved,
                            lead.status === 'CONTACTED' && styles.statusContacted,
                          ]}
                          onPress={() => handleOpenStatusModal(lead)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              lead.status === 'RESOLVED' && styles.statusResolvedText,
                              lead.status === 'CONTACTED' && styles.statusContactedText,
                            ]}
                          >
                            {lead.status} ▾
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {lead.message ? (
                        <View style={styles.messageBox}>
                          <Text style={styles.messageText}>{lead.message}</Text>
                        </View>
                      ) : null}

                      <View style={styles.leadActionRow}>
                        <TouchableOpacity
                          style={styles.leadCallBtn}
                          onPress={() => handleCallStudent(lead.phone)}
                        >
                          <Phone size={14} color={Colors.textWhite} />
                          <Text style={styles.leadCallBtnText}>Call: {lead.phone}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.leadWhatsAppBtn}
                          onPress={() => handleWhatsAppStudent(lead.phone, lead.name)}
                        >
                          <MessageCircle size={14} color="#16a34a" />
                          <Text style={styles.leadWhatsAppBtnText}>WhatsApp</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* ================= COURSES TAB ================= */}
            {activeTab === 'courses' && (
              <View>
                <View style={styles.tabHeaderActionRow}>
                  <View style={styles.searchBarBox}>
                    <Search size={16} color={Colors.textMuted} />
                    <TextInput
                      style={styles.searchBarInput}
                      placeholder="Search courses..."
                      placeholderTextColor={Colors.textLight}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.newBtn}
                    onPress={() => setAddCourseModal(true)}
                  >
                    <PlusCircle size={16} color={Colors.textWhite} />
                    <Text style={styles.newBtnText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {filteredPackages.length === 0 ? (
                  <View style={styles.emptyStateBox}>
                    <BookOpen size={40} color={Colors.textLight} />
                    <Text style={styles.emptyStateTitle}>No Courses Found</Text>
                    <Text style={styles.emptyStateSub}>
                      {searchQuery
                        ? `No courses matching "${searchQuery}"`
                        : 'No course programs are currently listed.'}
                    </Text>
                    {searchQuery ? (
                      <TouchableOpacity
                        style={styles.emptyResetBtn}
                        onPress={() => setSearchQuery('')}
                      >
                        <Text style={styles.emptyResetBtnText}>Clear Search Filter</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.emptyActionBtn}
                        onPress={() => setAddCourseModal(true)}
                      >
                        <PlusCircle size={16} color={Colors.textWhite} />
                        <Text style={styles.emptyActionBtnText}>Create First Course</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  filteredPackages.map(pkg => (
                    <View key={pkg.id || pkg.slug} style={styles.itemCard}>
                      <View style={styles.itemCardContentRow}>
                        <Image
                          source={{ uri: formatImageUrl(pkg.thumbnail) }}
                          style={styles.packageCardThumb}
                          resizeMode="cover"
                        />
                        <View style={{ flex: 1 }}>
                          <View style={styles.itemCardTop}>
                            <View style={{ flex: 1, marginRight: 6 }}>
                              <Text style={styles.itemCardTitle}>{pkg.title}</Text>
                              <Text style={styles.itemCardCategory}>
                                {pkg.category || 'Professional Track'} • {pkg.duration || 'Flexible'}
                              </Text>
                            </View>
                            <View style={styles.statusPillPublished}>
                              <Text style={styles.statusPillPublishedText}>{pkg.status || 'PUBLISHED'}</Text>
                            </View>
                          </View>

                          <Text style={styles.itemCardPrice}>
                            ₹{(Number(pkg.price) || 0).toLocaleString('en-IN')}
                          </Text>

                          {/* ASSIGNED TUTORS PILL */}
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: 4 }}>
                            {Array.isArray(pkg.assignedTutors) && pkg.assignedTutors.length > 0 ? (
                              <Text style={{ fontSize: 11, color: Colors.primaryOrange, fontWeight: '700' }} numberOfLines={1}>
                                👨‍🏫 Tutors: {pkg.assignedTutors.map((t: any) => t.name).join(', ')}
                              </Text>
                            ) : (
                              <Text style={{ fontSize: 11, color: Colors.textMuted, fontStyle: 'italic' }}>
                                👨‍🏫 No tutor assigned
                              </Text>
                            )}
                          </View>

                          <View style={styles.itemCardActions}>
                            <TouchableOpacity
                              style={styles.editBtn}
                              onPress={() => handleOpenEditCourse(pkg)}
                              activeOpacity={0.8}
                            >
                              <Pencil size={13} color={Colors.accentBlue} />
                              <Text style={styles.editBtnText}>Edit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.deleteBtn}
                              onPress={() => handleDeletePackage(pkg.id || pkg.slug, pkg.title)}
                              activeOpacity={0.8}
                            >
                              <Trash2 size={13} color={Colors.error} />
                              <Text style={styles.deleteBtnText}>Delete</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* ================= LEADS TAB ================= */}
            {activeTab === 'leads' && (
              <View>
                {/* FILTER PILLS */}
                <View style={styles.filterPillsRow}>
                  {(['ALL', 'NEW', 'CONTACTED', 'RESOLVED'] as const).map(f => (
                    <TouchableOpacity
                      key={f}
                      style={[styles.filterPill, leadFilter === f && styles.filterPillActive]}
                      onPress={() => setLeadFilter(f)}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          leadFilter === f && styles.filterPillTextActive,
                        ]}
                      >
                        {f}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {filteredLeads.length === 0 ? (
                  <View style={styles.emptyStateBox}>
                    <PhoneCall size={40} color={Colors.textLight} />
                    <Text style={styles.emptyStateTitle}>No Leads Found</Text>
                    <Text style={styles.emptyStateSub}>
                      {leadFilter !== 'ALL' || searchQuery
                        ? 'No inquiries matching the selected filter or search keyword.'
                        : 'New student inquiries submitted across your mobile app and website will appear here.'}
                    </Text>
                    {(leadFilter !== 'ALL' || searchQuery) && (
                      <TouchableOpacity
                        style={styles.emptyResetBtn}
                        onPress={() => {
                          setLeadFilter('ALL');
                          setSearchQuery('');
                        }}
                      >
                        <Text style={styles.emptyResetBtnText}>Reset Filters & Show All</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  filteredLeads.map(lead => (
                    <View key={lead.id} style={styles.leadCard}>
                      <View style={styles.leadTopRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.leadName}>{lead.name || 'Student Lead'}</Text>
                          <Text style={styles.leadTime}>
                            {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={[
                            styles.statusPill,
                            lead.status === 'RESOLVED' && styles.statusResolved,
                            lead.status === 'CONTACTED' && styles.statusContacted,
                          ]}
                          onPress={() => handleOpenStatusModal(lead)}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              lead.status === 'RESOLVED' && styles.statusResolvedText,
                              lead.status === 'CONTACTED' && styles.statusContactedText,
                            ]}
                          >
                            {lead.status} ▾
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {lead.message ? (
                        <View style={styles.messageBox}>
                          <Text style={styles.messageText}>{lead.message}</Text>
                        </View>
                      ) : null}

                      <View style={styles.leadActionRow}>
                        <TouchableOpacity
                          style={styles.leadCallBtn}
                          onPress={() => handleCallStudent(lead.phone)}
                        >
                          <Phone size={14} color={Colors.textWhite} />
                          <Text style={styles.leadCallBtnText}>Call: {lead.phone}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.leadWhatsAppBtn}
                          onPress={() => handleWhatsAppStudent(lead.phone, lead.name)}
                        >
                          <MessageCircle size={14} color="#16a34a" />
                          <Text style={styles.leadWhatsAppBtnText}>WhatsApp</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* ================= ENROLLMENTS TAB ================= */}
            {activeTab === 'enrollments' && (
              <View>
                {/* SEARCH & FILTERS */}
                <View style={styles.tabHeaderActionRow}>
                  <View style={styles.searchBarBox}>
                    <Search size={16} color={Colors.textMuted} />
                    <TextInput
                      style={styles.searchBarInput}
                      placeholder="Search student, course, email..."
                      placeholderTextColor={Colors.textLight}
                      value={enrollmentSearch}
                      onChangeText={setEnrollmentSearch}
                    />
                  </View>
                </View>

                {/* STATUS FILTER PILLS */}
                <View style={styles.filterPillsRow}>
                  {(['ALL', 'ACTIVE', 'COMPLETED', 'EXPIRED'] as const).map(f => (
                    <TouchableOpacity
                      key={f}
                      style={[styles.filterPill, enrollmentStatusFilter === f && styles.filterPillActive]}
                      onPress={() => setEnrollmentStatusFilter(f)}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          enrollmentStatusFilter === f && styles.filterPillTextActive,
                        ]}
                      >
                        {f}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {filteredEnrollments.length === 0 ? (
                  <View style={styles.emptyStateBox}>
                    <GraduationCap size={40} color={Colors.textLight} />
                    <Text style={styles.emptyStateTitle}>No Enrollments Found</Text>
                    <Text style={styles.emptyStateSub}>
                      {enrollmentSearch || enrollmentStatusFilter !== 'ALL'
                        ? 'No student registrations match your current filter or search.'
                        : 'When students purchase or join courses, their records and 12-class attendance will appear here.'}
                    </Text>
                    {(enrollmentSearch || enrollmentStatusFilter !== 'ALL') && (
                      <TouchableOpacity
                        style={styles.emptyResetBtn}
                        onPress={() => {
                          setEnrollmentSearch('');
                          setEnrollmentStatusFilter('ALL');
                        }}
                      >
                        <Text style={styles.emptyResetBtnText}>Reset Enrollment Filters</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  filteredEnrollments.map(enr => {
                    const studentName = enr.user?.name || enr.User?.name || 'Enrolled Student';
                    const studentEmail = enr.user?.email || enr.User?.email || 'Verified Account';
                    const studentPhone = enr.user?.phone || enr.User?.phone || '';
                    const courseTitle = enr.package?.title || enr.Package?.title || 'LMS Career Program';
                    const courseCategory = enr.package?.category || enr.Package?.category || 'Track';
                    const courseDuration = enr.package?.duration || enr.Package?.duration || '12 Weeks';
                    const enrollDate = enr.createdAt || enr.enrolledAt ? new Date(enr.createdAt || enr.enrolledAt).toLocaleDateString() : 'Active';

                    const total = enr.totalClasses || 12;
                    const conducted = enr.conductedClasses || 0;
                    const attended = enr.attendedClasses || 0;
                    const missed = enr.missedClasses || Math.max(0, conducted - attended);
                    const remaining = enr.remainingClasses || Math.max(0, total - conducted);
                    const progress = enr.progressPercentage || Math.min(100, Math.round((conducted / total) * 100));
                    const statusStr = (enr.status || (enr.isExpired ? 'EXPIRED' : progress >= 100 ? 'COMPLETED' : 'ACTIVE')).toUpperCase();

                    return (
                      <View key={enr.id} style={styles.enrollmentCard}>
                        {/* STUDENT & STATUS TOP */}
                        <View style={styles.enrTopRow}>
                          <View style={styles.enrAvatar}>
                            <Text style={styles.enrAvatarText}>
                              {studentName ? studentName[0].toUpperCase() : 'S'}
                            </Text>
                          </View>
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.enrStudentName}>{studentName}</Text>
                            <Text style={styles.enrStudentEmail}>{studentEmail}</Text>
                            {studentPhone ? (
                              <Text style={styles.enrStudentPhone}>{studentPhone}</Text>
                            ) : null}
                          </View>
                          <View
                            style={[
                              styles.enrStatusBadge,
                              statusStr === 'COMPLETED' && styles.enrStatusCompleted,
                              statusStr === 'EXPIRED' && styles.enrStatusExpired,
                            ]}
                          >
                            <Text
                              style={[
                                styles.enrStatusText,
                                statusStr === 'COMPLETED' && styles.enrStatusCompletedText,
                                statusStr === 'EXPIRED' && styles.enrStatusExpiredText,
                              ]}
                            >
                              {statusStr}
                            </Text>
                          </View>
                        </View>

                        {/* COURSE INFO */}
                        <View style={styles.enrCourseBox}>
                          <BookOpen size={15} color={Colors.primaryOrange} />
                          <View style={{ flex: 1, marginLeft: 8 }}>
                            <Text style={styles.enrCourseName}>{courseTitle}</Text>
                            <Text style={styles.enrCourseCategory}>{courseCategory} • {courseDuration}</Text>
                          </View>
                        </View>

                        {/* 12-CLASS PROGRESS TRACKER */}
                        <View style={styles.enrProgressSection}>
                          <View style={styles.enrProgressHeader}>
                            <Text style={styles.enrProgressTitle}>12-Class Attendance Progress</Text>
                            <Text style={styles.enrProgressPercent}>{progress}% ({conducted}/{total} classes)</Text>
                          </View>

                          <View style={styles.progressBarTrack}>
                            <View
                              style={[
                                styles.progressBarFill,
                                { width: `${progress}%` },
                                statusStr === 'COMPLETED' && { backgroundColor: Colors.success },
                              ]}
                            />
                          </View>

                          {/* ATTENDANCE BADGES BREAKDOWN */}
                          <View style={styles.attendanceBadgesRow}>
                            <View style={styles.attBadgeAttended}>
                              <CheckCircle size={12} color="#15803d" />
                              <Text style={styles.attBadgeAttendedText}>{attended} Attended</Text>
                            </View>
                            <View style={styles.attBadgeMissed}>
                              <AlertCircle size={12} color="#b91c1c" />
                              <Text style={styles.attBadgeMissedText}>{missed} Missed</Text>
                            </View>
                            <View style={styles.attBadgeRemaining}>
                              <Clock size={12} color="#6b7280" />
                              <Text style={styles.attBadgeRemainingText}>{remaining} Remaining</Text>
                            </View>
                          </View>
                        </View>

                        {/* CARD FOOTER WITH DETAILS BUTTON */}
                        <View style={styles.enrCardFooter}>
                          <Text style={styles.enrJoinedText}>Joined: {enrollDate}</Text>
                          <TouchableOpacity
                            style={styles.enrViewDetailsBtn}
                            onPress={() => handleViewEnrollment(enr)}
                            activeOpacity={0.8}
                          >
                            <Eye size={13} color={Colors.primaryOrange} />
                            <Text style={styles.enrViewDetailsBtnText}>View Details</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {/* ================= TUTORS TAB ================= */}
            {activeTab === 'tutors' && (
              <View>
                {/* TUTOR SEARCH */}
                <View style={styles.tabHeaderActionRow}>
                  <View style={styles.searchBarBox}>
                    <Search size={16} color={Colors.textMuted} />
                    <TextInput
                      style={styles.searchBarInput}
                      placeholder="Search tutors by name, email, course..."
                      placeholderTextColor={Colors.textLight}
                      value={tutorSearchQuery}
                      onChangeText={setTutorSearchQuery}
                    />
                  </View>
                </View>

                {/* TUTOR OVERVIEW BANNER */}
                <View style={styles.tutorHeaderSummary}>
                  <Award size={18} color="#7c3aed" />
                  <Text style={styles.tutorHeaderSummaryText}>
                    Active Instructors & Course Allocations ({filteredTutors.length})
                  </Text>
                </View>

                {filteredTutors.length === 0 ? (
                  <View style={styles.emptyStateBox}>
                    <Award size={40} color={Colors.textLight} />
                    <Text style={styles.emptyStateTitle}>No Tutors Found</Text>
                    <Text style={styles.emptyStateSub}>
                      {tutorSearchQuery
                        ? `No tutors matching "${tutorSearchQuery}".`
                        : 'No instructors or tutors are currently registered. You can add users with TUTOR role in the Users tab.'}
                    </Text>
                    {tutorSearchQuery ? (
                      <TouchableOpacity
                        style={styles.emptyResetBtn}
                        onPress={() => setTutorSearchQuery('')}
                      >
                        <Text style={styles.emptyResetBtnText}>Clear Search</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.emptyActionBtn}
                        onPress={() => {
                          setNewUserRole('TUTOR');
                          setAddUserModal(true);
                        }}
                      >
                        <UserPlus size={16} color={Colors.textWhite} />
                        <Text style={styles.emptyActionBtnText}>Add Tutor Account</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  filteredTutors.map(tutor => {
                    const tutorName = tutor.name || 'Instructor';
                    const tutorEmail = tutor.email || 'N/A';
                    const coursesCount = tutor.coursesCount ?? (Array.isArray(tutor.courses) ? tutor.courses.length : 0);
                    const studentsCount = tutor.studentsCount ?? 0;
                    const assignedCourses = Array.isArray(tutor.courses) ? tutor.courses : [];

                    return (
                      <View key={tutor.id} style={styles.tutorCard}>
                        {/* TUTOR PROFILE TOP */}
                        <View style={styles.tutorCardTop}>
                          <View style={styles.tutorAvatar}>
                            <Text style={styles.tutorAvatarText}>
                              {tutorName ? tutorName[0].toUpperCase() : 'T'}
                            </Text>
                          </View>
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <Text style={styles.tutorName}>{tutorName}</Text>
                            <Text style={styles.tutorEmail}>{tutorEmail}</Text>
                          </View>
                          <View style={styles.tutorRolePill}>
                            <Text style={styles.tutorRolePillText}>INSTRUCTOR</Text>
                          </View>
                        </View>

                        {/* TUTOR METRICS: COURSES & STUDENTS */}
                        <View style={styles.tutorMetricsRow}>
                          <View style={styles.tutorMetricBox}>
                            <BookOpen size={16} color={Colors.primaryOrange} />
                            <View style={{ marginLeft: 8 }}>
                              <Text style={styles.tutorMetricValue}>{coursesCount}</Text>
                              <Text style={styles.tutorMetricLabel}>Assigned Courses</Text>
                            </View>
                          </View>

                          <View style={styles.tutorMetricBox}>
                            <Users size={16} color="#2563eb" />
                            <View style={{ marginLeft: 8 }}>
                              <Text style={styles.tutorMetricValue}>{studentsCount}</Text>
                              <Text style={styles.tutorMetricLabel}>Enrolled Students</Text>
                            </View>
                          </View>
                        </View>

                        {/* ASSIGNED COURSES CHIPS */}
                        {assignedCourses.length > 0 && (
                          <View style={styles.tutorCoursesWrap}>
                            <Text style={styles.tutorCoursesLabel}>Assigned Tracks:</Text>
                            <View style={styles.tutorCourseChipsRow}>
                              {assignedCourses.slice(0, 3).map((c: any, idx: number) => (
                                <View key={c.id || idx} style={styles.tutorCourseChip}>
                                  <Text style={styles.tutorCourseChipText} numberOfLines={1}>
                                    {c.title || 'Course Track'}
                                  </Text>
                                </View>
                              ))}
                              {assignedCourses.length > 3 && (
                                <View style={[styles.tutorCourseChip, { backgroundColor: '#f1f5f9' }]}>
                                  <Text style={[styles.tutorCourseChipText, { color: Colors.textSecondary }]}>
                                    +{assignedCourses.length - 3} more
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        )}

                        {/* TUTOR CARD ACTIONS */}
                        <View style={[styles.tutorCardActions, { flexDirection: 'row', gap: 8 }]}>
                          <TouchableOpacity
                            style={[styles.tutorDetailsBtn, { flex: 1 }]}
                            onPress={() => handleViewTutor(tutor)}
                            activeOpacity={0.8}
                          >
                            <Eye size={14} color="#7c3aed" />
                            <Text style={styles.tutorDetailsBtnText}>View Roster</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.tutorDetailsBtn,
                              { flex: 1, backgroundColor: '#fff7ed', borderColor: '#fed7aa', borderWidth: 1 },
                            ]}
                            onPress={() => handleOpenAssignCoursesToTutor(tutor)}
                            activeOpacity={0.8}
                          >
                            <UserCheck size={14} color={Colors.primaryOrange} />
                            <Text style={[styles.tutorDetailsBtnText, { color: Colors.primaryOrange }]}>
                              Assign Courses
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}

            {/* ================= USERS TAB ================= */}
            {activeTab === 'users' && (
              <View>
                {/* TOP ACTION ROW: Search & Add User */}
                <View style={styles.tabHeaderActionRow}>
                  <View style={styles.searchBarBox}>
                    <Search size={16} color={Colors.textMuted} />
                    <TextInput
                      style={styles.searchBarInput}
                      placeholder="Search users..."
                      placeholderTextColor={Colors.textLight}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.newBtn}
                    onPress={() => setAddUserModal(true)}
                  >
                    <UserPlus size={16} color={Colors.textWhite} />
                    <Text style={styles.newBtnText}>Add User</Text>
                  </TouchableOpacity>
                </View>

                {/* ROLE FILTER PILLS */}
                <View style={styles.filterPillsRow}>
                  {(['ALL', 'STUDENT', 'TUTOR', 'ADMIN'] as const).map(role => (
                    <TouchableOpacity
                      key={role}
                      style={[styles.filterPill, userRoleFilter === role && styles.filterPillActive]}
                      onPress={() => setUserRoleFilter(role)}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          userRoleFilter === role && styles.filterPillTextActive,
                        ]}
                      >
                        {role}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {filteredUsers.length === 0 ? (
                  <View style={styles.emptyStateBox}>
                    <Users size={40} color={Colors.textLight} />
                    <Text style={styles.emptyStateTitle}>No Users Found</Text>
                    <Text style={styles.emptyStateSub}>
                      {userRoleFilter !== 'ALL' || searchQuery
                        ? 'No accounts match your search or role filter criteria.'
                        : 'No user accounts available yet. Tap "+ Add User" above to create student, tutor, or admin accounts.'}
                    </Text>
                    {userRoleFilter !== 'ALL' || searchQuery ? (
                      <TouchableOpacity
                        style={styles.emptyResetBtn}
                        onPress={() => {
                          setUserRoleFilter('ALL');
                          setSearchQuery('');
                        }}
                      >
                        <Text style={styles.emptyResetBtnText}>Reset User Filters</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={styles.emptyActionBtn}
                        onPress={() => setAddUserModal(true)}
                      >
                        <UserPlus size={16} color={Colors.textWhite} />
                        <Text style={styles.emptyActionBtnText}>Add First User</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  filteredUsers.map(u => (
                    <View key={u.id} style={styles.userCard}>
                      <View style={styles.userCardTopRow}>
                        <View style={styles.userAvatar}>
                          <Text style={styles.userAvatarText}>{u.name ? u.name[0].toUpperCase() : 'U'}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.userNameText}>{u.name || 'User'}</Text>
                          <Text style={styles.userEmailText}>{u.email || 'N/A'}</Text>
                          <Text style={styles.userJoinedText}>
                            Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recently'}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.roleBadge,
                            u.role === 'ADMIN' && styles.roleBadgeAdmin,
                            u.role === 'TUTOR' && styles.roleBadgeTutor,
                          ]}
                        >
                          <Text style={styles.roleBadgeText}>{u.role || 'STUDENT'}</Text>
                        </View>
                      </View>

                      {/* USER ACTION BUTTONS: EDIT & DELETE */}
                      <View style={styles.userActionRow}>
                        <TouchableOpacity
                          style={styles.userEditBtn}
                          onPress={() => handleOpenEditUser(u)}
                          activeOpacity={0.8}
                        >
                          <Pencil size={13} color={Colors.primaryOrange} />
                          <Text style={styles.userEditBtnText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.userDeleteBtn}
                          onPress={() => handleDeleteUser(u)}
                          activeOpacity={0.8}
                        >
                          <Trash2 size={13} color={Colors.error} />
                          <Text style={styles.userDeleteBtnText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* ================= TOOLS: CATEGORIES & COUPONS TAB ================= */}
            {activeTab === 'tools' && (
              <View>
                {/* CATEGORIES SECTION */}
                <View style={styles.toolsSectionHeader}>
                  <Text style={styles.toolsSectionTitle}>Course Categories ({categories.length})</Text>
                  <TouchableOpacity
                    style={styles.toolsAddBtn}
                    onPress={() => setAddCategoryModal(true)}
                  >
                    <PlusCircle size={14} color={Colors.textWhite} />
                    <Text style={styles.toolsAddBtnText}>Add Category</Text>
                  </TouchableOpacity>
                </View>

                {categories.length === 0 ? (
                  <View style={styles.emptyStateBox}>
                    <Tag size={32} color={Colors.textLight} />
                    <Text style={styles.emptyStateTitle}>No Categories</Text>
                    <Text style={styles.emptyStateSub}>
                      Add categories like "Web Development", "AI", or "Digital Marketing" to organize your curriculum.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.toolsListWrap}>
                    {categories.map(cat => (
                      <View key={cat.id || cat.slug} style={styles.categoryCard}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <View style={styles.categoryCardNameRow}>
                            <Tag size={15} color={Colors.primaryOrange} />
                            <Text style={styles.categoryItemName}>{cat.name}</Text>
                          </View>
                          {cat.description ? (
                            <Text style={styles.categoryDescText}>{cat.description}</Text>
                          ) : null}
                        </View>

                        {/* CATEGORY CRUD ACTIONS: EDIT & DELETE */}
                        <View style={styles.toolActionRow}>
                          <TouchableOpacity
                            style={styles.toolEditBtn}
                            onPress={() => handleOpenEditCategory(cat)}
                            activeOpacity={0.8}
                          >
                            <Pencil size={12} color={Colors.accentBlue} />
                            <Text style={styles.toolEditBtnText}>Edit</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.toolDeleteBtn}
                            onPress={() => handleDeleteCategory(cat)}
                            activeOpacity={0.8}
                          >
                            <Trash2 size={12} color={Colors.error} />
                            <Text style={styles.toolDeleteBtnText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* COUPONS SECTION */}
                <View style={[styles.toolsSectionHeader, { marginTop: 24 }]}>
                  <Text style={styles.toolsSectionTitle}>Discount Coupons ({coupons.length})</Text>
                  <TouchableOpacity
                    style={styles.toolsAddBtn}
                    onPress={() => setAddCouponModal(true)}
                  >
                    <PlusCircle size={14} color={Colors.textWhite} />
                    <Text style={styles.toolsAddBtnText}>Create Coupon</Text>
                  </TouchableOpacity>
                </View>

                {coupons.length === 0 ? (
                  <View style={styles.emptyStateBox}>
                    <Ticket size={32} color={Colors.textLight} />
                    <Text style={styles.emptyStateTitle}>No Active Coupons</Text>
                    <Text style={styles.emptyStateSub}>
                      Tap "Create Coupon" above to generate promotional coupon codes for students.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.toolsListWrap}>
                    {coupons.map(cp => {
                      const discountVal = cp.discountPercentage || cp.discountPercent || 10;
                      return (
                        <View key={cp.id || cp.code} style={styles.couponCard}>
                          <View style={{ flex: 1, marginRight: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <Ticket size={15} color={Colors.primaryOrange} style={{ marginRight: 6 }} />
                              <Text style={styles.couponCodeText}>{cp.code}</Text>
                              <View style={styles.couponActivePill}>
                                <Text style={styles.couponActiveText}>ACTIVE</Text>
                              </View>
                            </View>
                            <Text style={styles.couponDetailText}>
                              {discountVal}% Discount Promo
                            </Text>
                          </View>

                          {/* COUPON CRUD ACTIONS: EDIT & DELETE */}
                          <View style={styles.toolActionRow}>
                            <TouchableOpacity
                              style={styles.toolEditBtn}
                              onPress={() => handleOpenEditCoupon(cp)}
                              activeOpacity={0.8}
                            >
                              <Pencil size={12} color={Colors.accentBlue} />
                              <Text style={styles.toolEditBtnText}>Edit</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={styles.toolDeleteBtn}
                              onPress={() => handleDeleteCoupon(cp)}
                              activeOpacity={0.8}
                            >
                              <Trash2 size={12} color={Colors.error} />
                              <Text style={styles.toolDeleteBtnText}>Delete</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            <View style={{ height: bottomPadding + 30 }} />
          </>
        )}
      </ScrollView>

      {/* BOTTOM NAVIGATION BAR */}
      <View style={[styles.bottomNavContainer, { paddingBottom: bottomPadding }]}>
        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => setActiveTab('overview')}
          activeOpacity={0.7}
        >
          <View style={[styles.bottomNavIconWrap, activeTab === 'overview' && styles.bottomNavIconWrapActive]}>
            <LayoutDashboard
              size={18}
              color={activeTab === 'overview' ? Colors.primaryOrange : Colors.textMuted}
              strokeWidth={activeTab === 'overview' ? 2.4 : 1.8}
            />
          </View>
          <Text style={[styles.bottomNavLabel, activeTab === 'overview' && styles.bottomNavLabelActive]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => setActiveTab('courses')}
          activeOpacity={0.7}
        >
          <View style={[styles.bottomNavIconWrap, activeTab === 'courses' && styles.bottomNavIconWrapActive]}>
            <BookOpen
              size={18}
              color={activeTab === 'courses' ? Colors.primaryOrange : Colors.textMuted}
              strokeWidth={activeTab === 'courses' ? 2.4 : 1.8}
            />
            {packages.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>
                  {packages.length > 99 ? '99+' : packages.length}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.bottomNavLabel, activeTab === 'courses' && styles.bottomNavLabelActive]}>
            Courses
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => setActiveTab('leads')}
          activeOpacity={0.7}
        >
          <View style={[styles.bottomNavIconWrap, activeTab === 'leads' && styles.bottomNavIconWrapActive]}>
            <PhoneCall
              size={18}
              color={activeTab === 'leads' ? Colors.primaryOrange : Colors.textMuted}
              strokeWidth={activeTab === 'leads' ? 2.4 : 1.8}
            />
            {leads.length > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: '#ea580c' }]}>
                <Text style={styles.tabBadgeText}>
                  {leads.length > 99 ? '99+' : leads.length}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.bottomNavLabel, activeTab === 'leads' && styles.bottomNavLabelActive]}>
            Leads
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => setActiveTab('enrollments')}
          activeOpacity={0.7}
        >
          <View style={[styles.bottomNavIconWrap, activeTab === 'enrollments' && styles.bottomNavIconWrapActive]}>
            <GraduationCap
              size={18}
              color={activeTab === 'enrollments' ? Colors.primaryOrange : Colors.textMuted}
              strokeWidth={activeTab === 'enrollments' ? 2.4 : 1.8}
            />
            {enrollments.length > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: '#2563eb' }]}>
                <Text style={styles.tabBadgeText}>
                  {enrollments.length > 99 ? '99+' : enrollments.length}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.bottomNavLabel, activeTab === 'enrollments' && styles.bottomNavLabelActive]}>
            Enrollments
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => setActiveTab('tutors')}
          activeOpacity={0.7}
        >
          <View style={[styles.bottomNavIconWrap, activeTab === 'tutors' && styles.bottomNavIconWrapActive]}>
            <Award
              size={18}
              color={activeTab === 'tutors' ? Colors.primaryOrange : Colors.textMuted}
              strokeWidth={activeTab === 'tutors' ? 2.4 : 1.8}
            />
            {tutors.length > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: '#7c3aed' }]}>
                <Text style={styles.tabBadgeText}>
                  {tutors.length > 99 ? '99+' : tutors.length}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.bottomNavLabel, activeTab === 'tutors' && styles.bottomNavLabelActive]}>
            Tutors
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => setActiveTab('users')}
          activeOpacity={0.7}
        >
          <View style={[styles.bottomNavIconWrap, activeTab === 'users' && styles.bottomNavIconWrapActive]}>
            <Users
              size={18}
              color={activeTab === 'users' ? Colors.primaryOrange : Colors.textMuted}
              strokeWidth={activeTab === 'users' ? 2.4 : 1.8}
            />
            {usersList.length > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: '#10b981' }]}>
                <Text style={styles.tabBadgeText}>
                  {usersList.length > 99 ? '99+' : usersList.length}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.bottomNavLabel, activeTab === 'users' && styles.bottomNavLabelActive]}>
            Users
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= MODAL: CREATE COURSE ================= */}
      <Modal
        visible={addCourseModal}
        animationType="slide"
        transparent
        onRequestClose={() => setAddCourseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingTop: Math.max(insets.top, 24) }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Publish Career Program</Text>
                <Text style={styles.modalSub}>Syncs live to website and student apps</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setAddCourseModal(false)}
              >
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Course Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Full Stack MERN Developer with AI"
                  placeholderTextColor={Colors.textLight}
                  value={courseTitle}
                  onChangeText={setCourseTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Delivery Mode</Text>
                <View style={styles.rolePickerRow}>
                  {(['ONLINE', 'OFFLINE', 'BOTH'] as const).map(m => (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.rolePickerItem,
                        courseMode === m && styles.rolePickerItemActive,
                      ]}
                      onPress={() => setCourseMode(m)}
                    >
                      <Text
                        style={[
                          styles.rolePickerItemText,
                          courseMode === m && styles.rolePickerItemTextActive,
                        ]}
                      >
                        {m === 'ONLINE' ? 'Online' : m === 'OFFLINE' ? 'Offline' : 'Both'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                {categories.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8, marginTop: 4 }}>
                    {categories.map((cat: any) => (
                      <TouchableOpacity
                        key={cat.id || cat.name}
                        onPress={() => setCourseCategory(cat.name)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 16,
                          backgroundColor: courseCategory === cat.name ? '#fff7ed' : Colors.surfaceSubtle,
                          borderColor: courseCategory === cat.name ? Colors.primaryOrange : Colors.border,
                          borderWidth: 1,
                          marginRight: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: courseCategory === cat.name ? '700' : '500',
                            color: courseCategory === cat.name ? Colors.primaryOrange : Colors.textSecondary,
                          }}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Web Development"
                  placeholderTextColor={Colors.textLight}
                  value={courseCategory}
                  onChangeText={setCourseCategory}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Program Fee (₹)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="35000"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                    value={coursePrice}
                    onChangeText={setCoursePrice}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Status</Text>
                  <View style={styles.rolePickerRow}>
                    <TouchableOpacity
                      style={[
                        styles.rolePickerItem,
                        courseStatus === 'PUBLISHED' && styles.rolePickerItemActive,
                      ]}
                      onPress={() => setCourseStatus('PUBLISHED')}
                    >
                      <Text
                        style={[
                          styles.rolePickerItemText,
                          courseStatus === 'PUBLISHED' && styles.rolePickerItemTextActive,
                        ]}
                      >
                        PUBLISHED
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.rolePickerItem,
                        courseStatus === 'DRAFT' && styles.rolePickerItemActive,
                      ]}
                      onPress={() => setCourseStatus('DRAFT')}
                    >
                      <Text
                        style={[
                          styles.rolePickerItemText,
                          courseStatus === 'DRAFT' && styles.rolePickerItemTextActive,
                        ]}
                      >
                        DRAFT
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Rating</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="4.9"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                    value={courseRating}
                    onChangeText={setCourseRating}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Reviews Count</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1.2k+"
                    placeholderTextColor={Colors.textLight}
                    value={courseReviewsCount}
                    onChangeText={setCourseReviewsCount}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Course Level</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Beginner to Advanced"
                    placeholderTextColor={Colors.textLight}
                    value={courseLevel}
                    onChangeText={setCourseLevel}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Total Classes</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="12"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                    value={courseTotalClasses}
                    onChangeText={setCourseTotalClasses}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 6 Months / 12 Weeks"
                  placeholderTextColor={Colors.textLight}
                  value={courseDuration}
                  onChangeText={setCourseDuration}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Thumbnail Image URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://images.unsplash.com/... (optional)"
                  placeholderTextColor={Colors.textLight}
                  value={courseThumbnail}
                  onChangeText={setCourseThumbnail}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Course Video URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://www.youtube.com/embed/... (optional)"
                  placeholderTextColor={Colors.textLight}
                  value={courseVideoUrl}
                  onChangeText={setCourseVideoUrl}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Program overview and student outcomes..."
                  placeholderTextColor={Colors.textLight}
                  multiline
                  numberOfLines={4}
                  value={courseDesc}
                  onChangeText={setCourseDesc}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Skills You'll Gain (comma-separated)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="React, Node.js, Express, MongoDB"
                  placeholderTextColor={Colors.textLight}
                  value={courseSkills}
                  onChangeText={setCourseSkills}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tech Stack (comma-separated)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="JavaScript, TypeScript, Git, Docker"
                  placeholderTextColor={Colors.textLight}
                  value={courseTech}
                  onChangeText={setCourseTech}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Benefits of This Course (1 per line)</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { minHeight: 90 }]}
                  placeholder="100% Practical Training with Live Projects&#10;Placement Assistance&#10;Certification"
                  placeholderTextColor={Colors.textLight}
                  multiline
                  numberOfLines={4}
                  value={courseBenefits}
                  onChangeText={setCourseBenefits}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>What You'll Learn (1 per line)</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { minHeight: 90 }]}
                  placeholder="Master Modern Full-Stack Development&#10;Build Production Projects"
                  placeholderTextColor={Colors.textLight}
                  multiline
                  numberOfLines={4}
                  value={courseWhatYoullLearn}
                  onChangeText={setCourseWhatYoullLearn}
                />
              </View>

              {/* ASSIGN COURSE TUTORS */}
              <View style={styles.inputGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={styles.inputLabel}>Assign Course Tutors</Text>
                  <Text style={{ fontSize: 11, color: Colors.primaryOrange, fontWeight: '700' }}>
                    {courseTutorIds.length} Selected
                  </Text>
                </View>
                {availableTutors.length === 0 ? (
                  <View style={{ padding: 12, borderRadius: 10, backgroundColor: Colors.surfaceSubtle, borderWidth: 1, borderColor: Colors.border }}>
                    <Text style={{ fontSize: 12, color: Colors.textMuted, fontStyle: 'italic' }}>
                      No tutors registered. Add a tutor under the Users tab first.
                    </Text>
                  </View>
                ) : (
                  <View style={{ gap: 8 }}>
                    {availableTutors.map((tut: any) => {
                      const isSelected = courseTutorIds.includes(tut.id);
                      const tutName = tut.name || tut.email;
                      return (
                        <TouchableOpacity
                          key={tut.id}
                          onPress={() => {
                            setCourseTutorIds(prev =>
                              prev.includes(tut.id) ? prev.filter(id => id !== tut.id) : [...prev, tut.id]
                            );
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 10,
                            borderRadius: 12,
                            borderWidth: 1.5,
                            borderColor: isSelected ? Colors.primaryOrange : Colors.border,
                            backgroundColor: isSelected ? '#fff7ed' : Colors.surfaceSubtle,
                          }}
                          activeOpacity={0.7}
                        >
                          <View
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              backgroundColor: isSelected ? Colors.primaryOrange : '#e2e8f0',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 10,
                            }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: '700', color: isSelected ? '#fff' : Colors.textPrimary }}>
                              {(tutName || 'T')[0].toUpperCase()}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: isSelected ? Colors.primaryOrange : Colors.textPrimary }}>
                              {tutName}
                            </Text>
                            <Text style={{ fontSize: 11, color: Colors.textMuted }}>
                              {tut.professionTitle || tut.email}
                            </Text>
                          </View>
                          <View
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 6,
                              borderWidth: 1.5,
                              borderColor: isSelected ? Colors.primaryOrange : Colors.border,
                              backgroundColor: isSelected ? Colors.primaryOrange : '#fff',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCreateCourse}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.textWhite} />
                ) : (
                  <Text style={styles.submitBtnText}>Publish Course Live</Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: ADD CATEGORY ================= */}
      <Modal
        visible={addCategoryModal}
        animationType="fade"
        transparent
        onRequestClose={() => setAddCategoryModal(false)}
      >
        <View style={styles.modalCenterOverlay}>
          <View style={styles.modalCenterCard}>
            <Text style={styles.modalCenterTitle}>Create Category</Text>
            <TextInput
              style={[styles.input, { marginVertical: 14 }]}
              placeholder="e.g. Artificial Intelligence"
              placeholderTextColor={Colors.textLight}
              value={newCatName}
              onChangeText={setNewCatName}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAddCategoryModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleCreateCategory}
                disabled={submitting}
              >
                <Text style={styles.modalSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: ADD COUPON ================= */}
      <Modal
        visible={addCouponModal}
        animationType="fade"
        transparent
        onRequestClose={() => setAddCouponModal(false)}
      >
        <View style={styles.modalCenterOverlay}>
          <View style={styles.modalCenterCard}>
            <Text style={styles.modalCenterTitle}>Generate Discount Coupon</Text>
            <TextInput
              style={[styles.input, { marginTop: 12, marginBottom: 8 }]}
              placeholder="COUPON CODE (e.g. FLYMEDIA25)"
              placeholderTextColor={Colors.textLight}
              autoCapitalize="characters"
              value={newCouponCode}
              onChangeText={setNewCouponCode}
            />
            <TextInput
              style={[styles.input, { marginBottom: 16 }]}
              placeholder="Discount % (e.g. 20)"
              placeholderTextColor={Colors.textLight}
              keyboardType="numeric"
              value={newCouponPercent}
              onChangeText={setNewCouponPercent}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAddCouponModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleCreateCoupon}
                disabled={submitting}
              >
                <Text style={styles.modalSaveBtnText}>Create Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: ADD USER ================= */}
      <Modal
        visible={addUserModal}
        animationType="slide"
        transparent
        onRequestClose={() => setAddUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingTop: Math.max(insets.top, 24) }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add / Invite User</Text>
                <Text style={styles.modalSub}>Create a new student, tutor, or admin account</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setAddUserModal(false)}
              >
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. John Doe"
                  placeholderTextColor={Colors.textLight}
                  value={newUserName}
                  onChangeText={setNewUserName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="student@flymediatech.com"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={newUserEmail}
                  onChangeText={setNewUserEmail}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Initial Password *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Minimum 6 characters"
                  placeholderTextColor={Colors.textLight}
                  secureTextEntry
                  value={newUserPassword}
                  onChangeText={setNewUserPassword}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Role</Text>
                <View style={styles.rolePickerRow}>
                  {(['STUDENT', 'TUTOR', 'ADMIN'] as const).map(role => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.rolePickerItem,
                        newUserRole === role && styles.rolePickerItemActive,
                      ]}
                      onPress={() => setNewUserRole(role)}
                    >
                      <Text
                        style={[
                          styles.rolePickerItemText,
                          newUserRole === role && styles.rolePickerItemTextActive,
                        ]}
                      >
                        {role}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCreateUser}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.textWhite} />
                ) : (
                  <Text style={styles.submitBtnText}>Create Account</Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: EDIT USER ================= */}
      <Modal
        visible={editUserModal}
        animationType="slide"
        transparent
        onRequestClose={() => setEditUserModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingTop: Math.max(insets.top, 24) }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit User Profile</Text>
                <Text style={styles.modalSub}>Update user permissions, name, or reset password</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setEditUserModal(false)}
              >
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. John Doe"
                  placeholderTextColor={Colors.textLight}
                  value={editUserName}
                  onChangeText={setEditUserName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="student@flymediatech.com"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={editUserEmail}
                  onChangeText={setEditUserEmail}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Account Role</Text>
                <View style={styles.rolePickerRow}>
                  {(['STUDENT', 'TUTOR', 'ADMIN'] as const).map(role => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.rolePickerItem,
                        editUserRole === role && styles.rolePickerItemActive,
                      ]}
                      onPress={() => setEditUserRole(role)}
                    >
                      <Text
                        style={[
                          styles.rolePickerItemText,
                          editUserRole === role && styles.rolePickerItemTextActive,
                        ]}
                      >
                        {role}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Reset Password (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Leave empty to keep existing password"
                  placeholderTextColor={Colors.textLight}
                  secureTextEntry
                  value={editUserPassword}
                  onChangeText={setEditUserPassword}
                />
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSaveEditUser}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.textWhite} />
                ) : (
                  <Text style={styles.submitBtnText}>Save User Changes</Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: UPDATE LEAD STATUS ================= */}
      <Modal
        visible={statusModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalCenterOverlay}>
          <View style={styles.modalCenterCard}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalCenterTitle}>Update Lead Status</Text>
                <Text style={styles.modalCenterSub}>
                  {selectedLeadForStatus?.name || 'Student Lead'} • {selectedLeadForStatus?.phone || ''}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtnSmall}
                onPress={() => setStatusModalVisible(false)}
              >
                <X size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {updatingStatus ? (
              <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                <ActivityIndicator color={Colors.primaryOrange} />
                <Text style={{ marginTop: 8, color: Colors.textMuted, fontSize: 13 }}>Updating lead status...</Text>
              </View>
            ) : (
              <View style={styles.statusOptionList}>
                <TouchableOpacity
                  style={[
                    styles.statusOptionCard,
                    selectedLeadForStatus?.status === 'NEW' && styles.statusOptionCardActiveNew,
                  ]}
                  onPress={() => handleSelectLeadStatus('NEW')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.statusOptionDot, { backgroundColor: '#2563eb' }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.statusOptionTitle, { color: '#2563eb' }]}>NEW</Text>
                    <Text style={styles.statusOptionDesc}>Fresh inquiry awaiting first contact</Text>
                  </View>
                  {selectedLeadForStatus?.status === 'NEW' && (
                    <Check size={18} color="#2563eb" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusOptionCard,
                    selectedLeadForStatus?.status === 'CONTACTED' && styles.statusOptionCardActiveContacted,
                  ]}
                  onPress={() => handleSelectLeadStatus('CONTACTED')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.statusOptionDot, { backgroundColor: '#ea580c' }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.statusOptionTitle, { color: '#ea580c' }]}>CONTACTED</Text>
                    <Text style={styles.statusOptionDesc}>Called or messaged student counselor</Text>
                  </View>
                  {selectedLeadForStatus?.status === 'CONTACTED' && (
                    <Check size={18} color="#ea580c" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusOptionCard,
                    selectedLeadForStatus?.status === 'RESOLVED' && styles.statusOptionCardActiveResolved,
                  ]}
                  onPress={() => handleSelectLeadStatus('RESOLVED')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.statusOptionDot, { backgroundColor: '#16a34a' }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.statusOptionTitle, { color: '#16a34a' }]}>RESOLVED</Text>
                    <Text style={styles.statusOptionDesc}>Successfully closed / enrolled or decided</Text>
                  </View>
                  {selectedLeadForStatus?.status === 'RESOLVED' && (
                    <Check size={18} color="#16a34a" />
                  )}
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.modalFullCancelBtn}
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={styles.modalFullCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: EDIT COURSE ================= */}
      <Modal
        visible={editCourseModal}
        animationType="slide"
        transparent
        onRequestClose={() => setEditCourseModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingTop: Math.max(insets.top, 24) }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Course Program</Text>
                <Text style={styles.modalSub}>Update course details, fees, and syllabus</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setEditCourseModal(false)}
              >
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Course Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Full Stack MERN Developer with AI"
                  placeholderTextColor={Colors.textLight}
                  value={editCourseTitle}
                  onChangeText={setEditCourseTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Delivery Mode</Text>
                <View style={styles.rolePickerRow}>
                  {(['ONLINE', 'OFFLINE', 'BOTH'] as const).map(m => (
                    <TouchableOpacity
                      key={m}
                      style={[
                        styles.rolePickerItem,
                        editCourseMode === m && styles.rolePickerItemActive,
                      ]}
                      onPress={() => setEditCourseMode(m)}
                    >
                      <Text
                        style={[
                          styles.rolePickerItemText,
                          editCourseMode === m && styles.rolePickerItemTextActive,
                        ]}
                      >
                        {m === 'ONLINE' ? 'Online' : m === 'OFFLINE' ? 'Offline' : 'Both'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                {categories.length > 0 && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8, marginTop: 4 }}>
                    {categories.map((cat: any) => (
                      <TouchableOpacity
                        key={cat.id || cat.name}
                        onPress={() => setEditCourseCategory(cat.name)}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 16,
                          backgroundColor: editCourseCategory === cat.name ? '#fff7ed' : Colors.surfaceSubtle,
                          borderColor: editCourseCategory === cat.name ? Colors.primaryOrange : Colors.border,
                          borderWidth: 1,
                          marginRight: 6,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: editCourseCategory === cat.name ? '700' : '500',
                            color: editCourseCategory === cat.name ? Colors.primaryOrange : Colors.textSecondary,
                          }}
                        >
                          {cat.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
                <TextInput
                  style={styles.input}
                  placeholder="Web Development"
                  placeholderTextColor={Colors.textLight}
                  value={editCourseCategory}
                  onChangeText={setEditCourseCategory}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Program Fee (₹)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="35000"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                    value={editCoursePrice}
                    onChangeText={setEditCoursePrice}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Status</Text>
                  <View style={styles.rolePickerRow}>
                    <TouchableOpacity
                      style={[
                        styles.rolePickerItem,
                        editCourseStatus === 'PUBLISHED' && styles.rolePickerItemActive,
                      ]}
                      onPress={() => setEditCourseStatus('PUBLISHED')}
                    >
                      <Text
                        style={[
                          styles.rolePickerItemText,
                          editCourseStatus === 'PUBLISHED' && styles.rolePickerItemTextActive,
                        ]}
                      >
                        PUBLISHED
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.rolePickerItem,
                        editCourseStatus === 'DRAFT' && styles.rolePickerItemActive,
                      ]}
                      onPress={() => setEditCourseStatus('DRAFT')}
                    >
                      <Text
                        style={[
                          styles.rolePickerItemText,
                          editCourseStatus === 'DRAFT' && styles.rolePickerItemTextActive,
                        ]}
                      >
                        DRAFT
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Rating</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="4.9"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                    value={editCourseRating}
                    onChangeText={setEditCourseRating}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Reviews Count</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1.2k+"
                    placeholderTextColor={Colors.textLight}
                    value={editCourseReviewsCount}
                    onChangeText={setEditCourseReviewsCount}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Course Level</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Beginner to Advanced"
                    placeholderTextColor={Colors.textLight}
                    value={editCourseLevel}
                    onChangeText={setEditCourseLevel}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Total Classes</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="12"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                    value={editCourseTotalClasses}
                    onChangeText={setEditCourseTotalClasses}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration</Text>
                <TextInput
                  style={styles.input}
                  placeholder="12 Weeks / 3 Months"
                  placeholderTextColor={Colors.textLight}
                  value={editCourseDuration}
                  onChangeText={setEditCourseDuration}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Thumbnail Image URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://images.unsplash.com/... (optional)"
                  placeholderTextColor={Colors.textLight}
                  value={editCourseThumbnail}
                  onChangeText={setEditCourseThumbnail}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Course Video URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://www.youtube.com/embed/... (optional)"
                  placeholderTextColor={Colors.textLight}
                  value={editCourseVideoUrl}
                  onChangeText={setEditCourseVideoUrl}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Program overview and student outcomes..."
                  placeholderTextColor={Colors.textLight}
                  multiline
                  numberOfLines={4}
                  value={editCourseDesc}
                  onChangeText={setEditCourseDesc}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Skills You'll Gain (comma-separated)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="React, Node.js, Express, MongoDB"
                  placeholderTextColor={Colors.textLight}
                  value={editCourseSkills}
                  onChangeText={setEditCourseSkills}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tech Stack (comma-separated)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="JavaScript, TypeScript, Git, Docker"
                  placeholderTextColor={Colors.textLight}
                  value={editCourseTech}
                  onChangeText={setEditCourseTech}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Benefits of This Course (1 per line)</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { minHeight: 90 }]}
                  placeholder="100% Practical Training with Live Projects&#10;Placement Assistance&#10;Certification"
                  placeholderTextColor={Colors.textLight}
                  multiline
                  numberOfLines={4}
                  value={editCourseBenefits}
                  onChangeText={setEditCourseBenefits}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>What You'll Learn (1 per line)</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { minHeight: 90 }]}
                  placeholder="Master Modern Full-Stack Development&#10;Build Production Projects"
                  placeholderTextColor={Colors.textLight}
                  multiline
                  numberOfLines={4}
                  value={editCourseWhatYoullLearn}
                  onChangeText={setEditCourseWhatYoullLearn}
                />
              </View>

              {/* ASSIGN COURSE TUTORS */}
              <View style={styles.inputGroup}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={styles.inputLabel}>Assign Course Tutors</Text>
                  <Text style={{ fontSize: 11, color: Colors.primaryOrange, fontWeight: '700' }}>
                    {editCourseTutorIds.length} Selected
                  </Text>
                </View>
                {availableTutors.length === 0 ? (
                  <View style={{ padding: 12, borderRadius: 10, backgroundColor: Colors.surfaceSubtle, borderWidth: 1, borderColor: Colors.border }}>
                    <Text style={{ fontSize: 12, color: Colors.textMuted, fontStyle: 'italic' }}>
                      No tutors registered. Add a tutor under the Users tab first.
                    </Text>
                  </View>
                ) : (
                  <View style={{ gap: 8 }}>
                    {availableTutors.map((tut: any) => {
                      const isSelected = editCourseTutorIds.includes(tut.id);
                      const tutName = tut.name || tut.email;
                      return (
                        <TouchableOpacity
                          key={tut.id}
                          onPress={() => {
                            setEditCourseTutorIds(prev =>
                              prev.includes(tut.id) ? prev.filter(id => id !== tut.id) : [...prev, tut.id]
                            );
                          }}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 10,
                            borderRadius: 12,
                            borderWidth: 1.5,
                            borderColor: isSelected ? Colors.primaryOrange : Colors.border,
                            backgroundColor: isSelected ? '#fff7ed' : Colors.surfaceSubtle,
                          }}
                          activeOpacity={0.7}
                        >
                          <View
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 16,
                              backgroundColor: isSelected ? Colors.primaryOrange : '#e2e8f0',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 10,
                            }}
                          >
                            <Text style={{ fontSize: 12, fontWeight: '700', color: isSelected ? '#fff' : Colors.textPrimary }}>
                              {(tutName || 'T')[0].toUpperCase()}
                            </Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: isSelected ? Colors.primaryOrange : Colors.textPrimary }}>
                              {tutName}
                            </Text>
                            <Text style={{ fontSize: 11, color: Colors.textMuted }}>
                              {tut.professionTitle || tut.email}
                            </Text>
                          </View>
                          <View
                            style={{
                              width: 22,
                              height: 22,
                              borderRadius: 6,
                              borderWidth: 1.5,
                              borderColor: isSelected ? Colors.primaryOrange : Colors.border,
                              backgroundColor: isSelected ? Colors.primaryOrange : '#fff',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSaveEditCourse}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.textWhite} />
                ) : (
                  <Text style={styles.submitBtnText}>Save Course Updates</Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: ENROLLMENT DETAILS ================= */}
      <Modal
        visible={enrollmentDetailsModal}
        animationType="slide"
        transparent
        onRequestClose={() => setEnrollmentDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingTop: Math.max(insets.top, 24) }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Student Enrollment Record</Text>
                <Text style={styles.modalSub}>Complete registration & 12-class breakdown</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setEnrollmentDetailsModal(false)}
              >
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              {selectedEnrollment && (
                <>
                  {/* STUDENT PROFILE CARD */}
                  <View style={styles.modalDetailCard}>
                    <Text style={styles.modalSectionLabel}>STUDENT PROFILE</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                      <View style={styles.modalAvatar}>
                        <Text style={styles.modalAvatarText}>
                          {(selectedEnrollment.user?.name || selectedEnrollment.User?.name || 'S')[0].toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.modalDetailMainText}>
                          {selectedEnrollment.user?.name || selectedEnrollment.User?.name || 'Enrolled Student'}
                        </Text>
                        <Text style={styles.modalDetailSubText}>
                          {selectedEnrollment.user?.email || selectedEnrollment.User?.email || 'N/A'}
                        </Text>
                        {selectedEnrollment.user?.phone || selectedEnrollment.User?.phone ? (
                          <Text style={styles.modalDetailSubText}>
                            Phone: {selectedEnrollment.user?.phone || selectedEnrollment.User?.phone}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  {/* COURSE PROGRAM CARD */}
                  <View style={styles.modalDetailCard}>
                    <Text style={styles.modalSectionLabel}>COURSE PROGRAM</Text>
                    <Text style={[styles.modalDetailMainText, { marginTop: 6 }]}>
                      {selectedEnrollment.package?.title || selectedEnrollment.Package?.title || 'Course Program'}
                    </Text>
                    <Text style={styles.modalDetailSubText}>
                      Track: {selectedEnrollment.package?.category || selectedEnrollment.Package?.category || 'General'}
                    </Text>
                    <Text style={styles.modalDetailSubText}>
                      Duration: {selectedEnrollment.package?.duration || selectedEnrollment.Package?.duration || '12 Weeks'}
                    </Text>
                    {selectedEnrollment.package?.price != null && (
                      <Text style={styles.modalDetailSubText}>
                        Fee Paid: ₹{Number(selectedEnrollment.package?.price).toLocaleString('en-IN')}
                      </Text>
                    )}
                  </View>

                  {/* 12-CLASS ATTENDANCE DETAILED TRACKER */}
                  <View style={styles.modalDetailCard}>
                    <Text style={styles.modalSectionLabel}>12-CLASS ATTENDANCE TRACKER</Text>
                    <View style={{ marginVertical: 10 }}>
                      <View style={styles.enrProgressHeader}>
                        <Text style={styles.enrProgressTitle}>Syllabus Completion</Text>
                        <Text style={styles.enrProgressPercent}>
                          {selectedEnrollment.progressPercentage || 0}% ({selectedEnrollment.conductedClasses || 0}/{selectedEnrollment.totalClasses || 12} classes)
                        </Text>
                      </View>
                      <View style={styles.progressBarTrack}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${selectedEnrollment.progressPercentage || 0}%` },
                          ]}
                        />
                      </View>
                    </View>

                    <View style={styles.modalStatsGrid}>
                      <View style={styles.modalStatTile}>
                        <Text style={styles.modalStatNum}>{selectedEnrollment.totalClasses || 12}</Text>
                        <Text style={styles.modalStatLabel}>Total Classes</Text>
                      </View>
                      <View style={[styles.modalStatTile, { backgroundColor: '#f0fdf4' }]}>
                        <Text style={[styles.modalStatNum, { color: '#16a34a' }]}>{selectedEnrollment.attendedClasses || 0}</Text>
                        <Text style={styles.modalStatLabel}>Attended</Text>
                      </View>
                      <View style={[styles.modalStatTile, { backgroundColor: '#fef2f2' }]}>
                        <Text style={[styles.modalStatNum, { color: '#dc2626' }]}>{selectedEnrollment.missedClasses || 0}</Text>
                        <Text style={styles.modalStatLabel}>Missed</Text>
                      </View>
                      <View style={[styles.modalStatTile, { backgroundColor: '#f8fafc' }]}>
                        <Text style={[styles.modalStatNum, { color: '#64748b' }]}>{selectedEnrollment.remainingClasses || 12}</Text>
                        <Text style={styles.modalStatLabel}>Remaining</Text>
                      </View>
                    </View>
                  </View>

                  {/* ENROLLMENT META */}
                  <View style={styles.modalDetailCard}>
                    <Text style={styles.modalSectionLabel}>REGISTRATION DETAILS</Text>
                    <Text style={styles.modalDetailSubText}>
                      Enrollment ID: {selectedEnrollment.id}
                    </Text>
                    <Text style={styles.modalDetailSubText}>
                      Enrolled Date: {selectedEnrollment.createdAt ? new Date(selectedEnrollment.createdAt).toLocaleDateString() : 'N/A'}
                    </Text>
                    <Text style={styles.modalDetailSubText}>
                      Status: {selectedEnrollment.status || (selectedEnrollment.isExpired ? 'EXPIRED' : 'ACTIVE')}
                    </Text>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={styles.modalCloseFullBtn}
                onPress={() => setEnrollmentDetailsModal(false)}
              >
                <Text style={styles.modalCloseFullBtnText}>Close Record</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: EDIT CATEGORY ================= */}
      <Modal
        visible={editCategoryModal}
        animationType="fade"
        transparent
        onRequestClose={() => setEditCategoryModal(false)}
      >
        <View style={styles.modalCenterOverlay}>
          <View style={styles.modalCenterCard}>
            <Text style={styles.modalCenterTitle}>Edit Category</Text>
            <TextInput
              style={[styles.input, { marginTop: 12, marginBottom: 8 }]}
              placeholder="Category Name"
              placeholderTextColor={Colors.textLight}
              value={editCatName}
              onChangeText={setEditCatName}
            />
            <TextInput
              style={[styles.input, { marginBottom: 16 }]}
              placeholder="Description (Optional)"
              placeholderTextColor={Colors.textLight}
              value={editCatDesc}
              onChangeText={setEditCatDesc}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditCategoryModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveEditCategory}
                disabled={submitting}
              >
                <Text style={styles.modalSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: EDIT COUPON ================= */}
      <Modal
        visible={editCouponModal}
        animationType="fade"
        transparent
        onRequestClose={() => setEditCouponModal(false)}
      >
        <View style={styles.modalCenterOverlay}>
          <View style={styles.modalCenterCard}>
            <Text style={styles.modalCenterTitle}>Edit Coupon</Text>
            <TextInput
              style={[styles.input, { marginTop: 12, marginBottom: 8 }]}
              placeholder="Coupon Code"
              placeholderTextColor={Colors.textLight}
              autoCapitalize="characters"
              value={editCouponCode}
              onChangeText={setEditCouponCode}
            />
            <TextInput
              style={[styles.input, { marginBottom: 16 }]}
              placeholder="Discount %"
              placeholderTextColor={Colors.textLight}
              keyboardType="numeric"
              value={editCouponPercent}
              onChangeText={setEditCouponPercent}
            />
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditCouponModal(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveEditCoupon}
                disabled={submitting}
              >
                <Text style={styles.modalSaveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: TUTOR DETAILS ================= */}
      <Modal
        visible={tutorModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setTutorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingTop: Math.max(insets.top, 24) }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Tutor Teaching Roster</Text>
                <Text style={styles.modalSub}>Assigned curriculum and enrolled student metrics</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setTutorModalVisible(false)}
              >
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              {selectedTutorDetails && (
                <>
                  {/* TUTOR PROFILE CARD */}
                  <View style={styles.modalDetailCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={[styles.modalAvatar, { backgroundColor: '#7c3aed' }]}>
                        <Text style={styles.modalAvatarText}>
                          {(selectedTutorDetails.name || 'T')[0].toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ marginLeft: 12, flex: 1 }}>
                        <Text style={styles.modalDetailMainText}>
                          {selectedTutorDetails.name || 'Instructor'}
                        </Text>
                        <Text style={styles.modalDetailSubText}>
                          {selectedTutorDetails.email || 'N/A'}
                        </Text>
                      </View>
                      <View style={styles.tutorRolePill}>
                        <Text style={styles.tutorRolePillText}>INSTRUCTOR</Text>
                      </View>
                    </View>
                  </View>

                  {/* METRICS SUMMARY TILES */}
                  <View style={styles.tutorMetricsRow}>
                    <View style={styles.tutorMetricBox}>
                      <BookOpen size={18} color={Colors.primaryOrange} />
                      <View style={{ marginLeft: 8 }}>
                        <Text style={styles.tutorMetricValue}>
                          {selectedTutorDetails.coursesCount ?? (Array.isArray(selectedTutorDetails.courses) ? selectedTutorDetails.courses.length : 0)}
                        </Text>
                        <Text style={styles.tutorMetricLabel}>Assigned Courses</Text>
                      </View>
                    </View>

                    <View style={styles.tutorMetricBox}>
                      <Users size={18} color="#2563eb" />
                      <View style={{ marginLeft: 8 }}>
                        <Text style={styles.tutorMetricValue}>
                          {selectedTutorDetails.studentsCount ?? 0}
                        </Text>
                        <Text style={styles.tutorMetricLabel}>Enrolled Students</Text>
                      </View>
                    </View>
                  </View>

                  {/* ASSIGNED COURSES LIST */}
                  <View style={styles.modalDetailCard}>
                    <Text style={styles.modalSectionLabel}>ASSIGNED COURSES & BATCHES</Text>
                    {Array.isArray(selectedTutorDetails.courses) && selectedTutorDetails.courses.length > 0 ? (
                      selectedTutorDetails.courses.map((c: any, idx: number) => (
                        <View key={c.id || idx} style={styles.tutorCourseListItem}>
                          <BookOpen size={15} color={Colors.primaryOrange} />
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.tutorCourseListTitle}>{c.title}</Text>
                            <Text style={styles.tutorCourseListCategory}>
                              {c.category || 'General Track'} • {c.duration || '12 Weeks'}
                            </Text>
                          </View>
                          {c.studentsCount != null && (
                            <View style={styles.tutorCourseStudentBadge}>
                              <Text style={styles.tutorCourseStudentBadgeText}>
                                {c.studentsCount} students
                              </Text>
                            </View>
                          )}
                        </View>
                      ))
                    ) : (
                      <Text style={[styles.modalDetailSubText, { marginTop: 8 }]}>
                        No specific course tracks currently assigned to this tutor.
                      </Text>
                    )}

                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        backgroundColor: '#fff7ed',
                        borderColor: Colors.primaryOrange,
                        borderWidth: 1,
                        borderRadius: 10,
                        paddingVertical: 10,
                        marginTop: 12,
                      }}
                      onPress={() => {
                        setTutorModalVisible(false);
                        handleOpenAssignCoursesToTutor(selectedTutorDetails);
                      }}
                      activeOpacity={0.8}
                    >
                      <UserCheck size={15} color={Colors.primaryOrange} />
                      <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.primaryOrange }}>
                        Assign / Manage Courses
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={styles.modalCloseFullBtn}
                onPress={() => setTutorModalVisible(false)}
              >
                <Text style={styles.modalCloseFullBtnText}>Close Roster</Text>
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: ASSIGN COURSES TO TUTOR ================= */}
      <Modal
        visible={assignCourseModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAssignCourseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingTop: Math.max(insets.top, 24) }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Assign Courses to Tutor</Text>
                <Text style={styles.modalSub}>
                  {selectedTutorForCourseAssign?.name || 'Instructor'} • {selectedTutorForCourseAssign?.email || ''}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setAssignCourseModalVisible(false)}
              >
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              <Text style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 14 }}>
                Select all courses and tracks this instructor is assigned to teach:
              </Text>

              {packages.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: Colors.textMuted }}>No courses available to assign.</Text>
                </View>
              ) : (
                <View style={{ gap: 8 }}>
                  {packages.map((pkg: any) => {
                    const isAssigned = tutorAssignedPkgIds.includes(pkg.id);
                    return (
                      <TouchableOpacity
                        key={pkg.id}
                        onPress={() => {
                          setTutorAssignedPkgIds(prev =>
                            prev.includes(pkg.id) ? prev.filter(id => id !== pkg.id) : [...prev, pkg.id]
                          );
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          padding: 12,
                          borderRadius: 14,
                          borderWidth: 1.5,
                          borderColor: isAssigned ? Colors.primaryOrange : Colors.border,
                          backgroundColor: isAssigned ? '#fff7ed' : Colors.surfaceSubtle,
                        }}
                        activeOpacity={0.7}
                      >
                        <Image
                          source={{ uri: formatImageUrl(pkg.thumbnail) }}
                          style={{ width: 44, height: 44, borderRadius: 8, marginRight: 12 }}
                          resizeMode="cover"
                        />
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: isAssigned ? Colors.primaryOrange : Colors.textPrimary }}>
                            {pkg.title}
                          </Text>
                          <Text style={{ fontSize: 11, color: Colors.textMuted }}>
                            {pkg.category || 'General Track'} • {pkg.duration || '12 Weeks'}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            borderWidth: 1.5,
                            borderColor: isAssigned ? Colors.primaryOrange : Colors.textLight,
                            backgroundColor: isAssigned ? Colors.primaryOrange : '#fff',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {isAssigned && <Check size={16} color="#fff" strokeWidth={3} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <TouchableOpacity
                style={[styles.submitBtn, { marginTop: 20 }]}
                onPress={handleSaveTutorCourseAssignments}
                disabled={assigningTutorPackages}
              >
                {assigningTutorPackages ? (
                  <ActivityIndicator color={Colors.textWhite} />
                ) : (
                  <Text style={styles.submitBtnText}>
                    Save Course Assignments ({tutorAssignedPkgIds.length})
                  </Text>
                )}
              </TouchableOpacity>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.small,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: {
    flex: 1,
    marginLeft: 12,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  adminBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryOrange,
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryOrange,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 5,
  },
  headerActionBtnText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '800',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },
  toolsIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolsIconBtnActive: {
    backgroundColor: '#fff7ed',
    borderColor: 'rgba(248, 117, 14, 0.4)',
  },
  bottomNavContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  bottomNavIconWrap: {
    width: 44,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  bottomNavIconWrapActive: {
    backgroundColor: 'rgba(248, 117, 14, 0.12)',
  },
  bottomNavLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 3,
  },
  bottomNavLabelActive: {
    color: Colors.primaryOrange,
    fontWeight: '800',
  },
  tabBadge: {
    position: 'absolute',
    top: -2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primaryOrange,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  tabBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loaderWrap: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    color: Colors.textMuted,
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  actionBanner: {
    backgroundColor: Colors.darkSurface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    ...Shadows.small,
  },
  actionBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textWhite,
    marginBottom: 2,
  },
  actionBannerSub: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
  },
  actionBannerPill: {
    backgroundColor: Colors.primaryOrange,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  actionBannerPillText: {
    color: Colors.textWhite,
    fontSize: 11,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryOrange,
  },
  leadCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    ...Shadows.small,
  },
  leadTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  leadName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  leadTime: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#d97706',
  },
  statusContacted: {
    backgroundColor: '#eff6ff',
  },
  statusContactedText: {
    color: Colors.accentBlue,
  },
  statusResolved: {
    backgroundColor: '#ecfdf5',
  },
  statusResolvedText: {
    color: Colors.success,
  },
  messageBox: {
    backgroundColor: Colors.surfaceSubtle,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  leadActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  leadCallBtn: {
    flex: 1.5,
    backgroundColor: Colors.primaryOrange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  leadCallBtnText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  leadWhatsAppBtn: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  leadWhatsAppBtnText: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '700',
  },
  tabHeaderActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  searchBarBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchBarInput: {
    flex: 1,
    paddingVertical: 10,
    marginLeft: 8,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  newBtn: {
    backgroundColor: Colors.primaryOrange,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  newBtnText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primaryOrange,
    borderColor: Colors.primaryOrange,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  filterPillTextActive: {
    color: Colors.textWhite,
  },
  itemCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    ...Shadows.small,
  },
  itemCardContentRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  packageCardThumb: {
    width: 68,
    height: 68,
    borderRadius: 12,
    backgroundColor: '#1e293b',
  },
  itemCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  itemCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  itemCardCategory: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statusPillPublished: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillPublishedText: {
    color: Colors.success,
    fontSize: 10,
    fontWeight: '800',
  },
  itemCardPrice: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primaryOrange,
    marginTop: 4,
  },
  itemCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
    marginTop: 10,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.error,
  },
  enrCourseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  enrCourseTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  enrDateText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 6,
  },
  userCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
    ...Shadows.small,
  },
  userCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primaryOrange,
  },
  userNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  userEmailText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  userJoinedText: {
    fontSize: 10,
    color: Colors.textLight,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleBadgeAdmin: {
    backgroundColor: Colors.orangeLight,
  },
  roleBadgeTutor: {
    backgroundColor: '#eff6ff',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  userActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  userEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  userEditBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryOrange,
  },
  userDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  userDeleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.error,
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  rolePickerItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
  },
  rolePickerItemActive: {
    borderColor: Colors.primaryOrange,
    backgroundColor: '#fff7ed',
  },
  rolePickerItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  rolePickerItemTextActive: {
    color: Colors.primaryOrange,
    fontWeight: '800',
  },
  toolsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolsSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  toolsAddBtn: {
    backgroundColor: Colors.primaryOrange,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  toolsAddBtnText: {
    color: Colors.textWhite,
    fontSize: 11,
    fontWeight: '700',
  },
  toolsListWrap: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    gap: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  couponItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  couponCodeText: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.primaryOrange,
    letterSpacing: 0.5,
  },
  couponDetailText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  couponActivePill: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  couponActiveText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.success,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  modalSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formScroll: {
    paddingVertical: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: Colors.primaryOrange,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    ...Shadows.small,
  },
  submitBtnText: {
    color: Colors.textWhite,
    fontSize: 15,
    fontWeight: '800',
  },
  modalCenterOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCenterCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    ...Shadows.medium,
  },
  modalCenterTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  modalSaveBtn: {
    backgroundColor: Colors.primaryOrange,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalSaveBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  emptyStateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 44,
    paddingHorizontal: 24,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  emptyStateSub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  emptyResetBtn: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyResetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryOrange,
  },
  emptyActionBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: Colors.primaryOrange,
    borderRadius: 12,
  },
  emptyActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textWhite,
  },

  // Action buttons
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accentBlue,
  },

  // Enrollments
  enrollmentCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  enrTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enrAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  enrAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2563eb',
  },
  enrStudentName: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  enrStudentEmail: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  enrStudentPhone: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  enrStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f0fdf4',
  },
  enrStatusCompleted: {
    backgroundColor: '#eff6ff',
  },
  enrStatusExpired: {
    backgroundColor: '#fef2f2',
  },
  enrStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16a34a',
  },
  enrStatusCompletedText: {
    color: '#2563eb',
  },
  enrStatusExpiredText: {
    color: '#dc2626',
  },
  enrCourseBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  enrCourseName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  enrCourseCategory: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  enrProgressSection: {
    marginTop: 12,
  },
  enrProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  enrProgressTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  enrProgressPercent: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 7,
    backgroundColor: Colors.primaryOrange,
    borderRadius: 4,
  },
  attendanceBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  attBadgeAttended: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  attBadgeAttendedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803d',
  },
  attBadgeMissed: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  attBadgeMissedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#b91c1c',
  },
  attBadgeRemaining: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  attBadgeRemainingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  enrCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  enrJoinedText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  enrViewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff7ed',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(248, 117, 14, 0.25)',
  },
  enrViewDetailsBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.primaryOrange,
  },

  // Tutors
  tutorHeaderSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ede9fe',
  },
  tutorHeaderSummaryText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#7c3aed',
  },
  tutorCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  tutorCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  tutorAvatarText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
  },
  tutorName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  tutorEmail: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  tutorRolePill: {
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  tutorRolePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7c3aed',
  },
  tutorMetricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  tutorMetricBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tutorMetricValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  tutorMetricLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  tutorCoursesWrap: {
    marginTop: 10,
  },
  tutorCoursesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 6,
  },
  tutorCourseChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tutorCourseChip: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(248, 117, 14, 0.2)',
  },
  tutorCourseChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryOrange,
  },
  tutorCardActions: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  tutorDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f5f3ff',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd6fe',
  },
  tutorDetailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7c3aed',
  },

  // Category & Coupon CRUD cards
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  categoryCardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDescText: {
    fontSize: 11.5,
    color: Colors.textMuted,
    marginTop: 3,
    marginLeft: 23,
  },
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  toolActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  toolEditBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentBlue,
  },
  toolDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  toolDeleteBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.error,
  },

  // Modals Extra Styles
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalCenterSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  closeBtnSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOptionList: {
    gap: 8,
    marginVertical: 10,
  },
  statusOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceSubtle,
    gap: 10,
  },
  statusOptionCardActiveNew: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  statusOptionCardActiveContacted: {
    borderColor: '#ea580c',
    backgroundColor: '#fff7ed',
  },
  statusOptionCardActiveResolved: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  statusOptionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusOptionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  statusOptionDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  modalFullCancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  modalFullCancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  modalDetailCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.6,
  },
  modalAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalAvatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  modalDetailMainText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalDetailSubText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  modalStatsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  modalStatTile: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalStatNum: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  modalStatLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 2,
  },
  modalCloseFullBtn: {
    backgroundColor: Colors.surfaceSubtle,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalCloseFullBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  tutorCourseListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tutorCourseListTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  tutorCourseListCategory: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  tutorCourseStudentBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tutorCourseStudentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
