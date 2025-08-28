// models/JournalEntry.js
import mongoose from 'mongoose';

const JournalEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  title: {
    type: String,
    trim: true,
    maxlength: [150, 'Title cannot be more than 150 characters']
  },
  text: {
    type: String,
    required: [true, 'Journal entry cannot be empty']
  },
  moodRating: { // User's self-reported mood on a scale
    type: Number,
    min: [1, 'Mood rating must be between 1 (very bad) and 5 (very good)'],
    max: [5, 'Mood rating must be between 1 (very bad) and 5 (very good)']
  },
  sentimentAnalysis: { // Result from NLP service
    overallSentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'mixed']
    },
    sentimentScore: { // e.g., from -1 to 1
      type: Number
    },
    keywords: [String], // Important keywords extracted
    topics: [String]    // Main topics identified
  },
  stressLevel: { // AI inferred stress level
    type: Number,
    min: 0,
    max: 100
  },
  burnoutRisk: { // AI inferred burnout risk
    type: Number,
    min: 0,
    max: 100
  },
  tags: [String], // User-defined tags for entries
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update `updatedAt` field on every save
JournalEntrySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const JournalEntry = mongoose.model('JournalEntry', JournalEntrySchema);
export default JournalEntry;
