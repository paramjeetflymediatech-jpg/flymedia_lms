import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Shadows } from '../../theme/colors';
import { FlymediaContact } from '../../constants/contact';
import {
  X,
  FileText,
  ShieldCheck,
  Trash2,
  Info,
  ExternalLink,
  AlertTriangle,
  Building2,
  Award,
  CheckCircle,
  Users,
  Lock,
} from 'lucide-react-native';

export type LegalModalType = 'terms' | 'privacy' | 'delete' | 'about';

interface LegalAndAboutModalProps {
  visible: boolean;
  onClose: () => void;
  type: LegalModalType;
  onDeleteAccount?: () => Promise<{ success: boolean; error?: string }>;
  isDeleting?: boolean;
  isLoggedIn?: boolean;
}

export const LegalAndAboutModal: React.FC<LegalAndAboutModalProps> = ({
  visible,
  onClose,
  type,
  onDeleteAccount,
  isDeleting = false,
  isLoggedIn = false,
}) => {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16);

  const getHeaderInfo = () => {
    switch (type) {
      case 'terms':
        return {
          title: 'Terms of Service',
          subtitle: 'User agreement, license & service terms',
          icon: FileText,
          badge: 'LEGAL AGREEMENT',
          badgeColor: '#2563EB',
          badgeBg: '#EFF6FF',
          webUrl: 'https://course.flymediatech.com/terms',
          webLabel: 'Open Terms on Web',
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          subtitle: 'Google Play & data protection standards',
          icon: ShieldCheck,
          badge: 'DATA PROTECTION',
          badgeColor: '#16A34A',
          badgeBg: '#F0FDF4',
          webUrl: 'https://course.flymediatech.com/privacy',
          webLabel: 'Open Privacy Policy on Web',
        };
      case 'delete':
        return {
          title: 'Delete User & Data',
          subtitle: 'Permanent account removal & privacy rights',
          icon: Trash2,
          badge: 'DANGER ZONE',
          badgeColor: '#DC2626',
          badgeBg: '#FEF2F2',
          webUrl: 'https://course.flymediatech.com/delete-account',
          webLabel: 'Web Deletion Request Form',
        };
      case 'about':
      default:
        return {
          title: 'About Flymedia',
          subtitle: '14+ Years of Tech & Training Excellence',
          icon: Info,
          badge: 'ABOUT OUR ACADEMY',
          badgeColor: Colors.primaryRose,
          badgeBg: '#FFF1F2',
          webUrl: 'https://course.flymediatech.com/about',
          webLabel: 'Visit Official Website',
        };
    }
  };

  const header = getHeaderInfo();
  const IconComponent = header.icon;

  const handleOpenWeb = () => {
    Linking.openURL(header.webUrl).catch(() => {
      Alert.alert('Link', `Visit: ${header.webUrl}`);
    });
  };

  const handleConfirmDelete = () => {
    if (!onDeleteAccount) return;
    Alert.alert(
      'Confirm Permanent Deletion',
      'Are you sure you want to permanently erase your account, enrolled packages, certificates, and learning history? This action CANNOT be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Permanently Erase',
          style: 'destructive',
          onPress: async () => {
            const res = await onDeleteAccount();
            if (res.success) {
              Alert.alert('Account Deleted', 'Your account and personal data have been completely removed.');
              onClose();
            } else {
              Alert.alert('Deletion Error', res.error || 'Failed to delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBackdrop} />

        <View style={[styles.modalSheet, { paddingBottom: bottomPadding }]}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <View
                style={[
                  styles.sheetBadge,
                  { backgroundColor: header.badgeBg },
                ]}
              >
                <IconComponent size={12} color={header.badgeColor} />
                <Text
                  style={[
                    styles.sheetBadgeText,
                    { color: header.badgeColor },
                  ]}
                >
                  {header.badge}
                </Text>
              </View>
              <Text style={styles.sheetTitle}>{header.title}</Text>
              <Text style={styles.sheetSubtitle}>{header.subtitle}</Text>
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Scroll Content */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* RENDER BY TYPE */}
            {type === 'about' && (
              <View style={styles.contentWrap}>
                <View style={styles.heroBanner}>
                  <Award size={28} color={Colors.primaryRose} />
                  <Text style={styles.heroBannerTitle}>14+ Years of Industry Leadership</Text>
                  <Text style={styles.heroBannerDesc}>
                    Delivering globally recognized IT training, software engineering, and digital growth programs since 2012.
                  </Text>
                </View>

                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeading}>Meet Our Founder: Anuj Gupta</Text>
                  <Text style={styles.paragraph}>
                    With 15+ years of software industry experience, Anuj Gupta founded Fly Media Technology with a vision to empower students and businesses through cutting-edge digital solutions.
                  </Text>
                  <Text style={styles.paragraph}>
                    Under his leadership, Flymedia has successfully mentored thousands of students and delivered 1000+ national and international projects, fostering creativity, technical mastery, and industry-readiness.
                  </Text>
                </View>

                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeading}>Why Choose Flymedia LMS?</Text>
                  <View style={styles.bulletRow}>
                    <CheckCircle size={15} color="#16A34A" style={styles.bulletIcon} />
                    <Text style={styles.bulletText}>
                      <Text style={{ fontWeight: '800' }}>100% Practical Training:</Text> Live coding projects, real client scenarios, and hands-on portfolio creation.
                    </Text>
                  </View>
                  <View style={styles.bulletRow}>
                    <CheckCircle size={15} color="#16A34A" style={styles.bulletIcon} />
                    <Text style={styles.bulletText}>
                      <Text style={{ fontWeight: '800' }}>Expert Industry Mentors:</Text> Direct guidance from full-time developers and agency leaders.
                    </Text>
                  </View>
                  <View style={styles.bulletRow}>
                    <CheckCircle size={15} color="#16A34A" style={styles.bulletIcon} />
                    <Text style={styles.bulletText}>
                      <Text style={{ fontWeight: '800' }}>Recognized Certifications:</Text> Verifiable course completion and project internship certificates.
                    </Text>
                  </View>
                  <View style={styles.bulletRow}>
                    <CheckCircle size={15} color="#16A34A" style={styles.bulletIcon} />
                    <Text style={styles.bulletText}>
                      <Text style={{ fontWeight: '800' }}>Career & Placement Support:</Text> Resume building, mock interviews, and direct placement opportunities.
                    </Text>
                  </View>
                </View>

                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeading}>Global Offices & Centers</Text>
                  <Text style={styles.campusItemTitle}>🇮🇳 India Campus (Headquarters)</Text>
                  <Text style={styles.campusItemDetail}>{FlymediaContact.address}</Text>

                  <Text style={[styles.campusItemTitle, { marginTop: 12 }]}>🇦🇺 Australia Branch</Text>
                  <Text style={styles.campusItemDetail}>35 Edgewood Dr, Stanhope Gardens NSW 2768, Australia</Text>

                  <Text style={[styles.campusItemTitle, { marginTop: 12 }]}>🇨🇦 Canada Branch</Text>
                  <Text style={styles.campusItemDetail}>7664 126a St, Surrey, BC V3W 4A9, Canada</Text>
                </View>
              </View>
            )}

            {type === 'terms' && (
              <View style={styles.contentWrap}>
                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeading}>1. Acceptance of Terms</Text>
                  <Text style={styles.paragraph}>
                    By accessing and using Flymedia LMS (mobile application and web portal), you accept and agree to be bound by the terms and provisions of this agreement. In addition, when using particular training services, you shall be subject to all guidelines and rules posted.
                  </Text>
                </View>

                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeading}>2. Student & User Accounts</Text>
                  <Text style={styles.paragraph}>
                    When you create an account, you are responsible for maintaining the security of your credentials and are fully responsible for all activities and enrollments conducted under your account. You agree to provide accurate and complete information.
                  </Text>
                </View>

                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeading}>3. Course Access & Intellectual Property</Text>
                  <Text style={styles.paragraph}>
                    All course content, training videos, study materials, code samples, graphics, and curriculum provided via Flymedia LMS are protected by intellectual property and copyright laws. They are licensed solely for your personal educational use and may not be redistributed or shared.
                  </Text>
                </View>

                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeading}>4. Payments, Demo Classes & Fees</Text>
                  <Text style={styles.paragraph}>
                    Course enrollments, registration deposits, and demo class fees processed via PhonePe, UPI, or credit cards are subject to our standard institute refund policies. Once access to training modules or live sessions is granted, fees are non-refundable except where required by law.
                  </Text>
                </View>

                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeading}>5. Code of Conduct & Termination</Text>
                  <Text style={styles.paragraph}>
                    Flymedia reserves the right to suspend or terminate student access immediately, without prior notice, if a user violates our community guidelines, conducts unauthorized distribution of course assets, or breaches these terms.
                  </Text>
                </View>

                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeading}>6. Contact for Inquiries</Text>
                  <Text style={styles.paragraph}>
                    Questions regarding these Terms of Service can be directed to: learnwithflymedia@gmail.com or via telephone at +91-97793-24178.
                  </Text>
                </View>
              </View>
            )}

            {type === 'privacy' && (
              <View style={styles.contentWrap}>
                <View style={[styles.heroBanner, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }]}>
                  <ShieldCheck size={28} color="#16A34A" />
                  <Text style={[styles.heroBannerTitle, { color: '#166534' }]}>Your Privacy is Protected</Text>
                  <Text style={[styles.heroBannerDesc, { color: '#15803D' }]}>
                    Flymedia LMS complies with Google Play Data Safety policies, strict encryption, and transparent data handling.
                  </Text>
                </View>

                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeading}>1. Information We Collect</Text>
                  <Text style={styles.paragraph}>
                    We only collect essential details to provide learning management services:
                  </Text>
                  <View style={styles.bulletRow}>
                    <CheckCircle size={15} color="#16A34A" style={styles.bulletIcon} />
                    <Text style={styles.bulletText}>Account Profile: Name, email address, phone number, and optional profile photo.</Text>
                  </View>
                  <View style={styles.bulletRow}>
                    <CheckCircle size={15} color="#16A34A" style={styles.bulletIcon} />
                    <Text style={styles.bulletText}>Academic Progress: Enrolled courses, attendance history, test scores, and certificates.</Text>
                  </View>
                  <View style={styles.bulletRow}>
                    <CheckCircle size={15} color="#16A34A" style={styles.bulletIcon} />
                    <Text style={styles.bulletText}>Transaction Records: Payment references generated during PhonePe or UPI enrollment checkouts.</Text>
                  </View>
                </View>

                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeading}>2. How We Use Your Data</Text>
                  <Text style={styles.paragraph}>
                    Your data is strictly used to deliver course lectures, generate authenticated graduation certificates, provide counselor guidance, and send important batch timing updates.
                  </Text>
                </View>

                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeading}>3. No Unauthorized Third-Party Selling</Text>
                  <Text style={styles.paragraph}>
                    We never sell, trade, or monetize student personal information. Data is only communicated to trusted secure infrastructure (such as PhonePe for payment verification and transactional email providers).
                  </Text>
                </View>

                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeading}>4. Right to Deletion & Data Portability</Text>
                  <Text style={styles.paragraph}>
                    You maintain complete ownership of your personal data. You can update your profile or permanently erase your account at any time directly through the app or our web deletion portal.
                  </Text>
                </View>

                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeading}>5. Privacy Grievance Officer</Text>
                  <Text style={styles.paragraph}>
                    Email: learnwithflymedia@gmail.com | Phone: +91-97793-24178 | Ludhiana, Punjab, India.
                  </Text>
                </View>
              </View>
            )}

            {type === 'delete' && (
              <View style={styles.contentWrap}>
                <View style={[styles.heroBanner, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                  <AlertTriangle size={28} color="#DC2626" />
                  <Text style={[styles.heroBannerTitle, { color: '#991B1B' }]}>Account & Data Erasure</Text>
                  <Text style={[styles.heroBannerDesc, { color: '#B91C1C' }]}>
                    Google Play Policy & Privacy Standards: You have the unconditional right to permanently wipe your account and all associated personal data.
                  </Text>
                </View>

                <View style={styles.cardSection}>
                  <Text style={styles.sectionHeading}>What Happens When You Delete:</Text>
                  <View style={styles.bulletRow}>
                    <Text style={[styles.bulletIcon, { color: '#DC2626', fontWeight: '900' }]}>✕</Text>
                    <Text style={styles.bulletText}>
                      Your login credentials, email, phone number, and authentication tokens are destroyed immediately.
                    </Text>
                  </View>
                  <View style={styles.bulletRow}>
                    <Text style={[styles.bulletIcon, { color: '#DC2626', fontWeight: '900' }]}>✕</Text>
                    <Text style={styles.bulletText}>
                      All enrolled courses, video progress, and assignments are permanently purged.
                    </Text>
                  </View>
                  <View style={styles.bulletRow}>
                    <Text style={[styles.bulletIcon, { color: '#DC2626', fontWeight: '900' }]}>✕</Text>
                    <Text style={styles.bulletText}>
                      Completion certificates and class bookmarks will be irrevocably deleted.
                    </Text>
                  </View>
                  <View style={styles.bulletRow}>
                    <Text style={[styles.bulletIcon, { color: '#DC2626', fontWeight: '900' }]}>✕</Text>
                    <Text style={styles.bulletText}>
                      This process is immediate, irreversible, and permanent.
                    </Text>
                  </View>
                </View>

                {isLoggedIn && onDeleteAccount && (
                  <TouchableOpacity
                    style={[styles.deleteBtn, isDeleting && { opacity: 0.7 }]}
                    onPress={handleConfirmDelete}
                    disabled={isDeleting}
                    activeOpacity={0.85}
                  >
                    {isDeleting ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <>
                        <Trash2 size={16} color="#ffffff" />
                        <Text style={styles.deleteBtnText}>Permanently Delete My Account Now</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {!isLoggedIn && (
                  <View style={styles.guestNoteBox}>
                    <Info size={16} color={Colors.textSecondary} />
                    <Text style={styles.guestNoteText}>
                      You are currently not signed in to an account. If you previously created an account and wish to delete it, you can log in to erase it, or submit a request via our web deletion portal below.
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Web Link Button for Full Transparency */}
            <TouchableOpacity
              style={styles.openWebBtn}
              onPress={handleOpenWeb}
              activeOpacity={0.8}
            >
              <ExternalLink size={15} color={Colors.primaryRose} />
              <Text style={styles.openWebBtnText}>{header.webLabel}</Text>
            </TouchableOpacity>

            <View style={{ height: 24 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  modalSheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sheetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  sheetBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  scrollArea: {
    flexGrow: 0,
  },
  scrollContent: {
    padding: 20,
  },
  contentWrap: {
    gap: 14,
  },
  heroBanner: {
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    textAlign: 'center',
  },
  heroBannerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  heroBannerDesc: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  cardSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    lineHeight: 19,
    marginBottom: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  bulletIcon: {
    marginTop: 2,
    width: 16,
  },
  bulletText: {
    flex: 1,
    fontSize: 12.5,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  campusItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  campusItemDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
    ...Shadows.small,
  },
  deleteBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  guestNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
  },
  guestNoteText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  openWebBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 14,
  },
  openWebBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.primaryRose,
  },
});
