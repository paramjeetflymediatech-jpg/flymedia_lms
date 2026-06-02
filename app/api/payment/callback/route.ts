import { NextResponse } from 'next/server';
import { Payment, Enrollment, Course } from '../../../../src/db/models';
import crypto from 'crypto';

export async function POST(req: Request) {
  return await handleCallback(req);
}

export async function GET(req: Request) {
  // Sometimes gateways redirect via GET for user return
  return await handleCallback(req);
}

async function handleCallback(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let txnId = searchParams.get('transactionId') || searchParams.get('txnId') || searchParams.get('merchantTransactionId');

    if (!txnId && req.method === 'POST') {
      try {
        const formData = await req.formData();
        const txid = formData.get('transactionId');
        if (txid) txnId = txid.toString();
      } catch (e) {
        console.error("Failed to parse POST body", e);
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;

    if (!txnId) {
      return NextResponse.redirect(new URL('/dashboard?error=MissingTxnId', baseUrl));
    }

    const payment = await Payment.findOne({ where: { transactionId: txnId } });
    if (!payment) {
      return NextResponse.redirect(new URL('/dashboard?error=PaymentNotFound', baseUrl));
    }

    // Initialize PhonePe Verification
    const clientId = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
    const clientSecret = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
    const clientVersion = Number(process.env.PHONEPE_SALT_INDEX) || 1;
    const isProd = process.env.PHONEPE_ENV === 'PRODUCTION';

    // Verify transaction status directly with PhonePe V1 API
    const checksum = crypto.createHash('sha256').update(`/pg/v1/status/${clientId}/${txnId}` + clientSecret).digest('hex') + '###' + clientVersion;
    
    const endpoint = isProd 
      ? `https://api.phonepe.com/apis/hermes/pg/v1/status/${clientId}/${txnId}`
      : `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${clientId}/${txnId}`;

    const phonePeRes = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': checksum,
        'X-MERCHANT-ID': clientId
      }
    });

    const statusResponse = await phonePeRes.json();

    const isSuccess = statusResponse?.success && statusResponse?.data?.state === 'COMPLETED';

    if (isSuccess) {
      payment.status = 'SUCCESS';
      await payment.save();

      // Check if already enrolled
      const existing = await Enrollment.findOne({
        where: { userId: payment.userId, courseId: payment.courseId }
      });

      if (!existing) {
        await Enrollment.create({
          userId: payment.userId,
          courseId: payment.courseId,
          batchMode: payment.batchMode,
        });
      }

      return NextResponse.redirect(new URL('/dashboard?payment=success', baseUrl));
    } else {
      payment.status = 'FAILED';
      await payment.save();
    }

    return NextResponse.redirect(new URL('/dashboard?payment=failed', baseUrl));

  } catch (error) {
    console.error('Payment callback error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
    return NextResponse.redirect(new URL('/dashboard?payment=error', baseUrl));
  }
}
