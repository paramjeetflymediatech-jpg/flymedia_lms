import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '../../../../src/lib/auth';
import { getAuthUserFromRequest } from '../../v1/auth/jwt';
import { Package, Payment, User, Inquiry } from '../../../../src/db/models';
import { StandardCheckoutClient, StandardCheckoutPayRequest, Env } from 'pg-sdk-node';
import { sendMail, getAdminReceivers } from '../../../../src/lib/mailer';
import { Op } from 'sequelize';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, course = 'General Inquiry', mode = 'HYBRID' } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Full name is required' }, { status: 400 });
    }

    const cleanPhone = String(phone || '').replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return NextResponse.json({ success: false, error: 'Valid 10-digit mobile number is required' }, { status: 400 });
    }

    const cleanEmail = email && typeof email === 'string' && email.includes('@')
      ? email.trim()
      : `${cleanPhone.slice(-10)}@student.flymedia.com`;

    // 1. Resolve or Provision User
    let userId: string | null = null;
    const authUser = await getAuthUserFromRequest(req);
    if (authUser && authUser.userId) {
      userId = authUser.userId;
    } else {
      const sessionUser = await getCurrentUser();
      if (sessionUser && sessionUser.id) {
        userId = sessionUser.id;
      }
    }

    let targetUser: User | null = null;
    if (userId) {
      targetUser = await User.findByPk(userId);
    }

    if (!targetUser) {
      targetUser = await User.findOne({
        where: {
          [Op.or]: [{ phone: cleanPhone }, { email: cleanEmail }],
        },
      });
    }

    if (!targetUser) {
      const defaultPassword = await bcrypt.hash(cleanPhone, 10);
      targetUser = await User.create({
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        role: 'STUDENT',
        passwordHash: defaultPassword,
      });
    }

    // 2. Resolve or Provision Demo Package (₹99)
    let targetPackage = await Package.findOne({
      where: {
        [Op.or]: [
          { slug: 'demo-class-booking' },
          { title: { [Op.like]: '%Demo Class%' } },
        ],
      },
    });

    if (!targetPackage) {
      // Look for course-specific package or create dedicated Demo Package
      const courseMatch = await Package.findOne({
        where: { title: { [Op.like]: `%${String(course).trim()}%` } },
      });

      if (courseMatch) {
        targetPackage = courseMatch;
      } else {
        targetPackage = await Package.create({
          title: '1-on-1 Live Demo Class (₹99)',
          slug: 'demo-class-booking',
          description: '<p>Interactive 1-on-1 demo session with senior industry mentor. ₹99 fee is 100% credited on full program enrollment.</p>',
          category: 'demo',
          price: 99,
          status: 'PUBLISHED',
          mode: 'BOTH',
          level: 'Beginner-friendly',
          whatYoullLearn: [
            'Hands-on live project coding',
            '1-on-1 Senior Industry Mentor Guidance',
            'Syllabus & Career Roadmap Review',
          ],
          techStack: ['Live Mentorship'],
          courseModules: [],
        });
      }
    }

    // 3. Register Inquiry in Database so lead is never lost
    const inquiryMessage = `[₹99 Demo Class Booking] Program: ${course} | Mode: ${mode} | Name: ${name.trim()} | Phone: ${cleanPhone}`;
    const inquiry = await Inquiry.create({
      name: name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      message: inquiryMessage,
      status: 'NEW',
    });

    // Notify administrators asynchronously
    const adminReceivers = getAdminReceivers();
    if (adminReceivers.length > 0) {
      sendMail({
        to: adminReceivers,
        subject: `⚡ ₹99 Demo Class Booking Initiated: ${name.trim()}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.5;">
            <div style="background: linear-gradient(135deg, #E60870, #F8750E); padding: 20px; border-radius: 12px 12px 0 0; color: white;">
              <h2 style="margin: 0; font-size: 20px;">⚡ New Demo Class Booking (₹99)</h2>
              <p style="margin: 4px 0 0; opacity: 0.9; font-size: 13px;">Student redirected to PhonePe Gateway</p>
            </div>
            <div style="background: #ffffff; padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
              <p><strong>Student Name:</strong> ${name.trim()}</p>
              <p><strong>Mobile Number:</strong> ${cleanPhone}</p>
              <p><strong>Email:</strong> ${cleanEmail}</p>
              <p><strong>Selected Program:</strong> ${course}</p>
              <p><strong>Learning Mode:</strong> ${mode}</p>
              <p><strong>Demo Fee:</strong> ₹99.00</p>
            </div>
          </div>
        `,
      }).catch((e: any) => console.error('Failed to send admin demo booking email:', e));
    }

    // 4. Create Payment Record (Amount = ₹99)
    const transactionId = `DEMO_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const payment = await Payment.create({
      userId: targetUser.id,
      packageId: targetPackage.id,
      amount: 99,
      transactionId,
      status: 'PENDING',
      provider: 'PHONEPE',
    });

    // 5. Connect to PhonePe Gateway
    const merchantId = process.env.PHONEPE_MERCHANT_ID || process.env.PHONEPE_CLIENT_ID || 'PGTESTPAYUAT86';
    const saltKey = process.env.PHONEPE_SALT_KEY || process.env.PHONEPE_CLIENT_SECRET || '96434309-7796-489d-8924-ab56988a6076';
    const saltIndex = process.env.PHONEPE_SALT_INDEX || '1';
    const isProd = process.env.PHONEPE_ENV?.toUpperCase() === 'PRODUCTION';

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const callbackRedirectUrl = `${baseUrl}/api/payment/callback?transactionId=${transactionId}&demo=true`;

    let redirectUrl: string | null = null;

    // First Attempt: Official PhonePe Standard PG v1 API
    try {
      const host = isProd
        ? 'https://api.phonepe.com/apis/hermes'
        : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

      const payload = {
        merchantId,
        merchantTransactionId: transactionId,
        merchantUserId: `MUID_${targetUser.id.replace(/-/g, '').slice(0, 20)}`,
        amount: 9900, // 99 INR * 100 paise
        redirectUrl: callbackRedirectUrl,
        redirectMode: 'POST',
        callbackUrl: callbackRedirectUrl,
        mobileNumber: cleanPhone.slice(-10),
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
        console.warn('PhonePe v1 pay returned non-success for demo:', data);
      }
    } catch (v1Err) {
      console.warn('PhonePe v1 API error for demo class:', v1Err);
    }

    // Second Attempt: pg-sdk-node fallback
    if (!redirectUrl) {
      try {
        const client = StandardCheckoutClient.getInstance(merchantId, saltKey, Number(saltIndex) || 1, isProd ? Env.PRODUCTION : Env.SANDBOX);
        const request = StandardCheckoutPayRequest.builder()
          .merchantOrderId(transactionId)
          .amount(9900)
          .redirectUrl(callbackRedirectUrl)
          .build();

        const response = await client.pay(request);
        if (response && response.redirectUrl) {
          redirectUrl = response.redirectUrl;
        }
      } catch (sdkError: any) {
        console.warn('PhonePe pg-sdk-node error for demo class:', sdkError?.message || sdkError);
      }
    }

    if (redirectUrl) {
      return NextResponse.json({
        success: true,
        redirectUrl,
        transactionId,
        paymentId: payment.id,
        inquiryId: inquiry.id,
        message: 'Redirecting to PhonePe gateway...',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Could not connect to PhonePe gateway. Please try again or contact counselor.' },
      { status: 502 }
    );
  } catch (error: any) {
    console.error('Error during demo class payment initiation:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Demo class payment initiation failed' },
      { status: 500 }
    );
  }
}
