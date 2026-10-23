import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../../theme/colors';
import { FlymediaContact } from '../../constants/contact';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  X,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  CheckCircle,
  Sparkles,
  Building2,
  ChevronDown,
  Globe,
  Clock,
  ShieldCheck,
} from 'lucide-react-native';

interface ContactUsModalProps {
  visible: boolean;
  onClose: () => void;
  initialCourse?: string;
}

const INQUIRY_TOPICS = [
  'Full Stack MERN Developer with AI',
  'Web Development & UI/UX Bootcamp',
  'Digital Marketing & Growth Specialist',
  'Python & AI Data Science',
  'Creative Graphic Design & Video Editing',
  '30-Day / 6-Month Summer Training & Internship',
  'Fee Structure & Admission Guidance',
  'General Question / Support',
];

export const ContactUsModal: React.FC<ContactUsModalProps> = ({
  visible,
  onClose,
  initialCourse,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16);
  const { user } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [selectedTopic, setSelectedTopic] = useState(initialCourse || INQUIRY_TOPICS[0]);
  const [message, setMessage] = useState('');
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (visible) {
      if (user?.name && !name) setName(user.name);
      if (user?.phone && !phone) setPhone(user.phone);
      if (user?.email && !email) setEmail(user.email);
      if (initialCourse) setSelectedTopic(initialCourse);
      setIsTopicDropdownOpen(false);
      setSending(false);
      setSubmitted(false);
    }
  }, [visible, user, initialCourse]);

  const handleCall = () => {
    Linking.openURL(`tel:${FlymediaContact.phoneRaw}`).catch(() => {
      Alert.alert('Helpline', `Call us directly at: ${FlymediaContact.phone}`);
    });
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello Flymedia Technology team! I would like to inquire about the ${selectedTopic} course and admissions.`
    );
    const whatsappUrl = `whatsapp://send?phone=+919779324178&text=${text}`;
    const webUrl = `https://wa.me/919779324178?text=${text}`;

    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          return Linking.openURL(webUrl);
        }
      })
      .catch(() => Linking.openURL(webUrl));
  };

  const handleEmail = () => {
    Linking.openURL(
      `mailto:${FlymediaContact.email}?subject=Course Inquiry - ${selectedTopic}`
    ).catch(() => {
      Alert.alert('Email Us', `Admissions email: ${FlymediaContact.email}`);
    });
  };

  const handleMaps = () => {
    Linking.openURL(FlymediaContact.googleMapsUrl).catch(() => {
      Alert.alert('Campus Address', FlymediaContact.address);
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      Alert.alert('Mobile Number Required', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    const cleanEmail = email.trim();
    if (cleanEmail && !cleanEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setSending(true);
    try {
      const ok = await ApiService.submitInquiry({
        name: name.trim(),
        phone: cleanPhone,
        email: cleanEmail || undefined,
        course: selectedTopic,
        message: message.trim() || `Inquiry submitted via Mobile App for ${selectedTopic}`,
      });

      setSending(false);
      if (ok) {
        setSubmitted(true);
      } else {
        Alert.alert(
          'Submission Error',
          'Could not send inquiry at the moment. Please call or WhatsApp our helpline directly.'
        );
      }
    } catch (err: any) {
      setSending(false);
      Alert.alert('Network Error', err?.message || 'Failed to submit inquiry.');
    }
  };

  const handleReset = () => {
    setMessage('');
    setSubmitted(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalBackdrop} />

        <View style={[styles.modalSheet, { paddingBottom: bottomPadding }]}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.sheetHeaderBadge}>
                <Sparkles size={12} color={Colors.primaryRose} />
                <Text style={styles.sheetHeaderBadgeText}>OFFICIAL ADMISSIONS & HELP</Text>
              </View>
              <Text style={styles.sheetTitle}>Contact & Reach Us</Text>
              <Text style={styles.sheetSubtitle}>
                Get in touch with Flymedia counselors or visit our campus
              </Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Quick Contact Action Bar */}
            <View style={styles.quickContactGrid}>
              <TouchableOpacity
                style={[styles.quickContactCard, { borderColor: '#FECDD3', backgroundColor: '#FFF1F2' }]}
                onPress={handleCall}
                activeOpacity={0.8}
              >
                <View style={[styles.quickContactIconCircle, { backgroundColor: Colors.primaryRose }]}>
                  <Phone size={15} color="#ffffff" />
                </View>
                <Text style={styles.quickContactLabel}>Call Campus</Text>
                <Text style={[styles.quickContactValue, { color: Colors.primaryRose }]} numberOfLines={1}>
                  +91-97793-24178
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickContactCard, { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' }]}
                onPress={handleWhatsApp}
                activeOpacity={0.8}
              >
                <View style={[styles.quickContactIconCircle, { backgroundColor: '#16A34A' }]}>
                  <MessageCircle size={15} color="#ffffff" />
                </View>
                <Text style={styles.quickContactLabel}>WhatsApp</Text>
                <Text style={[styles.quickContactValue, { color: '#16A34A' }]} numberOfLines={1}>
                  Instant Chat
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickContactCard, { borderColor: '#FED7AA', backgroundColor: '#FFF7ED' }]}
                onPress={handleEmail}
                activeOpacity={0.8}
              >
                <View style={[styles.quickContactIconCircle, { backgroundColor: '#EA580C' }]}>
                  <Mail size={15} color="#ffffff" />
                </View>
                <Text style={styles.quickContactLabel}>Email Us</Text>
                <Text style={[styles.quickContactValue, { color: '#EA580C' }]} numberOfLines={1}>
                  Send Mail
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.quickContactCard, { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' }]}
                onPress={handleMaps}
                activeOpacity={0.8}
              >
                <View style={[styles.quickContactIconCircle, { backgroundColor: '#2563EB' }]}>
                  <MapPin size={15} color="#ffffff" />
                </View>
                <Text style={styles.quickContactLabel}>Directions</Text>
                <Text style={[styles.quickContactValue, { color: '#2563EB' }]} numberOfLines={1}>
                  Campus Maps
                </Text>
              </TouchableOpacity>
            </View>

            {submitted ? (
              /* Success Confirmation */
              <View style={styles.successBox}>
                <View style={styles.successIconWrap}>
                  <CheckCircle size={44} color="#16A34A" />
                </View>
                <Text style={styles.successTitle}>Inquiry Sent Successfully!</Text>
                <Text style={styles.successText}>
                  Thank you, <Text style={{ fontWeight: '800', color: Colors.textPrimary }}>{name}</Text>. Our admissions counselor has received your message regarding{' '}
                  <Text style={{ fontWeight: '700', color: Colors.primaryRose }}>{selectedTopic}</Text> and will get back to you shortly via Call or WhatsApp.
                </Text>

                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={handleReset}
                  activeOpacity={0.85}
                >
                  <Text style={styles.doneBtnText}>Close Window</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Form */
              <View style={styles.formContainer}>
                <Text style={styles.formSectionTitle}>Drop Us a Message</Text>

                {/* Name */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Full Name <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor={Colors.textLight}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* Phone */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Mobile / WhatsApp Number <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="10-digit mobile number"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="phone-pad"
                    maxLength={14}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                {/* Email */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="student@example.com"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>

                {/* Course/Topic Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Course / Area of Interest</Text>
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() => setIsTopicDropdownOpen(!isTopicDropdownOpen)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.dropdownTriggerText} numberOfLines={1}>
                      {selectedTopic}
                    </Text>
                    <ChevronDown
                      size={18}
                      color={Colors.textSecondary}
                      style={{
                        transform: [{ rotate: isTopicDropdownOpen ? '180deg' : '0deg' }],
                      }}
                    />
                  </TouchableOpacity>

                  {isTopicDropdownOpen && (
                    <View style={styles.dropdownList}>
                      {INQUIRY_TOPICS.map((item) => {
                        const isSelected = item === selectedTopic;
                        return (
                          <TouchableOpacity
                            key={item}
                            style={[
                              styles.dropdownItem,
                              isSelected && styles.dropdownItemActive,
                            ]}
                            onPress={() => {
                              setSelectedTopic(item);
                              setIsTopicDropdownOpen(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                isSelected && styles.dropdownItemTextActive,
                              ]}
                            >
                              {item}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>

                {/* Message / Details */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Message / Question</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Tell us what you'd like to learn or any queries regarding schedule, batch timings, or fee..."
                    placeholderTextColor={Colors.textLight}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    value={message}
                    onChangeText={setMessage}
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitBtn, sending && { opacity: 0.75 }]}
                  onPress={handleSubmit}
                  disabled={sending}
                  activeOpacity={0.85}
                >
                  {sending ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Send size={16} color="#ffffff" />
                      <Text style={styles.submitBtnText}>Send Message to Admissions</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Campus & Global Offices Card */}
            <View style={styles.campusesCard}>
              <View style={styles.campusesCardHeader}>
                <Building2 size={16} color={Colors.primaryRose} />
                <Text style={styles.campusesCardTitle}>Flymedia Global Offices</Text>
              </View>

              <View style={styles.campusItem}>
                <Text style={styles.campusItemCountry}>🇮🇳 India Head Office (Ludhiana Campus)</Text>
                <Text style={styles.campusItemAddress}>
                  {FlymediaContact.address}
                </Text>
                <View style={styles.campusItemRow}>
                  <Clock size={12} color={Colors.textMuted} />
                  <Text style={styles.campusItemMeta}>Mon - Sat: 9:00 AM - 7:00 PM</Text>
                </View>
              </View>

              <View style={styles.campusDivider} />

              <View style={styles.campusItem}>
                <Text style={styles.campusItemCountry}>🇦🇺 Australia Branch</Text>
                <Text style={styles.campusItemAddress}>
                  35 Edgewood Dr, Stanhope Gardens NSW 2768, Australia
                </Text>
              </View>

              <View style={styles.campusDivider} />

              <View style={styles.campusItem}>
                <Text style={styles.campusItemCountry}>🇨🇦 Canada Branch</Text>
                <Text style={styles.campusItemAddress}>
                  7664 126a St, Surrey, BC V3W 4A9, Canada
                </Text>
              </View>
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  sheetHeaderBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryRose,
    letterSpacing: 0.5,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  scrollArea: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: 20,
  },
  quickContactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  quickContactCard: {
    width: '48.5%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickContactIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  quickContactLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  quickContactValue: {
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 2,
  },
  formContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  formSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  requiredStar: {
    color: Colors.primaryRose,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13.5,
    color: Colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 10,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdownTriggerText: {
    fontSize: 13,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
  },
  dropdownList: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
    ...Shadows.small,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownItemActive: {
    backgroundColor: '#FFF1F2',
  },
  dropdownItemText: {
    fontSize: 12.5,
    color: Colors.textPrimary,
  },
  dropdownItemTextActive: {
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primaryRose,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 8,
    ...Shadows.small,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontWeight: '800',
  },
  successBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  successIconWrap: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#15803D',
    marginBottom: 6,
  },
  successText: {
    fontSize: 13,
    color: '#166534',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  doneBtn: {
    backgroundColor: '#16A34A',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  campusesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  campusesCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  campusesCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  campusItem: {
    paddingVertical: 4,
  },
  campusItemCountry: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  campusItemAddress: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  campusItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  campusItemMeta: {
    fontSize: 10.5,
    color: Colors.textMuted,
  },
  campusDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
});
