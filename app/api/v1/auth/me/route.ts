import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { User } from '../../../../../src/db/models';
import { getAuthUserFromRequest } from '../jwt';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authPayload = await getAuthUserFromRequest(request);
    if (!authPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: invalid or missing token' },
        { status: 401 }
      );
    }

    // Ensure table has latest schema
    try {
      await User.sync({ alter: true });
    } catch (sErr) {
      // Table may already be up to date
    }

    const user = await User.findByPk(authPayload.userId, {
      attributes: [
        'id',
        'name',
        'email',
        'role',
        'bio',
        'avatar',
        'phone',
        'educationDetails',
        'addressDetails',
        'familyDetails',
        'studentCategory',
        'referralCode',
        'referredBy',
        'freeDemoCredits',
        'referralsCount',
      ],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Auto-generate referralCode if missing
    if (!user.referralCode) {
      const { generateReferralCode } = await import('../../../../../src/lib/referral');
      user.referralCode = generateReferralCode(user.name);
      await user.save().catch(() => {});
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        phone: user.phone || null,
        educationDetails: user.educationDetails || null,
        addressDetails: user.addressDetails || null,
        familyDetails: user.familyDetails || null,
        studentCategory: user.studentCategory || null,
        referralCode: user.referralCode,
        referredBy: user.referredBy || null,
        freeDemoCredits: Number(user.freeDemoCredits || 0),
        referralsCount: Number(user.referralsCount || 0),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Auth check failed' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authPayload = await getAuthUserFromRequest(request);
    if (!authPayload) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: invalid or missing token' },
        { status: 401 }
      );
    }

    const body = await request.json();

    try {
      await User.sync({ alter: true });
    } catch (sErr) {
      // Table may already be up to date
    }

    const user = await User.findByPk(authPayload.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update allowable fields
    if (body.name !== undefined) user.name = body.name?.trim() || user.name;
    if (body.bio !== undefined) user.bio = body.bio;
    // Handle avatar upload (supports base64 data URL or direct URL)
    const rawAvatar = body.avatarDataUrl || body.avatar;
    if (rawAvatar && typeof rawAvatar === 'string' && rawAvatar.startsWith('data:image')) {
      try {
        const matches = rawAvatar.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
        if (matches) {
          const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          const uniqueName = `avatar-${user.id}-${Date.now()}.${ext}`;
          const uploadDir = path.join(process.cwd(), 'public', 'uploads');
          await fs.promises.mkdir(uploadDir, { recursive: true }).catch(() => {});
          await fs.promises.writeFile(path.join(uploadDir, uniqueName), buffer);
          user.avatar = `/uploads/${uniqueName}`;
        }
      } catch (uploadErr) {
        console.error('Failed to save avatar image:', uploadErr);
      }
    } else if (body.avatar !== undefined) {
      user.avatar = body.avatar;
    }
    if (body.phone !== undefined) user.phone = body.phone?.trim() || null;
    if (body.educationDetails !== undefined) user.educationDetails = body.educationDetails;
    if (body.addressDetails !== undefined) user.addressDetails = body.addressDetails;
    if (body.familyDetails !== undefined) user.familyDetails = body.familyDetails;
    if (body.studentCategory !== undefined) user.studentCategory = body.studentCategory;

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        phone: user.phone,
        educationDetails: user.educationDetails,
        addressDetails: user.addressDetails,
        familyDetails: user.familyDetails,
        studentCategory: user.studentCategory,
      },
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  return PUT(request);
}
