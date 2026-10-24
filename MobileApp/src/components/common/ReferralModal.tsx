import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Linking,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { Colors, Shadows } from '../../theme/colors';
import {
  X,
  Gift,
  Share2,
  Users,
  Sparkles,
  CheckCircle2,
  Copy,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Award,
  Zap,
  ArrowRight,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';

interface ReferralModalProps {
  visible: boolean;
  onClose: () => void;
  onRedeemFreeDemo?: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  visible,
  onClose,
  onRedeemFreeDemo,
}) => {
  const { user, refreshProfile } = useAuth();
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [referralCode, setReferralCode] = useState(user?.referralCode || 'FLY-LMS');
  const [referralsCount, setReferralsCount] = useState(user?.referralsCount || 0);
  const [freeDemoCredits, setFreeDemoCredits] = useState(user?.freeDemoCredits || 0);
  const [referredFriends, setReferredFriends] = useState<any[]>([]);

  // Load latest referral stats when modal opens
  useEffect(() => {
    if (visible && user?.token) {
      setLoadingDetails(true);
      ApiService.getReferralDetails(user.token)
        .then((res) => {
          if (res && res.success) {
            if (res.referralCode) setReferralCode(res.referralCode);
            if (typeof res.referralsCount === 'number') setReferralsCount(res.referralsCount);
            if (typeof res.freeDemoCredits === 'number') setFreeDemoCredits(res.freeDemoCredits);
            if (Array.isArray(res.referredFriends)) setReferredFriends(res.referredFriends);
          }
        })
        .catch(() => {})
        .finally(() => {
          setLoadingDetails(false);
        });

      if (refreshProfile) {
        refreshProfile().catch(() => {});
      }
    }
  }, [visible, user?.token]);

  const shareUrl = `https://course.flymediatech.com/register?ref=${referralCode}`;
  const shareMessage = `Hey! 🚀 I'm learning top technical skills on Flymedia LMS.\n\nUse my exclusive invite code "${referralCode}" when you sign up, and we both unlock a 1-on-1 ₹99 Live Demo Class with senior mentors for FREE!\n\nJoin here: ${shareUrl}`;

  const handleShareApp = async () => {
    try {
      await Share.share({
        title: 'Join Flymedia LMS & Get Free ₹99 Demo Class',
        message: shareMessage,
        url: shareUrl,
      });
    } catch (err: any) {
      console.warn('Share error:', err);
    }
  };

  const handleWhatsAppShare = () => {
    const waUrl = `whatsapp://send?text=${encodeURIComponent(shareMessage)}`;
    Linking.canOpenURL(waUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(waUrl);
        } else {
          handleShareApp();
        }
      })
      .catch(() => {
        handleShareApp();
      });
  };

  const handleCopyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    Alert.alert(
      'Referral Code Copied! ✨',
      `Your code "${referralCode}" is ready to share with your friends.`,
      [{ text: 'OK' }]
    );
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    Alert.alert(
      'Invite Link Copied! 🔗',
      `Invite link "${shareUrl}" is ready. Send it to your friends on WhatsApp or message!`,
      [{ text: 'OK' }]
    );
  };

  const handleRedeemPress = () => {
    onClose();
    if (onRedeemFreeDemo) {
      onRedeemFreeDemo();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* MODAL HEADER */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleWrap}>
              <View style={styles.headerIconCircle}>
                <Gift size={20} color={Colors.primaryRose} strokeWidth={2.4} />
              </View>
              <View>
                <Text style={styles.modalTitle}>Refer & Earn</Text>
                <Text style={styles.modalSubtitle}>Get a ₹99 Demo Class Free</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Close referral dialog"
            >
              <X size={20} color="#64748B" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollBody}
          >
            {/* HERO PROMO CARD */}
            <View style={styles.heroBanner}>
              <View style={styles.heroBadge}>
                <Zap size={11} color="#ffffff" fill="#ffffff" />
                <Text style={styles.heroBadgeText}>1 FRIEND SIGNUP = 1 FREE DEMO CLASS</Text>
              </View>

              <Text style={styles.heroTitle}>Invite Friends, Learn Together!</Text>
              <Text style={styles.heroDesc}>
                Share Flymedia LMS with your classmates & friends. When they complete signup using your referral code, you automatically get a <Text style={{ fontWeight: '800', color: '#FEE2E2' }}>₹99 1-on-1 Demo Class 100% Free</Text> for any course!
              </Text>

              {/* LIVE REWARD STATS TILES */}
              <View style={styles.statsRow}>
                <View style={styles.statTile}>
                  <Text style={styles.statValue}>{freeDemoCredits}</Text>
                  <Text style={styles.statLabel}>Free Demo Passes</Text>
                  <View style={styles.statDotActive} />
                </View>

                <View style={styles.statTileDivider} />

                <View style={styles.statTile}>
                  <Text style={styles.statValue}>{referralsCount}</Text>
                  <Text style={styles.statLabel}>Friends Joined</Text>
                  <Users size={12} color="#CBD5E1" style={{ marginTop: 2 }} />
                </View>
              </View>

              {/* REDEEM BUTTON IF CREDITS AVAILABLE */}
              {freeDemoCredits > 0 && (
                <TouchableOpacity
                  style={styles.redeemFreeBtn}
                  onPress={handleRedeemPress}
                  activeOpacity={0.88}
                >
                  <Sparkles size={16} color="#065F46" />
                  <Text style={styles.redeemFreeBtnText}>
                    Redeem Free Demo Class ({freeDemoCredits} Available)
                  </Text>
                  <ArrowRight size={15} color="#065F46" />
                </TouchableOpacity>
              )}
            </View>

            {/* HOW IT WORKS 3-STEP GUIDE */}
            <View style={styles.sectionWrap}>
              <Text style={styles.sectionHeaderTitle}>How It Works</Text>
              
              <View style={styles.stepsList}>
                {/* STEP 1 */}
                <View style={styles.stepItem}>
                  <View style={[styles.stepNumberBadge, { backgroundColor: '#FFF1F2' }]}>
                    <Text style={[styles.stepNumberText, { color: Colors.primaryRose }]}>1</Text>
                  </View>
                  <View style={styles.stepBody}>
                    <Text style={styles.stepTitle}>Share Your Code or Link</Text>
                    <Text style={styles.stepSub}>
                      Send your unique code below to friends via WhatsApp or social apps.
                    </Text>
                  </View>
                </View>

                {/* STEP 2 */}
                <View style={styles.stepItem}>
                  <View style={[styles.stepNumberBadge, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={[styles.stepNumberText, { color: '#2563EB' }]}>2</Text>
                  </View>
                  <View style={styles.stepBody}>
                    <Text style={styles.stepTitle}>Friend Signs Up On App</Text>
                    <Text style={styles.stepSub}>
                      Your friend creates an account entering your referral code.
                    </Text>
                  </View>
                </View>

                {/* STEP 3 */}
                <View style={styles.stepItem}>
                  <View style={[styles.stepNumberBadge, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.stepNumberText, { color: '#059669' }]}>3</Text>
                  </View>
                  <View style={styles.stepBody}>
                    <Text style={styles.stepTitle}>You Get ₹99 Demo Class Free</Text>
                    <Text style={styles.stepSub}>
                      Instantly receive 1 free 1-on-1 demo class credit to try any course!
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* YOUR INVITE LINK CARD */}
            <View style={styles.linkCard}>
              <View style={styles.linkLabelRow}>
                <Text style={styles.linkCardLabel}>YOUR UNIQUE INVITE LINK</Text>
                <Text style={styles.linkCardBadge}>Auto-Applies Code</Text>
              </View>
              <View style={styles.linkRow}>
                <Text style={styles.linkText} numberOfLines={1} ellipsizeMode="middle">
                  {shareUrl}
                </Text>
                <TouchableOpacity
                  style={[styles.copyBtn, copiedLink && styles.copyBtnSuccess]}
                  onPress={handleCopyLink}
                  activeOpacity={0.8}
                >
                  {copiedLink ? (
                    <>
                      <CheckCircle2 size={14} color="#059669" />
                      <Text style={[styles.copyBtnText, { color: '#059669' }]}>Copied!</Text>
                    </>
                  ) : (
                    <>
                      <Copy size={14} color={Colors.primaryRose} />
                      <Text style={styles.copyBtnText}>Copy Link</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* YOUR REFERRAL CODE CARD */}
            <View style={styles.codeCard}>
              <Text style={styles.codeCardLabel}>YOUR EXCLUSIVE REFERRAL CODE</Text>
              <View style={styles.codeRow}>
                <Text style={styles.codeText}>{referralCode}</Text>
                <TouchableOpacity
                  style={[styles.copyBtn, copied && styles.copyBtnSuccess]}
                  onPress={handleCopyCode}
                  activeOpacity={0.8}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 size={15} color="#059669" />
                      <Text style={[styles.copyBtnText, { color: '#059669' }]}>Copied!</Text>
                    </>
                  ) : (
                    <>
                      <Copy size={15} color={Colors.primaryRose} />
                      <Text style={styles.copyBtnText}>Copy Code</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* SHARE ACTION BUTTONS */}
            <View style={styles.shareButtonsGroup}>
              <TouchableOpacity
                style={styles.whatsAppBtn}
                onPress={handleWhatsAppShare}
                activeOpacity={0.88}
              >
                <MessageCircle size={18} color="#ffffff" />
                <Text style={styles.whatsAppBtnText}>Share on WhatsApp</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.moreShareBtn}
                onPress={handleShareApp}
                activeOpacity={0.85}
              >
                <Share2 size={17} color="#0F172A" />
                <Text style={styles.moreShareBtnText}>Share Invite Link</Text>
              </TouchableOpacity>
            </View>

            {/* RECENT REFERRALS LIST (IF ANY) */}
            {referredFriends.length > 0 && (
              <View style={styles.historyWrap}>
                <Text style={styles.sectionHeaderTitle}>Friends Who Joined ({referredFriends.length})</Text>
                {referredFriends.map((friend) => (
                  <View key={friend.id} style={styles.friendRow}>
                    <View style={styles.friendAvatarCircle}>
                      <Text style={styles.friendAvatarText}>
                        {friend.friendName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.friendName}>{friend.friendName}</Text>
                      <Text style={styles.friendReward}>
                        {friend.rewardStatus || 'Free ₹99 Demo Class Unlocked'}
                      </Text>
                    </View>
                    <View style={styles.friendSuccessTag}>
                      <CheckCircle2 size={12} color="#059669" />
                      <Text style={styles.friendSuccessText}>Earned</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    ...Shadows.card,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF1F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primaryRose,
    marginTop: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  heroBanner: {
    backgroundColor: '#9F1239', // Rich deep rose
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    ...Shadows.card,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  heroBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  heroDesc: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  statTile: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  statTileDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  statDotActive: {
    position: 'absolute',
    top: 0,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  redeemFreeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 14,
  },
  redeemFreeBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#065F46',
  },
  sectionWrap: {
    marginBottom: 20,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: '900',
  },
  stepBody: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  stepSub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  linkCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 12,
  },
  linkLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  linkCardLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#475569',
    letterSpacing: 0.8,
  },
  linkCardBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primaryRose,
    backgroundColor: '#FFE4E6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  linkText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    backgroundColor: '#EDF2F7',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  codeCard: {
    backgroundColor: '#FFF1F2',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FECDD3',
    borderStyle: 'dashed',
    padding: 16,
    marginBottom: 16,
  },
  codeCardLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#E11D48',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#9F1239',
    letterSpacing: 1.5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  copyBtnSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.primaryRose,
  },
  shareButtonsGroup: {
    gap: 10,
    marginBottom: 20,
  },
  whatsAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#25D366',
    paddingVertical: 14,
    borderRadius: 14,
    ...Shadows.card,
  },
  whatsAppBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  moreShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 14,
  },
  moreShareBtnText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  historyWrap: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  friendAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4338CA',
  },
  friendName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  friendReward: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginTop: 1,
  },
  friendSuccessTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  friendSuccessText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
});
