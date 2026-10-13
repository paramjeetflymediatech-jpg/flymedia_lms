import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { Header } from '../components/common/Header';
import { CourseCard } from '../components/common/CourseCard';
import { CallbackModal } from '../components/common/CallbackModal';
import { ApiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Course, Testimonial, FaqItem } from '../types';
import {
  Sparkles,
  Award,
  Laptop,
  Clock,
  Briefcase,
  Star,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  PhoneCall,
  RefreshCw,
} from 'lucide-react-native';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const isTutor = user?.role === 'TUTOR';

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [callbackModalVisible, setCallbackModalVisible] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDynamicData();
  }, []);

  const loadDynamicData = async () => {
    try {
      const data = await ApiService.getHomeData();
      setCourses(data.courses);
      setCategories(data.categories);
      setTestimonials(data.testimonials);
      setFaqs(data.faqs);
    } catch (e) {
      console.warn('Error loading dynamic home data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDynamicData();
  };

  const filteredCourses = selectedCategory === 'All'
    ? courses
    : courses.filter(c => c.category === selectedCategory);

  const toggleFaq = (id: string) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const handleCoursePress = (course: Course) => {
    navigation.navigate('CourseDetail', { courseId: course.id, course });
  };

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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primaryOrange]}
            tintColor={Colors.primaryOrange}
          />
        }
      >
        {/* HERO SECTION */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadge}>
            <Sparkles size={14} color={Colors.primaryOrange} />
            <Text style={styles.heroBadgeText}>FLYMEDIA ACADEMY</Text>
          </View>

          <Text style={styles.heroTitle}>
            We Don’t Just Educate,{'\n'}
            <Text style={styles.heroTitleAccent}>We Give Opportunities.</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Learn in-demand tech skills under senior industry experts with 100% practical live client projects.
          </Text>

          {/* Primary CTA Buttons */}
          <View style={styles.heroCtaRow}>
            <TouchableOpacity
              style={styles.primaryCta}
              onPress={() => navigation.navigate('CoursesTab')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryCtaText}>Browse Courses</Text>
              <ArrowRight size={16} color={Colors.textWhite} />
            </TouchableOpacity>

            {!isTutor && (
              <TouchableOpacity
                style={styles.secondaryCta}
                onPress={() => setCallbackModalVisible(true)}
                activeOpacity={0.85}
              >
                <PhoneCall size={16} color={Colors.primaryOrange} />
                <Text style={styles.secondaryCtaText}>Book Free Demo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Stats Bar */}
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>15K+</Text>
              <Text style={styles.statLabel}>Students Trained</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>96%</Text>
              <Text style={styles.statLabel}>Placement Rate</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>50+</Text>
              <Text style={styles.statLabel}>Live Projects</Text>
            </View>
          </View>
        </View>

        {/* WHY FLYMEDIA PILLARS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Why Learn With Us</Text>
          <Text style={styles.sectionSubtitle}>Designed for your direct career transformation</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillarsScroll}
        >
          <View style={styles.pillarCard}>
            <View style={[styles.pillarIconWrap, { backgroundColor: '#fff7ed' }]}>
              <Laptop size={20} color={Colors.primaryOrange} />
            </View>
            <Text style={styles.pillarTitle}>100% Practical</Text>
            <Text style={styles.pillarDesc}>Concept-based learning instead of rote theory.</Text>
          </View>

          <View style={styles.pillarCard}>
            <View style={[styles.pillarIconWrap, { backgroundColor: '#f0fdf4' }]}>
              <Briefcase size={20} color={Colors.success} />
            </View>
            <Text style={styles.pillarTitle}>Live Client Work</Text>
            <Text style={styles.pillarDesc}>Work on active company software and marketing briefs.</Text>
          </View>

          <View style={styles.pillarCard}>
            <View style={[styles.pillarIconWrap, { backgroundColor: '#eff6ff' }]}>
              <Clock size={20} color={Colors.accentBlue} />
            </View>
            <Text style={styles.pillarTitle}>Batch Flexibility</Text>
            <Text style={styles.pillarDesc}>Morning, evening & weekend slots available.</Text>
          </View>

          <View style={styles.pillarCard}>
            <View style={[styles.pillarIconWrap, { backgroundColor: '#fef2f2' }]}>
              <Award size={20} color="#ef4444" />
            </View>
            <Text style={styles.pillarTitle}>Placement Drive</Text>
            <Text style={styles.pillarDesc}>Direct employee opportunities at Flymedia and partners.</Text>
          </View>
        </ScrollView>

        {/* CATEGORY SELECTOR */}
        <View style={styles.sectionHeader}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>Featured Career Programs</Text>
            <TouchableOpacity onPress={onRefresh} style={styles.refreshIconBtn}>
              <RefreshCw size={14} color={Colors.primaryOrange} />
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>Real-time synchronized with Flymedia Live Database</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScroll}
        >
          {categories.map(cat => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryBtn, isActive && styles.categoryBtnActive]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryBtnText, isActive && styles.categoryBtnTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* COURSES LIST */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primaryOrange} />
            <Text style={styles.loadingText}>Fetching live curriculum...</Text>
          </View>
        ) : (
          <View style={styles.coursesList}>
            {filteredCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                onPress={() => handleCoursePress(course)}
              />
            ))}
          </View>
        )}

        {/* BANNER CTA */}
        <View style={styles.counselingBanner}>
          <View style={styles.counselingContent}>
            <Text style={styles.counselingTitle}>Confused About Which Course To Choose?</Text>
            <Text style={styles.counselingText}>
              Speak with our senior academic counselor for a personalized roadmap based on your background.
            </Text>
            <TouchableOpacity
              style={styles.bannerBtn}
              onPress={() => setCallbackModalVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.bannerBtnText}>Request 1-on-1 Guidance</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* STUDENT SUCCESS STORIES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Student Success Stories</Text>
          <Text style={styles.sectionSubtitle}>See how our graduates transformed their careers</Text>
        </View>

        <View style={styles.testimonialsList}>
          {testimonials.map(t => (
            <View key={t.id} style={styles.testimonialCard}>
              <View style={styles.ratingRow}>
                {[...Array(t.rating || 5)].map((_, i) => (
                  <Star key={i} size={14} color="#f59e0b" fill="#f59e0b" />
                ))}
              </View>
              <Text style={styles.testimonialReview}>“{t.review}”</Text>
              <View style={styles.studentInfoRow}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.studentInitial}>{t.studentName[0]}</Text>
                </View>
                <View>
                  <Text style={styles.studentName}>{t.studentName}</Text>
                  <Text style={styles.studentCourse}>{t.course}</Text>
                  {t.placedAt && (
                    <Text style={styles.studentPlaced}>{t.placedAt}</Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* FAQS ACCORDION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <Text style={styles.sectionSubtitle}>Clear answers to common student inquiries</Text>
        </View>

        <View style={styles.faqList}>
          {faqs.map(faq => {
            const isExpanded = expandedFaq === faq.id;
            return (
              <TouchableOpacity
                key={faq.id}
                style={styles.faqCard}
                onPress={() => toggleFaq(faq.id)}
                activeOpacity={0.85}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  {isExpanded ? (
                    <ChevronUp size={18} color={Colors.primaryOrange} />
                  ) : (
                    <ChevronDown size={18} color={Colors.textMuted} />
                  )}
                </View>
                {isExpanded && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Free Demo Callback Modal */}
      <CallbackModal
        visible={callbackModalVisible}
        onClose={() => setCallbackModalVisible(false)}
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
    paddingBottom: 24,
  },
  heroSection: {
    backgroundColor: '#0a0f1d',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#0a0f1d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(230, 8, 112, 0.16)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(230, 8, 112, 0.35)',
    marginBottom: 16,
  },
  heroBadgeText: {
    color: Colors.primaryRose,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.textWhite,
    lineHeight: 34,
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  heroTitleAccent: {
    color: Colors.primaryOrange,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 22,
    marginBottom: 22,
  },
  heroCtaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryCta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryRose,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    ...Shadows.brand,
  },
  primaryCtaText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryCta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  secondaryCtaText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primaryOrange,
  },
  statLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshIconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: Colors.orangeLight,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  pillarsScroll: {
    paddingHorizontal: 20,
    gap: 12,
    paddingVertical: 6,
  },
  pillarCard: {
    width: 160,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pillarIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pillarTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  pillarDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 6,
  },
  categoryBtn: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryBtnActive: {
    backgroundColor: Colors.primaryRose,
    borderColor: Colors.primaryRose,
    shadowColor: Colors.primaryRose,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  categoryBtnTextActive: {
    color: Colors.textWhite,
  },
  coursesList: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  counselingBanner: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: Colors.darkSurface,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 0, 0.3)',
    ...Shadows.medium,
  },
  counselingContent: {
    gap: 8,
  },
  counselingTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.textWhite,
    lineHeight: 22,
  },
  counselingText: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
    marginBottom: 6,
  },
  bannerBtn: {
    backgroundColor: Colors.primaryOrange,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
    ...Shadows.orange,
  },
  bannerBtnText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '800',
  },
  testimonialsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  testimonialCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  testimonialReview: {
    fontSize: 13,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 12,
  },
  studentInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  studentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentInitial: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primaryOrange,
  },
  studentName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  studentCourse: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  studentPlaced: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '700',
  },
  faqList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  faqCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingRight: 10,
  },
  faqAnswer: {
    marginTop: 10,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
});
