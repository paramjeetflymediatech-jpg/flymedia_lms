import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  TextInput,
  Linking,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { Header } from '../components/common/Header';
import { CallbackModal } from '../components/common/CallbackModal';
import { CachedImage } from '../components/common/CachedImage';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import {
  Video,
  Award,
  BookOpen,
  Calendar,
  LogIn,
  GraduationCap,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Receipt,
  Search,
  X,
  ExternalLink,
  Layers,
} from 'lucide-react-native';
import { formatImageUrl } from '../utils/imageUrl';

interface MyLearningScreenProps {
  navigation: any;
}

type PackageFilter = 'ALL' | 'IN_PROGRESS' | 'COMPLETED';

export const MyLearningScreen: React.FC<MyLearningScreenProps> = ({ navigation }) => {
  const { enrollments, user, refreshEnrollments } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<PackageFilter>('ALL');
  const [callbackModalVisible, setCallbackModalVisible] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshEnrollments();
    setRefreshing(false);
  };

  const handleJoinClass = async (courseTitle: string, meetLink?: string | null, classId?: string) => {
    if (user?.token && classId) {
      try {
        const res = await ApiService.joinClass(classId, user.token);
        if (res && res.success && res.meetLink) {
          Linking.openURL(res.meetLink).catch(() => {
            Alert.alert('Live Class', `Link: ${res.meetLink}`);
          });
          refreshEnrollments();
          return;
        }
      } catch (e) {
        // Fallback to meetLink
      }
    }

    if (meetLink) {
      Linking.openURL(meetLink).catch(() => {
        Alert.alert(
          'Live Class',
          `Unable to open meet link directly. Please ensure Google Meet or a browser is installed.\nLink: ${meetLink}`
        );
      });
      return;
    }

    Alert.alert(
      'Live Class Portal',
      `Live Classroom for "${courseTitle}".\n\nInstructor session will start at the scheduled time. Meeting link will activate 15 minutes before the class.`,
      [{ text: 'OK' }]
    );
  };

  const handleCertificate = (ready: boolean, title: string) => {
    if (ready) {
      Alert.alert(
        'Verified Certificate Ready 🎓',
        `Your industry-accredited certificate for "${title}" is ready! You can view and download it from the student portal.`
      );
    } else {
      Alert.alert(
        'Certificate In Progress ⏳',
        `Complete all curriculum modules, submit your capstone project, and attend live classes for "${title}" to unlock your certificate.`
      );
    }
  };

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return enrollments.filter(pkg => {
      const title = (pkg.courseTitle || pkg.title || '').toLowerCase();
      const category = (pkg.category || '').toLowerCase();
      const matchesSearch =
        title.includes(searchQuery.toLowerCase()) ||
        category.includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilter === 'COMPLETED') {
        return pkg.certificateReady || pkg.progressPercent >= 100;
      }
      if (selectedFilter === 'IN_PROGRESS') {
        return !pkg.certificateReady && pkg.progressPercent < 100;
      }
      return true;
    });
  }, [enrollments, searchQuery, selectedFilter]);

  // Quick stats
  const completedCount = useMemo(
    () => enrollments.filter(e => e.certificateReady || e.progressPercent >= 100).length,
    [enrollments]
  );
  const inProgressCount = useMemo(
    () => enrollments.filter(e => !e.certificateReady && e.progressPercent < 100).length,
    [enrollments]
  );

  return (
    <View style={styles.screen}>
      <Header
        onCallPress={() => setCallbackModalVisible(true)}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          user ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primaryOrange]}
              tintColor={Colors.primaryOrange}
            />
          ) : undefined
        }
      >
        {!user ? (
          /* AUTHENTICATION GATE WHEN LOGGED OUT */
          <View style={styles.authGateCard}>
            <View style={{ alignItems: 'center', marginBottom: 14 }}>
              <Image
                source={require('../assets/logo.png')}
                style={{ width: 170, height: 40 }}
                resizeMode="contain"
              />
            </View>
            <View style={styles.iconCircle}>
              <GraduationCap size={40} color={Colors.primaryOrange} />
            </View>
            <Text style={styles.authGateTitle}>Sign In to Access Your Packages</Text>
            <Text style={styles.authGateSub}>
              Please sign in to view your purchased course packages, live class links, progress, and certificates.
            </Text>
            <TouchableOpacity
              style={styles.loginActionBtn}
              onPress={() => navigation.navigate('ProfileTab')}
              activeOpacity={0.85}
            >
              <LogIn size={18} color={Colors.textWhite} />
              <Text style={styles.loginActionBtnText}>Sign In / Create Account</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* LOGGED IN STUDENT PURCHASED PACKAGES */
          <View>
            {/* HERO OVERVIEW CARD */}
            <View style={styles.welcomeCard}>
              <View style={styles.welcomeTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.welcomeGreeting}>
                    Welcome back, <Text style={styles.userName}>{user.name || 'Student'}</Text>! 👋
                  </Text>
                  <Text style={styles.welcomeSub}>
                    Account: <Text style={styles.roleTag}>{user.role}</Text> • {user.email}
                  </Text>
                </View>
                <View style={styles.activePillBadge}>
                  <Sparkles size={12} color="#16a34a" />
                  <Text style={styles.activePillText}>STUDENT ACTIVE</Text>
                </View>
              </View>

              {/* STATS STRIP */}
              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{enrollments.length}</Text>
                  <Text style={styles.statLabel}>Purchased</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: Colors.primaryOrange }]}>
                    {inProgressCount}
                  </Text>
                  <Text style={styles.statLabel}>In Progress</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={[styles.statNumber, { color: '#16a34a' }]}>
                    {completedCount}
                  </Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
              </View>
            </View>

            {/* FULL STUDENT PANEL SHORTCUT */}
            <TouchableOpacity
              style={styles.openStudentPanelBtn}
              onPress={() => navigation.navigate('StudentPanel')}
              activeOpacity={0.85}
            >
              <View style={styles.openStudentPanelLeft}>
                <View style={styles.openStudentPanelIcon}>
                  <Calendar size={18} color={Colors.textWhite} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.openStudentPanelTitle}>Student Dashboard & Live Classes</Text>
                  <Text style={styles.openStudentPanelSub}>
                    Attend live classes, track package progress, and manage schedule
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.primaryOrange} />
            </TouchableOpacity>

            {/* SECTION HEADER */}
            <View style={styles.sectionHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Layers size={20} color={Colors.primaryRose} />
                <Text style={styles.sectionTitle}>Purchased Packages</Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{enrollments.length} Total</Text>
              </View>
            </View>

            {/* SEARCH BAR (Visible if packages exist) */}
            {enrollments.length > 0 && (
              <View style={styles.searchBox}>
                <Search size={16} color={Colors.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search purchased packages..."
                  placeholderTextColor={Colors.textLight}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={16} color={Colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* FILTER PILLS */}
            {enrollments.length > 0 && (
              <View style={styles.filterPillsRow}>
                <TouchableOpacity
                  style={[
                    styles.filterPill,
                    selectedFilter === 'ALL' && styles.activeFilterPill,
                  ]}
                  onPress={() => setSelectedFilter('ALL')}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedFilter === 'ALL' && styles.activeFilterPillText,
                    ]}
                  >
                    All Packages ({enrollments.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterPill,
                    selectedFilter === 'IN_PROGRESS' && styles.activeFilterPill,
                  ]}
                  onPress={() => setSelectedFilter('IN_PROGRESS')}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedFilter === 'IN_PROGRESS' && styles.activeFilterPillText,
                    ]}
                  >
                    In Progress ({inProgressCount})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterPill,
                    selectedFilter === 'COMPLETED' && styles.activeFilterPill,
                  ]}
                  onPress={() => setSelectedFilter('COMPLETED')}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      selectedFilter === 'COMPLETED' && styles.activeFilterPillText,
                    ]}
                  >
                    Completed ({completedCount})
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* PACKAGES LIST */}
            {enrollments.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconCircle}>
                  <BookOpen size={40} color={Colors.primaryOrange} />
                </View>
                <Text style={styles.emptyTitle}>No Purchased Packages Yet</Text>
                <Text style={styles.emptyText}>
                  You haven't purchased or enrolled in any packages. Browse our professional career programs and start learning today!
                </Text>
                <TouchableOpacity
                  style={styles.exploreBtn}
                  onPress={() => navigation.navigate('CoursesTab')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.exploreBtnText}>Browse Available Packages</Text>
                  <ChevronRight size={16} color={Colors.textWhite} />
                </TouchableOpacity>
              </View>
            ) : filteredPackages.length === 0 ? (
              <View style={styles.emptyFilterCard}>
                <Text style={styles.emptyFilterText}>
                  No purchased packages found matching "{searchQuery}"
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    setSelectedFilter('ALL');
                  }}
                  style={styles.clearFilterBtn}
                >
                  <Text style={styles.clearFilterBtnText}>Reset Filter</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredPackages.map(pkg => {
                const title = pkg.courseTitle || pkg.title || 'Course Package';
                const courseId = pkg.packageId || pkg.courseId || pkg.id;
                const isPaid = (pkg.amountPaid && pkg.amountPaid > 0) || (pkg.price && pkg.price > 0);
                const displayPrice = pkg.amountPaid
                  ? `₹${Number(pkg.amountPaid).toLocaleString('en-IN')}`
                  : pkg.price
                  ? `₹${Number(pkg.price).toLocaleString('en-IN')}`
                  : 'Free Enrollment';

                const prog = (pkg as any).progress;
                const isExpired = prog ? Boolean(prog.isExpired || prog.status === 'EXPIRED') : false;

                return (
                  <View key={pkg.id} style={styles.packageCard}>
                    {/* THUMBNAIL BANNER */}
                    <View style={styles.thumbnailContainer}>
                      <CachedImage
                        uri={pkg.thumbnail}
                        style={styles.packageThumbnail}
                        resizeMode="cover"
                      />
                      {/* Gradient overlay tags */}
                      <View style={styles.thumbTopOverlay}>
                        <View style={styles.categoryPill}>
                          <Text style={styles.categoryText}>{pkg.category || 'Package'}</Text>
                        </View>
                        {prog ? (
                          <View style={[styles.purchasedVerifiedBadge, isExpired ? { backgroundColor: '#e11d48' } : { backgroundColor: '#059669' }]}>
                            <Text style={styles.purchasedVerifiedText}>
                              {isExpired ? 'EXPIRED' : `ACTIVE • ${prog.remainingClasses} LEFT`}
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.purchasedVerifiedBadge}>
                            <CheckCircle2 size={12} color="#ffffff" />
                            <Text style={styles.purchasedVerifiedText}>PURCHASED</Text>
                          </View>
                        )}
                      </View>

                      {pkg.mode && (
                        <View style={styles.modeTag}>
                          <Text style={styles.modeTagText}>{pkg.mode}</Text>
                        </View>
                      )}
                    </View>

                    {/* CONTENT BODY */}
                    <View style={styles.packageBody}>
                      {/* Title */}
                      <Text style={styles.packageTitle}>{title}</Text>

                      {/* PURCHASE & DURATION META INFO */}
                      <View style={styles.purchaseMetaBox}>
                        <View style={styles.metaRow}>
                          <View style={styles.priceTag}>
                            <Receipt size={13} color="#16a34a" />
                            <Text style={styles.priceTagText}>
                              {isPaid ? `Paid: ${displayPrice}` : displayPrice}
                            </Text>
                          </View>
                          <Text style={styles.enrolledDate}>
                            Enrolled: {pkg.enrolledAt || 'Recent'}
                          </Text>
                        </View>

                        <View style={styles.detailsRow}>
                          <View style={styles.detailItem}>
                            <Clock size={13} color={Colors.textSecondary} />
                            <Text style={styles.detailText}>
                              {pkg.duration || '6 Months'}
                            </Text>
                          </View>

                          {pkg.totalClasses !== undefined && pkg.totalClasses > 0 && (
                            <View style={styles.detailItem}>
                              <Video size={13} color={Colors.primaryRose} />
                              <Text style={styles.detailText}>
                                {pkg.totalClasses} Live Classes
                              </Text>
                            </View>
                          )}

                          {pkg.transactionId && (
                            <View style={styles.detailItem}>
                              <Text style={styles.txnText} numberOfLines={1}>
                                Txn: {pkg.transactionId}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* 12-CLASS COMPLETION & ATTENDANCE PROGRESS */}
                      {prog && (
                        <View style={{ marginTop: 12, backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.textPrimary }}>12-Class Completion</Text>
                            <Text style={{ fontSize: 11, fontWeight: '800', color: isExpired ? '#e11d48' : Colors.primaryOrange }}>
                              {prog.conductedClasses} / {prog.totalClasses || 12} Conducted
                            </Text>
                          </View>
                          <View style={{ height: 6, backgroundColor: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                            <View
                              style={{
                                height: '100%',
                                width: `${Math.min(100, Math.max(0, prog.progressPercentage || 0))}%`,
                                backgroundColor: isExpired ? '#94a3b8' : Colors.primaryOrange,
                                borderRadius: 3,
                              }}
                            />
                          </View>
                          <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                            <View style={{ flex: 1, backgroundColor: '#f0fdf4', paddingVertical: 5, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#bbf7d0' }}>
                              <Text style={{ fontSize: 9, fontWeight: '800', color: '#16a34a' }}>ATTENDED: {prog.attendedClasses || 0}</Text>
                            </View>
                            <View style={{ flex: 1, backgroundColor: '#fff1f2', paddingVertical: 5, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#fecdd3' }}>
                              <Text style={{ fontSize: 9, fontWeight: '800', color: '#e11d48' }}>MISSED: {prog.missedClasses || 0}</Text>
                            </View>
                            <View style={{ flex: 1, backgroundColor: '#eff6ff', paddingVertical: 5, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#bfdbfe' }}>
                              <Text style={{ fontSize: 9, fontWeight: '800', color: '#2563eb' }}>LEFT: {prog.remainingClasses || 0}</Text>
                            </View>
                          </View>
                        </View>
                      )}

                      {/* PROGRESS BAR */}
                      <View style={styles.progressContainer}>
                        <View style={styles.progressLabelRow}>
                          <Text style={styles.progressLabel}>Curriculum Completion</Text>
                          <Text style={styles.progressPercent}>{pkg.progressPercent}%</Text>
                        </View>
                        <View style={styles.progressBarBg}>
                          <View
                            style={[
                              styles.progressBarFill,
                              { width: `${Math.min(100, Math.max(0, pkg.progressPercent))}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.lessonsCount}>
                          {pkg.completedLessons} of {pkg.totalLessons} lessons completed
                        </Text>
                      </View>

                      {/* LIVE CLASS SCHEDULE BOX */}
                      {pkg.nextLiveClass && (
                        <View style={styles.liveClassCard}>
                          <View style={styles.liveClassTop}>
                            <View style={styles.liveIndicator}>
                              <View style={styles.liveDot} />
                              <Text style={styles.liveText}>LIVE SESSION AVAILABLE</Text>
                            </View>
                          </View>
                          <Text style={styles.liveClassTopic}>{pkg.nextLiveClass}</Text>

                          <TouchableOpacity
                            style={styles.joinClassBtn}
                            onPress={() => {
                              const firstUpcomingClass = (pkg.liveClasses || []).find((lc: any) => new Date(lc.startTime) >= new Date());
                              const targetClassId = firstUpcomingClass?.id || (pkg.liveClasses || [])[0]?.id;
                              handleJoinClass(title, pkg.nextLiveClassMeetLink, targetClassId);
                            }}
                            activeOpacity={0.85}
                          >
                            <Video size={16} color={Colors.textWhite} />
                            <Text style={styles.joinClassBtnText}>Join Live Classroom</Text>
                            <ExternalLink size={14} color={Colors.textWhite} />
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* ACTION BUTTONS */}
                      <View style={styles.actionButtonsCol}>
                        <TouchableOpacity
                          style={styles.continueLearningBtn}
                          onPress={() => {
                            navigation.navigate('CourseDetail', {
                              courseId,
                              course: {
                                id: courseId,
                                slug: pkg.slug || courseId,
                                title,
                                category: pkg.category,
                                thumbnail: pkg.thumbnail,
                                price: pkg.price || 0,
                                duration: pkg.duration || '6 Months',
                                level: pkg.level || 'Beginner to Advanced',
                              },
                            });
                          }}
                          activeOpacity={0.85}
                        >
                          <BookOpen size={16} color={Colors.textWhite} />
                          <Text style={styles.continueLearningBtnText}>
                            Continue Course / Syllabus
                          </Text>
                          <ChevronRight size={16} color={Colors.textWhite} />
                        </TouchableOpacity>

                        <View style={styles.bottomSecondaryActions}>
                          <TouchableOpacity
                            style={styles.certBtn}
                            onPress={() => handleCertificate(pkg.certificateReady, title)}
                            activeOpacity={0.7}
                          >
                            <Award
                              size={15}
                              color={pkg.certificateReady ? '#16a34a' : Colors.textMuted}
                            />
                            <Text
                              style={[
                                styles.certBtnText,
                                pkg.certificateReady && { color: '#16a34a', fontWeight: '800' },
                              ]}
                            >
                              {pkg.certificateReady ? 'Certificate Ready' : 'Certificate In Progress'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.mentorBookBtn}
                            onPress={() => navigation.navigate('StudentPanel')}
                            activeOpacity={0.7}
                          >
                            <Calendar size={14} color={Colors.primaryOrange} />
                            <Text style={styles.mentorBookBtnText}>Book 1-on-1</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <CallbackModal
        visible={callbackModalVisible}
        onClose={() => setCallbackModalVisible(false)}
        defaultCourse="My Learning Support"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  authGateCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 40,
    ...Shadows.medium,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 0, 0.3)',
  },
  authGateTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  authGateSub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  loginActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryRose,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 14,
    gap: 8,
    ...Shadows.brand,
  },
  loginActionBtnText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '800',
  },
  welcomeCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    ...Shadows.small,
  },
  welcomeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  welcomeGreeting: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textWhite,
    marginBottom: 4,
  },
  userName: {
    color: Colors.primaryOrange,
  },
  welcomeSub: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
  },
  roleTag: {
    color: Colors.primaryOrange,
    fontWeight: '700',
  },
  activePillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.3)',
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#4ade80',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#1e293b',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textWhite,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94a3b8',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
  },
  openStudentPanelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff7ed',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    marginBottom: 20,
    ...Shadows.small,
  },
  openStudentPanelLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 8,
  },
  openStudentPanelIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#ea580c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  openStudentPanelTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  openStudentPanelSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  countBadge: {
    backgroundColor: 'rgba(230, 8, 112, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    paddingVertical: 2,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  activeFilterPill: {
    backgroundColor: Colors.primaryRose,
    borderColor: Colors.primaryRose,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  activeFilterPillText: {
    color: Colors.textWhite,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 10,
    ...Shadows.small,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryOrange,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    ...Shadows.orange,
  },
  exploreBtnText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '800',
  },
  emptyFilterCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyFilterText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 12,
  },
  clearFilterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  clearFilterBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryRose,
  },
  packageCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 18,
    ...Shadows.small,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 175,
    backgroundColor: '#0f172a',
  },
  packageThumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbTopOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  purchasedVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16a34a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  purchasedVerifiedText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  modeTag: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modeTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#f8fafc',
    textTransform: 'uppercase',
  },
  packageBody: {
    padding: 18,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 24,
    marginBottom: 12,
  },
  purchaseMetaBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  priceTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
  },
  enrolledDate: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  detailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  txnText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryOrange,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primaryOrange,
    borderRadius: 4,
  },
  lessonsCount: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  liveClassCard: {
    backgroundColor: '#fff7ed',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 0, 0.3)',
    marginBottom: 16,
  },
  liveClassTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ea580c',
    letterSpacing: 0.5,
  },
  liveClassTopic: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  joinClassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryRose,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
    ...Shadows.brand,
  },
  joinClassBtnText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '800',
  },
  actionButtonsCol: {
    gap: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  continueLearningBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryOrange,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    ...Shadows.orange,
  },
  continueLearningBtnText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '800',
  },
  bottomSecondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  certBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  certBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  mentorBookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mentorBookBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryOrange,
  },
});
