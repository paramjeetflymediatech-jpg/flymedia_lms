import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Linking,
  Image,
} from 'react-native';
import { formatImageUrl } from '../../utils/imageUrl';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../../theme/colors';
import { User, EducationDetails, AddressDetails, FamilyDetails } from '../../types';
import { FlymediaContact } from '../../constants/contact';
import {
  X,
  Menu,
  User as UserIcon,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  Users,
  Briefcase,
  Check,
  CheckCircle2,
  BookOpen,
  Home,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  MessageCircle,
  RotateCcw,
  ChevronRight,
  HelpCircle,
  Building,
  Mail,
  Compass,
} from 'lucide-react-native';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: User;
  onSave: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const QUALIFICATION_OPTIONS = [
  '10th Matriculation',
  '12th Senior Secondary',
  'Diploma / Polytechnic',
  'BCA',
  'B.Tech / B.E',
  'B.Sc / IT',
  'B.Com / BBA',
  'MCA / M.Tech',
  'Post Graduate',
  'Other Degree',
];

const CATEGORY_OPTIONS = [
  { label: 'General', desc: 'Open Merit' },
  { label: 'OBC', desc: 'Other Backward Class' },
  { label: 'SC', desc: 'Scheduled Caste' },
  { label: 'ST', desc: 'Scheduled Tribe' },
  { label: 'EWS', desc: 'Economically Weaker Section' },
  { label: 'Other', desc: 'Special Category' },
];

const OCCUPATION_OPTIONS = [
  'Business / Trade',
  'Government Sector',
  'Private / IT Corporate',
  'Agriculture / Farming',
  'Self-Employed / Professional',
  'Other',
];

const INCOME_OPTIONS = [
  'Below ₹2.5 Lakhs',
  '₹2.5L - ₹5 Lakhs',
  '₹5L - ₹10 Lakhs',
  'Above ₹10 Lakhs',
];

type SectionTab = 'personal' | 'education' | 'address' | 'family';

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  user,
  onSave,
}) => {
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'ios' ? 44 : 20);
  const bottomPadding = Math.max(insets.bottom, 16);

  const [activeTab, setActiveTab] = useState<SectionTab>('personal');
  const [saving, setSaving] = useState(false);
  const [hamburgerOpen, setHamburgerOpen] = useState(false);

  // Form states
  const [name, setName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [bio, setBio] = useState(user.bio || '');

  // Education Details
  const edu: EducationDetails = user.educationDetails || {};
  const [highestQualification, setHighestQualification] = useState(edu.highestQualification || '');
  const [collegeOrSchool, setCollegeOrSchool] = useState(edu.collegeOrSchool || '');
  const [passingYear, setPassingYear] = useState(edu.passingYear || '');
  const [percentageOrCgpa, setPercentageOrCgpa] = useState(edu.percentageOrCgpa || '');
  const [currentlyStudying, setCurrentlyStudying] = useState<boolean>(
    edu.currentlyStudying !== undefined ? edu.currentlyStudying : false
  );
  const [currentCourse, setCurrentCourse] = useState(edu.currentCourse || '');
  const [currentInstitution, setCurrentInstitution] = useState(edu.currentInstitution || '');

  // Address Details
  const addr: AddressDetails = user.addressDetails || {};
  const [addressLine, setAddressLine] = useState(addr.addressLine || '');
  const [city, setCity] = useState(addr.city || '');
  const [state, setState] = useState(addr.state || 'Punjab');
  const [pincode, setPincode] = useState(addr.pincode || '');

  // Family Details
  const fam: FamilyDetails = user.familyDetails || {};
  const [fatherName, setFatherName] = useState(fam.fatherName || '');
  const [motherName, setMotherName] = useState(fam.motherName || '');
  const [guardianPhone, setGuardianPhone] = useState(fam.guardianPhone || '');
  const [familyOccupation, setFamilyOccupation] = useState(fam.familyOccupation || '');
  const [annualIncome, setAnnualIncome] = useState(fam.annualIncome || '');

  // Category
  const [studentCategory, setStudentCategory] = useState(user.studentCategory || 'General');

  // Reset form whenever modal opens with fresh user data
  useEffect(() => {
    if (visible && user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');

      const e: EducationDetails = user.educationDetails || {};
      setHighestQualification(e.highestQualification || '');
      setCollegeOrSchool(e.collegeOrSchool || '');
      setPassingYear(e.passingYear || '');
      setPercentageOrCgpa(e.percentageOrCgpa || '');
      setCurrentlyStudying(e.currentlyStudying !== undefined ? e.currentlyStudying : false);
      setCurrentCourse(e.currentCourse || '');
      setCurrentInstitution(e.currentInstitution || '');

      const a: AddressDetails = user.addressDetails || {};
      setAddressLine(a.addressLine || '');
      setCity(a.city || '');
      setState(a.state || 'Punjab');
      setPincode(a.pincode || '');

      const f: FamilyDetails = user.familyDetails || {};
      setFatherName(f.fatherName || '');
      setMotherName(f.motherName || '');
      setGuardianPhone(f.guardianPhone || '');
      setFamilyOccupation(f.familyOccupation || '');
      setAnnualIncome(f.annualIncome || '');

      setStudentCategory(user.studentCategory || 'General');
      setHamburgerOpen(false);
    }
  }, [visible, user]);

  // Compute profile completion score
  const computeCompletion = () => {
    let score = 0;
    if (name.trim()) score += 15;
    if (phone.trim()) score += 10;
    if (studentCategory) score += 10;
    if (highestQualification) score += 15;
    if (collegeOrSchool.trim()) score += 10;
    if (addressLine.trim() || city.trim()) score += 15;
    if (fatherName.trim() || motherName.trim()) score += 15;
    if (guardianPhone.trim() || familyOccupation) score += 10;
    return Math.min(score, 100);
  };

  const completionPct = computeCompletion();

  const handleResetForm = () => {
    Alert.alert(
      'Reset Changes',
      'Are you sure you want to discard unsaved edits and reset to your current saved profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setName(user.name || '');
            setPhone(user.phone || '');
            setBio(user.bio || '');
            const e = user.educationDetails || {};
            setHighestQualification(e.highestQualification || '');
            setCollegeOrSchool(e.collegeOrSchool || '');
            setPassingYear(e.passingYear || '');
            setPercentageOrCgpa(e.percentageOrCgpa || '');
            setCurrentlyStudying(e.currentlyStudying || false);
            setCurrentCourse(e.currentCourse || '');
            setCurrentInstitution(e.currentInstitution || '');
            const a = user.addressDetails || {};
            setAddressLine(a.addressLine || '');
            setCity(a.city || '');
            setState(a.state || 'Punjab');
            setPincode(a.pincode || '');
            const f = user.familyDetails || {};
            setFatherName(f.fatherName || '');
            setMotherName(f.motherName || '');
            setGuardianPhone(f.guardianPhone || '');
            setFamilyOccupation(f.familyOccupation || '');
            setAnnualIncome(f.annualIncome || '');
            setStudentCategory(user.studentCategory || 'General');
            setHamburgerOpen(false);
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your full name.');
      setActiveTab('personal');
      return;
    }

    setSaving(true);
    const payload: Partial<User> = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      bio: bio.trim() || undefined,
      educationDetails: {
        highestQualification: highestQualification || undefined,
        collegeOrSchool: collegeOrSchool.trim() || undefined,
        passingYear: passingYear.trim() || undefined,
        percentageOrCgpa: percentageOrCgpa.trim() || undefined,
        currentlyStudying,
        currentCourse: currentlyStudying ? currentCourse.trim() : undefined,
        currentInstitution: currentlyStudying ? currentInstitution.trim() : undefined,
      },
      addressDetails: {
        addressLine: addressLine.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        pincode: pincode.trim() || undefined,
      },
      familyDetails: {
        fatherName: fatherName.trim() || undefined,
        motherName: motherName.trim() || undefined,
        guardianPhone: guardianPhone.trim() || undefined,
        familyOccupation: familyOccupation || undefined,
        annualIncome: annualIncome || undefined,
      },
      studentCategory,
    };

    const res = await onSave(payload);
    setSaving(false);

    if (res.success) {
      Alert.alert('Profile Saved 🎉', 'Your academic and background profile has been updated.');
      onClose();
    } else {
      Alert.alert('Update Failed', res.error || 'Could not save profile details. Please try again.');
    }
  };

  const jumpToTab = (tab: SectionTab) => {
    setActiveTab(tab);
    setHamburgerOpen(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalScreen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ================= TOP HEADER WITH HAMBURGER ================= */}
        <View style={[styles.header, { paddingTop: topPadding + 6 }]}>
          <View style={styles.headerLeftGroup}>
            {/* Hamburger Button */}
            <TouchableOpacity
              onPress={() => setHamburgerOpen(true)}
              style={styles.hamburgerBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Menu size={20} color={Colors.textPrimary} strokeWidth={2.4} />
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={18} color={Colors.textMuted} strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Edit Student Profile
            </Text>
            <View style={styles.completionPill}>
              <Sparkles size={10} color={Colors.primaryRose} />
              <Text style={styles.completionPillText}>{completionPct}% Complete</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveHeaderBtn, saving && { opacity: 0.7 }]}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator size="small" color={Colors.textWhite} />
            ) : (
              <Text style={styles.saveHeaderBtnText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* PROGRESS STRIP */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${completionPct}%` }]} />
        </View>

        {/* ================= 4-TAB SEGMENTED CONTROLLER ================= */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'personal' && styles.tabItemActive]}
            onPress={() => setActiveTab('personal')}
          >
            <UserIcon
              size={14}
              color={activeTab === 'personal' ? Colors.primaryRose : Colors.textMuted}
            />
            <Text
              style={[styles.tabItemText, activeTab === 'personal' && styles.tabItemTextActive]}
            >
              Personal
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'education' && styles.tabItemActive]}
            onPress={() => setActiveTab('education')}
          >
            <GraduationCap
              size={14}
              color={activeTab === 'education' ? Colors.primaryRose : Colors.textMuted}
            />
            <Text
              style={[styles.tabItemText, activeTab === 'education' && styles.tabItemTextActive]}
            >
              Education
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'address' && styles.tabItemActive]}
            onPress={() => setActiveTab('address')}
          >
            <MapPin
              size={14}
              color={activeTab === 'address' ? Colors.primaryRose : Colors.textMuted}
            />
            <Text
              style={[styles.tabItemText, activeTab === 'address' && styles.tabItemTextActive]}
            >
              Address
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'family' && styles.tabItemActive]}
            onPress={() => setActiveTab('family')}
          >
            <Users
              size={14}
              color={activeTab === 'family' ? Colors.primaryRose : Colors.textMuted}
            />
            <Text
              style={[styles.tabItemText, activeTab === 'family' && styles.tabItemTextActive]}
            >
              Family
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= FORM BODY ================= */}
        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding + 36 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* TAB 1: PERSONAL & SOCIAL CATEGORY */}
          {activeTab === 'personal' && (
            <View>
              {/* Profile Card Summary */}
              <View style={styles.heroCard}>
                <View style={styles.heroAvatar}>
                  {user.avatar ? (
                    <Image
                      source={{ uri: formatImageUrl(user.avatar) }}
                      style={{ width: '100%', height: '100%', borderRadius: 28 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.heroAvatarText}>
                      {name ? name[0].toUpperCase() : 'U'}
                    </Text>
                  )}
                </View>
                <View style={styles.heroInfo}>
                  <Text style={styles.heroName}>{name || 'Student Name'}</Text>
                  <Text style={styles.heroEmail}>{user.email}</Text>
                  <View style={styles.heroBadgeRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {studentCategory || 'General'}
                      </Text>
                    </View>
                    <Text style={styles.roleLabel}>Student Account</Text>
                  </View>
                </View>
              </View>

              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: '#fdf2f8' }]}>
                    <UserIcon size={18} color={Colors.primaryRose} />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Basic Identification</Text>
                    <Text style={styles.sectionSubtitle}>Your official student name and phone</Text>
                  </View>
                </View>

                {/* Name */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>
                    Full Legal Name <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter your full name"
                    placeholderTextColor={Colors.textLight}
                    value={name}
                    onChangeText={setName}
                  />
                </View>

                {/* Phone */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>WhatsApp / Mobile Number</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="+91 98765 43210"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                  <Text style={styles.helperText}>
                    Used for class schedule alerts and certificate dispatch.
                  </Text>
                </View>

                {/* Email (Readonly) */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
                  <TextInput
                    style={[styles.textInput, styles.disabledInput]}
                    value={user.email}
                    editable={false}
                  />
                  <Text style={styles.helperText}>Registered primary login email.</Text>
                </View>

                {/* Bio */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Personal Bio & Career Goals</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="Briefly describe your career aspirations, interest in technology, or learning goals..."
                    placeholderTextColor={Colors.textLight}
                    multiline
                    numberOfLines={3}
                    value={bio}
                    onChangeText={setBio}
                  />
                </View>
              </View>

              {/* Social Category Section */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: '#fff7ed' }]}>
                    <Award size={18} color={Colors.primaryOrange} />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Social Category</Text>
                    <Text style={styles.sectionSubtitle}>
                      Required for admission quota and scholarship assistance
                    </Text>
                  </View>
                </View>

                <View style={styles.categoryGrid}>
                  {CATEGORY_OPTIONS.map(cat => {
                    const isSelected = studentCategory === cat.label;
                    return (
                      <TouchableOpacity
                        key={cat.label}
                        style={[
                          styles.categoryCard,
                          isSelected && styles.categoryCardActive,
                        ]}
                        onPress={() => setStudentCategory(cat.label)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.categoryRadio}>
                          {isSelected ? (
                            <View style={styles.categoryRadioDot} />
                          ) : null}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.categoryCardTitle,
                              isSelected && styles.categoryCardTitleActive,
                            ]}
                          >
                            {cat.label}
                          </Text>
                          <Text style={styles.categoryCardDesc}>{cat.desc}</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {/* TAB 2: EDUCATION BACKGROUND */}
          {activeTab === 'education' && (
            <View>
              {/* CURRENTLY STUDYING TOGGLE */}
              <View style={styles.toggleCard}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={styles.toggleTitle}>Are you currently studying?</Text>
                  <Text style={styles.toggleSubtitle}>
                    Active college, university or diploma program
                  </Text>
                </View>
                <View style={styles.togglePills}>
                  <TouchableOpacity
                    style={[styles.togglePillBtn, !currentlyStudying && styles.togglePillBtnActive]}
                    onPress={() => setCurrentlyStudying(false)}
                  >
                    <Text
                      style={[
                        styles.togglePillText,
                        !currentlyStudying && styles.togglePillTextActive,
                      ]}
                    >
                      Completed
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.togglePillBtn, currentlyStudying && styles.togglePillBtnActive]}
                    onPress={() => setCurrentlyStudying(true)}
                  >
                    <Text
                      style={[
                        styles.togglePillText,
                        currentlyStudying && styles.togglePillTextActive,
                      ]}
                    >
                      Studying
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Current Program Details (Visible if currently studying) */}
              {currentlyStudying && (
                <View style={styles.subCardHighlight}>
                  <View style={styles.subCardHeader}>
                    <BookOpen size={16} color="#1e40af" />
                    <Text style={styles.subCardTitle}>Active Higher Education Pursuit</Text>
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Current Course / Degree / Semester</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. BCA 3rd Sem, B.Tech CSE 2nd Year"
                      placeholderTextColor={Colors.textLight}
                      value={currentCourse}
                      onChangeText={setCurrentCourse}
                    />
                  </View>

                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>Current College / University</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Chandigarh University, GNDU"
                      placeholderTextColor={Colors.textLight}
                      value={currentInstitution}
                      onChangeText={setCurrentInstitution}
                    />
                  </View>
                </View>
              )}

              {/* Past Education History */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: '#f0fdf4' }]}>
                    <GraduationCap size={18} color="#059669" />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Highest Past Qualification</Text>
                    <Text style={styles.sectionSubtitle}>
                      Your highest achieved certificate, diploma or degree
                    </Text>
                  </View>
                </View>

                {/* Qualification Pills */}
                <View style={styles.pillWrap}>
                  {QUALIFICATION_OPTIONS.map(q => {
                    const isSelected = highestQualification === q;
                    return (
                      <TouchableOpacity
                        key={q}
                        style={[styles.selectPill, isSelected && styles.selectPillActive]}
                        onPress={() => setHighestQualification(q)}
                        activeOpacity={0.8}
                      >
                        {isSelected && <Check size={12} color={Colors.textWhite} />}
                        <Text
                          style={[
                            styles.selectPillText,
                            isSelected && styles.selectPillTextActive,
                          ]}
                        >
                          {q}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* College / Board */}
                <View style={[styles.fieldGroup, { marginTop: 16 }]}>
                  <Text style={styles.fieldLabel}>School / College / University Board</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Delhi Public School, Punjab University"
                    placeholderTextColor={Colors.textLight}
                    value={collegeOrSchool}
                    onChangeText={setCollegeOrSchool}
                  />
                </View>

                {/* Passing Year & CGPA in Two Columns */}
                <View style={styles.twoColRow}>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Passing Year</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="2023"
                      placeholderTextColor={Colors.textLight}
                      keyboardType="numeric"
                      value={passingYear}
                      onChangeText={setPassingYear}
                    />
                  </View>

                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Marks / CGPA</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="85% or 8.5"
                      placeholderTextColor={Colors.textLight}
                      value={percentageOrCgpa}
                      onChangeText={setPercentageOrCgpa}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* TAB 3: ADDRESS DETAILS */}
          {activeTab === 'address' && (
            <View>
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: '#eff6ff' }]}>
                    <Home size={18} color="#2563eb" />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Permanent / Current Address</Text>
                    <Text style={styles.sectionSubtitle}>
                      Required for certificates, ID cards and course materials
                    </Text>
                  </View>
                </View>

                {/* Street Address */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Flat / House / Street Address</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    placeholder="House / Flat No., Building, Street Name, Sector or Landmark..."
                    placeholderTextColor={Colors.textLight}
                    multiline
                    numberOfLines={2}
                    value={addressLine}
                    onChangeText={setAddressLine}
                  />
                </View>

                {/* City & State */}
                <View style={styles.twoColRow}>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>City / District</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Ludhiana, Mohali"
                      placeholderTextColor={Colors.textLight}
                      value={city}
                      onChangeText={setCity}
                    />
                  </View>

                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>State</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Punjab"
                      placeholderTextColor={Colors.textLight}
                      value={state}
                      onChangeText={setState}
                    />
                  </View>
                </View>

                {/* PIN Code */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Postal PIN Code</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="141013"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="numeric"
                    value={pincode}
                    onChangeText={setPincode}
                  />
                </View>
              </View>
            </View>
          )}

          {/* TAB 4: FAMILY INFORMATION */}
          {activeTab === 'family' && (
            <View>
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconWrap, { backgroundColor: '#fdf4ff' }]}>
                    <Users size={18} color="#c026d3" />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Family & Guardian Details</Text>
                    <Text style={styles.sectionSubtitle}>
                      Guardian background for counseling and emergencies
                    </Text>
                  </View>
                </View>

                {/* Father & Mother Names */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Father's Full Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter father's name"
                    placeholderTextColor={Colors.textLight}
                    value={fatherName}
                    onChangeText={setFatherName}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Mother's Full Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Enter mother's name"
                    placeholderTextColor={Colors.textLight}
                    value={motherName}
                    onChangeText={setMotherName}
                  />
                </View>

                {/* Guardian Phone */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Parent / Guardian Emergency Contact</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="+91 98123 45678"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="phone-pad"
                    value={guardianPhone}
                    onChangeText={setGuardianPhone}
                  />
                  <Text style={styles.helperText}>Contacted in emergency or fee discussions.</Text>
                </View>

                {/* Family Occupation */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Family Primary Occupation</Text>
                  <View style={styles.pillWrap}>
                    {OCCUPATION_OPTIONS.map(occ => {
                      const isSelected = familyOccupation === occ;
                      return (
                        <TouchableOpacity
                          key={occ}
                          style={[styles.selectPill, isSelected && styles.selectPillActive]}
                          onPress={() => setFamilyOccupation(occ)}
                          activeOpacity={0.8}
                        >
                          {isSelected && <Check size={12} color={Colors.textWhite} />}
                          <Text
                            style={[
                              styles.selectPillText,
                              isSelected && styles.selectPillTextActive,
                            ]}
                          >
                            {occ}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Annual Income */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Annual Household Income</Text>
                  <View style={styles.pillWrap}>
                    {INCOME_OPTIONS.map(inc => {
                      const isSelected = annualIncome === inc;
                      return (
                        <TouchableOpacity
                          key={inc}
                          style={[styles.selectPill, isSelected && styles.selectPillActive]}
                          onPress={() => setAnnualIncome(inc)}
                          activeOpacity={0.8}
                        >
                          {isSelected && <Check size={12} color={Colors.textWhite} />}
                          <Text
                            style={[
                              styles.selectPillText,
                              isSelected && styles.selectPillTextActive,
                            ]}
                          >
                            {inc}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <Text style={styles.helperText}>
                    Kept strictly confidential; used for fee installment plans and scholarships.
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* BOTTOM QUICK ACTIONS */}
          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.bottomSaveBtn}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.82}
            >
              {saving ? (
                <ActivityIndicator size="small" color={Colors.textWhite} />
              ) : (
                <>
                  <CheckCircle2 size={18} color={Colors.textWhite} />
                  <Text style={styles.bottomSaveBtnText}>Save Complete Dossier</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.bottomNavButtons}>
              <TouchableOpacity
                style={styles.bottomOutlineBtn}
                onPress={() => {
                  if (activeTab === 'personal') setActiveTab('education');
                  else if (activeTab === 'education') setActiveTab('address');
                  else if (activeTab === 'address') setActiveTab('family');
                  else handleSave();
                }}
              >
                <Text style={styles.bottomOutlineBtnText}>
                  {activeTab === 'family' ? 'Finish & Save' : 'Next Section →'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* ================= HAMBURGER DRAWER MODAL ================= */}
        <Modal
          visible={hamburgerOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setHamburgerOpen(false)}
        >
          <View style={styles.drawerBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setHamburgerOpen(false)}
            />

            <View style={[styles.drawerContent, { paddingTop: topPadding + 10, paddingBottom: bottomPadding + 16 }]}>
              {/* Drawer Header */}
              <View style={styles.drawerHeader}>
                <View style={styles.drawerAvatarWrap}>
                  {user.avatar ? (
                    <Image
                      source={{ uri: formatImageUrl(user.avatar) }}
                      style={{ width: '100%', height: '100%', borderRadius: 22 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.drawerAvatarText}>
                      {name ? name[0].toUpperCase() : 'U'}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.drawerStudentName} numberOfLines={1}>
                    {name || user.name || 'Student'}
                  </Text>
                  <Text style={styles.drawerStudentEmail} numberOfLines={1}>
                    {user.email}
                  </Text>
                  <View style={styles.drawerCategoryBadge}>
                    <Text style={styles.drawerCategoryBadgeText}>
                      {studentCategory || 'General'} Category
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.drawerCloseBtn}
                  onPress={() => setHamburgerOpen(false)}
                  activeOpacity={0.7}
                >
                  <X size={18} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>

              {/* Completion Bar */}
              <View style={styles.drawerMeterBox}>
                <View style={styles.drawerMeterLabelRow}>
                  <Text style={styles.drawerMeterTitle}>Profile Strength</Text>
                  <Text style={styles.drawerMeterPct}>{completionPct}%</Text>
                </View>
                <View style={styles.drawerMeterTrack}>
                  <View style={[styles.drawerMeterFill, { width: `${completionPct}%` }]} />
                </View>
                <Text style={styles.drawerMeterSub}>
                  {completionPct >= 80
                    ? '🎉 Excellent! Eligible for campus placement & scholarships.'
                    : 'Complete education and family details to reach 100%.'}
                </Text>
              </View>

              {/* Navigation Links */}
              <Text style={styles.drawerSectionHeading}>JUMP TO SECTION</Text>

              <TouchableOpacity
                style={[styles.drawerNavItem, activeTab === 'personal' && styles.drawerNavItemActive]}
                onPress={() => jumpToTab('personal')}
              >
                <View style={[styles.drawerNavIcon, { backgroundColor: '#fdf2f8' }]}>
                  <UserIcon size={16} color={Colors.primaryRose} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.drawerNavTitle, activeTab === 'personal' && styles.drawerNavTitleActive]}>
                    Personal Information
                  </Text>
                  <Text style={styles.drawerNavSub}>Name, phone, bio, and social category</Text>
                </View>
                <ChevronRight size={16} color={Colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerNavItem, activeTab === 'education' && styles.drawerNavItemActive]}
                onPress={() => jumpToTab('education')}
              >
                <View style={[styles.drawerNavIcon, { backgroundColor: '#f0fdf4' }]}>
                  <GraduationCap size={16} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.drawerNavTitle, activeTab === 'education' && styles.drawerNavTitleActive]}>
                    Education & Background
                  </Text>
                  <Text style={styles.drawerNavSub}>Highest degree, current college & marks</Text>
                </View>
                <ChevronRight size={16} color={Colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerNavItem, activeTab === 'address' && styles.drawerNavItemActive]}
                onPress={() => jumpToTab('address')}
              >
                <View style={[styles.drawerNavIcon, { backgroundColor: '#eff6ff' }]}>
                  <MapPin size={16} color="#2563eb" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.drawerNavTitle, activeTab === 'address' && styles.drawerNavTitleActive]}>
                    Address & Residence
                  </Text>
                  <Text style={styles.drawerNavSub}>Street, city, state and PIN code</Text>
                </View>
                <ChevronRight size={16} color={Colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.drawerNavItem, activeTab === 'family' && styles.drawerNavItemActive]}
                onPress={() => jumpToTab('family')}
              >
                <View style={[styles.drawerNavIcon, { backgroundColor: '#fdf4ff' }]}>
                  <Users size={16} color="#c026d3" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.drawerNavTitle, activeTab === 'family' && styles.drawerNavTitleActive]}>
                    Family & Guardian
                  </Text>
                  <Text style={styles.drawerNavSub}>Parents, emergency contact & income</Text>
                </View>
                <ChevronRight size={16} color={Colors.textMuted} />
              </TouchableOpacity>

              {/* Tools & Assistance */}
              <Text style={[styles.drawerSectionHeading, { marginTop: 18 }]}>COUNSELOR & SUPPORT</Text>

              <TouchableOpacity
                style={styles.drawerActionRow}
                onPress={() => Linking.openURL(`tel:${FlymediaContact.phoneRaw}`)}
                activeOpacity={0.7}
              >
                <View style={[styles.drawerActionIcon, { backgroundColor: '#fdf2f8' }]}>
                  <PhoneCall size={14} color={Colors.primaryRose} />
                </View>
                <Text style={styles.drawerActionText}>Call Counselor: {FlymediaContact.phoneDisplay}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerActionRow}
                onPress={() => Linking.openURL(FlymediaContact.whatsappUrl)}
                activeOpacity={0.7}
              >
                <View style={[styles.drawerActionIcon, { backgroundColor: '#ecfdf5' }]}>
                  <MessageCircle size={14} color="#059669" />
                </View>
                <Text style={styles.drawerActionText}>WhatsApp Admission Desk</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.drawerActionRow}
                onPress={handleResetForm}
                activeOpacity={0.7}
              >
                <View style={[styles.drawerActionIcon, { backgroundColor: '#fef2f2' }]}>
                  <RotateCcw size={14} color={Colors.error} />
                </View>
                <Text style={[styles.drawerActionText, { color: Colors.error }]}>Discard Unsaved Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalScreen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
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
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hamburgerBtn: {
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
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  completionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  completionPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  saveHeaderBtn: {
    backgroundColor: Colors.primaryRose,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: Colors.primaryRose,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 2,
  },
  saveHeaderBtnText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  progressTrack: {
    height: 3,
    backgroundColor: '#f1f5f9',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primaryRose,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  tabItemActive: {
    backgroundColor: '#fdf2f8',
    borderColor: 'rgba(230, 8, 112, 0.3)',
  },
  tabItemText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  tabItemTextActive: {
    color: Colors.primaryRose,
  },
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 14,
    ...Shadows.small,
  },
  heroAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fdf2f8',
    borderWidth: 2,
    borderColor: 'rgba(230, 8, 112, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarText: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primaryRose,
  },
  heroInfo: {
    flex: 1,
  },
  heroName: {
    fontSize: 17,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  heroEmail: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  categoryBadge: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#c2410c',
    textTransform: 'uppercase',
  },
  roleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    ...Shadows.small,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  sectionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 7,
  },
  requiredStar: {
    color: Colors.primaryRose,
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  textArea: {
    minHeight: 65,
    textAlignVertical: 'top',
  },
  disabledInput: {
    backgroundColor: '#f1f5f9',
    color: Colors.textMuted,
  },
  helperText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
    lineHeight: 15,
  },
  categoryGrid: {
    gap: 10,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    gap: 12,
  },
  categoryCardActive: {
    backgroundColor: '#fff7ed',
    borderColor: Colors.primaryOrange,
  },
  categoryRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.primaryOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryOrange,
  },
  categoryCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  categoryCardTitleActive: {
    color: Colors.primaryOrange,
  },
  categoryCardDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  selectPillActive: {
    backgroundColor: Colors.primaryRose,
    borderColor: Colors.primaryRose,
  },
  selectPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  selectPillTextActive: {
    color: Colors.textWhite,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
    ...Shadows.small,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  toggleSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  togglePills: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 3,
  },
  togglePillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  togglePillBtnActive: {
    backgroundColor: Colors.primaryRose,
  },
  togglePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  togglePillTextActive: {
    color: Colors.textWhite,
  },
  subCardHighlight: {
    backgroundColor: '#eff6ff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    marginBottom: 16,
  },
  subCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  subCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1e40af',
  },
  bottomActions: {
    marginTop: 10,
    gap: 10,
  },
  bottomSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primaryRose,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: Colors.primaryRose,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomSaveBtnText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '800',
  },
  bottomNavButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  bottomOutlineBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  bottomOutlineBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },

  /* DRAWER STYLES */
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-start',
  },
  drawerContent: {
    width: '84%',
    maxWidth: 340,
    height: '100%',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  drawerAvatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fdf2f8',
    borderWidth: 1.5,
    borderColor: 'rgba(230, 8, 112, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerAvatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.primaryRose,
  },
  drawerStudentName: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  drawerStudentEmail: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  drawerCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffedd5',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 4,
  },
  drawerCategoryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#c2410c',
  },
  drawerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerMeterBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  drawerMeterLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  drawerMeterTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  drawerMeterPct: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.primaryRose,
  },
  drawerMeterTrack: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  drawerMeterFill: {
    height: '100%',
    backgroundColor: Colors.primaryRose,
  },
  drawerMeterSub: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 6,
    lineHeight: 14,
  },
  drawerSectionHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  drawerNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  drawerNavItemActive: {
    backgroundColor: '#fdf2f8',
  },
  drawerNavIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerNavTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  drawerNavTitleActive: {
    color: Colors.primaryRose,
    fontWeight: '800',
  },
  drawerNavSub: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  drawerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  drawerActionIcon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});
