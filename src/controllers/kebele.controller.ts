import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { KebeleModel } from '../models/kebele.model';
import { UserModel } from '../models/user.model';

export class KebeleController {
  static async getDashboard(req: AuthRequest, res: Response) {
    const kebeleId = req.user?.kebeleId;
    if (!kebeleId) {
      return res.status(400).json({ message: 'User is not assigned to a kebele' });
    }

    const season = (req.query.season as string) || '2017/18';

    try {
      const kebeleInfo = await UserModel.getKebeleInfo(kebeleId);
      const user = await UserModel.findById(req.user!.userId);
      const demandData = await KebeleModel.getDemandSummary(kebeleId, season);

      res.json({
        user: {
          fullName: user?.full_name,
          role: 'Development Agent (DA)',
          kebeleName: kebeleInfo?.kebele_name,
        },
        demandTable: demandData,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
