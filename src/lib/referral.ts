import crypto from 'crypto';
import { User, Referral } from '../db/models';

/**
 * Generates a clean, friendly, uppercase referral code.
 * Example: "FLY-NAV-4A82" or "FLY-7E19B2"
 */
export function generateReferralCode(name?: string | null): string {
  let prefix = 'FLY';
  if (name) {
    const clean = name.trim().replace(/[^a-zA-Z]/g, '').toUpperCase();
    if (clean.length >= 2) {
      prefix = `FLY-${clean.slice(0, 3)}`;
    }
  }
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
  return `${prefix}-${randomSuffix}`;
}

/**
 * Processes a referral when a new friend signs up.
 * Awards the referrer +1 Free ₹99 Demo Class Credit.
 */
export async function processReferralReward(options: {
  newUserId: string;
  referralCode?: string | null;
}) {
  const { newUserId, referralCode } = options;
  if (!referralCode || !referralCode.trim()) {
    return { success: false, reason: 'No referral code provided' };
  }

  const cleanCode = referralCode.trim().toUpperCase();

  try {
    // 1. Locate the referring user by referral code
    const referrer = await User.findOne({
      where: { referralCode: cleanCode },
    });

    if (!referrer) {
      return { success: false, reason: 'Invalid or expired referral code' };
    }

    // 2. Prevent self-referral
    if (referrer.id === newUserId) {
      return { success: false, reason: 'Self-referral is not permitted' };
    }

    // 3. Prevent duplicate referral attribution for the same user
    const existingRef = await Referral.findOne({
      where: { referredUserId: newUserId },
    });
    if (existingRef) {
      return { success: false, reason: 'Referral already applied for this account' };
    }

    // 4. Reward referrer: +1 Free ₹99 Demo Class Credit and increment referrals count
    referrer.freeDemoCredits = (referrer.freeDemoCredits || 0) + 1;
    referrer.referralsCount = (referrer.referralsCount || 0) + 1;
    await referrer.save();

    // 5. Update the new user's referredBy attribute
    const newUser = await User.findByPk(newUserId);
    if (newUser) {
      newUser.referredBy = referrer.referralCode;
      await newUser.save();
    }

    // 6. Record the transaction in the referrals table
    const referralRecord = await Referral.create({
      referrerId: referrer.id,
      referredUserId: newUserId,
      referralCode: cleanCode,
      rewardDescription: 'Free ₹99 Demo Class Pass',
      status: 'COMPLETED',
      rewardClaimed: false,
    });

    return {
      success: true,
      referrerId: referrer.id,
      referrerName: referrer.name,
      freeDemoCredits: referrer.freeDemoCredits,
      referralRecordId: referralRecord.id,
    };
  } catch (error: any) {
    console.error('Error processing referral reward:', error);
    return { success: false, error: error.message };
  }
}
