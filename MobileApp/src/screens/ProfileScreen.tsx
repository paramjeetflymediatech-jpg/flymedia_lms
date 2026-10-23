import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  Linking,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { formatImageUrl } from '../utils/imageUrl';
import { Colors, Shadows } from '../theme/colors';
import { Header } from '../components/common/Header';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { useAuth } from '../context/AuthContext';
import { FlymediaContact } from '../constants/contact';
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
  GraduationCap,
  Users,
  Trash2,
  AlertTriangle,
  Pencil,
  BookOpen,
  Sparkles,
  Award,
  Camera,
} from 'lucide-react-native';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, login, register, logout, deleteAccount, updateProfile } = useAuth();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handlePickAvatar = () => {
    Alert.alert(
      'Profile Photo',
      'Choose an option to update your profile photo',
      [
        {
          text: 'Take Photo',
          onPress: () => pickImage('camera'),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => pickImage('gallery'),
        },
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
            title: 'Camera Permission',
            message: 'App needs camera permission to capture your profile picture.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Camera permission is required to take a photo.');
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

      const res = source === 'camera'
        ? await launchCamera(options)
        : await launchImageLibrary(options);

      if (res.didCancel) return;
      if (res.errorCode) {
        if (res.errorCode === 'camera_unavailable') {
          Alert.alert('Camera Unavailable', 'Camera is not available on simulator. Please use "Choose from Gallery" or test on a physical device.');
        } else if (res.errorCode === 'permission') {
          Alert.alert('Permission Denied', 'Please allow photo access in device settings to select a profile picture.');
        } else {
          Alert.alert('Photo Error', res.errorMessage || 'Could not access photos');
        }
        return;
      }

      const asset = res.assets?.[0];
      if (!asset?.base64) {
        Alert.alert('Error', 'Could not read image file');
        return;
      }

      setUploadingAvatar(true);
      const dataUrl = `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`;
      const result = await updateProfile({ avatar: dataUrl });
      setUploadingAvatar(false);

      if (result.success) {
        Alert.alert('Photo Updated ✨', 'Your new profile picture has been updated successfully!');
      } else {
        Alert.alert('Upload Failed', result.error || 'Failed to update profile photo');
      }
    } catch (err: any) {
      setUploadingAvatar(false);
      Alert.alert('Error', err.message || 'Failed to pick image');
    }
  };

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
    const doLogout = async () => {
      try {
        await logout();
      } catch (err) {
        console.error('Logout error:', err);
      }
    };

    if (Platform.OS === 'web') {
      const win = (globalThis as any).window;
      const confirmed =
        win && win.confirm
          ? win.confirm('Are you sure you want to sign out?')
          : true;
      if (confirmed) {
        await doLogout();
      }
      return;
    }

    Alert.alert('Log Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: doLogout },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account & Data',
      'Are you sure you want to permanently delete your account? All your enrolled courses, certificates, and learning progress will be permanently erased.\n\nThis action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            const res = await deleteAccount();
            setDeleting(false);
            if (!res.success) {
              Alert.alert('Error', res.error || 'Failed to delete account. Please try again.');
            } else {
              Alert.alert('Account Deleted', 'Your account and personal data have been permanently removed.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <Header
        subtitle="Account & Campus Info"
        showMenuButton={Boolean(user)}
        onMenuPress={() => setEditModalVisible(true)}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {user ? (
          /* LOGGED IN USER PROFILE */
          <View>
            <View style={styles.profileCard}>
              <TouchableOpacity
                style={styles.avatarWrap}
                activeOpacity={0.82}
                onPress={handlePickAvatar}
              >
                {user.avatar ? (
                  <Image
                    source={{ uri: formatImageUrl(user.avatar) }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.avatarLetter}>
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </Text>
                )}
                {uploadingAvatar && (
                  <View style={styles.avatarLoadingOverlay}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
                <View style={styles.avatarCameraBadge}>
                  <Camera size={13} color="#fff" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.changePhotoBadge}
                activeOpacity={0.75}
                onPress={handlePickAvatar}
              >
                <Camera size={12} color={Colors.primaryOrange} />
                <Text style={styles.changePhotoBadgeText}>
                  {uploadingAvatar ? 'Uploading Photo...' : 'Change Photo'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>

              <View style={styles.roleBadge}>
                <ShieldCheck size={14} color={Colors.primaryOrange} />
                <Text style={styles.roleText}>{user.role} ACCOUNT</Text>
              </View>

              <TouchableOpacity
                style={styles.editProfileBtn}
                onPress={() => setEditModalVisible(true)}
                activeOpacity={0.82}
              >
                <Pencil size={13} color={Colors.textWhite} />
                <Text style={styles.editProfileBtnText}>Edit Academic & Family Profile</Text>
              </TouchableOpacity>
            </View>

            {/* STUDENT ACADEMIC, ADDRESS & FAMILY DOSSIER */}
            <View style={styles.dossierCard}>
              <View style={styles.dossierHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.dossierHeaderIcon}>
                    <GraduationCap size={18} color={Colors.primaryRose} />
                  </View>
                  <View>
                    <Text style={styles.dossierTitle}>Academic & Background Dossier</Text>
                    <Text style={styles.dossierSubtitle}>Education, Residence & Family Details</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.dossierEditLink}
                  onPress={() => setEditModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Pencil size={12} color={Colors.primaryRose} />
                  <Text style={styles.dossierEditLinkText}>Edit</Text>
                </TouchableOpacity>
              </View>

              {/* SECTION 1: EDUCATION */}
              <View style={styles.dossierRow}>
                <View style={[styles.dossierRowIcon, { backgroundColor: '#eff6ff' }]}>
                  <BookOpen size={16} color="#2563eb" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={styles.dossierRowLabel}>Education History</Text>
                    {user.educationDetails?.currentlyStudying ? (
                      <View style={styles.studyBadgeActive}>
                        <Text style={styles.studyBadgeActiveText}>Currently Studying</Text>
                      </View>
                    ) : (
                      <View style={styles.studyBadgeDone}>
                        <Text style={styles.studyBadgeDoneText}>Completed</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.dossierRowVal}>
                    {user.educationDetails?.highestQualification || 'Qualification pending update'}
                  </Text>
                  {user.educationDetails?.collegeOrSchool ? (
                    <Text style={styles.dossierRowSub}>
                      {user.educationDetails.collegeOrSchool}
                      {user.educationDetails.passingYear ? ` • Class of ${user.educationDetails.passingYear}` : ''}
                      {user.educationDetails.percentageOrCgpa ? ` (${user.educationDetails.percentageOrCgpa})` : ''}
                    </Text>
                  ) : null}
                  {user.educationDetails?.currentlyStudying && user.educationDetails?.currentCourse ? (
                    <Text style={styles.currentStudySub}>
                      Pursuing: {user.educationDetails.currentCourse} {user.educationDetails.currentInstitution ? `@ ${user.educationDetails.currentInstitution}` : ''}
                    </Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.dossierDivider} />

              {/* SECTION 2: RESIDENTIAL ADDRESS */}
              <View style={styles.dossierRow}>
                <View style={[styles.dossierRowIcon, { backgroundColor: '#f0fdf4' }]}>
                  <MapPin size={16} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.dossierRowLabel}>Address & Location</Text>
                  <Text style={styles.dossierRowVal}>
                    {user.addressDetails?.city
                      ? `${user.addressDetails.city}, ${user.addressDetails.state || ''} ${user.addressDetails.pincode ? `• PIN ${user.addressDetails.pincode}` : ''}`
                      : 'Address not added yet'}
                  </Text>
                  {user.addressDetails?.addressLine ? (
                    <Text style={styles.dossierRowSub}>{user.addressDetails.addressLine}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.dossierDivider} />

              {/* SECTION 3: FAMILY & CATEGORY */}
              <View style={styles.dossierRow}>
                <View style={[styles.dossierRowIcon, { backgroundColor: '#fff7ed' }]}>
                  <Users size={16} color={Colors.primaryOrange} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={styles.dossierRowLabel}>Family & Social Category</Text>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>
                        {user.studentCategory || 'GENERAL'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.dossierRowVal}>
                    {user.familyDetails?.fatherName
                      ? `Father: ${user.familyDetails.fatherName}${user.familyDetails.familyOccupation ? ` (${user.familyDetails.familyOccupation})` : ''}`
                      : 'Father/Guardian info pending'}
                  </Text>
                  {user.familyDetails?.motherName ? (
                    <Text style={styles.dossierRowSub}>Mother: {user.familyDetails.motherName}</Text>
                  ) : null}
                  {user.familyDetails?.guardianPhone || user.phone ? (
                    <Text style={styles.dossierRowSub}>
                      Emergency / Guardian Contact: {user.familyDetails?.guardianPhone || user.phone}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

            {/* STUDENT LEARNING PANEL SECTION */}
            {user.role === 'STUDENT' && (
              <View style={styles.studentHubCard}>
                <View style={styles.hubHeader}>
                  <View style={[styles.hubIconCircle, { backgroundColor: '#ea580c' }]}>
                    <GraduationCap size={20} color={Colors.textWhite} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.hubTitle}>Student Learning Panel</Text>
                    <Text style={styles.hubSub}>
                      Access enrolled packages, view live batch classes, and book 1-on-1 sessions
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.openHubBtn, { backgroundColor: '#ea580c' }]}
                  onPress={() => navigation.navigate('StudentPanel')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.openHubBtnText}>Open Student Dashboard & Sessions</Text>
                  <ArrowRight size={16} color={Colors.textWhite} />
                </TouchableOpacity>
              </View>
            )}

            {/* TUTOR MANAGEMENT PANEL SECTION */}
            {user.role === 'TUTOR' && (
              <View style={styles.tutorHubCard}>
                <View style={styles.hubHeader}>
                  <View style={[styles.hubIconCircle, { backgroundColor: '#2563eb' }]}>
                    <Users size={20} color={Colors.textWhite} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.hubTitle}>Tutor Management Panel</Text>
                    <Text style={styles.hubSub}>
                      Manage class schedules, set 1-on-1 availability slots, launch meetings, and view students
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.openHubBtn, { backgroundColor: '#2563eb' }]}
                  onPress={() => navigation.navigate('TutorPanel')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.openHubBtnText}>Open Tutor Control Center</Text>
                  <ArrowRight size={16} color={Colors.textWhite} />
                </TouchableOpacity>
              </View>
            )}

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

            {/* LOGOUT BUTTON */}
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <LogOut size={16} color={Colors.error} />
              <Text style={styles.logoutBtnText}>Sign Out</Text>
            </TouchableOpacity>

            {/* DANGER ZONE: DELETE ACCOUNT (Google Play Policy Compliance) */}
            <View style={styles.dangerZoneCard}>
              <View style={styles.dangerZoneHeader}>
                <AlertTriangle size={16} color={Colors.error} />
                <Text style={styles.dangerZoneTitle}>Account & Data Deletion</Text>
              </View>
              <Text style={styles.dangerZoneDesc}>
                In compliance with data privacy and security standards, you can permanently erase your account, enrolled packages, and certificates.
              </Text>
              <TouchableOpacity
                style={styles.deleteAccountBtn}
                onPress={handleDeleteAccount}
                activeOpacity={0.8}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color={Colors.error} />
                ) : (
                  <>
                    <Trash2 size={15} color={Colors.error} />
                    <Text style={styles.deleteAccountBtnText}>Permanently Delete Account</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
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
              <View style={styles.authLogoWrap}>
                <Image
                  source={require('../assets/logo.png')}
                  style={styles.authLogo}
                  resizeMode="contain"
                />
              </View>

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

        {/* CAMPUS & HELPLINE CARD */}
        <View style={[styles.infoSection, { marginTop: user ? 0 : 20 }]}>
          <Text style={styles.sectionTitle}>{FlymediaContact.campusName}</Text>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => Linking.openURL(FlymediaContact.googleMapsUrl).catch(() => {})}
            activeOpacity={0.7}
          >
            <MapPin size={18} color={Colors.primaryOrange} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Campus Address (Tap for directions)</Text>
              <Text style={styles.infoVal}>
                {FlymediaContact.address}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => Linking.openURL(`tel:${FlymediaContact.phoneRaw}`).catch(() => {})}
            activeOpacity={0.7}
          >
            <Phone size={18} color={Colors.primaryOrange} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Official Mobile & Helpline (Tap to call)</Text>
              <Text style={[styles.infoVal, { color: Colors.primaryRose, fontWeight: '800' }]}>
                {FlymediaContact.phone}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => Linking.openURL(`mailto:${FlymediaContact.email}`).catch(() => {})}
            activeOpacity={0.7}
          >
            <Mail size={18} color={Colors.primaryOrange} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Admissions Email</Text>
              <Text style={styles.infoVal}>{FlymediaContact.email}</Text>
            </View>
          </TouchableOpacity>

          {/* GOOGLE PLAY PRIVACY & ACCOUNT DELETION WEB LINK */}
          <View style={styles.legalLinksWrap}>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://course.flymediatech.com/delete-account').catch(() => {})}
              activeOpacity={0.7}
            >
              <Text style={styles.legalLinkText}>Request Account Deletion (Web)</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>•</Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://course.flymediatech.com/privacy').catch(() => {})}
              activeOpacity={0.7}
            >
              <Text style={styles.legalLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {user && (
        <EditProfileModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          user={user}
          onSave={updateProfile}
        />
      )}
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: Colors.primaryOrange,
    marginBottom: 8,
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 36,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryOrange,
    borderWidth: 2,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  changePhotoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 14,
    marginBottom: 10,
  },
  changePhotoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryOrange,
  },
  avatarLetter: {
    fontSize: 28,
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
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryRose,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 14,
    shadowColor: Colors.primaryRose,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  editProfileBtnText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  dossierCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    ...Shadows.small,
  },
  dossierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dossierHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fdf2f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dossierTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  dossierSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  dossierEditLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(230, 8, 112, 0.25)',
  },
  dossierEditLinkText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  dossierRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  dossierRowIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  dossierRowLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dossierRowVal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  dossierRowSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  currentStudySub: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '700',
    marginTop: 3,
  },
  dossierDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  studyBadgeActive: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  studyBadgeActiveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  studyBadgeDone: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  studyBadgeDoneText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803d',
  },
  categoryPill: {
    backgroundColor: '#fff7ed',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryOrange,
    letterSpacing: 0.3,
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
  studentHubCard: {
    backgroundColor: '#fff7ed', // orange-50
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#fed7aa', // orange-200
    ...Shadows.small,
  },
  tutorHubCard: {
    backgroundColor: '#eff6ff', // blue-50
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#bfdbfe', // blue-200
    ...Shadows.small,
  },
  hubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  hubIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  hubSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  openHubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  openHubBtnText: {
    color: Colors.textWhite,
    fontSize: 13,
    fontWeight: '800',
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
  dangerZoneCard: {
    marginTop: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 18,
    padding: 16,
    ...Shadows.small,
  },
  dangerZoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  dangerZoneTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991b1b',
  },
  dangerZoneDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 17,
    marginBottom: 14,
  },
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fda4af',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  deleteAccountBtnText: {
    color: '#e11d48',
    fontSize: 13,
    fontWeight: '800',
  },
  legalLinksWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
    flexWrap: 'wrap',
  },
  legalLinkText: {
    fontSize: 12,
    color: Colors.primaryOrange,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  legalDot: {
    color: Colors.textMuted,
    fontSize: 12,
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
    color: Colors.primaryRose,
  },
  authCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.small,
  },
  authLogoWrap: {
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 4,
  },
  authLogo: {
    width: 175,
    height: 40,
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
    backgroundColor: Colors.primaryRose,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
    ...Shadows.brand,
  },
  authSubmitBtnText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '800',
  },
});
