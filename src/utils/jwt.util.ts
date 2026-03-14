import jwt from 'jsonwebtoken';

export class JwtUtil {
  static generateToken(payload: object): string {
    const secret = process.env.JWT_SECRET || 'secret';
    const expire = process.env.JWT_EXPIRE || '7d';
    return jwt.sign(payload, secret, { expiresIn: expire as jwt.SignOptions['expiresIn'] });
  }

  static verifyToken(token: string): any {
    const secret = process.env.JWT_SECRET || 'secret';
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  }
}
