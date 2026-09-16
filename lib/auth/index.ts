import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const DEV_JWT_SECRET = 'goalbangla-dev-jwt-secret-key-32charsmin!';
const SECRET_KEY = process.env.JWT_SECRET || DEV_JWT_SECRET;

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === DEV_JWT_SECRET)) {
  throw new Error('FATAL: JWT_SECRET environment variable must be configured with a secure production secret.');
}

const key = new TextEncoder().encode(SECRET_KEY);

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  name: string;
  role: 'ADMIN' | 'SUB_ADMIN' | 'CONTRIBUTOR';
  displayTitle?: string;
  avatarUrl?: string;
  mustChangePassword?: boolean;
}

export async function signSessionToken(user: AuthUser): Promise<string> {
  return await new SignJWT({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
    displayTitle: user.displayTitle,
    avatarUrl: user.avatarUrl,
    mustChangePassword: user.mustChangePassword,
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
      username: payload.username as string | undefined,
      name: payload.name as string,
      role: payload.role as 'ADMIN' | 'SUB_ADMIN' | 'CONTRIBUTOR',
      displayTitle: payload.displayTitle as string | undefined,
      avatarUrl: payload.avatarUrl as string | undefined,
      mustChangePassword: Boolean(payload.mustChangePassword),
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

export function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function hashCode(code: string): Promise<string> {
  return await bcrypt.hash(code, 10);
}

export async function verifyCode(code: string, hashed: string): Promise<boolean> {
  return await bcrypt.compare(code, hashed);
}