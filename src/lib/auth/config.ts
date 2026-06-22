import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(process.env["JWT_SECRET"] ?? "fallback-secret-change-me");
const SALT_ROUNDS = 12;

export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  role: "owner" | "dokter" | "staff" | "customer";
}

export const auth = {
  hashPassword: async (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS);
  },

  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
  },

  createSession: async (payload: Omit<SessionPayload, "iat" | "exp">): Promise<string> => {
    return new SignJWT({ ...payload } as unknown as JWTPayload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);
  },

  verifySession: async (token: string): Promise<SessionPayload | null> => {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return payload as unknown as SessionPayload;
    } catch {
      return null;
    }
  },
};