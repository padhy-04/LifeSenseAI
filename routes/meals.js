// routes/meals.js
import express from 'express';
import MealEntry from '../models/MealEntry.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc      Log a new meal entry
// @route     POST /api/meals
// @access    Private
router.post('/', protect, async (req, res) => {
  try {
    const { date, mealType, foods, photoUrl, notes } = req.body;

    const newMealEntry = await MealEntry.create({
      userId: req.user.id,
      date,
      mealType,
      foods,
      photoUrl, // This URL would be generated after a frontend upload to cloud storage
      notes
      // aiAnalysisStatus will default to 'pending'
    });

    // Optionally, trigger AI analysis in the background (e.g., via a BullMQ job)
    // if (photoUrl) {
    //   await callAiService('/meal-ocr', req.user.id, { imageUrl: photoUrl, mealEntryId: newMealEntry._id });
    // }

    res.status(201).json({ success: true, data: newMealEntry });
  } catch (error) {
    console.error('Error logging meal entry:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc      Get meal entries for the authenticated user
// @route     GET /api/meals
// @access    Private
router.get('/', protect, async (req, res) => {
  try {
    const meals = await MealEntry.find({ userId: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, count: meals.length, data: meals });
  } catch (error) {
    console.error('Error fetching meal entries:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc      Get a single meal entry by ID
// @route     GET /api/meals/:id
// @access    Private
router.get('/:id', protect, async (req, res) => {
  try {
    const mealEntry = await MealEntry.findOne({ _id: req.params.id, userId: req.user.id });

    if (!mealEntry) {
      return res.status(404).json({ success: false, message: 'Meal entry not found' });
    }

    res.status(200).json({ success: true, data: mealEntry });
  } catch (error) {
    console.error('Error fetching single meal entry:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid meal entry ID' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc      Update a meal entry
// @route     PUT /api/meals/:id
// @access    Private
router.put('/:id', protect, async (req, res) => {
  try {
    let mealEntry = await MealEntry.findOne({ _id: req.params.id, userId: req.user.id });

    if (!mealEntry) {
      return res.status(404).json({ success: false, message: 'Meal entry not found' });
    }

    mealEntry = await MealEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({ success: true, data: mealEntry });
  } catch (error) {
    console.error('Error updating meal entry:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages });
    }
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid meal entry ID' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc      Delete a meal entry
// @route     DELETE /api/meals/:id
// @access    Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const mealEntry = await MealEntry.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!mealEntry) {
      return res.status(404).json({ success: false, message: 'Meal entry not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting meal entry:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid meal entry ID' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
