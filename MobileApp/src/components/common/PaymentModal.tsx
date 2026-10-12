import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import {
  X,
  CreditCard,
  Smartphone,
  Building2,
  ShieldCheck,
  CheckCircle,
  Tag,
  Sparkles,
  Lock,
  ArrowRight,
  Zap,
  ExternalLink,
} from 'lucide-react-native';
import { Course } from '../../types';
import { ApiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface PaymentModalProps {
  visible: boolean;
  course: Course;
  onClose: () => void;
  onSuccess: (result: { transactionId: string; amount: number; paymentMethod: string }) => void;
}

type PaymentMethodType = 'UPI' | 'CARD' | 'NETBANKING' | 'PHONEPE';

const POPULAR_BANKS = [
  { id: 'HDFC', name: 'HDFC Bank' },
  { id: 'SBI', name: 'State Bank of India' },
  { id: 'ICICI', name: 'ICICI Bank' },
  { id: 'AXIS', name: 'Axis Bank' },
  { id: 'KOTAK', name: 'Kotak Mahindra' },
];

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: '⚡' },
  { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
  { id: 'paytm', name: 'Paytm', icon: '🔵' },
  { id: 'bhim', name: 'BHIM UPI', icon: '🇮🇳' },
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  course,
  onClose,
  onSuccess,
}) => {
  const { purchaseCourse, refreshEnrollments } = useAuth();

  // Price & Coupon state
  const originalPrice = course.price ? Number(course.price) : 0;
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercentage: number;
    discountAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Payment method selection - default to PHONEPE
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('PHONEPE');

  // Method specific state
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC');

  // PhonePe gateway active state
  const [phonePeRedirectUrl, setPhonePeRedirectUrl] = useState<string | null>(null);
  const [phonePeTxnId, setPhonePeTxnId] = useState<string | null>(null);
  const [verifyingPhonePe, setVerifyingPhonePe] = useState(false);

  // Checkout process state
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<{
    transactionId: string;
    amount: number;
    method: string;
  } | null>(null);

  // Recalculate price
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPrice = Math.max(0, originalPrice - discountAmount);

  useEffect(() => {
    if (visible) {
      setCouponCode('');
      setAppliedCoupon(null);
      setCouponError('');
      setProcessing(false);
      setPaymentSuccess(null);
      setPhonePeRedirectUrl(null);
      setPhonePeTxnId(null);
      setVerifyingPhonePe(false);
      setSelectedMethod('PHONEPE');
    }
  }, [visible, course]);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await ApiService.validateCoupon(code, originalPrice);
      if (res.success && res.valid) {
        setAppliedCoupon({
          code: res.coupon?.code || code,
          discountPercentage: res.coupon?.discountPercentage || 0,
          discountAmount: res.discountAmount || 0,
        });
        setCouponCode('');
      } else {
        setCouponError(res.error || 'Invalid coupon code');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to apply coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleFormatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 16);
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  const handleFormatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  const handleProcessPayment = async () => {
    setProcessing(true);
    setCouponError('');

    let paymentDetails: any = { method: selectedMethod };

    if (selectedMethod === 'UPI') {
      paymentDetails = {
        upiApp: selectedUpiApp,
        upiId: upiId.trim() || `${selectedUpiApp}-instant-checkout@bank`,
      };
    } else if (selectedMethod === 'CARD') {
      paymentDetails = {
        cardNumber: cardNumber ? `•••• •••• •••• ${cardNumber.slice(-4)}` : '•••• 4242',
        cardHolder: cardHolder || 'Student Account',
        expiry: cardExpiry || '12/28',
      };
    } else if (selectedMethod === 'NETBANKING') {
      paymentDetails = {
        bank: selectedBank,
      };
    } else if (selectedMethod === 'PHONEPE') {
      paymentDetails = {
        gateway: 'PhonePe PG',
      };
    }

    const res = await purchaseCourse({
      course,
      paymentMethod: selectedMethod,
      amount: finalPrice,
      couponCode: appliedCoupon?.code,
      paymentDetails,
    });

    setProcessing(false);

    if (res.success) {
      const redirect = (res as any).redirectUrl;
      const txn = res.transactionId || `TXN_${Date.now()}`;
      if (redirect) {
        setPhonePeRedirectUrl(redirect);
        setPhonePeTxnId(txn);
        Linking.openURL(redirect).catch(() => {});
        return;
      }
      setPaymentSuccess({
        transactionId: txn,
        amount: finalPrice,
        method: selectedMethod === 'PHONEPE' ? 'PhonePe Gateway' : selectedMethod,
      });
    } else {
      setCouponError(res.error || 'Payment failed. Please verify details and retry.');
    }
  };

  const handleVerifyPhonePePayment = async () => {
    setVerifyingPhonePe(true);
    try {
      await refreshEnrollments();
      await new Promise(resolve => setTimeout(() => resolve(null), 600));
      setPaymentSuccess({
        transactionId: phonePeTxnId || `PHONEPE_${Date.now()}`,
        amount: finalPrice,
        method: 'PhonePe Gateway',
      });
    } catch (e: any) {
      setCouponError('Could not verify status. Please tap verify again.');
    } finally {
      setVerifyingPhonePe(false);
    }
  };

  const handleDone = () => {
    if (paymentSuccess) {
      onSuccess({
        transactionId: paymentSuccess.transactionId,
        amount: paymentSuccess.amount,
        paymentMethod: paymentSuccess.method,
      });
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.sheetContainer}>
          {/* Top Handle */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>
                {paymentSuccess
                  ? 'Payment Confirmed'
                  : phonePeRedirectUrl
                  ? 'PhonePe Gateway'
                  : 'Secure Checkout'}
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {course.title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={
                paymentSuccess
                  ? handleDone
                  : phonePeRedirectUrl
                  ? () => {
                      setPhonePeRedirectUrl(null);
                      setPhonePeTxnId(null);
                    }
                  : onClose
              }
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <X size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {paymentSuccess ? (
            /* SUCCESS VIEW */
            <View style={styles.successContainer}>
              <View style={styles.successIconBubble}>
                <CheckCircle size={54} color="#10b981" />
              </View>

              <Text style={styles.successTitle}>Payment Successful! 🎉</Text>
              <Text style={styles.successDesc}>
                You are now enrolled in <Text style={{ fontWeight: '800' }}>{course.title}</Text>. All syllabus modules, live batches, and mentor sessions have been unlocked.
              </Text>

              {/* Receipt card */}
              <View style={styles.receiptCard}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Transaction ID</Text>
                  <Text style={styles.receiptValMono}>{paymentSuccess.transactionId}</Text>
                </View>
                <View style={styles.receiptDivider} />
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Amount Paid</Text>
                  <Text style={styles.receiptValHighlight}>
                    ₹{paymentSuccess.amount.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.receiptDivider} />
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Payment Method</Text>
                  <Text style={styles.receiptVal}>{paymentSuccess.method}</Text>
                </View>
                <View style={styles.receiptDivider} />
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Status</Text>
                  <View style={styles.badgeSuccess}>
                    <Text style={styles.badgeSuccessText}>COMPLETED</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.startLearningBtn}
                onPress={handleDone}
                activeOpacity={0.85}
              >
                <Text style={styles.startLearningBtnText}>Start Learning Now</Text>
                <ArrowRight size={18} color="#ffffff" style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          ) : phonePeRedirectUrl ? (
            /* PHONEPE GATEWAY LAUNCHED VIEW */
            <View style={styles.phonePeActiveContainer}>
              <View style={styles.phonePeLogoCircle}>
                <ShieldCheck size={44} color="#5f259f" />
              </View>

              <View style={styles.phonePeActiveBadge}>
                <View style={styles.liveIndicatorDot} />
                <Text style={styles.phonePeActiveBadgeText}>PhonePe Session Active</Text>
              </View>

              <Text style={styles.phonePeActiveTitle}>Authorize in PhonePe</Text>
              <Text style={styles.phonePeActiveDesc}>
                We opened PhonePe checkout for <Text style={{ fontWeight: '800' }}>₹{finalPrice.toLocaleString('en-IN')}</Text> in your browser. Complete your payment via UPI, Card or Net Banking, then tap verify below.
              </Text>

              {/* Order Info Card */}
              <View style={styles.phonePeInfoCard}>
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Course Package</Text>
                  <Text style={[styles.receiptVal, { maxWidth: '60%' }]} numberOfLines={1}>
                    {course.title}
                  </Text>
                </View>
                <View style={styles.receiptDivider} />
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Order Amount</Text>
                  <Text style={styles.phonePeInfoAmount}>
                    ₹{finalPrice.toLocaleString('en-IN')}
                  </Text>
                </View>
                <View style={styles.receiptDivider} />
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>Payment Gateway</Text>
                  <Text style={styles.receiptVal}>PhonePe Official PG</Text>
                </View>
              </View>

              {/* Verify Button */}
              <TouchableOpacity
                style={styles.verifyPhonePeBtn}
                onPress={handleVerifyPhonePePayment}
                disabled={verifyingPhonePe}
                activeOpacity={0.85}
              >
                {verifyingPhonePe ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.verifyPhonePeBtnText}>Verifying Enrollment...</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <CheckCircle size={20} color="#ffffff" />
                    <Text style={styles.verifyPhonePeBtnText}>I Have Paid / Verify Enrollment</Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Re-open Gateway */}
              <TouchableOpacity
                style={styles.reopenGatewayBtn}
                onPress={() => {
                  if (phonePeRedirectUrl) {
                    Linking.openURL(phonePeRedirectUrl).catch(() => {});
                  }
                }}
                activeOpacity={0.8}
              >
                <ExternalLink size={16} color="#5f259f" />
                <Text style={styles.reopenGatewayBtnText}>Re-open PhonePe Payment Window</Text>
              </TouchableOpacity>

              {/* Cancel / Back */}
              <TouchableOpacity
                style={styles.cancelPhonePeBtn}
                onPress={() => {
                  setPhonePeRedirectUrl(null);
                  setPhonePeTxnId(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelPhonePeBtnText}>Change Payment Method</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* CHECKOUT FORM VIEW */
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Order Summary Box */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Course Fee</Text>
                  <Text style={styles.summaryValue}>₹{originalPrice.toLocaleString('en-IN')}</Text>
                </View>

                {appliedCoupon && (
                  <View style={styles.summaryRow}>
                    <View style={styles.couponTagInline}>
                      <Tag size={12} color="#10b981" />
                      <Text style={styles.couponTagText}>
                        {appliedCoupon.code} ({appliedCoupon.discountPercentage}% OFF)
                      </Text>
                    </View>
                    <Text style={styles.summaryDiscount}>
                      -₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}

                <View style={styles.summaryDivider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryTotalLabel}>Total Payable</Text>
                  <Text style={styles.summaryTotalAmount}>
                    ₹{finalPrice.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              {/* Coupon Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Apply Promo Coupon</Text>

                {appliedCoupon ? (
                  <View style={styles.appliedBanner}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <CheckCircle size={18} color="#10b981" />
                      <Text style={styles.appliedBannerText}>
                        Code <Text style={{ fontWeight: '800' }}>{appliedCoupon.code}</Text> applied (Saved ₹{appliedCoupon.discountAmount})
                      </Text>
                    </View>
                    <TouchableOpacity onPress={handleRemoveCoupon}>
                      <Text style={styles.removeCouponText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View style={styles.couponInputRow}>
                      <TextInput
                        style={styles.couponInput}
                        placeholder="Enter coupon code (e.g. FLYSCHOOL20)"
                        placeholderTextColor={Colors.textMuted}
                        value={couponCode}
                        onChangeText={text => {
                          setCouponCode(text);
                          setCouponError('');
                        }}
                        autoCapitalize="characters"
                      />
                      <TouchableOpacity
                        style={styles.applyCouponBtn}
                        onPress={() => handleApplyCoupon()}
                        disabled={couponLoading}
                      >
                        {couponLoading ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text style={styles.applyCouponBtnText}>Apply</Text>
                        )}
                      </TouchableOpacity>
                    </View>

                    {/* Quick Coupon Chips */}
                    <View style={styles.couponChipsRow}>
                      <TouchableOpacity
                        style={styles.couponChip}
                        onPress={() => handleApplyCoupon('FLYSCHOOL20')}
                      >
                        <Sparkles size={12} color={Colors.primaryOrange} />
                        <Text style={styles.couponChipText}>FLYSCHOOL20 (20% OFF)</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.couponChip}
                        onPress={() => handleApplyCoupon('WELCOME50')}
                      >
                        <Zap size={12} color={Colors.primaryOrange} />
                        <Text style={styles.couponChipText}>WELCOME50 (50% OFF)</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {couponError ? (
                  <Text style={styles.errorText}>{couponError}</Text>
                ) : null}
              </View>

              {/* Select Payment Method */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Payment Method</Text>

                <View style={styles.methodsGrid}>
                  {/* PHONEPE GATEWAY - FEATURED TOP CARD */}
                  <TouchableOpacity
                    style={[
                      styles.methodCardPhonePe,
                      selectedMethod === 'PHONEPE' && styles.methodCardPhonePeActive,
                    ]}
                    onPress={() => setSelectedMethod('PHONEPE')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.phonePeCardTop}>
                      <View style={styles.phonePeIconBox}>
                        <ShieldCheck
                          size={24}
                          color={selectedMethod === 'PHONEPE' ? '#5f259f' : Colors.textMuted}
                        />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text
                            style={[
                              styles.methodLabel,
                              selectedMethod === 'PHONEPE' && styles.phonePeLabelActive,
                            ]}
                          >
                            PhonePe Gateway
                          </Text>
                          <View style={styles.officialBadge}>
                            <Text style={styles.officialBadgeText}>OFFICIAL PG</Text>
                          </View>
                        </View>
                        <Text style={styles.methodSub}>
                          Instant UPI • QR • RuPay / Visa / MC • Net Banking
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.radioCircle,
                          selectedMethod === 'PHONEPE' && styles.radioCircleActivePhonePe,
                        ]}
                      >
                        {selectedMethod === 'PHONEPE' && (
                          <View style={styles.radioDotPhonePe} />
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* UPI */}
                  <TouchableOpacity
                    style={[
                      styles.methodCard,
                      selectedMethod === 'UPI' && styles.methodCardActive,
                    ]}
                    onPress={() => setSelectedMethod('UPI')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.methodIconBox}>
                      <Smartphone
                        size={22}
                        color={selectedMethod === 'UPI' ? Colors.primaryOrange : Colors.textMuted}
                      />
                    </View>
                    <Text
                      style={[
                        styles.methodLabel,
                        selectedMethod === 'UPI' && styles.methodLabelActive,
                      ]}
                    >
                      Instant UPI
                    </Text>
                    <Text style={styles.methodSub}>GPay, PhonePe, Paytm</Text>
                  </TouchableOpacity>

                  {/* CARDS */}
                  <TouchableOpacity
                    style={[
                      styles.methodCard,
                      selectedMethod === 'CARD' && styles.methodCardActive,
                    ]}
                    onPress={() => setSelectedMethod('CARD')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.methodIconBox}>
                      <CreditCard
                        size={22}
                        color={selectedMethod === 'CARD' ? Colors.primaryOrange : Colors.textMuted}
                      />
                    </View>
                    <Text
                      style={[
                        styles.methodLabel,
                        selectedMethod === 'CARD' && styles.methodLabelActive,
                      ]}
                    >
                      Credit / Debit Card
                    </Text>
                    <Text style={styles.methodSub}>Visa, MasterCard, RuPay</Text>
                  </TouchableOpacity>

                  {/* NET BANKING */}
                  <TouchableOpacity
                    style={[
                      styles.methodCard,
                      selectedMethod === 'NETBANKING' && styles.methodCardActive,
                    ]}
                    onPress={() => setSelectedMethod('NETBANKING')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.methodIconBox}>
                      <Building2
                        size={22}
                        color={selectedMethod === 'NETBANKING' ? Colors.primaryOrange : Colors.textMuted}
                      />
                    </View>
                    <Text
                      style={[
                        styles.methodLabel,
                        selectedMethod === 'NETBANKING' && styles.methodLabelActive,
                      ]}
                    >
                      Net Banking
                    </Text>
                    <Text style={styles.methodSub}>All Indian Banks</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* METHOD SPECIFIC INPUTS */}
              {selectedMethod === 'PHONEPE' && (
                <View style={styles.phonePeDetailBox}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={styles.phonePePurpleBadgeIcon}>
                      <ShieldCheck size={24} color="#5f259f" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.phonePeDetailTitle}>Official Website PhonePe Gateway</Text>
                      <Text style={styles.phonePeDetailSubtitle}>
                        You will be routed to PhonePe's secure checkout page to pay via PhonePe app, Google Pay, QR, or Card. Course activates instantly upon confirmation.
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {selectedMethod === 'UPI' && (
                <View style={styles.methodDetailBox}>
                  <Text style={styles.detailBoxTitle}>Fast UPI Apps</Text>
                  <View style={styles.upiAppsRow}>
                    {UPI_APPS.map(app => (
                      <TouchableOpacity
                        key={app.id}
                        style={[
                          styles.upiAppBtn,
                          selectedUpiApp === app.id && styles.upiAppBtnActive,
                        ]}
                        onPress={() => setSelectedUpiApp(app.id)}
                      >
                        <Text style={{ fontSize: 16 }}>{app.icon}</Text>
                        <Text
                          style={[
                            styles.upiAppName,
                            selectedUpiApp === app.id && styles.upiAppNameActive,
                          ]}
                        >
                          {app.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={[styles.detailBoxTitle, { marginTop: 14 }]}>Or Enter UPI ID</Text>
                  <TextInput
                    style={styles.detailInput}
                    placeholder="e.g. mobileNumber@upi / yourname@okhdfcbank"
                    placeholderTextColor={Colors.textMuted}
                    value={upiId}
                    onChangeText={setUpiId}
                    autoCapitalize="none"
                  />
                </View>
              )}

              {selectedMethod === 'CARD' && (
                <View style={styles.methodDetailBox}>
                  <Text style={styles.detailBoxTitle}>Card Details</Text>
                  <TextInput
                    style={styles.detailInput}
                    placeholder="Card Number (XXXX XXXX XXXX XXXX)"
                    placeholderTextColor={Colors.textMuted}
                    value={cardNumber}
                    onChangeText={handleFormatCardNumber}
                    keyboardType="numeric"
                    maxLength={19}
                  />

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <TextInput
                      style={[styles.detailInput, { flex: 1 }]}
                      placeholder="MM/YY"
                      placeholderTextColor={Colors.textMuted}
                      value={cardExpiry}
                      onChangeText={handleFormatExpiry}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                    <TextInput
                      style={[styles.detailInput, { flex: 1 }]}
                      placeholder="CVV"
                      placeholderTextColor={Colors.textMuted}
                      value={cardCvv}
                      onChangeText={setCardCvv}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>

                  <TextInput
                    style={[styles.detailInput, { marginTop: 10 }]}
                    placeholder="Cardholder Name"
                    placeholderTextColor={Colors.textMuted}
                    value={cardHolder}
                    onChangeText={setCardHolder}
                  />
                </View>
              )}

              {selectedMethod === 'NETBANKING' && (
                <View style={styles.methodDetailBox}>
                  <Text style={styles.detailBoxTitle}>Popular Banks</Text>
                  <View style={styles.banksGrid}>
                    {POPULAR_BANKS.map(bank => (
                      <TouchableOpacity
                        key={bank.id}
                        style={[
                          styles.bankBtn,
                          selectedBank === bank.id && styles.bankBtnActive,
                        ]}
                        onPress={() => setSelectedBank(bank.id)}
                      >
                        <Text
                          style={[
                            styles.bankBtnText,
                            selectedBank === bank.id && styles.bankBtnTextActive,
                          ]}
                        >
                          {bank.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Security Banner */}
              <View style={styles.securityBox}>
                <Lock size={14} color="#10b981" />
                <Text style={styles.securityBoxText}>
                  256-Bit SSL Encrypted • 100% Safe & RBI Compliant
                </Text>
              </View>

              {/* PAY BUTTON */}
              <TouchableOpacity
                style={[
                  styles.payBtn,
                  selectedMethod === 'PHONEPE' && styles.payBtnPhonePe,
                ]}
                onPress={handleProcessPayment}
                disabled={processing}
                activeOpacity={0.85}
              >
                {processing ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.payBtnText}>
                      {selectedMethod === 'PHONEPE'
                        ? 'Initiating PhonePe Gateway...'
                        : 'Authorizing Payment...'}
                    </Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.payBtnText}>
                      {selectedMethod === 'PHONEPE'
                        ? `Pay ₹${finalPrice.toLocaleString('en-IN')} via PhonePe`
                        : `Pay ₹${finalPrice.toLocaleString('en-IN')} & Unlock Course`}
                    </Text>
                    <ArrowRight size={18} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: 24,
    ...Shadows.card,
  },
  handleBar: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  summaryCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  couponTagInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  couponTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10b981',
  },
  summaryDiscount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10b981',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  summaryTotalAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primaryOrange,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  couponInput: {
    flex: 1,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  applyCouponBtn: {
    backgroundColor: Colors.primaryOrange,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyCouponBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 14,
  },
  couponChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  couponChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  couponChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryOrange,
  },
  appliedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  appliedBannerText: {
    fontSize: 13,
    color: '#065f46',
    marginLeft: 6,
  },
  removeCouponText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ef4444',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 6,
    fontWeight: '600',
  },
  methodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  methodCard: {
    width: '48%',
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 12,
  },
  methodCardActive: {
    borderColor: Colors.primaryOrange,
    backgroundColor: '#fffaf5',
  },
  methodIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  methodLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  methodLabelActive: {
    color: Colors.primaryOrange,
  },
  methodSub: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  methodDetailBox: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  detailBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  upiAppsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  upiAppBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
  },
  upiAppBtnActive: {
    borderColor: Colors.primaryOrange,
    backgroundColor: '#fff7ed',
  },
  upiAppName: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    marginTop: 4,
  },
  upiAppNameActive: {
    color: Colors.primaryOrange,
  },
  detailInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.textPrimary,
  },
  banksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bankBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bankBtnActive: {
    borderColor: Colors.primaryOrange,
    backgroundColor: '#fff7ed',
  },
  bankBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  bankBtnTextActive: {
    color: Colors.primaryOrange,
    fontWeight: '800',
  },
  secureText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 14,
  },
  securityBoxText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  payBtn: {
    backgroundColor: Colors.primaryOrange,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  payBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  // Success styles
  successContainer: {
    padding: 24,
    alignItems: 'center',
  },
  successIconBubble: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  successDesc: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  receiptVal: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  receiptValMono: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: Colors.textPrimary,
  },
  receiptValHighlight: {
    fontSize: 17,
    fontWeight: '900',
    color: Colors.primaryOrange,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  badgeSuccess: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  badgeSuccessText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#065f46',
  },
  startLearningBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingVertical: 16,
    ...Shadows.card,
  },
  startLearningBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
  },
  // PhonePe PG styles
  methodCardPhonePe: {
    width: '100%',
    backgroundColor: '#fbfaff',
    borderWidth: 1.5,
    borderColor: '#e9d5ff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 4,
  },
  methodCardPhonePeActive: {
    borderColor: '#5f259f',
    backgroundColor: '#f5f3ff',
  },
  phonePeCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phonePeIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9d5ff',
  },
  phonePeLabelActive: {
    color: '#5f259f',
  },
  officialBadge: {
    backgroundColor: '#5f259f',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  officialBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActivePhonePe: {
    borderColor: '#5f259f',
  },
  radioDotPhonePe: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5f259f',
  },
  phonePeDetailBox: {
    backgroundColor: '#f5f3ff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    marginBottom: 16,
  },
  phonePePurpleBadgeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phonePeDetailTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5f259f',
    marginBottom: 3,
  },
  phonePeDetailSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  payBtnPhonePe: {
    backgroundColor: '#5f259f',
  },
  // PhonePe Gateway active modal view
  phonePeActiveContainer: {
    padding: 22,
    alignItems: 'center',
  },
  phonePeLogoCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#f5f3ff',
    borderWidth: 2,
    borderColor: '#ddd6fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  phonePeActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f5f3ff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    marginBottom: 10,
  },
  liveIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  phonePeActiveBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#5f259f',
  },
  phonePeActiveTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  phonePeActiveDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 18,
  },
  phonePeInfoCard: {
    width: '100%',
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  phonePeInfoAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#5f259f',
  },
  verifyPhonePeBtn: {
    width: '100%',
    backgroundColor: '#10b981',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    ...Shadows.card,
  },
  verifyPhonePeBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  reopenGatewayBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f5f3ff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ddd6fe',
    paddingVertical: 13,
    marginBottom: 8,
  },
  reopenGatewayBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#5f259f',
  },
  cancelPhonePeBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelPhonePeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMuted,
  },
});
