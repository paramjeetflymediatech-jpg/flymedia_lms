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
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { ApiService } from '../services/api';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import {
  ArrowLeft,
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
} from 'lucide-react-native';

const INTERNSHIP_DOMAINS = [
  'Full Stack Web Development (MERN & Next.js)',
  'Python, AI & Machine Learning',
  'Digital Marketing, SEO & Growth Strategy',
  'Graphic Designing & UI/UX (Figma / Adobe)',
  'Professional Video Editing & Motion Graphics',
  'Mobile App Development (Flutter / React Native)',
  'Software Testing & Automation QA',
  'Other / Custom Training Track',
];

const INTERNSHIP_DURATIONS = [
  '45 Days (Summer Training)',
  '6 Weeks (Summer Internship)',
  '3 Months (Project Internship)',
  '6 Months (Industrial Training & Placement)',
];

const QUALIFICATIONS = [
  'B.Tech / B.E (CSE / IT / ECE)',
  'BCA (Computer Applications)',
  'MCA (Master of Computer Apps)',
  'Diploma / Polytechnic',
  'B.Sc Computer Science / IT',
  'M.Sc Computer Science / IT',
  'Other Degree / Graduate',
];

const YEARS_OF_STUDY = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  'Final Year (Sem 7-8)',
  'Recent Passout / Graduate',
];

const START_DATES = [
  'Immediate / Next Batch',
  'Within 1-2 Weeks',
  'Next Month',
  'Summer Training (June - July)',
  'Winter Training (Dec - Jan)',
];

const isDocumentPickerAvailable = (): boolean => {
  try {
    if (TurboModuleRegistry && typeof (TurboModuleRegistry as any).get === 'function') {
      const mod = (TurboModuleRegistry as any).get('RNDocumentPicker');
      if (mod) return true;
    }
  } catch {}
  try {
    if (NativeModules && ((NativeModules as any).RNDocumentPicker || (NativeModules as any).NativeDocumentPicker)) {
      return true;
    }
  } catch {}
  return false;
};

export const InternshipScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [qualification, setQualification] = useState(QUALIFICATIONS[0]);
  const [yearOfStudy, setYearOfStudy] = useState(YEARS_OF_STUDY[2]);
  const [domain, setDomain] = useState(route?.params?.defaultDomain || INTERNSHIP_DOMAINS[0]);
  const [duration, setDuration] = useState(INTERNSHIP_DURATIONS[1]);
  const [mode, setMode] = useState<'CAMPUS' | 'ONLINE' | 'HYBRID'>('HYBRID');
  const [startDate, setStartDate] = useState(START_DATES[0]);
  const [city, setCity] = useState('');
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

      // Format check (must be PDF)
      const fileName = file.name || 'resume.pdf';
      const isPdf = fileName.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
      if (!isPdf) {
        const msg = 'Invalid format. Please select a PDF file (.pdf).';
        setFileError(msg);
        Alert.alert('Invalid Format', msg);
        return;
      }

      // Size check (Max 5 MB)
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

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile/WhatsApp number.');
      return;
    }
    if (!college.trim()) {
      Alert.alert('Required Field', 'Please enter your college or university name.');
      return;
    }

    if (fileError) {
      Alert.alert('File Error', fileError);
      return;
    }

    setLoading(true);
    try {
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
        resumeUrl: resumeUrl.trim() || null,
        message: message.trim() || null,
        resumeFile: pickedFile,
      });

      if (res.success) {
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
      `Hello Flymedia, I just submitted my application for the ${domain} internship (${duration}). My name is ${fullName || 'Student'}. Could you please guide me on the next steps?`
    );
    Linking.openURL(`https://wa.me/919779324178?text=${text}`).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp.');
    });
  };

  const handleCallHelpline = () => {
    Linking.openURL('tel:+919779324178').catch(() => {
      Alert.alert('Error', 'Could not open dialer.');
    });
  };

  if (isSuccess) {
    return (
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Application Status</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.successContent}>
          <View style={styles.successIconWrap}>
            <CheckCircle size={56} color={Colors.success} />
          </View>

          <View style={styles.successBadge}>
            <Text style={styles.successBadgeText}>APPLICATION SUBMITTED</Text>
          </View>

          <Text style={styles.successTitle}>You&apos;re All Set, {fullName}!</Text>
          <Text style={styles.successSubtitle}>
            We have received your internship application for{' '}
            <Text style={{ fontWeight: '700', color: Colors.primaryRose }}>{domain}</Text>. Our academic counselor will reach out via WhatsApp / Call within 24–48 hours to confirm batch schedules and college NOC documentation.
          </Text>

          {/* Application Summary Box */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryHeading}>Application Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Domain:</Text>
              <Text style={styles.summaryValue}>{domain}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Duration:</Text>
              <Text style={styles.summaryValue}>{duration}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Mode:</Text>
              <Text style={[styles.summaryValue, { color: Colors.primaryRose, fontWeight: '800' }]}>
                {mode === 'CAMPUS' ? 'Campus Lab' : mode === 'ONLINE' ? 'Live Online' : 'Hybrid Flex'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>College:</Text>
              <Text style={styles.summaryValue}>{college}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.whatsAppBtn}
            onPress={handleWhatsAppCounselor}
            activeOpacity={0.85}
          >
            <MessageSquare size={18} color="#ffffff" />
            <Text style={styles.whatsAppBtnText}>Chat with Counselor on WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.callBtn}
            onPress={handleCallHelpline}
            activeOpacity={0.85}
          >
            <PhoneCall size={18} color={Colors.primaryRose} />
            <Text style={styles.callBtnText}>Call Helpline: +91-97793-24178</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.navigate('Main')}
            activeOpacity={0.8}
          >
            <Text style={styles.doneBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Internship Program</Text>
          <Text style={styles.headerSubtitle}>Flymedia Technology Admissions</Text>
        </View>
        <TouchableOpacity
          style={styles.callHeaderBtn}
          onPress={handleCallHelpline}
          activeOpacity={0.7}
        >
          <PhoneCall size={18} color={Colors.primaryRose} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero Banner Card */}
          <View style={styles.heroBanner}>
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadge}>
                <Sparkles size={12} color="#ffffff" />
                <Text style={styles.heroBadgeText}>2026 - 2027 BATCHES</Text>
              </View>
              <Text style={styles.heroSubBadge}>ISO & MSME Certified</Text>
            </View>

            <Text style={styles.heroTitle}>Summer &amp; 6 Months Industrial Internship</Text>
            <Text style={styles.heroText}>
              Work on live client projects with 1-on-1 mentor guidance. Get official college NOC documentation, project reports &amp; 100% placement support.
            </Text>

            <View style={styles.pillarsGrid}>
              <View style={styles.pillarItem}>
                <Laptop size={14} color="#fca5a5" />
                <Text style={styles.pillarText}>Live Client Code</Text>
              </View>
              <View style={styles.pillarItem}>
                <Award size={14} color="#fca5a5" />
                <Text style={styles.pillarText}>MSME Certificate</Text>
              </View>
              <View style={styles.pillarItem}>
                <Briefcase size={14} color="#fca5a5" />
                <Text style={styles.pillarText}>Placement Drives</Text>
              </View>
              <View style={styles.pillarItem}>
                <Clock size={14} color="#fca5a5" />
                <Text style={styles.pillarText}>Flexible Batches</Text>
              </View>
            </View>
          </View>

          {/* FORM SECTION 1: PERSONAL DETAILS */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>1</Text>
              </View>
              <Text style={styles.sectionTitle}>Personal &amp; Contact Details</Text>
            </View>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrap}>
                <User size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor={Colors.textLight}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Email Address <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrap}>
                <Mail size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. rahul@example.com"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                WhatsApp / Mobile <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.phoneInputWrap}>
                <View style={styles.countryCodeBadge}>
                  <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                </View>
                <TextInput
                  style={styles.phoneTextInput}
                  placeholder="98765 43210"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>

            {/* City */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your City / Location</Text>
              <View style={styles.inputWrap}>
                <MapPin size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Ludhiana, Jalandhar, Chandigarh"
                  placeholderTextColor={Colors.textLight}
                  value={city}
                  onChangeText={setCity}
                />
              </View>
            </View>
          </View>

          {/* FORM SECTION 2: ACADEMIC DETAILS */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>2</Text>
              </View>
              <Text style={styles.sectionTitle}>Academic Background</Text>
            </View>

            {/* College Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                College / University Name <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrap}>
                <Building size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. GNDEC, PCTE, CT University, LPU"
                  placeholderTextColor={Colors.textLight}
                  value={college}
                  onChangeText={setCollege}
                />
              </View>
            </View>

            {/* Qualification Chips */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Current Degree / Course <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.chipsWrap}>
                {QUALIFICATIONS.map((q) => {
                  const isSelected = qualification === q;
                  return (
                    <TouchableOpacity
                      key={q}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => setQualification(q)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {q}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Year of Study Chips */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Year of Study <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.chipsWrap}>
                {YEARS_OF_STUDY.map((y) => {
                  const isSelected = yearOfStudy === y;
                  return (
                    <TouchableOpacity
                      key={y}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => setYearOfStudy(y)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {y}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* FORM SECTION 3: INTERNSHIP PREFERENCES */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>3</Text>
              </View>
              <Text style={styles.sectionTitle}>Internship Preferences</Text>
            </View>

            {/* Domain Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Internship Track / Domain <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.domainList}>
                {INTERNSHIP_DOMAINS.map((d) => {
                  const isSelected = domain === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[styles.domainItem, isSelected && styles.domainItemSelected]}
                      onPress={() => setDomain(d)}
                      activeOpacity={0.75}
                    >
                      <View style={styles.domainRadio}>
                        {isSelected && <View style={styles.domainRadioInner} />}
                      </View>
                      <Text style={[styles.domainText, isSelected && styles.domainTextSelected]}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Duration */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Duration <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.chipsWrap}>
                {INTERNSHIP_DURATIONS.map((dur) => {
                  const isSelected = duration === dur;
                  return (
                    <TouchableOpacity
                      key={dur}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => setDuration(dur)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {dur}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Preferred Learning Mode */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Preferred Mode <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.modeCardsRow}>
                {(
                  [
                    { id: 'CAMPUS', label: '🏫 Campus Lab', desc: 'Ludhiana Offline' },
                    { id: 'ONLINE', label: '🌐 Live Online', desc: 'Interactive G-Meet' },
                    { id: 'HYBRID', label: '⚡ Hybrid Flex', desc: 'Campus + Online' },
                  ] as const
                ).map((m) => {
                  const isSelected = mode === m.id;
                  return (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.modeCard, isSelected && styles.modeCardSelected]}
                      onPress={() => setMode(m.id)}
                      activeOpacity={0.75}
                    >
                      <Text style={[styles.modeCardLabel, isSelected && styles.modeCardLabelSelected]}>
                        {m.label}
                      </Text>
                      <Text style={styles.modeCardDesc}>{m.desc}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Start Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>When Can You Start?</Text>
              <View style={styles.chipsWrap}>
                {START_DATES.map((st) => {
                  const isSelected = startDate === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      style={[styles.chip, isSelected && styles.chipSelected]}
                      onPress={() => setStartDate(st)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          {/* FORM SECTION 4: RESUME & GOALS */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>4</Text>
              </View>
              <Text style={styles.sectionTitle}>Upload Resume &amp; Goals</Text>
            </View>

            {/* Resume Upload Picker Component */}
            <View style={styles.inputGroup}>
              <View style={styles.uploadHeaderRow}>
                <Text style={styles.inputLabel}>
                  Upload Resume (PDF File) <Text style={styles.optionalText}>(Optional)</Text>
                </Text>
                <View style={styles.pdfBadge}>
                  <Text style={styles.pdfBadgeText}>📄 Max 5 MB</Text>
                </View>
              </View>

              {pickedFile ? (
                <View style={styles.pickedFileContainer}>
                  <View style={styles.fileIconWrap}>
                    <FileText size={22} color={Colors.primaryRose} />
                  </View>
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName} numberOfLines={1}>
                      {pickedFile.name}
                    </Text>
                    <Text style={styles.fileMeta}>
                      {pickedFile.size
                        ? pickedFile.size > 1024 * 1024
                          ? `${(pickedFile.size / (1024 * 1024)).toFixed(2)} MB • `
                          : `${(pickedFile.size / 1024).toFixed(1)} KB • `
                        : ''}
                      <Text style={{ color: '#16a34a', fontWeight: '700' }}>✓ Valid PDF (Max 5 MB)</Text>
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeFileBtn}
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
                  style={[styles.uploadBox, fileError ? styles.uploadBoxError : null]}
                  onPress={handlePickResume}
                  activeOpacity={0.8}
                >
                  <View style={styles.uploadIconWrap}>
                    <Upload size={22} color={Colors.primaryRose} />
                  </View>
                  <Text style={styles.uploadBoxTitle}>Select PDF Resume from Device</Text>
                  <Text style={styles.uploadBoxSubtitle}>
                    Strictly PDF (.pdf) format • Maximum size: 5 MB
                  </Text>
                </TouchableOpacity>
              )}

              {fileError ? (
                <Text style={styles.fileErrorText}>⚠️ {fileError}</Text>
              ) : null}
            </View>

            {/* Resume URL Fallback */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Or Resume / Drive / LinkedIn Link (Optional)</Text>
              <View style={styles.inputWrap}>
                <ExternalLink size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="https://drive.google.com/file/d/..."
                  placeholderTextColor={Colors.textLight}
                  keyboardType="url"
                  autoCapitalize="none"
                  value={resumeUrl}
                  onChangeText={setResumeUrl}
                />
              </View>
            </View>

            {/* Message / Questions */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>College NOC or Specific Queries (Optional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Tell us about your learning goals, timings, or if you need an acceptance letter for your college..."
                placeholderTextColor={Colors.textLight}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                value={message}
                onChangeText={setMessage}
              />
            </View>
          </View>

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Submit Internship Application</Text>
                <ArrowLeft
                  size={18}
                  color="#ffffff"
                  style={{ transform: [{ rotate: '180deg' }] }}
                />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.trustFooterText}>
            🔒 100% Free Application • ISO &amp; MSME Recognized Certification
          </Text>

          {/* Helpline Callout */}
          <View style={styles.helpBox}>
            <Text style={styles.helpBoxText}>Have questions about syllabus or batches?</Text>
            <TouchableOpacity onPress={handleCallHelpline} activeOpacity={0.7}>
              <Text style={styles.helpBoxLink}>📞 Call Admissions Helpline: +91-97793-24178</Text>
            </TouchableOpacity>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    ...Shadows.small,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 1,
  },
  callHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff1f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  heroBanner: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    ...Shadows.medium,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(230, 8, 112, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(230, 8, 112, 0.4)',
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fda4af',
    letterSpacing: 0.5,
  },
  heroSubBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 26,
    marginBottom: 8,
  },
  heroText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#cbd5e1',
    lineHeight: 18,
    marginBottom: 16,
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  pillarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pillarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Shadows.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    paddingBottom: 10,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff1f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.primaryRose,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  required: {
    color: Colors.primaryRose,
    fontWeight: '800',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: 46,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  phoneInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    overflow: 'hidden',
  },
  countryCodeBadge: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  phoneTextInput: {
    flex: 1,
    height: 46,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipSelected: {
    backgroundColor: '#fff1f2',
    borderColor: Colors.primaryRose,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextSelected: {
    color: Colors.primaryRose,
    fontWeight: '800',
  },
  domainList: {
    gap: 8,
  },
  domainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  domainItemSelected: {
    backgroundColor: '#fff1f2',
    borderColor: Colors.primaryRose,
  },
  domainRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.textLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  domainRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryRose,
  },
  domainText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  domainTextSelected: {
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  modeCardsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 10,
  },
  modeCardSelected: {
    backgroundColor: '#fff1f2',
    borderColor: Colors.primaryRose,
  },
  modeCardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  modeCardLabelSelected: {
    color: Colors.primaryRose,
    fontWeight: '800',
  },
  modeCardDesc: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  textArea: {
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
  uploadHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  optionalText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  pdfBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  pdfBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b45309',
    letterSpacing: 0.3,
  },
  uploadBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBoxError: {
    borderColor: '#fca5a5',
    backgroundColor: '#fff1f2',
  },
  uploadIconWrap: {
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
    marginBottom: 3,
  },
  uploadBoxSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    textAlign: 'center',
  },
  pickedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1.5,
    borderColor: '#86efac',
    borderRadius: 16,
    padding: 12,
  },
  fileIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  fileMeta: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textMuted,
    marginTop: 2,
  },
  removeFileBtn: {
    padding: 8,
  },
  fileErrorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#dc2626',
    marginTop: 6,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primaryRose,
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 6,
    ...Shadows.medium,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  trustFooterText: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 10,
  },
  helpBox: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginTop: 18,
    gap: 4,
  },
  helpBoxText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  helpBoxLink: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryRose,
  },

  // SUCCESS VIEW STYLES
  successContent: {
    padding: 24,
    alignItems: 'center',
  },
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  successBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803d',
    letterSpacing: 0.5,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  summaryCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    ...Shadows.small,
  },
  summaryHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 8,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  whatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 10,
    ...Shadows.small,
  },
  whatsAppBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: Colors.primaryRose,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  callBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  doneBtn: {
    paddingVertical: 12,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
});
