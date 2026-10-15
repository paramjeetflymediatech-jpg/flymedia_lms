import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Video,
  Award,
  User,
  Star,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertCircle,
  RotateCcw,
} from 'lucide-react-native';
import { formatImageUrl } from '../utils/imageUrl';

type StudentTab = 'overview' | 'sessions' | 'packages';

interface StudentPanelScreenProps {
  route?: any;
  navigation: any;
}

export const StudentPanelScreen: React.FC<StudentPanelScreenProps> = ({ route, navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 16);
  const bottomPadding = Math.max(insets.bottom, 16);

  const [activeTab, setActiveTab] = useState<StudentTab>(route?.params?.initialTab || 'overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (route?.params?.initialTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  // Dashboard Data
  const [stats, setStats] = useState({
    packagesCount: 0,
    upcomingSessionsCount: 0,
    bookedSessionsCount: 0,
    certificatesCount: 0,
  });
  const [nextSession, setNextSession] = useState<any | null>(null);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [enrolledPackages, setEnrolledPackages] = useState<any[]>([]);
  const [bookedSessions, setBookedSessions] = useState<any[]>([]);

  // Sessions Tab Filter
  const [sessionFilter, setSessionFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED'>('ALL');

  const loadDashboardData = useCallback(async () => {
    if (!user?.token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      const res = await ApiService.getStudentDashboard(user.token);
      if (res && res.success) {
        setStats(res.stats || { packagesCount: 0, upcomingSessionsCount: 0, bookedSessionsCount: 0, certificatesCount: 0 });
        setNextSession(res.nextSession || null);
        setUpcomingSessions(res.upcomingSessions || []);
        setEnrolledPackages(res.enrolledPackages || []);
        setBookedSessions(res.bookedSessions || []);
      }
    } catch (err) {
      console.warn('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.token]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleJoinLiveClass = async (classId?: string, fallbackLink?: string | null) => {
    if (!classId && !fallbackLink) {
      Alert.alert('Notice', 'Meeting link is not available yet.');
      return;
    }

    try {
      if (user?.token && classId) {
        // Record attendance and fetch Google Meet link
        const res = await ApiService.joinClass(classId, user.token);
        if (res && res.success && res.meetLink) {
          Linking.openURL(res.meetLink).catch(() => {
            Alert.alert('Google Meet', 'Opening Meet link. Please ensure Google Meet or browser is installed.');
          });
          // Refresh dashboard data to immediately reflect updated attendance
          loadDashboardData();
          return;
        }
      }

      if (fallbackLink) {
        Linking.openURL(fallbackLink).catch(() => {
          Alert.alert('Google Meet', 'Unable to open link. Please ensure Google Meet or browser is installed.');
        });
      } else {
        Alert.alert('Notice', 'Meeting link is not active yet.');
      }
    } catch (err) {
      if (fallbackLink) {
        Linking.openURL(fallbackLink).catch(() => {});
      }
    }
  };

  const formatSlotTime = (timeStr?: string) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    let hour = parseInt(parts[0], 10);
    const minute = parts[1];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  };

  return (
    <View style={[styles.screen, { paddingTop: topPadding }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <View style={styles.portalBadge}>
            <Sparkles size={12} color={Colors.primaryOrange} />
            <Text style={styles.portalBadgeText}>STUDENT PORTAL</Text>
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {user?.name ? `${user.name.split(' ')[0]}'s Learning Space` : 'My Student Dashboard'}
          </Text>
        </View>

        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <RotateCcw size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* SEGMENTED TAB BAR */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'overview' && styles.activeTabItem]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>Overview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'sessions' && styles.activeTabItem]}
          onPress={() => setActiveTab('sessions')}
        >
          <Text style={[styles.tabText, activeTab === 'sessions' && styles.activeTabText]}>
            My Sessions {upcomingSessions.length > 0 && `(${upcomingSessions.length})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'packages' && styles.activeTabItem]}
          onPress={() => setActiveTab('packages')}
        >
          <Text style={[styles.tabText, activeTab === 'packages' && styles.activeTabText]}>Packages</Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT BODY */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primaryOrange} />
          <Text style={styles.loadingText}>Loading your learning dashboard...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding + 32 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primaryOrange]} />}
          showsVerticalScrollIndicator={false}
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <View style={styles.tabContent}>
              {/* WELCOME HERO CARD */}
              <View style={styles.heroCard}>
                <View style={styles.heroGlow} />
                <View style={styles.heroContent}>
                  <Text style={styles.heroGreeting}>Welcome back, {user?.name || 'Student'} 👋</Text>
                  <Text style={styles.heroSubtitle}>
                    Ready to elevate your skills? Connect with certified industry mentors for 1-on-1 coaching.
                  </Text>

                  <View style={styles.heroActions}>
                    <TouchableOpacity
                      style={styles.heroPrimaryBtn}
                      onPress={() => setActiveTab('packages')}
                      activeOpacity={0.85}
                    >
                      <BookOpen size={16} color={Colors.textWhite} />
                      <Text style={styles.heroPrimaryBtnText}>My Packages</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.heroSecondaryBtn}
                      onPress={() => setActiveTab('sessions')}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.heroSecondaryBtnText}>View Sessions</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* STATS 3-CARD GRID */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <View style={[styles.statIconWrap, { backgroundColor: '#eff6ff' }]}>
                    <BookOpen size={20} color="#2563eb" />
                  </View>
                  <Text style={styles.statValue}>{stats.packagesCount}</Text>
                  <Text style={styles.statLabel}>Enrolled Packages</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={[styles.statIconWrap, { backgroundColor: '#fef3c7' }]}>
                    <Video size={20} color="#d97706" />
                  </View>
                  <Text style={styles.statValue}>{stats.upcomingSessionsCount}</Text>
                  <Text style={styles.statLabel}>Upcoming Live</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={[styles.statIconWrap, { backgroundColor: '#f3e8ff' }]}>
                    <Award size={20} color="#7c3aed" />
                  </View>
                  <Text style={styles.statValue}>{stats.certificatesCount}</Text>
                  <Text style={styles.statLabel}>Certificates</Text>
                </View>
              </View>

              {/* NEXT UPCOMING SESSION HIGHLIGHT */}
              {nextSession ? (
                <View style={styles.sectionWrap}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Next Scheduled Session</Text>
                    <View style={styles.liveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveBadgeText}>UPCOMING</Text>
                    </View>
                  </View>

                  <View style={styles.nextSessionCard}>
                    <View style={styles.nextSessionTop}>
                      <Image
                        source={{ uri: formatImageUrl(nextSession.tutorAvatar) }}
                        style={styles.tutorAvatarSm}
                      />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.nextSessionTitle} numberOfLines={1}>
                          {nextSession.title}
                        </Text>
                        <Text style={styles.nextSessionTutor}>Mentor: {nextSession.tutorName}</Text>
                      </View>
                    </View>

                    <View style={styles.nextSessionMeta}>
                      <View style={styles.metaRow}>
                        <Clock size={15} color={Colors.primaryOrange} />
                        <Text style={styles.metaText}>
                          {new Date(nextSession.startTime).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          • {new Date(nextSession.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.joinMeetBtn}
                      onPress={() => handleJoinLiveClass(nextSession.id, nextSession.meetLink)}
                      activeOpacity={0.85}
                    >
                      <Video size={18} color={Colors.textWhite} />
                      <Text style={styles.joinMeetBtnText}>
                        {nextSession.meetLink ? 'Join Google Meet' : 'Meeting Link (Pending Tutor)'}
                      </Text>
                      <ExternalLink size={14} color={Colors.textWhite} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.emptySessionBanner}>
                  <Calendar size={28} color={Colors.primaryOrange} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.emptySessionTitle}>No Upcoming Sessions</Text>
                    <Text style={styles.emptySessionSub}>Check your enrolled packages for scheduled class timings.</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.emptySessionBookBtn}
                    onPress={() => setActiveTab('packages')}
                  >
                    <Text style={styles.emptySessionBookBtnText}>View Packages</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* TAB 2: MY SESSIONS */}
          {activeTab === 'sessions' && (
            <View style={styles.tabContent}>
              {/* Filter Pills */}
              <View style={styles.filterPillsRow}>
                {(['ALL', 'UPCOMING', 'COMPLETED'] as const).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterPill, sessionFilter === filter && styles.activeFilterPill]}
                    onPress={() => setSessionFilter(filter)}
                  >
                    <Text style={[styles.filterPillText, sessionFilter === filter && styles.activeFilterPillText]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {upcomingSessions.length === 0 && bookedSessions.length === 0 ? (
                <View style={styles.emptyStateBox}>
                  <Video size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyStateTitle}>No Scheduled Sessions</Text>
                  <Text style={styles.emptyStateSub}>You don't have any classes matching this filter.</Text>
                  <TouchableOpacity style={styles.emptyStateBtn} onPress={() => setActiveTab('packages')}>
                    <Text style={styles.emptyStateBtnText}>Explore Packages</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {/* Render 1-on-1 Sessions */}
                  {bookedSessions.map((session) => {
                    const isCompleted = session.isPast;
                    if (sessionFilter === 'UPCOMING' && isCompleted) return null;
                    if (sessionFilter === 'COMPLETED' && !isCompleted) return null;

                    return (
                      <View key={session.id} style={styles.sessionCard}>
                        <View style={styles.sessionCardHeader}>
                          <View style={styles.typeBadgeOneOnOne}>
                            <User size={12} color="#059669" />
                            <Text style={styles.typeBadgeTextOneOnOne}>1-ON-1 SESSION</Text>
                          </View>
                          <View
                            style={[
                              styles.statusBadge,
                              isCompleted ? styles.statusBadgeCompleted : styles.statusBadgeScheduled,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                isCompleted ? styles.statusBadgeTextCompleted : styles.statusBadgeTextScheduled,
                              ]}
                            >
                              {isCompleted ? 'COMPLETED' : 'SCHEDULED'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.sessionCardBody}>
                          <Image
                            source={{ uri: formatImageUrl(session.tutor?.avatar) }}
                            style={styles.sessionCardAvatar}
                          />
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.sessionCardTutorName}>{session.tutor?.name || 'Tutor'}</Text>
                            <Text style={styles.sessionCardTutorSub}>
                              {session.tutor?.professionTitle || 'Personal Technical Mentor'}
                            </Text>
                            <View style={styles.sessionCardTimeRow}>
                              <Clock size={13} color={Colors.textMuted} />
                              <Text style={styles.sessionCardTimeText}>
                                {session.date} • {formatSlotTime(session.startTime)} - {formatSlotTime(session.endTime)}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.sessionCardFooter}>
                          <TouchableOpacity
                            style={[
                              styles.sessionJoinBtn,
                              isCompleted && { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
                            ]}
                            disabled={isCompleted}
                            onPress={() => handleJoinLiveClass(session.id, session.meetLink)}
                          >
                            <Video size={16} color={isCompleted ? Colors.textMuted : Colors.textWhite} />
                            <Text
                              style={[
                                styles.sessionJoinBtnText,
                                isCompleted && { color: Colors.textMuted },
                              ]}
                            >
                              {isCompleted
                                ? 'Session Concluded'
                                : session.meetLink
                                ? 'Join Google Meet'
                                : 'Meeting Link (Pending)'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}

                  {/* Render Live Classes */}
                  {upcomingSessions.map((session) => {
                    if (session.type === 'ONE_ON_ONE') return null; // Already rendered above
                    return (
                      <View key={session.id} style={styles.sessionCard}>
                        <View style={styles.sessionCardHeader}>
                          <View style={styles.typeBadgeBatch}>
                            <BookOpen size={12} color="#2563eb" />
                            <Text style={styles.typeBadgeTextBatch}>LIVE BATCH CLASS</Text>
                          </View>
                          <View style={[styles.statusBadge, styles.statusBadgeScheduled]}>
                            <Text style={[styles.statusBadgeText, styles.statusBadgeTextScheduled]}>LIVE CLASS</Text>
                          </View>
                        </View>

                        <View style={styles.sessionCardBody}>
                          <Image
                            source={{ uri: formatImageUrl(session.tutorAvatar) }}
                            style={styles.sessionCardAvatar}
                          />
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.sessionCardTutorName}>{session.title}</Text>
                            <Text style={styles.sessionCardTutorSub}>Course: {session.packageTitle}</Text>
                            <View style={styles.sessionCardTimeRow}>
                              <Clock size={13} color={Colors.textMuted} />
                              <Text style={styles.sessionCardTimeText}>
                                {new Date(session.startTime).toLocaleDateString()} •{' '}
                                {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.sessionCardFooter}>
                          {new Date(session.startTime).getTime() + (session.duration || 60) * 60000 < Date.now() ? (
                            <View style={styles.sessionEndedBtn}>
                              <Clock size={15} color={Colors.textMuted} />
                              <Text style={styles.sessionEndedBtnText}>Class Concluded</Text>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={styles.sessionJoinBtn}
                              onPress={() => handleJoinLiveClass(session.id, session.meetLink)}
                              activeOpacity={0.85}
                            >
                              <Video size={16} color={Colors.textWhite} />
                              <Text style={styles.sessionJoinBtnText}>
                                {session.meetLink ? 'Join Google Meet' : 'Meeting Link (Pending)'}
                              </Text>
                              <ExternalLink size={14} color={Colors.textWhite} />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* TAB 3: MY PACKAGES */}
          {activeTab === 'packages' && (
            <View style={styles.tabContent}>
              <View style={styles.packagesHeader}>
                <Text style={styles.packagesTitle}>My Enrolled Packages ({enrolledPackages.length})</Text>
                <Text style={styles.packagesSub}>
                  Monitor your 12-class completion, attendance, missed sessions, and expiration.
                </Text>
              </View>

              {enrolledPackages.length === 0 ? (
                <View style={styles.emptyStateBox}>
                  <BookOpen size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyStateTitle}>No Enrolled Packages</Text>
                  <Text style={styles.emptyStateSub}>You haven't enrolled in any packages yet.</Text>
                  <TouchableOpacity
                    style={styles.emptyStateBtn}
                    onPress={() => navigation.navigate('CoursesTab')}
                  >
                    <Text style={styles.emptyStateBtnText}>Browse All Courses</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ gap: 16 }}>
                  {enrolledPackages.map((pkg) => {
                    const prog = pkg.progress || {
                      totalClasses: 12,
                      conductedClasses: 0,
                      attendedClasses: 0,
                      missedClasses: 0,
                      remainingClasses: 12,
                      isExpired: false,
                      status: 'ACTIVE',
                      progressPercentage: 0,
                    };
                    const isExpired = Boolean(prog.isExpired || prog.status === 'EXPIRED');

                    return (
                      <View key={pkg.id} style={styles.packageCard}>
                        {/* Thumbnail & Badges */}
                        <View style={styles.packageThumbWrap}>
                          <Image source={{ uri: formatImageUrl(pkg.thumbnail) }} style={styles.packageThumb} />
                          <View style={styles.packageThumbOverlay}>
                            <View style={styles.packageCategoryBadge}>
                              <Text style={styles.packageCategoryText}>{pkg.category || 'Training'}</Text>
                            </View>
                            {isExpired ? (
                              <View style={[styles.packageStatusPill, { backgroundColor: '#e11d48' }]}>
                                <Text style={styles.packageStatusPillText}>PACKAGE EXPIRED</Text>
                              </View>
                            ) : (
                              <View style={[styles.packageStatusPill, { backgroundColor: '#059669' }]}>
                                <Text style={styles.packageStatusPillText}>ACTIVE • {prog.remainingClasses} CLASSES LEFT</Text>
                              </View>
                            )}
                          </View>
                        </View>

                        <View style={styles.packageBody}>
                          <Text style={styles.packageName}>{pkg.title}</Text>
                          <Text style={styles.packageDuration}>
                            Enrolled: {pkg.enrolledAt || 'Recent'} • {pkg.duration || '6 Months'}
                          </Text>

                          {/* 12-Class Completion Progress Bar */}
                          <View style={styles.completionBarWrap}>
                            <View style={styles.completionBarLabelRow}>
                              <Text style={styles.completionBarTitle}>12-Class Completion</Text>
                              <Text style={[styles.completionBarCount, isExpired && { color: '#e11d48' }]}>
                                {prog.conductedClasses} / {prog.totalClasses || 12} Conducted
                              </Text>
                            </View>
                            <View style={styles.progressBarTrack}>
                              <View
                                style={[
                                  styles.progressBarFillGradient,
                                  { width: `${prog.progressPercentage || 0}%` },
                                  isExpired && { backgroundColor: '#94a3b8' },
                                ]}
                              />
                            </View>
                          </View>

                          {/* 3 Metrics Grid: Attended, Missed, Remaining */}
                          <View style={styles.metricsGrid}>
                            <View style={[styles.metricBox, { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
                              <Text style={[styles.metricLabel, { color: '#16a34a' }]}>ATTENDED</Text>
                              <Text style={[styles.metricValue, { color: '#15803d' }]}>{prog.attendedClasses || 0}</Text>
                            </View>
                            <View style={[styles.metricBox, { backgroundColor: '#fff1f2', borderColor: '#fecdd3' }]}>
                              <Text style={[styles.metricLabel, { color: '#e11d48' }]}>MISSED</Text>
                              <Text style={[styles.metricValue, { color: '#be123c' }]}>{prog.missedClasses || 0}</Text>
                            </View>
                            <View style={[styles.metricBox, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                              <Text style={[styles.metricLabel, { color: '#2563eb' }]}>REMAINING</Text>
                              <Text style={[styles.metricValue, { color: '#1d4ed8' }]}>{prog.remainingClasses || 0}</Text>
                            </View>
                          </View>

                          {/* Expiration Policy Banner */}
                          <View style={styles.policyBanner}>
                            <AlertCircle size={14} color="#d97706" />
                            <Text style={styles.policyBannerText}>
                              {isExpired
                                ? 'All 12 scheduled tutor classes have been conducted. This package has expired.'
                                : 'Package includes 12 live classes. Absent sessions are counted as missed and cannot be re-attended.'}
                            </Text>
                          </View>

                          <TouchableOpacity
                            style={styles.viewScheduleBtn}
                            onPress={() => setActiveTab('sessions')}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.viewScheduleBtnText}>View Scheduled Classes</Text>
                            <ChevronRight size={16} color={Colors.textWhite} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 8,
  },
  portalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  portalBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryOrange,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  refreshBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTabItem: {
    backgroundColor: '#fff7ed', // orange-50
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primaryOrange,
    fontWeight: '800',
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  tabContent: {
    gap: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  /* HERO CARD */
  heroCard: {
    borderRadius: 20,
    backgroundColor: '#ea580c', // Orange-600
    overflow: 'hidden',
    padding: 20,
    ...Shadows.medium,
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
  },
  heroGreeting: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 6,
    lineHeight: 18,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  heroPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroPrimaryBtnText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  heroSecondaryBtn: {
    backgroundColor: Colors.textWhite,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  heroSecondaryBtnText: {
    color: '#ea580c',
    fontSize: 13,
    fontWeight: '800',
  },
  /* STATS GRID */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
  /* SECTION WRAP */
  sectionWrap: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryOrange,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563eb',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563eb',
  },
  nextSessionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#fed7aa', // orange-200
    ...Shadows.small,
  },
  nextSessionTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorAvatarSm: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.border,
  },
  nextSessionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  nextSessionTutor: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  nextSessionMeta: {
    marginTop: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  joinMeetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ea580c',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  joinMeetBtnText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  emptySessionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptySessionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptySessionSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  emptySessionBookBtn: {
    backgroundColor: '#ea580c',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptySessionBookBtnText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  bookedSessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  sessionItemAvatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.border,
  },
  sessionItemTutor: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sessionItemDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  bookedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  bookedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  noDataCard: {
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  /* SESSIONS TAB */
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activeFilterPill: {
    backgroundColor: '#ea580c',
    borderColor: '#ea580c',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  activeFilterPillText: {
    color: Colors.textWhite,
  },
  sessionCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadgeOneOnOne: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeTextOneOnOne: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  typeBadgeBatch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeTextBatch: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563eb',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeScheduled: {
    backgroundColor: '#fff7ed',
  },
  statusBadgeCompleted: {
    backgroundColor: '#f1f5f9',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusBadgeTextScheduled: {
    color: '#c2410c',
  },
  statusBadgeTextCompleted: {
    color: Colors.textMuted,
  },
  sessionCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionCardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.border,
  },
  sessionCardTutorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  sessionCardTutorSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sessionCardTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  sessionCardTimeText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  sessionCardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sessionJoinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ea580c',
    paddingVertical: 10,
    borderRadius: 10,
  },
  sessionJoinBtnText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyStateBox: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 12,
  },
  emptyStateSub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
  emptyStateBtn: {
    marginTop: 16,
    backgroundColor: '#ea580c',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyStateBtnText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  /* BOOKING TAB */
  bookHeaderBanner: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bookHeaderTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  bookHeaderSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 17,
  },
  creditPillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff7ed',
    borderWidth: 1.5,
    borderColor: '#fed7aa',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  creditPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#c2410c',
  },
  policyNoticeBox: {
    marginTop: 12,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  policyNoticeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
    fontWeight: '500',
  },
  bookingStepCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  tutorsScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  tutorCardSelectable: {
    width: 120,
    padding: 12,
    borderRadius: 14,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    position: 'relative',
  },
  tutorCardSelected: {
    borderColor: '#ea580c',
    backgroundColor: '#fff7ed',
  },
  tutorSelectAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.border,
    marginBottom: 6,
  },
  tutorSelectName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  tutorSelectTitle: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  tutorSelectRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 6,
  },
  tutorSelectRatingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  selectedTutorCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#ea580c',
    borderRadius: 10,
    padding: 1,
  },
  datesScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  datePill: {
    width: 58,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  datePillSelected: {
    backgroundColor: '#ea580c',
    borderColor: '#ea580c',
  },
  datePillDay: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  datePillNum: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginVertical: 2,
  },
  datePillMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  datePillTextSelected: {
    color: Colors.textWhite,
  },
  tutorSlotNotice: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primaryOrange,
  },
  noSlotsBox: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.border,
  },
  noSlotsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 8,
  },
  noSlotsSub: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },
  slotsGrid: {
    gap: 8,
  },
  slotItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  slotItemCardBookedByMe: {
    backgroundColor: '#ecfdf5',
    borderColor: '#6ee7b7',
  },
  slotItemCardDisabled: {
    opacity: 0.6,
  },
  slotTimeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotTimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  slotCapacityText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 2,
  },
  bookSlotBtn: {
    backgroundColor: '#ea580c',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  bookSlotBtnText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  slotBadgeBookedByMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  slotBadgeTextBookedByMe: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065f46',
  },
  slotBadgeBookedOther: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  slotBadgeTextBookedOther: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  slotBadgeExpired: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  slotBadgeTextExpired: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  /* PACKAGES TAB */
  packagesHeader: {
    marginBottom: 4,
  },
  packagesTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  packagesSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  packageCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.small,
  },
  packageThumbWrap: {
    width: '100%',
    height: 140,
    position: 'relative',
    backgroundColor: Colors.border,
  },
  packageThumb: {
    width: '100%',
    height: '100%',
  },
  packageThumbOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageBody: {
    padding: 16,
  },
  packageCategoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    ...Shadows.small,
  },
  packageCategoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryOrange,
  },
  packageStatusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    ...Shadows.small,
  },
  packageStatusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  packageName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  packageDuration: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  completionBarWrap: {
    marginTop: 14,
  },
  completionBarLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  completionBarTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  completionBarCount: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryOrange,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFillGradient: {
    height: '100%',
    backgroundColor: Colors.primaryOrange,
    borderRadius: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  metricBox: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  policyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fef3c7',
    padding: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  policyBannerText: {
    flex: 1,
    fontSize: 11,
    color: '#92400e',
    lineHeight: 16,
    fontWeight: '500',
  },
  viewScheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primaryOrange,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  viewScheduleBtnText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  sessionEndedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sessionEndedBtnText: {
    color: Colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
});
