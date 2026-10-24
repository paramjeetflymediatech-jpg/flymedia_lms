import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '../../../../../src/db/models';
import { createAuthToken } from '../jwt';
import { generateReferralCode, processReferralReward } from '../../../../../src/lib/referral';

export async function POST(request: Request) {
  try {
    const { name, email, password, referralCode } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Account with this email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userReferralCode = generateReferralCode(name);

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      role: 'STUDENT',
      referralCode: userReferralCode,
      freeDemoCredits: 0,
      referralsCount: 0,
    });

    // If referral code was entered, reward the referring friend with 1 Free ₹99 Demo Class!
    let referralResult: any = null;
    if (referralCode && String(referralCode).trim()) {
      referralResult = await processReferralReward({
        newUserId: user.id,
        referralCode: String(referralCode).trim(),
      });
    }

    const token = await createAuthToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      token,
      referralApplied: referralResult?.success || false,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        referralCode: user.referralCode,
        referredBy: user.referredBy || null,
        freeDemoCredits: user.freeDemoCredits || 0,
        referralsCount: user.referralsCount || 0,
        token,
      },
    });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}

