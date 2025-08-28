// pages/MoodTracker.js
import React, { useState, useEffect } from "react";
import { MoodEntry } from "@/entities/MoodEntry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Smile, Frown, Meh, Heart, Calendar, Plus } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import MoodSelector from "../components/mood/MoodSelector";
import MoodHistory from "../components/mood/MoodHistory";
import MoodInsights from "../components/mood/MoodInsights";

export default function MoodTracker() {
  const [moodEntries, setMoodEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [formData, setFormData] = useState({
    mood_level: 5,
    energy_level: 5,
    sleep_hours: 8,
    notes: '',
    activities: [],
    gratitude: ''
  });

  useEffect(() => {
    loadMoodEntries();
  }, []);

  const loadMoodEntries = async () => {
    const entries = await MoodEntry.list('-date');
    setMoodEntries(entries);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await MoodEntry.create({
        ...formData,
        date: selectedDate
      });
      setShowForm(false);
      setFormData({
        mood_level: 5,
        energy_level: 5,
        sleep_hours: 8,
        notes: '',
        activities: [],
        gratitude: ''
      });
      loadMoodEntries();
    } catch (error) {
      console.error("Error saving mood entry:", error);
    }
  };

  const todayEntry = moodEntries.find(entry => entry.date === format(new Date(), 'yyyy-MM-dd'));

  return (
    <div className="p-6 md:p-8 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
              Mood Tracker
            </h1>
            <p className="text-slate-600">
              {format(new Date(), "EEEE, MMMM do")} • How are you feeling today?
            </p>
          </div>
          
          {!todayEntry && (
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Track Today's Mood
            </Button>
          )}
          
          {todayEntry && (
            <Card className="p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
              <div className="flex items-center gap-3">
                <Heart className="w-6 h-6" />
                <div>
                  <p className="font-semibold">Today's Mood: {todayEntry.mood_level}/10</p>
                  <p className="text-sm opacity-90">Already tracked for today!</p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -20, height: 0 }}
              className="mb-8"
            >
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-700">
                    <Smile className="w-6 h-6 text-blue-500" />
                    Track Your Mood
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-slate-700 font-medium mb-3 block">
                          Date
                        </Label>
                        <Input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="border-slate-200"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-slate-700 font-medium mb-3 block">
                          Sleep Hours
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          max="24"
                          step="0.5"
                          value={formData.sleep_hours}
                          onChange={(e) => setFormData({...formData, sleep_hours: parseFloat(e.target.value)})}
                          className="border-slate-200"
                        />
                      </div>
                    </div>

                    <MoodSelector
                      moodLevel={formData.mood_level}
                      energyLevel={formData.energy_level}
                      onMoodChange={(mood) => setFormData({...formData, mood_level: mood})}
                      onEnergyChange={(energy) => setFormData({...formData, energy_level: energy})}
                    />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-slate-700 font-medium mb-3 block">
                          Notes about your day
                        </Label>
                        <Textarea
                          placeholder="How was your day? Any specific events or feelings..."
                          value={formData.notes}
                          onChange={(e) => setFormData({...formData, notes: e.target.value})}
                          className="border-slate-200 h-24"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-slate-700 font-medium mb-3 block">
                          What are you grateful for today?
                        </Label>
                        <Textarea
                          placeholder="Three things I'm grateful for today..."
                          value={formData.gratitude}
                          onChange={(e) => setFormData({...formData, gratitude: e.target.value})}
                          className="border-slate-200 h-24"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      >
                        Save Entry
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <MoodHistory entries={moodEntries} />
          </div>
          <div>
            <MoodInsights entries={moodEntries} />
          </div>
        </div>
      </div>
    </div>
  );
}