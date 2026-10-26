import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Linking,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import {
  PhoneCall,
  ArrowLeft,
  Menu,
  User as UserIcon,
  LogOut,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Gift,
  Sparkles,
} from 'lucide-react-native';
import { FlymediaContact } from '../../constants/contact';
import { useAuth } from '../../context/AuthContext';
import { formatImageUrl } from '../../utils/imageUrl';
import { ReferralModal } from './ReferralModal';

export interface HeaderProps {
  onCallPress?: () => void;
  showHelpButton?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showMenuButton?: boolean;
  onMenuPress?: () => void;
  subtitle?: string;
  title?: string;
  rightAction?: React.ReactNode;
  showProfileButton?: boolean;
  onProfilePress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onCallPress,
  showHelpButton = true,
  showBackButton = false,
  onBackPress,
  showMenuButton = false,
  onMenuPress,
  rightAction,
  showProfileButton = true,
  onProfilePress,
}) => {
  const insets = useSafeAreaInsets();
  let navigation: any = null;
  try {
    navigation = useNavigation();
  } catch {
    navigation = null;
  }
  const { user, logout } = useAuth();
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [referralModalVisible, setReferralModalVisible] = useState(false);
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 16);

  const handleHelpPress = () => {
    if (onCallPress) {
      onCallPress();
    } else {
      Linking.openURL(`tel:${FlymediaContact.phoneRaw}`).catch(() => {});
    }
  };

  const handleNavigateToProfile = () => {
    setProfileMenuVisible(false);
    if (onProfilePress) {
      onProfilePress();
      return;
    }
    if (navigation) {
      try {
        navigation.navigate('ProfileTab');
      } catch {
        try {
          navigation.navigate('Main', { screen: 'ProfileTab' });
        } catch {
          // navigation fallback
        }
      }
    }
  };

  const handleSignOut = () => {
    setProfileMenuVisible(false);
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (err) {
              console.error('Logout error:', err);
            }
          },
        },
      ]
    );
  };

  const displayName = (() => {
    if (!user?.name) return 'Student';
    if (user.name.includes('@')) {
      const part = user.name.split('@')[0];
      return part.charAt(0).toUpperCase() + part.slice(1);
    }
    return user.name;
  })();

  return (
    <View style={[styles.container, { paddingTop: topPadding + 6 }]}>
      <View style={styles.headerRow}>
        {/* Left Side: Optional Menu Button + Optional Back Button + Brand Logo */}
        <View style={styles.brandGroup}>
          {showMenuButton && (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={onMenuPress}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Open navigation menu"
            >
              <Menu size={20} color={Colors.textPrimary} strokeWidth={2.4} />
            </TouchableOpacity>
          )}

          {showBackButton && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBackPress}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={20} color={Colors.textPrimary} strokeWidth={2.4} />
            </TouchableOpacity>
          )}

          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Right Side: Custom action, or Student Profile Avatar, or Help Pill Button */}
        {rightAction ? (
          rightAction
        ) : showProfileButton && user ? (
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => setProfileMenuVisible(true)}
            activeOpacity={0.8}
            accessibilityLabel="Student Profile Menu"
          >
            <View style={styles.profileAvatarWrap}>
              {user.avatar ? (
                <Image
                  source={{
                    uri: user.avatar.startsWith('data:')
                      ? user.avatar
                      : formatImageUrl(user.avatar),
                  }}
                  style={styles.profileAvatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.profileInitialWrap}>
                  <Text style={styles.profileInitialText}>
                    {displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.profileOnlineDot} />
            </View>
            <ChevronDown size={13} color="#64748B" style={styles.headerChevron} />
          </TouchableOpacity>
        ) : showHelpButton ? (
          <TouchableOpacity
            style={styles.callButton}
            onPress={handleHelpPress}
            activeOpacity={0.82}
            accessibilityLabel="Help and counselor support"
          >
            <View style={styles.callIconPulse}>
              <PhoneCall size={12} color={Colors.textWhite} />
            </View>
            <Text style={styles.callButtonText}>Book Demo</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* FLOATING PROFILE MENU MODAL WITH 2 BUTTONS: PROFILE SCREEN & SIGN OUT */}
      {user && (
        <Modal
          visible={profileMenuVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setProfileMenuVisible(false)}
        >
          <TouchableOpacity
            style={[styles.modalBackdrop, { paddingTop: topPadding + 46 }]}
            activeOpacity={1}
            onPress={() => setProfileMenuVisible(false)}
          >
            <View
              style={styles.profileMenuCard}
              onStartShouldSetResponder={() => true}
            >
              {/* User Identity Mini Card */}
              <View style={styles.menuUserInfo}>
                <View style={styles.menuAvatarWrap}>
                  {user.avatar ? (
                    <Image
                      source={{
                        uri: user.avatar.startsWith('data:')
                          ? user.avatar
                          : formatImageUrl(user.avatar),
                      }}
                      style={styles.menuAvatar}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.menuAvatarInitial}>
                      <Text style={styles.menuAvatarInitialText}>
                        {displayName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.menuOnlineDot} />
                </View>

                <View style={styles.menuUserMeta}>
                  <Text style={styles.menuUserName} numberOfLines={1}>
                    {displayName}
                  </Text>
                  <Text style={styles.menuUserEmail} numberOfLines={1}>
                    {user.email || 'student@flymediatech.com'}
                  </Text>
                  <View style={styles.menuRoleBadge}>
                    <ShieldCheck size={10} color={Colors.primaryRose} />
                    <Text style={styles.menuRoleBadgeText}>
                      {user.role === 'ADMIN'
                        ? 'ADMINISTRATOR'
                        : user.role === 'TUTOR'
                        ? 'INSTRUCTOR'
                        : 'STUDENT ACCOUNT'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.menuDivider} />

              {/* TWO REQUESTED BUTTONS */}
              <View style={styles.menuButtonsGroup}>
                {/* BUTTON 1: REDIRECT TO PROFILE SCREEN */}
                <TouchableOpacity
                  style={styles.menuActionBtn}
                  onPress={handleNavigateToProfile}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuActionIconWrap, { backgroundColor: '#FFF1F2' }]}>
                    <UserIcon size={16} color={Colors.primaryRose} strokeWidth={2.4} />
                  </View>
                  <View style={styles.menuActionContent}>
                    <Text style={styles.menuActionTitle}>Profile Screen</Text>
                    <Text style={styles.menuActionSub}>Redirect to profile</Text>
                  </View>
                  <ChevronRight size={16} color="#94A3B8" />
                </TouchableOpacity>

                {/* BUTTON 2: REFER & EARN (FREE ₹99 DEMO) */}
                <TouchableOpacity
                  style={styles.menuActionBtn}
                  onPress={() => {
                    setProfileMenuVisible(false);
                    setReferralModalVisible(true);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuActionIconWrap, { backgroundColor: '#FEF3C7' }]}>
                    <Gift size={16} color="#D97706" strokeWidth={2.4} />
                  </View>
                  <View style={styles.menuActionContent}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.menuActionTitle}>Refer & Earn</Text>
                      <View style={{ backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 }}>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: Colors.primaryRose }}>FREE ₹99</Text>
                      </View>
                    </View>
                    <Text style={styles.menuActionSub}>Invite friend & get free demo</Text>
                  </View>
                  <ChevronRight size={16} color="#94A3B8" />
                </TouchableOpacity>

                {/* BUTTON 3: SIGN OUT */}
                <TouchableOpacity
                  style={[styles.menuActionBtn, styles.menuSignOutBtn]}
                  onPress={handleSignOut}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuActionIconWrap, { backgroundColor: '#FEE2E2' }]}>
                    <LogOut size={16} color="#DC2626" strokeWidth={2.4} />
                  </View>
                  <View style={styles.menuActionContent}>
                    <Text style={[styles.menuActionTitle, { color: '#DC2626' }]}>Sign Out</Text>
                    <Text style={styles.menuActionSub}>Log out of account</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {/* REFER & EARN MODAL */}
      <ReferralModal
        visible={referralModalVisible}
        onClose={() => setReferralModalVisible(false)}
        onRedeemFreeDemo={onCallPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
    zIndex: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  brandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 142,
    height: 32,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingLeft: 3,
    paddingRight: 6,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerChevron: {
    marginLeft: 1,
  },
  profileAvatarWrap: {
    position: 'relative',
    width: 34,
    height: 34,
    borderRadius: 17,
    shadowColor: Colors.primaryRose,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF1F2',
    borderWidth: 2,
    borderColor: '#FECDD3',
  },
  profileInitialWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFF1F2',
    borderWidth: 2,
    borderColor: '#FECDD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitialText: {
    fontSize: 15,
    fontWeight: '900',
    color: Colors.primaryRose,
  },
  profileOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryRose,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    shadowColor: Colors.primaryRose,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  callIconPulse: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButtonText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  /* MODAL DROPDOWN STYLES */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingRight: 16,
  },
  profileMenuCard: {
    width: 260,
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 16,
  },
  menuUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 4,
  },
  menuAvatarWrap: {
    position: 'relative',
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  menuAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF1F2',
    borderWidth: 2,
    borderColor: '#FECDD3',
  },
  menuAvatarInitial: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF1F2',
    borderWidth: 2,
    borderColor: '#FECDD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuAvatarInitialText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primaryRose,
  },
  menuOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  menuUserMeta: {
    flex: 1,
  },
  menuUserName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  menuUserEmail: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
  menuRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  menuRoleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryRose,
    letterSpacing: 0.3,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  menuButtonsGroup: {
    gap: 8,
  },
  menuActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    gap: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuSignOutBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  menuActionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuActionContent: {
    flex: 1,
  },
  menuActionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuActionSub: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 1,
  },
});

