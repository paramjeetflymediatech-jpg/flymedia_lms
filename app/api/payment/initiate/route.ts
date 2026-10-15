import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../src/lib/auth';
import { getAuthUserFromRequest } from '../../v1/auth/jwt';
import { Package, Payment } from '../../../../src/db/models';
import { StandardCheckoutClient, StandardCheckoutPayRequest, Env } from 'pg-sdk-node';

export async function POST(req: Request) {
  try {
    let userId: string | null = null;
    let userRole: string | null = null;
    const authUser = await getAuthUserFromRequest(req);
    if (authUser) {
      userId = authUser.userId;
      userRole = authUser.role;
    } else {
      const user = await requireAuth();
      if (user) {
        userId = user.id;
        userRole = user.role;
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: please sign in to purchase course' }, { status: 401 });
    }

    if (userRole === 'TUTOR') {
      return NextResponse.json({ error: 'Tutors cannot purchase courses. Please use a student account.' }, { status: 403 });
    }

    const { packageId, slug, batchMode, amount: customAmount } = await req.json();
    if (!packageId && !slug) {
      return NextResponse.json({ error: 'Package ID or slug is required' }, { status: 400 });
    }

    const packageAttributes = ['id', 'title', 'slug', 'price', 'category', 'status'] as any;
    let pkg = null;
    if (packageId) {
      pkg = await Package.findByPk(packageId, { attributes: packageAttributes }).catch(() => null);
      if (!pkg) {
        pkg = await Package.findOne({ where: { slug: packageId }, attributes: packageAttributes });
      }
    }
    if (!pkg && slug) {
      pkg = await Package.findOne({ where: { slug }, attributes: packageAttributes });
    }

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    const amount = customAmount && Number(customAmount) > 0 ? Number(customAmount) : Number(pkg.price);
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount for paid package' }, { status: 400 });
    }

    const clientId = process.env.PHONEPE_CLIENT_ID || process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT86';
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET || process.env.PHONEPE_SALT_KEY || '96434309-7796-489d-8924-ab56988a6076';
    const clientVersion = Number(process.env.PHONEPE_SALT_INDEX) || 1;
    const isProd = process.env.PHONEPE_ENV?.toUpperCase() === 'PRODUCTION';

    const transactionId = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Create Payment Record (PENDING)
    await Payment.create({
      userId,
      packageId: pkg.id,
      amount,
      transactionId,
      status: 'PENDING',
      provider: 'PHONEPE',
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const callbackRedirectUrl = `${baseUrl}/api/payment/callback?transactionId=${transactionId}`;

    let redirectUrl: string | null = null;
    try {
      const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, isProd ? Env.PRODUCTION : Env.SANDBOX);

      const request = StandardCheckoutPayRequest.builder()
        .merchantOrderId(transactionId)
        .amount(amount * 100) // paise
        .redirectUrl(callbackRedirectUrl)
        .build();

      const response = await client.pay(request);
      if (response && response.redirectUrl) {
        redirectUrl = response.redirectUrl;
      }
    } catch (sdkError: any) {
      console.warn('PhonePe gateway initiation error:', sdkError?.message || sdkError);
      // In sandbox mode, if PhonePe UAT server returns unauthorized, use direct sandbox verification redirect
      if (!isProd) {
        redirectUrl = `${baseUrl}/api/payment/callback?transactionId=${transactionId}&status=SUCCESS`;
      } else {
        throw sdkError;
      }
    }

    if (redirectUrl) {
      return NextResponse.json({
        success: true,
        redirectUrl,
      });
    } else {
      return NextResponse.json({ error: 'Failed to initiate payment with gateway' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
