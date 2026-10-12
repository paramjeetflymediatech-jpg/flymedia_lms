import { SignJWT, jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-lms-jwt-key-change-in-production'
);

export async function createAuthToken(user: { id: string; email: string; role: string; name: string | null }) {
  return await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(SECRET_KEY);
}

export async function verifyAuthToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as {
      userId: string;
      email: string;
      role: 'ADMIN' | 'STUDENT' | 'TUTOR';
      name: string | null;
    };
  } catch (error) {
    return null;
  }
}

export async function getAuthUserFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  return await verifyAuthToken(token);
}
