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
import { Colors, Shadows } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { FlymediaContact } from '../../constants/contact';
import {
  ArrowLeft,
  ArrowRight,
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
  LogOut,
  LayoutDashboard,
  User,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react-native';
import { formatImageUrl } from '../../utils/imageUrl';

type TutorTab = 'overview' | 'classes' | 'availability' | 'students' | 'profile';

const PRESET_SLOTS = [
  { start: '09:00', end: '10:00', label: '9:00 - 10:00 AM' },
  { start: '10:00', end: '11:00', label: '10:00 - 11:00 AM' },
  { start: '11:00', end: '12:00', label: '11:00 AM - 12:00 PM' },
  { start: '12:00', end: '13:00', label: '12:00 - 1:00 PM' },
  { start: '13:00', end: '14:00', label: '1:00 - 2:00 PM' },
  { start: '14:00', end: '15:00', label: '2:00 - 3:00 PM' },
  { start: '15:00', end: '16:00', label: '3:00 - 4:00 PM' },
  { start: '16:00', end: '17:00', label: '4:00 - 5:00 PM' },
  { start: '17:00', end: '18:00', label: '5:00 - 6:00 PM' },
  { start: '18:00', end: '19:00', label: '6:00 - 7:00 PM' },
  { start: '19:00', end: '20:00', label: '7:00 - 8:00 PM' },
  { start: '20:00', end: '21:00', label: '8:00 - 9:00 PM' },
];

const PRESET_DURATIONS = [
  { mins: 30, label: '30m' },
  { mins: 45, label: '45m' },
  { mins: 60, label: '1h' },
  { mins: 90, label: '1.5h' },
  { mins: 120, label: '2h' },
];

const HOUR_PRESETS = [
  '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'
];

const MINUTE_PRESETS = ['00', '15', '30', '45'];

const formatTo12Hour = (time24: string): string => {
  if (!time24) return '--:--';
  const clean = time24.trim().split(' ')[0];
  const parts = clean.split(':');
  if (parts.length < 2) return time24;
  let hours = parseInt(parts[0], 10);
  const minutes = (parts[1] || '00').padStart(2, '0');
  if (isNaN(hours)) return time24;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours}:${minutes} ${ampm}`;
};

const formatMinutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

interface TutorPanelScreenProps {
  navigation: any;
}

export const TutorPanelScreen: React.FC<TutorPanelScreenProps> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 16);
  const bottomPadding = Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 8);

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
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Add Slot Modal
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [newSlotStartTime, setNewSlotStartTime] = useState('10:00');
  const [newSlotEndTime, setNewSlotEndTime] = useState('11:00');
  const [submittingSlot, setSubmittingSlot] = useState(false);
  const [activeTimePicker, setActiveTimePicker] = useState<'start' | 'end'>('start');

  // Edit Meet Link Modal
  const [showMeetLinkModal, setShowMeetLinkModal] = useState(false);
  const [selectedClassForLink, setSelectedClassForLink] = useState<any | null>(null);
  const [meetLinkInput, setMeetLinkInput] = useState('');
  const [savingLink, setSavingLink] = useState(false);

  // View Enrolled Students Modal
  const [selectedSlotForStudents, setSelectedSlotForStudents] = useState<any | null>(null);

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

  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return -1;
    const clean = timeStr.trim().split(' ')[0];
    const parts = clean.split(':');
    if (parts.length < 2) return -1;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return -1;
    }
    return hours * 60 + minutes;
  };

  const addMinutesToTime = (timeStr: string, minutesToAdd: number): string => {
    const min = parseTimeToMinutes(timeStr);
    if (min < 0) return timeStr;
    const newMin = Math.min(23 * 60 + 59, min + minutesToAdd);
    const h = Math.floor(newMin / 60);
    const m = newMin % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const now = new Date();
  const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const minAllowedStartMinutesToday = currentMinutes + 120; // 2 hours advance notice

  const getInitialStartTimeForDate = (targetDate?: string): { start: string; end: string } => {
    const checkDate = targetDate || selectedDate || todayString;
    if (checkDate === todayString) {
      // Must be at least 2 hours in advance (120 mins)
      const nextHour = Math.ceil(minAllowedStartMinutesToday / 60);
      if (nextHour <= 22) {
        const startH = String(nextHour).padStart(2, '0');
        const endH = String(Math.min(23, nextHour + 1)).padStart(2, '0');
        return { start: `${startH}:00`, end: `${endH}:00` };
      }
      return { start: '22:00', end: '23:00' };
    }
    return { start: '10:00', end: '11:00' };
  };

  const handleOpenAddSlotModal = () => {
    const { start, end } = getInitialStartTimeForDate(selectedDate || todayString);
    setNewSlotStartTime(start);
    setNewSlotEndTime(end);
    setActiveTimePicker('start');
    setShowAddSlotModal(true);
  };

  const handleSelectPresetSlot = (start: string, end: string) => {
    if (selectedDate === todayString && parseTimeToMinutes(start) < minAllowedStartMinutesToday) {
      return;
    }
    setNewSlotStartTime(start);
    setNewSlotEndTime(end);
  };

  const handleSelectDuration = (mins: number) => {
    const end = addMinutesToTime(newSlotStartTime || '10:00', mins);
    setNewSlotEndTime(end);
  };

  const handleSelectHour = (hour: string, type: 'start' | 'end') => {
    const current = type === 'start' ? newSlotStartTime : newSlotEndTime;
    const parts = (current || '10:00').split(':');
    let minPart = parts[1] || '00';
    const hNum = parseInt(hour, 10);

    if (type === 'start') {
      if (selectedDate === todayString) {
        // If current minute makes this slot < 2h advance, auto-clamp to first valid minute in this hour
        if (hNum * 60 + parseInt(minPart, 10) < minAllowedStartMinutesToday) {
          const firstValidMin = MINUTE_PRESETS.find(
            (m) => hNum * 60 + parseInt(m, 10) >= minAllowedStartMinutesToday
          );
          if (firstValidMin) {
            minPart = firstValidMin;
          }
        }
      }
      const newTime = `${hour}:${minPart}`;
      setNewSlotStartTime(newTime);
      const startM = parseTimeToMinutes(newTime);
      const endM = parseTimeToMinutes(newSlotEndTime);
      if (endM <= startM) {
        setNewSlotEndTime(addMinutesToTime(newTime, 60));
      }
    } else {
      // type === 'end'
      if (hNum * 60 + parseInt(minPart, 10) <= selectedStartMinutes) {
        const firstValidMin = MINUTE_PRESETS.find(
          (m) => hNum * 60 + parseInt(m, 10) > selectedStartMinutes
        );
        if (firstValidMin) {
          minPart = firstValidMin;
        }
      }
      const newTime = `${hour}:${minPart}`;
      setNewSlotEndTime(newTime);
    }
  };

  const handleSelectMinute = (minute: string, type: 'start' | 'end') => {
    const current = type === 'start' ? newSlotStartTime : newSlotEndTime;
    const parts = (current || '10:00').split(':');
    const hourPart = parts[0] || '10';
    const totalMin = parseInt(hourPart, 10) * 60 + parseInt(minute, 10);

    if (type === 'start' && selectedDate === todayString && totalMin < minAllowedStartMinutesToday) {
      return;
    }
    if (type === 'end' && totalMin <= selectedStartMinutes) {
      return;
    }

    const newTime = `${hourPart}:${minute}`;
    if (type === 'start') {
      setNewSlotStartTime(newTime);
      const startM = parseTimeToMinutes(newTime);
      const endM = parseTimeToMinutes(newSlotEndTime);
      if (endM <= startM) {
        setNewSlotEndTime(addMinutesToTime(newTime, 60));
      }
    } else {
      setNewSlotEndTime(newTime);
    }
  };

  const selectedStartMinutes = parseTimeToMinutes(newSlotStartTime);
  const selectedEndMinutes = parseTimeToMinutes(newSlotEndTime);
  const selectedDurationMinutes =
    selectedStartMinutes >= 0 && selectedEndMinutes > selectedStartMinutes
      ? selectedEndMinutes - selectedStartMinutes
      : 0;

  const isPastDate = !!selectedDate && selectedDate < todayString;
  const isWithinTwoHours =
    !!selectedDate &&
    selectedDate === todayString &&
    selectedStartMinutes >= 0 &&
    selectedStartMinutes < minAllowedStartMinutesToday;

  const currentOverlappingSlot = slots.find((slot) => {
    const sMin = parseTimeToMinutes(slot.startTime);
    const eMin = parseTimeToMinutes(slot.endTime);
    if (sMin < 0 || eMin < 0 || selectedStartMinutes < 0 || selectedEndMinutes < 0) return false;
    return selectedStartMinutes < eMin && selectedEndMinutes > sMin;
  });

  const isSlotTimeInvalid =
    selectedStartMinutes < 0 ||
    selectedEndMinutes < 0 ||
    selectedStartMinutes >= selectedEndMinutes ||
    isPastDate ||
    isWithinTwoHours ||
    !!currentOverlappingSlot;

  const handleAddSlot = async () => {
    if (!newSlotStartTime.trim() || !newSlotEndTime.trim()) {
      Alert.alert('Required', 'Please enter both start time and end time (e.g. 10:00 and 11:00).');
      return;
    }

    const startMin = parseTimeToMinutes(newSlotStartTime);
    const endMin = parseTimeToMinutes(newSlotEndTime);

    if (startMin < 0 || endMin < 0) {
      Alert.alert('Invalid Time', 'Please enter time in HH:mm format (e.g. 10:00 or 14:30).');
      return;
    }

    if (startMin >= endMin) {
      Alert.alert('Invalid Time', 'End time must be after start time.');
      return;
    }

    const clientNow = new Date();
    const clientToday = `${clientNow.getFullYear()}-${String(clientNow.getMonth() + 1).padStart(2, '0')}-${String(clientNow.getDate()).padStart(2, '0')}`;
    const clientMin = clientNow.getHours() * 60 + clientNow.getMinutes();
    const minAllowedStart = clientMin + 120; // 2 hours minimum advance

    if (selectedDate < clientToday) {
      Alert.alert('Past Date', 'Cannot add availability for past dates.');
      return;
    }

    if (selectedDate === clientToday && startMin < minAllowedStart) {
      const earliestStr = formatTo12Hour(formatMinutesToTime(Math.min(23 * 60 + 59, minAllowedStart)));
      Alert.alert(
        '2 Hours Advance Notice Required',
        `Slots for today must be scheduled at least 2 hours in advance.\n\nEarliest slot start time allowed today is ${earliestStr}.`
      );
      return;
    }

    // Client-side overlap pre-check
    const overlapping = slots.find((slot) => {
      const sMin = parseTimeToMinutes(slot.startTime);
      const eMin = parseTimeToMinutes(slot.endTime);
      if (sMin < 0 || eMin < 0) return false;
      return startMin < eMin && endMin > sMin;
    });

    if (overlapping) {
      Alert.alert(
        'Overlapping Slot',
        `This time slot overlaps with an existing slot (${overlapping.startTime} - ${overlapping.endTime}). Please choose a different time.`
      );
      return;
    }

    setSubmittingSlot(true);
    const res = await ApiService.addTutorSlot(
      {
        date: selectedDate,
        startTime: newSlotStartTime.trim(),
        endTime: newSlotEndTime.trim(),
        clientDate: clientToday,
        clientCurrentMinutes: clientMin,
      },
      user!.token!
    );
    setSubmittingSlot(false);

    if (res && res.success) {
      Alert.alert('Success', 'Availability slot added successfully!');
      setShowAddSlotModal(false);
      const nextDefaults = getInitialStartTimeForDate(selectedDate);
      setNewSlotStartTime(nextDefaults.start);
      setNewSlotEndTime(nextDefaults.end);
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
        console.error('Logout error:', err);
      }
    };

    if (Platform.OS === 'web') {
      const win = (globalThis as any).window;
      const confirmLogout =
        win && win.confirm
          ? win.confirm('Are you sure you want to sign out of your Tutor account?')
          : true;
      if (confirmLogout) {
        doLogout();
      }
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to sign out of your Tutor account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: doLogout,
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={[styles.headerContainer, { paddingTop: topPadding + 6 }]}>
        <View style={styles.headerTopRow}>
          <View style={styles.brandGroup}>
            {navigation.canGoBack && navigation.canGoBack() && (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backBtn}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <ArrowLeft size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            )}
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <View style={styles.tutorBadge}>
              <Sparkles size={11} color={Colors.primaryRose} />
              <Text style={styles.tutorBadgeText}>TUTOR</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={onRefresh}
              style={styles.iconActionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <RotateCcw size={16} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab('profile')}
              style={[
                styles.profileHeaderBtn,
                activeTab === 'profile' && styles.profileHeaderBtnActive,
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.8}
            >
              <View style={styles.profileAvatarMini}>
                <Text style={styles.profileAvatarMiniText}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
                </Text>
              </View>
              <User size={15} color={activeTab === 'profile' ? Colors.primaryRose : Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutPillBtn}
              activeOpacity={0.82}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <LogOut size={13} color="#dc2626" />
              <Text style={styles.logoutPillText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* BODY CONTENT */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primaryRose} />
          <Text style={styles.loadingText}>Loading tutor dashboard...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.contentContainer}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding + 32 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primaryRose]} />}
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
                  onPress={handleOpenAddSlotModal}
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
                      onPress={handleOpenAddSlotModal}
                    >
                      <Text style={styles.addFirstSlotBtnText}>Add Time Slot</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ gap: 8 }}>
                    {slots.map((slot) => {
                      const bookedCount = slot.bookedCount || 0;
                      const isFull = bookedCount >= 100;
                      const hasBookings = bookedCount > 0;
                      return (
                        <View
                          key={slot.id}
                          style={[styles.slotItemCard, hasBookings && styles.slotItemCardBooked]}
                        >
                          <View style={styles.slotTimeWrap}>
                            <Clock size={16} color={hasBookings ? '#059669' : Colors.primaryRose} />
                            <View>
                              <Text style={styles.slotTimeText}>
                                {formatSlotTime(slot.startTime)} - {formatSlotTime(slot.endTime)}
                              </Text>
                              <Text style={{ fontSize: 10, fontWeight: '700', color: hasBookings ? '#059669' : Colors.textMuted, marginTop: 2 }}>
                                {hasBookings ? `${bookedCount}/100 Students Booked` : '0/100 Students Booked (Open)'}
                              </Text>
                            </View>
                          </View>

                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            {isFull ? (
                              <TouchableOpacity
                                style={[styles.bookedSlotBadge, { backgroundColor: '#fee2e2' }]}
                                onPress={() => setSelectedSlotForStudents(slot)}
                                activeOpacity={0.7}
                              >
                                <CheckCircle size={12} color="#dc2626" />
                                <Text style={[styles.bookedSlotBadgeText, { color: '#dc2626' }]}>Full (100/100)</Text>
                              </TouchableOpacity>
                            ) : hasBookings ? (
                              <TouchableOpacity
                                style={styles.bookedSlotBadge}
                                onPress={() => setSelectedSlotForStudents(slot)}
                                activeOpacity={0.7}
                              >
                                <Users size={12} color="#059669" />
                                <Text style={styles.bookedSlotBadgeText}>{bookedCount} Booked (View)</Text>
                              </TouchableOpacity>
                            ) : (
                              <View style={styles.availableSlotBadge}>
                                <Text style={styles.availableSlotBadgeText}>Available</Text>
                              </View>
                            )}

                            {!hasBookings && (
                              <TouchableOpacity
                                style={styles.deleteSlotBtn}
                                onPress={() => handleDeleteSlot(slot.id)}
                              >
                                <Trash2 size={16} color="#ef4444" />
                              </TouchableOpacity>
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

          {/* TAB 5: TUTOR PROFILE */}
          {activeTab === 'profile' && (
            <View style={styles.tabContent}>
              {/* TUTOR PROFILE HERO CARD */}
              <View style={styles.tutorProfileCard}>
                <View style={styles.profileAvatarLarge}>
                  <Text style={styles.profileAvatarLargeText}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
                  </Text>
                </View>

                <Text style={styles.profileTutorName}>{user?.name || 'Instructor'}</Text>
                <Text style={styles.profileTutorEmail}>{user?.email || 'instructor@flymediatech.com'}</Text>

                <View style={styles.profileRoleBadge}>
                  <ShieldCheck size={14} color={Colors.primaryRose} />
                  <Text style={styles.profileRoleBadgeText}>VERIFIED INSTRUCTOR ACCOUNT</Text>
                </View>
              </View>

              {/* STATS OVERVIEW CARDS */}
              <View style={styles.profileStatsRow}>
                <View style={styles.profileStatItem}>
                  <Text style={styles.profileStatNum}>{stats.totalAssignedCount}</Text>
                  <Text style={styles.profileStatLabel}>Assigned Batches</Text>
                </View>
                <View style={styles.profileStatItem}>
                  <Text style={[styles.profileStatNum, { color: '#2563eb' }]}>{stats.totalSlotsCount}</Text>
                  <Text style={styles.profileStatLabel}>Available Slots</Text>
                </View>
                <View style={styles.profileStatItem}>
                  <Text style={[styles.profileStatNum, { color: '#059669' }]}>{stats.totalStudentsCount}</Text>
                  <Text style={styles.profileStatLabel}>Total Students</Text>
                </View>
              </View>

              {/* TEACHING CONFIGURATION */}
              <View style={styles.profileSectionCard}>
                <Text style={styles.profileSectionTitle}>Teaching Configuration</Text>
                
                <View style={styles.profileInfoRow}>
                  <Video size={18} color={Colors.primaryRose} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.profileInfoRowTitle}>Meeting Links</Text>
                    <Text style={styles.profileInfoRowSubtitle}>
                      Add Zoom or Google Meet URLs to scheduled sessions so students can launch them directly.
                    </Text>
                  </View>
                </View>

                <View style={[styles.profileInfoRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                  <Clock size={18} color="#2563eb" />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.profileInfoRowTitle}>1-on-1 Slots</Text>
                    <Text style={styles.profileInfoRowSubtitle}>
                      Configure your weekly 1-on-1 availability slots. Students book single 60-minute sessions directly.
                    </Text>
                  </View>
                </View>
              </View>

              {/* CAMPUS & HELPLINE CARD */}
              <View style={styles.profileSectionCard}>
                <Text style={styles.profileSectionTitle}>Campus & Official Support</Text>

                <TouchableOpacity
                  style={styles.profileInfoRow}
                  onPress={() => Linking.openURL(FlymediaContact.googleMapsUrl).catch(() => {})}
                  activeOpacity={0.7}
                >
                  <MapPin size={18} color={Colors.primaryRose} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.profileInfoRowTitle}>Campus Address (Tap for map)</Text>
                    <Text style={styles.profileInfoRowSubtitle}>
                      {FlymediaContact.address}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.profileInfoRow}
                  onPress={() => Linking.openURL(`tel:${FlymediaContact.phoneRaw}`).catch(() => {})}
                  activeOpacity={0.7}
                >
                  <Phone size={18} color={Colors.primaryRose} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.profileInfoRowTitle}>Official Mobile & Helpline (Tap to call)</Text>
                    <Text style={[styles.profileInfoRowSubtitle, { color: Colors.primaryRose, fontWeight: '800' }]}>
                      {FlymediaContact.phone}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.profileInfoRow, { borderBottomWidth: 0, paddingBottom: 0 }]}
                  onPress={() => Linking.openURL(`mailto:${FlymediaContact.email}`).catch(() => {})}
                  activeOpacity={0.7}
                >
                  <Mail size={18} color={Colors.primaryRose} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.profileInfoRowTitle}>Official Support Email</Text>
                    <Text style={styles.profileInfoRowSubtitle}>{FlymediaContact.email}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* LOGOUT BUTTON */}
              <TouchableOpacity
                style={styles.profileLogoutBtn}
                onPress={handleLogout}
                activeOpacity={0.85}
              >
                <LogOut size={16} color="#dc2626" />
                <Text style={styles.profileLogoutBtnText}>Sign Out of Tutor Account</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* BOTTOM NAVIGATION BAR */}
      <View style={[styles.bottomNavContainer, { paddingBottom: bottomPadding }]}>
        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => setActiveTab('overview')}
          activeOpacity={0.7}
        >
          <View style={[styles.bottomNavIconWrap, activeTab === 'overview' && styles.bottomNavIconWrapActive]}>
            <LayoutDashboard
              size={20}
              color={activeTab === 'overview' ? Colors.primaryRose : Colors.textMuted}
              strokeWidth={activeTab === 'overview' ? 2.4 : 1.8}
            />
          </View>
          <Text style={[styles.bottomNavLabel, activeTab === 'overview' && styles.bottomNavLabelActive]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => setActiveTab('classes')}
          activeOpacity={0.7}
        >
          <View style={[styles.bottomNavIconWrap, activeTab === 'classes' && styles.bottomNavIconWrapActive]}>
            <BookOpen
              size={20}
              color={activeTab === 'classes' ? Colors.primaryRose : Colors.textMuted}
              strokeWidth={activeTab === 'classes' ? 2.4 : 1.8}
            />
            {classesList.length > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>
                  {classesList.length > 99 ? '99+' : classesList.length}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.bottomNavLabel, activeTab === 'classes' && styles.bottomNavLabelActive]}>
            My Classes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => setActiveTab('availability')}
          activeOpacity={0.7}
        >
          <View style={[styles.bottomNavIconWrap, activeTab === 'availability' && styles.bottomNavIconWrapActive]}>
            <Calendar
              size={20}
              color={activeTab === 'availability' ? Colors.primaryRose : Colors.textMuted}
              strokeWidth={activeTab === 'availability' ? 2.4 : 1.8}
            />
          </View>
          <Text style={[styles.bottomNavLabel, activeTab === 'availability' && styles.bottomNavLabelActive]}>
            Availability
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => setActiveTab('students')}
          activeOpacity={0.7}
        >
          <View style={[styles.bottomNavIconWrap, activeTab === 'students' && styles.bottomNavIconWrapActive]}>
            <Users
              size={20}
              color={activeTab === 'students' ? Colors.primaryRose : Colors.textMuted}
              strokeWidth={activeTab === 'students' ? 2.4 : 1.8}
            />
            {recentStudents.length > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: '#3b82f6' }]}>
                <Text style={styles.tabBadgeText}>
                  {recentStudents.length > 99 ? '99+' : recentStudents.length}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.bottomNavLabel, activeTab === 'students' && styles.bottomNavLabelActive]}>
            Students
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavItem}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.7}
        >
          <View style={[styles.bottomNavIconWrap, activeTab === 'profile' && styles.bottomNavIconWrapActive]}>
            <User
              size={20}
              color={activeTab === 'profile' ? Colors.primaryRose : Colors.textMuted}
              strokeWidth={activeTab === 'profile' ? 2.4 : 1.8}
            />
          </View>
          <Text style={[styles.bottomNavLabel, activeTab === 'profile' && styles.bottomNavLabelActive]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>

      {/* MODAL: ADD AVAILABILITY SLOT */}
      <Modal visible={showAddSlotModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Availability Slot</Text>
                <Text style={styles.modalSubTitle}>Select session start & end time</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddSlotModal(false)} style={styles.modalCloseBtn}>
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
              {/* DATE BADGE */}
              <View style={styles.modalDateDisplay}>
                <Calendar size={16} color="#2563eb" />
                <Text style={styles.modalDateText}>Date: {selectedDate}</Text>
              </View>

              {/* TIME RANGE SELECTOR CARDS */}
              <View style={styles.timeRangeCardsRow}>
                {/* START TIME CARD */}
                <TouchableOpacity
                  style={[
                    styles.timeCard,
                    activeTimePicker === 'start' && styles.timeCardActive,
                  ]}
                  onPress={() => setActiveTimePicker('start')}
                  activeOpacity={0.8}
                >
                  <View style={styles.timeCardHeader}>
                    <Clock size={12} color={activeTimePicker === 'start' ? '#2563eb' : Colors.textMuted} />
                    <Text
                      style={[
                        styles.timeCardLabel,
                        activeTimePicker === 'start' && styles.timeCardLabelActive,
                      ]}
                    >
                      START TIME
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.timeCardValue,
                      activeTimePicker === 'start' && styles.timeCardValueActive,
                    ]}
                  >
                    {formatTo12Hour(newSlotStartTime)}
                  </Text>
                  <Text style={styles.timeCard24h}>({newSlotStartTime || '--:--'})</Text>
                </TouchableOpacity>

                {/* DURATION PILL / ARROW */}
                <View style={styles.timeRangeSeparatorWrap}>
                  <ArrowRight size={16} color={Colors.textMuted} />
                  <View style={styles.durationBadge}>
                    <Text style={styles.durationBadgeText}>
                      {selectedDurationMinutes > 0 ? `${selectedDurationMinutes}m` : '--'}
                    </Text>
                  </View>
                </View>

                {/* END TIME CARD */}
                <TouchableOpacity
                  style={[
                    styles.timeCard,
                    activeTimePicker === 'end' && styles.timeCardActive,
                  ]}
                  onPress={() => setActiveTimePicker('end')}
                  activeOpacity={0.8}
                >
                  <View style={styles.timeCardHeader}>
                    <Clock size={12} color={activeTimePicker === 'end' ? '#2563eb' : Colors.textMuted} />
                    <Text
                      style={[
                        styles.timeCardLabel,
                        activeTimePicker === 'end' && styles.timeCardLabelActive,
                      ]}
                    >
                      END TIME
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.timeCardValue,
                      activeTimePicker === 'end' && styles.timeCardValueActive,
                    ]}
                  >
                    {formatTo12Hour(newSlotEndTime)}
                  </Text>
                  <Text style={styles.timeCard24h}>({newSlotEndTime || '--:--'})</Text>
                </TouchableOpacity>
              </View>

              {/* QUICK DURATION BUTTONS */}
              <View style={styles.pickerSection}>
                <Text style={styles.pickerSectionTitle}>Quick Durations (sets end time):</Text>
                <View style={styles.durationsRow}>
                  {PRESET_DURATIONS.map((dur) => {
                    const isSelected = selectedDurationMinutes === dur.mins;
                    return (
                      <TouchableOpacity
                        key={dur.mins}
                        style={[styles.durationChip, isSelected && styles.durationChipActive]}
                        onPress={() => handleSelectDuration(dur.mins)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.durationChipText, isSelected && styles.durationChipTextActive]}>
                          {dur.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* HOUR & MINUTE SELECTOR FOR ACTIVE TARGET */}
              <View style={styles.pickerSection}>
                <View style={styles.pickerTargetHeader}>
                  <Text style={styles.pickerSectionTitle}>
                    Select {activeTimePicker === 'start' ? 'Start Time' : 'End Time'}:
                  </Text>
                  <View style={styles.targetToggleWrap}>
                    <TouchableOpacity
                      style={[styles.targetToggleBtn, activeTimePicker === 'start' && styles.targetToggleBtnActive]}
                      onPress={() => setActiveTimePicker('start')}
                    >
                      <Text style={[styles.targetToggleBtnText, activeTimePicker === 'start' && styles.targetToggleBtnTextActive]}>
                        Start ({newSlotStartTime})
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.targetToggleBtn, activeTimePicker === 'end' && styles.targetToggleBtnActive]}
                      onPress={() => setActiveTimePicker('end')}
                    >
                      <Text style={[styles.targetToggleBtnText, activeTimePicker === 'end' && styles.targetToggleBtnTextActive]}>
                        End ({newSlotEndTime})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* HOUR CHIPS */}
                <Text style={styles.chipGroupLabel}>Hour (24h / AM-PM):</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                  {HOUR_PRESETS.map((hour) => {
                    const currentHour = ((activeTimePicker === 'start' ? newSlotStartTime : newSlotEndTime) || '').split(':')[0];
                    const isSelected = currentHour === hour;
                    const hNum = parseInt(hour, 10);
                    const label12 = hNum === 0 ? '12 AM' : hNum < 12 ? `${hNum} AM` : hNum === 12 ? '12 PM' : `${hNum - 12} PM`;
                    
                    // For start time: disable if max preset minute (45) is still < 2 hours advance notice
                    const isHourTooSoon =
                      selectedDate === todayString &&
                      activeTimePicker === 'start' &&
                      (hNum * 60 + 45) < minAllowedStartMinutesToday;

                    // For end time: disable if entire hour is <= selected start minutes
                    const isHourInvalidEnd =
                      activeTimePicker === 'end' &&
                      (hNum * 60 + 59) <= selectedStartMinutes;

                    const isHourDisabled = isHourTooSoon || isHourInvalidEnd;

                    return (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.hourChip,
                          isSelected && styles.hourChipActive,
                          isHourDisabled && { opacity: 0.35, backgroundColor: Colors.border },
                        ]}
                        disabled={isHourDisabled}
                        onPress={() => handleSelectHour(hour, activeTimePicker)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.hourChipNum, isSelected && styles.hourChipNumActive, isHourDisabled && { color: Colors.textMuted }]}>{hour}:00</Text>
                        <Text style={[styles.hourChipLabel, isSelected && styles.hourChipLabelActive, isHourDisabled && { color: Colors.textMuted }]}>
                          {isHourTooSoon ? '<2h' : isHourInvalidEnd ? '<=Start' : label12}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* MINUTE CHIPS */}
                <Text style={[styles.chipGroupLabel, { marginTop: 10 }]}>Minutes:</Text>
                <View style={styles.minutesRow}>
                  {MINUTE_PRESETS.map((minute) => {
                    const currentMinute = ((activeTimePicker === 'start' ? newSlotStartTime : newSlotEndTime) || '').split(':')[1] || '00';
                    const isSelected = currentMinute === minute;
                    const currentHourStr = ((activeTimePicker === 'start' ? newSlotStartTime : newSlotEndTime) || '').split(':')[0] || '10';
                    const currentHourNum = parseInt(currentHourStr, 10);
                    const totalMin = currentHourNum * 60 + parseInt(minute, 10);

                    const isMinuteTooSoon =
                      selectedDate === todayString &&
                      activeTimePicker === 'start' &&
                      totalMin < minAllowedStartMinutesToday;

                    const isMinuteInvalidEnd =
                      activeTimePicker === 'end' &&
                      totalMin <= selectedStartMinutes;

                    const isMinuteDisabled = isMinuteTooSoon || isMinuteInvalidEnd;

                    return (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.minuteChip,
                          isSelected && styles.minuteChipActive,
                          isMinuteDisabled && { opacity: 0.35, backgroundColor: Colors.border },
                        ]}
                        disabled={isMinuteDisabled}
                        onPress={() => handleSelectMinute(minute, activeTimePicker)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.minuteChipText,
                            isSelected && styles.minuteChipTextActive,
                            isMinuteDisabled && { color: Colors.textMuted },
                          ]}
                        >
                          :{minute} min
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* POPULAR PRESET 1-HOUR SLOTS */}
              <View style={styles.pickerSection}>
                <Text style={styles.pickerSectionTitle}>Or Pick a Popular 1-Hour Slot:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                  {PRESET_SLOTS.map((preset) => {
                    const isSelected = newSlotStartTime === preset.start && newSlotEndTime === preset.end;
                    const isPresetTooSoon = selectedDate === todayString && parseTimeToMinutes(preset.start) < minAllowedStartMinutesToday;
                    return (
                      <TouchableOpacity
                        key={preset.start}
                        style={[
                          styles.presetSlotChip,
                          isSelected && styles.presetSlotChipActive,
                          isPresetTooSoon && { opacity: 0.35, backgroundColor: Colors.border },
                        ]}
                        disabled={isPresetTooSoon}
                        onPress={() => handleSelectPresetSlot(preset.start, preset.end)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.presetSlotChipText, isSelected && styles.presetSlotChipTextActive, isPresetTooSoon && { color: Colors.textMuted }]}>
                          {preset.label} {isPresetTooSoon ? '(<2h)' : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* MANUAL EDIT INPUTS (FALLBACK / FINE-TUNING) */}
              <View style={styles.manualInputSection}>
                <Text style={styles.manualInputSectionTitle}>Or type time directly (HH:mm):</Text>
                <View style={styles.manualInputsRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.manualInputLabel}>Start Time</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={newSlotStartTime}
                      onChangeText={setNewSlotStartTime}
                      placeholder="10:00"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.manualInputLabel}>End Time</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={newSlotEndTime}
                      onChangeText={setNewSlotEndTime}
                      placeholder="11:00"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                </View>
              </View>

              {/* PAST DATE WARNING */}
              {isPastDate && (
                <View style={styles.overlapWarningBanner}>
                  <AlertCircle size={16} color="#dc2626" />
                  <Text style={styles.overlapWarningText}>
                    Cannot add availability for past dates ({selectedDate}).
                  </Text>
                </View>
              )}

              {/* WITHIN 2 HOURS NOTICE WARNING */}
              {isWithinTwoHours && (
                <View style={styles.overlapWarningBanner}>
                  <AlertCircle size={16} color="#dc2626" />
                  <Text style={styles.overlapWarningText}>
                    Slots for today must start at least 2 hours in advance (at or after {formatTo12Hour(formatMinutesToTime(Math.min(23 * 60 + 59, minAllowedStartMinutesToday)))}).
                  </Text>
                </View>
              )}

              {/* VALIDATION & OVERLAP STATUS BANNER */}
              {currentOverlappingSlot && (
                <View style={styles.overlapWarningBanner}>
                  <AlertCircle size={16} color="#dc2626" />
                  <Text style={styles.overlapWarningText}>
                    Slot overlaps with existing ({currentOverlappingSlot.startTime} - {currentOverlappingSlot.endTime}).
                  </Text>
                </View>
              )}

              {selectedStartMinutes >= 0 && selectedEndMinutes > 0 && selectedStartMinutes >= selectedEndMinutes && (
                <View style={styles.invalidTimeBanner}>
                  <AlertCircle size={16} color="#d97706" />
                  <Text style={styles.invalidTimeText}>
                    End time must be after start time.
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* FIXED FOOTER (ALWAYS VISIBLE) */}
            <View style={styles.modalFixedFooter}>
              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  isSlotTimeInvalid && styles.modalSubmitBtnDisabled,
                ]}
                disabled={submittingSlot || isSlotTimeInvalid}
                onPress={handleAddSlot}
                activeOpacity={0.8}
              >
                {submittingSlot ? (
                  <ActivityIndicator size="small" color={Colors.textWhite} />
                ) : (
                  <Text style={styles.modalSubmitBtnText}>
                    {isSlotTimeInvalid
                      ? currentOverlappingSlot
                        ? 'Time Slot Overlaps'
                        : isPastDate
                        ? 'Past Date'
                        : isWithinTwoHours
                        ? 'Needs 2h Advance Notice'
                        : selectedStartMinutes >= selectedEndMinutes
                        ? 'End Must Be After Start'
                        : 'Choose Valid Time'
                      : `Create Slot (${formatTo12Hour(newSlotStartTime)} - ${formatTo12Hour(newSlotEndTime)})`}
                  </Text>
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

      {/* MODAL: VIEW ENROLLED STUDENTS */}
      <Modal visible={!!selectedSlotForStudents} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { maxHeight: '75%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Enrolled Students</Text>
                {selectedSlotForStudents && (
                  <Text style={{ fontSize: 12, color: Colors.textMuted, marginTop: 2, fontWeight: '600' }}>
                    {formatSlotTime(selectedSlotForStudents.startTime)} - {formatSlotTime(selectedSlotForStudents.endTime)} • {selectedSlotForStudents.bookedCount || 0}/100 Booked
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => setSelectedSlotForStudents(null)} style={styles.modalCloseBtn}>
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }}>
              {selectedSlotForStudents?.students && selectedSlotForStudents.students.length > 0 ? (
                selectedSlotForStudents.students.map((st: any, idx: number) => (
                  <View
                    key={st.id || idx}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#f8fafc',
                      padding: 12,
                      borderRadius: 12,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: '#e2e8f0',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 16,
                          backgroundColor: Colors.roseLight || '#fce7f3',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.primaryRose }}>
                          {st.name?.charAt(0)?.toUpperCase() || 'S'}
                        </Text>
                      </View>
                      <View>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.textPrimary }}>
                          {st.name || 'Student'}
                        </Text>
                        <Text style={{ fontSize: 11, color: Colors.textMuted }}>
                          {st.email || 'No email provided'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ textAlign: 'center', color: Colors.textMuted, paddingVertical: 20 }}>
                  No student details available.
                </Text>
              )}
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
  headerContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 8,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  logoImage: {
    width: 128,
    height: 29,
  },
  tutorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(230, 8, 112, 0.25)',
  },
  tutorBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryRose,
    letterSpacing: 0.4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconActionBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
  },
  logoutPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
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
    backgroundColor: 'rgba(230, 8, 112, 0.12)',
  },
  bottomNavLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 3,
  },
  bottomNavLabelActive: {
    color: Colors.primaryRose,
    fontWeight: '800',
  },
  tabBadge: {
    position: 'absolute',
    top: -2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primaryRose,
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
  profileHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  profileHeaderBtnActive: {
    backgroundColor: '#fdf2f8',
    borderColor: 'rgba(230, 8, 112, 0.4)',
  },
  profileAvatarMini: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryRose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarMiniText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  tutorProfileCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Shadows.small,
  },
  profileAvatarLarge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.primaryRose,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: Colors.primaryRose,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  profileAvatarLargeText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
  },
  profileTutorName: {
    fontSize: 19,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  profileTutorEmail: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  profileRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(230, 8, 112, 0.25)',
  },
  profileRoleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryRose,
    letterSpacing: 0.3,
  },
  profileStatsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  profileStatItem: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Shadows.small,
  },
  profileStatNum: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  profileStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  profileSectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Shadows.small,
  },
  profileSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  profileInfoRowTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  profileInfoRowSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  profileLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  profileLogoutBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#dc2626',
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
    backgroundColor: Colors.darkSurface,
    overflow: 'hidden',
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...Shadows.medium,
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(230, 8, 112, 0.22)',
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
    color: 'rgba(255, 255, 255, 0.8)',
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
    backgroundColor: Colors.primaryRose,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  heroPrimaryBtnText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
  heroSecondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroSecondaryBtnText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
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
    width: '100%',
    maxHeight: '88%',
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
  modalSubTitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalScrollBody: {
    padding: 16,
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
  timeRangeCardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    gap: 8,
  },
  timeCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: 12,
    alignItems: 'center',
  },
  timeCardActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  timeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  timeCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  timeCardLabelActive: {
    color: '#2563eb',
  },
  timeCardValue: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  timeCardValueActive: {
    color: '#1d4ed8',
  },
  timeCard24h: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  timeRangeSeparatorWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 2,
  },
  durationBadge: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  durationBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#3730a3',
  },
  pickerSection: {
    marginTop: 14,
  },
  pickerSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  durationsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  durationChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationChipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#2563eb',
  },
  durationChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  durationChipTextActive: {
    color: Colors.textWhite,
  },
  pickerTargetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  targetToggleWrap: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  targetToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  targetToggleBtnActive: {
    backgroundColor: '#2563eb',
  },
  targetToggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  targetToggleBtnTextActive: {
    color: Colors.textWhite,
  },
  chipGroupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 6,
  },
  chipsScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  hourChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    minWidth: 64,
  },
  hourChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#1d4ed8',
  },
  hourChipNum: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  hourChipNumActive: {
    color: Colors.textWhite,
  },
  hourChipLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
  hourChipLabelActive: {
    color: '#dbeafe',
  },
  minutesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  minuteChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  minuteChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#1d4ed8',
  },
  minuteChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  minuteChipTextActive: {
    color: Colors.textWhite,
  },
  presetSlotChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetSlotChipActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  presetSlotChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  presetSlotChipTextActive: {
    color: '#2563eb',
    fontWeight: '800',
  },
  manualInputSection: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  manualInputSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 6,
  },
  manualInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  manualInputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    marginBottom: 4,
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
  overlapWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
  },
  overlapWarningText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#dc2626',
  },
  invalidTimeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
  },
  invalidTimeText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#b45309',
  },
  modalFixedFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modalSubmitBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSubmitBtnDisabled: {
    backgroundColor: Colors.border,
    opacity: 0.7,
  },
  modalSubmitBtnText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
});
