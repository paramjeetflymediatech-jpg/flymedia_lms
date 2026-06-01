import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../src/lib/auth';
import { Course, Payment } from '../../../../src/db/models';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, batchMode } = await req.json();
    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const amount = Number(course.price);
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount for paid course' }, { status: 400 });
    }

    const clientId = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
    const clientSecret = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    const clientVersion = Number(process.env.PHONEPE_SALT_INDEX) || 1;
    const isProd = process.env.PHONEPE_ENV === 'PRODUCTION';

    const transactionId = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Create Payment Record (PENDING)
    await Payment.create({
      userId: user.id,
      courseId: course.id,
      amount,
      transactionId,
      status: 'PENDING',
      provider: 'PHONEPE',
      batchMode: batchMode || 'ONLINE',
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/api/payment/callback`;

    // Construct PhonePe V1 Payload
    const payload = {
      merchantId: clientId,
      merchantTransactionId: transactionId,
      merchantUserId: `U_${user.id}`,
      amount: amount * 100, // paise
      redirectUrl: redirectUrl,
      redirectMode: 'REDIRECT',
      callbackUrl: redirectUrl,
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const checksum = crypto.createHash('sha256').update(base64Payload + '/pg/v1/pay' + clientSecret).digest('hex') + '###' + clientVersion;

    const endpoint = isProd 
      ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
      : 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay';

    const phonePeRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum
      },
      body: JSON.stringify({ request: base64Payload })
    });

    const response = await phonePeRes.json();
    
    if (response && response.success && response.data && response.data.instrumentResponse) {
      return NextResponse.json({
        success: true,
        redirectUrl: response.data.instrumentResponse.redirectInfo.url,
      });
    } else {
      console.error('PhonePe init response error:', response);
      return NextResponse.json({ error: response?.message || 'Failed to initiate payment with gateway' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
