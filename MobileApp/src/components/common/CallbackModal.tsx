import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import {
  X,
  CheckCircle,
  PhoneCall,
  User,
  Phone,
  BookOpen,
  Sparkles,
  MapPin,
  Globe,
  MessageCircle,
  ShieldCheck,
  Check,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { FlymediaContact } from '../../constants/contact';

interface CallbackModalProps {
  visible: boolean;
  onClose: () => void;
  defaultCourse?: string;
}

const POPULAR_COURSES = [
  'Full Stack MERN',
  'Web Development',
  'Digital Marketing',
  'Video Editing & VFX',
  'Graphic Design & UI/UX',
  'Python & AI',
];

export const CallbackModal: React.FC<CallbackModalProps> = ({
  visible,
  onClose,
  defaultCourse = 'Full Stack MERN',
}) => {
  const { submitCallback } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState(defaultCourse);
  const [mode, setMode] = useState<'HYBRID' | 'ONLINE' | 'OFFLINE'>('HYBRID');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }
    const cleanPhone = phone.trim();
    if (!cleanPhone || cleanPhone.length < 8) {
      Alert.alert('Valid Phone Required', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    const finalCourseName = `${course} (${mode === 'OFFLINE' ? 'Campus' : mode === 'ONLINE' ? 'Online' : 'Hybrid'}) - ₹99 Demo`;
    await submitCallback(name.trim(), cleanPhone, finalCourseName);
    setLoading(false);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setPhone('');
      onClose();
    }, 2500);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          {/* Top Decorative Glow Strip */}
          <View style={styles.topAccentStrip} />

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <X size={18} color={Colors.textSecondary} strokeWidth={2.4} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {submitted ? (
              <View style={styles.successContainer}>
                <View style={styles.successIconCircle}>
                  <CheckCircle size={44} color="#059669" />
                </View>
                <Text style={styles.successTitle}>Demo Class Booked!</Text>
                <Text style={styles.successText}>
                  Your 1-on-1 demo request has been prioritized. Our senior academic counselor will connect via WhatsApp & Call within 15 minutes to confirm your scheduled slot.
                </Text>

                <View style={styles.bookedDetailsCard}>
                  <View style={styles.bookedDetailRow}>
                    <Text style={styles.bookedLabel}>Student:</Text>
                    <Text style={styles.bookedValue}>{name}</Text>
                  </View>
                  <View style={styles.bookedDetailRow}>
                    <Text style={styles.bookedLabel}>Course:</Text>
                    <Text style={styles.bookedValue}>{course}</Text>
                  </View>
                  <View style={styles.bookedDetailRow}>
                    <Text style={styles.bookedLabel}>Special Fee:</Text>
                    <Text style={[styles.bookedValue, { color: '#059669', fontWeight: '900' }]}>⚡ ₹99 Only</Text>
                  </View>
                </View>

                <View style={styles.confirmedBadge}>
                  <Check size={14} color="#059669" />
                  <Text style={styles.confirmedBadgeText}>Direct Mentor Allocation in Progress</Text>
                </View>
              </View>
            ) : (
              <View>
                {/* Header Badge */}
                <View style={styles.headerTagRow}>
                  <View style={styles.specialPriceBadge}>
                    <Sparkles size={11} color={Colors.primaryRose} />
                    <Text style={styles.specialPriceBadgeText}>⚡ ₹99 DEMO CLASS OFFER</Text>
                  </View>
                  <View style={styles.slotLiveBadge}>
                    <View style={styles.livePulseDot} />
                    <Text style={styles.slotLiveBadgeText}>LIMITED SLOTS</Text>
                  </View>
                </View>

                {/* Title & Subtitle */}
                <Text style={styles.modalTitle}>Book Live 1-on-1 Demo Class</Text>
                <Text style={styles.modalSubtitle}>
                  Experience real industry training with practical live coding & portfolio review for just ₹99 before committing to full program.
                </Text>

                {/* 3 Value Pillars */}
                <View style={styles.pillarsRow}>
                  <View style={styles.pillarItem}>
                    <Check size={12} color="#059669" />
                    <Text style={styles.pillarText}>1-on-1 Mentor</Text>
                  </View>
                  <View style={styles.pillarItem}>
                    <Check size={12} color="#059669" />
                    <Text style={styles.pillarText}>Live Hands-on Project</Text>
                  </View>
                  <View style={styles.pillarItem}>
                    <Check size={12} color="#059669" />
                    <Text style={styles.pillarText}>Fee Credited</Text>
                  </View>
                </View>

                {/* Form Field 1: Full Name */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={styles.inputBox}>
                    <User size={16} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Rahul Sharma"
                      placeholderTextColor={Colors.textLight}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Form Field 2: Phone */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.inputLabel}>Mobile / WhatsApp Number</Text>
                  <View style={styles.inputBox}>
                    <View style={styles.countryCodeBadge}>
                      <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="97793 24178"
                      placeholderTextColor={Colors.textLight}
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={setPhone}
                      maxLength={12}
                    />
                  </View>
                </View>

                {/* Training Mode Segmented Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.inputLabel}>Preferred Learning Mode</Text>
                  <View style={styles.modeToggleGroup}>
                    <TouchableOpacity
                      style={[styles.modeToggleBtn, mode === 'HYBRID' && styles.modeToggleBtnActive]}
                      onPress={() => setMode('HYBRID')}
                      activeOpacity={0.8}
                    >
                      <Sparkles size={13} color={mode === 'HYBRID' ? '#ffffff' : Colors.textSecondary} />
                      <Text style={[styles.modeToggleText, mode === 'HYBRID' && styles.modeToggleTextActive]}>
                        Hybrid
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modeToggleBtn, mode === 'OFFLINE' && styles.modeToggleBtnActive]}
                      onPress={() => setMode('OFFLINE')}
                      activeOpacity={0.8}
                    >
                      <MapPin size={13} color={mode === 'OFFLINE' ? '#ffffff' : Colors.textSecondary} />
                      <Text style={[styles.modeToggleText, mode === 'OFFLINE' && styles.modeToggleTextActive]}>
                        Campus (Lab)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modeToggleBtn, mode === 'ONLINE' && styles.modeToggleBtnActive]}
                      onPress={() => setMode('ONLINE')}
                      activeOpacity={0.8}
                    >
                      <Globe size={13} color={mode === 'ONLINE' ? '#ffffff' : Colors.textSecondary} />
                      <Text style={[styles.modeToggleText, mode === 'ONLINE' && styles.modeToggleTextActive]}>
                        Online (Live)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Form Field 3: Course Selection */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.inputLabel}>Select Career Program</Text>
                  {/* Quick Select Chips */}
                  <View style={styles.chipsContainer}>
                    {POPULAR_COURSES.map((c) => {
                      const isSelected = course.toLowerCase().includes(c.toLowerCase());
                      return (
                        <TouchableOpacity
                          key={c}
                          style={[styles.courseChip, isSelected && styles.courseChipActive]}
                          onPress={() => setCourse(c)}
                          activeOpacity={0.75}
                        >
                          <Text style={[styles.courseChipText, isSelected && styles.courseChipTextActive]}>
                            {c}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View style={[styles.inputBox, { marginTop: 8 }]}>
                    <BookOpen size={16} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={course}
                      onChangeText={setCourse}
                      placeholder="Or type custom course / topic..."
                      placeholderTextColor={Colors.textLight}
                    />
                  </View>
                </View>

                {/* Primary Action Button */}
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <View style={styles.submitButtonInner}>
                      <Text style={styles.submitButtonText}>Confirm Demo Class Booking</Text>
                      <View style={styles.submitPricePill}>
                        <Text style={styles.submitPricePillText}>₹99</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Direct Counselor Call & WhatsApp Options */}
                <View style={styles.directContactRow}>
                  <TouchableOpacity
                    style={styles.directContactBtn}
                    onPress={() => Linking.openURL(`tel:${FlymediaContact.phoneRaw}`).catch(() => {})}
                    activeOpacity={0.8}
                  >
                    <PhoneCall size={13} color={Colors.primaryRose} />
                    <Text style={styles.directContactBtnText}>Call Helpline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.directContactBtn, { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }]}
                    onPress={() => Linking.openURL(FlymediaContact.whatsappUrl).catch(() => {})}
                    activeOpacity={0.8}
                  >
                    <MessageCircle size={13} color="#059669" />
                    <Text style={[styles.directContactBtnText, { color: '#059669' }]}>WhatsApp</Text>
                  </TouchableOpacity>
                </View>

                {/* Trust Footer */}
                <View style={styles.trustFooter}>
                  <ShieldCheck size={13} color={Colors.textMuted} />
                  <Text style={styles.trustFooterText}>
                    100% verified mentors • No spam guarantee • 15-min call response
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 440,
    maxHeight: '90%',
    ...Shadows.medium,
    position: 'relative',
    overflow: 'hidden',
  },
  topAccentStrip: {
    height: 4,
    width: '100%',
    backgroundColor: Colors.primaryRose,
  },
  scrollContent: {
    padding: 22,
    paddingTop: 24,
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingRight: 32,
  },
  specialPriceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fce7f3',
  },
  specialPriceBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primaryRose,
    letterSpacing: 0.3,
  },
  slotLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryOrange,
  },
  slotLiveBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.primaryOrange,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textMuted,
    marginBottom: 14,
  },
  pillarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pillarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pillarText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  countryCodeBadge: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  countryCodeText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  modeToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 9,
    borderRadius: 10,
  },
  modeToggleBtnActive: {
    backgroundColor: Colors.primaryRose,
    borderColor: Colors.primaryRose,
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  modeToggleTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  courseChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  courseChipActive: {
    backgroundColor: '#fdf2f8',
    borderColor: '#f472b6',
  },
  courseChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  courseChipTextActive: {
    color: Colors.primaryRose,
    fontWeight: '800',
  },
  submitButton: {
    backgroundColor: Colors.primaryRose,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 12,
    ...Shadows.brand,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  submitPricePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  submitPricePillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  directContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  directContactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#fdf2f8',
    borderWidth: 1,
    borderColor: '#fce7f3',
  },
  directContactBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  trustFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  trustFooterText: {
    fontSize: 10,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  successText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  bookedDetailsCard: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    gap: 6,
  },
  bookedDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  bookedValue: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  confirmedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
});
