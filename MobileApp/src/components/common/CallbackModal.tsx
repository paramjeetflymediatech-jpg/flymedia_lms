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
} from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import { X, CheckCircle, PhoneCall } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { FlymediaContact } from '../../constants/contact';

interface CallbackModalProps {
  visible: boolean;
  onClose: () => void;
  defaultCourse?: string;
}

export const CallbackModal: React.FC<CallbackModalProps> = ({
  visible,
  onClose,
  defaultCourse,
}) => {
  const { submitCallback } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState(defaultCourse || 'Full Stack MERN Developer');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Required Fields', 'Please enter your name and phone number.');
      return;
    }

    setLoading(true);
    await submitCallback(name, phone, course);
    setLoading(false);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      setName('');
      setPhone('');
      onClose();
    }, 2200);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <X size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            bounces={false}
          >
            {submitted ? (
              <View style={styles.successContainer}>
                <CheckCircle size={54} color={Colors.success} />
                <Text style={styles.successTitle}>Request Submitted!</Text>
                <Text style={styles.successText}>
                  Our senior academic advisor will call you within 15 minutes to schedule your ₹99 demo class for your selected course.
                </Text>
              </View>
            ) : (
              <View>
                <View style={styles.headerIconWrap}>
                  <PhoneCall size={26} color={Colors.primaryRose} />
                </View>

                <View style={styles.offerBadge}>
                  <Text style={styles.offerBadgeText}>⚡ ₹99 ONLY • 1 DEMO CLASS FOR ANY COURSE</Text>
                </View>

                <Text style={styles.title}>Book Demo Class (₹99)</Text>
                <Text style={styles.subtitle}>
                  Experience live 1-on-1 industry training with real code & client projects for just ₹99.
                </Text>

                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor={Colors.textLight}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />

                <Text style={styles.label}>Mobile Number (WhatsApp)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91-97793-24178"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />

                <Text style={styles.label}>Course for Demo Class</Text>
                <TextInput
                  style={styles.input}
                  value={course}
                  onChangeText={setCourse}
                  placeholder="e.g. Full Stack MERN, Digital Marketing..."
                  placeholderTextColor={Colors.textLight}
                />

                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Submitting...' : 'Book Demo Class for ₹99'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.directCallButton}
                  onPress={() => Linking.openURL(`tel:${FlymediaContact.phoneRaw}`).catch(() => {})}
                  activeOpacity={0.8}
                >
                  <PhoneCall size={14} color={Colors.primaryOrange} />
                  <Text style={styles.directCallText}>
                    Or call directly: {FlymediaContact.phone}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.privacyNote}>
                  🔒 100% verified mentors. Batch timing discussed on call.
                </Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: '88%',
    ...Shadows.medium,
    position: 'relative',
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 24,
    paddingTop: 28,
  },
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  offerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(249, 115, 22, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.25)',
    marginBottom: 10,
  },
  offerBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primaryOrange,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 14,
  },
  submitButton: {
    backgroundColor: Colors.primaryRose,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
    ...Shadows.brand,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.textWhite,
    fontSize: 15,
    fontWeight: '800',
  },
  privacyNote: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 10,
  },
  directCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: Colors.orangeLight,
    borderRadius: 12,
  },
  directCallText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryOrange,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
