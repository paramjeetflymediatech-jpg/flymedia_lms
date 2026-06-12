import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { User } from '../db/models';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-lms-jwt-key-change-in-production'
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'STUDENT' | 'TUTOR';
  name: string | null;
}

export async function loginUser(user: { id: string; email: string; role: 'ADMIN' | 'STUDENT' | 'TUTOR'; name: string | null }) {
  const token = await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);

  // Set httpOnly cookie
  const cookieStore = await cookies();
  cookieStore.set('lms-session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  return token;
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('lms-session');
}

export async function getSessionPayload(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('lms-session')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSessionPayload();
  if (!session) return null;

  try {
    const user = await User.findByPk(session.userId, {
      attributes: ['id', 'email', 'name', 'role'],
    });
    return user;
  } catch (e) {
    return null;
  }
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/admin/login');
  }
  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  return user;
}

export async function requireTutor() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  if (user.role !== 'TUTOR') {
    redirect('/dashboard');
  }
  return user;
}
