import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Platform,
  Image,
  Alert,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Users,
  Award,
  CheckCircle,
  ExternalLink,
  PlusCircle,
  Trash2,
  Edit3,
  X,
  Sparkles,
  AlertCircle,
  RotateCcw,
  BookOpen,
} from 'lucide-react-native';
import { formatImageUrl } from '../utils/imageUrl';

type TutorTab = 'overview' | 'classes' | 'availability' | 'students';

interface TutorPanelScreenProps {
  navigation: any;
}

export const TutorPanelScreen: React.FC<TutorPanelScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 16);
  const bottomPadding = Math.max(insets.bottom, 16);

  const [activeTab, setActiveTab] = useState<TutorTab>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dashboard Stats & Data
  const [stats, setStats] = useState({
    upcomingClassesCount: 0,
    pastClassesCount: 0,
    totalAssignedCount: 0,
    totalStudentsCount: 0,
    totalSlotsCount: 0,
  });
  const [nextClass, setNextClass] = useState<any | null>(null);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [recentStudents, setRecentStudents] = useState<any[]>([]);

  // Classes Tab Filter
  const [classFilter, setClassFilter] = useState<'UPCOMING' | 'PAST' | 'ALL'>('UPCOMING');

  // Availability Tab Data
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Add Slot Modal
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [newSlotStartTime, setNewSlotStartTime] = useState('10:00');
  const [newSlotEndTime, setNewSlotEndTime] = useState('11:00');
  const [submittingSlot, setSubmittingSlot] = useState(false);

  // Edit Meet Link Modal
  const [showMeetLinkModal, setShowMeetLinkModal] = useState(false);
  const [selectedClassForLink, setSelectedClassForLink] = useState<any | null>(null);
  const [meetLinkInput, setMeetLinkInput] = useState('');
  const [savingLink, setSavingLink] = useState(false);

  // 14 days date selector
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
      const res = await ApiService.getTutorDashboard(user.token);
      if (res && res.success) {
        setStats(res.stats || { upcomingClassesCount: 0, pastClassesCount: 0, totalAssignedCount: 0, totalStudentsCount: 0, totalSlotsCount: 0 });
        setNextClass(res.nextClass || null);
        setClassesList(res.classes || []);
        setRecentStudents(res.recentStudents || []);
      }
    } catch (err) {
      console.warn('Failed to load tutor dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.token]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Initial selected date
  useEffect(() => {
    if (datesList.length > 0 && !selectedDate) {
      setSelectedDate(datesList[0].fullDate);
    }
  }, [datesList, selectedDate]);

  // Load slots when date changes
  useEffect(() => {
    if (selectedDate && user?.token) {
      loadSlots(selectedDate);
    }
  }, [selectedDate, user?.token]);

  const loadSlots = async (date: string) => {
    if (!user?.token) return;
    setLoadingSlots(true);
    try {
      const res = await ApiService.getTutorSlots(date, user.token);
      if (res && res.success) {
        setSlots(res.slots || []);
      } else {
        setSlots([]);
      }
    } catch (err) {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
    if (selectedDate) {
      loadSlots(selectedDate);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlotStartTime.trim() || !newSlotEndTime.trim()) {
      Alert.alert('Required', 'Please enter both start time and end time (e.g. 10:00 and 11:00).');
      return;
    }

    if (newSlotStartTime >= newSlotEndTime) {
      Alert.alert('Invalid Time', 'End time must be after start time.');
      return;
    }

    setSubmittingSlot(true);
    const res = await ApiService.addTutorSlot(
      {
        date: selectedDate,
        startTime: newSlotStartTime.trim(),
        endTime: newSlotEndTime.trim(),
      },
      user!.token!
    );
    setSubmittingSlot(false);

    if (res && res.success) {
      Alert.alert('Success', 'Availability slot added successfully!');
      setShowAddSlotModal(false);
      loadSlots(selectedDate);
      loadDashboardData();
    } else {
      Alert.alert('Error', res?.error || 'Failed to add slot.');
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    Alert.alert('Delete Slot', 'Are you sure you want to remove this availability slot?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const res = await ApiService.deleteTutorSlot(slotId, user!.token!);
          if (res && res.success) {
            setSlots(prev => prev.filter(s => s.id !== slotId));
            loadDashboardData();
          } else {
            Alert.alert('Error', res?.error || 'Failed to delete slot.');
          }
        },
      },
    ]);
  };

  const handleOpenEditMeetLink = (classItem: any) => {
    setSelectedClassForLink(classItem);
    setMeetLinkInput(classItem.meetLink || '');
    setShowMeetLinkModal(true);
  };

  const handleSaveMeetLink = async () => {
    if (!selectedClassForLink) return;

    setSavingLink(true);
    const res = await ApiService.updateTutorClass(
      {
        sessionId: selectedClassForLink.id,
        isOneOnOne: Boolean(selectedClassForLink.isOneOnOne),
        meetLink: meetLinkInput.trim() || undefined,
      },
      user!.token!
    );
    setSavingLink(false);

    if (res && res.success) {
      Alert.alert('Updated', 'Meeting link updated successfully!');
      setShowMeetLinkModal(false);
      loadDashboardData();
    } else {
      Alert.alert('Error', res?.error || 'Failed to update meeting link.');
    }
  };

  const handleLaunchMeeting = (link?: string | null) => {
    if (!link) {
      Alert.alert('Missing Link', 'Please add a meeting link first by tapping "Set Link".');
      return;
    }
    Linking.openURL(link).catch(() => {
      Alert.alert('Error', 'Unable to launch meeting link. Please ensure it is a valid URL.');
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
            <Sparkles size={12} color="#2563eb" />
            <Text style={styles.portalBadgeText}>TUTOR CONTROL CENTER</Text>
          </View>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {user?.name ? `Coach ${user.name.split(' ')[0]}'s Portal` : 'Tutor Portal'}
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
          style={[styles.tabItem, activeTab === 'classes' && styles.activeTabItem]}
          onPress={() => setActiveTab('classes')}
        >
          <Text style={[styles.tabText, activeTab === 'classes' && styles.activeTabText]}>
            Classes {classesList.length > 0 && `(${classesList.length})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'availability' && styles.activeTabItem]}
          onPress={() => setActiveTab('availability')}
        >
          <Text style={[styles.tabText, activeTab === 'availability' && styles.activeTabText]}>Availability</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'students' && styles.activeTabItem]}
          onPress={() => setActiveTab('students')}
        >
          <Text style={[styles.tabText, activeTab === 'students' && styles.activeTabText]}>Students</Text>
        </TouchableOpacity>
      </View>

      {/* BODY CONTENT */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading tutor dashboard...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding + 32 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563eb']} />}
          showsVerticalScrollIndicator={false}
        >
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <View style={styles.tabContent}>
              {/* HERO CARD */}
              <View style={styles.tutorHeroCard}>
                <View style={styles.heroGlow} />
                <View style={styles.heroContent}>
                  <Text style={styles.heroGreeting}>Welcome back, {user?.name || 'Tutor'} 🎓</Text>
                  <Text style={styles.heroSubtitle}>
                    Manage your class schedules, coordinate 1-on-1 student sessions, and provide meeting links.
                  </Text>

                  <View style={styles.heroActions}>
                    <TouchableOpacity
                      style={styles.heroPrimaryBtn}
                      onPress={() => setActiveTab('availability')}
                      activeOpacity={0.85}
                    >
                      <Calendar size={16} color={Colors.textWhite} />
                      <Text style={styles.heroPrimaryBtnText}>Set Availability</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.heroSecondaryBtn}
                      onPress={() => setActiveTab('classes')}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.heroSecondaryBtnText}>View Classes</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* 4 STATS CARDS */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <View style={[styles.statIconWrap, { backgroundColor: '#eff6ff' }]}>
                    <Video size={20} color="#2563eb" />
                  </View>
                  <Text style={styles.statValue}>{stats.upcomingClassesCount}</Text>
                  <Text style={styles.statLabel}>Upcoming Sessions</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={[styles.statIconWrap, { backgroundColor: '#ecfdf5' }]}>
                    <CheckCircle size={20} color="#059669" />
                  </View>
                  <Text style={styles.statValue}>{stats.pastClassesCount}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={[styles.statIconWrap, { backgroundColor: '#fef3c7' }]}>
                    <BookOpen size={20} color="#d97706" />
                  </View>
                  <Text style={styles.statValue}>{stats.totalAssignedCount}</Text>
                  <Text style={styles.statLabel}>Total Assigned</Text>
                </View>

                <View style={styles.statCard}>
                  <View style={[styles.statIconWrap, { backgroundColor: '#f3e8ff' }]}>
                    <Users size={20} color="#7c3aed" />
                  </View>
                  <Text style={styles.statValue}>{stats.totalStudentsCount}</Text>
                  <Text style={styles.statLabel}>Total Students</Text>
                </View>
              </View>

              {/* NEXT CLASS TO TEACH */}
              {nextClass ? (
                <View style={styles.sectionWrap}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Next Scheduled Teaching Session</Text>
                    <View style={styles.liveBadge}>
                      <View style={styles.liveDot} />
                      <Text style={styles.liveBadgeText}>NEXT UP</Text>
                    </View>
                  </View>

                  <View style={styles.nextClassCard}>
                    <View style={styles.nextClassTop}>
                      <View style={styles.classIconWrap}>
                        <Video size={22} color="#2563eb" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.nextClassTitle} numberOfLines={1}>
                          {nextClass.title}
                        </Text>
                        <Text style={styles.nextClassSub}>
                          {nextClass.isOneOnOne ? `Student: ${nextClass.studentName}` : `Course: ${nextClass.packageTitle}`}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.nextClassMeta}>
                      <Clock size={14} color="#2563eb" />
                      <Text style={styles.nextClassMetaText}>
                        {new Date(nextClass.startTime).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        • {new Date(nextClass.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({nextClass.duration}m)
                      </Text>
                    </View>

                    <View style={styles.nextClassActionRow}>
                      <TouchableOpacity
                        style={[styles.classActionBtnPrimary, !nextClass.meetLink && { opacity: 0.7 }]}
                        onPress={() => handleLaunchMeeting(nextClass.meetLink)}
                      >
                        <Video size={16} color={Colors.textWhite} />
                        <Text style={styles.classActionBtnPrimaryText}>
                          {nextClass.meetLink ? 'Launch Class Link' : 'No Link Added'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.classActionBtnSecondary}
                        onPress={() => handleOpenEditMeetLink(nextClass)}
                      >
                        <Edit3 size={15} color="#2563eb" />
                        <Text style={styles.classActionBtnSecondaryText}>Set Link</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <View style={styles.emptySessionBanner}>
                  <Calendar size={28} color="#2563eb" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.emptySessionTitle}>No Upcoming Sessions</Text>
                    <Text style={styles.emptySessionSub}>Set your availability slots so students can book sessions.</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.emptySessionSetBtn}
                    onPress={() => setActiveTab('availability')}
                  >
                    <Text style={styles.emptySessionSetBtnText}>Add Slot</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* QUICK RECENT STUDENTS */}
              <View style={styles.sectionWrap}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Students</Text>
                  <TouchableOpacity onPress={() => setActiveTab('students')}>
                    <Text style={styles.seeAllText}>View all ({recentStudents.length})</Text>
                  </TouchableOpacity>
                </View>

                {recentStudents.length === 0 ? (
                  <View style={styles.noDataCard}>
                    <Text style={styles.noDataText}>No students assigned yet.</Text>
                  </View>
                ) : (
                  recentStudents.slice(0, 4).map((student) => (
                    <View key={student.id} style={styles.studentItemRow}>
                      <Image source={{ uri: formatImageUrl(student.avatar) }} style={styles.studentAvatarSm} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.studentItemName}>{student.name}</Text>
                        <Text style={styles.studentItemCourse}>{student.enrolledIn}</Text>
                      </View>
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>Enrolled</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </View>
          )}

          {/* TAB 2: MY CLASSES */}
          {activeTab === 'classes' && (
            <View style={styles.tabContent}>
              {/* Filter Pills */}
              <View style={styles.filterPillsRow}>
                {(['UPCOMING', 'PAST', 'ALL'] as const).map((filter) => (
                  <TouchableOpacity
                    key={filter}
                    style={[styles.filterPill, classFilter === filter && styles.activeFilterPillTutor]}
                    onPress={() => setClassFilter(filter)}
                  >
                    <Text style={[styles.filterPillText, classFilter === filter && styles.activeFilterPillText]}>
                      {filter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {classesList.length === 0 ? (
                <View style={styles.emptyStateBox}>
                  <Video size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyStateTitle}>No Classes Scheduled</Text>
                  <Text style={styles.emptyStateSub}>You don't have any classes matching this filter.</Text>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {classesList.map((item) => {
                    const isPast = new Date(item.startTime) < new Date();
                    if (classFilter === 'UPCOMING' && isPast) return null;
                    if (classFilter === 'PAST' && !isPast) return null;

                    return (
                      <View key={item.id} style={styles.classCard}>
                        <View style={styles.classCardHeader}>
                          <View style={item.isOneOnOne ? styles.typeBadgeOneOnOne : styles.typeBadgeBatch}>
                            {item.isOneOnOne ? <Users size={12} color="#059669" /> : <BookOpen size={12} color="#2563eb" />}
                            <Text style={item.isOneOnOne ? styles.typeBadgeTextOneOnOne : styles.typeBadgeTextBatch}>
                              {item.isOneOnOne ? '1-ON-1 SESSION' : 'BATCH CLASS'}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.statusBadge,
                              isPast ? styles.statusBadgeCompleted : styles.statusBadgeScheduled,
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusBadgeText,
                                isPast ? styles.statusBadgeTextCompleted : styles.statusBadgeTextScheduled,
                              ]}
                            >
                              {isPast ? 'COMPLETED' : 'SCHEDULED'}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.classCardBody}>
                          <Text style={styles.classCardTitle}>{item.title}</Text>
                          <Text style={styles.classCardSub}>
                            {item.isOneOnOne ? `Student: ${item.studentName}` : `Course: ${item.packageTitle}`}
                          </Text>

                          <View style={styles.classCardTimeRow}>
                            <Clock size={13} color={Colors.textMuted} />
                            <Text style={styles.classCardTimeText}>
                              {new Date(item.startTime).toLocaleDateString()} •{' '}
                              {new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                              ({item.duration}m)
                            </Text>
                          </View>
                        </View>

                        <View style={styles.classCardFooter}>
                          <TouchableOpacity
                            style={[styles.classLaunchBtn, !item.meetLink && { backgroundColor: Colors.border }]}
                            onPress={() => handleLaunchMeeting(item.meetLink)}
                          >
                            <Video size={15} color={item.meetLink ? Colors.textWhite : Colors.textMuted} />
                            <Text style={[styles.classLaunchBtnText, !item.meetLink && { color: Colors.textMuted }]}>
                              {item.meetLink ? 'Open Meeting' : 'No Link Added'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.classEditLinkBtn}
                            onPress={() => handleOpenEditMeetLink(item)}
                          >
                            <Edit3 size={14} color="#2563eb" />
                            <Text style={styles.classEditLinkBtnText}>Edit Link</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* TAB 3: AVAILABILITY */}
          {activeTab === 'availability' && (
            <View style={styles.tabContent}>
              <View style={styles.availHeaderCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.availHeaderTitle}>Manage Availability Slots</Text>
                  <Text style={styles.availHeaderSub}>Set time slots where students can book 1-on-1 sessions with you.</Text>
                </View>
                <TouchableOpacity
                  style={styles.addSlotPrimaryBtn}
                  onPress={() => setShowAddSlotModal(true)}
                  activeOpacity={0.85}
                >
                  <PlusCircle size={16} color={Colors.textWhite} />
                  <Text style={styles.addSlotPrimaryBtnText}>Add Slot</Text>
                </TouchableOpacity>
              </View>

              {/* DATE PICKER STRIP */}
              <View style={styles.availDatesCard}>
                <Text style={styles.stepTitle}>Select Date</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesScroll}>
                  {datesList.map((item) => {
                    const isSelected = selectedDate === item.fullDate;
                    return (
                      <TouchableOpacity
                        key={item.fullDate}
                        style={[styles.datePill, isSelected && styles.datePillSelectedTutor]}
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

              {/* SLOTS LIST FOR DATE */}
              <View style={styles.slotsCardSection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={styles.stepTitle}>Slots on {selectedDate}</Text>
                  <Text style={styles.slotsCountBadge}>{slots.length} Slots</Text>
                </View>

                {loadingSlots ? (
                  <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#2563eb" />
                    <Text style={{ marginTop: 6, fontSize: 13, color: Colors.textMuted }}>Loading slots...</Text>
                  </View>
                ) : slots.length === 0 ? (
                  <View style={styles.noSlotsBox}>
                    <Calendar size={28} color={Colors.textMuted} />
                    <Text style={styles.noSlotsTitle}>No slots set for this date</Text>
                    <Text style={styles.noSlotsSub}>Tap "Add Slot" above to open your calendar for students.</Text>
                    <TouchableOpacity
                      style={styles.addFirstSlotBtn}
                      onPress={() => setShowAddSlotModal(true)}
                    >
                      <Text style={styles.addFirstSlotBtnText}>Add Time Slot</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ gap: 8 }}>
                    {slots.map((slot) => {
                      const isBooked = Boolean(slot.isBooked);
                      return (
                        <View
                          key={slot.id}
                          style={[styles.slotItemCard, isBooked && styles.slotItemCardBooked]}
                        >
                          <View style={styles.slotTimeWrap}>
                            <Clock size={16} color={isBooked ? '#059669' : '#2563eb'} />
                            <Text style={styles.slotTimeText}>
                              {formatSlotTime(slot.startTime)} - {formatSlotTime(slot.endTime)}
                            </Text>
                          </View>

                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {isBooked ? (
                              <View style={styles.bookedSlotBadge}>
                                <CheckCircle size={12} color="#059669" />
                                <Text style={styles.bookedSlotBadgeText}>Booked by Student</Text>
                              </View>
                            ) : (
                              <>
                                <View style={styles.availableSlotBadge}>
                                  <Text style={styles.availableSlotBadgeText}>Available</Text>
                                </View>
                                <TouchableOpacity
                                  style={styles.deleteSlotBtn}
                                  onPress={() => handleDeleteSlot(slot.id)}
                                >
                                  <Trash2 size={16} color="#ef4444" />
                                </TouchableOpacity>
                              </>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* TAB 4: STUDENTS */}
          {activeTab === 'students' && (
            <View style={styles.tabContent}>
              <View style={styles.studentsHeaderCard}>
                <Text style={styles.studentsHeaderTitle}>My Students ({recentStudents.length})</Text>
                <Text style={styles.studentsHeaderSub}>List of students enrolled in your classes or 1-on-1 sessions.</Text>
              </View>

              {recentStudents.length === 0 ? (
                <View style={styles.emptyStateBox}>
                  <Users size={48} color={Colors.textMuted} />
                  <Text style={styles.emptyStateTitle}>No Students Yet</Text>
                  <Text style={styles.emptyStateSub}>Once students book a slot with you, they will appear here.</Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  {recentStudents.map((st) => (
                    <View key={st.id} style={styles.studentFullCard}>
                      <Image source={{ uri: formatImageUrl(st.avatar) }} style={styles.studentFullAvatar} />
                      <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={styles.studentFullName}>{st.name}</Text>
                        <Text style={styles.studentFullEmail}>{st.email}</Text>
                        <Text style={styles.studentFullCourse}>{st.enrolledIn}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* MODAL: ADD AVAILABILITY SLOT */}
      <Modal visible={showAddSlotModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Availability Slot</Text>
              <TouchableOpacity onPress={() => setShowAddSlotModal(false)} style={styles.modalCloseBtn}>
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Date</Text>
              <View style={styles.modalDateDisplay}>
                <Calendar size={16} color="#2563eb" />
                <Text style={styles.modalDateText}>{selectedDate}</Text>
              </View>

              <Text style={[styles.modalLabel, { marginTop: 14 }]}>Start Time (HH:MM e.g. 10:00 or 14:30)</Text>
              <TextInput
                style={styles.modalInput}
                value={newSlotStartTime}
                onChangeText={setNewSlotStartTime}
                placeholder="10:00"
                placeholderTextColor={Colors.textMuted}
              />

              <Text style={[styles.modalLabel, { marginTop: 14 }]}>End Time (HH:MM e.g. 11:00 or 15:30)</Text>
              <TextInput
                style={styles.modalInput}
                value={newSlotEndTime}
                onChangeText={setNewSlotEndTime}
                placeholder="11:00"
                placeholderTextColor={Colors.textMuted}
              />

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                disabled={submittingSlot}
                onPress={handleAddSlot}
              >
                {submittingSlot ? (
                  <ActivityIndicator size="small" color={Colors.textWhite} />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Create Availability Slot</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: EDIT MEETING LINK */}
      <Modal visible={showMeetLinkModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Set Meeting Link</Text>
              <TouchableOpacity onPress={() => setShowMeetLinkModal(false)} style={styles.modalCloseBtn}>
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Session: {selectedClassForLink?.title}</Text>
              <Text style={[styles.modalLabel, { marginTop: 12 }]}>
                Google Meet / Zoom URL (e.g. https://meet.google.com/xxx-xxxx-xxx)
              </Text>
              <TextInput
                style={styles.modalInput}
                value={meetLinkInput}
                onChangeText={setMeetLinkInput}
                placeholder="https://meet.google.com/..."
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                disabled={savingLink}
                onPress={handleSaveMeetLink}
              >
                {savingLink ? (
                  <ActivityIndicator size="small" color={Colors.textWhite} />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>Save Meeting Link</Text>
                )}
              </TouchableOpacity>
            </View>
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
    color: '#2563eb',
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
    backgroundColor: '#eff6ff', // blue-50
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: '#2563eb',
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
  /* TUTOR HERO CARD */
  tutorHeroCard: {
    borderRadius: 20,
    backgroundColor: '#1e40af', // Blue-800
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
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
    color: '#1e40af',
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
  /* SECTION */
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
    color: '#2563eb',
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
  nextClassCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#bfdbfe', // blue-200
    ...Shadows.small,
  },
  nextClassTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextClassTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  nextClassSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  nextClassMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  nextClassMetaText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  nextClassActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  classActionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 10,
  },
  classActionBtnPrimaryText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  classActionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  classActionBtnSecondaryText: {
    color: '#2563eb',
    fontSize: 12,
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
  emptySessionSetBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  emptySessionSetBtnText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  studentItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  studentAvatarSm: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.border,
  },
  studentItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  studentItemCourse: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  activePill: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activePillText: {
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
  /* CLASSES TAB */
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
  activeFilterPillTutor: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  activeFilterPillText: {
    color: Colors.textWhite,
  },
  classCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  classCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    backgroundColor: '#eff6ff',
  },
  statusBadgeCompleted: {
    backgroundColor: '#f1f5f9',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusBadgeTextScheduled: {
    color: '#1d4ed8',
  },
  statusBadgeTextCompleted: {
    color: Colors.textMuted,
  },
  classCardBody: {
    marginTop: 2,
  },
  classCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  classCardSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  classCardTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  classCardTimeText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  classCardFooter: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  classLaunchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingVertical: 9,
    borderRadius: 10,
  },
  classLaunchBtnText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  classEditLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  classEditLinkBtnText: {
    color: '#2563eb',
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
  /* AVAILABILITY TAB */
  availHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  availHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  availHeaderSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    paddingRight: 8,
  },
  addSlotPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  addSlotPrimaryBtnText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  availDatesCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
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
  datePillSelectedTutor: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
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
  slotsCardSection: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  slotsCountBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
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
  addFirstSlotBtn: {
    marginTop: 12,
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addFirstSlotBtnText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
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
  slotItemCardBooked: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
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
  bookedSlotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  bookedSlotBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065f46',
  },
  availableSlotBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availableSlotBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  deleteSlotBtn: {
    padding: 4,
  },
  /* STUDENTS TAB */
  studentsHeaderCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  studentsHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  studentsHeaderSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  studentFullCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  studentFullAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.border,
  },
  studentFullName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  studentFullEmail: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  studentFullCourse: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 4,
  },
  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    padding: 18,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  modalDateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalDateText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  modalSubmitBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  modalSubmitBtnText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
});
