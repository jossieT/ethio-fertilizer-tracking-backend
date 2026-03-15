import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { UserModel } from '../models/user.model';
import { BcryptUtil } from '../utils/bcrypt.util';
import { JwtUtil } from '../utils/jwt.util';

export class AuthController {
  static registerValidators = [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Enter a valid email'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').notEmpty().withMessage('Role is required'),
  ];

  static async register(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, username, email, phoneNumber, password, role, regionId, zoneId, woredaId, kebeleId } = req.body;

    try {
      const existingUser = await UserModel.findByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      const passwordHash = await BcryptUtil.hash(password);
      
      const user = await UserModel.register({
        full_name: fullName,
        username,
        email,
        phone: phoneNumber,
        password_hash: passwordHash,
        role,
        region_id: regionId,
        zone_id: zoneId,
        woreda_id: woredaId,
        kebele_id: kebeleId
      });

      const { password_hash, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  static loginValidators = [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ];

  static async login(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const user = await UserModel.findByUsername(username);
      if (!user) {
        return res.status(401).json({ message: 'Invalid username or password' });
      }

      const isMatch = await BcryptUtil.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid username or password' });
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
