import jwt from "jsonwebtoken"
import { TokenPayload } from "~/types"

const secret = process.env.JWT_SECRET as string

if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set")
  }

export function createToken(payload: TokenPayload, expiresIn: string | number = '1h'): string | null {
    try {
        return jwt.sign(payload, secret, { expiresIn })
    } catch (error) {
        console.error('Token creation failed:', error);
        return null;
    }
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, secret) as TokenPayload
  } catch (error) {
        console.error('Token verification failed:', error);
        return null;
  }
}
