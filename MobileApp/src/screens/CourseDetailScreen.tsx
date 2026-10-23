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
import { Header } from '../components/common/Header';
import { CallbackModal } from '../components/common/CallbackModal';
import { PaymentModal } from '../components/common/PaymentModal';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { Course } from '../types';
import {
  Star,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  GraduationCap,
  ArrowRight,
  Briefcase,
  ShieldCheck,
  Zap,
  Users,
  BookOpen,
  Layers,
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
  const [imgError, setImgError] = useState(false);

  const insets = useSafeAreaInsets();
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
        <ActivityIndicator size="large" color={Colors.primaryRose} />
        <Text style={styles.loadingText}>Loading verified syllabus & curriculum...</Text>
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.screen}>
        <Header
          showBackButton
          onBackPress={() => navigation.goBack()}
          title="Course Not Found"
        />
        <View style={[styles.centerContent, { padding: 24, flex: 1 }]}>
          <Text style={styles.notFoundTitle}>Course Not Available</Text>
          <Text style={styles.notFoundSub}>
            The requested course is not available or has been moved to another category.
          </Text>
          <TouchableOpacity
            style={styles.backToCoursesBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backToCoursesBtnText}>Back to Courses</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const highlights = course.highlights || [];
  const modules = course.modules || [];
  const skills = course.skills || [];
  const techStack = course.techStack || [];
  const rawPrice = course.price ? Number(course.price) : 0;
  const originalPrice = rawPrice > 0 ? Math.round(rawPrice * 1.35) : 0;

  return (
    <View style={styles.screen}>
      {/* PROFESSIONAL BRAND HEADER */}
      <Header
        showBackButton
        onBackPress={() => navigation.goBack()}
        title="Course Details"
        subtitle={course.category || 'Professional Program'}
        rightAction={
          !isTutor ? (
            <TouchableOpacity
              style={styles.headerDemoBadge}
              onPress={() => setCallbackModalVisible(true)}
              activeOpacity={0.8}
            >
              <Sparkles size={11} color={Colors.primaryRose} />
              <Text style={styles.headerDemoText}>₹99 Demo</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO BANNER CARD */}
        <View style={styles.heroCard}>
          <View style={styles.heroImageContainer}>
            <Image
              source={{
                uri: imgError
                  ? 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
                  : formatImageUrl(course.thumbnail),
              }}
              style={styles.heroImage}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
            {/* Subtle Dark Overlay */}
            <View style={styles.heroOverlay} />

            {/* Floating Category Pill */}
            <View style={styles.floatingCategoryPill}>
              <Text style={styles.floatingCategoryText}>{course.category || 'CAREER TRACK'}</Text>
            </View>

            {/* Floating Rating Pill */}
            <View style={styles.floatingRatingPill}>
              <Star size={12} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.floatingRatingText}>{course.rating || '4.9'}</Text>
            </View>

            {/* Live Training Mode Tag */}
            <View style={styles.floatingModeTag}>
              <View style={styles.livePulseDot} />
              <Text style={styles.floatingModeText}>
                {course.mode === 'BOTH' ? 'HYBRID + LIVE' : course.mode === 'OFFLINE' ? 'CAMPUS BATCH' : '100% LIVE INTERACTIVE'}
              </Text>
            </View>
          </View>

          <View style={styles.heroCardBody}>
            {course.badge && (
              <View style={styles.badgePill}>
                <Zap size={11} color={Colors.primaryOrange} />
                <Text style={styles.badgeText}>{course.badge}</Text>
              </View>
            )}

            <Text style={styles.title}>{course.title}</Text>
            <Text style={styles.description}>{course.description}</Text>

            {/* Executive 4-Col Info Grid */}
            <View style={styles.infoGrid}>
              <View style={styles.infoCol}>
                <View style={styles.infoIconWrap}>
                  <Star size={14} color="#f59e0b" fill="#f59e0b" />
                </View>
                <Text style={styles.infoVal}>{course.rating || '4.9'}</Text>
                <Text style={styles.infoSub}>Rating</Text>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoCol}>
                <View style={styles.infoIconWrap}>
                  <Clock size={14} color={Colors.primaryRose} />
                </View>
                <Text style={styles.infoVal}>{course.duration || '3 Months'}</Text>
                <Text style={styles.infoSub}>Duration</Text>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoCol}>
                <View style={styles.infoIconWrap}>
                  <Users size={14} color="#2563eb" />
                </View>
                <Text style={styles.infoVal}>{course.studentsCount || 850}+</Text>
                <Text style={styles.infoSub}>Students</Text>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoCol}>
                <View style={styles.infoIconWrap}>
                  <Award size={14} color="#059669" />
                </View>
                <Text style={styles.infoVal}>Certified</Text>
                <Text style={styles.infoSub}>ISO Verified</Text>
              </View>
            </View>

            {/* ENROLLMENT STATUS / PRICE DISPLAY */}
            {isTutor ? (
              <View style={styles.priceContainerTutor}>
                <View style={styles.tutorCheckCircle}>
                  <Award size={20} color="#b45309" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.feeLabel}>Account Type</Text>
                  <Text style={styles.tutorActiveStatus}>Instructor View • Student Curriculum Preview</Text>
                </View>
              </View>
            ) : isEnrolled ? (
              <View style={styles.priceContainerEnrolled}>
                <View style={styles.enrolledCheckCircle}>
                  <CheckCircle2 size={20} color="#059669" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.feeLabel}>Enrollment Status</Text>
                  <Text style={styles.enrolledActiveStatus}>Active • Lifetime Access Granted</Text>
                </View>
                <TouchableOpacity
                  style={styles.alreadyEnrolledGoBtn}
                  onPress={() => navigation.navigate('Main', { screen: 'MyLearningTab' })}
                  activeOpacity={0.85}
                >
                  <Text style={styles.alreadyEnrolledGoBtnText}>Go to Class</Text>
                  <ArrowRight size={13} color={Colors.textWhite} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.priceContainer}>
                <View>
                  <Text style={styles.feeLabel}>Total Program Investment</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceValue}>
                      {rawPrice > 0 ? `₹${rawPrice.toLocaleString('en-IN')}` : 'Free'}
                    </Text>
                    {originalPrice > 0 && (
                      <Text style={styles.originalPrice}>₹{originalPrice.toLocaleString('en-IN')}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.emiTag}>
                  <Text style={styles.emiTagText}>No-Cost EMI Available</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* HIGH-CONVERTING ₹99 DEMO CLASS VIP OFFER CARD */}
        {!isTutor && !isEnrolled && (
          <View style={styles.demoPromoCard}>
            <View style={styles.demoPromoHeader}>
              <View style={styles.demoBadgePill}>
                <Sparkles size={11} color="#ffffff" />
                <Text style={styles.demoBadgePillText}>LIMITED TRIAL ACCESS</Text>
              </View>
              <View style={styles.demoPricePill}>
                <Text style={styles.demoPriceText}>Just ₹99</Text>
              </View>
            </View>

            <Text style={styles.demoPromoTitle}>
              Book 1-on-1 Live Demo Class
            </Text>
            <Text style={styles.demoPromoSub}>
              Experience our live mentorship, practical teaching pedagogy, and ask all career questions before enrolling.
            </Text>

            <View style={styles.demoFeaturesList}>
              <View style={styles.demoFeatureItem}>
                <CheckCircle2 size={15} color="#34d399" />
                <Text style={styles.demoFeatureText}>
                  1-on-1 live session with senior tech practitioner
                </Text>
              </View>
              <View style={styles.demoFeatureItem}>
                <CheckCircle2 size={15} color="#34d399" />
                <Text style={styles.demoFeatureText}>
                  Real client project walkthrough & code review
                </Text>
              </View>
              <View style={styles.demoFeatureItem}>
                <CheckCircle2 size={15} color="#34d399" />
                <Text style={styles.demoFeatureText}>
                  100% fee deducted if you choose to enroll
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.demoPromoCta}
              onPress={() => setCallbackModalVisible(true)}
              activeOpacity={0.88}
            >
              <Text style={styles.demoPromoCtaText}>Book Demo Class @ ₹99</Text>
              <ArrowRight size={16} color={Colors.primaryRose} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        )}

        {/* WHAT YOU WILL ACHIEVE (PROGRAM HIGHLIGHTS) */}
        {highlights.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderIcon}>
                <Zap size={16} color={Colors.primaryOrange} />
              </View>
              <Text style={styles.sectionHeading}>Key Program Highlights</Text>
            </View>

            <View style={styles.highlightsGrid}>
              {highlights.map((h, i) => (
                <View key={i} style={styles.highlightCard}>
                  <View style={styles.highlightIconCircle}>
                    <CheckCircle2 size={16} color="#059669" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.highlightTitle}>{h.title}</Text>
                    <Text style={styles.highlightDesc}>{h.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* CURRICULUM SYLLABUS STAGES (ROADMAP TIMELINE) */}
        {modules.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.curriculumHeader}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionHeaderIcon, { backgroundColor: '#fdf2f8' }]}>
                  <BookOpen size={16} color={Colors.primaryRose} />
                </View>
                <Text style={styles.sectionHeading}>Curriculum & Syllabus</Text>
              </View>
              <View style={styles.stagesCountBadge}>
                <Text style={styles.stagesCountText}>{modules.length} Modules</Text>
              </View>
            </View>

            <View style={styles.modulesList}>
              {modules.map((mod, idx) => {
                const isExpanded = expandedModule === idx;
                return (
                  <View key={idx} style={[styles.moduleCard, isExpanded && styles.moduleCardActive]}>
                    <TouchableOpacity
                      style={styles.moduleHeader}
                      onPress={() => setExpandedModule(isExpanded ? null : idx)}
                      activeOpacity={0.85}
                    >
                      <View style={styles.moduleNumberBadge}>
                        <Text style={styles.moduleNumberText}>
                          {String(idx + 1).padStart(2, '0')}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginHorizontal: 12 }}>
                        <Text style={styles.moduleStageLabel}>STAGE {idx + 1}</Text>
                        <Text style={styles.moduleTitle}>{mod.title}</Text>
                      </View>
                      <View style={styles.chevronWrap}>
                        {isExpanded ? (
                          <ChevronUp size={18} color={Colors.primaryRose} />
                        ) : (
                          <ChevronDown size={18} color={Colors.textMuted} />
                        )}
                      </View>
                    </TouchableOpacity>

                    {isExpanded && mod.topics && (
                      <View style={styles.topicsContainer}>
                        <View style={styles.topicsDivider} />
                        {mod.topics.map((t, tIdx) => (
                          <View key={tIdx} style={styles.topicRow}>
                            <View style={styles.topicCheckWrap}>
                              <CheckCircle2 size={13} color={Colors.primaryRose} />
                            </View>
                            <Text style={styles.topicText}>{t}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* SKILLS ACQUIRED */}
        {skills.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionHeaderIcon, { backgroundColor: '#eff6ff' }]}>
                <Layers size={16} color="#2563eb" />
              </View>
              <Text style={styles.sectionHeading}>Skills You Will Master</Text>
            </View>
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
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionHeaderIcon, { backgroundColor: '#fff7ed' }]}>
                <Zap size={16} color={Colors.primaryOrange} />
              </View>
              <Text style={styles.sectionHeading}>Tools & Technologies</Text>
            </View>
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

        {/* ACCREDITED CERTIFICATION CARD */}
        <View style={styles.certCard}>
          <View style={styles.certIconWrap}>
            <Award size={26} color={Colors.primaryRose} />
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <View style={styles.certBadge}>
              <ShieldCheck size={11} color="#059669" />
              <Text style={styles.certBadgeText}>ISO 9001:2015 CERTIFIED</Text>
            </View>
            <Text style={styles.certTitle}>Industry-Accredited Certificate</Text>
            <Text style={styles.certDesc}>
              Upon capstone project submission, earn a verifiable digital certificate recognized across top IT & digital enterprises.
            </Text>
          </View>
        </View>

        {/* WHY FLYMEDIA TECHNOLOGIES TRUST BADGES */}
        <View style={styles.trustCard}>
          <Text style={styles.trustTitle}>The Flymedia Advantage</Text>
          <View style={styles.trustGrid}>
            <View style={styles.trustItem}>
              <Briefcase size={16} color={Colors.primaryRose} />
              <Text style={styles.trustItemText}>100% Placement Assistance</Text>
            </View>
            <View style={styles.trustItem}>
              <Users size={16} color="#2563eb" />
              <Text style={styles.trustItemText}>1-on-1 Dedicated Mentorship</Text>
            </View>
            <View style={styles.trustItem}>
              <GraduationCap size={16} color="#059669" />
              <Text style={styles.trustItemText}>Live Commercial Projects</Text>
            </View>
            <View style={styles.trustItem}>
              <ShieldCheck size={16} color="#d97706" />
              <Text style={styles.trustItemText}>Interview Prep & Resume Review</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* STICKY BOTTOM ACTION BAR */}
      <View style={[styles.bottomBar, { paddingBottom: bottomPadding + 6 }]}>
        {isTutor ? (
          <View style={styles.tutorBottomBar}>
            <View style={styles.tutorBottomBarLeft}>
              <View style={styles.tutorBottomBarBadge}>
                <Award size={18} color="#b45309" />
              </View>
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.tutorBottomBarTitle}>Instructor Account</Text>
                <Text style={styles.tutorBottomBarSub}>Demo bookings and course enrollments are for students only</Text>
              </View>
            </View>
          </View>
        ) : isEnrolled ? (
          <View style={styles.bottomBarEnrolled}>
            <View style={styles.bottomBarEnrolledInfo}>
              <View style={styles.bottomBarEnrolledIconWrap}>
                <CheckCircle2 size={18} color="#059669" />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.bottomBarEnrolledTitle}>Already Enrolled</Text>
                <Text style={styles.bottomBarEnrolledSub}>Access your lectures & sessions</Text>
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
          <View style={styles.bottomCtaRow}>
            {/* Price Preview */}
            <View style={styles.bottomPriceCol}>
              <Text style={styles.bottomFeeLabel}>Full Course</Text>
              <Text style={styles.bottomPriceValue}>
                {rawPrice > 0 ? `₹${rawPrice.toLocaleString('en-IN')}` : 'Free'}
              </Text>
            </View>

            {/* ₹99 Demo Button */}
            <TouchableOpacity
              style={styles.bottomDemoBtn}
              onPress={() => setCallbackModalVisible(true)}
              activeOpacity={0.82}
            >
              <Sparkles size={14} color={Colors.primaryRose} />
              <Text style={styles.bottomDemoBtnText}>₹99 Demo</Text>
            </TouchableOpacity>

            {/* Enroll Now Button */}
            <TouchableOpacity
              style={styles.bottomEnrollBtn}
              onPress={handleEnroll}
              activeOpacity={0.85}
            >
              <Text style={styles.bottomEnrollBtnText}>
                {rawPrice > 0 ? 'Enroll Now' : 'Enroll Free'}
              </Text>
              <ArrowRight size={15} color={Colors.textWhite} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
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
    backgroundColor: '#f8fafc',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '600',
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
    lineHeight: 20,
  },
  backToCoursesBtn: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    backgroundColor: Colors.primaryRose,
    borderRadius: 14,
    ...Shadows.brand,
  },
  backToCoursesBtnText: {
    color: Colors.textWhite,
    fontWeight: '800',
    fontSize: 14,
  },
  headerDemoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#fdf2f8',
    borderWidth: 1,
    borderColor: 'rgba(230, 8, 112, 0.25)',
  },
  headerDemoText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  /* HERO CARD */
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  heroImageContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#0f172a',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
  },
  floatingCategoryPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  floatingCategoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  floatingRatingPill: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  floatingRatingText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0f172a',
  },
  floatingModeTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  floatingModeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.4,
  },
  heroCardBody: {
    padding: 18,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.orangeLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryOrange,
  },
  title: {
    fontSize: 21,
    fontWeight: '900',
    color: Colors.textPrimary,
    lineHeight: 28,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 21,
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  infoCol: {
    flex: 1,
    alignItems: 'center',
  },
  infoIconWrap: {
    marginBottom: 3,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  infoSub: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },
  infoDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  feeLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primaryRose,
    letterSpacing: -0.5,
  },
  originalPrice: {
    fontSize: 14,
    color: Colors.textLight,
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  emiTag: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  emiTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065f46',
  },
  priceContainerEnrolled: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#a7f3d0',
  },
  enrolledCheckCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  enrolledActiveStatus: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065f46',
  },
  alreadyEnrolledGoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  alreadyEnrolledGoBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  priceContainerTutor: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#fde68a',
  },
  tutorCheckCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorActiveStatus: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400e',
  },

  /* ₹99 DEMO PROMO CARD */
  demoPromoCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(230, 8, 112, 0.4)',
    shadowColor: Colors.primaryRose,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  demoPromoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  demoBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(230, 8, 112, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primaryRose,
  },
  demoBadgePillText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  demoPricePill: {
    backgroundColor: Colors.primaryRose,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  demoPriceText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  demoPromoTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 6,
  },
  demoPromoSub: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 14,
  },
  demoFeaturesList: {
    gap: 8,
    marginBottom: 16,
  },
  demoFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  demoFeatureText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '600',
  },
  demoPromoCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 12,
  },
  demoPromoCtaText: {
    color: Colors.primaryRose,
    fontSize: 13,
    fontWeight: '900',
  },

  /* SECTION STYLES */
  sectionWrap: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  highlightsGrid: {
    gap: 10,
  },
  highlightCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  highlightIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  highlightTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  highlightDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  /* CURRICULUM */
  curriculumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stagesCountBadge: {
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(230, 8, 112, 0.2)',
  },
  stagesCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  modulesList: {
    gap: 10,
  },
  moduleCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  moduleCardActive: {
    borderColor: 'rgba(230, 8, 112, 0.35)',
    shadowColor: Colors.primaryRose,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  moduleNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  moduleStageLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryRose,
    letterSpacing: 0.4,
  },
  moduleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  topicsDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 10,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  topicCheckWrap: {
    marginTop: 1,
  },
  topicText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    flex: 1,
    lineHeight: 17,
  },

  /* CHIPS */
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  skillChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  techChip: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  techChipText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryOrange,
  },

  /* CERTIFICATION & TRUST */
  certCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    alignItems: 'center',
  },
  certIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#fdf2f8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(230, 8, 112, 0.2)',
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  certBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.3,
  },
  certTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  certDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  trustCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  trustTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  trustGrid: {
    gap: 10,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trustItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  /* STICKY BOTTOM BAR */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  bottomCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bottomPriceCol: {
    marginRight: 4,
  },
  bottomFeeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  bottomPriceValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  bottomDemoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#fdf2f8',
    borderWidth: 1.5,
    borderColor: 'rgba(230, 8, 112, 0.3)',
  },
  bottomDemoBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  bottomEnrollBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: Colors.primaryRose,
    shadowColor: Colors.primaryRose,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  bottomEnrollBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  bottomBarEnrolled: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomBarEnrolledInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  openMyLearningActionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  tutorBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#fde68a',
  },
  tutorBottomBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tutorBottomBarBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorBottomBarTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400e',
  },
  tutorBottomBarSub: {
    fontSize: 10,
    color: '#b45309',
  },
});
