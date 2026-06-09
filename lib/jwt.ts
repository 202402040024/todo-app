import jwt from 'jsonwebtoken';

type TokenPayload = {
  userId: string;
  [key: string]: unknown;
};

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d';

if (!JWT_SECRET) {
  throw new Error('Please define JWT_SECRET in .env.local');
}

const SECRET = JWT_SECRET;

/**
 * Sign a JWT token with the given payload
 * @param {Object} payload - Data to encode in the token
 * @returns {string} Signed JWT token
 */
export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {TokenPayload} Decoded payload
 */
export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, SECRET);
  if (!decoded || typeof decoded !== 'object') {
    throw new Error('Invalid token');
  }
  return decoded as TokenPayload;
}

/**
 * Decode a JWT token without verifying (for reading expiry etc.)
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded payload or null
 */
export function decodeToken(token: string) {
  return jwt.decode(token) as TokenPayload | null;
}
