import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Course } from '../../types';
import { Colors, Shadows } from '../../theme/colors';
import { Star, Clock, Users, ChevronRight } from 'lucide-react-native';

interface CourseCardProps {
  course: Course;
  onPress: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {/* Top Banner Badges */}
      <View style={styles.topRow}>
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{course.category}</Text>
        </View>
        {course.badge && (
          <View style={styles.highlightBadge}>
            <Text style={styles.highlightBadgeText}>{course.badge}</Text>
          </View>
        )}
      </View>

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
          <Star size={14} color="#f59e0b" fill="#f59e0b" />
          <Text style={styles.statText}>{course.rating}</Text>
        </View>
        <View style={styles.statDot} />
        <View style={styles.statItem}>
          <Clock size={14} color={Colors.textMuted} />
          <Text style={styles.statText}>{course.duration}</Text>
        </View>
        <View style={styles.statDot} />
        <View style={styles.statItem}>
          <Users size={14} color={Colors.textMuted} />
          <Text style={styles.statText}>{course.studentsCount}+</Text>
        </View>
      </View>

      {/* Tech Stack Chips preview */}
      <View style={styles.techStackRow}>
        {course.techStack.slice(0, 4).map((tech, i) => (
          <View key={i} style={styles.techChip}>
            <Text style={styles.techChipText}>{tech}</Text>
          </View>
        ))}
        {course.techStack.length > 4 && (
          <View style={styles.techChipMore}>
            <Text style={styles.techChipMoreText}>+{course.techStack.length - 4}</Text>
          </View>
        )}
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Price & Action Row */}
      <View style={styles.footerRow}>
        <View>
          <Text style={styles.feeLabel}>Total Program Fee</Text>
          <Text style={styles.priceText}>
            ₹{course.price.toLocaleString('en-IN')}
          </Text>
        </View>
        
        <View style={styles.actionBtn}>
          <Text style={styles.actionBtnText}>Explore Syllabus</Text>
          <ChevronRight size={16} color={Colors.textWhite} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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
    textTransform: 'uppercase',
  },
  highlightBadge: {
    backgroundColor: Colors.orangeLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 153, 0, 0.3)',
  },
  highlightBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryOrange,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: Colors.textMuted,
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
    borderRadius: 2,
    backgroundColor: Colors.textLight,
    marginHorizontal: 8,
  },
  statText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
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
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  techChipMore: {
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  techChipMoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primaryOrange,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  feeLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primaryOrange,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textWhite,
  },
});
