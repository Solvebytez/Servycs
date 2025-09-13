import { Router } from 'express';
import { authenticate, requireVendor } from '@/middleware/auth';

const router = Router();

// TODO: Implement vendor routes
router.get('/dashboard', authenticate, requireVendor, (req, res) => {
  res.json({ message: 'Vendor dashboard route - to be implemented' });
});

export default router;
