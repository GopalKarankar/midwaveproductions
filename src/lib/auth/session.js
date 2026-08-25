import { SignJWT, jwtVerify } from 'jose';

const ACCESS_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET || '');
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_TOKEN_SECRET || '');

if (!process.env.ACCESS_TOKEN_SECRET) {
  console.warn('[session.js] ACCESS_TOKEN_SECRET not set — access token signing/verification will fail');
}
if (!process.env.REFRESH_TOKEN_SECRET) {
  console.warn('[session.js] REFRESH_TOKEN_SECRET not set — refresh token signing/verification will fail');
}

export async function signAccessToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token) {
  try {
    const verified = await jwtVerify(token, ACCESS_SECRET);
    return verified.payload;
  } catch (error) {
    return null;
  }
}

export async function verifyRefreshToken(token) {
  try {
    const verified = await jwtVerify(token, REFRESH_SECRET);
    return verified.payload;
  } catch (error) {
    return null;
  }
}
