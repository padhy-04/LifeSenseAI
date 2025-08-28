// pages/FitnessPlanner.js
import React, { useState, useEffect } from "react";
import { FitnessPlan, HealthMetrics } from "@/entities/all";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dumbbell, 
  Target, 
  Calendar, 
  CheckCircle, 
  TrendingUp,
  Sparkles,
  Clock,
  Award
} from "lucide-react";
import { motion } from "framer-motion";

const fitnessGoals = [
  "Weight Loss", "Muscle Gain", "Endurance", "Strength", "Flexibility", "General Health"
];

const equipmentOptions = [
  "No Equipment", "Dumbbells", "Resistance Bands", "Yoga Mat", "Pull-up Bar", "Gym Access"
];

export default function FitnessPlanner() {
  const [step, setStep] = useState('profile'); // profile, generating, plan
  const [userProfile, setUserProfile] = useState({
    age: 25,
    height: 170,
    weight: 70,
    fitness_level: 'beginner',
    goals: [],
    available_time: 30,
    equipment: []
  });
  const [currentPlan, setCurrentPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completedWorkouts, setCompletedWorkouts] = useState([]);

  useEffect(() => {
    loadCurrentPlan();
  }, []);

  const loadCurrentPlan = async () => {
    try {
      const plans = await FitnessPlan.list('-created_date', 1);
      if (plans.length > 0 && plans[0].is_active) {
        setCurrentPlan(plans[0]);
        setStep('plan');
      }
    } catch (error) {
      console.error("Error loading plan:", error);
    }
  };

  const generatePlan = async () => {
    setIsGenerating(true);
    try {
      const bmi = userProfile.weight / ((userProfile.height / 100) ** 2);
      
      const prompt = `Create a personalized fitness and diet plan for:

Profile:
- Age: ${userProfile.age}
- Height: ${userProfile.height}cm
- Weight: ${userProfile.weight}kg
- BMI: ${bmi.toFixed(1)}
- Fitness Level: ${userProfile.fitness_level}
- Goals: ${userProfile.goals.join(', ')}
- Available Time: ${userProfile.available_time} minutes/day
- Equipment: ${userProfile.equipment.join(', ')}

Create a 7-day plan with:
1. Daily workout routines (exercises, sets, reps)
2. Indian diet plan with calorie targets
3. Rest days and recovery
4. Progressive overload considerations

Focus on realistic, achievable goals for ${userProfile.fitness_level} level.`;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            workout_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  type: { type: "string" },
                  exercises: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        sets: { type: "number" },
                        reps: { type: "string" },
                        rest: { type: "string" },
                        notes: { type: "string" }
                      }
                    }
                  }
                }
              }
            },
            diet_plan: {
              type: "object",
              properties: {
                daily_calories: { type: "number" },
                protein_target: { type: "number" },
                meals: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      meal_time: { type: "string" },
                      foods: { type: "array", items: { type: "string" } },
                      calories: { type: "number" }
                    }
                  }
                }
              }
            },
            tips: { type: "string" }
          }
        }
      });

      const plan = await FitnessPlan.create({
        plan_name: `${userProfile.goals[0] || 'Custom'} Plan - Week 1`,
        user_profile: userProfile,
        workout_plan: result.workout_plan,
        diet_plan: result.diet_plan,
        adherence_score: 0,
        week_number: 1
      });

      setCurrentPlan(plan);
      setStep('plan');
    } catch (error) {
      console.error("Error generating plan:", error);
    }
    setIsGenerating(false);
  };

  const markWorkoutComplete = async (dayIndex) => {
    const newCompleted = [...completedWorkouts, dayIndex];
    setCompletedWorkouts(newCompleted);
    
    // Update adherence score
    const adherenceScore = (newCompleted.length / 7) * 100;
    await FitnessPlan.update(currentPlan.id, {
      adherence_score: adherenceScore
    });
    
    setCurrentPlan(prev => ({
      ...prev,
      adherence_score: adherenceScore
    }));
  };

  const ProfileForm = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Tell us about yourself
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Age</Label>
              <Input
                type="number"
                value={userProfile.age}
                onChange={(e) => setUserProfile({...userProfile, age: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label>Height (cm)</Label>
              <Input
                type="number"
                value={userProfile.height}
                onChange={(e) => setUserProfile({...userProfile, height: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Weight (kg)</Label>
              <Input
                type="number"
                value={userProfile.weight}
                onChange={(e) => setUserProfile({...userProfile, weight: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label>Time Available (minutes)</Label>
              <Input
                type="number"
                value={userProfile.available_time}
                onChange={(e) => setUserProfile({...userProfile, available_time: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <Label>Fitness Level</Label>
            <Select
              value={userProfile.fitness_level}
              onValueChange={(value) => setUserProfile({...userProfile, fitness_level: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-3 block">Goals</Label>
            <div className="grid grid-cols-2 gap-2">
              {fitnessGoals.map(goal => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox
                    checked={userProfile.goals.includes(goal)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setUserProfile({...userProfile, goals: [...userProfile.goals, goal]});
                      } else {
                        setUserProfile({...userProfile, goals: userProfile.goals.filter(g => g !== goal)});
                      }
                    }}
                  />
                  <span className="text-sm">{goal}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Available Equipment</Label>
            <div className="grid grid-cols-2 gap-2">
              {equipmentOptions.map(equipment => (
                <div key={equipment} className="flex items-center space-x-2">
                  <Checkbox
                    checked={userProfile.equipment.includes(equipment)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setUserProfile({...userProfile, equipment: [...userProfile.equipment, equipment]});
                      } else {
                        setUserProfile({...userProfile, equipment: userProfile.equipment.filter(e => e !== equipment)});
                      }
                    }}
                  />
                  <span className="text-sm">{equipment}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={generatePlan} 
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        disabled={userProfile.goals.length === 0}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        Generate My AI Fitness Plan
      </Button>
    </motion.div>
  );

  const GeneratingPlan = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <Sparkles className="w-8 h-8 text-white animate-pulse" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Creating Your Plan</h3>
      <p className="text-gray-600">AI is analyzing your profile and generating a personalized fitness plan...</p>
      <div className="mt-6">
        <Progress value={66} className="w-64 mx-auto" />
      </div>
    </motion.div>
  );

  const PlanDisplay = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Plan Header */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-2">{currentPlan?.plan_name}</h2>
              <p className="opacity-90">Week {currentPlan?.week_number} • Personalized for you</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{Math.round(currentPlan?.adherence_score || 0)}%</div>
              <div className="text-sm opacity-90">Adherence</div>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress 
              value={currentPlan?.adherence_score || 0} 
              className="bg-white/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Workout Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-orange-500" />
            Workout Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {currentPlan?.workout_plan?.map((day, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="font-semibold">{day.day}</h4>
                    <p className="text-sm text-gray-600">{day.type || 'Workout'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {completedWorkouts.includes(index) ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => markWorkoutComplete(index)}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {day.exercises?.map((exercise, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <span className="font-medium">{exercise.name}</span>
                        {exercise.notes && (
                          <p className="text-xs text-gray-600">{exercise.notes}</p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <div>{exercise.sets} sets × {exercise.reps}</div>
                        <div className="text-gray-500">{exercise.rest} rest</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Diet Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-500" />
            Diet Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {currentPlan?.diet_plan?.daily_calories}
              </div>
              <div className="text-sm text-gray-600">Daily Calories</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {currentPlan?.diet_plan?.protein_target}g
              </div>
              <div className="text-sm text-gray-600">Protein Target</div>
            </div>
          </div>
          
          <div className="space-y-3">
            {currentPlan?.diet_plan?.meals?.map((meal, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold">{meal.meal_time}</h4>
                  <Badge variant="outline">{meal.calories} cal</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {meal.foods?.map((food, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {food}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={() => setStep('profile')} 
        variant="outline" 
        className="w-full"
      >
        Create New Plan
      </Button>
    </motion.div>
  );

  if (isGenerating) return <div className="p-4 max-w-md mx-auto"><GeneratingPlan /></div>;

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="text-center py-4 mb-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Dumbbell className="w-8 h-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">AI Fitness Planner</h1>
        </div>
        <p className="text-gray-600">Get personalized workouts & meal plans</p>
      </div>

      {step === 'profile' && <ProfileForm />}
      {step === 'plan' && currentPlan && <PlanDisplay />}
    </div>
  );
}