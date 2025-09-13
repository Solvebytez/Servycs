import { Router } from 'express';
import { authenticate, requireAdmin } from '@/middleware/auth';

const router = Router();

// TODO: Implement admin routes
router.get('/dashboard', authenticate, requireAdmin, (req, res) => {
  res.json({ message: 'Admin dashboard route - to be implemented' });
});

export default router;
