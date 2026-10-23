import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { PhoneCall, ArrowLeft, Menu } from 'lucide-react-native';

export interface HeaderProps {
  onCallPress?: () => void;
  subtitle?: string;
  showHelpButton?: boolean;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showMenuButton?: boolean;
  onMenuPress?: () => void;
  title?: string;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  onCallPress,
  subtitle,
  showHelpButton = true,
  showBackButton = false,
  onBackPress,
  showMenuButton = false,
  onMenuPress,
  title,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 16);

  return (
    <View style={[styles.container, { paddingTop: topPadding + 6 }]}>
      {showBackButton ? (
        <View style={styles.navRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={19} color={Colors.textPrimary} strokeWidth={2.2} />
          </TouchableOpacity>

          <View style={styles.navCenter}>
            {title ? (
              <View style={styles.titleWrapper}>
                <Text style={styles.navTitle} numberOfLines={1}>
                  {title}
                </Text>
                {subtitle && (
                  <Text style={styles.navSubtitle} numberOfLines={1}>
                    {subtitle}
                  </Text>
                )}
              </View>
            ) : (
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImageNav}
                resizeMode="contain"
              />
            )}
          </View>

          <View style={styles.navRight}>
            {rightAction ? (
              rightAction
            ) : showHelpButton && onCallPress ? (
              <TouchableOpacity
                style={styles.callButton}
                onPress={onCallPress}
                activeOpacity={0.82}
              >
                <View style={styles.callIconPulse}>
                  <PhoneCall size={12} color={Colors.textWhite} />
                </View>
                <Text style={styles.callButtonText}>Help</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.placeholderBox} />
            )}
          </View>
        </View>
      ) : (
        <View style={styles.standardRow}>
          <View style={styles.brandRow}>
            {showMenuButton && (
              <TouchableOpacity
                style={styles.menuButton}
                onPress={onMenuPress}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Menu size={20} color={Colors.textPrimary} strokeWidth={2.2} />
              </TouchableOpacity>
            )}
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            {subtitle && (
              <View style={styles.subtitleBadge}>
                <Text style={styles.subtitleText} numberOfLines={1}>
                  {subtitle}
                </Text>
              </View>
            )}
          </View>

          {rightAction ? (
            rightAction
          ) : showHelpButton && onCallPress ? (
            <TouchableOpacity
              style={styles.callButton}
              onPress={onCallPress}
              activeOpacity={0.82}
            >
              <View style={styles.callIconPulse}>
                <PhoneCall size={12} color={Colors.textWhite} />
              </View>
              <Text style={styles.callButtonText}>Help</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
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
  standardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  navCenter: {
    flex: 1,
    marginHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  navSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 1,
    textAlign: 'center',
  },
  logoImageNav: {
    width: 130,
    height: 28,
  },
  navRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 38,
  },
  placeholderBox: {
    width: 38,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    paddingRight: 8,
  },
  logoImage: {
    width: 142,
    height: 32,
  },
  subtitleBadge: {
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(230, 8, 112, 0.25)',
    maxWidth: 140,
  },
  subtitleText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryRose,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
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
