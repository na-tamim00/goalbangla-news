import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.JWT_SECRET || 'goalbangla-dev-jwt-secret-key-32charsmin!';
const key = new TextEncoder().encode(SECRET_KEY);

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'EDITOR' | 'CONTRIBUTOR';
}

export async function signSessionToken(user: AuthUser): Promise<string> {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function verifySessionToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, key);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as 'ADMIN' | 'EDITOR' | 'CONTRIBUTOR',
    };
  } catch (err) {
    return null;
  }
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('goalbangla_session')?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function hashPassword(plain: string): Promise<string> {
  return await bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return await bcrypt.compare(plain, hashed);
}