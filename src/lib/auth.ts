import crypto from 'crypto';

const SALT_ROUNDS = 16;
const KEY_LENGTH = 64;
const ITERATIONS = 100000;
const DIGEST = 'sha512';

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_ROUNDS).toString('hex');
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':');
    if (!salt || !key) {
      resolve(false);
      return;
    }
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      resolve(derivedKey.toString('hex') === key);
    });
  });
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32
    ? process.env.AUTH_SECRET
    : 'careerpilot-placement-jwt-auth-secret-key-min-32-chars-prod';
  return new TextEncoder().encode(secret);
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function createToken(payload: JwtPayload): Promise<string> {
  const { SignJWT } = await import('jose');
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { jwtVerify } = await import('jose');
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}
