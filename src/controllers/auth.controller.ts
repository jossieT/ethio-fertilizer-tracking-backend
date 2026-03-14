import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/user.model';
import { BcryptUtil } from '../utils/bcrypt.util';
import { JwtUtil } from '../utils/jwt.util';

export class AuthController {
  static loginValidators = [
    body('phone').isMobilePhone('any').withMessage('Enter a valid phone number'),
    body('password').notEmpty().withMessage('Password is required'),
  ];

  static async login(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, password } = req.body;

    try {
      const user = await UserModel.findByPhone(phone);
      if (!user) {
        return res.status(401).json({ message: 'Invalid phone or password' });
      }

      const isMatch = await BcryptUtil.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid phone or password' });
      }

      const token = JwtUtil.generateToken({
        userId: user.user_id,
        role: user.role,
        kebeleId: user.kebele_id
      });

      const { password_hash, ...userWithoutPassword } = user;

      res.json({
        token,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
