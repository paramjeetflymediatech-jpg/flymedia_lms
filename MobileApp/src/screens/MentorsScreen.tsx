import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { Header } from '../components/common/Header';
import { CallbackModal } from '../components/common/CallbackModal';
import { ApiService } from '../services/api';
import { Mentor } from '../types';
import { Star, Users, MessageSquare } from 'lucide-react-native';

export const MentorsScreen: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [callbackVisible, setCallbackVisible] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState('');

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      const data = await ApiService.getHomeData();
      setMentors(data.mentors || []);
    } catch (e) {
      console.warn('Failed to load mentors:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMentors();
  };

  const handleBook = (name: string) => {
    setSelectedMentor(`Mentorship with ${name}`);
    setCallbackVisible(true);
  };

  return (
    <View style={styles.screen}>
      <Header
        subtitle="Senior Industry Experts"
        onCallPress={() => setCallbackVisible(true)}
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
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>Learn Directly From Practitioners</Text>
          <Text style={styles.introSub}>
            Our trainers are full-time architects and directors actively building enterprise web apps and digital ad funnels.
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primaryOrange} />
            <Text style={styles.loadingText}>Loading expert mentors...</Text>
          </View>
        ) : mentors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Mentors Listed</Text>
            <Text style={styles.emptySub}>
              Mentors are being synchronized from the platform. Pull down to refresh or request 1-on-1 counseling.
            </Text>
            <TouchableOpacity
              style={styles.counselingBtn}
              onPress={() => setCallbackVisible(true)}
            >
              <Text style={styles.counselingBtnText}>Request 1-on-1 Guidance</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.mentorsList}>
            {mentors.map(m => (
              <View key={m.id} style={styles.mentorCard}>
                <View style={styles.topRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{m.name ? m.name[0] : 'M'}</Text>
                  </View>
                  <View style={styles.mentorInfo}>
                    <Text style={styles.name}>{m.name}</Text>
                    <Text style={styles.role}>{m.role}</Text>
                    <Text style={styles.company}>{m.company} • {m.experience}</Text>
                  </View>
                </View>

                {m.bio ? <Text style={styles.bio}>{m.bio}</Text> : null}

                {/* Stats */}
                <View style={styles.statsRow}>
                  <View style={styles.statBox}>
                    <Star size={14} color="#f59e0b" fill="#f59e0b" />
                    <Text style={styles.statVal}>{m.rating}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Users size={14} color={Colors.textMuted} />
                    <Text style={styles.statVal}>{m.studentsTrained}+ trained</Text>
                  </View>
                </View>

                {/* Skill chips */}
                {m.skills && m.skills.length > 0 && (
                  <View style={styles.skillsRow}>
                    {m.skills.map((s, idx) => (
                      <View key={idx} style={styles.skillBadge}>
                        <Text style={styles.skillBadgeText}>{s}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Action Button */}
                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => handleBook(m.name)}
                  activeOpacity={0.85}
                >
                  <MessageSquare size={16} color={Colors.textWhite} />
                  <Text style={styles.bookBtnText}>Book 1-on-1 Guidance Session</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <CallbackModal
        visible={callbackVisible}
        onClose={() => setCallbackVisible(false)}
        defaultCourse={selectedMentor || 'Mentorship Guidance'}
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
    padding: 16,
  },
  introCard: {
    backgroundColor: Colors.surface,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  introTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  introSub: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 19,
  },
  loadingContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textMuted,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  counselingBtn: {
    backgroundColor: Colors.primaryOrange,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  counselingBtnText: {
    color: Colors.textWhite,
    fontWeight: '700',
    fontSize: 13,
  },
  mentorsList: {
    gap: 16,
  },
  mentorCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primaryOrange,
  },
  mentorInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  role: {
    fontSize: 13,
    color: Colors.primaryOrange,
    fontWeight: '600',
    marginTop: 2,
  },
  company: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  bio: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  skillBadge: {
    backgroundColor: Colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillBadgeText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  bookBtn: {
    backgroundColor: Colors.darkSurface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookBtnText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '700',
  },
});
