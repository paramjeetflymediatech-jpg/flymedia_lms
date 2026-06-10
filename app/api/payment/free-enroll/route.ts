import { NextResponse } from 'next/server';
import { requireAuth } from '../../../../src/lib/auth';
import { Package, Enrollment } from '../../../../src/db/models';

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

    if (pkg.price && Number(pkg.price) > 0) {
      return NextResponse.json({ error: 'This package is not free' }, { status: 400 });
    }

    const existing = await Enrollment.findOne({
      where: { userId: user.id, packageId: pkg.id }
    });

    if (!existing) {
      await Enrollment.create({
        userId: user.id,
        packageId: pkg.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Free enrollment error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
