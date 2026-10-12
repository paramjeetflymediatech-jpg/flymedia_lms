import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { CallbackModal } from '../components/common/CallbackModal';
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
} from 'lucide-react-native';

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

  const { user, enrollCourse, enrollments } = useAuth();
  const [callbackModalVisible, setCallbackModalVisible] = useState(false);
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

  const isEnrolled = course ? enrollments.some(e => e.courseId === course.id) : false;

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
            onPress: () => navigation.navigate('ProfileTab'),
          },
        ]
      );
      return;
    }

    if (isEnrolled) {
      navigation.navigate('MyLearningTab');
      return;
    }

    Alert.alert(
      'Enroll in Program',
      `Would you like to enroll in "${course.title}" for ₹${(course.price || 0).toLocaleString('en-IN')}?`,
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
                    onPress: () => navigation.navigate('MyLearningTab'),
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
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {course.title}
        </Text>
        <TouchableOpacity
          style={styles.helpBtn}
          onPress={() => setCallbackModalVisible(true)}
        >
          <Text style={styles.helpBtnText}>Counseling</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO BANNER CARD */}
        <View style={styles.heroCard}>
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

          {/* Fee summary */}
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
              {skills.map((skill, sIdx) => (
                <View key={sIdx} style={styles.skillChip}>
                  <Text style={styles.skillChipText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* TECH STACK TOOLS */}
        {techStack.length > 0 && (
          <View style={styles.sectionWrap}>
            <Text style={styles.sectionHeading}>Tools & Technologies</Text>
            <View style={styles.chipsContainer}>
              {techStack.map((tech, tIdx) => (
                <View key={tIdx} style={styles.techChip}>
                  <Text style={styles.techChipText}>{tech}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.demoBtn}
          onPress={() => setCallbackModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.demoBtnText}>Book Free Demo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.enrollBtn, isEnrolled && styles.enrolledBtn]}
          onPress={handleEnroll}
          activeOpacity={0.85}
        >
          <Text style={styles.enrollBtnText}>
            {isEnrolled ? 'Open My Learning' : 'Enroll Now'}
          </Text>
        </TouchableOpacity>
      </View>

      <CallbackModal
        visible={callbackModalVisible}
        onClose={() => setCallbackModalVisible(false)}
        defaultCourse={course.title}
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.orangeLight,
  },
  helpBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primaryOrange,
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
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
    marginBottom: 20,
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
    backgroundColor: Colors.orangeLight,
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
    backgroundColor: Colors.primaryOrange,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  enrolledBtn: {
    backgroundColor: Colors.success,
  },
  enrollBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textWhite,
  },
});
