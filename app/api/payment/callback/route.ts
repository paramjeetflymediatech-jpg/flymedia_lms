import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { Payment, Enrollment } from '../../../../src/db/models';
import { StandardCheckoutClient, Env } from 'pg-sdk-node';

export async function POST(req: Request) {
  return await handleCallback(req);
}

export async function GET(req: Request) {
  return await handleCallback(req);
}

async function handleCallback(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let txnId = searchParams.get('transactionId') || searchParams.get('txnId') || searchParams.get('merchantTransactionId');

    if (!txnId && req.method === 'POST') {
      try {
        const formData: any = await req.formData();
        const txid = typeof formData.get === 'function' ? formData.get('transactionId') : formData['transactionId'];
        if (txid) txnId = txid.toString();
      } catch (e) {
        console.error("Failed to parse POST body", e);
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;

    if (!txnId) {
      return NextResponse.redirect(new URL('/payment/failed?reason=missing_txn', baseUrl));
    }

    const payment = await Payment.findOne({ where: { transactionId: txnId } });
    if (!payment) {
      return NextResponse.redirect(new URL('/payment/failed?reason=not_found', baseUrl));
    }

    const merchantId = process.env.PHONEPE_MERCHANT_ID || process.env.PHONEPE_CLIENT_ID || 'PGTESTPAYUAT86';
    const saltKey = process.env.PHONEPE_SALT_KEY || process.env.PHONEPE_CLIENT_SECRET || '96434309-7796-489d-8924-ab56988a6076';
    const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
    const isProd = process.env.PHONEPE_ENV?.toUpperCase() === 'PRODUCTION';

    let isSuccess = false;

    // 1. Check with PhonePe Standard PG v1 Status API
    try {
      const host = isProd
        ? 'https://api.phonepe.com/apis/hermes'
        : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

      const path = `/pg/v1/status/${merchantId}/${txnId}`;
      const stringToHash = `${path}${saltKey}`;
      const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
      const xVerify = `${sha256}###${saltIndex}`;

      const statusRes = await fetch(`${host}${path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': merchantId,
          accept: 'application/json',
        },
      });

      const statusData = await statusRes.json();
      if (
        statusData?.code === 'PAYMENT_SUCCESS' ||
        statusData?.data?.state === 'COMPLETED' ||
        statusData?.data?.responseCode === 'SUCCESS'
      ) {
        isSuccess = true;
      }
    } catch (v1Err) {
      console.warn('PhonePe v1 status check error:', v1Err);
    }

    // 2. Fallback to pg-sdk-node if applicable
    if (!isSuccess) {
      try {
        const client = StandardCheckoutClient.getInstance(merchantId, saltKey, Number(saltIndex) || 1, isProd ? Env.PRODUCTION : Env.SANDBOX);
        const statusResponse = await client.getOrderStatus(txnId);
        isSuccess = statusResponse?.state === 'COMPLETED';
      } catch (sdkErr: any) {
        // Ignored if standard v1 was used
      }
    }

    if (isSuccess) {
      payment.status = 'SUCCESS';
      await payment.save();

      // Check if already enrolled
      const existing = await Enrollment.findOne({
        where: { userId: payment.userId, packageId: payment.packageId },
      });

      if (!existing) {
        await Enrollment.create({
          userId: payment.userId,
          packageId: payment.packageId,
        });
      }

      const isDemo = searchParams.get('demo') === 'true' || payment.transactionId.startsWith('DEMO_');
      const successUrl = isDemo
        ? `${baseUrl}/payment/success?demo=true&transactionId=${payment.transactionId}`
        : `${baseUrl}/payment/success?transactionId=${payment.transactionId}`;

      return NextResponse.redirect(new URL(successUrl, baseUrl));
    } else {
      payment.status = 'FAILED';
      await payment.save();
    }

    const isDemo = searchParams.get('demo') === 'true' || (payment && payment.transactionId.startsWith('DEMO_'));
    const failedUrl = isDemo
      ? `${baseUrl}/payment/failed?demo=true&reason=payment_declined`
      : `${baseUrl}/payment/failed`;

    return NextResponse.redirect(new URL(failedUrl, baseUrl));

  } catch (error) {
    console.error('Payment callback error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
    return NextResponse.redirect(new URL('/payment/failed?reason=error', baseUrl));
  }
}
