import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import kebeleRoutes from './routes/kebele.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/kebele', kebeleRoutes);

// Root route
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ message: 'Ethiopian Fertilizer Tracking API is running' });
});

// Error handling
app.use(errorHandler);

export default app;
