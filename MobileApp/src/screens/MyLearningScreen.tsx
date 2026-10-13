import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { Header } from '../components/common/Header';
import { useAuth } from '../context/AuthContext';
import {
  Video,
  Award,
  BookOpen,
  Calendar,
  LogIn,
  GraduationCap,
  ChevronRight,
} from 'lucide-react-native';
import { formatImageUrl } from '../utils/imageUrl';

interface MyLearningScreenProps {
  navigation: any;
}

export const MyLearningScreen: React.FC<MyLearningScreenProps> = ({ navigation }) => {
  const { enrollments, user, refreshEnrollments } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshEnrollments();
    setRefreshing(false);
  };

  const handleJoinClass = (courseTitle: string) => {
    Alert.alert(
      'Live Class Portal',
      `Launching Live Session for "${courseTitle}".\n\nPlatform: Flymedia Virtual Classroom.`,
      [{ text: 'Join Class', onPress: () => console.log('Joined class') }]
    );
  };

  const handleCertificate = (ready: boolean) => {
    if (ready) {
      Alert.alert('Certificate Ready', 'Downloading your verified certificate from Flymedia Academy.');
    } else {
      Alert.alert(
        'Certificate Locked',
        'Complete all capstone projects and maintain 80%+ attendance to generate your verified certificate.'
      );
    }
  };

  return (
    <View style={styles.screen}>
      <Header subtitle="Student Learning Portal" />

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
            <Text style={styles.authGateTitle}>Sign In to Access Learning</Text>
            <Text style={styles.authGateSub}>
              Please log in to view your active enrollments, schedule, live class links, and certificates.
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
          /* LOGGED IN STUDENT DASHBOARD */
          <View>
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeGreeting}>
                Welcome back, <Text style={styles.userName}>{user.name || 'Student'}</Text>! 👋
              </Text>
              <Text style={styles.welcomeSub}>
                Role: <Text style={styles.roleTag}>{user.role}</Text> • {user.email}
              </Text>
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
                  <Text style={styles.openStudentPanelTitle}>Student Dashboard & 1-on-1 Sessions</Text>
                  <Text style={styles.openStudentPanelSub}>Book tutors, join live sessions, and track learning</Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.primaryOrange} />
            </TouchableOpacity>

            {/* ENROLLMENTS LIST */}
            {enrollments.length === 0 ? (
              <View style={styles.emptyCard}>
                <BookOpen size={48} color={Colors.textLight} />
                <Text style={styles.emptyTitle}>No Courses Enrolled</Text>
                <Text style={styles.emptyText}>
                  You haven't enrolled in any programs yet. Browse our catalog and start learning today!
                </Text>
                <TouchableOpacity
                  style={styles.exploreBtn}
                  onPress={() => navigation.navigate('CoursesTab')}
                >
                  <Text style={styles.exploreBtnText}>Browse Available Courses</Text>
                </TouchableOpacity>
              </View>
            ) : (
              enrollments.map(enr => (
                <View key={enr.id} style={styles.courseItemCard}>
                  <Image
                    source={{ uri: formatImageUrl(enr.thumbnail) }}
                    style={styles.courseThumbBanner}
                    resizeMode="cover"
                  />

                  <View style={styles.courseItemBody}>
                    <View style={styles.courseHeader}>
                      <View style={styles.categoryPill}>
                        <Text style={styles.categoryText}>{enr.category}</Text>
                      </View>
                      <Text style={styles.enrolledDate}>Started: {enr.enrolledAt}</Text>
                    </View>

                    <Text style={styles.courseTitle}>{enr.courseTitle}</Text>

                  {/* Progress bar */}
                  <View style={styles.progressContainer}>
                    <View style={styles.progressLabelRow}>
                      <Text style={styles.progressLabel}>Overall Progress</Text>
                      <Text style={styles.progressPercent}>{enr.progressPercent}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${enr.progressPercent}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.lessonsCount}>
                      {enr.completedLessons} of {enr.totalLessons} lessons completed
                    </Text>
                  </View>

                  {/* Live Class Schedule Box */}
                  {enr.nextLiveClass && (
                    <View style={styles.liveClassCard}>
                      <View style={styles.liveClassTop}>
                        <View style={styles.liveIndicator}>
                          <View style={styles.liveDot} />
                          <Text style={styles.liveText}>LIVE SESSION AVAILABLE</Text>
                        </View>
                      </View>
                      <Text style={styles.liveClassTopic}>{enr.nextLiveClass}</Text>

                      <TouchableOpacity
                        style={styles.joinClassBtn}
                        onPress={() => handleJoinClass(enr.courseTitle)}
                        activeOpacity={0.85}
                      >
                        <Video size={16} color={Colors.textWhite} />
                        <Text style={styles.joinClassBtnText}>Join Live Class</Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* Actions row: Syllabus & Certificate */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.syllabusBtn}
                      onPress={() =>
                        navigation.navigate('CourseDetail', { courseId: enr.courseId })
                      }
                    >
                      <BookOpen size={14} color={Colors.textSecondary} />
                      <Text style={styles.syllabusBtnText}>Course Syllabus</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.certBtn}
                      onPress={() => handleCertificate(enr.certificateReady)}
                    >
                      <Award
                        size={14}
                        color={enr.certificateReady ? Colors.success : Colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.certBtnText,
                          enr.certificateReady && { color: Colors.success },
                        ]}
                      >
                        {enr.certificateReady ? 'Certificate Ready' : 'Certificate (In Progress)'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
    backgroundColor: Colors.darkSurface,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    ...Shadows.small,
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
    width: 36,
    height: 36,
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
  courseItemCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    marginBottom: 16,
    ...Shadows.small,
  },
  courseThumbBanner: {
    width: '100%',
    height: 180,
    backgroundColor: '#0f172a',
  },
  courseItemBody: {
    padding: 18,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryPill: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  enrolledDate: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: 14,
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
    marginBottom: 14,
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
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  syllabusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  syllabusBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
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
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 14,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  exploreBtn: {
    backgroundColor: Colors.primaryOrange,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    ...Shadows.orange,
  },
  exploreBtnText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '800',
  },
});
