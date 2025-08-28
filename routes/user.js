// routes/user.js
import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc      Get authenticated user's profile
// @route     GET /api/users/profile
// @access    Private
router.get('/profile', protect, (req, res) => {
  // req.user is set by the 'protect' middleware
  res.status(200).json({
    success: true,
    data: req.user
  });
});

// You can add more user-specific routes here, e.g., to update goals, preferences.
// router.put('/profile', protect, async (req, res) => { /* update logic */ });

export default router;
