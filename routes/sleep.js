// routes/sleep.js
import express from 'express';
import Sleep from '../models/Sleep.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc      Log a new sleep entry
// @route     POST /api/sleep
// @access    Private
router.post('/', protect, async (req, res) => {
  try {
    const { date, bedtime, wakeTime, sleepQuality, sleepStages, wakeUps, notes, focusRecommendation } = req.body;

    const newSleepEntry = await Sleep.create({
      userId: req.user.id,
      date,
      bedtime,
      wakeTime,
      sleepQuality,
      sleepStages,
      wakeUps,
      notes,
      focusRecommendation
    });

    res.status(201).json({ success: true, data: newSleepEntry });
  } catch (error) {
    console.error('Error logging sleep entry:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc      Get sleep entries for the authenticated user
// @route     GET /api/sleep
// @access    Private
router.get('/', protect, async (req, res) => {
  try {
    const sleepEntries = await Sleep.find({ userId: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, count: sleepEntries.length, data: sleepEntries });
  } catch (error) {
    console.error('Error fetching sleep entries:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc      Get a single sleep entry by ID
// @route     GET /api/sleep/:id
// @access    Private
router.get('/:id', protect, async (req, res) => {
  try {
    const sleepEntry = await Sleep.findOne({ _id: req.params.id, userId: req.user.id });

    if (!sleepEntry) {
      return res.status(404).json({ success: false, message: 'Sleep entry not found' });
    }

    res.status(200).json({ success: true, data: sleepEntry });
  } catch (error) {
    console.error('Error fetching single sleep entry:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid sleep entry ID' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc      Update a sleep entry
// @route     PUT /api/sleep/:id
// @access    Private
router.put('/:id', protect, async (req, res) => {
  try {
    let sleepEntry = await Sleep.findOne({ _id: req.params.id, userId: req.user.id });

    if (!sleepEntry) {
      return res.status(404).json({ success: false, message: 'Sleep entry not found' });
    }

    sleepEntry = await Sleep.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({ success: true, data: sleepEntry });
  } catch (error) {
    console.error('Error updating sleep entry:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages });
    }
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid sleep entry ID' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc      Delete a sleep entry
// @route     DELETE /api/sleep/:id
// @access    Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const sleepEntry = await Sleep.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!sleepEntry) {
      return res.status(404).json({ success: false, message: 'Sleep entry not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting sleep entry:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid sleep entry ID' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
