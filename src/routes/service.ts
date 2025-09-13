import { Router } from 'express';
import { authenticate } from '@/middleware/auth';

const router = Router();

// TODO: Implement service routes
router.get('/', (req, res) => {
  res.json({ message: 'Services route - to be implemented' });
});

export default router;
