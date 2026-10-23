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
import { Colors } from '../../theme/colors';
import { PhoneCall, ArrowLeft } from 'lucide-react-native';
import { FlymediaContact } from '../../constants/contact';

export interface HeaderProps {
  onCallPress?: () => void;
  showHelpButton?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  subtitle?: string;
  title?: string;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  onCallPress,
  showHelpButton = true,
  showBackButton = false,
  onBackPress,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 16);

  const handleHelpPress = () => {
    if (onCallPress) {
      onCallPress();
    } else {
      Linking.openURL(`tel:${FlymediaContact.phoneRaw}`).catch(() => {});
    }
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding + 6 }]}>
      <View style={styles.headerRow}>
        {/* Left Side: Optional Back Button + Brand Logo */}
        <View style={styles.brandGroup}>
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

        {/* Right Side: Unified Help Pill Button */}
        {rightAction ? (
          rightAction
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
