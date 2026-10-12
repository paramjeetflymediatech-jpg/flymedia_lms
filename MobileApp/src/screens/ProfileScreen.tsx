import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { Header } from '../components/common/Header';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  LogOut,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  ArrowRight,
} from 'lucide-react-native';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, login, register, logout } = useAuth();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Required', 'Please enter email and password.');
      return;
    }

    setLoading(true);
    let res;
    if (isLoginTab) {
      res = await login(email, password);
    } else {
      if (!name) {
        Alert.alert('Required', 'Please enter your name.');
        setLoading(false);
        return;
      }
      res = await register(name, email, password);
    }
    setLoading(false);

    if (!res.success) {
      Alert.alert('Authentication Error', res.error || 'Please try again.');
    } else {
      setEmail('');
      setPassword('');
      setName('');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Log Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.screen}>
      <Header subtitle="Account & Campus Info" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {user ? (
          /* LOGGED IN USER PROFILE */
          <View>
            <View style={styles.profileCard}>
              <View style={styles.avatarWrap}>
                <Text style={styles.avatarLetter}>
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </Text>
              </View>

              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>

              <View style={styles.roleBadge}>
                <ShieldCheck size={14} color={Colors.primaryOrange} />
                <Text style={styles.roleText}>{user.role} ACCOUNT</Text>
              </View>
            </View>

            {/* ADMIN CONTROL PANEL SECTION */}
            {user.role === 'ADMIN' && (
              <View style={styles.adminHubCard}>
                <View style={styles.adminHubHeader}>
                  <View style={styles.adminIconCircle}>
                    <ShieldCheck size={20} color={Colors.textWhite} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.adminHubTitle}>Administrator Hub</Text>
                    <Text style={styles.adminHubSub}>
                      Manage student leads, create new courses, and view stats
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.openAdminBtn}
                  onPress={() => navigation.navigate('AdminDashboard')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.openAdminBtnText}>Open Admin Control Center</Text>
                  <ArrowRight size={16} color={Colors.textWhite} />
                </TouchableOpacity>
              </View>
            )}

            {/* CAMPUS & HELPLINE CARD */}
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Flymedia Academy Campus</Text>
              
              <View style={styles.infoRow}>
                <MapPin size={18} color={Colors.primaryOrange} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Campus Address</Text>
                  <Text style={styles.infoVal}>
                    Model Town Extension, Ludhiana, Punjab - 141002
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Phone size={18} color={Colors.primaryOrange} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Official Helpline</Text>
                  <Text style={styles.infoVal}>+91 78144 08934 / +91 87279 09176</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Mail size={18} color={Colors.primaryOrange} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Admissions Email</Text>
                  <Text style={styles.infoVal}>admissions@flymediatech.com</Text>
                </View>
              </View>
            </View>

            {/* LOGOUT BUTTON */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LogOut size={16} color={Colors.error} />
              <Text style={styles.logoutBtnText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* AUTH LOGIN / REGISTER FORMS */
          <View style={styles.authContainer}>
            <View style={styles.authTabs}>
              <TouchableOpacity
                style={[styles.authTab, isLoginTab && styles.authTabActive]}
                onPress={() => setIsLoginTab(true)}
              >
                <Text style={[styles.authTabText, isLoginTab && styles.authTabTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.authTab, !isLoginTab && styles.authTabActive]}
                onPress={() => setIsLoginTab(false)}
              >
                <Text style={[styles.authTabText, !isLoginTab && styles.authTabTextActive]}>
                  Create Account
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.authCard}>
              <Text style={styles.authTitle}>
                {isLoginTab ? 'Welcome to Flymedia LMS' : 'Join Flymedia Academy'}
              </Text>
              <Text style={styles.authSub}>
                {isLoginTab
                  ? 'Access your classes, projects, and live mentor sessions'
                  : 'Get started with top-tier practical software programs'}
              </Text>

              {!isLoginTab && (
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <TextInput
                    style={styles.fieldInput}
                    placeholder="e.g. Navjot Singh"
                    placeholderTextColor={Colors.textLight}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              )}

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Email Address</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="student@example.com"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>Password</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textLight}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <TouchableOpacity
                style={styles.authSubmitBtn}
                onPress={handleAuthSubmit}
                disabled={loading}
              >
                <Text style={styles.authSubmitBtnText}>
                  {loading ? 'Please wait...' : isLoginTab ? 'Sign In to Portal' : 'Register Now'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
    marginBottom: 20,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primaryOrange,
    marginBottom: 12,
  },
  avatarLetter: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primaryOrange,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.orangeLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryOrange,
    letterSpacing: 0.5,
  },
  infoSection: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 16,
    marginBottom: 20,
  },
  adminHubCard: {
    backgroundColor: Colors.darkSurface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    ...Shadows.small,
  },
  adminHubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  adminIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminHubTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textWhite,
    marginBottom: 2,
  },
  adminHubSub: {
    fontSize: 12,
    color: '#94a3b8',
    lineHeight: 16,
  },
  openAdminBtn: {
    backgroundColor: Colors.primaryOrange,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  openAdminBtnText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  logoutBtnText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '700',
  },
  authContainer: {
    marginTop: 10,
  },
  authTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  authTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  authTabActive: {
    backgroundColor: Colors.surface,
    ...Shadows.small,
  },
  authTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  authTabTextActive: {
    color: Colors.primaryOrange,
  },
  authCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  authSub: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
    marginBottom: 18,
  },
  fieldWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  fieldInput: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  authSubmitBtn: {
    backgroundColor: Colors.primaryOrange,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
    ...Shadows.orange,
  },
  authSubmitBtnText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '800',
  },
});
