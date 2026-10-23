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
  Image,
  PermissionsAndroid,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { formatImageUrl } from '../../utils/imageUrl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../../theme/colors';
import { User } from '../../types';
import {
  X,
  User as UserIcon,
  Phone,
  Mail,
  ShieldCheck,
  Camera,
  Check,
  Pencil,
  Lock,
  Sparkles,
} from 'lucide-react-native';

interface AdminEditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: User;
  onSave: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

export const AdminEditProfileModal: React.FC<AdminEditProfileModalProps> = ({
  visible,
  onClose,
  user,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16);

  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [bio, setBio] = useState(user.bio || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar || null);
  const [newAvatarBase64, setNewAvatarBase64] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setAvatarPreview(user.avatar || null);
      setNewAvatarBase64(null);
    }
  }, [visible, user]);

  const handlePickAvatar = () => {
    Alert.alert(
      'Update Profile Photo',
      'Choose how you want to update your administrator picture',
      [
        {
          text: 'Take Photo',
          onPress: () => pickImage('camera'),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => pickImage('gallery'),
        },
        ...(avatarPreview
          ? [
              {
                text: 'Remove Photo',
                style: 'destructive' as const,
                onPress: () => {
                  setAvatarPreview(null);
                  setNewAvatarBase64('');
                },
              },
            ]
          : []),
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      if (Platform.OS === 'android' && source === 'camera') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Access Needed',
            message: 'App requires camera permission to capture your profile photo.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Camera permission is required to capture photo.');
          return;
        }
      }

      const options = {
        mediaType: 'photo' as const,
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.8 as const,
        includeBase64: true,
      };

      const res =
        source === 'camera'
          ? await launchCamera(options)
          : await launchImageLibrary(options);

      if (res.didCancel) return;
      if (res.errorCode) {
        if (res.errorCode === 'camera_unavailable') {
          Alert.alert('Camera Unavailable', 'Camera not detected. Please select from Gallery.');
        } else {
          Alert.alert('Error', res.errorMessage || 'Failed to select image.');
        }
        return;
      }

      const asset = res.assets?.[0];
      if (!asset?.base64) {
        Alert.alert('Error', 'Could not read the selected image.');
        return;
      }

      const dataUrl = `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`;
      setAvatarPreview(asset.uri || dataUrl);
      setNewAvatarBase64(dataUrl);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to process image');
    }
  };

  const handleSave = async () => {
    const cleanName = name.trim();
    if (!cleanName) {
      Alert.alert('Name Required', 'Please enter your administrator name.');
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<User> = {
        name: cleanName,
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
      };

      if (newAvatarBase64 !== null) {
        payload.avatar = newAvatarBase64;
      }

      const result = await onSave(payload);
      setSaving(false);

      if (result.success) {
        Alert.alert('Profile Saved 🎉', 'Administrator profile details updated successfully.');
        onClose();
      } else {
        Alert.alert('Update Failed', result.error || 'Could not update admin profile.');
      }
    } catch (err: any) {
      setSaving(false);
      Alert.alert('Error', err.message || 'Network error updating profile.');
    }
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
        style={styles.modalOverlay}
      >
        <View style={styles.modalCard}>
          {/* Top Decorative Accent Strip */}
          <View style={styles.topAccentStrip} />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.modalTitle}>Edit Admin Profile</Text>
                <View style={styles.adminPill}>
                  <ShieldCheck size={11} color={Colors.primaryRose} />
                  <Text style={styles.adminPillText}>ADMIN</Text>
                </View>
              </View>
              <Text style={styles.modalSub}>
                Update your administrator photo, name, and contact details
              </Text>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
            >
              <X size={18} color={Colors.textSecondary} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.formContent, { paddingBottom: bottomPadding + 20 }]}
          >
            {/* AVATAR PHOTO PICKER SECTION */}
            <View style={styles.avatarSection}>
              <TouchableOpacity
                style={styles.avatarWrap}
                onPress={handlePickAvatar}
                activeOpacity={0.85}
              >
                {avatarPreview ? (
                  <Image
                    source={{ uri: avatarPreview.startsWith('data:') ? avatarPreview : formatImageUrl(avatarPreview) }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarFallbackText}>
                      {name ? name.charAt(0).toUpperCase() : 'A'}
                    </Text>
                  </View>
                )}

                {/* Camera Overlay Icon Badge */}
                <View style={styles.cameraIconBadge}>
                  <Camera size={14} color="#ffffff" strokeWidth={2.4} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.changePhotoBtn}
                onPress={handlePickAvatar}
                activeOpacity={0.75}
              >
                <Pencil size={12} color={Colors.primaryRose} />
                <Text style={styles.changePhotoBtnText}>
                  {avatarPreview ? 'Change Photo' : 'Upload Admin Photo'}
                </Text>
              </TouchableOpacity>
              <Text style={styles.photoHintText}>
                JPG, PNG or WEBP up to 5MB
              </Text>
            </View>

            {/* FIELD 1: FULL NAME */}
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputBox}>
                <UserIcon size={16} color={Colors.primaryRose} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Paramjeet Singh"
                  placeholderTextColor={Colors.textLight}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            {/* FIELD 2: PHONE NUMBER */}
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Phone / WhatsApp Number</Text>
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

            {/* FIELD 3: EMAIL (READ ONLY) */}
            <View style={styles.fieldGroup}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={styles.inputLabel}>Admin Email</Text>
                <View style={styles.readOnlyBadge}>
                  <Lock size={10} color={Colors.textMuted} />
                  <Text style={styles.readOnlyBadgeText}>Account ID</Text>
                </View>
              </View>
              <View style={[styles.inputBox, styles.inputBoxDisabled]}>
                <Mail size={16} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { color: Colors.textSecondary }]}
                  value={user.email}
                  editable={false}
                />
              </View>
            </View>

            {/* FIELD 4: ROLE / BIO */}
            <View style={styles.fieldGroup}>
              <Text style={styles.inputLabel}>Role & Designation</Text>
              <View style={styles.inputBox}>
                <ShieldCheck size={16} color={Colors.primaryRose} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Master Administrator & Director"
                  placeholderTextColor={Colors.textLight}
                  value={bio}
                  onChangeText={setBio}
                />
              </View>
            </View>

            {/* ACTION BUTTONS */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.7}
                disabled={saving}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <View style={styles.btnRow}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.saveBtnText}>Saving Profile...</Text>
                  </View>
                ) : (
                  <View style={styles.btnRow}>
                    <Check size={16} color="#ffffff" strokeWidth={2.4} />
                    <Text style={styles.saveBtnText}>Save Profile</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '92%',
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.medium,
  },
  topAccentStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.primaryRose,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: 11.5,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  adminPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  adminPillText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: Colors.primaryRose,
    letterSpacing: 0.4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  /* Avatar Section */
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrap: {
    position: 'relative',
    width: 88,
    height: 88,
    borderRadius: 44,
    ...Shadows.small,
    marginBottom: 10,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2.5,
    borderColor: '#FECDD3',
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFF1F2',
    borderWidth: 2.5,
    borderColor: '#FECDD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 34,
    fontWeight: '900',
    color: Colors.primaryRose,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primaryRose,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  changePhotoBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  photoHintText: {
    fontSize: 10.5,
    color: Colors.textMuted,
    marginTop: 4,
  },

  /* Form Fields */
  fieldGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  inputBoxDisabled: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  inputIcon: {
    marginRight: 8,
  },
  countryCodeBadge: {
    paddingRight: 8,
    marginRight: 6,
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  readOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  readOnlyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },

  /* Action Buttons */
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  saveBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primaryRose,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  saveBtnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
