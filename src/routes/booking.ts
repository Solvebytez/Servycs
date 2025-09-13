import { Router } from 'express';
import { authenticate } from '@/middleware/auth';

const router = Router();

// TODO: Implement booking routes
router.get('/', authenticate, (req, res) => {
  res.json({ message: 'Bookings route - to be implemented' });
});

export default router;
