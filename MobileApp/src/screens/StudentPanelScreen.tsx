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

type StudentTab = 'overview' | 'sessions' | 'book' | 'packages';

interface StudentPanelScreenProps {
  navigation: any;
}

export const StudentPanelScreen: React.FC<StudentPanelScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 16);
  const bottomPadding = Math.max(insets.bottom, 16);

  const [activeTab, setActiveTab] = useState<StudentTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  // Booking Flow Data
  const [tutors, setTutors] = useState<any[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<any | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingSlotId, setBookingSlotId] = useState<string | null>(null);

  // Generate 14 days dates for booking
  const datesList = React.useMemo(() => {
    const list: { fullDate: string; dayName: string; dayNum: number; monthName: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      const fullDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      list.push({ fullDate, dayName, dayNum: d.getDate(), monthName });
    }
    return list;
  }, []);

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

      // Also load tutors for booking
      const tutorsRes = await ApiService.getStudentTutors();
      if (tutorsRes && tutorsRes.success) {
        setTutors(tutorsRes.tutors || []);
        if (tutorsRes.tutors?.length > 0 && !selectedTutor) {
          setSelectedTutor(tutorsRes.tutors[0]);
        }
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

  // Set initial selected date
  useEffect(() => {
    if (datesList.length > 0 && !selectedDate) {
      setSelectedDate(datesList[0].fullDate);
    }
  }, [datesList, selectedDate]);

  // Load slots when tutor or date changes
  useEffect(() => {
    if (selectedTutor && selectedDate) {
      loadSlots(selectedTutor.id, selectedDate);
    }
  }, [selectedTutor?.id, selectedDate]);

  const loadSlots = async (tutorId: string, date: string) => {
    setLoadingSlots(true);
    try {
      const res = await ApiService.getStudentSlots(tutorId, date, user?.token);
      if (res && res.success) {
        setAvailableSlots(res.slots || []);
      } else {
        setAvailableSlots([]);
      }
    } catch (err) {
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
    if (selectedTutor && selectedDate) {
      loadSlots(selectedTutor.id, selectedDate);
    }
  };

  const handleBookSlot = (slotId: string, slotTime: string) => {
    if (!user?.token) {
      Alert.alert('Sign In Required', 'Please sign in to book a session.');
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Would you like to book a 1-on-1 session with ${selectedTutor?.name} on ${selectedDate} at ${slotTime}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Book Session',
          style: 'default',
          onPress: async () => {
            setBookingSlotId(slotId);
            const res = await ApiService.bookStudentSlot(slotId, user.token!);
            setBookingSlotId(null);
            if (res && res.success) {
              Alert.alert('Success 🎉', 'Your session has been successfully booked!');
              setAvailableSlots(prev =>
                prev.map(s => {
                  if (s.id === slotId) {
                    const newCount = (s.bookedCount || 0) + 1;
                    return {
                      ...s,
                      isBooked: newCount >= 100,
                      isBookedByMe: true,
                      bookedCount: newCount,
                      availableSeats: Math.max(0, 100 - newCount),
                    };
                  }
                  return s;
                })
              );
              // Refresh full dashboard
              loadDashboardData();
            } else {
              Alert.alert('Booking Error', res?.error || 'Failed to book slot. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleOpenMeeting = (link?: string | null) => {
    if (!link) {
      Alert.alert('Meeting Link', 'The meeting link will be enabled 15 minutes before your scheduled session time.');
      return;
    }
    Linking.openURL(link).catch(() => {
      Alert.alert('Error', 'Unable to open meeting link. Please make sure you have a browser or Google Meet installed.');
    });
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
          style={[styles.tabItem, activeTab === 'book' && styles.activeTabItem]}
          onPress={() => setActiveTab('book')}
        >
          <Text style={[styles.tabText, activeTab === 'book' && styles.activeTabText]}>Book 1-on-1</Text>
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
                      onPress={() => setActiveTab('book')}
                      activeOpacity={0.85}
                    >
                      <Calendar size={16} color={Colors.textWhite} />
                      <Text style={styles.heroPrimaryBtnText}>Book 1-on-1 Session</Text>
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

              {/* STATS 4-CARD GRID */}
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
                  <View style={[styles.statIconWrap, { backgroundColor: '#ecfdf5' }]}>
                    <Calendar size={20} color="#059669" />
                  </View>
                  <Text style={styles.statValue}>{stats.bookedSessionsCount}</Text>
                  <Text style={styles.statLabel}>1-on-1 Bookings</Text>
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
                      onPress={() => handleOpenMeeting(nextSession.meetLink)}
                      activeOpacity={0.85}
                    >
                      <Video size={18} color={Colors.textWhite} />
                      <Text style={styles.joinMeetBtnText}>
                        {nextSession.meetLink ? 'Join Session Link' : 'Meeting Link (Pending Tutor)'}
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
                    <Text style={styles.emptySessionSub}>Book a 1-on-1 slot with any expert tutor to get started.</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.emptySessionBookBtn}
                    onPress={() => setActiveTab('book')}
                  >
                    <Text style={styles.emptySessionBookBtnText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* QUICK RECENT SESSIONS */}
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>My 1-on-1 Mentorships</Text>
                  <TouchableOpacity onPress={() => setActiveTab('sessions')}>
                    <Text style={styles.seeAllText}>See all ({bookedSessions.length})</Text>
                  </TouchableOpacity>
                </View>

                {bookedSessions.length === 0 ? (
                  <View style={styles.noDataCard}>
                    <Text style={styles.noDataText}>No 1-on-1 sessions booked yet.</Text>
                  </View>
                ) : (
                  bookedSessions.slice(0, 3).map((item) => (
                    <View key={item.id} style={styles.bookedSessionItem}>
                      <Image source={{ uri: formatImageUrl(item.tutor?.avatar) }} style={styles.sessionItemAvatar} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.sessionItemTutor}>{item.tutor?.name || 'Tutor'}</Text>
                        <Text style={styles.sessionItemDate}>
                          {item.date} • {formatSlotTime(item.startTime)} - {formatSlotTime(item.endTime)}
                        </Text>
                      </View>
                      <View style={styles.bookedBadge}>
                        <CheckCircle size={12} color="#059669" />
                        <Text style={styles.bookedBadgeText}>Booked</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
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
                  <TouchableOpacity style={styles.emptyStateBtn} onPress={() => setActiveTab('book')}>
                    <Text style={styles.emptyStateBtnText}>Book a 1-on-1 Session</Text>
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
                            onPress={() => handleOpenMeeting(session.meetLink)}
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
                          <TouchableOpacity
                            style={styles.sessionJoinBtn}
                            onPress={() => handleOpenMeeting(session.meetLink)}
                          >
                            <Video size={16} color={Colors.textWhite} />
                            <Text style={styles.sessionJoinBtnText}>
                              {session.meetLink ? 'Join Live Class' : 'Meeting Link (Pending)'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* TAB 3: BOOK 1-ON-1 SESSION */}
          {activeTab === 'book' && (
            <View style={styles.tabContent}>
              <View style={styles.bookHeaderBanner}>
                <Text style={styles.bookHeaderTitle}>Book a 1-on-1 Mentorship</Text>
                <Text style={styles.bookHeaderSub}>
                  Select your tutor, choose a preferred date and select an available time slot.
                </Text>
              </View>

              {/* STEP 1: TUTOR SELECTOR */}
              <View style={styles.bookingStepCard}>
                <Text style={styles.stepTitle}>1. Choose Expert Tutor</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tutorsScroll}>
                  {tutors.map((tutor) => {
                    const isSelected = selectedTutor?.id === tutor.id;
                    return (
                      <TouchableOpacity
                        key={tutor.id}
                        style={[styles.tutorCardSelectable, isSelected && styles.tutorCardSelected]}
                        onPress={() => setSelectedTutor(tutor)}
                        activeOpacity={0.8}
                      >
                        <Image source={{ uri: formatImageUrl(tutor.avatar) }} style={styles.tutorSelectAvatar} />
                        <Text style={styles.tutorSelectName} numberOfLines={1}>
                          {tutor.name}
                        </Text>
                        <Text style={styles.tutorSelectTitle} numberOfLines={1}>
                          {tutor.professionTitle}
                        </Text>

                        <View style={styles.tutorSelectRating}>
                          <Star size={11} color="#f59e0b" fill="#f59e0b" />
                          <Text style={styles.tutorSelectRatingText}>{tutor.rating.toFixed(1)}</Text>
                        </View>

                        {isSelected && (
                          <View style={styles.selectedTutorCheck}>
                            <CheckCircle size={14} color={Colors.textWhite} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* STEP 2: DATE SELECTOR */}
              <View style={styles.bookingStepCard}>
                <Text style={styles.stepTitle}>2. Choose Date</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesScroll}>
                  {datesList.map((item) => {
                    const isSelected = selectedDate === item.fullDate;
                    return (
                      <TouchableOpacity
                        key={item.fullDate}
                        style={[styles.datePill, isSelected && styles.datePillSelected]}
                        onPress={() => setSelectedDate(item.fullDate)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.datePillDay, isSelected && styles.datePillTextSelected]}>
                          {item.dayName}
                        </Text>
                        <Text style={[styles.datePillNum, isSelected && styles.datePillTextSelected]}>
                          {item.dayNum}
                        </Text>
                        <Text style={[styles.datePillMonth, isSelected && styles.datePillTextSelected]}>
                          {item.monthName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* STEP 3: AVAILABLE TIME SLOTS */}
              <View style={styles.bookingStepCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={styles.stepTitle}>3. Select Time Slot</Text>
                  {selectedTutor && (
                    <Text style={styles.tutorSlotNotice}>With {selectedTutor.name}</Text>
                  )}
                </View>

                {loadingSlots ? (
                  <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color={Colors.primaryOrange} />
                    <Text style={{ marginTop: 8, color: Colors.textMuted, fontSize: 13 }}>Loading slots...</Text>
                  </View>
                ) : availableSlots.length === 0 ? (
                  <View style={styles.noSlotsBox}>
                    <AlertCircle size={28} color={Colors.textMuted} />
                    <Text style={styles.noSlotsTitle}>No slots available on this date</Text>
                    <Text style={styles.noSlotsSub}>
                      Please pick another date from the calendar above to view open openings.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.slotsGrid}>
                    {availableSlots.map((slot) => {
                      const isBookedByMe = Boolean(slot.isBookedByMe);
                      const bookedCount = slot.bookedCount || 0;
                      const isFullyBooked = bookedCount >= 100 && !isBookedByMe;
                      const isExpired = Boolean(slot.isPast);
                      const availableSeats = Math.max(0, 100 - bookedCount);

                      return (
                        <View
                          key={slot.id}
                          style={[
                            styles.slotItemCard,
                            isBookedByMe && styles.slotItemCardBookedByMe,
                            (isFullyBooked || isExpired) && styles.slotItemCardDisabled,
                          ]}
                        >
                          <View style={styles.slotTimeWrap}>
                            <Clock
                              size={14}
                              color={isBookedByMe ? '#059669' : isFullyBooked || isExpired ? Colors.textMuted : Colors.primaryOrange}
                            />
                            <View>
                              <Text
                                style={[
                                  styles.slotTimeText,
                                  isBookedByMe && { color: '#065f46', fontWeight: '800' },
                                  (isFullyBooked || isExpired) && { color: Colors.textMuted, textDecorationLine: isExpired ? 'line-through' : 'none' },
                                ]}
                              >
                                {formatSlotTime(slot.startTime)} - {formatSlotTime(slot.endTime)}
                              </Text>
                              <Text style={styles.slotCapacityText}>
                                {isFullyBooked ? 'Full (100/100)' : `${availableSeats} seats left`}
                              </Text>
                            </View>
                          </View>

                          {/* Action Button */}
                          {isBookedByMe ? (
                            <View style={styles.slotBadgeBookedByMe}>
                              <CheckCircle size={12} color="#059669" />
                              <Text style={styles.slotBadgeTextBookedByMe}>Booked</Text>
                            </View>
                          ) : isFullyBooked ? (
                            <View style={styles.slotBadgeBookedOther}>
                              <Text style={styles.slotBadgeTextBookedOther}>Fully Booked (100)</Text>
                            </View>
                          ) : isExpired ? (
                            <View style={styles.slotBadgeExpired}>
                              <Text style={styles.slotBadgeTextExpired}>Expired</Text>
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={styles.bookSlotBtn}
                              disabled={bookingSlotId === slot.id}
                              onPress={() => handleBookSlot(slot.id, `${formatSlotTime(slot.startTime)} - ${formatSlotTime(slot.endTime)}`)}
                              activeOpacity={0.8}
                            >
                              {bookingSlotId === slot.id ? (
                                <ActivityIndicator size="small" color={Colors.textWhite} />
                              ) : (
                                <Text style={styles.bookSlotBtnText}>Book Now</Text>
                              )}
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* TAB 4: MY PACKAGES */}
          {activeTab === 'packages' && (
            <View style={styles.tabContent}>
              <View style={styles.packagesHeader}>
                <Text style={styles.packagesTitle}>My Enrolled Packages ({enrolledPackages.length})</Text>
                <Text style={styles.packagesSub}>Access your enrolled curriculum, syllabus, and progress.</Text>
              </View>

              {enrolledPackages.length === 0 ? (
                <View style={styles.emptyStateBox}>
                  <BookOpen size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyStateTitle}>No Enrolled Packages</Text>
                  <Text style={styles.emptyStateSub}>You haven't enrolled in any course packages yet.</Text>
                  <TouchableOpacity
                    style={styles.emptyStateBtn}
                    onPress={() => navigation.navigate('CoursesTab')}
                  >
                    <Text style={styles.emptyStateBtnText}>Browse All Courses</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ gap: 14 }}>
                  {enrolledPackages.map((pkg) => (
                    <View key={pkg.id} style={styles.packageCard}>
                      <Image source={{ uri: formatImageUrl(pkg.thumbnail) }} style={styles.packageThumb} />
                      <View style={styles.packageBody}>
                        <View style={styles.packageCategoryBadge}>
                          <Text style={styles.packageCategoryText}>{pkg.category}</Text>
                        </View>
                        <Text style={styles.packageName}>{pkg.title}</Text>
                        <Text style={styles.packageDuration}>Duration: {pkg.duration}</Text>

                        {/* Progress Bar */}
                        <View style={styles.progressBarWrap}>
                          <View style={[styles.progressBarFill, { width: `${pkg.progressPercent}%` }]} />
                        </View>
                        <View style={styles.progressTextRow}>
                          <Text style={styles.progressText}>
                            {pkg.completedLessons} of {pkg.totalLessons} lessons completed
                          </Text>
                          <Text style={styles.progressPercentText}>{pkg.progressPercent}%</Text>
                        </View>

                        <TouchableOpacity
                          style={styles.continueLearningBtn}
                          onPress={() => {
                            navigation.navigate('CourseDetail', {
                              course: {
                                id: pkg.packageId || pkg.id,
                                slug: pkg.slug,
                                title: pkg.title,
                                category: pkg.category,
                                thumbnail: pkg.thumbnail,
                              },
                            });
                          }}
                        >
                          <Text style={styles.continueLearningBtnText}>Continue Course</Text>
                          <ChevronRight size={16} color={Colors.textWhite} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
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
  packageThumb: {
    width: '100%',
    height: 130,
    backgroundColor: Colors.border,
  },
  packageBody: {
    padding: 16,
  },
  packageCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  packageCategoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryOrange,
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
  progressBarWrap: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ea580c',
    borderRadius: 3,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  progressText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  continueLearningBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ea580c',
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 14,
  },
  continueLearningBtnText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
});
