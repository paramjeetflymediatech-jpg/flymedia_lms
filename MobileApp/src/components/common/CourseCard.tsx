import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Course } from '../../types';
import { Colors, Shadows } from '../../theme/colors';
import { Star, Clock, Users, ChevronRight, Zap } from 'lucide-react-native';
import { CachedImage } from './CachedImage';

interface CourseCardProps {
  course: Course;
  onPress: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Course Thumbnail Image */}
      <View style={styles.imageContainer}>
        <CachedImage
          uri={course.thumbnail}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.imageOverlayGradient} />

        {/* Floating Category Tag on Image */}
        <View style={styles.floatingCategoryPill}>
          <Text style={styles.floatingCategoryText}>{course.category || 'PROGRAM'}</Text>
        </View>

        {/* Live Badge */}
        <View style={styles.floatingModeBadge}>
          <View style={styles.livePulseDot} />
          <Text style={styles.floatingModeText}>
            {course.mode === 'BOTH' ? 'HYBRID' : course.mode === 'OFFLINE' ? 'CAMPUS' : 'LIVE'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        {/* Highlight Badge if exists */}
        {course.badge && (
          <View style={styles.highlightBadge}>
            <Zap size={11} color={Colors.primaryOrange} />
            <Text style={styles.highlightBadgeText}>{course.badge}</Text>
          </View>
        )}

        {/* Course Title */}
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>

        {/* Description Snippet */}
        <Text style={styles.description} numberOfLines={2}>
          {course.description}
        </Text>

        {/* Meta stats: Rating, Duration, Students */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Star size={13} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.statTextBold}>{course.rating}</Text>
          </View>
          <View style={styles.statDot} />
          <View style={styles.statItem}>
            <Clock size={13} color={Colors.textMuted} />
            <Text style={styles.statText}>{course.duration}</Text>
          </View>
          <View style={styles.statDot} />
          <View style={styles.statItem}>
            <Users size={13} color={Colors.textMuted} />
            <Text style={styles.statText}>{course.studentsCount}+ enrolled</Text>
          </View>
        </View>

        {/* Tech Stack Chips preview */}
        {Array.isArray(course.techStack) && course.techStack.length > 0 && (
          <View style={styles.techStackRow}>
            {course.techStack.slice(0, 4).map((tech: any, i) => {
              const label = typeof tech === 'object' && tech !== null ? tech.name || '' : String(tech || '');
              if (!label) return null;
              return (
                <View key={i} style={styles.techChip}>
                  <Text style={styles.techChipText}>{label}</Text>
                </View>
              );
            })}
            {course.techStack.length > 4 && (
              <View style={styles.techChipMore}>
                <Text style={styles.techChipMoreText}>+{course.techStack.length - 4}</Text>
              </View>
            )}
          </View>
        )}

        {/* Divider */}
        <View style={styles.divider} />

        {/* Price & Action Row */}
        <View style={styles.footerRow}>
          <View>
            <Text style={styles.feeLabel}>Program Fee</Text>
            <Text style={styles.priceText}>
              {course.price && Number(course.price) > 0
                ? `₹${Number(course.price).toLocaleString('en-IN')}`
                : 'Free'}
            </Text>
          </View>

          <View style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>View Details</Text>
            <ChevronRight size={15} color={Colors.textWhite} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#eef2f6',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
  },
  imageContainer: {
    width: '100%',
    height: 185,
    backgroundColor: '#0f172a',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  imageOverlayGradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.15)',
  },
  floatingCategoryPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  floatingCategoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  floatingModeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  floatingModeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: 16,
  },
  highlightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(230, 8, 112, 0.25)',
  },
  highlightBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryRose,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 23,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 8,
  },
  statTextBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  techStackRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  techChip: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  techChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  techChipMore: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#fff7ed',
  },
  techChipMoreText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryOrange,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: 0.2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryRose,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    gap: 4,
    shadowColor: Colors.primaryRose,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
});
