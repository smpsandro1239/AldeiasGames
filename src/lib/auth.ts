import { db } from './db';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

// Chave secreta para JWT
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-placeholder-NUNCA-usar-em-producao-12345';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('CRITICAL: JWT_SECRET environment variable is missing in production!');
}

const SECRET = new TextEncoder().encode(JWT_SECRET);

export interface UserPayload {
  id: string;
  email: string;
  nome: string;
  role: string;
  aldeiaId?: string;
  orgId?: string;
}

// Export auth function for middleware
import { cookies } from 'next/headers';

export async function auth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');
  
  if (!token) {
    return null;
  }
  
  try {
    // Decode the base64 token
    const decoded = JSON.parse(Buffer.from(token.value, 'base64').toString('utf-8'));
    return {
      user: {
        id: decoded.id,
        email: decoded.email,
        nome: decoded.nome,
        role: decoded.role,
      }
    };
  } catch (e) {
    return null;
  }
}

// Auth options for NextAuth
export const authOptions = {
  providers: [],
  callbacks: {
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
      }
      return token;
    }
  },
  secret: JWT_SECRET,
};

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

/**
 * Obtém o utilizador autenticado a partir do request
 */
export async function getUserFromRequest(request: Request): Promise<UserPayload | null> {
  let token = null;

  // 1. Tentar Header Authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  // 2. Tentar Cookies se não houver Header
  if (!token) {
    const cookieHeader = request.headers.get('cookie');
    const cookies = Object.fromEntries(cookieHeader?.split('; ').map(c => c.split('=')) || []);
    token = cookies['auth-token'];
  }

  if (!token) return null;

  const payload = await verifyToken(token);
  if (payload) {
    // Normalizar role para lowercase para consistência nas verificações de API
    return {
      ...payload,
      role: payload.role.toLowerCase()
    };
  }
  return null;
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
