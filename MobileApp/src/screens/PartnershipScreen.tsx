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
} from 'react-native';
import { Colors, Shadows } from '../theme/colors';
import { ApiService } from '../services/api';
import {
  ArrowLeft,
  GraduationCap,
  HeartHandshake,
  CheckCircle,
  Building,
  User,
  Mail,
  Phone,
  MapPin,
  Users,
  BookOpen,
  FileText,
  PhoneCall,
  Sparkles,
} from 'lucide-react-native';

const COLLEGE_CATEGORIES = [
  'Engineering & Tech (B.Tech)',
  'Computer Apps (BCA / MCA)',
  'Polytechnic / Diploma',
  'Management (BBA / MBA)',
  'Degree College / University',
  'Skill Training Institute',
];

const CHARITY_CATEGORIES = [
  'Educational Non-Profit Trust',
  'Youth Empowerment NGO',
  'Child Welfare / Social Foundation',
  'Social Welfare Society',
  'Community Non-Profit Organization',
  'CSR / Philanthropic Foundation',
];

const STUDENT_COUNTS = [
  '25 - 50 students',
  '50 - 150 students',
  '150 - 300 students',
  '300 - 500 students',
  '500+ students',
];

const COLLEGE_INTERESTS = [
  '6-Month Industrial Training',
  '6-Week Summer Training',
  'Web Dev & Full Stack',
  'Python, AI & Data Science',
  'Digital Marketing Bootcamp',
  'Campus Placement Drives',
  'Student Discount Batches',
];

const CHARITY_INTERESTS = [
  '100% Free Web Development',
  'Basic Computer Literacy',
  'Graphic Designing',
  'Digital Marketing Basics',
  'Free Recognized Certificates',
  'Interview & Career Prep',
  '1-on-1 Mentor Guidance',
];

export const PartnershipScreen: React.FC<{ navigation: any; route?: any }> = ({
  navigation,
  route,
}) => {
  const initialType: 'COLLEGE' | 'CHARITY' =
    route?.params?.defaultType === 'CHARITY' ? 'CHARITY' : 'COLLEGE';

  const [partnerType, setPartnerType] = useState<'COLLEGE' | 'CHARITY'>(initialType);
  const [organizationName, setOrganizationName] = useState('');
  const [category, setCategory] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [designation, setDesignation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Punjab');
  const [studentCount, setStudentCount] = useState(STUDENT_COUNTS[1]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCollege = partnerType === 'COLLEGE';

  const toggleInterest = (item: string) => {
    setSelectedInterests(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleTypeSwitch = (type: 'COLLEGE' | 'CHARITY') => {
    setPartnerType(type);
    setSelectedInterests([]);
    setCategory('');
  };

  const handleSubmit = async () => {
    if (
      !organizationName.trim() ||
      !contactPerson.trim() ||
      !designation.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !city.trim() ||
      !state.trim() ||
      !studentCount.trim()
    ) {
      Alert.alert(
        'Required Fields Missing',
        'Please complete all required fields marked with *.'
      );
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert('Invalid Email', 'Please enter a valid official email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await ApiService.submitPartnershipApplication({
        type: partnerType,
        organizationName: organizationName.trim(),
        category: category.trim() || undefined,
        contactPerson: contactPerson.trim(),
        designation: designation.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        city: city.trim(),
        state: state.trim(),
        studentCount: studentCount.trim(),
        interestAreas: selectedInterests.join(', '),
        registrationNumber: registrationNumber.trim() || undefined,
        message: message.trim() || undefined,
      });

      if (res?.success) {
        Alert.alert(
          isCollege ? '🎓 Proposal Submitted!' : '🌱 Request Received!',
          res.message ||
            (isCollege
              ? 'Thank you! Our Institutional Partnership Dean will connect with your college to activate student benefits.'
              : 'Thank you! We are proud to partner with your non-profit organization to provide 100% free education to your students.'),
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Submission Error', res?.error || 'Unable to submit application.');
      }
    } catch (e: any) {
      Alert.alert('Network Error', e?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* HEADER */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <ArrowLeft size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.navTitleWrap}>
          <Text style={styles.navTitle}>Partner With Us</Text>
          <Text style={styles.navSubtitle}>Colleges & Free Edu Non-Profit Orgs</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* TAB SWITCHER */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, isCollege && styles.tabButtonActiveBlue]}
            onPress={() => handleTypeSwitch('COLLEGE')}
            activeOpacity={0.8}
          >
            <GraduationCap
              size={18}
              color={isCollege ? '#1d4ed8' : Colors.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                isCollege && { color: '#1d4ed8', fontWeight: '800' },
              ]}
            >
              Colleges & Unis
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, !isCollege && styles.tabButtonActiveGreen]}
            onPress={() => handleTypeSwitch('CHARITY')}
            activeOpacity={0.8}
          >
            <HeartHandshake
              size={18}
              color={!isCollege ? '#047857' : Colors.textMuted}
            />
            <View>
              <Text
                style={[
                  styles.tabText,
                  !isCollege && { color: '#047857', fontWeight: '800' },
                ]}
              >
                Non-Profit Orgs
              </Text>
              <Text style={styles.freeBadgeText}>100% Free Edu</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* HERO BANNER */}
        <View
          style={[
            styles.heroBanner,
            isCollege ? styles.heroBannerBlue : styles.heroBannerGreen,
          ]}
        >
          <View style={styles.heroBadgeRow}>
            <Sparkles size={14} color="#ffffff" />
            <Text style={styles.heroBadgeText}>
              {isCollege
                ? 'CAMPUS CONNECT & STUDENT BENEFITS'
                : 'SOCIAL IMPACT & 100% FREE EDUCATION'}
            </Text>
          </View>
          <Text style={styles.heroTitle}>
            {isCollege
              ? 'Partner Your College with Flymedia'
              : 'Free Tech Education for Non-Profit Orgs'}
          </Text>
          <Text style={styles.heroDesc}>
            {isCollege
              ? 'Provide your students with subsidized industrial training, verified ISO certifications, project portfolios, and campus placement drives.'
              : 'Running a non-profit organization or community NGO? We provide 100% free courses, live mentors, and certificates to your underprivileged students.'}
          </Text>
        </View>

        {/* SECTION 1: ORGANIZATION INFO */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <Building size={18} color={isCollege ? '#2563eb' : '#059669'} />
            <Text style={styles.sectionCardTitle}>
              {isCollege ? 'College / Institute Information' : 'Non-Profit Organization Information'}
            </Text>
          </View>

          <Text style={styles.inputLabel}>
            {isCollege ? 'Institution / College Name *' : 'Non-Profit Org / NGO Name *'}
          </Text>
          <TextInput
            style={styles.textInput}
            value={organizationName}
            onChangeText={setOrganizationName}
            placeholder={
              isCollege
                ? 'e.g. Guru Nanak Dev Engineering College'
                : 'e.g. Hope Social Foundation / NGO'
            }
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.inputLabel}>
            {isCollege ? 'Institution Category' : 'Non-Profit Org Category'}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {(isCollege ? COLLEGE_CATEGORIES : CHARITY_CATEGORIES).map(cat => {
              const active = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    active &&
                      (isCollege ? styles.chipActiveBlue : styles.chipActiveGreen),
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active &&
                        (isCollege
                          ? styles.chipTextActiveBlue
                          : styles.chipTextActiveGreen),
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.inputLabel}>
            {isCollege ? 'AISHE / Affiliation Code (Optional)' : 'NGO Reg # / Darpan ID (Optional)'}
          </Text>
          <TextInput
            style={styles.textInput}
            value={registrationNumber}
            onChangeText={setRegistrationNumber}
            placeholder={isCollege ? 'e.g. C-12345 or PTU/PU Affiliated' : 'e.g. NGO Reg # / Darpan ID / 12A'}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* SECTION 2: CONTACT REPRESENTATIVE */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <User size={18} color={isCollege ? '#2563eb' : '#059669'} />
            <Text style={styles.sectionCardTitle}>Authorized Representative</Text>
          </View>

          <Text style={styles.inputLabel}>Representative Full Name *</Text>
          <TextInput
            style={styles.textInput}
            value={contactPerson}
            onChangeText={setContactPerson}
            placeholder="e.g. Dr. Harpreet Singh / Sunita Sharma"
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.inputLabel}>Designation / Role *</Text>
          <TextInput
            style={styles.textInput}
            value={designation}
            onChangeText={setDesignation}
            placeholder={
              isCollege
                ? 'e.g. Head of Training & Placement (TPO) / Dean'
                : 'e.g. Managing Trustee / Founder / Director'
            }
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.inputLabel}>Official Email *</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder={isCollege ? 'tpo@college.edu.in' : 'contact@ngo-org.org'}
            placeholderTextColor="#94a3b8"
          />

          <Text style={styles.inputLabel}>Contact Phone / WhatsApp *</Text>
          <TextInput
            style={styles.textInput}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="+91-98765-43210"
            placeholderTextColor="#94a3b8"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.inputLabel}>City / Campus *</Text>
              <TextInput
                style={styles.textInput}
                value={city}
                onChangeText={setCity}
                placeholder="e.g. Ludhiana"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.inputLabel}>State *</Text>
              <TextInput
                style={styles.textInput}
                value={state}
                onChangeText={setState}
                placeholder="e.g. Punjab"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>
        </View>

        {/* SECTION 3: STUDENTS & TRAINING DOMAINS */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionCardHeader}>
            <Users size={18} color={isCollege ? '#2563eb' : '#059669'} />
            <Text style={styles.sectionCardTitle}>
              {isCollege ? 'Student Batch Size & Goals' : 'Free Learning Requirements'}
            </Text>
          </View>

          <Text style={styles.inputLabel}>
            {isCollege
              ? 'Estimated Students for Training Benefits *'
              : 'Number of Underprivileged Students Supported *'}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {STUDENT_COUNTS.map(count => {
              const active = studentCount === count;
              return (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.chip,
                    active &&
                      (isCollege ? styles.chipActiveBlue : styles.chipActiveGreen),
                  ]}
                  onPress={() => setStudentCount(count)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active &&
                        (isCollege
                          ? styles.chipTextActiveBlue
                          : styles.chipTextActiveGreen),
                    ]}
                  >
                    {count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.inputLabel}>Programs / Domains Interested In</Text>
          <View style={styles.interestsGrid}>
            {(isCollege ? COLLEGE_INTERESTS : CHARITY_INTERESTS).map(item => {
              const checked = selectedInterests.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.interestChip,
                    checked &&
                      (isCollege
                        ? styles.interestChipActiveBlue
                        : styles.interestChipActiveGreen),
                  ]}
                  onPress={() => toggleInterest(item)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkCircle,
                      checked &&
                        (isCollege
                          ? { backgroundColor: '#2563eb' }
                          : { backgroundColor: '#059669' }),
                    ]}
                  >
                    {checked && <CheckCircle size={14} color="#ffffff" />}
                  </View>
                  <Text
                    style={[
                      styles.interestChipText,
                      checked && { color: isCollege ? '#1e3a8a' : '#064e3b', fontWeight: '700' },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>
            {isCollege
              ? 'Special Requirements / Semester Timelines'
              : 'Student Background / Special Learning Needs'}
          </Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={3}
            placeholder={
              isCollege
                ? 'Mention target departments (e.g. CSE, IT, BCA) or tentative dates for industrial training...'
                : 'Tell us about the students, age groups, and how Flymedia can best empower them...'
            }
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* SUBMIT BUTTON */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isCollege ? styles.submitButtonBlue : styles.submitButtonGreen,
            isSubmitting && { opacity: 0.7 },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isCollege
                ? 'Submit College Tie-Up Proposal'
                : 'Submit Free Education Request'}
            </Text>
          )}
        </TouchableOpacity>

        {/* HELPLINE DESK CARD */}
        <View style={styles.helpCard}>
          <View style={styles.helpCardLeft}>
            <Text style={styles.helpCardTitle}>Direct Institutional Helpline</Text>
            <Text style={styles.helpCardDesc}>
              Speak directly with our Director of Academic & Social Partnerships
            </Text>
          </View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => Linking.openURL('tel:+919779324178')}
            activeOpacity={0.8}
          >
            <PhoneCall size={16} color="#ffffff" />
            <Text style={styles.callButtonText}>Call Desk</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 54 : 16,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    ...Shadows.small,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitleWrap: {
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  navSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  tabButtonActiveBlue: {
    backgroundColor: '#ffffff',
    ...Shadows.small,
  },
  tabButtonActiveGreen: {
    backgroundColor: '#ffffff',
    ...Shadows.small,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  freeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    textTransform: 'uppercase',
  },
  heroBanner: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    ...Shadows.medium,
  },
  heroBannerBlue: {
    backgroundColor: '#1e3a8a',
  },
  heroBannerGreen: {
    backgroundColor: '#064e3b',
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 6,
  },
  heroDesc: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    lineHeight: 18,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...Shadows.small,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
    marginBottom: 12,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  chipsScroll: {
    paddingVertical: 4,
    gap: 8,
  },
  chip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  chipActiveBlue: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  chipActiveGreen: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  chipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActiveBlue: {
    color: '#1d4ed8',
    fontWeight: '800',
  },
  chipTextActiveGreen: {
    color: '#047857',
    fontWeight: '800',
  },
  interestsGrid: {
    gap: 8,
    marginTop: 4,
  },
  interestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 10,
  },
  interestChipActiveBlue: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  interestChipActiveGreen: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestChipText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  submitButton: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    ...Shadows.medium,
  },
  submitButtonBlue: {
    backgroundColor: '#2563eb',
  },
  submitButtonGreen: {
    backgroundColor: '#059669',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  helpCard: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  helpCardLeft: {
    flex: 1,
  },
  helpCardTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  helpCardDesc: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 15,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8750e',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
});
