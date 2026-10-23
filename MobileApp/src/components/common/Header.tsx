import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../../theme/colors';
import { PhoneCall, ArrowLeft, Menu } from 'lucide-react-native';
import { FlymediaContact } from '../../constants/contact';
import { useAuth } from '../../context/AuthContext';
import { formatImageUrl } from '../../utils/imageUrl';

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
  const { user } = useAuth();
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 16);

  const handleHelpPress = () => {
    if (onCallPress) {
      onCallPress();
    } else {
      Linking.openURL(`tel:${FlymediaContact.phoneRaw}`).catch(() => {});
    }
  };

  const handleProfilePress = () => {
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
            onPress={handleProfilePress}
            activeOpacity={0.8}
            accessibilityLabel="Student Profile"
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
            <Text style={styles.callButtonText}>Help</Text>
          </TouchableOpacity>
        ) : null}
      </View>
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
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarWrap: {
    position: 'relative',
    width: 38,
    height: 38,
    borderRadius: 19,
    shadowColor: Colors.primaryRose,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF1F2',
    borderWidth: 2,
    borderColor: '#FECDD3',
  },
  profileInitialWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF1F2',
    borderWidth: 2,
    borderColor: '#FECDD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitialText: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.primaryRose,
  },
  profileOnlineDot: {
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
});
