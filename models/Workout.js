import mongoose from 'mongoose';

const ExerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add an exercise name'],
    trim: true,
    maxlength: [100, 'Exercise name cannot be more than 100 characters']
  },
  sets: {
    type: Number,
    min: [1, 'Sets must be at least 1']
  },
  reps: {
    type: Number,
    min: [1, 'Reps must be at least 1']
  },
  weight: { 
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  durationMinutes: { // For cardio or time-based exercises
    type: Number,
    min: [0, 'Duration cannot be negative']
  },
  distance: { // For cardio
    type: Number,
    min: [0, 'Distance cannot be negative']
  },
  intensity: { 
    type: String,
    maxlength: [50, 'Intensity description too long']
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot be more than 200 characters']
  }
});

const WorkoutSchema = new mongoose.Schema({
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
    maxlength: [150, 'Workout title cannot be more than 150 characters']
  },
  workoutType: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'hybrid', 'other'],
    required: [true, 'Please specify workout type']
  },
  durationMinutes: {
    type: Number,
    min: [1, 'Duration must be at least 1 minute']
  },
  caloriesBurned: { // Estimated calories burned
    type: Number,
    min: [0, 'Calories burned cannot be negative']
  },
  exercises: [ExerciseSchema], // Array of exercises performed
  postureAnalysisResult: { // Result from webcam-based posture tracking
    overallScore: { type: Number, min: 0, max: 100 },
    feedback: [String], // e.g., "Keep your back straighter during squats"
    videoRef: String 
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Workout = mongoose.model('Workout', WorkoutSchema);
export default Workout;
