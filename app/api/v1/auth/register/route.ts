import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { User } from '../../../../../src/db/models';
import { createAuthToken } from '../jwt';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Account with this email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'STUDENT',
    });

    const token = await createAuthToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error: any) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
