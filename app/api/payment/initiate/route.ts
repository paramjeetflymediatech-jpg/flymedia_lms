import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getCurrentUser } from '../../../../src/lib/auth';
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
      const user = await getCurrentUser();
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

    const { packageId, slug, amount: customAmount } = await req.json();
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

    const merchantId = process.env.PHONEPE_MERCHANT_ID || process.env.PHONEPE_CLIENT_ID || 'PGTESTPAYUAT86';
    const saltKey = process.env.PHONEPE_SALT_KEY || process.env.PHONEPE_CLIENT_SECRET || '96434309-7796-489d-8924-ab56988a6076';
    const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
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

    // 1. First attempt: Official PhonePe Standard PG v1 API (Industry standard with SHA256)
    try {
      const host = isProd
        ? 'https://api.phonepe.com/apis/hermes'
        : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

      const payload = {
        merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: `MUID_${userId.replace(/-/g, '').slice(0, 20)}`,
        amount: Math.round(amount * 100), // in paise
        redirectUrl: callbackRedirectUrl,
        redirectMode: 'POST',
        callbackUrl: callbackRedirectUrl,
        mobileNumber: '9999999999',
        paymentInstrument: {
          type: 'PAY_PAGE',
        },
      };

      const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
      const stringToHash = `${base64Payload}/pg/v1/pay${saltKey}`;
      const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
      const xVerify = `${sha256}###${saltIndex}`;

      const response = await fetch(`${host}/pg/v1/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          accept: 'application/json',
        },
        body: JSON.stringify({ request: base64Payload }),
      });

      const data = await response.json();
      if (data && data.success && data.data?.instrumentResponse?.redirectInfo?.url) {
        redirectUrl = data.data.instrumentResponse.redirectInfo.url;
      } else {
        console.warn('PhonePe v1 pay returned non-success:', data);
      }
    } catch (v1Err) {
      console.warn('PhonePe v1 API error:', v1Err);
    }

    // 2. Second attempt (fallback): pg-sdk-node if OAuth client is configured
    if (!redirectUrl) {
      try {
        const client = StandardCheckoutClient.getInstance(merchantId, saltKey, Number(saltIndex) || 1, isProd ? Env.PRODUCTION : Env.SANDBOX);
        const request = StandardCheckoutPayRequest.builder()
          .merchantOrderId(transactionId)
          .amount(amount * 100)
          .redirectUrl(callbackRedirectUrl)
          .build();

        const response = await client.pay(request);
        if (response && response.redirectUrl) {
          redirectUrl = response.redirectUrl;
        }
      } catch (sdkError: any) {
        console.warn('PhonePe pg-sdk-node error:', sdkError?.message || sdkError);
      }
    }

    if (redirectUrl) {
      return NextResponse.json({
        success: true,
        redirectUrl,
        transactionId,
      });
    }

    return NextResponse.json(
      { error: 'Failed to initiate payment with PhonePe gateway. Please verify gateway credentials.' },
      { status: 502 }
    );
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
