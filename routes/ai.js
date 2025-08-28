
// routes/ai.js
import express from 'express';
import { protect } from '../middleware/auth.js';
// In a real application, you would import models to fetch user-specific data
// for AI context, e.g., import User from '../models/User.js';
// And potentially other models like JournalEntry, MealEntry, etc.

const router = express.Router();

// Placeholder for your Python FastAPI AI service base URL
// IMPORTANT: Replace this with the actual URL of your deployed FastAPI service
const AI_SERVICE_BASE_URL = 'http://localhost:8000/api/v1/ai'; // Example URL

// Helper function to simulate/forward requests to the AI service
async function callAiService(endpoint, userId, payload = {}) {
  try {
    // In a real scenario, you'd send `userId` for personalization
    // and `payload` would contain specific data for the AI task (e.g., chat message, image data)
    const response = await fetch(`${AI_SERVICE_BASE_URL}${endpoint}`, {
      method: 'POST', // Most AI interactions will be POST
      headers: {
        'Content-Type': 'application/json',
        // Potentially include an API key or internal token for AI service authentication
        // 'X-API-Key': process.env.AI_SERVICE_API_KEY
      },
      body: JSON.stringify({ userId, ...payload }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`AI Service error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Failed to call AI service at ${endpoint}:`, error.message);
    throw new Error('Failed to communicate with AI service');
  }
}

// @desc      Send message to AI Coach
// @route     POST /api/ai/chat
// @access    Private
router.post('/chat', protect, async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  try {
    // Simulate/forward to AI Coach service
    const aiResponse = await callAiService('/coach-chat', req.user.id, { message });
    res.status(200).json({ success: true, data: aiResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc      Analyze meal photo (OCR)
// @route     POST /api/ai/meal-analyze
// @access    Private
router.post('/meal-analyze', protect, async (req, res) => {
  const { imageUrl, mealEntryId } = req.body; // imageUrl would be a pre-uploaded image URL
  if (!imageUrl || !mealEntryId) {
    return res.status(400).json({ success: false, message: 'Image URL and Meal Entry ID are required' });
  }

  try {
    // Simulate/forward to AI Meal OCR service
    const aiAnalysis = await callAiService('/meal-ocr', req.user.id, { imageUrl, mealEntryId });
    // You would typically update the MealEntry document in MongoDB with aiAnalysis
    // For example: await MealEntry.findByIdAndUpdate(mealEntryId, { aiAnalysisStatus: 'completed', aiAnalysisResult: aiAnalysis });
    res.status(200).json({ success: true, data: aiAnalysis, message: 'Meal analysis started/processed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc      Analyze journal entry (NLP)
// @route     POST /api/ai/journal-analyze
// @access    Private
router.post('/journal-analyze', protect, async (req, res) => {
  const { journalText, journalEntryId } = req.body;
  if (!journalText || !journalEntryId) {
    return res.status(400).json({ success: false, message: 'Journal text and Journal Entry ID are required' });
  }

  try {
    // Simulate/forward to AI NLP service
    const aiAnalysis = await callAiService('/journal-nlp', req.user.id, { text: journalText, journalEntryId });
    // You would typically update the JournalEntry document in MongoDB with aiAnalysis
    // For example: await JournalEntry.findByIdAndUpdate(journalEntryId, { sentimentAnalysis: aiAnalysis.sentiment, stressLevel: aiAnalysis.stress });
    res.status(200).json({ success: true, data: aiAnalysis, message: 'Journal analysis started/processed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc      Get personalized recommendations
// @route     GET /api/ai/recommendations
// @access    Private
router.get('/recommendations', protect, async (req, res) => {
  try {
    // Simulate/forward to AI Recommendation service
    const recommendations = await callAiService('/get-recommendations', req.user.id);
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc      Process webcam posture data
// @route     POST /api/ai/posture-analyze
// @access    Private
router.post('/posture-analyze', protect, async (req, res) => {
  const { postureData, workoutId } = req.body; // postureData would be processed data from frontend (not raw video)
  if (!postureData || !workoutId) {
    return res.status(400).json({ success: false, message: 'Posture data and Workout ID are required' });
  }

  try {
    // Simulate/forward to AI Pose Detection service
    const analysisResult = await callAiService('/pose-detection', req.user.id, { postureData, workoutId });
    // Update Workout document with posture analysis
    // await Workout.findByIdAndUpdate(workoutId, { postureAnalysisResult: analysisResult });
    res.status(200).json({ success: true, data: analysisResult, message: 'Posture analysis processed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


export default router;
