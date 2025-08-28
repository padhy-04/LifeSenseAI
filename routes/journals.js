// routes/journals.js
import express from 'express';
import JournalEntry from '../models/JournalEntry.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc      Create a new journal entry
// @route     POST /api/journals
// @access    Private
router.post('/', protect, async (req, res) => {
  try {
    const { date, title, text, moodRating, tags } = req.body;

    const newJournalEntry = await JournalEntry.create({
      userId: req.user.id,
      date,
      title,
      text,
      moodRating,
      tags
    });

    // Optionally, trigger AI analysis in the background (e.g., via a BullMQ job)
    // Here we simulate for now:
    // await callAiService('/journal-nlp', req.user.id, { text: newJournalEntry.text, journalEntryId: newJournalEntry._id });

    res.status(201).json({ success: true, data: newJournalEntry });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc      Get journal entries for the authenticated user
// @route     GET /api/journals
// @access    Private
router.get('/', protect, async (req, res) => {
  try {
    const journalEntries = await JournalEntry.find({ userId: req.user.id }).sort({ date: -1 });
    res.status(200).json({ success: true, count: journalEntries.length, data: journalEntries });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc      Get a single journal entry by ID
// @route     GET /api/journals/:id
// @access    Private
router.get('/:id', protect, async (req, res) => {
  try {
    const journalEntry = await JournalEntry.findOne({ _id: req.params.id, userId: req.user.id });

    if (!journalEntry) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }

    res.status(200).json({ success: true, data: journalEntry });
  } catch (error) {
    console.error('Error fetching single journal entry:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid journal entry ID' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc      Update a journal entry
// @route     PUT /api/journals/:id
// @access    Private
router.put('/:id', protect, async (req, res) => {
  try {
    let journalEntry = await JournalEntry.findOne({ _id: req.params.id, userId: req.user.id });

    if (!journalEntry) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }

    journalEntry = await JournalEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({ success: true, data: journalEntry });
  } catch (error) {
    console.error('Error updating journal entry:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ success: false, message: messages });
    }
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid journal entry ID' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc      Delete a journal entry
// @route     DELETE /api/journals/:id
// @access    Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const journalEntry = await JournalEntry.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!journalEntry) {
      return res.status(404).json({ success: false, message: 'Journal entry not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ success: false, message: 'Invalid journal entry ID' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

export default router;
