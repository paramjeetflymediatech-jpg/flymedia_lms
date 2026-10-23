import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import { User } from '../../types';
import { formatImageUrl } from '../../utils/imageUrl';
import {
  X,
  Pencil,
  Phone,
  Mail,
  ShieldCheck,
  LogOut,
  Camera,
} from 'lucide-react-native';

interface AdminProfileViewModalProps {
  visible: boolean;
  onClose: () => void;
  user: User | null;
  onEditProfile: () => void;
  onLogout: () => void;
}

export const AdminProfileViewModal: React.FC<AdminProfileViewModalProps> = ({
  visible,
  onClose,
  user,
  onEditProfile,
  onLogout,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalCard}>
          {/* Top Header */}
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.headerBadge}>
                <ShieldCheck size={11} color={Colors.primaryRose} />
                <Text style={styles.headerBadgeText}>MASTER CONTROL</Text>
              </View>
              <Text style={styles.cardTitle}>Admin Profile</Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Profile Avatar & Primary Info */}
          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarWrap}
              onPress={() => {
                onClose();
                onEditProfile();
              }}
              activeOpacity={0.8}
            >
              {user?.avatar ? (
                <Image
                  source={{
                    uri: user.avatar.startsWith('data:')
                      ? user.avatar
                      : formatImageUrl(user.avatar),
                  }}
                  style={styles.avatarImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarInitial}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                  </Text>
                </View>
              )}
              <View style={styles.avatarCameraBadge}>
                <Camera size={12} color="#ffffff" strokeWidth={2.4} />
              </View>
            </TouchableOpacity>

            <Text style={styles.userNameText}>{user?.name || 'Administrator'}</Text>

            <View style={styles.roleTag}>
              <ShieldCheck size={12} color={Colors.primaryRose} />
              <Text style={styles.roleTagText}>VERIFIED ADMINISTRATOR</Text>
            </View>

            <View style={styles.liveStatusRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveStatusText}>System Online • Cloud Synced</Text>
            </View>
          </View>

          {/* Profile Details List */}
          <View style={styles.detailsGroup}>
            <View style={styles.detailItem}>
              <View style={[styles.detailIconWrap, { backgroundColor: '#FFF1F2' }]}>
                <Phone size={15} color={Colors.primaryRose} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Mobile / WhatsApp</Text>
                <Text style={styles.detailVal}>
                  {user?.phone ? user.phone : 'No phone number set'}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={[styles.detailIconWrap, { backgroundColor: '#EFF6FF' }]}>
                <Mail size={15} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Email Address</Text>
                <Text style={styles.detailVal}>{user?.email || 'admin@flymediatech.com'}</Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsGroup}>
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => {
                onClose();
                onEditProfile();
              }}
              activeOpacity={0.85}
            >
              <Pencil size={15} color="#ffffff" />
              <Text style={styles.editProfileBtnText}>Edit Profile & Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={() => {
                onClose();
                onLogout();
              }}
              activeOpacity={0.8}
            >
              <LogOut size={15} color="#DC2626" />
              <Text style={styles.logoutBtnText}>Sign Out of Admin Portal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 25,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  headerBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: Colors.primaryRose,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImg: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: '#FECDD3',
  },
  avatarFallback: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFF1F2',
    borderWidth: 2,
    borderColor: '#FECDD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.primaryRose,
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryRose,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userNameText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  liveStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  liveStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  detailsGroup: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 10.5,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  detailVal: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 1,
  },
  actionsGroup: {
    gap: 8,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primaryRose,
    paddingVertical: 12,
    borderRadius: 14,
    ...Shadows.small,
  },
  editProfileBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 11,
    borderRadius: 14,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '800',
  },
});
