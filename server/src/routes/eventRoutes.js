import { Router } from 'express';
import {
  getMyRegisteredEvents,
  editBazaar,
  registerForEvent,
  createBazaar,
} from '../controllers/eventControllers.js';

const router = Router();

// [REQ 2] Get registered events for student/staff/professor
router.get('/my-events', getMyRegisteredEvents);

// [REQ 3] Edit bazaar (Events Officer)
router.put('/bazaar/:id', editBazaar);

// [REQ 4] Register for workshop/trip
router.post('/register', registerForEvent);

// [REQ 5] Create new bazaar
router.post('/bazaar', createBazaar);

export default router;
