import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../../theme/colors';
import { PhoneCall, Sparkles } from 'lucide-react-native';

interface HeaderProps {
  onCallPress?: () => void;
  subtitle?: string;
  showHelpButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onCallPress, subtitle, showHelpButton = true }) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 16);

  return (
    <View style={[styles.container, { paddingTop: topPadding + 6 }]}>
      <View style={styles.brandRow}>
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

      {showHelpButton && onCallPress && (
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    zIndex: 10,
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
