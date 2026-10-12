import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import { X, CheckCircle, PhoneCall } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <X size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          {submitted ? (
            <View style={styles.successContainer}>
              <CheckCircle size={54} color={Colors.success} />
              <Text style={styles.successTitle}>Request Submitted!</Text>
              <Text style={styles.successText}>
                Our senior career counselor will call you within 15 minutes to discuss batches & scholarships.
              </Text>
            </View>
          ) : (
            <View>
              <View style={styles.headerIconWrap}>
                <PhoneCall size={26} color={Colors.primaryOrange} />
              </View>
              <Text style={styles.title}>Book Free Counseling</Text>
              <Text style={styles.subtitle}>
                Get syllabus details, demo class access, and batch schedule.
              </Text>

              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Rahul Sharma"
                placeholderTextColor={Colors.textLight}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Mobile Number (WhatsApp)</Text>
              <TextInput
                style={styles.input}
                placeholder="+91 98765 43210"
                placeholderTextColor={Colors.textLight}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={styles.label}>Program of Interest</Text>
              <TextInput
                style={styles.input}
                value={course}
                onChangeText={setCourse}
                placeholder="Course name"
                placeholderTextColor={Colors.textLight}
              />

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Submitting...' : 'Request Instant Callback'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.privacyNote}>
                🔒 100% confidential. No spam calls.
              </Text>
            </View>
          )}
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
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    ...Shadows.medium,
    position: 'relative',
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
    backgroundColor: Colors.primaryOrange,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
    ...Shadows.orange,
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
