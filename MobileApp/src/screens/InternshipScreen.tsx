import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
  TurboModuleRegistry,
  NativeModules,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../theme/colors';
import { ApiService } from '../services/api';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import {
  ArrowLeft,
  ArrowRight,
  GraduationCap,
  CheckCircle,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  Sparkles,
  Award,
  Laptop,
  Briefcase,
  PhoneCall,
  MessageSquare,
  ExternalLink,
  FileText,
  Upload,
  X,
  Code,
  Cpu,
  Palette,
  Video,
  Smartphone,
  ShieldCheck,
  Check,
  Calendar,
} from 'lucide-react-native';

interface DomainOption {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
}

const DOMAIN_OPTIONS: DomainOption[] = [
  {
    id: 'Full Stack Web Development (MERN & Next.js)',
    title: 'Full Stack Web Development',
    subtitle: 'MERN, Next.js, Node.js & REST APIs',
    icon: Code,
    color: '#e60870',
  },
  {
    id: 'Python, AI & Machine Learning',
    title: 'Python, AI & Data Science',
    subtitle: 'Machine Learning, Deep Learning, GenAI',
    icon: Cpu,
    color: '#7c3aed',
  },
  {
    id: 'Digital Marketing, SEO & Growth Strategy',
    title: 'Digital Marketing & Growth',
    subtitle: 'SEO, Google Ads, Meta Ads & Analytics',
    icon: Sparkles,
    color: '#f8750e',
  },
  {
    id: 'Graphic Designing & UI/UX (Figma / Adobe)',
    title: 'UI/UX & Graphic Designing',
    subtitle: 'Figma, Adobe XD, Photoshop, Branding',
    icon: Palette,
    color: '#ec4899',
  },
  {
    id: 'Professional Video Editing & Motion Graphics',
    title: 'Video Editing & VFX',
    subtitle: 'Premiere Pro, After Effects, Reels & 3D',
    icon: Video,
    color: '#dc2626',
  },
  {
    id: 'Mobile App Development (Flutter / React Native)',
    title: 'Mobile App Development',
    subtitle: 'Cross-platform Android & iOS Apps',
    icon: Smartphone,
    color: '#0284c7',
  },
  {
    id: 'Software Testing & Automation QA',
    title: 'QA & Software Testing',
    subtitle: 'Manual Testing, Selenium, Automation QA',
    icon: ShieldCheck,
    color: '#059669',
  },
  {
    id: 'Other / Custom Training Track',
    title: 'Custom Training Track',
    subtitle: 'Customized syllabus aligned with college',
    icon: GraduationCap,
    color: '#4b5563',
  },
];

const QUALIFICATIONS = [
  'B.Tech / B.E (CSE / IT)',
  'BCA (Computer Apps)',
  'MCA',
  'Diploma / Polytechnic',
  'B.Sc / M.Sc (CS/IT)',
  'Other Degree',
];

const YEARS_OF_STUDY = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  'Final Year',
  'Recent Passout',
];

const INTERNSHIP_DURATIONS = [
  { label: '45 Days', sub: 'Summer Training' },
  { label: '6 Weeks', sub: 'Project Internship' },
  { label: '3 Months', sub: 'Live Project Track' },
  { label: '6 Months', sub: 'Industrial + Placement' },
];

const MODES = [
  {
    id: 'CAMPUS',
    title: 'Campus Lab',
    desc: 'Ludhiana Offline Center',
    badge: 'Hands-on Lab',
  },
  {
    id: 'ONLINE',
    title: 'Live Online',
    desc: 'Interactive 1-on-1 Sessions',
    badge: 'Flexible',
  },
  {
    id: 'HYBRID',
    title: 'Hybrid Flex',
    desc: 'Campus Lab + Remote',
    badge: 'Most Popular',
  },
] as const;

const START_DATES = [
  'Immediate / Next Batch',
  'Within 1–2 Weeks',
  'Next Month',
  'Summer (June–July)',
  'Winter (Dec–Jan)',
];

const isDocumentPickerAvailable = (): boolean => {
  try {
    if (TurboModuleRegistry && typeof (TurboModuleRegistry as any).get === 'function') {
      const mod = (TurboModuleRegistry as any).get('RNDocumentPicker');
      if (mod) return true;
    }
  } catch {}
  try {
    if (
      NativeModules &&
      ((NativeModules as any).RNDocumentPicker || (NativeModules as any).NativeDocumentPicker)
    ) {
      return true;
    }
  } catch {}
  return false;
};

export const InternshipScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(
    insets.top,
    Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 24)
  );
  const bottomPadding = Math.max(insets.bottom, 16);

  // Stepper: 1: Profile & College, 2: Track & Mode, 3: Resume & Submit
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [qualification, setQualification] = useState(QUALIFICATIONS[0]);
  const [yearOfStudy, setYearOfStudy] = useState(YEARS_OF_STUDY[2]);
  const [domain, setDomain] = useState(route?.params?.defaultDomain || DOMAIN_OPTIONS[0].id);
  const [duration, setDuration] = useState(INTERNSHIP_DURATIONS[1].label);
  const [mode, setMode] = useState<'CAMPUS' | 'ONLINE' | 'HYBRID'>('HYBRID');
  const [startDate, setStartDate] = useState(START_DATES[0]);
  const [city, setCity] = useState('');
  const [resumeOption, setResumeOption] = useState<'FILE' | 'URL'>('FILE');
  const [resumeUrl, setResumeUrl] = useState('');
  const [message, setMessage] = useState('');
  const [pickedFile, setPickedFile] = useState<{
    uri: string;
    name: string;
    size: number | null;
    type: string | null;
  } | null>(null);
  const [fileError, setFileError] = useState('');

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState('');

  // Handle Document Picker
  const handlePickResume = async () => {
    setFileError('');

    if (!isDocumentPickerAvailable()) {
      Alert.alert(
        'App Rebuild Required for iOS',
        'The newly installed native file picker module requires rebuilding the iOS app binary.\n\nPlease run "npm run ios" in your terminal to recompile the app with native file picker support.\n\nIn the meantime, you can paste your Google Drive / Cloud PDF resume link below, or open our web upload form.',
        [
          {
            text: 'Open Web Form',
            onPress: () => Linking.openURL('https://flymediatech.in/internship-form'),
          },
          { text: 'OK, I will paste link', style: 'cancel' },
        ]
      );
      return;
    }

    try {
      const results = await pick({
        type: [types.pdf],
        mode: 'import',
      });

      if (!results || results.length === 0) return;
      const file = results[0];

      const fileName = file.name || 'resume.pdf';
      const isPdf = fileName.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
      if (!isPdf) {
        const msg = 'Invalid format. Please select a PDF file (.pdf).';
        setFileError(msg);
        Alert.alert('Invalid Format', msg);
        return;
      }

      const maxBytes = 5 * 1024 * 1024; // 5 MB
      const fileSize = file.size ?? 0;

      if (fileSize > maxBytes) {
        const sizeMb = (fileSize / (1024 * 1024)).toFixed(2);
        const msg = `Selected file exceeds limit (${sizeMb} MB). Maximum allowed size is 5 MB.`;
        setFileError(msg);
        Alert.alert('File Too Large', msg);
        return;
      }

      setPickedFile({
        uri: file.uri,
        name: fileName,
        size: file.size,
        type: file.type || 'application/pdf',
      });
      setFileError('');
    } catch (err: any) {
      if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) {
        return;
      }
      console.warn('Document picker error:', err);
      Alert.alert(
        'Upload Notice',
        'Could not open native document picker. You can paste your resume Google Drive link below or rebuild the iOS app.'
      );
    }
  };

  // Validation before step transition
  const validateStep1 = () => {
    if (!fullName.trim()) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return false;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      Alert.alert('Valid Email Required', 'Please enter a valid email address.');
      return false;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      Alert.alert('Mobile Number Required', 'Please enter a valid 10-digit WhatsApp/mobile number.');
      return false;
    }
    if (!college.trim()) {
      Alert.alert('College Name Required', 'Please enter your college or university name.');
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(1);
    else navigation.goBack();
  };

  // Submit Application
  const handleSubmit = async () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    if (fileError) {
      Alert.alert('File Error', fileError);
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/\D/g, '');
      const res = await ApiService.submitInternshipApplication({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        college: college.trim(),
        qualification,
        yearOfStudy,
        domain,
        duration,
        mode,
        startDate,
        city: city.trim() || null,
        resumeUrl: resumeOption === 'URL' && resumeUrl.trim() ? resumeUrl.trim() : null,
        message: message.trim() || null,
        resumeFile: resumeOption === 'FILE' ? pickedFile : null,
      });

      if (res.success) {
        const randomRef = `FLMS-${Math.floor(100000 + Math.random() * 900000)}`;
        setApplicationId(randomRef);
        setIsSuccess(true);
      } else {
        Alert.alert('Submission Error', res.error || 'Failed to submit application. Please try again.');
      }
    } catch (e: any) {
      Alert.alert('Network Error', e?.message || 'Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppCounselor = () => {
    const text = encodeURIComponent(
      `Hello Flymedia Technology! I just submitted my internship application (Ref: ${applicationId || 'Online App'}). My name is ${fullName || 'Student'} for the ${domain} track (${duration}). Could you please guide me on batch schedules and college NOC?`
    );
    Linking.openURL(`https://wa.me/919779324178?text=${text}`).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp.');
    });
  };

  const handleCallHelpline = () => {
    Linking.openURL('tel:+919779324178').catch(() => {
      Alert.alert('Error', 'Could not open phone dialer.');
    });
  };

  // ─────────────────────────────────────────────────────────────
  // REDESIGNED SUCCESS SCREEN
  // ─────────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        {/* Top App Bar */}
        <View style={[styles.topBar, { paddingTop: topPadding + 6 }]}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => navigation.navigate('Main')}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Application Status</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.successScroll, { paddingBottom: bottomPadding + 30 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Celebratory Icon Badge */}
          <View style={styles.celebrationHero}>
            <View style={styles.successOuterGlow}>
              <View style={styles.successInnerRing}>
                <CheckCircle size={48} color="#10b981" />
              </View>
            </View>

            <View style={styles.statusBadgePill}>
              <Sparkles size={12} color="#15803d" />
              <Text style={styles.statusBadgeText}>APPLICATION CONFIRMED</Text>
            </View>

            <Text style={styles.successMainTitle}>You&apos;re All Set, {fullName}!</Text>
            <Text style={styles.successSubtext}>
              Your internship application has been successfully logged. Our senior counselor will connect with you on WhatsApp within 24–48 hours to confirm your batch schedule and provide college NOC paperwork.
            </Text>
          </View>

          {/* Digital Admission Pass / Summary Card */}
          <View style={styles.admissionPassCard}>
            <View style={styles.passHeader}>
              <View>
                <Text style={styles.passOrgName}>FLYMEDIA TECHNOLOGY</Text>
                <Text style={styles.passDeskName}>Admissions Desk • 2026–2027</Text>
              </View>
              <View style={styles.passTokenBadge}>
                <Text style={styles.passTokenLabel}>REF ID</Text>
                <Text style={styles.passTokenValue}>{applicationId || 'FLMS-2026'}</Text>
              </View>
            </View>

            <View style={styles.passDottedDivider} />

            <View style={styles.passBody}>
              <View style={styles.passRow}>
                <Text style={styles.passFieldLabel}>Track / Domain</Text>
                <Text style={styles.passFieldValue}>{domain}</Text>
              </View>

              <View style={styles.passGrid}>
                <View style={styles.passGridCol}>
                  <Text style={styles.passFieldLabel}>Duration</Text>
                  <Text style={styles.passFieldValueBold}>{duration}</Text>
                </View>
                <View style={styles.passGridCol}>
                  <Text style={styles.passFieldLabel}>Learning Mode</Text>
                  <Text style={[styles.passFieldValueBold, { color: Colors.primaryRose }]}>
                    {mode === 'CAMPUS' ? '🏫 Campus Lab' : mode === 'ONLINE' ? '🌐 Live Online' : '⚡ Hybrid Flex'}
                  </Text>
                </View>
              </View>

              <View style={styles.passRow}>
                <Text style={styles.passFieldLabel}>College / University</Text>
                <Text style={styles.passFieldValue}>{college}</Text>
              </View>

              <View style={styles.passFooterTag}>
                <ShieldCheck size={14} color="#059669" />
                <Text style={styles.passFooterText}>
                  ISO 9001:2015 &amp; MSME Recognized Certification
                </Text>
              </View>
            </View>
          </View>

          {/* What Happens Next - Step Timeline */}
          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Next Steps for You</Text>

            <View style={styles.timelineStep}>
              <View style={styles.timelineDotActive}>
                <Text style={styles.timelineDotNum}>1</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStepHeading}>Profile Review &amp; NOC Eligibility</Text>
                <Text style={styles.timelineStepDesc}>
                  Our academic coordinator verifies your course requirements and issues your college acceptance letter.
                </Text>
              </View>
            </View>

            <View style={styles.timelineStep}>
              <View style={styles.timelineDot}>
                <Text style={styles.timelineDotNum}>2</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStepHeading}>Counselor Connect on WhatsApp</Text>
                <Text style={styles.timelineStepDesc}>
                  A senior mentor will discuss your preferred lab timings, curriculum modules, and project scope.
                </Text>
              </View>
            </View>

            <View style={[styles.timelineStep, { marginBottom: 0 }]}>
              <View style={styles.timelineDot}>
                <Text style={styles.timelineDotNum}>3</Text>
              </View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineStepHeading}>Batch Onboarding &amp; Live Projects</Text>
                <Text style={styles.timelineStepDesc}>
                  Receive your LMS student portal login, Git repo access, and commence your hands-on internship.
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Contact & Action Buttons */}
          <View style={styles.actionButtonsWrap}>
            <TouchableOpacity
              style={styles.whatsAppPrimaryBtn}
              onPress={handleWhatsAppCounselor}
              activeOpacity={0.88}
            >
              <MessageSquare size={18} color="#ffffff" />
              <Text style={styles.whatsAppPrimaryBtnText}>Chat with Counselor on WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.callSecondaryBtn}
              onPress={handleCallHelpline}
              activeOpacity={0.85}
            >
              <PhoneCall size={18} color={Colors.primaryRose} />
              <Text style={styles.callSecondaryBtnText}>Call Admissions: +91-97793-24178</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.homeReturnBtn}
              onPress={() => navigation.navigate('Main')}
              activeOpacity={0.7}
            >
              <Text style={styles.homeReturnBtnText}>Back to Home Screen</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // REDESIGNED INTERNSHIP FORM SCREEN
  // ─────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Top App Header */}
      <View style={[styles.topBar, { paddingTop: topPadding + 6 }]}>
        <TouchableOpacity
          style={styles.circleBtn}
          onPress={handlePrevStep}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.topBarCenter}>
          <Text style={styles.topBarTitle}>Internship Program</Text>
          <Text style={styles.topBarSubtitle}>Flymedia Technology</Text>
        </View>
        <TouchableOpacity
          style={styles.callIconBtn}
          onPress={handleCallHelpline}
          activeOpacity={0.7}
        >
          <PhoneCall size={18} color={Colors.primaryRose} />
        </TouchableOpacity>
      </View>

      {/* Modern Stepper Progress Header */}
      <View style={styles.stepperContainer}>
        <View style={styles.stepperTabs}>
          <TouchableOpacity
            style={[styles.stepPill, currentStep === 1 && styles.stepPillActive]}
            onPress={() => setCurrentStep(1)}
            activeOpacity={0.75}
          >
            <View style={[styles.stepNumberBadge, currentStep >= 1 && styles.stepNumberBadgeDone]}>
              <Text style={[styles.stepNumberText, currentStep >= 1 && styles.stepNumberTextDone]}>
                1
              </Text>
            </View>
            <Text style={[styles.stepPillLabel, currentStep === 1 && styles.stepPillLabelActive]}>
              Profile
            </Text>
          </TouchableOpacity>

          <View style={[styles.stepConnector, currentStep >= 2 && styles.stepConnectorActive]} />

          <TouchableOpacity
            style={[styles.stepPill, currentStep === 2 && styles.stepPillActive]}
            onPress={() => {
              if (validateStep1()) setCurrentStep(2);
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.stepNumberBadge, currentStep >= 2 && styles.stepNumberBadgeDone]}>
              <Text style={[styles.stepNumberText, currentStep >= 2 && styles.stepNumberTextDone]}>
                2
              </Text>
            </View>
            <Text style={[styles.stepPillLabel, currentStep === 2 && styles.stepPillLabelActive]}>
              Track
            </Text>
          </TouchableOpacity>

          <View style={[styles.stepConnector, currentStep >= 3 && styles.stepConnectorActive]} />

          <TouchableOpacity
            style={[styles.stepPill, currentStep === 3 && styles.stepPillActive]}
            onPress={() => {
              if (validateStep1()) setCurrentStep(3);
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.stepNumberBadge, currentStep >= 3 && styles.stepNumberBadgeDone]}>
              <Text style={[styles.stepNumberText, currentStep >= 3 && styles.stepNumberTextDone]}>
                3
              </Text>
            </View>
            <Text style={[styles.stepPillLabel, currentStep === 3 && styles.stepPillLabelActive]}>
              Apply
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding + 30 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* STEP 1: STUDENT & COLLEGE PROFILE */}
          {currentStep === 1 && (
            <View>
              {/* Premium Hero Banner */}
              <View style={styles.heroCard}>
                <View style={styles.heroTopRow}>
                  <View style={styles.batchPill}>
                    <Sparkles size={12} color="#ffffff" />
                    <Text style={styles.batchPillText}>2026 – 2027 BATCHES OPEN</Text>
                  </View>
                  <Text style={styles.heroSubTag}>MSME &amp; ISO Verified</Text>
                </View>

                <Text style={styles.heroTitle}>Summer &amp; Industrial Internship Training</Text>
                <Text style={styles.heroDescription}>
                  Learn on live client software with 1-on-1 industry mentors. Complete with college NOC documentation and 100% placement drives.
                </Text>

                <View style={styles.perksGrid}>
                  <View style={styles.perkChip}>
                    <Laptop size={13} color="#e60870" />
                    <Text style={styles.perkChipText}>Live Projects</Text>
                  </View>
                  <View style={styles.perkChip}>
                    <Award size={13} color="#f8750e" />
                    <Text style={styles.perkChipText}>MSME Certificate</Text>
                  </View>
                  <View style={styles.perkChip}>
                    <Briefcase size={13} color="#059669" />
                    <Text style={styles.perkChipText}>Placement Drives</Text>
                  </View>
                  <View style={styles.perkChip}>
                    <Clock size={13} color="#0284c7" />
                    <Text style={styles.perkChipText}>College NOC</Text>
                  </View>
                </View>
              </View>

              {/* Form Card 1: Personal Details */}
              <View style={styles.modernCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderIconWrap}>
                    <User size={18} color={Colors.primaryRose} />
                  </View>
                  <View>
                    <Text style={styles.cardHeading}>Personal Information</Text>
                    <Text style={styles.cardSubheading}>Where can our mentor reach you?</Text>
                  </View>
                </View>

                {/* Full Name */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>
                    Full Name <Text style={styles.requiredMark}>*</Text>
                  </Text>
                  <View style={styles.fieldInputWrap}>
                    <User size={18} color={Colors.textMuted} style={styles.fieldIcon} />
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="e.g. Aman Sharma"
                      placeholderTextColor={Colors.textLight}
                      value={fullName}
                      onChangeText={setFullName}
                    />
                  </View>
                </View>

                {/* Email Address */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>
                    Email Address <Text style={styles.requiredMark}>*</Text>
                  </Text>
                  <View style={styles.fieldInputWrap}>
                    <Mail size={18} color={Colors.textMuted} style={styles.fieldIcon} />
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="e.g. aman@gmail.com"
                      placeholderTextColor={Colors.textLight}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                {/* Phone Number */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>
                    WhatsApp / Mobile Number <Text style={styles.requiredMark}>*</Text>
                  </Text>
                  <View style={styles.phoneGroupWrap}>
                    <View style={styles.flagBadge}>
                      <Text style={styles.flagText}>🇮🇳 +91</Text>
                    </View>
                    <TextInput
                      style={styles.phoneFieldInput}
                      placeholder="98765 43210"
                      placeholderTextColor={Colors.textLight}
                      keyboardType="phone-pad"
                      maxLength={10}
                      value={phone}
                      onChangeText={setPhone}
                    />
                  </View>
                  <Text style={styles.inputHelper}>We will send batch confirmation via WhatsApp.</Text>
                </View>

                {/* City */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Current City</Text>
                  <View style={styles.fieldInputWrap}>
                    <MapPin size={18} color={Colors.textMuted} style={styles.fieldIcon} />
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="e.g. Ludhiana, Jalandhar, Chandigarh"
                      placeholderTextColor={Colors.textLight}
                      value={city}
                      onChangeText={setCity}
                    />
                  </View>
                </View>
              </View>

              {/* Form Card 2: Academic Background */}
              <View style={styles.modernCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardHeaderIconWrap, { backgroundColor: '#eff6ff' }]}>
                    <GraduationCap size={18} color="#2563eb" />
                  </View>
                  <View>
                    <Text style={styles.cardHeading}>Academic Background</Text>
                    <Text style={styles.cardSubheading}>For college NOC documentation</Text>
                  </View>
                </View>

                {/* College Name */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>
                    College / University Name <Text style={styles.requiredMark}>*</Text>
                  </Text>
                  <View style={styles.fieldInputWrap}>
                    <Building size={18} color={Colors.textMuted} style={styles.fieldIcon} />
                    <TextInput
                      style={styles.fieldInput}
                      placeholder="e.g. GNDEC, PCTE, CT University, LPU"
                      placeholderTextColor={Colors.textLight}
                      value={college}
                      onChangeText={setCollege}
                    />
                  </View>
                </View>

                {/* Degree / Course Chips */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Degree / Program</Text>
                  <View style={styles.chipsContainer}>
                    {QUALIFICATIONS.map((q) => {
                      const isSelected = qualification === q;
                      return (
                        <TouchableOpacity
                          key={q}
                          style={[styles.modernChip, isSelected && styles.modernChipActive]}
                          onPress={() => setQualification(q)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.modernChipText,
                              isSelected && styles.modernChipTextActive,
                            ]}
                          >
                            {q}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Year of Study Chips */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Year of Study</Text>
                  <View style={styles.chipsContainer}>
                    {YEARS_OF_STUDY.map((y) => {
                      const isSelected = yearOfStudy === y;
                      return (
                        <TouchableOpacity
                          key={y}
                          style={[styles.modernChip, isSelected && styles.modernChipActive]}
                          onPress={() => setYearOfStudy(y)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.modernChipText,
                              isSelected && styles.modernChipTextActive,
                            ]}
                          >
                            {y}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Next Step Button */}
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={handleNextStep}
                activeOpacity={0.88}
              >
                <Text style={styles.primaryActionButtonText}>Continue to Track Selection</Text>
                <ArrowRight size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: TRACK & LEARNING PREFERENCES */}
          {currentStep === 2 && (
            <View>
              {/* Domain Selection Section */}
              <View style={styles.modernCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardHeaderIconWrap, { backgroundColor: '#fff7ed' }]}>
                    <Code size={18} color={Colors.primaryOrange} />
                  </View>
                  <View>
                    <Text style={styles.cardHeading}>Select Internship Domain</Text>
                    <Text style={styles.cardSubheading}>Tap your preferred career specialization</Text>
                  </View>
                </View>

                <View style={styles.domainCardsList}>
                  {DOMAIN_OPTIONS.map((item) => {
                    const isSelected = domain === item.id;
                    const IconComp = item.icon;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.domainSelectCard,
                          isSelected && styles.domainSelectCardActive,
                        ]}
                        onPress={() => setDomain(item.id)}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.domainIconBadge,
                            { backgroundColor: `${item.color}15` },
                            isSelected && { backgroundColor: item.color },
                          ]}
                        >
                          <IconComp
                            size={18}
                            color={isSelected ? '#ffffff' : item.color}
                          />
                        </View>
                        <View style={styles.domainInfoWrap}>
                          <Text
                            style={[
                              styles.domainItemTitle,
                              isSelected && styles.domainItemTitleActive,
                            ]}
                          >
                            {item.title}
                          </Text>
                          <Text style={styles.domainItemSub}>{item.subtitle}</Text>
                        </View>
                        <View
                          style={[
                            styles.domainRadioCheck,
                            isSelected && styles.domainRadioCheckActive,
                          ]}
                        >
                          {isSelected && <Check size={12} color="#ffffff" strokeWidth={3} />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Duration & Mode Selection */}
              <View style={styles.modernCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardHeaderIconWrap, { backgroundColor: '#f0fdf4' }]}>
                    <Clock size={18} color="#16a34a" />
                  </View>
                  <View>
                    <Text style={styles.cardHeading}>Duration &amp; Learning Mode</Text>
                    <Text style={styles.cardSubheading}>Tailored for your college schedule</Text>
                  </View>
                </View>

                {/* Duration Grid */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Training Duration</Text>
                  <View style={styles.durationGrid}>
                    {INTERNSHIP_DURATIONS.map((dur) => {
                      const isSelected = duration === dur.label;
                      return (
                        <TouchableOpacity
                          key={dur.label}
                          style={[
                            styles.durationCard,
                            isSelected && styles.durationCardActive,
                          ]}
                          onPress={() => setDuration(dur.label)}
                          activeOpacity={0.75}
                        >
                          <Text
                            style={[
                              styles.durationCardLabel,
                              isSelected && styles.durationCardLabelActive,
                            ]}
                          >
                            {dur.label}
                          </Text>
                          <Text style={styles.durationCardSub}>{dur.sub}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Mode Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Preferred Learning Mode</Text>
                  <View style={styles.modeList}>
                    {MODES.map((m) => {
                      const isSelected = mode === m.id;
                      return (
                        <TouchableOpacity
                          key={m.id}
                          style={[
                            styles.modeSelectBox,
                            isSelected && styles.modeSelectBoxActive,
                          ]}
                          onPress={() => setMode(m.id)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.modeInfo}>
                            <View style={styles.modeTitleRow}>
                              <Text
                                style={[
                                  styles.modeTitleText,
                                  isSelected && styles.modeTitleTextActive,
                                ]}
                              >
                                {m.title}
                              </Text>
                              <View
                                style={[
                                  styles.modeBadge,
                                  isSelected && styles.modeBadgeActive,
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.modeBadgeText,
                                    isSelected && styles.modeBadgeTextActive,
                                  ]}
                                >
                                  {m.badge}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.modeDescText}>{m.desc}</Text>
                          </View>
                          <View
                            style={[
                              styles.modeRadio,
                              isSelected && styles.modeRadioActive,
                            ]}
                          >
                            {isSelected && <View style={styles.modeRadioInner} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Preferred Start Date */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Preferred Start Date</Text>
                  <View style={styles.chipsContainer}>
                    {START_DATES.map((st) => {
                      const isSelected = startDate === st;
                      return (
                        <TouchableOpacity
                          key={st}
                          style={[styles.modernChip, isSelected && styles.modernChipActive]}
                          onPress={() => setStartDate(st)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.modernChipText,
                              isSelected && styles.modernChipTextActive,
                            ]}
                          >
                            {st}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Step Navigation Buttons */}
              <View style={styles.stepButtonsRow}>
                <TouchableOpacity
                  style={styles.secondaryStepButton}
                  onPress={handlePrevStep}
                  activeOpacity={0.75}
                >
                  <ArrowLeft size={16} color={Colors.textSecondary} />
                  <Text style={styles.secondaryStepButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryActionButton, { flex: 2 }]}
                  onPress={handleNextStep}
                  activeOpacity={0.88}
                >
                  <Text style={styles.primaryActionButtonText}>Proceed to Resume &amp; Apply</Text>
                  <ArrowRight size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 3: RESUME, GOALS & FINAL SUBMIT */}
          {currentStep === 3 && (
            <View>
              {/* Application Snapshot Review Card */}
              <View style={styles.snapshotCard}>
                <View style={styles.snapshotHeader}>
                  <View>
                    <Text style={styles.snapshotTitle}>Application Summary</Text>
                    <Text style={styles.snapshotSub}>Quick preview before submitting</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editStepBtn}
                    onPress={() => setCurrentStep(1)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.editStepBtnText}>Edit Details</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.snapshotDivider} />

                <View style={styles.snapshotRow}>
                  <Text style={styles.snapshotLabel}>Applicant:</Text>
                  <Text style={styles.snapshotValueBold}>{fullName}</Text>
                </View>
                <View style={styles.snapshotRow}>
                  <Text style={styles.snapshotLabel}>Phone &amp; Email:</Text>
                  <Text style={styles.snapshotValue}>
                    +91 {phone} • {email}
                  </Text>
                </View>
                <View style={styles.snapshotRow}>
                  <Text style={styles.snapshotLabel}>Specialization:</Text>
                  <Text style={[styles.snapshotValueBold, { color: Colors.primaryRose }]}>
                    {domain}
                  </Text>
                </View>
                <View style={styles.snapshotRow}>
                  <Text style={styles.snapshotLabel}>Duration &amp; Mode:</Text>
                  <Text style={styles.snapshotValue}>
                    {duration} • {mode === 'CAMPUS' ? 'Campus Lab' : mode === 'ONLINE' ? 'Live Online' : 'Hybrid Flex'}
                  </Text>
                </View>
                <View style={styles.snapshotRow}>
                  <Text style={styles.snapshotLabel}>College:</Text>
                  <Text style={styles.snapshotValue}>{college}</Text>
                </View>
              </View>

              {/* Resume Submission Card */}
              <View style={styles.modernCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardHeaderIconWrap, { backgroundColor: '#fdf2f8' }]}>
                    <FileText size={18} color={Colors.primaryRose} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardHeading}>Resume Submission</Text>
                    <Text style={styles.cardSubheading}>
                      Upload PDF or paste cloud link (Optional)
                    </Text>
                  </View>
                </View>

                {/* Segmented Switcher */}
                <View style={styles.segmentedTabContainer}>
                  <TouchableOpacity
                    style={[
                      styles.segmentedTab,
                      resumeOption === 'FILE' && styles.segmentedTabActive,
                    ]}
                    onPress={() => {
                      setResumeOption('FILE');
                      setResumeUrl('');
                    }}
                    activeOpacity={0.7}
                  >
                    <FileText
                      size={15}
                      color={resumeOption === 'FILE' ? Colors.primaryRose : Colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.segmentedTabText,
                        resumeOption === 'FILE' && styles.segmentedTabTextActive,
                      ]}
                    >
                      Upload PDF File
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.segmentedTab,
                      resumeOption === 'URL' && styles.segmentedTabActive,
                    ]}
                    onPress={() => {
                      setResumeOption('URL');
                      setPickedFile(null);
                      setFileError('');
                    }}
                    activeOpacity={0.7}
                  >
                    <ExternalLink
                      size={15}
                      color={resumeOption === 'URL' ? Colors.primaryRose : Colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.segmentedTabText,
                        resumeOption === 'URL' && styles.segmentedTabTextActive,
                      ]}
                    >
                      Paste Cloud Link
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Option 1: File Upload */}
                {resumeOption === 'FILE' && (
                  <View>
                    {pickedFile ? (
                      <View style={styles.selectedFileCard}>
                        <View style={styles.fileIconBadge}>
                          <FileText size={24} color={Colors.primaryRose} />
                        </View>
                        <View style={styles.fileMetaInfo}>
                          <Text style={styles.fileTitle} numberOfLines={1}>
                            {pickedFile.name}
                          </Text>
                          <Text style={styles.fileSizeText}>
                            {pickedFile.size
                              ? (pickedFile.size / (1024 * 1024)).toFixed(2) + ' MB • '
                              : ''}
                            <Text style={styles.fileStatusGreen}>✓ Ready to Submit</Text>
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.fileDeleteBtn}
                          onPress={() => {
                            setPickedFile(null);
                            setFileError('');
                          }}
                          activeOpacity={0.7}
                        >
                          <X size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.dashedUploadBox,
                          fileError ? styles.dashedUploadBoxError : null,
                        ]}
                        onPress={handlePickResume}
                        activeOpacity={0.8}
                      >
                        <View style={styles.uploadCloudCircle}>
                          <Upload size={22} color={Colors.primaryRose} />
                        </View>
                        <Text style={styles.uploadBoxTitle}>Select PDF Resume from Device</Text>
                        <Text style={styles.uploadBoxSub}>
                          PDF format only • Maximum file size: 5 MB
                        </Text>
                      </TouchableOpacity>
                    )}

                    {fileError ? (
                      <Text style={styles.fileErrorAlert}>⚠️ {fileError}</Text>
                    ) : null}
                  </View>
                )}

                {/* Option 2: Cloud URL Link */}
                {resumeOption === 'URL' && (
                  <View>
                    <View style={styles.fieldInputWrap}>
                      <ExternalLink size={18} color={Colors.textMuted} style={styles.fieldIcon} />
                      <TextInput
                        style={styles.fieldInput}
                        placeholder="https://drive.google.com/file/d/... or LinkedIn"
                        placeholderTextColor={Colors.textLight}
                        keyboardType="url"
                        autoCapitalize="none"
                        value={resumeUrl}
                        onChangeText={setResumeUrl}
                      />
                    </View>
                    <Text style={styles.inputHelper}>
                      Ensure Google Drive / OneDrive permission is set to &ldquo;Anyone with link can view&rdquo;.
                    </Text>
                  </View>
                )}

                {/* Optional Message / Notes */}
                <View style={[styles.fieldGroup, { marginTop: 18 }]}>
                  <Text style={styles.label}>College NOC or Learning Goals (Optional)</Text>
                  <TextInput
                    style={styles.textAreaField}
                    placeholder="Tell us about your learning targets, specific batch timing preference, or if you require an official college NOC format..."
                    placeholderTextColor={Colors.textLight}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    value={message}
                    onChangeText={setMessage}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.primarySubmitButton, loading && styles.primarySubmitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.88}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Text style={styles.primarySubmitButtonText}>Submit Application</Text>
                    <Sparkles size={18} color="#ffffff" />
                  </>
                )}
              </TouchableOpacity>

              {/* Trust Footer */}
              <View style={styles.trustFooterWrap}>
                <ShieldCheck size={14} color="#059669" />
                <Text style={styles.trustFooterLabel}>
                  Free Application • Direct Mentor Review • ISO &amp; MSME Certified
                </Text>
              </View>

              {/* Helpline Assistance */}
              <View style={styles.counselorCallout}>
                <Text style={styles.counselorCalloutTitle}>Need guidance before applying?</Text>
                <TouchableOpacity onPress={handleCallHelpline} activeOpacity={0.7}>
                  <Text style={styles.counselorCalloutLink}>
                    📞 Call Admissions Hotline: +91-97793-24178
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    ...Shadows.small,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarCenter: {
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  topBarSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primaryRose,
    marginTop: 1,
  },
  callIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fdf2f8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Stepper Header
  stepperContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  stepperTabs: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepPillActive: {},
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberBadgeDone: {
    backgroundColor: Colors.primaryRose,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  stepNumberTextDone: {
    color: '#ffffff',
  },
  stepPillLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  stepPillLabelActive: {
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  stepConnectorActive: {
    backgroundColor: Colors.primaryRose,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#0f172a',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    ...Shadows.medium,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  batchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(230, 8, 112, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(230, 8, 112, 0.4)',
  },
  batchPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fda4af',
    letterSpacing: 0.5,
  },
  heroSubTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  heroTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 25,
    marginBottom: 6,
  },
  heroDescription: {
    fontSize: 12,
    fontWeight: '500',
    color: '#cbd5e1',
    lineHeight: 18,
    marginBottom: 14,
  },
  perksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  perkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  perkChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f8fafc',
  },

  // Modern Card Styles
  modernCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Shadows.small,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    paddingBottom: 10,
  },
  cardHeaderIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#fdf2f8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  cardSubheading: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 1,
  },

  // Fields
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  requiredMark: {
    color: '#e11d48',
    fontWeight: '800',
  },
  fieldInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  fieldIcon: {
    marginRight: 8,
  },
  fieldInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  phoneGroupWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    overflow: 'hidden',
  },
  flagBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  flagText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  phoneFieldInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  inputHelper: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 15,
  },

  // Chips
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modernChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modernChipActive: {
    backgroundColor: '#fdf2f8',
    borderColor: Colors.primaryRose,
  },
  modernChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modernChipTextActive: {
    color: Colors.primaryRose,
    fontWeight: '800',
  },

  // Domain Cards List
  domainCardsList: {
    gap: 10,
  },
  domainSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  domainSelectCardActive: {
    backgroundColor: '#fff1f2',
    borderColor: Colors.primaryRose,
  },
  domainIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  domainInfoWrap: {
    flex: 1,
  },
  domainItemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  domainItemTitleActive: {
    color: Colors.primaryRose,
    fontWeight: '800',
  },
  domainItemSub: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
  domainRadioCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  domainRadioCheckActive: {
    backgroundColor: Colors.primaryRose,
    borderColor: Colors.primaryRose,
  },

  // Duration Grid
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  durationCard: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
  },
  durationCardActive: {
    backgroundColor: '#fdf2f8',
    borderColor: Colors.primaryRose,
  },
  durationCardLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  durationCardLabelActive: {
    color: Colors.primaryRose,
  },
  durationCardSub: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },

  // Mode Selection
  modeList: {
    gap: 8,
  },
  modeSelectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
  },
  modeSelectBoxActive: {
    backgroundColor: '#fff1f2',
    borderColor: Colors.primaryRose,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeTitleText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modeTitleTextActive: {
    color: Colors.primaryRose,
    fontWeight: '800',
  },
  modeBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modeBadgeActive: {
    backgroundColor: '#ffe4e6',
  },
  modeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.textMuted,
  },
  modeBadgeTextActive: {
    color: Colors.primaryRose,
  },
  modeDescText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  modeRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  modeRadioActive: {
    borderColor: Colors.primaryRose,
  },
  modeRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryRose,
  },

  // Resume Section
  segmentedTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    padding: 4,
    marginBottom: 12,
  },
  segmentedTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 11,
  },
  segmentedTabActive: {
    backgroundColor: '#ffffff',
    ...Shadows.small,
  },
  segmentedTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  segmentedTabTextActive: {
    color: Colors.primaryRose,
    fontWeight: '800',
  },
  dashedUploadBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashedUploadBoxError: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff1f2',
  },
  uploadCloudCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffe4e6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadBoxTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryRose,
    marginBottom: 2,
  },
  uploadBoxSub: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  selectedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#86efac',
    borderRadius: 16,
    padding: 12,
  },
  fileIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fileMetaInfo: {
    flex: 1,
  },
  fileTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  fileSizeText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
  fileStatusGreen: {
    color: '#16a34a',
    fontWeight: '700',
  },
  fileDeleteBtn: {
    padding: 8,
  },
  fileErrorAlert: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626',
    marginTop: 6,
  },
  textAreaField: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    height: 80,
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textPrimary,
  },

  // Snapshot Card
  snapshotCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Shadows.small,
  },
  snapshotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  snapshotTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  snapshotSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  editStepBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  editStepBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryRose,
  },
  snapshotDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 10,
  },
  snapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  snapshotLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  snapshotValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  snapshotValueBold: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },

  // Step Navigation Buttons
  stepButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  secondaryStepButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingVertical: 14,
    borderRadius: 16,
  },
  secondaryStepButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primaryRose,
    paddingVertical: 14,
    borderRadius: 16,
    ...Shadows.medium,
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  primarySubmitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primaryRose,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 4,
    ...Shadows.brand,
  },
  primarySubmitButtonDisabled: {
    opacity: 0.7,
  },
  primarySubmitButtonText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  trustFooterWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  trustFooterLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  counselorCallout: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    marginTop: 14,
    gap: 4,
  },
  counselorCalloutTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  counselorCalloutLink: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryRose,
  },

  // ─────────────────────────────────────────────────────────────
  // SUCCESS SCREEN STYLES
  // ─────────────────────────────────────────────────────────────
  successScroll: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  celebrationHero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  successOuterGlow: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    ...Shadows.small,
  },
  successInnerRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  statusBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: 0.5,
  },
  successMainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtext: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },

  // Admission Pass Card
  admissionPassCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 18,
    ...Shadows.medium,
  },
  passHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f172a',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  passOrgName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  passDeskName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 2,
  },
  passTokenBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignItems: 'center',
  },
  passTokenLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fca5a5',
  },
  passTokenValue: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 1,
  },
  passDottedDivider: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#f1f5f9',
    borderStyle: 'dashed',
  },
  passBody: {
    padding: 16,
    gap: 10,
  },
  passRow: {
    gap: 2,
  },
  passGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  passGridCol: {
    flex: 1,
    gap: 2,
  },
  passFieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  passFieldValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  passFieldValueBold: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  passFooterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 4,
  },
  passFooterText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065f46',
  },

  // Timeline
  timelineCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 18,
    ...Shadows.small,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 14,
  },
  timelineStep: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  timelineDotActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  timelineDotNum: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStepHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  timelineStepDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },

  // Action Buttons
  actionButtonsWrap: {
    width: '100%',
    gap: 10,
  },
  whatsAppPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 16,
    ...Shadows.medium,
  },
  whatsAppPrimaryBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  callSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: Colors.primaryRose,
    paddingVertical: 14,
    borderRadius: 16,
  },
  callSecondaryBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  homeReturnBtn: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  homeReturnBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
});
