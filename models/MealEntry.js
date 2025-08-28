import mongoose from 'mongoose';

const MealItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a food item name'],
    trim: true,
    maxlength: [100, 'Food item name cannot be more than 100 characters']
  },
  quantity: {
    type: String, // e.g., "1 cup", "150g", "2 pieces"
    trim: true,
    maxlength: [50, 'Quantity cannot be more than 50 characters']
  },
  calories: {
    type: Number,
    min: [0, 'Calories cannot be negative']
  },
  macronutrients: { 
    protein: { type: Number, min: 0 },
    carbohydrates: { type: Number, min: 0 },
    fats: { type: Number, min: 0 }
  },
  micronutrients: { // Object for optional micronutrients
    fiber: { type: Number, min: 0 },
    sugar: { type: Number, min: 0 },
    sodium: { type: Number, min: 0 }
  }
});

const MealEntrySchema = new mongoose.Schema({
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
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'other'],
    required: [true, 'Please specify the meal type']
  },
  foods: [MealItemSchema], // Array of meal items
  totalCalories: {
    type: Number,
    min: [0, 'Total calories cannot be negative']
  },
  photoUrl: {
    type: String, // URL to the uploaded meal photo (e.g., in cloud storage)
    match: [/^https?:\/\/.*/, 'Please use a valid URL for the photo']
  },
  aiAnalysisStatus: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },
  aiAnalysisResult: { // Store the AI OCR result directly or a reference to it
    calories: { type: Number },
    macronutrients: {
      protein: { type: Number },
      carbohydrates: { type: Number },
      fats: { type: Number }
    },
    estimatedFoods: [String]
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

MealEntrySchema.pre('save', function(next) {
  if (this.foods && this.foods.length > 0) {
    this.totalCalories = this.foods.reduce((sum, item) => sum + (item.calories || 0), 0);
  }
  next();
});


const MealEntry = mongoose.model('MealEntry', MealEntrySchema);
export default MealEntry;
