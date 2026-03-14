import bcrypt from 'bcrypt';

export class BcryptUtil {
  static async hash(password: string): Promise<string> {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    return bcrypt.hash(password, rounds);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
