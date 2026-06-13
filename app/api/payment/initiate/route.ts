import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../src/lib/auth';
import { Package, Payment } from '../../../../src/db/models';
import { StandardCheckoutClient, StandardCheckoutPayRequest, Env } from 'pg-sdk-node';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packageId, batchMode } = await req.json();
    if (!packageId) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });
    }

    const pkg = await Package.findByPk(packageId);
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 });
    }

    const amount = Number(pkg.price);
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount for paid package' }, { status: 400 });
    }

    const clientId = process.env.PHONEPE_CLIENT_ID || 'PGTESTPAYUAT86';
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET || '96434309-7796-489d-8924-ab56988a6076';
    const clientVersion = Number(process.env.PHONEPE_SALT_INDEX) || 1;
    const isProd = process.env.PHONEPE_ENV?.toUpperCase() === 'PRODUCTION';

    const transactionId = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Create Payment Record (PENDING)
    await Payment.create({
      userId: user.id,
      packageId: pkg.id,
      amount,
      transactionId,
      status: 'PENDING',
      provider: 'PHONEPE',
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/api/payment/callback?transactionId=${transactionId}`;

    const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, isProd ? Env.PRODUCTION : Env.SANDBOX);

    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(transactionId)
      .amount(amount * 100) // paise
      .redirectUrl(redirectUrl)
      .build();

    const response = await client.pay(request);
    
    if (response && response.redirectUrl) {
      return NextResponse.json({
        success: true,
        redirectUrl: response.redirectUrl,
      });
    } else {
      console.error('PhonePe init response error:', response);
      return NextResponse.json({ error: 'Failed to initiate payment with gateway' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
