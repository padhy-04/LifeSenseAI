import mongoose from 'mongoose';

const SleepSchema = new mongoose.Schema({
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
  bedtime: { 
    type: Date,
    required: [true, 'Please provide bedtime']
  },
  wakeTime: { // Time user woke up
    type: Date,
    required: [true, 'Please provide wake time']
  },
  durationHours: { // Calculated or manually entered total sleep duration
    type: Number,
    min: [0, 'Sleep duration cannot be negative']
  },
  sleepQuality: { // User's self-reported sleep quality
    type: Number,
    min: [1, 'Sleep quality must be between 1 (poor) and 5 (excellent)'],
    max: [5, 'Sleep quality must be between 1 (poor) and 5 (excellent)']
  },
  sleepStages: { // Detailed breakdown from a tracker (optional)
    deepSleepMinutes: { type: Number, min: 0 },
    lightSleepMinutes: { type: Number, min: 0 },
    remSleepMinutes: { type: Number, min: 0 },
    awakeMinutes: { type: Number, min: 0 }
  },
  wakeUps: { // Number of times user woke up during the night
    type: Number,
    min: 0
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  focusRecommendation: { // AI generated focus blocks for the day (optional)
    type: [
      {
        startTime: String, 
        endTime: String,   
        activity: String   
      }
    ]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

SleepSchema.pre('save', function(next) {
  if (this.bedtime && this.wakeTime) {
    const durationMs = this.wakeTime.getTime() - this.bedtime.getTime();
    this.durationHours = durationMs / (1000 * 60 * 60);
    if (this.durationHours < 0) {
      this.durationHours += 24; // Add 24 hours if wake time is next day
    }
  }
  next();
});

const Sleep = mongoose.model('Sleep', SleepSchema);
export default Sleep;
