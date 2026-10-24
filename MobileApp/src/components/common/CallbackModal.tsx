import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  Linking,
  ActivityIndicator,
  AppState,
  AppStateStatus,
} from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import {
  X,
  CheckCircle,
  PhoneCall,
  User,
  Phone,
  BookOpen,
  Sparkles,
  MapPin,
  Globe,
  MessageCircle,
  ShieldCheck,
  Check,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  AlertCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  Gift,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { FlymediaContact } from '../../constants/contact';
import { ApiService } from '../../services/api';

interface CallbackModalProps {
  visible: boolean;
  onClose: () => void;
  defaultCourse?: string;
}

const DEFAULT_PACKAGES = [
  'Creative Graphic Design & UI/UX Bootcamp',
  'Web Development & Designing Bootcamp',
  'Professional Video Editing & Motion Graphics',
  'Full Stack MERN Developer Program with AI',
  'Digital Marketing & Growth Specialist',
  'Python & AI Data Science',
  'Other / Customized Training Track',
];

export const CallbackModal: React.FC<CallbackModalProps> = ({
  visible,
  onClose,
  defaultCourse = 'Web Development & Designing Bootcamp',
}) => {
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [course, setCourse] = useState(defaultCourse);
  const [dynamicCourses, setDynamicCourses] = useState<string[]>(DEFAULT_PACKAGES);
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [mode, setMode] = useState<'HYBRID' | 'ONLINE' | 'OFFLINE'>('HYBRID');
  const [loading, setLoading] = useState(false);
  const [isWaitingForPhonePe, setIsWaitingForPhonePe] = useState(false);
  const [activeTxnId, setActiveTxnId] = useState<string | null>(null);
  const [activeRedirectUrl, setActiveRedirectUrl] = useState<string | null>(null);
  const [checkingLiveStatus, setCheckingLiveStatus] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [useFreeCredit, setUseFreeCredit] = useState(false);
  const [wasFreeDemo, setWasFreeDemo] = useState(false);

  // Dynamically load live published courses from backend
  useEffect(() => {
    let isMounted = true;
    ApiService.getHomeData()
      .then((res) => {
        if (isMounted && res && Array.isArray(res.courses) && res.courses.length > 0) {
          const titles = res.courses.map((c) => c.title).filter(Boolean);
          if (titles.length > 0) {
            setDynamicCourses([...titles, 'Other / Customized Training Track']);
            if (!course || course === 'Web Development & Designing Bootcamp' || course === 'Full Stack MERN') {
              setCourse(titles[0]);
            }
          }
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Ref to prevent stale closures inside AppState listener
  const waitingRef = useRef(isWaitingForPhonePe);
  const txnIdRef = useRef(activeTxnId);
  waitingRef.current = isWaitingForPhonePe;
  txnIdRef.current = activeTxnId;

  // Reset state when modal opens or closes
  useEffect(() => {
    if (visible) {
      if (user?.name && !name) setName(user.name);
      if (user?.email && !email) setEmail(user.email);
      if (user?.phone && !phone) setPhone(user.phone);
      setIsCourseDropdownOpen(false);
      setLoading(false);
      setIsWaitingForPhonePe(false);
      setActiveTxnId(null);
      setActiveRedirectUrl(null);
      setCheckingLiveStatus(false);
      setPaymentSuccess(false);
      setPaymentError('');
      setWasFreeDemo(false);
      setUseFreeCredit(Boolean(user?.freeDemoCredits && user.freeDemoCredits > 0));
    }
  }, [visible, defaultCourse, user]);

  // Automatically check status with PhonePe when app returns from background / browser
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && waitingRef.current && txnIdRef.current) {
        await verifyPaymentWithPhonePe(txnIdRef.current);
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const verifyPaymentWithPhonePe = async (txnId: string) => {
    setCheckingLiveStatus(true);
    setPaymentError('');

    try {
      await new Promise(resolve => setTimeout(() => resolve(null), 1200));
      const res = await ApiService.checkPaymentStatus(txnId, user?.token || '');
      if (res && res.success) {
        setIsWaitingForPhonePe(false);
        setPaymentSuccess(true);
      } else {
        // If still pending, user can click refresh
      }
    } catch {
      // Ignored
    } finally {
      setCheckingLiveStatus(false);
    }
  };

  const handleBookAndPay = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your full name.');
      return;
    }
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      Alert.alert('Valid Email Required', 'Please enter a valid email address.');
      return;
    }
    const cleanPhone = phone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      Alert.alert('Valid Phone Required', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    setPaymentError('');

    try {
      const finalCourseName = `${course} (${mode === 'OFFLINE' ? 'Campus' : mode === 'ONLINE' ? 'Online' : 'Hybrid'})`;
      const applyFreeCredit = Boolean(useFreeCredit && user?.freeDemoCredits && user.freeDemoCredits > 0);

      const res = await ApiService.initiateDemoPayment(
        {
          name: name.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          course: finalCourseName,
          mode,
          useFreeDemoCredit: applyFreeCredit,
        },
        user?.token
      );

      setLoading(false);

      if (res && res.success && res.isFreeDemo) {
        setIsWaitingForPhonePe(false);
        setWasFreeDemo(true);
        setActiveTxnId(res.transactionId || `FREE_DEMO_${Date.now()}`);
        setPaymentSuccess(true);
        if (refreshProfile) {
          refreshProfile().catch(() => {});
        }
        return;
      }

      if (res && res.success && res.redirectUrl) {
        const txn = res.transactionId || `DEMO_${Date.now()}`;
        setActiveTxnId(txn);
        setActiveRedirectUrl(res.redirectUrl);
        setIsWaitingForPhonePe(true);

        // Direct redirection straight to PhonePe Gateway
        Linking.openURL(res.redirectUrl).catch(() => {
          Alert.alert('Browser Error', 'Could not open PhonePe gateway. Please try again.');
        });
        return;
      }

      setPaymentError(res?.error || 'Could not initiate PhonePe payment. Please try again.');
    } catch (e: any) {
      setLoading(false);
      setPaymentError(e?.message || 'Network error while connecting to PhonePe gateway.');
    }
  };

  const handleCancelWaiting = () => {
    setIsWaitingForPhonePe(false);
    setActiveTxnId(null);
    setActiveRedirectUrl(null);
    setCheckingLiveStatus(false);
    setPaymentError('Payment was not completed. You can retry anytime.');
  };

  const handleFinish = () => {
    setPaymentSuccess(false);
    setIsWaitingForPhonePe(false);
    setName('');
    setPhone('');
    onClose();
  };

  const isFreeApplied = Boolean(useFreeCredit && user?.freeDemoCredits && user.freeDemoCredits > 0);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          {/* Top Decorative Glow Strip */}
          <View style={styles.topAccentStrip} />

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <X size={18} color={Colors.textSecondary} strokeWidth={2.4} />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            bounces={false}
            nestedScrollEnabled={true}
          >
            {/* View 1: Payment Success */}
            {paymentSuccess ? (
              <View style={styles.successContainer}>
                <View style={[styles.successIconCircle, wasFreeDemo && { backgroundColor: '#ECFDF5' }]}>
                  {wasFreeDemo ? (
                    <Gift size={44} color="#059669" />
                  ) : (
                    <CheckCircle size={44} color="#059669" />
                  )}
                </View>
                <Text style={styles.successTitle}>
                  {wasFreeDemo ? 'Free Demo Class Confirmed! 🎉' : 'Demo Class Confirmed!'}
                </Text>
                <Text style={styles.successText}>
                  {wasFreeDemo ? (
                    <>
                      Congratulations, <Text style={{ fontWeight: 'bold' }}>{name}</Text>! Your 1-on-1 live demo slot has been booked <Text style={{ color: '#059669', fontWeight: 'bold' }}>100% Free</Text> using your referral credit.
                    </>
                  ) : (
                    <>
                      Thank you, <Text style={{ fontWeight: 'bold' }}>{name}</Text>! Your ₹99 payment has been verified with PhonePe. Your 1-on-1 demo slot is secured.
                    </>
                  )}
                </Text>

                <View style={styles.bookedDetailsCard}>
                  <View style={styles.bookedDetailRow}>
                    <Text style={styles.bookedLabel}>Student:</Text>
                    <Text style={styles.bookedValue}>{name}</Text>
                  </View>
                  {email ? (
                    <View style={styles.bookedDetailRow}>
                      <Text style={styles.bookedLabel}>Email:</Text>
                      <Text style={styles.bookedValue}>{email}</Text>
                    </View>
                  ) : null}
                  <View style={styles.bookedDetailRow}>
                    <Text style={styles.bookedLabel}>Course:</Text>
                    <Text style={styles.bookedValue}>{course}</Text>
                  </View>
                  <View style={styles.bookedDetailRow}>
                    <Text style={styles.bookedLabel}>Amount Paid:</Text>
                    <Text style={[styles.bookedValue, { color: '#059669', fontWeight: '900' }]}>
                      {wasFreeDemo ? '₹0.00 (Free Referral Pass)' : '₹99.00 (PhonePe)'}
                    </Text>
                  </View>
                  {activeTxnId ? (
                    <View style={styles.bookedDetailRow}>
                      <Text style={styles.bookedLabel}>Transaction ID:</Text>
                      <Text style={[styles.bookedValue, { fontSize: 11 }]}>{activeTxnId}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.confirmedBadge}>
                  <Check size={14} color="#059669" />
                  <Text style={styles.confirmedBadgeText}>Senior Academic Mentor Assigned</Text>
                </View>

                <TouchableOpacity
                  style={styles.finishBtn}
                  onPress={handleFinish}
                  activeOpacity={0.85}
                >
                  <Text style={styles.finishBtnText}>Done / Return</Text>
                </TouchableOpacity>
              </View>
            ) : isWaitingForPhonePe ? (
              /* View 2: Waiting for PhonePe Gateway completion */
              <View style={styles.waitingContainer}>
                <View style={styles.phonePeLogoCircle}>
                  <ActivityIndicator size="large" color="#6739B7" />
                </View>
                <Text style={styles.waitingTitle}>Redirected to PhonePe</Text>
                <Text style={styles.waitingSubtitle}>
                  Please complete the ₹99 Demo Class payment on the PhonePe checkout page in your browser.
                </Text>

                <View style={styles.waitingAmountCard}>
                  <Text style={styles.waitingAmountLabel}>Demo Class Fee</Text>
                  <Text style={styles.waitingAmountValue}>₹99.00</Text>
                  <Text style={styles.waitingAmountBenefit}>100% Credited Back on Course Enrollment</Text>
                </View>

                {paymentError ? (
                  <View style={styles.errorNotice}>
                    <AlertCircle size={15} color="#DC2626" />
                    <Text style={styles.errorNoticeText}>{paymentError}</Text>
                  </View>
                ) : null}

                {/* Status Check Button */}
                <TouchableOpacity
                  style={styles.checkStatusBtn}
                  onPress={() => activeTxnId && verifyPaymentWithPhonePe(activeTxnId)}
                  disabled={checkingLiveStatus}
                  activeOpacity={0.85}
                >
                  {checkingLiveStatus ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <View style={styles.btnRow}>
                      <RefreshCw size={15} color="#ffffff" />
                      <Text style={styles.checkStatusBtnText}>Check Payment Status</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Re-open Gateway Button */}
                {activeRedirectUrl ? (
                  <TouchableOpacity
                    style={styles.reopenBtn}
                    onPress={() => Linking.openURL(activeRedirectUrl).catch(() => {})}
                    activeOpacity={0.8}
                  >
                    <ExternalLink size={14} color={Colors.textSecondary} />
                    <Text style={styles.reopenBtnText}>Re-open PhonePe Page</Text>
                  </TouchableOpacity>
                ) : null}

                {/* Cancel / Return */}
                <TouchableOpacity
                  style={styles.cancelWaitingBtn}
                  onPress={handleCancelWaiting}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelWaitingBtnText}>Cancel & Edit Details</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* View 3: Demo Class Booking & PhonePe Payment Form */
              <View>
                {/* Header Badge */}
                <View style={styles.headerTagRow}>
                  <View style={styles.specialPriceBadge}>
                    <Sparkles size={11} color={Colors.primaryRose} />
                    <Text style={styles.specialPriceBadgeText}>⚡ ₹99 DEMO CLASS OFFER</Text>
                  </View>
                  <View style={styles.slotLiveBadge}>
                    <View style={styles.livePulseDot} />
                    <Text style={styles.slotLiveBadgeText}>LIMITED SLOTS</Text>
                  </View>
                </View>

                {/* Title & Subtitle */}
                <Text style={styles.modalTitle}>Book Live 1-on-1 Demo Class</Text>
                <Text style={styles.modalSubtitle}>
                  Experience real industry training with practical live coding & portfolio review for just ₹99 before committing to full program.
                </Text>

                {/* 3 Value Pillars */}
                <View style={styles.pillarsRow}>
                  <View style={styles.pillarItem}>
                    <Check size={12} color="#059669" />
                    <Text style={styles.pillarText}>1-on-1 Mentor</Text>
                  </View>
                  <View style={styles.pillarItem}>
                    <Check size={12} color="#059669" />
                    <Text style={styles.pillarText}>Live Hands-on Project</Text>
                  </View>
                  
                </View>

                {paymentError ? (
                  <View style={styles.errorNotice}>
                    <AlertCircle size={15} color="#DC2626" />
                    <Text style={styles.errorNoticeText}>{paymentError}</Text>
                  </View>
                ) : null}

                {/* Form Field 1: Full Name */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={styles.inputBox}>
                    <User size={16} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Rahul Sharma"
                      placeholderTextColor={Colors.textLight}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Form Field 2: Email Address */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputBox}>
                    <Mail size={16} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. rahul@example.com"
                      placeholderTextColor={Colors.textLight}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Form Field 3: Phone */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.inputLabel}>Mobile / WhatsApp Number</Text>
                  <View style={styles.inputBox}>
                    <View style={styles.countryCodeBadge}>
                      <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                    </View>
                    <TextInput
                      style={styles.textInput}
                      placeholder="97793 24178"
                      placeholderTextColor={Colors.textLight}
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={setPhone}
                      maxLength={12}
                    />
                  </View>
                </View>

                {/* Training Mode Segmented Selector */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.inputLabel}>Preferred Learning Mode</Text>
                  <View style={styles.modeToggleGroup}>
                    <TouchableOpacity
                      style={[styles.modeToggleBtn, mode === 'HYBRID' && styles.modeToggleBtnActive]}
                      onPress={() => setMode('HYBRID')}
                      activeOpacity={0.8}
                    >
                      <Sparkles size={13} color={mode === 'HYBRID' ? '#ffffff' : Colors.textSecondary} />
                      <Text style={[styles.modeToggleText, mode === 'HYBRID' && styles.modeToggleTextActive]}>
                        Hybrid
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modeToggleBtn, mode === 'OFFLINE' && styles.modeToggleBtnActive]}
                      onPress={() => setMode('OFFLINE')}
                      activeOpacity={0.8}
                    >
                      <MapPin size={13} color={mode === 'OFFLINE' ? '#ffffff' : Colors.textSecondary} />
                      <Text style={[styles.modeToggleText, mode === 'OFFLINE' && styles.modeToggleTextActive]}>
                        Campus (Lab)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modeToggleBtn, mode === 'ONLINE' && styles.modeToggleBtnActive]}
                      onPress={() => setMode('ONLINE')}
                      activeOpacity={0.8}
                    >
                      <Globe size={13} color={mode === 'ONLINE' ? '#ffffff' : Colors.textSecondary} />
                      <Text style={[styles.modeToggleText, mode === 'ONLINE' && styles.modeToggleTextActive]}>
                        Online (Live)
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Form Field 4: Course Package Select Dropdown */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.inputLabel}>Select Course Package</Text>

                  {/* Select Dropdown Trigger Box */}
                  <TouchableOpacity
                    style={[
                      styles.selectTrigger,
                      isCourseDropdownOpen && styles.selectTriggerActive,
                    ]}
                    onPress={() => setIsCourseDropdownOpen(!isCourseDropdownOpen)}
                    activeOpacity={0.8}
                  >
                    <BookOpen size={16} color={Colors.primaryRose} style={styles.inputIcon} />
                    <Text
                      style={[
                        styles.selectTriggerText,
                        !course && styles.selectTriggerTextPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {course || '-- Choose Course Package --'}
                    </Text>
                    {isCourseDropdownOpen ? (
                      <ChevronUp size={18} color={Colors.primaryRose} />
                    ) : (
                      <ChevronDown size={18} color={Colors.textSecondary} />
                    )}
                  </TouchableOpacity>

                  {/* Expandable Dropdown List of Packages (Scrollable) */}
                  {isCourseDropdownOpen && (
                    <ScrollView
                      style={styles.dropdownMenu}
                      contentContainerStyle={styles.dropdownMenuContent}
                      nestedScrollEnabled={true}
                      keyboardShouldPersistTaps="handled"
                      showsVerticalScrollIndicator={true}
                      persistentScrollbar={true}
                      bounces={true}
                    >
                      {dynamicCourses.map((pkg, index) => {
                        const isSelected = course === pkg;
                        return (
                          <TouchableOpacity
                            key={`${pkg}-${index}`}
                            style={[
                              styles.dropdownOption,
                              isSelected && styles.dropdownOptionSelected,
                              index === dynamicCourses.length - 1 && { borderBottomWidth: 0 },
                            ]}
                            onPress={() => {
                              setCourse(pkg);
                              setIsCourseDropdownOpen(false);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.dropdownOptionText,
                                isSelected && styles.dropdownOptionTextSelected,
                              ]}
                            >
                              {pkg}
                            </Text>
                            {isSelected && (
                              <Check size={16} color={Colors.primaryRose} strokeWidth={2.5} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>

                {/* FREE DEMO CLASS REFERRAL REWARD CARD */}
                {user?.freeDemoCredits && user.freeDemoCredits > 0 ? (
                  <TouchableOpacity
                    style={[styles.referralCreditBanner, useFreeCredit && styles.referralCreditBannerActive]}
                    onPress={() => setUseFreeCredit(!useFreeCredit)}
                    activeOpacity={0.85}
                  >
                    <View style={styles.referralCreditIconWrap}>
                      <Gift size={20} color="#059669" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.referralCreditTitle}>1 Free Demo Pass Available</Text>
                        <View style={styles.freeGreenBadge}>
                          <Text style={styles.freeGreenBadgeText}>SAVE ₹99</Text>
                        </View>
                      </View>
                      <Text style={styles.referralCreditSub}>
                        Earned by referring a friend. {useFreeCredit ? 'Free pass applied (Pay ₹0).' : 'Tap to apply and book free.'}
                      </Text>
                    </View>
                    <View style={[styles.creditToggleBox, useFreeCredit && styles.creditToggleBoxChecked]}>
                      {useFreeCredit && <Check size={14} color="#ffffff" strokeWidth={3} />}
                    </View>
                  </TouchableOpacity>
                ) : null}

                {/* Primary Action Button: Direct PhonePe Redirect OR Free Redemption */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    isFreeApplied ? styles.submitButtonFree : null,
                    loading ? styles.submitButtonDisabled : null,
                  ]}
                  onPress={handleBookAndPay}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <View style={styles.btnRow}>
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text style={styles.submitButtonText}>
                        {isFreeApplied ? 'Confirming Free Demo...' : 'Connecting to PhonePe...'}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.submitButtonInner}>
                      <Text style={styles.submitButtonText}>
                        {isFreeApplied
                          ? 'Book 1-on-1 Demo 100% Free'
                          : 'Pay ₹99 & Book via PhonePe'}
                      </Text>
                      <View style={[styles.submitPricePill, isFreeApplied ? styles.submitPricePillFree : null]}>
                        <Text style={[styles.submitPricePillText, isFreeApplied ? styles.submitPricePillTextFree : null]}>
                          {isFreeApplied ? '₹0 Free' : '₹99'}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Trust Badge */}
                <View style={styles.trustBadgeRow}>
                  <ShieldCheck size={13} color="#059669" />
                  <Text style={styles.trustBadgeText}>Official PhonePe Gateway (UPI, Cards, QR & Netbanking)</Text>
                </View>

                {/* Direct Counselor Call & WhatsApp Options */}
                <View style={styles.directContactRow}>
                  <TouchableOpacity
                    style={styles.directContactBtn}
                    onPress={() => Linking.openURL(`tel:${FlymediaContact.phoneRaw}`).catch(() => {})}
                    activeOpacity={0.8}
                  >
                    <PhoneCall size={13} color={Colors.primaryRose} />
                    <Text style={styles.directContactBtnText}>Call Helpline</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.directContactBtn, styles.directContactBtnWhatsApp]}
                    onPress={() => Linking.openURL(FlymediaContact.whatsappUrl).catch(() => {})}
                    activeOpacity={0.8}
                  >
                    <MessageCircle size={13} color="#059669" />
                    <Text style={[styles.directContactBtnText, { color: '#059669' }]}>WhatsApp Chat</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    maxHeight: '92%',
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    ...Shadows.medium,
    position: 'relative',
    overflow: 'hidden',
  },
  topAccentStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: Colors.primaryRose,
  },
  closeBtn: {
    alignSelf: 'flex-end',
    padding: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginBottom: 4,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  /* Header Badge */
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
  },
  specialPriceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 20,
  },
  specialPriceBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: Colors.primaryRose,
    letterSpacing: 0.4,
  },
  slotLiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  slotLiveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.3,
  },

  /* Titles */
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: Colors.textSecondary,
    marginBottom: 12,
  },

  /* 3 Value Pillars */
  pillarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginBottom: 16,
  },
  pillarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  pillarText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },

  /* Form Fields */
  fieldGroup: {
    marginBottom: 13,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  countryCodeBadge: {
    paddingRight: 8,
    marginRight: 6,
    borderRightWidth: 1,
    borderRightColor: '#CBD5E1',
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: Colors.textPrimary,
    paddingVertical: 0,
  },

  /* Mode Selector */
  modeToggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
    gap: 4,
  },
  modeToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 11,
  },
  modeToggleBtnActive: {
    backgroundColor: Colors.primaryRose,
    ...Shadows.small,
  },
  modeToggleText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  modeToggleTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },

  /* Course Select Dropdown */
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  selectTriggerActive: {
    borderColor: Colors.primaryRose,
    backgroundColor: '#FFF1F2',
  },
  selectTriggerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  selectTriggerTextPlaceholder: {
    color: Colors.textLight,
    fontWeight: '500',
  },
  dropdownMenu: {
    marginTop: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    overflow: 'hidden',
    ...Shadows.medium,
    maxHeight: 220,
  },
  dropdownMenuContent: {
    flexGrow: 0,
    paddingVertical: 2,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownOptionSelected: {
    backgroundColor: '#FFF1F2',
  },
  dropdownOptionText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginRight: 8,
  },
  dropdownOptionTextSelected: {
    color: Colors.primaryRose,
    fontWeight: '800',
  },

  /* Action Button */
  submitButton: {
    backgroundColor: Colors.primaryRose,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    ...Shadows.medium,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.2,
  },
  submitPricePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  submitPricePillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  /* Trust badge */
  trustBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 10,
  },
  trustBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },

  /* Direct Contacts */
  directContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  directContactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  directContactBtnWhatsApp: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  directContactBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Colors.primaryRose,
  },

  /* Waiting Screen */
  waitingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  phonePeLogoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EDE7F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  waitingTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#6739B7',
    marginBottom: 6,
  },
  waitingSubtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  waitingAmountCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 16,
  },
  waitingAmountLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  waitingAmountValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#059669',
    marginVertical: 2,
  },
  waitingAmountBenefit: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryRose,
  },
  checkStatusBtn: {
    width: '100%',
    backgroundColor: '#6739B7',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...Shadows.small,
  },
  checkStatusBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  reopenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 8,
  },
  reopenBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  cancelWaitingBtn: {
    paddingVertical: 6,
  },
  cancelWaitingBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: Colors.textLight,
  },
  errorNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  errorNoticeText: {
    flex: 1,
    fontSize: 11.5,
    color: '#DC2626',
    fontWeight: '600',
  },

  /* Referral Credit Banner */
  referralCreditBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
  },
  referralCreditBannerActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#059669',
  },
  referralCreditIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralCreditTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  freeGreenBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  freeGreenBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  referralCreditSub: {
    fontSize: 11,
    color: '#047857',
    marginTop: 2,
    lineHeight: 15,
  },
  creditToggleBox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  creditToggleBoxChecked: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  submitButtonFree: {
    backgroundColor: '#059669',
    shadowColor: '#059669',
  },
  submitPricePillFree: {
    backgroundColor: '#ffffff',
  },
  submitPricePillTextFree: {
    color: '#059669',
  },

  /* Success View */
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#059669',
    marginBottom: 6,
  },
  successText: {
    fontSize: 12.5,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 8,
  },
  bookedDetailsCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    gap: 8,
  },
  bookedDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  bookedValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  confirmedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  finishBtn: {
    width: '100%',
    backgroundColor: '#059669',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
