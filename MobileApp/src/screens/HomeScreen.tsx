import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { Header } from '../components/common/Header';
import { CourseCard } from '../components/common/CourseCard';
import { CallbackModal } from '../components/common/CallbackModal';
import { ContactUsModal } from '../components/common/ContactUsModal';
import { CachedImage } from '../components/common/CachedImage';
import { ApiService } from '../services/api';
import { prefetchImages } from '../utils/imageUrl';
import { useAuth } from '../context/AuthContext';
import { Course, Testimonial, FaqItem, GalleryItem } from '../types';
import { FlymediaContact } from '../constants/contact';
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
  MapPin,
  Phone,
  Mail,
  Navigation as NavigationIcon,
  Play,
  MessageSquare,
} from 'lucide-react-native';

interface HomeScreenProps {
  navigation: any;
}

const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'g1',
    title: 'Placed as Full Stack Developer at Tech Mahindra',
    studentName: 'Simran Kaur',
    courseName: 'Full Stack MERN',
    companyPlaced: 'Tech Mahindra',
    salaryPackage: '₹6.5 LPA',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
    rating: 5,
    description: 'Completed 6-month live client project training with 1-on-1 practical mentor support.',
  },
  {
    id: 'g2',
    title: 'Student Review: Digital Marketing Live Campaigns',
    studentName: 'Amanpreet Singh',
    courseName: 'Digital Marketing',
    companyPlaced: 'Growth Media Group',
    salaryPackage: '₹5.8 LPA',
    mediaType: 'VIDEO',
    mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    rating: 5,
    description: 'Practical training on real client ad spends and live SEO audits.',
  },
  {
    id: 'g3',
    title: 'Placed as Motion Graphic Designer at Media Works',
    studentName: 'Gurpreet Singh',
    courseName: 'Video Editing & VFX',
    companyPlaced: 'Media Works Studios',
    salaryPackage: '₹4.8 LPA',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    rating: 5,
    description: 'Created 15+ broadcast commercials during capstone projects.',
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const isTutor = user?.role === 'TUTOR';

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>(DEFAULT_GALLERY_ITEMS);
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [callbackModalVisible, setCallbackModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
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
      if (data.gallery && data.gallery.length > 0) {
        setGallery(data.gallery);
      }
      // Proactively prefetch course and gallery thumbnails in background
      if (data.courses) {
        prefetchImages(data.courses.map(c => c.thumbnail));
      }
      if (data.gallery) {
        prefetchImages(data.gallery.map(g => g.thumbnailUrl || g.mediaUrl));
      }
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
                <Text style={styles.secondaryCtaText}>₹99 Demo Class</Text>
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

        {/* BANNER CTA - ₹99 DEMO CLASS */}
        <View style={styles.counselingBanner}>
          <View style={styles.counselingContent}>
            <Text style={styles.counselingTitle}>Book 1 Demo Class For Just ₹99</Text>
            <Text style={styles.counselingText}>
              Try our live mentor-led training for any course before enrolling. Get 1-on-1 guidance, syllabus walkthrough, and career roadmap.
            </Text>
            <TouchableOpacity
              style={styles.bannerBtn}
              onPress={() => setCallbackModalVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.bannerBtnText}>Book Demo Class (₹99)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SUCCESS GALLERY & VIDEO REVIEWS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Success Gallery & Video Reviews</Text>
          <Text style={styles.sectionSubtitle}>Watch real student reviews, placement packages & project showcases</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.galleryScroll}
        >
          {gallery.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.galleryCard}
              onPress={() => {
                if (item.mediaUrl) {
                  Linking.openURL(item.mediaUrl).catch(() => {});
                }
              }}
              activeOpacity={0.9}
            >
              {/* Media Thumbnail */}
              <View style={styles.galleryImageWrap}>
                <CachedImage
                  uri={item.thumbnailUrl || item.mediaUrl}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />

                {/* Badge Type */}
                <View style={styles.galleryTypeBadge}>
                  <Text style={styles.galleryTypeBadgeText}>
                    {item.mediaType === 'VIDEO' ? '🎥 VIDEO' : '📷 PHOTO'}
                  </Text>
                </View>

                {/* Package Badge */}
                {item.salaryPackage ? (
                  <View style={styles.galleryPackageBadge}>
                    <Text style={styles.galleryPackageBadgeText}>{item.salaryPackage}</Text>
                  </View>
                ) : null}

                {/* Play Button Overlay for Videos */}
                {item.mediaType === 'VIDEO' && (
                  <View style={styles.galleryPlayOverlay}>
                    <View style={styles.galleryPlayBtn}>
                      <Play size={16} color={Colors.textWhite} fill={Colors.textWhite} />
                    </View>
                  </View>
                )}
              </View>

              {/* Details */}
              <View style={styles.galleryCardContent}>
                <View style={styles.galleryRatingRow}>
                  <Text style={styles.galleryCourseTag}>{item.courseName || 'Career Track'}</Text>
                  <View style={{ flexDirection: 'row', gap: 2 }}>
                    {[...Array(item.rating || 5)].map((_, i) => (
                      <Star key={i} size={11} color="#f59e0b" fill="#f59e0b" />
                    ))}
                  </View>
                </View>

                <Text style={styles.galleryTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                {item.description ? (
                  <Text style={styles.galleryDesc} numberOfLines={2}>
                    “{item.description}”
                  </Text>
                ) : null}

                <View style={styles.galleryFooter}>
                  <View>
                    <Text style={styles.galleryStudentName}>
                      {item.studentName || 'Flymedia Student'}
                    </Text>
                    {item.companyPlaced ? (
                      <Text style={styles.galleryCompanyPlaced}>
                        Placed at <Text style={{ color: Colors.primaryOrange, fontWeight: '800' }}>{item.companyPlaced}</Text>
                      </Text>
                    ) : null}
                  </View>

                  <Text style={styles.galleryActionText}>
                    {item.mediaType === 'VIDEO' ? 'Watch ▶' : 'View 👁️'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

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

        {/* CAMPUS & ADMISSIONS SECTION */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Visit Our Academy Campus</Text>
          <Text style={styles.sectionSubtitle}>Learn in-person at Flymedia Technology in Ludhiana</Text>
        </View>

        <View style={styles.campusCard}>
          <View style={styles.campusCardHeader}>
            <View style={styles.campusIconCircle}>
              <MapPin size={20} color={Colors.textWhite} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.campusTitle}>{FlymediaContact.companyName}</Text>
              <Text style={styles.campusSub}>Offline Training Hub & Software Labs</Text>
            </View>
          </View>

          <View style={styles.campusInfoRow}>
            <Text style={styles.campusAddressText}>
              {FlymediaContact.address}
            </Text>
          </View>

          <View style={styles.campusCtaRow}>
            <TouchableOpacity
              style={styles.campusCallBtn}
              onPress={() => Linking.openURL(`tel:${FlymediaContact.phoneRaw}`).catch(() => {})}
              activeOpacity={0.85}
            >
              <Phone size={14} color={Colors.textWhite} />
              <Text style={styles.campusCallBtnText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.campusContactBtn}
              onPress={() => setContactModalVisible(true)}
              activeOpacity={0.85}
            >
              <MessageSquare size={14} color="#ffffff" />
              <Text style={styles.campusContactBtnText}>Contact Us</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.campusMapBtn}
              onPress={() => Linking.openURL(FlymediaContact.googleMapsUrl).catch(() => {})}
              activeOpacity={0.85}
            >
              <NavigationIcon size={14} color={Colors.primaryRose} />
              <Text style={styles.campusMapBtnText}>Maps</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Free Demo Callback Modal */}
      <CallbackModal
        visible={callbackModalVisible}
        onClose={() => setCallbackModalVisible(false)}
      />

      {/* Official Contact Us Modal */}
      <ContactUsModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
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
  galleryScroll: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 8,
  },
  galleryCard: {
    width: 280,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  galleryImageWrap: {
    width: '100%',
    height: 150,
    backgroundColor: '#0f172a',
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryTypeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  galleryTypeBadgeText: {
    color: Colors.textWhite,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  galleryPackageBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  galleryPackageBadgeText: {
    color: Colors.textWhite,
    fontSize: 10,
    fontWeight: '900',
  },
  galleryPlayOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryPlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryRose,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 2,
    ...Shadows.medium,
  },
  galleryCardContent: {
    padding: 14,
  },
  galleryRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  galleryCourseTag: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryOrange,
    textTransform: 'uppercase',
  },
  galleryTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 18,
    marginBottom: 6,
  },
  galleryDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  galleryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  galleryStudentName: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  galleryCompanyPlaced: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  galleryActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryOrange,
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
  campusCard: {
    marginHorizontal: 20,
    backgroundColor: '#0a0f1d',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(230, 8, 112, 0.25)',
    ...Shadows.medium,
  },
  campusCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  campusIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.primaryRose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  campusTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textWhite,
  },
  campusSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  campusInfoRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  campusAddressText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  campusCtaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  campusCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryRose,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  campusCallBtnText: {
    color: Colors.textWhite,
    fontSize: 12.5,
    fontWeight: '800',
  },
  campusContactBtn: {
    flex: 1.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryOrange,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  campusContactBtnText: {
    color: Colors.textWhite,
    fontSize: 12.5,
    fontWeight: '800',
  },
  campusMapBtn: {
    flex: 0.9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  campusMapBtnText: {
    color: Colors.textWhite,
    fontSize: 12.5,
    fontWeight: '700',
  },
});
