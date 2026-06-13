import { NextResponse } from 'next/server';
import { Payment, Enrollment, Package } from '../../../../src/db/models';
import { StandardCheckoutClient, Env } from 'pg-sdk-node';

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
      return NextResponse.redirect(new URL('/payment/failed?reason=missing_txn', baseUrl));
    }

    const payment = await Payment.findOne({ where: { transactionId: txnId } });
    if (!payment) {
      return NextResponse.redirect(new URL('/payment/failed?reason=not_found', baseUrl));
    }

    // Initialize PhonePe Verification
    const clientId = process.env.PHONEPE_CLIENT_ID || 'PGTESTPAYUAT86';
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET || '96434309-7796-489d-8924-ab56988a6076';
    const clientVersion = Number(process.env.PHONEPE_SALT_INDEX) || 1;
    const isProd = process.env.PHONEPE_ENV?.toUpperCase() === 'PRODUCTION';

    const client = StandardCheckoutClient.getInstance(clientId, clientSecret, clientVersion, isProd ? Env.PRODUCTION : Env.SANDBOX);

    const statusResponse = await client.getOrderStatus(txnId);

    const isSuccess = statusResponse?.state === 'COMPLETED';

    if (isSuccess) {
      payment.status = 'SUCCESS';
      await payment.save();

      // Check if already enrolled
      const existing = await Enrollment.findOne({
        where: { userId: payment.userId, packageId: payment.packageId }
      });

      if (!existing) {
        await Enrollment.create({
          userId: payment.userId,
          packageId: payment.packageId,
        });
      }

      return NextResponse.redirect(new URL('/payment/success', baseUrl));
    } else {
      payment.status = 'FAILED';
      await payment.save();
    }

    return NextResponse.redirect(new URL('/payment/failed', baseUrl));

  } catch (error) {
    console.error('Payment callback error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
    return NextResponse.redirect(new URL('/payment/failed?reason=error', baseUrl));
  }
}
