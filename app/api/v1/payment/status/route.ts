import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../src/lib/auth';
import { getAuthUserFromRequest } from '../../auth/jwt';
import { Payment, Enrollment } from '../../../../src/db/models';
import { StandardCheckoutClient, Env } from 'pg-sdk-node';

export async function POST(req: Request) {
  try {
    let userId: string | null = null;
    const authUser = await getAuthUserFromRequest(req);
    if (authUser) {
      userId = authUser.userId;
    } else {
      const user = await getCurrentUser();
      if (user) userId = (user as any).id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const transactionId = body.transactionId;
    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const payment = await Payment.findOne({ where: { transactionId } });
    if (!payment) {
      return NextResponse.json({
        success: false,
        status: 'NOT_FOUND',
        message: 'Payment record not found',
      });
    }

    // Check if already enrolled or payment is SUCCESS
    if (payment.status === 'SUCCESS') {
      const existing = await Enrollment.findOne({
        where: { userId: payment.userId, packageId: payment.packageId },
      });
      if (!existing) {
        await Enrollment.create({
          userId: payment.userId,
          packageId: payment.packageId,
          enrolledAt: new Date(),
        });
      }
      return NextResponse.json({
        success: true,
        status: 'COMPLETED',
        transactionId,
      });
    }

    // Check PhonePe Order Status from gateway
    const clientId = process.env.PHONEPE_CLIENT_ID || 'PGTESTPAYUAT86';
    const clientSecret = process.env.PHONEPE_CLIENT_SECRET || '96434309-7796-489d-8924-ab56988a6076';
    const clientVersion = Number(process.env.PHONEPE_SALT_INDEX) || 1;
    const isProd = process.env.PHONEPE_ENV?.toUpperCase() === 'PRODUCTION';

    let isSuccess = false;
    let gatewayState = 'PENDING';

    try {
      const client = StandardCheckoutClient.getInstance(
        clientId,
        clientSecret,
        clientVersion,
        isProd ? Env.PRODUCTION : Env.SANDBOX
      );
      const statusResponse = await client.getOrderStatus(transactionId);
      gatewayState = statusResponse?.state || 'PENDING';
      isSuccess = gatewayState === 'COMPLETED';
    } catch (sdkErr: any) {
      console.warn('PhonePe getOrderStatus check failed:', sdkErr?.message || sdkErr);
    }

    if (isSuccess) {
      payment.status = 'SUCCESS';
      await payment.save();

      const existing = await Enrollment.findOne({
        where: { userId: payment.userId, packageId: payment.packageId },
      });
      if (!existing) {
        await Enrollment.create({
          userId: payment.userId,
          packageId: payment.packageId,
          enrolledAt: new Date(),
        });
      }

      return NextResponse.json({
        success: true,
        status: 'COMPLETED',
        transactionId,
      });
    }

    // If not completed or was cancelled/failed
    return NextResponse.json({
      success: false,
      status: gatewayState,
      message: 'Payment was not completed or was cancelled.',
    });
  } catch (error: any) {
    console.error('Error verifying payment status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
