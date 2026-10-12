import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking,
  AppState,
  AppStateStatus,
} from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import {
  X,
  ShieldCheck,
  CheckCircle,
  Lock,
  ArrowRight,
  AlertCircle,
  RefreshCw,
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

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  course,
  onClose,
  onSuccess,
}) => {
  const { user, purchaseCourse, refreshEnrollments } = useAuth();

  const originalPrice = course.price ? Number(course.price) : 0;
  const finalPrice = originalPrice;

  // Checkout process state
  const [processing, setProcessing] = useState(false);
  const [isWaitingForPhonePe, setIsWaitingForPhonePe] = useState(false);
  const [activeTxnId, setActiveTxnId] = useState<string | null>(null);
  const [checkingLiveStatus, setCheckingLiveStatus] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState<{
    transactionId: string;
    amount: number;
    method: string;
  } | null>(null);

  // Keep ref to avoid stale closures inside AppState listener
  const waitingRef = useRef(isWaitingForPhonePe);
  const txnIdRef = useRef(activeTxnId);
  waitingRef.current = isWaitingForPhonePe;
  txnIdRef.current = activeTxnId;

  // Reset states when modal visibility changes
  useEffect(() => {
    if (visible) {
      setProcessing(false);
      setIsWaitingForPhonePe(false);
      setActiveTxnId(null);
      setCheckingLiveStatus(false);
      setPaymentError('');
      setPaymentSuccess(null);
    }
  }, [visible, course]);

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
      // Small pause to allow PhonePe gateway callback to settle
      await new Promise(resolve => setTimeout(() => resolve(null), 1200));

      const res = await ApiService.checkPaymentStatus(txnId, user?.token || '');

      if (res && res.success) {
        await refreshEnrollments();
        setIsWaitingForPhonePe(false);
        setActiveTxnId(null);
        setPaymentSuccess({
          transactionId: txnId,
          amount: finalPrice,
          method: 'PhonePe',
        });
      } else {
        // Payment failed or was cancelled by user
        setIsWaitingForPhonePe(false);
        setActiveTxnId(null);
        setPaymentError(
          res?.message || 'Payment was not completed or was cancelled. Please retry payment.'
        );
      }
    } catch (err: any) {
      setIsWaitingForPhonePe(false);
      setActiveTxnId(null);
      setPaymentError('Payment was not completed or was cancelled. Please retry payment.');
    } finally {
      setCheckingLiveStatus(false);
    }
  };

  const handleProcessPayment = async () => {
    setProcessing(true);
    setPaymentError('');

    const res = await purchaseCourse({
      course,
      paymentMethod: 'PHONEPE',
      amount: finalPrice,
      paymentDetails: {
        gateway: 'PhonePe PG',
      },
    });

    setProcessing(false);

    if (res.success) {
      const redirect = (res as any).redirectUrl;
      const txn = res.transactionId || `TXN_${Date.now()}`;

      if (redirect) {
        setActiveTxnId(txn);
        setIsWaitingForPhonePe(true);
        Linking.openURL(redirect).catch(() => {});
        return;
      }

      setPaymentSuccess({
        transactionId: txn,
        amount: finalPrice,
        method: 'PhonePe',
      });
    } else {
      setPaymentError(res.error || 'Payment initialization failed. Please retry.');
    }
  };

  const handleCancelWaiting = () => {
    setIsWaitingForPhonePe(false);
    setActiveTxnId(null);
    setCheckingLiveStatus(false);
    setPaymentError('Payment was cancelled. You can retry anytime.');
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
                  : checkingLiveStatus || isWaitingForPhonePe
                  ? 'Verifying Payment'
                  : 'PhonePe Checkout'}
              </Text>
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {course.title}
              </Text>
            </View>
            <TouchableOpacity
              onPress={paymentSuccess ? handleDone : onClose}
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
          ) : checkingLiveStatus || isWaitingForPhonePe ? (
            /* AUTOMATIC VERIFICATION SCREEN - SHOWN WHILE USER COMPLETES OR UPON RETURN */
            <View style={styles.verifyingContainer}>
              <View style={styles.verifyingIconCircle}>
                <ActivityIndicator size="large" color="#5f259f" />
              </View>

              <Text style={styles.verifyingTitle}>
                {checkingLiveStatus ? 'Checking Payment Status...' : 'Waiting for PhonePe Payment'}
              </Text>
              <Text style={styles.verifyingDesc}>
                {checkingLiveStatus
                  ? 'Communicating with PhonePe gateway to confirm your payment status. Please wait a moment...'
                  : 'Please complete your payment in PhonePe. When you return back to this screen, we will check payment status automatically.'}
              </Text>

              <View style={styles.verifyingAmountCard}>
                <Text style={styles.verifyingAmountLabel}>Order Total</Text>
                <Text style={styles.verifyingAmountValue}>
                  ₹{finalPrice.toLocaleString('en-IN')}
                </Text>
              </View>

              {/* Retry / Cancel action */}
              <TouchableOpacity
                style={styles.cancelWaitingBtn}
                onPress={handleCancelWaiting}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelWaitingBtnText}>Cancel & Retry Payment</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* MAIN CHECKOUT SCREEN */
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

                <View style={styles.summaryDivider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.summaryTotalLabel}>Total Payable</Text>
                  <Text style={styles.summaryTotalAmount}>
                    ₹{finalPrice.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>

              {/* Payment Error / Cancellation Banner with Retry Info */}
              {paymentError ? (
                <View style={styles.errorBannerContainer}>
                  <AlertCircle size={20} color="#dc2626" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.errorBannerTitle}>Payment Incomplete</Text>
                    <Text style={styles.errorBannerText}>{paymentError}</Text>
                  </View>
                </View>
              ) : null}

              {/* Security Banner */}
              <View style={styles.securityBox}>
                <Lock size={14} color="#10b981" />
                <Text style={styles.securityBoxText}>
                  Protected by 256-bit bank encryption • 100% Safe & RBI Compliant
                </Text>
              </View>

              {/* PROCEED / RETRY BUTTON */}
              <TouchableOpacity
                style={styles.payBtnPhonePe}
                onPress={handleProcessPayment}
                disabled={processing}
                activeOpacity={0.85}
              >
                {processing ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.payBtnText}>Connecting to PhonePe Gateway...</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {paymentError ? (
                      <RefreshCw size={18} color="#ffffff" />
                    ) : null}
                    <Text style={styles.payBtnText}>
                      {paymentError ? 'Retry Payment' : 'Proceed to Pay'}
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
  // Error Banner with Alert Icon
  errorBannerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1.5,
    borderColor: '#fecaca',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  errorBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#b91c1c',
    marginBottom: 2,
  },
  errorBannerText: {
    fontSize: 12,
    color: '#dc2626',
    lineHeight: 17,
    fontWeight: '500',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 16,
  },
  securityBoxText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  payBtnPhonePe: {
    backgroundColor: '#5f259f',
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
  // Verifying / Checking Status View
  verifyingContainer: {
    padding: 28,
    alignItems: 'center',
  },
  verifyingIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#ddd6fe',
  },
  verifyingTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  verifyingDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  verifyingAmountCard: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyingAmountLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  verifyingAmountValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#5f259f',
    marginTop: 2,
  },
  cancelWaitingBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  cancelWaitingBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textMuted,
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
});
