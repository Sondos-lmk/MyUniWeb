import express from 'express';
import { 
  applyToLoyaltyProgram, 
  cancelLoyaltyProgram,
  getMyLoyaltyStatus
} from '../controllers/loyalityProgrameController.js';
import { requireAuth } from '../middleware/auth.js'; // Your auth middleware

const router = express.Router();

// All routes are protected and require a logged-in user
router.use(requireAuth);

// POST /api/loyalty/apply
// Apply to the program
router.post('/apply', applyToLoyaltyProgram);

// DELETE /api/loyalty/cancel
// Cancel participation
router.delete('/cancel', cancelLoyaltyProgram);

// GET /api/loyalty/status
// Get the vendor's current status
router.get('/status', getMyLoyaltyStatus);

export default router;