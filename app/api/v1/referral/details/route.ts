import { NextResponse } from 'next/server';
import { getAuthUserFromRequest } from '../../auth/jwt';
import { User, Referral } from '../../../../../src/db/models';
import { generateReferralCode } from '../../../../../src/lib/referral';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authPayload = await getAuthUserFromRequest(request);
    if (!authPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: login required' },
        { status: 401 }
      );
    }

    const user = await User.findByPk(authPayload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.referralCode) {
      user.referralCode = generateReferralCode(user.name);
      await user.save().catch(() => {});
    }

    // Fetch referred friends list
    const referrals = await Referral.findAll({
      where: { referrerId: user.id },
      include: [
        {
          model: User,
          as: 'referredUser',
          attributes: ['id', 'name', 'createdAt'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    const referredFriends = referrals.map((r: any) => ({
      id: r.id,
      friendName: r.referredUser?.name ? (r.referredUser.name.split(' ')[0] + ' ' + (r.referredUser.name.split(' ')[1] ? r.referredUser.name.split(' ')[1][0] + '.' : '')) : 'Friend',
      joinedAt: r.createdAt,
      rewardStatus: 'Free ₹99 Demo Class Unlocked',
    }));

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://course.flymediatech.com';
    const referralLink = `${baseUrl}/register?ref=${user.referralCode}`;

    return NextResponse.json({
      success: true,
      referralCode: user.referralCode,
      referralLink,
      freeDemoCredits: Number(user.freeDemoCredits || 0),
      referralsCount: Number(user.referralsCount || 0),
      referredFriends,
    });
  } catch (error: any) {
    console.error('Error fetching referral details:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch referral details' },
      { status: 500 }
    );
  }
}
