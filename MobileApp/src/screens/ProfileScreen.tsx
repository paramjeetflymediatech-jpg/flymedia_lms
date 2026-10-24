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
import { CallbackModal } from '../components/common/CallbackModal';
import { ContactUsModal } from '../components/common/ContactUsModal';
import { LegalAndAboutModal, LegalModalType } from '../components/common/LegalAndAboutModal';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { ReferralModal } from '../components/common/ReferralModal';
import { CachedImage } from '../components/common/CachedImage';
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
  MessageSquare,
  FileText,
  Info,
  ChevronRight,
  HelpCircle,
  Building2,
  Gift,
  Zap,
} from 'lucide-react-native';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, login, register, logout, deleteAccount, updateProfile } = useAuth();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [callbackModalVisible, setCallbackModalVisible] = useState(false);
  const [contactModalVisible, setContactModalVisible] = useState(false);
  const [legalModalVisible, setLegalModalVisible] = useState(false);
  const [legalModalType, setLegalModalType] = useState<LegalModalType>('about');
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralModalVisible, setReferralModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const openLegalModal = (type: LegalModalType) => {
    setLegalModalType(type);
    setLegalModalVisible(true);
  };

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
      res = await register(name, email, password, referralCode);
    }
    setLoading(false);

    if (!res.success) {
      Alert.alert('Authentication Error', res.error || 'Please try again.');
    } else {
      setEmail('');
      setPassword('');
      setName('');
      setReferralCode('');
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
        onCallPress={() => setCallbackModalVisible(true)}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {user ? (
          /* LOGGED IN USER PROFILE */
          <View>
            {/* ELEVATED STUDENT IDENTITY HERO CARD */}
            <View style={styles.profileHeroCard}>
              <View style={styles.profileHeroTop}>
                <TouchableOpacity
                  style={styles.heroAvatarWrap}
                  activeOpacity={0.85}
                  onPress={handlePickAvatar}
                >
                  {user.avatar ? (
                    <CachedImage
                      uri={user.avatar}
                      style={styles.heroAvatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.heroAvatarFallback}>
                      <Text style={styles.heroAvatarLetter}>
                        {user.name ? user.name[0].toUpperCase() : 'S'}
                      </Text>
                    </View>
                  )}
                  {uploadingAvatar && (
                    <View style={styles.avatarLoadingOverlay}>
                      <ActivityIndicator size="small" color="#fff" />
                    </View>
                  )}
                  <View style={styles.heroCameraBadge}>
                    <Camera size={11} color="#fff" strokeWidth={2.4} />
                  </View>
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <View style={styles.heroNameBadgeRow}>
                    <Text style={styles.profileHeroName} numberOfLines={1}>{user.name}</Text>
                    <View style={styles.verifiedRoleBadge}>
                      <Sparkles size={11} color={Colors.primaryRose} strokeWidth={2.4} />
                      <Text style={styles.verifiedRoleText}>
                        {user.role === 'STUDENT' ? 'STUDENT' : `${user.role}`}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.profileHeroEmail} numberOfLines={1}>{user.email}</Text>
                  {user.phone ? (
                    <View style={styles.heroPhoneRow}>
                      <Phone size={11} color={Colors.textSecondary} />
                      <Text style={styles.profileHeroPhone}>{user.phone}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Quick Profile Actions Row */}
              <View style={styles.heroActionsRow}>
                <TouchableOpacity
                  style={styles.heroEditProfileBtn}
                  onPress={() => setEditModalVisible(true)}
                  activeOpacity={0.82}
                >
                  <Pencil size={13} color="#ffffff" strokeWidth={2.4} />
                  <Text style={styles.heroEditProfileBtnText}>Edit Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.heroChangePhotoBtn}
                  onPress={handlePickAvatar}
                  activeOpacity={0.82}
                >
                  <Camera size={13} color={Colors.primaryRose} strokeWidth={2.2} />
                  <Text style={styles.heroChangePhotoBtnText}>
                    {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* HIGH IMPACT STUDENT LEARNING PORTAL CARD */}
            {user.role === 'STUDENT' && (
              <TouchableOpacity
                style={styles.studentPortalCard}
                onPress={() => navigation.navigate('StudentPanel')}
                activeOpacity={0.88}
              >
                <View style={styles.studentPortalIconWrap}>
                  <GraduationCap size={22} color="#ffffff" strokeWidth={2.4} />
                </View>
                <View style={{ flex: 1, paddingRight: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Text style={styles.studentPortalTitle}>Student Learning Portal</Text>
                    <View style={styles.portalLiveBadge}>
                      <Text style={styles.portalLiveBadgeText}>ACTIVE</Text>
                    </View>
                  </View>
                  <Text style={styles.studentPortalSub}>
                    Access enrolled training tracks, live classes & mentors
                  </Text>
                </View>
                <View style={styles.studentPortalArrowBtn}>
                  <ChevronRight size={18} color="#ffffff" strokeWidth={2.4} />
                </View>
              </TouchableOpacity>
            )}

            {/* REFER & EARN BANNER CARD */}
            <TouchableOpacity
              style={styles.referralBannerCard}
              onPress={() => setReferralModalVisible(true)}
              activeOpacity={0.88}
            >
              <View style={styles.referralBannerTop}>
                <View style={styles.referralIconCircle}>
                  <Gift size={20} color="#ffffff" strokeWidth={2.4} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <Text style={styles.referralBannerTitle}>Refer & Earn Free Demo</Text>
                    <View style={styles.freeDemoTag}>
                      <Text style={styles.freeDemoTagText}>⚡ ₹99 FREE</Text>
                    </View>
                  </View>
                  <Text style={styles.referralBannerSub}>
                    Invite a friend. When they sign up, you get a 1-on-1 ₹99 Demo Class Free!
                  </Text>
                </View>
                <View style={styles.referralArrowCircle}>
                  <ChevronRight size={16} color="#ffffff" strokeWidth={2.4} />
                </View>
              </View>

              <View style={styles.referralBannerBottom}>
                <View style={styles.referralCodePill}>
                  <Text style={styles.referralCodePillLabel}>Invite Code:</Text>
                  <Text style={styles.referralCodePillText}>{user.referralCode || 'FLY-LMS'}</Text>
                </View>
                <View style={styles.referralCreditStats}>
                  <Text style={styles.referralCreditValue}>{user.freeDemoCredits || 0}</Text>
                  <Text style={styles.referralCreditLabel}>Free Passes</Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* ACADEMIC & PERSONAL DETAILS CARD */}
            <View style={styles.infoCard}>
              <View style={styles.infoCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.infoCardHeaderIconWrap}>
                    <BookOpen size={16} color={Colors.primaryRose} strokeWidth={2.4} />
                  </View>
                  <View>
                    <Text style={styles.infoCardTitle}>Academic & Personal Details</Text>
                    <Text style={styles.infoCardSub}>Education, Residence & Family Information</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.infoCardEditBtn}
                  onPress={() => setEditModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <Pencil size={11} color={Colors.primaryRose} strokeWidth={2.2} />
                  <Text style={styles.infoCardEditBtnText}>Edit</Text>
                </TouchableOpacity>
              </View>

              {/* SECTION 1: EDUCATION */}
              <View style={styles.infoItemRow}>
                <View style={[styles.infoItemIconWrap, { backgroundColor: '#EFF6FF' }]}>
                  <GraduationCap size={16} color="#2563EB" strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={styles.infoItemLabel}>Education History</Text>
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
                  <Text style={styles.infoItemVal}>
                    {user.educationDetails?.highestQualification || 'Qualification pending update'}
                  </Text>
                  {user.educationDetails?.collegeOrSchool ? (
                    <Text style={styles.infoItemSub}>
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

              <View style={styles.infoDivider} />

              {/* SECTION 2: RESIDENTIAL ADDRESS */}
              <View style={styles.infoItemRow}>
                <View style={[styles.infoItemIconWrap, { backgroundColor: '#ECFDF5' }]}>
                  <MapPin size={16} color="#059669" strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoItemLabel}>Residence & Location</Text>
                  <Text style={styles.infoItemVal}>
                    {user.addressDetails?.city
                      ? `${user.addressDetails.city}, ${user.addressDetails.state || ''} ${user.addressDetails.pincode ? `• PIN ${user.addressDetails.pincode}` : ''}`
                      : 'Address not added yet'}
                  </Text>
                  {user.addressDetails?.addressLine ? (
                    <Text style={styles.infoItemSub}>{user.addressDetails.addressLine}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.infoDivider} />

              {/* SECTION 3: FAMILY & CATEGORY */}
              <View style={styles.infoItemRow}>
                <View style={[styles.infoItemIconWrap, { backgroundColor: '#FFFBEB' }]}>
                  <Users size={16} color="#D97706" strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                    <Text style={styles.infoItemLabel}>Family & Social Category</Text>
                    <View style={styles.categoryPill}>
                      <Text style={styles.categoryPillText}>
                        {user.studentCategory || 'GENERAL'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.infoItemVal}>
                    {user.familyDetails?.fatherName
                      ? `Father: ${user.familyDetails.fatherName}${user.familyDetails.familyOccupation ? ` (${user.familyDetails.familyOccupation})` : ''}`
                      : 'Father/Guardian info pending'}
                  </Text>
                  {user.familyDetails?.motherName ? (
                    <Text style={styles.infoItemSub}>Mother: {user.familyDetails.motherName}</Text>
                  ) : null}
                  {user.familyDetails?.guardianPhone || user.phone ? (
                    <Text style={styles.infoItemSub}>
                      Emergency Contact: {user.familyDetails?.guardianPhone || user.phone}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>

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

              {!isLoginTab && (
                <View style={styles.fieldWrap}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={styles.fieldLabel}>Referral Code (Optional)</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Gift size={11} color={Colors.primaryRose} />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.primaryRose }}>Unlock Benefits</Text>
                    </View>
                  </View>
                  <TextInput
                    style={[styles.fieldInput, { textTransform: 'uppercase', letterSpacing: 1 }]}
                    placeholder="e.g. FLY-NAV-4A82"
                    placeholderTextColor={Colors.textLight}
                    autoCapitalize="characters"
                    value={referralCode}
                    onChangeText={setReferralCode}
                  />
                </View>
              )}

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

        {/* REACH US & CONTACT FORM CARD */}
        <View style={[styles.infoSection, { marginTop: user ? 16 : 20 }]}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Reach & Connect</Text>
              <Text style={styles.sectionSubtitle}>Admissions helpline, campus visit & inquiries</Text>
            </View>
            <View style={styles.activePill}>
              <View style={styles.activePillDot} />
              <Text style={styles.activePillText}>Campus Open</Text>
            </View>
          </View>

          {/* Primary Contact Us Button */}
          <TouchableOpacity
            style={styles.openContactFormBtn}
            onPress={() => setContactModalVisible(true)}
            activeOpacity={0.85}
          >
            <View style={styles.openContactFormIcon}>
              <MessageSquare size={18} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.openContactFormTitle}>Contact Us & Reach Admissions</Text>
              <Text style={styles.openContactFormSub}>
                Drop an inquiry regarding training tracks, batch timings, fees, or campus visits
              </Text>
            </View>
            <ChevronRight size={18} color={Colors.primaryRose} />
          </TouchableOpacity>

          {/* Instant Campus Info Rows */}
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
            <ExternalLink size={14} color={Colors.textLight} />
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
            <ChevronRight size={14} color={Colors.textLight} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => Linking.openURL(`mailto:${FlymediaContact.email}`).catch(() => {})}
            activeOpacity={0.7}
          >
            <Mail size={18} color={Colors.primaryOrange} />
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Admissions Email (Tap to write)</Text>
              <Text style={styles.infoVal}>{FlymediaContact.email}</Text>
            </View>
            <ChevronRight size={14} color={Colors.textLight} />
          </TouchableOpacity>
        </View>

        {/* ABOUT & LEGAL POLICIES SECTION */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About & Legal Policies</Text>
          <Text style={styles.sectionSubtitle}>Transparency, student rights & compliance</Text>

          <View style={styles.legalListWrap}>
            {/* About Us */}
            <TouchableOpacity
              style={styles.legalListItem}
              onPress={() => openLegalModal('about')}
              activeOpacity={0.75}
            >
              <View style={[styles.legalListIcon, { backgroundColor: '#FFF1F2' }]}>
                <Building2 size={16} color={Colors.primaryRose} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.legalListTitle}>About Us</Text>
                <Text style={styles.legalListSub}>14+ Years of excellence, leadership & campus network</Text>
              </View>
              <ChevronRight size={16} color={Colors.textLight} />
            </TouchableOpacity>

            {/* Terms and Conditions */}
            <TouchableOpacity
              style={styles.legalListItem}
              onPress={() => openLegalModal('terms')}
              activeOpacity={0.75}
            >
              <View style={[styles.legalListIcon, { backgroundColor: '#EFF6FF' }]}>
                <FileText size={16} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.legalListTitle}>Terms & Conditions</Text>
                <Text style={styles.legalListSub}>Student code of conduct & course service agreement</Text>
              </View>
              <ChevronRight size={16} color={Colors.textLight} />
            </TouchableOpacity>

            {/* Privacy Policy */}
            <TouchableOpacity
              style={styles.legalListItem}
              onPress={() => openLegalModal('privacy')}
              activeOpacity={0.75}
            >
              <View style={[styles.legalListIcon, { backgroundColor: '#F0FDF4' }]}>
                <ShieldCheck size={16} color="#16A34A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.legalListTitle}>Privacy Policy</Text>
                <Text style={styles.legalListSub}>Google Play Data Safety & user data protection</Text>
              </View>
              <ChevronRight size={16} color={Colors.textLight} />
            </TouchableOpacity>

            {/* Delete User */}
            <TouchableOpacity
              style={[styles.legalListItem, { borderBottomWidth: 0 }]}
              onPress={() => openLegalModal('delete')}
              activeOpacity={0.75}
            >
              <View style={[styles.legalListIcon, { backgroundColor: '#FEF2F2' }]}>
                <Trash2 size={16} color="#DC2626" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.legalListTitle, { color: '#DC2626' }]}>Delete User / Account</Text>
                <Text style={styles.legalListSub}>Permanently erase personal data & certificates</Text>
              </View>
              <ChevronRight size={16} color={Colors.textLight} />
            </TouchableOpacity>
          </View>

          {/* Quick Footer Links */}
          <View style={styles.legalLinksWrap}>
            <TouchableOpacity onPress={() => openLegalModal('about')} activeOpacity={0.7}>
              <Text style={styles.legalLinkText}>About Us</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>•</Text>
            <TouchableOpacity onPress={() => openLegalModal('terms')} activeOpacity={0.7}>
              <Text style={styles.legalLinkText}>Terms & Conditions</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>•</Text>
            <TouchableOpacity onPress={() => openLegalModal('privacy')} activeOpacity={0.7}>
              <Text style={styles.legalLinkText}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalDot}>•</Text>
            <TouchableOpacity onPress={() => openLegalModal('delete')} activeOpacity={0.7}>
              <Text style={[styles.legalLinkText, { color: '#DC2626' }]}>Delete User</Text>
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

      <CallbackModal
        visible={callbackModalVisible}
        onClose={() => setCallbackModalVisible(false)}
        defaultCourse="Account & Admission Help"
      />

      <ContactUsModal
        visible={contactModalVisible}
        onClose={() => setContactModalVisible(false)}
      />

      <LegalAndAboutModal
        visible={legalModalVisible}
        onClose={() => setLegalModalVisible(false)}
        type={legalModalType}
        isLoggedIn={!!user}
        isDeleting={deleting}
        onDeleteAccount={deleteAccount}
      />

      <ReferralModal
        visible={referralModalVisible}
        onClose={() => setReferralModalVisible(false)}
        onRedeemFreeDemo={() => setCallbackModalVisible(true)}
      />
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
  /* Modern Profile Hero Card */
  profileHeroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Shadows.small,
  },
  profileHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroAvatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    position: 'relative',
    marginRight: 14,
    shadowColor: Colors.primaryRose,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  heroAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF1F2',
    borderWidth: 2,
    borderColor: '#FECDD3',
  },
  heroAvatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF1F2',
    borderWidth: 2,
    borderColor: '#FECDD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarLetter: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.primaryRose,
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCameraBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primaryRose,
    borderWidth: 2,
    borderColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 3,
  },
  profileHeroName: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  verifiedRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  verifiedRoleText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: Colors.primaryRose,
    letterSpacing: 0.4,
  },
  profileHeroEmail: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  heroPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  profileHeroPhone: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  heroActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  heroEditProfileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primaryRose,
    paddingVertical: 10,
    borderRadius: 12,
    ...Shadows.small,
  },
  heroEditProfileBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '800',
  },
  heroChangePhotoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF1F2',
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    paddingVertical: 9.5,
    borderRadius: 12,
  },
  heroChangePhotoBtnText: {
    color: Colors.primaryRose,
    fontSize: 12.5,
    fontWeight: '800',
  },

  /* Modern Student Learning Portal Tile */
  studentPortalCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  studentPortalIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.primaryRose,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  studentPortalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  portalLiveBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  portalLiveBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#34D399',
    letterSpacing: 0.4,
  },
  studentPortalSub: {
    fontSize: 11.5,
    color: '#94A3B8',
    lineHeight: 16,
  },
  studentPortalArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Refer & Earn Banner Card */
  referralBannerCard: {
    backgroundColor: '#831843', // Deep rose-pink
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    ...Shadows.card,
  },
  referralBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  referralIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  freeDemoTag: {
    backgroundColor: '#FDE047',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  freeDemoTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#713F12',
    letterSpacing: 0.3,
  },
  referralBannerSub: {
    fontSize: 11.5,
    color: '#FCE7F3',
    lineHeight: 16,
    marginTop: 2,
  },
  referralArrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralBannerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
  },
  referralCodePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  referralCodePillLabel: {
    fontSize: 11,
    color: '#FBCFE8',
    fontWeight: '600',
  },
  referralCodePillText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  referralCreditStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  referralCreditValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FDE047',
  },
  referralCreditLabel: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '700',
  },

  /* Academic & Personal Details Card */
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    ...Shadows.small,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  infoCardHeaderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCardTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: Colors.textPrimary,
  },
  infoCardSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  infoCardEditBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1F2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  infoCardEditBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  infoItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoItemIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoItemLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoItemVal: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  infoItemSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
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
  currentStudySub: {
    fontSize: 11,
    color: '#2563eb',
    fontWeight: '700',
    marginTop: 3,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 11.5,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  activePillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  openContactFormBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    marginBottom: 14,
    ...Shadows.small,
  },
  openContactFormIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primaryRose,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openContactFormTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  openContactFormSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  legalListWrap: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  legalListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  legalListIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legalListTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  legalListSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  legalLinksWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
    flexWrap: 'wrap',
  },
  legalLinkText: {
    fontSize: 11.5,
    color: Colors.primaryRose,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  legalDot: {
    color: Colors.textMuted,
    fontSize: 11,
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
