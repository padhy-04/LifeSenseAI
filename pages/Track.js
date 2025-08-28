// pages/Track.js
import React, { useState, useEffect } from "react";
import { WellnessEntry } from "@/entities/WellnessEntry";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Heart, Zap, Moon, Plus, X, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const activityOptions = [
  "Exercise", "Meditation", "Work", "Socializing", "Reading", 
  "Cooking", "Walking", "Music", "Gaming", "Cleaning"
];

export default function Track() {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    mood: 3,
    energy: 3,
    sleep_hours: 8,
    activities: [],
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayEntry, setTodayEntry] = useState(null);
  const [aiTip, setAiTip] = useState("");
  const [isLoadingTip, setIsLoadingTip] = useState(false);

  useEffect(() => {
    checkTodayEntry();
  }, []);

  useEffect(() => {
    if (formData.mood !== 3 || formData.energy !== 3) {
      generateAITip();
    }
  }, [formData.mood, formData.energy, formData.sleep_hours]);

  const checkTodayEntry = async () => {
    try {
      const entries = await WellnessEntry.list('-date', 1);
      const today = format(new Date(), 'yyyy-MM-dd');
      const entry = entries.find(e => e.date === today);
      
      if (entry) {
        setTodayEntry(entry);
        setFormData(entry);
      }
    } catch (error) {
      console.error("Error checking today's entry:", error);
    }
  };

  const generateAITip = async () => {
    setIsLoadingTip(true);
    try {
      const prompt = `Based on this wellness data, provide a brief, personalized tip:
      Mood: ${formData.mood}/5
      Energy: ${formData.energy}/5
      Sleep: ${formData.sleep_hours} hours
      
      Give one specific, actionable tip to help improve their wellbeing today (max 50 words).`;

      const result = await InvokeLLM({ 
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            tip: { type: "string" }
          }
        }
      });
      
      setAiTip(result.tip);
    } catch (error) {
      console.error("Error generating tip:", error);
      setAiTip("Remember to take breaks and stay hydrated throughout your day!");
    }
    setIsLoadingTip(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (todayEntry) {
        await WellnessEntry.update(todayEntry.id, formData);
      } else {
        await WellnessEntry.create(formData);
      }
      setTodayEntry(formData);
    } catch (error) {
      console.error("Error saving entry:", error);
    }
    setIsSubmitting(false);
  };

  const addActivity = (activity) => {
    if (!formData.activities.includes(activity)) {
      setFormData({
        ...formData,
        activities: [...formData.activities, activity]
      });
    }
  };

  const removeActivity = (activity) => {
    setFormData({
      ...formData,
      activities: formData.activities.filter(a => a !== activity)
    });
  };

  const moodLabels = ['Very Low', 'Low', 'Okay', 'Good', 'Great'];
  const energyLabels = ['Drained', 'Tired', 'Okay', 'Energetic', 'Buzzing'];

  return (
    <div className="p-4 max-w-md mx-auto space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Daily Check-in</h2>
        <p className="text-gray-600">{format(new Date(), 'EEEE, MMMM do')}</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood Slider */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              How's your mood?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-3xl">
                  {['😢', '😕', '😐', '😊', '😄'][formData.mood - 1]}
                </span>
                <p className="text-lg font-medium mt-2">{moodLabels[formData.mood - 1]}</p>
              </div>
              <Slider
                value={[formData.mood]}
                onValueChange={(value) => setFormData({...formData, mood: value[0]})}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Energy Slider */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Energy Level?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-3xl">
                  {['🔋', '😴', '😐', '⚡', '🚀'][formData.energy - 1]}
                </span>
                <p className="text-lg font-medium mt-2">{energyLabels[formData.energy - 1]}</p>
              </div>
              <Slider
                value={[formData.energy]}
                onValueChange={(value) => setFormData({...formData, energy: value[0]})}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        {/* Sleep */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-purple-500" />
              Sleep Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={formData.sleep_hours}
              onChange={(e) => setFormData({...formData, sleep_hours: parseFloat(e.target.value)})}
              className="text-center text-lg"
            />
          </CardContent>
        </Card>

        {/* Activities */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Today's Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {activityOptions.map(activity => (
                  <Button
                    key={activity}
                    type="button"
                    variant={formData.activities.includes(activity) ? "default" : "outline"}
                    size="sm"
                    onClick={() => formData.activities.includes(activity) 
                      ? removeActivity(activity) 
                      : addActivity(activity)
                    }
                  >
                    {activity}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="How was your day? Any thoughts or feelings..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="min-h-20"
            />
          </CardContent>
        </Card>

        {/* AI Tip */}
        {(aiTip || isLoadingTip) && (
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Sparkles className="w-5 h-5" />
                AI Wellness Tip
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTip ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-blue-200 rounded w-full"></div>
                </div>
              ) : (
                <p className="text-blue-800">{aiTip}</p>
              )}
            </CardContent>
          </Card>
        )}

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : todayEntry ? "Update Entry" : "Save Entry"}
        </Button>
      </form>
    </div>
  );
}