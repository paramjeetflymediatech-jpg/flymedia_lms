import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../theme/colors';
import { CallbackModal } from '../components/common/CallbackModal';
import { PaymentModal } from '../components/common/PaymentModal';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { Course } from '../types';
import {
  ArrowLeft,
  Star,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  GraduationCap,
  ArrowRight,
} from 'lucide-react-native';
import { formatImageUrl } from '../utils/imageUrl';

interface CourseDetailScreenProps {
  route: any;
  navigation: any;
}

export const CourseDetailScreen: React.FC<CourseDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { courseId, course: passedCourse } = route.params || {};
  const [course, setCourse] = useState<Course | null>(passedCourse || null);
  const [loading, setLoading] = useState<boolean>(!passedCourse);

  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 16);
  const bottomPadding = Math.max(insets.bottom, 12);

  const { user, enrollCourse, enrollments } = useAuth();
  const [callbackModalVisible, setCallbackModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [expandedModule, setExpandedModule] = useState<number | null>(0);

  useEffect(() => {
    if (!passedCourse && courseId) {
      setLoading(true);
      ApiService.getCourse(courseId)
        .then(data => {
          if (data) {
            setCourse(data);
          } else {
            return ApiService.getHomeData().then(homeData => {
              const found = homeData.courses.find(c => c.id === courseId || c.slug === courseId);
              if (found) setCourse(found);
            });
          }
        })
        .finally(() => setLoading(false));
    }
  }, [courseId, passedCourse]);

  const currentEnrollment = course
    ? enrollments.find(
        e =>
          e.courseId === course.id ||
          e.courseId === course.slug ||
          (e.courseTitle && course.title && e.courseTitle.trim().toLowerCase() === course.title.trim().toLowerCase()) ||
          ((course as any).databaseId && e.courseId === (course as any).databaseId)
      )
    : null;
  const isEnrolled = Boolean(currentEnrollment);
  const isTutor = user?.role === 'TUTOR';

  const handleEnroll = async () => {
    if (!course) return;

    if (!user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in or create an account to enroll in this course.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In / Register',
            onPress: () => navigation.navigate('Main', { screen: 'ProfileTab' }),
          },
        ]
      );
      return;
    }

    if (isTutor) {
      Alert.alert(
        'Instructor Account',
        'You are logged in as a Tutor. Course purchasing and demo bookings are available for student accounts only.'
      );
      return;
    }

    if (isEnrolled) {
      navigation.navigate('Main', { screen: 'MyLearningTab' });
      return;
    }

    // If paid course -> Open Payment Modal with UPI, Cards, Net Banking & Coupons
    if (course.price && Number(course.price) > 0) {
      setPaymentModalVisible(true);
      return;
    }

    // Free course enrollment flow
    Alert.alert(
      'Enroll in Free Course',
      `Would you like to enroll in "${course.title}" for free?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Start',
          onPress: async () => {
            const res = await enrollCourse(course);
            if (res.success) {
              Alert.alert(
                'Enrollment Successful! 🎉',
                'You have successfully enrolled! You can now access classes, syllabus, and mentor schedules in My Learning.',
                [
                  {
                    text: 'Go to My Learning',
                    onPress: () => navigation.navigate('Main', { screen: 'MyLearningTab' }),
                  },
                ]
              );
            } else {
              Alert.alert('Enrollment Error', res.error || 'Failed to enroll');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primaryOrange} />
        <Text style={styles.loadingText}>Loading course syllabus & details...</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={[styles.screen, styles.centerContent, { padding: 24 }]}>
        <Text style={styles.notFoundTitle}>Course Not Found</Text>
        <Text style={styles.notFoundSub}>
          The requested course is not available or has been removed.
        </Text>
        <TouchableOpacity
          style={styles.backToCoursesBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backToCoursesBtnText}>Back to Courses</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const highlights = course.highlights || [];
  const modules = course.modules || [];
  const skills = course.skills || [];
  const techStack = course.techStack || [];

  return (
    <View style={styles.screen}>
      {/* TOP NAV BAR */}
      <View style={[styles.topBar, { paddingTop: topPadding + 6 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {course.title}
        </Text>
        {!isTutor && (
          <TouchableOpacity
            style={styles.helpBtn}
            onPress={() => setCallbackModalVisible(true)}
          >
            <Text style={styles.helpBtnText}>Counseling</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO BANNER CARD */}
        <View style={styles.heroCard}>
          {/* Course Package Image */}
          <View style={styles.heroImageContainer}>
            <Image
              source={{ uri: formatImageUrl(course.thumbnail) }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.heroCardBody}>
            <View style={styles.badgeRow}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{course.category}</Text>
              </View>
              {course.badge && (
                <View style={styles.badgePill}>
                  <Sparkles size={12} color={Colors.primaryOrange} />
                  <Text style={styles.badgeText}>{course.badge}</Text>
                </View>
              )}
            </View>
            <Text style={styles.title}>{course.title}</Text>
            <Text style={styles.description}>{course.description}</Text>

            {/* Quick Info Grid */}
            <View style={styles.infoGrid}>
              <View style={styles.infoCol}>
                <View style={styles.infoIconRow}>
                  <Star size={14} color="#f59e0b" fill="#f59e0b" />
                  <Text style={styles.infoVal}>{course.rating}</Text>
                </View>
                <Text style={styles.infoSub}>Rating</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoCol}>
                <View style={styles.infoIconRow}>
                  <Clock size={14} color={Colors.primaryOrange} />
                  <Text style={styles.infoVal}>{course.duration}</Text>
                </View>
                <Text style={styles.infoSub}>Duration</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoCol}>
                <View style={styles.infoIconRow}>
                  <Award size={14} color={Colors.success} />
                  <Text style={styles.infoVal}>Certified</Text>
                </View>
                <Text style={styles.infoSub}>Credential</Text>
              </View>
            </View>

            {/* Fee or Enrolled status */}
            {isTutor ? (
              <View style={styles.priceContainerTutor}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.tutorCheckCircle}>
                    <Award size={20} color="#b45309" />
                  </View>
                  <View>
                    <Text style={styles.feeLabel}>Account Type</Text>
                    <Text style={styles.tutorActiveStatus}>Instructor View • Student Program</Text>
                  </View>
                </View>
              </View>
            ) : isEnrolled ? (
              <View style={styles.priceContainerEnrolled}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.enrolledCheckCircle}>
                    <CheckCircle size={20} color="#059669" />
                  </View>
                  <View>
                    <Text style={styles.feeLabel}>Enrollment Status</Text>
                    <Text style={styles.enrolledActiveStatus}>Active • Already Enrolled</Text>
                  </View>
                </View>
                  
              </View>
            ) : (
              <View style={styles.priceContainer}>
                <View>
                  <Text style={styles.feeLabel}>Total Program Fee</Text>
                  <Text style={styles.priceValue}>
                    ₹{(course.price || 0).toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.emiTag}>
                  <Text style={styles.emiTagText}>EMI & Scholarships Avail.</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* PROGRAM HIGHLIGHTS */}
        {highlights.length > 0 && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionHeading}>Program Highlights</Text>
            <View style={styles.highlightsGrid}>
              {highlights.map((h, i) => (
                <View key={i} style={styles.highlightCard}>
                  <CheckCircle size={18} color={Colors.primaryOrange} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.highlightTitle}>{h.title}</Text>
                    <Text style={styles.highlightDesc}>{h.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* CURRICULUM SYLLABUS STAGES */}
        {modules.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.curriculumHeader}>
              <Text style={styles.sectionHeading}>Curriculum & Syllabus</Text>
              <Text style={styles.modulesCount}>{modules.length} Stages</Text>
            </View>

            <View style={styles.modulesList}>
              {modules.map((mod, idx) => {
                const isExpanded = expandedModule === idx;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.moduleItem}
                    onPress={() => setExpandedModule(isExpanded ? null : idx)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.moduleHeader}>
                      <View style={styles.moduleNumberBadge}>
                        <Text style={styles.moduleNumberText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.moduleTitle}>{mod.title}</Text>
                      {isExpanded ? (
                        <ChevronUp size={18} color={Colors.primaryOrange} />
                      ) : (
                        <ChevronDown size={18} color={Colors.textMuted} />
                      )}
                    </View>

                    {isExpanded && mod.topics && (
                      <View style={styles.topicsContainer}>
                        {mod.topics.map((t, tIdx) => (
                          <View key={tIdx} style={styles.topicRow}>
                            <View style={styles.topicBullet} />
                            <Text style={styles.topicText}>{t}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* SKILLS ACQUIRED */}
        {skills.length > 0 && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionHeading}>Skills You Will Master</Text>
            <View style={styles.chipsContainer}>
              {skills.map((skill: any, sIdx) => {
                const label = typeof skill === 'object' && skill !== null ? skill.name || '' : String(skill || '');
                if (!label) return null;
                return (
                  <View key={sIdx} style={styles.skillChip}>
                    <Text style={styles.skillChipText}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* TECH STACK TOOLS */}
        {techStack.length > 0 && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionHeading}>Tools & Technologies</Text>
            <View style={styles.chipsContainer}>
              {techStack.map((tech: any, tIdx) => {
                const label = typeof tech === 'object' && tech !== null ? tech.name || '' : String(tech || '');
                if (!label) return null;
                return (
                  <View key={tIdx} style={styles.techChip}>
                    <Text style={styles.techChipText}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPadding + 8 }]}>
        {isTutor ? (
          <View style={styles.tutorBottomBar}>
            <View style={styles.tutorBottomBarLeft}>
              <View style={styles.tutorBottomBarBadge}>
                <Award size={18} color="#b45309" />
              </View>
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.tutorBottomBarTitle}>Instructor Account</Text>
                <Text style={styles.tutorBottomBarSub}>Demo bookings and course purchases are for students only</Text>
              </View>
            </View>
          </View>
        ) : isEnrolled ? (
          <View style={styles.bottomBarEnrolled}>
            <View style={styles.bottomBarEnrolledInfo}>
              <View style={styles.bottomBarEnrolledIconWrap}>
                <CheckCircle size={18} color="#059669" />
              </View>
              <View style={{ marginLeft: 8 }}>
                <Text style={styles.bottomBarEnrolledTitle}>Already Enrolled</Text>
                <Text style={styles.bottomBarEnrolledSub}>Access in My Learning</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.openMyLearningActionBtn}
              onPress={() => navigation.navigate('Main', { screen: 'MyLearningTab' })}
              activeOpacity={0.85}
            >
              <GraduationCap size={16} color={Colors.textWhite} />
              <Text style={styles.openMyLearningActionBtnText}>Go to Class</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={() => setCallbackModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.demoBtnText}>Book Free Demo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.enrollBtn}
              onPress={handleEnroll}
              activeOpacity={0.85}
            >
              <Text style={styles.enrollBtnText}>
                {course.price && Number(course.price) > 0
                  ? `Buy Now • ₹${Number(course.price).toLocaleString('en-IN')}`
                  : 'Enroll Free'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <CallbackModal
        visible={callbackModalVisible}
        onClose={() => setCallbackModalVisible(false)}
        defaultCourse={course.title}
      />

      <PaymentModal
        visible={paymentModalVisible}
        course={course}
        onClose={() => setPaymentModalVisible(false)}
        onSuccess={() => {
          setPaymentModalVisible(false);
          navigation.navigate('Main', { screen: 'MyLearningTab' });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textMuted,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  notFoundSub: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  backToCoursesBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.primaryOrange,
    borderRadius: 12,
  },
  backToCoursesBtnText: {
    color: Colors.textWhite,
    fontWeight: '700',
    fontSize: 14,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    marginHorizontal: 12,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  helpBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#fdf2f8',
    borderWidth: 1,
    borderColor: 'rgba(230, 8, 112, 0.25)',
  },
  helpBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadows.small,
    marginBottom: 20,
  },
  heroImageContainer: {
    width: '100%',
    height: 220,
    backgroundColor: '#0f172a',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroCardBody: {
    padding: 20,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  categoryPill: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.orangeLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryOrange,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 28,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 18,
  },
  infoGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 18,
  },
  infoCol: {
    flex: 1,
    alignItems: 'center',
  },
  infoIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  infoVal: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  infoSub: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  infoDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  feeLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primaryOrange,
  },
  emiTag: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  emiTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  sectionWrap: {
    marginBottom: 22,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  highlightsGrid: {
    gap: 10,
  },
  highlightCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  highlightDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  curriculumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modulesCount: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryOrange,
  },
  modulesList: {
    gap: 10,
  },
  moduleItem: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  moduleNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryOrange,
  },
  moduleTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  topicsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surfaceSubtle,
    gap: 8,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topicBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primaryOrange,
  },
  topicText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  techChip: {
    backgroundColor: Colors.orangeLight,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  techChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryOrange,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
    ...Shadows.medium,
  },
  demoBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: 'rgba(248, 117, 14, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryOrange,
  },
  enrollBtn: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primaryRose,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.brand,
  },
  enrolledBtn: {
    backgroundColor: Colors.success,
  },
  enrollBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  /* ALREADY ENROLLED STYLES */
  alreadyEnrolledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5', // emerald-50
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: '#a7f3d0', // emerald-200
  },
  alreadyEnrolledIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alreadyEnrolledTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065f46',
  },
  alreadyEnrolledSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 1,
  },
  alreadyEnrolledGoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 9,
  },
  alreadyEnrolledGoBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  priceContainerEnrolled: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#a7f3d0',
  },
  enrolledCheckCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enrolledActiveStatus: {
    fontSize: 15,
    fontWeight: '800',
    color: '#065f46',
    marginTop: 1,
  },
  lifetimeAccessBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6ee7b7',
  },
  lifetimeAccessBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#047857',
  },
  bottomBarEnrolled: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  bottomBarEnrolledInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomBarEnrolledIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  bottomBarEnrolledTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065f46',
  },
  bottomBarEnrolledSub: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  openMyLearningActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#059669',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    ...Shadows.small,
  },
  openMyLearningActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  /* TUTOR VIEW STYLES */
  priceContainerTutor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fffbeb', // amber-50
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#fde68a', // amber-200
  },
  tutorCheckCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fef3c7', // amber-100
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorActiveStatus: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400e', // amber-800
    marginTop: 1,
  },
  tutorBottomBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#fde68a',
  },
  tutorBottomBarLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorBottomBarBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fcd34d',
  },
  tutorBottomBarTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400e',
  },
  tutorBottomBarSub: {
    fontSize: 11,
    color: '#b45309',
  },
});
