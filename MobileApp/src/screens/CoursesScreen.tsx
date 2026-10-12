import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Header } from '../components/common/Header';
import { CourseCard } from '../components/common/CourseCard';
import { CallbackModal } from '../components/common/CallbackModal';
import { ApiService } from '../services/api';
import { Course } from '../types';
import { Search, X } from 'lucide-react-native';

interface CoursesScreenProps {
  navigation: any;
}

export const CoursesScreen: React.FC<CoursesScreenProps> = ({ navigation }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [callbackModalVisible, setCallbackModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await ApiService.getHomeData();
      setCourses(data.courses);
      setCategories(data.categories);
    } catch (e) {
      console.warn('Error loading dynamic courses:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadCourses();
  };

  const filteredCourses = courses.filter(course => {
    const matchesCategory =
      selectedCategory === 'All' || course.category === selectedCategory;
    const skills = course.skills || [];
    const techStack = course.techStack || [];
    const matchesQuery =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skills.some((s: any) => {
        const label = typeof s === 'object' && s !== null ? s.name || '' : String(s || '');
        return label.toLowerCase().includes(searchQuery.toLowerCase());
      }) ||
      techStack.some((t: any) => {
        const label = typeof t === 'object' && t !== null ? t.name || '' : String(t || '');
        return label.toLowerCase().includes(searchQuery.toLowerCase());
      });
    return matchesCategory && matchesQuery;
  });

  const handleCoursePress = (course: Course) => {
    navigation.navigate('CourseDetail', { courseId: course.id, course });
  };

  return (
    <View style={styles.screen}>
      <Header
        subtitle="Explore All Programs"
        onCallPress={() => setCallbackModalVisible(true)}
      />

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={18} color={Colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search React, Python, SEO, Figma..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CATEGORY FILTER PILLS */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={item => item}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isActive = selectedCategory === item;
            return (
              <TouchableOpacity
                style={[styles.categoryBtn, isActive && styles.categoryBtnActive]}
                onPress={() => setSelectedCategory(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryBtnText, isActive && styles.categoryBtnTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* RESULTS COUNT */}
      <View style={styles.resultsCountRow}>
        <Text style={styles.resultsCountText}>
          Showing <Text style={styles.resultsCountBold}>{filteredCourses.length}</Text> live career tracks
        </Text>
      </View>

      {/* COURSES LIST */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryOrange} />
          <Text style={styles.loadingText}>Loading live courses...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.coursesList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primaryOrange]}
              tintColor={Colors.primaryOrange}
            />
          }
          renderItem={({ item }) => (
            <CourseCard
              course={item}
              onPress={() => handleCoursePress(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Courses Found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search query or select another category.
              </Text>
              <TouchableOpacity
                style={styles.clearBtn}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
              >
                <Text style={styles.clearBtnText}>Reset Filters</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: Colors.surface,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  categoryContainer: {
    backgroundColor: Colors.surface,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  categoryList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryBtn: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryBtnActive: {
    backgroundColor: Colors.primaryOrange,
    borderColor: Colors.primaryOrange,
  },
  categoryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  categoryBtnTextActive: {
    color: Colors.textWhite,
  },
  resultsCountRow: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resultsCountText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  resultsCountBold: {
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  coursesList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  clearBtn: {
    backgroundColor: Colors.primaryOrange,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  clearBtnText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
});
