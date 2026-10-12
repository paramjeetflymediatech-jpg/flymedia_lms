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
  CheckCircle,
  Clock,
  Sparkles,
  Phone,
  MessageCircle,
  ShieldCheck,
  X,
} from 'lucide-react-native';

interface AdminDashboardScreenProps {
  navigation: any;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 16);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalLeads: 0,
    totalEnrollments: 0,
    totalUsers: 0,
  });
  const [leads, setLeads] = useState<any[]>([]);

  // Create Course Modal State
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCategory, setCourseCategory] = useState('Web Development');
  const [coursePrice, setCoursePrice] = useState('');
  const [courseDuration, setCourseDuration] = useState('12 Weeks');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseSkills, setCourseSkills] = useState('React, Node.js, Express, MongoDB');
  const [courseTech, setCourseTech] = useState('JavaScript, Git, Postman');

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    if (!user || !user.token) return;
    try {
      const [statsRes, leadsRes] = await Promise.all([
        ApiService.getAdminStats(user.token),
        ApiService.getAdminLeads(user.token),
      ]);

      if (statsRes.success && statsRes.stats) {
        setStats(statsRes.stats);
      }
      if (leadsRes.success && leadsRes.leads) {
        setLeads(leadsRes.leads);
      }
    } catch (e) {
      console.warn('Error loading admin data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAdminData();
  };

  const handleCreateCourse = async () => {
    if (!courseTitle.trim() || !courseDesc.trim()) {
      Alert.alert('Required Fields', 'Please enter course title and description.');
      return;
    }

    if (!user || !user.token) return;

    setCreating(true);
    const skillsArray = courseSkills
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const techArray = courseTech
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      title: courseTitle.trim(),
      category: courseCategory,
      price: coursePrice ? Number(coursePrice) : 25000,
      duration: courseDuration || '12 Weeks',
      description: courseDesc.trim(),
      skills: skillsArray,
      techStack: techArray,
    };

    const res = await ApiService.createCourse(payload, user.token);
    setCreating(false);

    if (res.success) {
      Alert.alert('Success! 🎉', `Course "${courseTitle}" has been published live to the LMS.`);
      setAddModalVisible(false);
      setCourseTitle('');
      setCourseDesc('');
      setCoursePrice('');
      loadAdminData();
    } else {
      Alert.alert('Creation Error', res.error || 'Failed to create course');
    }
  };

  const handleCallStudent = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`);
  };

  const handleWhatsAppStudent = (phone: string, studentName: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hello ${studentName}, greetings from Flymedia Academy! How can we help you regarding your course inquiry?`);
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${message}`);
  };

  const handleUpdateStatus = async (leadId: string, currentStatus: string) => {
    if (!user || !user.token) return;
    const nextStatus = currentStatus === 'NEW' ? 'CONTACTED' : currentStatus === 'CONTACTED' ? 'RESOLVED' : 'NEW';

    const res = await ApiService.updateLeadStatus(leadId, nextStatus, user.token);
    if (res.success) {
      setLeads(prev =>
        prev.map(l => (l.id === leadId ? { ...l, status: nextStatus } : l))
      );
    } else {
      Alert.alert('Update Failed', res.error || 'Could not update status');
    }
  };

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
          <Text style={styles.topBarTitle}>Admin Control Center</Text>
          <View style={styles.adminBadge}>
            <ShieldCheck size={12} color={Colors.primaryOrange} />
            <Text style={styles.adminBadgeText}>Super Admin</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.addCourseBtn}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.85}
        >
          <PlusCircle size={16} color={Colors.textWhite} />
          <Text style={styles.addCourseBtnText}>Add Course</Text>
        </TouchableOpacity>
      </View>

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
        {/* STATS OVERVIEW CARDS */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#fff7ed' }]}>
              <BookOpen size={20} color={Colors.primaryOrange} />
            </View>
            <Text style={styles.statNumber}>{stats.totalCourses}</Text>
            <Text style={styles.statLabel}>Active Courses</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#eff6ff' }]}>
              <PhoneCall size={20} color={Colors.accentBlue} />
            </View>
            <Text style={styles.statNumber}>{stats.totalLeads}</Text>
            <Text style={styles.statLabel}>Student Leads</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#f0fdf4' }]}>
              <GraduationCap size={20} color={Colors.success} />
            </View>
            <Text style={styles.statNumber}>{stats.totalEnrollments}</Text>
            <Text style={styles.statLabel}>Enrollments</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: '#fdf2f8' }]}>
              <Users size={20} color="#db2777" />
            </View>
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Registered</Text>
          </View>
        </View>

        {/* QUICK ACTION BANNER */}
        <TouchableOpacity
          style={styles.actionBanner}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.85}
        >
          <View style={styles.actionBannerContent}>
            <Sparkles size={20} color={Colors.primaryOrange} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.actionBannerTitle}>Launch a New Career Course</Text>
              <Text style={styles.actionBannerSub}>
                Publish new programs, tech stack, and fees directly to student apps and website.
              </Text>
            </View>
            <View style={styles.actionBannerPill}>
              <Text style={styles.actionBannerPillText}>+ Create</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* RECENT LEADS & INQUIRIES MANAGEMENT */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Student Leads & Inquiries</Text>
          <Text style={styles.sectionCount}>{leads.length} Received</Text>
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={Colors.primaryOrange} />
            <Text style={styles.loaderText}>Syncing admin records...</Text>
          </View>
        ) : leads.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No Inquiries Yet</Text>
            <Text style={styles.emptySub}>
              New inquiries submitted by prospective students will automatically appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.leadsList}>
            {leads.map(lead => (
              <View key={lead.id} style={styles.leadCard}>
                <View style={styles.leadTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.leadName}>{lead.name || 'Prospective Student'}</Text>
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
                    onPress={() => handleUpdateStatus(lead.id, lead.status)}
                    activeOpacity={0.8}
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
                  </TouchableOpacity>
                </View>

                {lead.message ? (
                  <View style={styles.messageBox}>
                    <Text style={styles.messageText}>{lead.message}</Text>
                  </View>
                ) : null}

                {/* LEAD ACTION BUTTONS */}
                <View style={styles.leadActionRow}>
                  <TouchableOpacity
                    style={styles.leadCallBtn}
                    onPress={() => handleCallStudent(lead.phone)}
                    activeOpacity={0.8}
                  >
                    <Phone size={14} color={Colors.textWhite} />
                    <Text style={styles.leadCallBtnText}>Call: {lead.phone}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.leadWhatsAppBtn}
                    onPress={() => handleWhatsAppStudent(lead.phone, lead.name)}
                    activeOpacity={0.8}
                  >
                    <MessageCircle size={14} color="#16a34a" />
                    <Text style={styles.leadWhatsAppBtnText}>WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* CREATE COURSE MODAL */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingTop: Math.max(insets.top, 24) }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Publish New Course</Text>
                <Text style={styles.modalSub}>Adds live curriculum to Flymedia LMS</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setAddModalVisible(false)}
              >
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Course Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Master React Native & AI Mobile Dev"
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
                  <Text style={styles.inputLabel}>Fee (₹ INR)</Text>
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
                <Text style={styles.inputLabel}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Comprehensive program syllabus and student learning outcomes..."
                  placeholderTextColor={Colors.textLight}
                  multiline
                  numberOfLines={4}
                  value={courseDesc}
                  onChangeText={setCourseDesc}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Core Skills (comma-separated)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="React Native, Redux, Node.js, REST APIs"
                  placeholderTextColor={Colors.textLight}
                  value={courseSkills}
                  onChangeText={setCourseSkills}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tech Stack (comma-separated)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="JavaScript, TypeScript, Git, Android Studio"
                  placeholderTextColor={Colors.textLight}
                  value={courseTech}
                  onChangeText={setCourseTech}
                />
              </View>

              <TouchableOpacity
                style={styles.submitCourseBtn}
                onPress={handleCreateCourse}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color={Colors.textWhite} />
                ) : (
                  <Text style={styles.submitCourseBtnText}>Publish Course to Live App</Text>
                )}
              </TouchableOpacity>

              <View style={{ height: 30 }} />
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
    paddingBottom: 14,
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
  addCourseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryOrange,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 5,
  },
  addCourseBtnText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
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
  sectionCount: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryOrange,
  },
  loaderWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    color: Colors.textMuted,
    fontSize: 13,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  leadsList: {
    gap: 12,
  },
  leadCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
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
  submitCourseBtn: {
    backgroundColor: Colors.primaryOrange,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    ...Shadows.small,
  },
  submitCourseBtnText: {
    color: Colors.textWhite,
    fontSize: 15,
    fontWeight: '800',
  },
});
