import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../theme/colors';
import { Phone } from 'lucide-react-native';

interface HeaderProps {
  onCallPress?: () => void;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ onCallPress, subtitle }) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 16);

  return (
    <View style={[styles.container, { paddingTop: topPadding + 6 }]}>
      <View style={styles.brandRow}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoLetter}>F</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.brandTitle}>
            FLYMEDIA <Text style={styles.brandAccent}>ACADEMY</Text>
          </Text>
          <Text style={styles.brandSubtitle}>
            {subtitle || 'Industry-Ready Tech Training'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.callButton}
        onPress={onCallPress}
        activeOpacity={0.8}
      >
        <Phone size={14} color={Colors.textWhite} />
        <Text style={styles.callButtonText}>Help</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.primaryOrange,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    shadowColor: Colors.primaryOrange,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  logoLetter: {
    color: Colors.textWhite,
    fontSize: 22,
    fontWeight: '900',
  },
  titleContainer: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: 0.5,
  },
  brandAccent: {
    color: Colors.primaryOrange,
  },
  brandSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryOrange,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
  },
  callButtonText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
});
