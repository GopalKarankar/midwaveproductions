import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.SESSION_JWT_SECRET || '');

if (!process.env.SESSION_JWT_SECRET) {
  console.warn('[session.js] SESSION_JWT_SECRET not set — JWT signing/verification will fail');
}

export async function signSessionToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifySessionToken(token) {
  try {
    const verified = await jwtVerify(token, SECRET);
    return verified.payload;
  } catch (error) {
    return null;
  }
}
