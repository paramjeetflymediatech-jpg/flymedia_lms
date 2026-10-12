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
import { Colors, Shadows } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
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
} from 'lucide-react-native';

type AdminTab = 'overview' | 'courses' | 'leads' | 'enrollments' | 'users' | 'tools';

interface AdminDashboardScreenProps {
  navigation: any;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 16);
  const bottomPadding = Math.max(insets.bottom, 16);

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
  });

  // Data lists
  const [packages, setPackages] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);

  // Search queries & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [leadFilter, setLeadFilter] = useState<'ALL' | 'NEW' | 'CONTACTED' | 'RESOLVED'>('ALL');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'STUDENT' | 'TUTOR' | 'ADMIN'>('ALL');

  // Modals
  const [addCourseModal, setAddCourseModal] = useState(false);
  const [addCategoryModal, setAddCategoryModal] = useState(false);
  const [addCouponModal, setAddCouponModal] = useState(false);
  const [addUserModal, setAddUserModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // New Course Form
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState('Web Development');
  const [coursePrice, setCoursePrice] = useState('');
  const [courseDuration, setCourseDuration] = useState('12 Weeks');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseThumbnail, setCourseThumbnail] = useState('');
  const [courseSkills, setCourseSkills] = useState('React, Node.js, Express, MongoDB');
  const [courseTech, setCourseTech] = useState('JavaScript, Git, Postman');

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
    setActiveTab(tab);
  };

  const loadAllAdminData = async () => {
    if (!user || !user.token) return;
    try {
      const [statsRes, pkgsRes, leadsRes, enrollRes, usersRes, catsRes, couponsRes] =
        await Promise.all([
          ApiService.getAdminStats(user.token),
          ApiService.getAdminPackages(user.token),
          ApiService.getAdminLeads(user.token),
          ApiService.getAdminEnrollments(user.token),
          ApiService.getAdminUsers(user.token),
          ApiService.getAdminCategories(user.token),
          ApiService.getAdminCoupons(user.token),
        ]);

      let finalPackages = Array.isArray(pkgsRes?.packages) ? pkgsRes.packages : [];
      let finalLeads = Array.isArray(leadsRes?.leads) ? leadsRes.leads : [];
      let finalEnrollments = Array.isArray(enrollRes?.enrollments) ? enrollRes.enrollments : [];
      let finalUsers = Array.isArray(usersRes?.users) ? usersRes.users : [];
      let finalCategories = Array.isArray(catsRes?.categories) ? catsRes.categories : [];
      let finalCoupons = Array.isArray(couponsRes?.coupons) ? couponsRes.coupons : [];

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

      // Keep stats cards aligned with the loaded data so overview cards match actual list contents
      setStats({
        totalCourses: Math.max(statsRes.stats?.totalCourses || 0, finalPackages.length),
        totalLeads: Math.max(statsRes.stats?.totalLeads || 0, finalLeads.length),
        totalEnrollments: Math.max(statsRes.stats?.totalEnrollments || 0, finalEnrollments.length),
        totalUsers: Math.max(statsRes.stats?.totalUsers || 0, finalUsers.length),
        totalCategories: Math.max(statsRes.stats?.totalCategories || 0, finalCategories.length),
        totalCoupons: Math.max(statsRes.stats?.totalCoupons || 0, finalCoupons.length),
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

    const payload = {
      title: courseTitle.trim(),
      category: courseCategory,
      thumbnail: courseThumbnail.trim() || undefined,
      price: coursePrice ? Number(coursePrice) : 25000,
      duration: courseDuration || '12 Weeks',
      description: courseDesc.trim(),
      skills: skillsArray,
      techStack: techArray,
      status: 'PUBLISHED',
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

  const handleUpdateLeadStatus = async (leadId: string, currentStatus: string) => {
    if (!user || !user.token) return;
    const nextStatus =
      currentStatus === 'NEW' ? 'CONTACTED' : currentStatus === 'CONTACTED' ? 'RESOLVED' : 'NEW';

    const res = await ApiService.updateLeadStatus(leadId, nextStatus, user.token);
    if (res.success) {
      setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, status: nextStatus } : l)));
    }
  };

  // Category & Coupon creation
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
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle}>Flymedia Admin Suite</Text>
          <View style={styles.adminBadge}>
            <ShieldCheck size={12} color={Colors.primaryOrange} />
            <Text style={styles.adminBadgeText}>Master Admin Portal</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.headerActionBtn}
          onPress={() => setAddCourseModal(true)}
          activeOpacity={0.85}
        >
          <PlusCircle size={16} color={Colors.textWhite} />
          <Text style={styles.headerActionBtnText}>+ Course</Text>
        </TouchableOpacity>
      </View>

      {/* HORIZONTAL SECTION TABS (MATCHING WEBSITE MODULES) */}
      <View style={styles.navTabsWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.navTabsScroll}
        >
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'overview' && styles.tabBtnActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'overview' && styles.tabBtnTextActive]}>
              📊 Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'courses' && styles.tabBtnActive]}
            onPress={() => setActiveTab('courses')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'courses' && styles.tabBtnTextActive]}>
              📦 Courses ({packages.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'leads' && styles.tabBtnActive]}
            onPress={() => setActiveTab('leads')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'leads' && styles.tabBtnTextActive]}>
              📥 Leads ({leads.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'enrollments' && styles.tabBtnActive]}
            onPress={() => setActiveTab('enrollments')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'enrollments' && styles.tabBtnTextActive]}>
              🎓 Enrollments ({enrollments.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'users' && styles.tabBtnActive]}
            onPress={() => setActiveTab('users')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'users' && styles.tabBtnTextActive]}>
              👥 Users ({usersList.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'tools' && styles.tabBtnActive]}
            onPress={() => setActiveTab('tools')}
          >
            <Text style={[styles.tabBtnText, activeTab === 'tools' && styles.tabBtnTextActive]}>
              ⚙️ Categories & Coupons
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
                        <View
                          style={[
                            styles.statusPill,
                            lead.status === 'RESOLVED' && styles.statusResolved,
                            lead.status === 'CONTACTED' && styles.statusContacted,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              lead.status === 'RESOLVED' && styles.statusResolvedText,
                              lead.status === 'CONTACTED' && styles.statusContactedText,
                            ]}
                          >
                            {lead.status}
                          </Text>
                        </View>
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
                          source={{
                            uri:
                              pkg.thumbnail ||
                              'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80',
                          }}
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

                          <View style={styles.itemCardActions}>
                            <TouchableOpacity
                              style={styles.deleteBtn}
                              onPress={() => handleDeletePackage(pkg.id || pkg.slug, pkg.title)}
                            >
                              <Trash2 size={14} color={Colors.error} />
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
                          onPress={() => handleUpdateLeadStatus(lead.id, lead.status)}
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
                {enrollments.length === 0 ? (
                  <View style={styles.emptyStateBox}>
                    <GraduationCap size={40} color={Colors.textLight} />
                    <Text style={styles.emptyStateTitle}>No Student Enrollments Yet</Text>
                    <Text style={styles.emptyStateSub}>
                      When students purchase or join courses, their registration records, payment timestamps, and details will appear here.
                    </Text>
                  </View>
                ) : (
                  enrollments.map(enr => {
                    const studentName = enr.user?.name || enr.User?.name || 'Enrolled Student';
                    const studentEmail = enr.user?.email || enr.User?.email || 'Verified Account';
                    const courseTitle = enr.package?.title || enr.Package?.title || 'LMS Career Program';
                    const enrollDate = enr.createdAt || enr.enrolledAt ? new Date(enr.createdAt || enr.enrolledAt).toLocaleDateString() : 'Active';

                    return (
                      <View key={enr.id} style={styles.itemCard}>
                        <View style={styles.itemCardTop}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.itemCardTitle}>{studentName}</Text>
                            <Text style={styles.itemCardCategory}>{studentEmail}</Text>
                          </View>
                          <View style={styles.statusPillPublished}>
                            <Text style={styles.statusPillPublishedText}>{enr.status || 'ENROLLED'}</Text>
                          </View>
                        </View>

                        <View style={styles.enrCourseRow}>
                          <BookOpen size={14} color={Colors.primaryOrange} />
                          <Text style={styles.enrCourseTitle}>{courseTitle}</Text>
                        </View>

                        <Text style={styles.enrDateText}>Enrolled on {enrollDate}</Text>
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
                      <View key={cat.id || cat.slug} style={styles.categoryItem}>
                        <Tag size={16} color={Colors.primaryOrange} />
                        <Text style={styles.categoryItemName}>{cat.name}</Text>
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
                        <View key={cp.id || cp.code} style={styles.couponItem}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.couponCodeText}>{cp.code}</Text>
                            <Text style={styles.couponDetailText}>
                              {discountVal}% Discount Promo
                            </Text>
                          </View>
                          <View style={styles.couponActivePill}>
                            <Text style={styles.couponActiveText}>ACTIVE</Text>
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

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Web Development"
                    placeholderTextColor={Colors.textLight}
                    value={courseCategory}
                    onChangeText={setCourseCategory}
                  />
                </View>

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
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duration</Text>
                <TextInput
                  style={styles.input}
                  placeholder="12 Weeks / 3 Months"
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
                <Text style={styles.inputLabel}>Skills (comma-separated)</Text>
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
  navTabsWrap: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  navTabsScroll: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSubtle,
  },
  tabBtnActive: {
    backgroundColor: Colors.primaryOrange,
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabBtnTextActive: {
    color: Colors.textWhite,
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
});
