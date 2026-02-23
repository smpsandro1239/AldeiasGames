import { db } from './db';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

// Chave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}

const SECRET = new TextEncoder().encode(JWT_SECRET || 'dev-secret-key-insecure-only-for-local-development');

export interface UserPayload {
  id: string;
  email: string;
  nome: string;
  role: string;
  aldeiaId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(payload: UserPayload): Promise<string> {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: Request): Promise<UserPayload | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  const token = authHeader.slice(7);
  return verifyToken(token);
}

export async function registerUser(nome: string, email: string, password: string, role: string = 'user', aldeiaId?: string) {
  const passwordHash = await hashPassword(password);
  
  const user = await db.user.create({
    data: {
      nome,
      email,
      passwordHash,
      role,
      aldeiaId,
    },
  });
  
  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email },
    include: { aldeia: true },
  });
  
  if (!user) return null;
  
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return null;
  
  return user;
}
