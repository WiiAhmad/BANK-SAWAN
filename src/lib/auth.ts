import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  )
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { exp?: number }
    if (decoded && typeof decoded === 'object' && decoded.exp) {
      const now = Math.floor(Date.now() / 1000)
      if (decoded.exp < now) {
        return false
      }
    }
    return decoded
  } catch (error) {
    return null
  }
}

export function decryptToken(token: string): { userId: string; email: string; role: string ; name: String} | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; email: string; role: string, name: string }
    return decoded
  } catch (error) {
    console.error('Token decryption error:', error)
    return null
  }
}

export async function authenticateRequest(request: NextRequest) {
  const userToken = request.cookies.get('token')?.value;

  if (!userToken) {
    return { error: 'Authorization token is required', status: 401, user: null };
  }

  try {
    const user = decryptToken(userToken);
    if (!user || !user.userId) {
      return { error: 'Invalid or expired token', status: 401, user: null };
    }
    return { user, error: null, status: 200 };
  } catch (error) {
    return { error: 'Invalid token format', status: 401, user: null };
  }
}