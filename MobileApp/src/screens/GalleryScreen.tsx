import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Modal,
  Dimensions,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { Header } from '../components/common/Header';
import { CallbackModal } from '../components/common/CallbackModal';
import { VideoPlayerModal } from '../components/common/VideoPlayerModal';
import { CachedImage } from '../components/common/CachedImage';
import { ApiService } from '../services/api';
import { GalleryItem } from '../types';
import { prefetchImages } from '../utils/imageUrl';
import {
  Play,
  Sparkles,
  Award,
  Briefcase,
  X,
  ExternalLink,
  Layers,
  Video,
  Camera,
  Star,
} from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DEFAULT_GALLERY_FALLBACK: GalleryItem[] = [
  {
    id: 'g1',
    title: 'Placed as Full Stack Developer at Tech Mahindra',
    studentName: 'Harpreet Kaur',
    courseName: 'Full Stack MERN',
    companyPlaced: 'Tech Mahindra',
    salaryPackage: '₹6.5 LPA',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=75',
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
    thumbnailUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=75',
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
    mediaUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=75',
    rating: 5,
    description: 'Created 15+ broadcast commercials during capstone projects.',
  },
  {
    id: 'g4',
    title: 'Placed as Frontend Developer at PixelForge',
    studentName: 'Rohan Sharma',
    courseName: 'React & Next.js Bootcamp',
    companyPlaced: 'PixelForge Labs',
    salaryPackage: '₹5.2 LPA',
    mediaType: 'IMAGE',
    mediaUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=75',
    rating: 5,
    description: 'Built 8 full-scale SaaS applications before graduation.',
  },
  {
    id: 'g5',
    title: 'Alumni Video: From Beginner to UI/UX Designer',
    studentName: 'Simran Verma',
    courseName: 'UI/UX Design',
    companyPlaced: 'DesignHub Studio',
    salaryPackage: '₹4.5 LPA',
    mediaType: 'VIDEO',
    mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=75',
    rating: 5,
    description: 'Crafted design systems and real iOS/Android Figma prototypes.',
  },
];

type FilterType = 'ALL' | 'IMAGE' | 'VIDEO';

export const GalleryScreen: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>(DEFAULT_GALLERY_FALLBACK);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [callbackModalVisible, setCallbackModalVisible] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<GalleryItem | null>(null);
  const [playingVideo, setPlayingVideo] = useState<GalleryItem | null>(null);

  const fetchGallery = useCallback(async () => {
    try {
      const data = await ApiService.getGalleryItems();
      if (data && data.length > 0) {
        setItems(data);
        prefetchImages(data.map((d) => d.thumbnailUrl || d.mediaUrl));
      } else {
        prefetchImages(DEFAULT_GALLERY_FALLBACK.map((d) => d.thumbnailUrl || d.mediaUrl));
      }
    } catch (err) {
      console.warn('Error loading gallery:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGallery();
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'ALL') return true;
    return item.mediaType === filter;
  });

  const handleItemPress = (item: GalleryItem) => {
    if (item.mediaType === 'VIDEO') {
      setPlayingVideo(item);
    } else {
      setPreviewPhoto(item);
    }
  };

  return (
    <View style={styles.screen}>
      {/* UNIFIED BRAND HEADER WITH LOGO & HELP BUTTON */}
      <Header onCallPress={() => setCallbackModalVisible(true)} />

      {/* FILTER PILL BAR */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterPill, filter === 'ALL' && styles.filterPillActive]}
          onPress={() => setFilter('ALL')}
          activeOpacity={0.8}
        >
          <Layers size={13} color={filter === 'ALL' ? '#ffffff' : Colors.textSecondary} />
          <Text style={[styles.filterText, filter === 'ALL' && styles.filterTextActive]}>
            All ({items.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'IMAGE' && styles.filterPillActive]}
          onPress={() => setFilter('IMAGE')}
          activeOpacity={0.8}
        >
          <Camera size={13} color={filter === 'IMAGE' ? '#ffffff' : Colors.textSecondary} />
          <Text style={[styles.filterText, filter === 'IMAGE' && styles.filterTextActive]}>
            Photos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterPill, filter === 'VIDEO' && styles.filterPillActive]}
          onPress={() => setFilter('VIDEO')}
          activeOpacity={0.8}
        >
          <Video size={13} color={filter === 'VIDEO' ? '#ffffff' : Colors.textSecondary} />
          <Text style={[styles.filterText, filter === 'VIDEO' && styles.filterTextActive]}>
            Video Reviews
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT SCROLL */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primaryRose} />
          <Text style={styles.loadingText}>Loading campus success gallery...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primaryRose]} />}
        >
          {/* HERO BANNER */}
          <View style={styles.heroBanner}>
            <View style={styles.heroBadge}>
              <Sparkles size={11} color={Colors.primaryOrange} />
              <Text style={styles.heroBadgeText}>CAMPUS SUCCESS & REVIEWS</Text>
            </View>
            <Text style={styles.heroTitle}>Student Success Stories & Campus Life</Text>
            <Text style={styles.heroSubtitle}>
              Explore student placement milestones, practical portfolio projects, and campus reviews.
            </Text>
          </View>

          {/* GALLERY CARDS GRID */}
          <View style={styles.grid}>
            {filteredItems.map((item) => {
              const isVideo = item.mediaType === 'VIDEO';
              const mediaSource = item.thumbnailUrl || item.mediaUrl;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() => handleItemPress(item)}
                  activeOpacity={0.9}
                >
                  {/* Media Thumbnail */}
                  <View style={styles.mediaContainer}>
                    <CachedImage
                      uri={mediaSource}
                      style={styles.mediaImage}
                      resizeMode="cover"
                    />

                    {/* Gradient Overlay */}
                    <View style={styles.imageOverlay} />

                    {/* Type Badge */}
                    <View style={styles.typeBadge}>
                      {isVideo ? (
                        <Video size={11} color="#ffffff" />
                      ) : (
                        <Camera size={11} color="#ffffff" />
                      )}
                      <Text style={styles.typeBadgeText}>
                        {isVideo ? 'VIDEO REVIEW' : 'PHOTO'}
                      </Text>
                    </View>

                    {/* Salary Package Badge if available */}
                    {item.salaryPackage ? (
                      <View style={styles.packagePill}>
                        <Award size={11} color="#ffffff" />
                        <Text style={styles.packagePillText}>{item.salaryPackage}</Text>
                      </View>
                    ) : null}

                    {/* Play Button Overlay for Videos */}
                    {isVideo && (
                      <View style={styles.playOverlay}>
                        <View style={styles.playButtonCircle}>
                          <Play size={18} color="#ffffff" fill="#ffffff" />
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Card Content */}
                  <View style={styles.cardBody}>
                    {/* Course Tag */}
                    {item.courseName ? (
                      <View style={styles.courseTagRow}>
                        <Text style={styles.courseTagText}>{item.courseName}</Text>
                        <View style={styles.starsRow}>
                          <Star size={11} color="#f59e0b" fill="#f59e0b" />
                          <Text style={styles.ratingNumber}>5.0</Text>
                        </View>
                      </View>
                    ) : null}

                    {/* Title */}
                    <Text style={styles.cardTitle} numberOfLines={2}>
                      {item.title}
                    </Text>

                    {/* Description if present */}
                    {item.description ? (
                      <Text style={styles.cardDesc} numberOfLines={2}>
                        {item.description}
                      </Text>
                    ) : null}

                    {/* Student & Company Footer */}
                    <View style={styles.cardFooter}>
                      <View style={styles.studentInfo}>
                        <Text style={styles.studentName} numberOfLines={1}>
                          {item.studentName || 'Academy Student'}
                        </Text>
                        {item.companyPlaced ? (
                          <View style={styles.companyRow}>
                            <Briefcase size={11} color={Colors.textMuted} />
                            <Text style={styles.companyText} numberOfLines={1}>
                              {item.companyPlaced}
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.actionBtn}>
                        <Text style={styles.actionBtnText}>
                          {isVideo ? 'Watch' : 'View'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* COUNSELOR ASSISTANCE CARD */}
          <View style={styles.ctaCard}>
            <View style={styles.ctaGlow} />
            <Sparkles size={24} color={Colors.primaryRose} />
            <Text style={styles.ctaTitle}>Start Your Career Milestone Today</Text>
            <Text style={styles.ctaSub}>
              Book a 1-on-1 live practical demo session or speak with our career counselor.
            </Text>
            <TouchableOpacity
              style={styles.ctaBtn}
              onPress={() => setCallbackModalVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaBtnText}>Book ₹99 Demo Session</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* FULL PHOTO PREVIEW MODAL */}
      <Modal
        visible={Boolean(previewPhoto)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewPhoto(null)}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={styles.modalCloseBtn}
            onPress={() => setPreviewPhoto(null)}
            activeOpacity={0.8}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={22} color="#ffffff" />
          </TouchableOpacity>

          {previewPhoto && (
            <View style={styles.modalContent}>
              <View style={styles.previewImageWrap}>
                <CachedImage
                  uri={previewPhoto.mediaUrl || previewPhoto.thumbnailUrl}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.modalMetaCard}>
                <Text style={styles.modalTitle}>{previewPhoto.title}</Text>
                <Text style={styles.modalSub}>
                  {previewPhoto.studentName} • {previewPhoto.companyPlaced || previewPhoto.courseName}
                </Text>
                {previewPhoto.salaryPackage ? (
                  <View style={styles.modalPkgBadge}>
                    <Text style={styles.modalPkgBadgeText}>Package: {previewPhoto.salaryPackage}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* IN-APP VIDEO PLAYER MODAL */}
      <VideoPlayerModal
        visible={Boolean(playingVideo)}
        onClose={() => setPlayingVideo(null)}
        videoUrl={playingVideo?.mediaUrl}
        title={playingVideo?.title}
        studentName={playingVideo?.studentName}
        companyOrCourse={playingVideo?.companyPlaced || playingVideo?.courseName}
        salaryPackage={playingVideo?.salaryPackage}
        description={playingVideo?.description}
      />

      {/* CALLBACK / HELP MODAL */}
      <CallbackModal
        visible={callbackModalVisible}
        onClose={() => setCallbackModalVisible(false)}
        defaultCourse="Campus Gallery Inquiry"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  filterPillActive: {
    backgroundColor: Colors.primaryRose,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  filterTextActive: {
    color: '#ffffff',
  },
  heroBanner: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.small,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryOrange,
    letterSpacing: 0.3,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textMuted,
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.medium,
  },
  mediaContainer: {
    width: '100%',
    height: 190,
    backgroundColor: '#e2e8f0',
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.22)',
  },
  typeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  packagePill: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
  },
  packagePillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  playOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(230, 8, 112, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  cardBody: {
    padding: 14,
  },
  courseTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  courseTagText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryRose,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingNumber: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 20,
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  studentInfo: {
    flex: 1,
    marginRight: 10,
  },
  studentName: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  companyText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  actionBtn: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  ctaCard: {
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fce7f3',
    ...Shadows.medium,
    position: 'relative',
    overflow: 'hidden',
  },
  ctaGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(230, 8, 112, 0.08)',
  },
  ctaTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  ctaSub: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  ctaBtn: {
    backgroundColor: Colors.primaryRose,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 24,
    ...Shadows.small,
  },
  ctaBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
  },
  previewImageWrap: {
    width: SCREEN_WIDTH - 32,
    height: (SCREEN_WIDTH - 32) * 0.85,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalMetaCard: {
    marginTop: 16,
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  modalSub: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  modalPkgBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modalPkgBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
});
